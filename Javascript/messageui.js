/*
Message UI Javascript for the AdSortium.com system component's Messaging Interface
*/
/* Website root  */
var rootPath='';
/*
Function startUI
This function initializes the main UI elements with their needed event listeners and styling.
*/
function startUI(path){
    rootPath=path;
	$$('.msg-folders-folder').each( function(el){
		el.addEvent('click', function(){
			$$('.msg-folders-folder').each(function(e){
				if(e.id!='trash'){e.getElement('img').src=rootPath+'components/com_adsortium/images/closed-folder.png';}
				e.setStyle('background-color','transparent');
			}); 
			if(el.id!='trash'){el.getElement('img').src=rootPath+'components/com_adsortium/images/open-folder.png';} 
			el.setStyle('background-color', '#FFF7D8'); 
			loadFolderList(el.id); 
			clearMessage();
		});
 	});
	$$('.msg-toolbar-button').each(function(el){
			el.addEvents({'click':function(){handleInterface(el.id);},
						  'mouseenter':function(){el.setStyle('background-color', '#FFF7D8');},
						  'mouseleave':function(){el.setStyle('background-color', 'transparent');}
			});
	});
	$('compose-close-button').addEvent('click', function(el){$('compose-message').toggle();});
	$('addr-close-button').addEvent('click', function(el){$('address-book').toggle();});
	$$('.address-book-list-item').each(function(el){
			el.addEvents({'click':function(){handleInterface(el.id);},
	 					'mouseenter':function(){el.setStyle('background-color', '#FFF7D8');},
						'mouseleave':function(){el.setStyle('background-color', 'transparent');}
			});
	});
    $('selectedContact').setStyle('cursor', 'pointer');
    $('selectedContact').addEvent('click', function(el){$('address-book').toggle();});
    updateMsgCount();
}

/*
Function updateMsgCount
This function updates the message counts in the interface
*/
function updateMsgCount(){
   var request = new Request.JSON({
       url:rootPath+'index.php?option=com_adsortium&view=message&format=json',link:'chain',
       onSuccess:function(responseJSON, responseText){
         newmsg=false;
         if(responseJSON.error){ alert('Error: '+responseJSON.error); }else{
          $$('.msgcount').set('text', '');
          $$('.msgcount').setStyle('font-weight', 'normal');
          if(responseJSON.newcount>0){newmsg=true; $('newcount').set('text', ' ('+responseJSON.newcount+')');}
          $('inboxcount').set('text', ' ('+responseJSON.inboxcount+')');
          if(newmsg){$('inboxcount').setStyle('font-weight', 'bold');}else{$('inboxcount').setStyle('font-weight', 'normal');}
          $('sentcount').set('text', ' ('+responseJSON.sentcount+')');
          $('trashcount').set('text', ' ('+responseJSON.trashcount+')');
         }
       },
       onFailure:function(text, error){ alert(error); }
   }).send({method:'post',data:'task=updateCounts'});
}

/*
Function loadFolderList
This function determines which folder was selected and loads the list of messages that folder along with the
event listeners for the appropriate items.
*/
function loadFolderList(id){
    //Load the list of messages for a folder
    if(id=='sent'){ dir='To: '; }else{ dir='From: '; }
    var request = new Request.JSON({
        url:rootPath+'index.php?option=com_adsortium&view=message&format=json',link:'chain',
        onSuccess:function(responseJSON, responseText){
            currFolder=id; //<- Set the folder we're currently operating in.
            if(responseJSON.error){ alert('Error: '+responseJSON.error); }
            if(responseJSON.message){
			  //Empty the message list an display the message from the server (Usually indicating empty folder or not messages) 
              $('msg-list').getChildren().each(function(el){el.destroy();});
              $('msg-list').grab(new Element('div',{'class':'msg-list-item'}).set('text', responseJSON.message).setStyle('border', '0'));
            }else{
			  //Empty the message list
              $('msg-list').getChildren().each(function(el){el.destroy();});
              for(i=0; i<responseJSON.length; i++){
                el = new Element('div',{'class':'msg-list-item', id:'msg-list-item-'+responseJSON[i].id});
				//Set the read indicator to 'Unread' if 0 or Read if not 0
                if(responseJSON[i].is_read==0){mg = new Element('img', {src:rootPath+'components/com_adsortium/images/closed-letter.png', 'class':'readindicator', align:'left',title:'Unread',alt:'Unread'}); el.grab(mg);
                }else{mg = new Element('img', {src:rootPath+'components/com_adsortium/images/open-letter.png', 'class':'readindicator', align:'left',title:'Read',alt:'Read'}); el.grab(mg);}
				//Insert the name of the sender/recipient as appropriate
                el.grab(new Element('span', {'class':'msg-list-item-info'}).set('text', dir+responseJSON[i].name));
				//Insert the subject of the message
                el.grab(new Element('span', {'class':'msg-list-item-info'}).set('text', 'Subject: '+responseJSON[i].subject));
				//If this is the inbox, we want to give the option to delete the message without clicking to read it first.
                if(id=='inbox'){del = new Element('div', {'class':'msg-list-item-ctl', id:'msg-list-ctl-del-'+responseJSON[i].id}).grab(new Element('img', {src:rootPath+'components/com_adsortium/images/trash.png',title:'Trash',alt:'Trash'})); el.grab(del);}
				//If this is the trash bin, we want to give the option to untrash the message without clicking to read first.
                if(id=="trash"){udel = new Element('div', {'class':'msg-list-item-ctl', id:'msg-list-ctl-udel-'+responseJSON[i].id}).grab(new Element('img', {src:rootPath+'components/com_adsortium/images/up.png',title:'Untrash',alt:'Untrash'})); el.grab(udel);}
				//Tell the message list to grab this element
                $('msg-list').grab(el);
              }
			  //Attach event listeners to the appropriate controls in the message list.
              addMsgListeners();
              //Update Mesage Counters
              updateMsgCount();
            }
        },
        onFailure:function(text, error){ alert(error); },
        onRequest:function(){
			  //Empty the list an display a loading indicator while the request processes.
              $('msg-list').getChildren().each(function(el){el.destroy();});
              $('msg-list').grab(new Element('div',{'class':'msg-list-item'}).set('text', 'Loading...').setStyle('border', '0'));}
    }).send({method:'post',data:'task=getfolder&folder='+id});
}

/*
Function loadMessage
This function determines which message was clicked and fetches the correct message as well as marking the 
selected message as read.
*/
function loadMessage(id){
    //Load message body
	msgrow = id;
    id=id.split('-').pop();
    var request = new Request.JSON({
        url:rootPath+'index.php?option=com_adsortium&view=message&format=json',link:'chain',
        onSuccess:function(responseJSON, responseText){
            if(responseJSON.error){ alert('Error: '+responseJSON.error); }else{
			  //Fill in message pane fields
              $('msgheaders-from').set('text', 'From: '+responseJSON.fromName);
              $('msgheaders-to').set('text', 'To: '+responseJSON.toName);
              $('msgheaders-sent').set('text', 'Sent: '+responseJSON.timestamp);
              $('msgheaders-controls').empty(); //<- Prep controls field for new controls
			  //Setup the controls for a message in the inbox (Delete and Reply)
              if(currFolder == 'inbox' || currFolder == 'sent'){
                  del=new Element('div', {'class':'msg-list-item-ctl', id:'msg-list-ctl-del-'+responseJSON.id}).grab(new Element('img', {src:rootPath+'components/com_adsortium/images/trash.png',title:'Trash',alt:'Trash'}));
                  del.addEvent('click', function(){handleInterface(del.id);});
                  $('msgheaders-controls').grab(del);
              }
              if(currFolder == 'inbox'){
                  rpy=new Element('div', {'class':'msg-list-item-ctl', id:'msg-list-ctl-rpy-'+responseJSON.id}).grab(new Element('img', {src:rootPath+'components/com_adsortium/images/bubble.png',title:'Reply',alt:'Reply'}));
                  rpy.addEvent('click', function(){handleInterface(rpy.id);});
                  $('msgheaders-controls').grab(rpy);
              }
			  //Setup the controls for messages in the trash (Untrash)
              if(currFolder=='trash'){
                  udel=new Element('div', {'class':'msg-list-item-ctl', id:'msg-list-ctl-udel-'+responseJSON.id}).grab(new Element('img', {src:rootPath+'components/com_adsortium/images/up.png',title:'Untrash',alt:'Untrash'}))
                  udel.addEvent('click', function(){handleInterface(udel.id);});
                  $('msgheaders-controls').grab(udel);
              }
			  //Fill in the message body portion of the message pane
              $('msg-message-content').innerHTML=responseJSON.message.replace(/\r?\n|\r/g, "<br>");
			  //Set the read indicator to the 'Read' state, since the request alreay did this in the database
			  if(currFolder=='inbox' || currFolder=='trash'){ $(msgrow).getChildren('.readindicator')[0].setProperties({src:rootPath+'components/com_adsortium/images/open-letter.png',title:'Read',alt:'Read'}); }
              //Update Mesage Counters
              updateMsgCount();
            }
        }, onFailure:function(text, error){ alert(error); }
    }).send({method:'post',data:'task=getmessage&m='+id});
}

/*
Function clearMessage
This function simply clears the message pane
*/
function clearMessage(){
    $('msgheaders-from').set('text', '');
    $('msgheaders-to').set('text', '');
    $('msgheaders-sent').set('text', '');
    $('msg-message-content').set('text', '');
    $('msgheaders-controls').empty();
}

/*
Function handleInterface
This function handles the various messages generated by UI elements and processes them based on which element was clicked
and any other relevant messages the UI elements generate.
*/
function handleInterface(id){
    switch(id){
     case 'getmsgs': //Process Get Messages button
        $('inbox').fireEvent('click');
        clearMessage();
     break;
     case 'newmsg': //Process New Messages button
       $('compose-message').reveal();
	   //$$('.compose-message-contacts-item').each(function(el){el.removeProperty('checked');});
       $('selectedContact').getElement('span').set('html', 'Click to select a Contact');
       $('selectedContact').getElement('input').set('value', '');
     break;
     case 'addrbook': //Process Address Book button
       $('address-book').reveal();
     break;
     case 'emptytrash': //Process Empty Trash button
        emptyTrash();
     break;
     default: //Process Generic UI button
		//Grab UI button message and key from identity
        sig = id.split('-');
        key = sig.pop();
        msg = sig.pop();
		//Process button signal based on message passed and use key accordingly
        switch(msg){
            case 'del':
               trashMessage(key);
			   return false;
            break;
            case 'udel':
               untrashMessage(key);
			   return false;
            break;
            case 'rpy':
                var request = new Request.JSON({
                    url:rootPath+'index.php?option=com_adsortium&view=message&format=json',link:'chain',
                    onSuccess:function(responseJSON, responseText){
                        if(responseJSON.error){ alert('Error: '+responseJSON.error); }else{
                           $('subject').set('value', 'Re:'+responseJSON.subject);
                           //$$('.compose-message-contacts-item').each(function(el){if(el.value==responseJSON.from){el.set('checked', 'checked');}});
                           $('selectedContact').getElement('span').set('html', $(id).get('html'));
                           $('selectedContact').getElement('input').set('value', key);
                           $('compose-message').reveal();
                        }
                    }, onFailure:function(text, error){ alert(error); }
                }).send({method:'post',data:'task=getmessage&m='+key});
				return false;
            break;
			case 'addr':
				$('address-book').dissolve();
				$('compose-message').reveal();
				//$$('.compose-message-contacts-item').each(function(el){if(el.value==key){el.set('checked', 'checked');}});
                $('selectedContact').getElement('span').set('html', $(id).get('html'));
                $('selectedContact').getElement('input').set('value', key);
			break;
        }
     break;
    }
}

/*
Function trashMessage
This function receives the id for a specific message and sends a request to flag the message as trashed
*/
function trashMessage(id){
    if(!confirm("Are you sure you want to move this message to the trash bin?")){return false;}
    var request = new Request.JSON({
        url:rootPath+'index.php?option=com_adsortium&view=message&format=json',link:'chain',
        onSuccess:function(responseJSON, responseText){
            if(responseJSON.error){ alert('Error: '+responseJSON.error); }else{
				alert("Message moved to trash bin!");
				loadFolderList(currFolder);
                clearMessage();
			}
        }, onFailure:function(text, error){ alert(error); }
    }).send({method:'post',data:'task=trashmessage&m='+id});
}

/*
Function untrashMessage
This function takes the id for a specific message and sends a request to unflag the message as trashed
*/
function untrashMessage(id){
    var request = new Request.JSON({
        url:rootPath+'index.php?option=com_adsortium&view=message&format=json',link:'chain',
        onSuccess:function(responseJSON, responseText){
            if(responseJSON.error){ alert('Error: '+responseJSON.error); }else{
				alert("Message removed from trash bin!");
				loadFolderList(currFolder);
                clearMessage();
			}
        }, onFailure:function(text, error){ alert(error); }
    }).send({method:'post',data:'task=untrashmessage&m='+id});
}

/*
Function emptyTrash
This function submits a request to permanently delete all message to a user marked as trash.
*/
function emptyTrash(){
if(!confirm("Are you sure you with to empty the trash bin? This is permanently delete any messages in this folder!")){return false;}
    var request = new Request.JSON({
        url:rootPath+'index.php?option=com_adsortium&view=message&format=json',link:'chain',
        onSuccess:function(responseJSON, responseText){
            if(responseJSON.error){ alert('Error: '+responseJSON.error); }else{
				alert("Trash bin emptied!");
				if(currFolder=='trash'){ loadFolderList(currFolder); clearMessage();}
                //Update Mesage Counters
                updateMsgCount();
			}
        }, onFailure:function(text, error){ alert(error); }
    }).send({method:'post',data:'task=emptytrash'});
}

/*
Function addMsgListeners
This function attaches event listeners to message list items and their controls. It is usually called after the
loadFolderList function to make the message items in the list clickable.
*/
function addMsgListeners(){
    $$('.msg-list-item').each(function(el){ 
			el.addEvents({ 'click':function(){loadMessage(el.id);}, 
						   'mouseenter':function(){el.setStyle('background-color', '#FFF7D8');}, 
						   'mouseleave':function(){el.setStyle('background-color', 'transparent'); }
			}); 
	});
    $$('.msg-list-item-ctl').each(function(el){ el.addEvent('click', function(){handleInterface(el.id);});});
}