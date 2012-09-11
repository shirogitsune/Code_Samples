<?php
/***************************************
Descending Explorer
By: Justin Pearce 08/27/2006
Updated: Justin Pearce 4/27/2008
Updated: Justin Pearce 6/10/2008 - Added FLV Player capability
The purpose of this script is to provide the ability for a webmaster to post files to a folder
and not need a complex interface for displaying them. Granted, one could just go for the default
Apache directory listing. However, there are some concerns
***************************************/
ini_set('memory_limit', '256M');
GLOBAL $filesperpage;
//[Configuration]///////////////////////

/*Page Title: Title of the page shown in the browser window*/
$pagetitle="Explorer";

/*Files per page: Number of files to show on a given page.*/
$filesperpage=25;

/*Height: This specifies the height of the generated thumbnails for images in pixles.
          Obviously, a smaller number meants smaller thumbnails, which saves load time.*/
$height="75";

/*StartDIR: This specifies the 'root' of the directory tree this script decends.
            Default is the current folder the script resides in.*/
$startDIR=".";

/*Disallowed: This specifies a list of file extensions that are not allowed to be displayed
              Default is the most common PHP extensions.*/
$disallowed="php, php4, php5, phps, js, swf";

/*These are various colors use in the page of the script*/
$link="#000000";
$active="#000000";
$visited="#C5C5C5";
$hover="#FFFFFF";
$althover="#000000";
$background="#FFFFFF";

/*Font height variable used in display.*/
$fontheight="14";
////////////////////////////////////////

if(isset($_GET['file']))
{
    sizeImage($_GET['file'], $_GET['t'], $height);
    exit;
}
else
{
    $linkpad=($height/2)-$fontheight;
    echo '<html>'."\n";
    echo '<head><title>'.$pagetitle.'</title>'."\n";
    echo '<style type="text/css">'."\n";
    echo '<!--'."\n";
    echo 'a:link {color: '.$link.'; background: '.$background.'; text-decoration: none; font-height: '.$fontheight.'px;}'."\n";
    echo 'a:active {color: '.$active.'; background: '.$background.'; text-decoration: none; font-height: '.$fontheight.'px;}'."\n";
    echo 'a:visited {color: '.$visited.'; background: '.$background.'; text-decoration: none; font-height: '.$fontheight.'px;}'."\n";
    echo 'a:hover {color: '.$hover.'; background: '.$althover.'; text-decoration: underline; font-height: '.$fontheight.'px;}'."\n";
    echo '-->'."\n";
    echo '</style>';
    /*
       We'll need to have SWFobject version 2.0 for this! This is included at the end of this file.
       just copy it out and save it as swfobject.js! :D
        \/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/
    */
    echo '<script type="text/javascript" src="./swfobject.js"></script>'."\n";
    /*
        /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
    */
    echo '</head>'."\n";
    echo '<body bgcolor="'.$background.'">'."\n";
    if(isset($_GET['SSID']))
     $directory=base64_decode($_GET['SSID']);
    else
     $directory=$startDIR;
     parseDir($directory, $disallowed);
    echo '</body>'."\n";
    echo '</html>'."\n";
    exit;
}

//[Begin Functions]//////////////////////////////////////

/* Function: parseDIR
 * @ Param: String $sdir, String $noshow
 * @ Returns: None
 * This function takes a string representation of the file path and parses it for files
 * and folders, displaying them similarly to the manner in which Apache defaults to showing
 * files and such, except that this hides php files and parent directories (. and ..).
 * It also allows for a list of disallowed file extensions (most php variants are the default).
 */
function parseDir($sdir, $noshow="php, php4, php5, phps"){   
    global $filesperpage;
    /*Take our string and open the resulting directory handle*/
    //$dh=opendir($sdir); //<-old
    /* 4/27/08 JP: Updated to use the linux 'ls' command with some options to 
       list the files in a folder. */
    //Need to set spaces in dir name to '\ ' because linux commands need it.
    $sdir = str_replace(' ', '\ ', $sdir);
    $x='';
    //Fire off th ls comman with options
    exec('ls -atc '.$sdir, $x);
    //Set our dir back the way we had it.
    $sdir = str_replace('\\', '', $sdir);
    /*Read in the entries for the specified directory*/
    //while(($file=readdir($dh))!=false)
    /* 4/27/08 JP: This all works the same way */
    foreach($x as $file)
    {   /*As long as the entry is not ., .., or andthing ending in the $disallowed we should be fine*/
        if($file!="." && $file!=".." && $file!="videoPlayer.swf" && $file!="expressInstall.swf" && strpos($noshow, substr($file, strrpos($file, ".")+1, strlen($file)))===false)
        {
            if(is_file($sdir.'/'.$file))
              $files[]=$file; //It's a file
            else
              $dirs[]=$sdir.'/'.$file; //It's a folder
        }
    }
    /*Make sure we close the directory*/
    /* 4/27/08 JP: Unused now that we're using linux 'ls'.*/
    //closedir($dh);

    /*If we found any subfolders*/
    if(isset($dirs))
    {
        echo 'Folders:<br>'; echo "\n";
        //natcasesort($dirs);
        /*Here, we go to each folder and output a link to that folder. The link is
          actually a reference to the script with an encoded directory entry to keep
          average people from noticing what the script is doing.*/
        echo '<ul>'; echo "\n";
        foreach($dirs as $dir){
           echo '<li><a href="'.$_SERVER['PHP_SELF'].'?SSID='.base64_encode($dir).'">'.substr($dir, strrpos($dir, "/")+1, strlen($dir)).'</a><br>'."\n";
           echo "\n";
        }
        echo '</ul>'; echo "\n";
    }
    echo '<br><a href="'.$_SERVER['PHP_SELF'].'">Top</a></br>'."\n";
    /*If we found any files*/
    if(isset($files))
    {
        echo '<hr>'; echo "\n";
        echo 'Files:<br>'; echo "\n";
        echo '<table width="100%" cellpadding="0" cellspacing="0" border="0">'."\n";
        //natcasesort($files);
        /*File are handled a little differently. If it's an image file of a typical web format then
          we call this script again, passing in certain parameters. This will cause the script to
          make a thumbnail of the image and return it to the browser. We also link to the original
          image if a larger view is desired.
          Other files basically get a designation placed as to what they are. Several common formats
          are listed and you can add your own case if you have something you want done.*/
        $colcount=0;
        $offset=0;
        if(isset($_REQUEST['offset'])){$offset=$_REQUEST['offset'];}
	$filecount=count($files);
        //foreach($files as $file)
        for($i=0; $i<=$filesperpage; $i++)
        {    //Image files get thumbnails
            if(($i+$offset+1)>$filecount){break;}
            if($colcount==0){echo '<tr>';}
            if(strpos("jpg, JPG, jpeg, JPEG, gif, GIF, png, PNG" ,substr($files[$i+$offset], strrpos($files[$i+$offset], ".")+1, strlen($files[$i+$offset])))!==false){
               echo '<td><a href="'.$sdir.'/'.$files[$i+$offset].'"><img src="'.$_SERVER['PHP_SELF'].'?file='.$sdir.'/'.$files[$i+$offset].'&t='.substr($files[$i+$offset], strrpos($files[$i+$offset], ".")+1, strlen($files[$i+$offset])).'" border="0"><br>Image: '.$files[$i+$offset].'</a></td>'."\n";
               $colcount++;
            }
            else //Everyone else just gets a short description.
               switch(substr($files[$i], strrpos($files[$i+$offset], ".")+1, strlen($files[$i+$offset]))){
                   case "mp3":
                       echo '<td><a href="'.$sdir.'/'.$files[$i+$offset].'">Music:<br>'.$files[$i+$offset].'</a></td>';
                       echo "\n";
                       $colcount++;
                   break;
                   case "wav":
                       echo '<td><a href="'.$sdir.'/'.$files[$i+$offset].'">Sound:<br>'.$files[$i+$offset].'</a></td>';
                       echo "\n";
                       $colcount++;
                   break;
                   case "avi":
                      if($sdir!="."){
                        $tempDir = substr($_SERVER['REQUEST_URI'], 0, strrpos($_SERVER['REQUEST_URI'], '/'))."/".$sdir;
                      }else{
                        $tempDir = str_replace('/', '%2F', substr($_SERVER['REQUEST_URI'], 0, strrpos($_SERVER['REQUEST_URI'], '/')));
                      }
                         echo '<td><object id="MediaPlayer" classid="CLSID:22D6f312-B0F6-11D0-94AB-0080C74C7E95" '
                             .'standby="Loading Windows Media Player components…" type="application/x-oleobject" '
                             .'codebase="http://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab#Version=6,4,7,1112">'."\n"
                             .'<param name="filename" value="http://'.$_SERVER['HTTP_HOST'].$tempDir.'/'.$files[$i+$offset].'">'."\n"
                             .'<param name="Showcontrols" value="True">'."\n"
                             .'<param name="autoStart" value="False">'."\n"
                             .'<embed type="application/x-mplayer2" src="http://'.$_SERVER['HTTP_HOST'].$tempDir.'/'.$files[$i+$offset].'" '
                             .'name="MediaPlayer" ></embed>'."\n"
                             .'</object><br>'.$files[$i+$offset].'<br>Size: '.round(filesize($sdir.'/'.$files[$i+$offset])/pow(1024, 2), 2).'MB</td>'."\n";
                       $colcount++;
                   break;
                   case "mpg":
                      if($sdir!="."){
                        $tempDir = substr($_SERVER['REQUEST_URI'], 0, strrpos($_SERVER['REQUEST_URI'], '/'))."/".$sdir;
                      }else{
                        $tempDir = str_replace('/', '%2F', substr($_SERVER['REQUEST_URI'], 0, strrpos($_SERVER['REQUEST_URI'], '/')));
                      }
                         echo '<td><object id="MediaPlayer" classid="CLSID:22D6f312-B0F6-11D0-94AB-0080C74C7E95" '
                             .'standby="Loading Windows Media Player components…" type="application/x-oleobject" '
                             .'codebase="http://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab#Version=6,4,7,1112">'."\n"
                             .'<param name="filename" value="http://'.$_SERVER['HTTP_HOST'].$tempDir.'/'.$files[$i+$offset].'">'."\n"
                             .'<param name="Showcontrols" value="True">'."\n"
                             .'<param name="autoStart" value="False">'."\n"
                             .'<embed type="application/x-mplayer2" src="http://'.$_SERVER['HTTP_HOST'].$tempDir.'/'.$files[$i+$offset].'" '
                             .'name="MediaPlayer" ></embed>'."\n"
                             .'</object><br>'.$files[$i+$offset].'<br>Size: '.round(filesize($sdir.'/'.$files[$i+$offset])/pow(1024, 2), 2).'MB</td>'."\n";
                       $colcount++;
                   break;
                   case "tar":
                       echo '<td><a href="'.$sdir.'/'.$files[$i+$offset].'">Archive:<br>'.$files[$i+$offset].'</a></td>';
                       echo "\n";
                       $colcount++;
                   break;
                   case "zip":
                       echo '<td><a href="'.$sdir.'/'.$files[$i+$offset].'">Archive:<br>'.$files[$i+$offset].'</a></td>';
                       echo "\n";
                       $colcount++;
                   break;
                   case "exe":
                       echo '<td><a href="'.$sdir.'/'.$files[$i+$offset].'">Program:<br>'.$files[$i+$offset].'</a></td>';
                       echo "\n";
                       $colcount++;
                   break;
                   case "wmv":
                      if($sdir!="."){
                        $tempDir = substr($_SERVER['REQUEST_URI'], 0, strrpos($_SERVER['REQUEST_URI'], '/'))."/".$sdir;
                      }else{
                        $tempDir = str_replace('/', '%2F', substr($_SERVER['REQUEST_URI'], 0, strrpos($_SERVER['REQUEST_URI'], '/')));
                      }
                         echo '<td><object id="MediaPlayer" height="285" width="432" classid="CLSID:22D6f312-B0F6-11D0-94AB-0080C74C7E95" '
                             .'standby="Loading Windows Media Player components…" type="application/x-oleobject" '
                             .'codebase="http://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab#Version=6,4,7,1112">'."\n"
                             .'<param name="filename" value="http://'.$_SERVER['HTTP_HOST'].$tempDir.'/'.$files[$i+$offset].'">'."\n"
                             .'<param name="Showcontrols" value="True">'."\n"
                             .'<param name="autoStart" value="False">'."\n"
                             .'<embed type="application/x-mplayer2" height="285" width="432"  src="http://'.$_SERVER['HTTP_HOST'].$tempDir.'/'.$files[$i+$offset].'" '."\n"
                             .'name="MediaPlayer" ></embed>'."\n"
                             .'</object><br>'.$files[$i+$offset].'<br>Size: '.round(filesize($sdir.'/'.$files[$i+$offset])/pow(1024, 2), 2).'MB</td>'."\n";
                         $colcount++;
                   break;
                   case "wma":
                      if($sdir!="."){
                        $tempDir = substr($_SERVER['REQUEST_URI'], 0, strrpos($_SERVER['REQUEST_URI'], '/'))."/".$sdir;
                      }else{
                        $tempDir = str_replace('/', '%2F', substr($_SERVER['REQUEST_URI'], 0, strrpos($_SERVER['REQUEST_URI'], '/')));
                      }
                         echo '<td><object id="MediaPlayer" height="285" width="432" classid="CLSID:22D6f312-B0F6-11D0-94AB-0080C74C7E95" '
                             .'standby="Loading Windows Media Player components…" type="application/x-oleobject" '
                             .'codebase="http://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab#Version=6,4,7,1112">'."\n"
                             .'<param name="filename" value="http://'.$_SERVER['HTTP_HOST'].$tempDir.'/'.$files[$i+$offset].'">'."\n"
                             .'<param name="Showcontrols" value="True">'."\n"
                             .'<param name="autoStart" value="False">'."\n"
                             .'<embed type="application/x-mplayer2" height="285" width="432"  src="http://'.$_SERVER['HTTP_HOST'].$tempDir.'/'.$files[$i+$offset].'" '."\n"
                             .'name="MediaPlayer" ></embed>'."\n"
                             .'</object><br>'.$files[$i+$offset].'<br>Size: '.round(filesize($sdir.'/'.$files[$i+$offset])/pow(1024, 2), 2).'MB</td>'."\n";
                         $colcount++;
                   break;
                   case "flv":
                      if($sdir!="."){
                        $tempDir = str_replace('/', '%2F', substr($_SERVER['REQUEST_URI'], 0, strrpos($_SERVER['REQUEST_URI'], '/')))."%2F".str_replace('/', '%2F', $sdir);
                      }else{
                        $tempDir = str_replace('/', '%2F', substr($_SERVER['REQUEST_URI'], 0, strrpos($_SERVER['REQUEST_URI'], '/')));
                      }
                      echo '<td>'
                          .'<script>'."\n"
                          .'var flashvars = {};'
                          .'flashvars.file="http%3A%2F%2F'.$_SERVER['HTTP_HOST'].$tempDir.'%2F'.$files[$i+$offset].'";'
                          .'swfobject.embedSWF("videoPlayer.swf", "flashcontent'.$i.'", "432", "432", "7.0.0", "expressInstall.swf", flashvars);'."\n"
                          .'</script>'."\n"
                          .'<div id="flashcontent'.$i.'"></div><br>'."\n"
                          .$files[$i+$offset].'<br>Size: '.round(filesize($sdir.'/'.$files[$i+$offset])/pow(1024, 2), 2).'MB'."\n"
			              .'</td>'."\n";
                       $colcount++;
                   break;
                   default:
                       echo '<td><a href="'.$sdir.'/'.$files[$i+$offset].'">File:<br>'.$files[$i+$offset].'</a></td>';
                       echo "\n";
                       $colcount++;
                   break;
               }
               if($colcount==1){echo '</tr>'."\n"; $colcount=0;}
        }
     if($colcount!=1){
      while($colcount!=0 && $colcount<1){
        echo '<td>&nbsp;</td>'."\n";
        $colcount++;
      }
      echo '</tr>'."\n";
     }
     echo '</table>'."\n";
     echo '<hr>'; echo "\n";
     $numpages=round($filecount/$filesperpage, 0);
     $t=0;
     $counter=1;
     for($i=0; $i<$numpages; $i++){
        $counter++;
        if(isset($_REQUEST['SSID'])){
	  $q='&SSID='.$_REQUEST['SSID'];
        }else{
          $q='';
        }
	echo '|<a href="'.$_SERVER['PHP_SELF'].'?offset='.$t.''.$q.'">'.($i+1).'</a>|';
        $t+=$filesperpage+1;
        if($counter==45){
	   echo '<br />'."\n";
           $counter=1;
	}
        
     }
    }
    else{ //Obviously if there are no files, we want to do something besides a blank screen.
     echo 'No files here...<br>'; echo "\n";
     echo '<hr>'; echo "\n";
    }
}

/* Function: sizeImage
 * @ Params: String $file, String $type, Integer $height
 * @ Returns: Binary image data (to the browser)
 * This function takes an image file of a specified type anf makes a thumbnail of
 * the image to the specified height. Right now, the main image formats supported
 * by GD are used. If the function cannot successfully make sense of the file,
 * The script returns an "Error" image to the browser.
 */
function sizeImage($file, $type, $height)
{
    /*We want to take the type that is provided and use that to open the file correctly.*/
    switch(strtolower($type)){
        case "jpg": //If we are given a JPEG typ of file
            header("Content-type: image/jpeg"); //<- Make sure we send the correct header.
            $im=@imagecreatefromjpeg($file);
            /*We try to make a jpeg with the above line. If we are successful...*/
            if($im){
            $image=imagecreatetruecolor(imagesx($im)/(imagesy($im)/$height), $height);
            imagecopyresampled($image, $im, 0,0,0,0, imagesx($image), imagesy($image), imagesx($im), imagesy($im));
            //Resize the image using the two lines above and then output it as a jpeg to the browser here.
            imagejpeg($image);
            }
            else
            { //Something is wrong and so we make an error image to let teh user know.
            $image=imagecreatetruecolor(imagesx($im)/(imagesy($im)/$height), $height);
            imagefill($image, 0, 0, imagecolorallocate($image, 0, 0, 0));
            imagestring($image, imagesx($image)/4, imagesy($image)/2, 0, "Error!", imagecolorallocate($image, 255, 255, 255));
            imagejpeg($image);
            }
        break;
        case "jpeg": //<- Same as a jpg...but with one extra character in the extension.
            header("Content-type: image/jpeg"); //<- Make sure we send the correct header.
            $im=@imagecreatefromjpeg($file);
            /*We try to make a jpeg with the above line. If we are successful...*/
            if($im){
            $image=imagecreatetruecolor(imagesx($im)/(imagesy($im)/$height), $height);
            imagecopyresampled($image, $im, 0,0,0,0, imagesx($image), imagesy($image), imagesx($im), imagesy($im));
            //Resize the image using the two lines above and then output it as a jpeg to the browser here.
            imagejpeg($image);
            }
            else
            { //Something is wrong and so we make an error image to let teh user know.
            $image=imagecreatetruecolor(imagesx($im)/(imagesy($im)/$height), $height);
            imagefill($image, 0, 0, imagecolorallocate($image, 0, 0, 0));
            imagestring($image, imagesx($image)/4, imagesy($image)/2, 0, "Error!", imagecolorallocate($image, 255, 255, 255));
            imagejpeg($image);
            }
        break;
        case "gif": //Much like a JPEG, but this case handles GIF89a format
            header("Content-type: image/gif");
            $im=@imagecreatefromgif($file);
            if($im){
            $image=imagecreatetruecolor(imagesx($im)/(imagesy($im)/$height), $height);
            imagecopyresampled($image, $im, 0,0,0,0, imagesx($image), imagesy($image), imagesx($im), imagesy($im));
            imagegif($image);
            }
            else
            { //Error
            $image=imagecreatetruecolor(imagesx($im)/(imagesy($im)/$height), $height);
            imagefill($image, 0, 0, imagecolorallocate($image, 0, 0, 0));
            imagestring($image, imagesx($image)/4, imagesy($image)/2, 0, "Error!", imagecolorallocate($image, 255, 255, 255));
            imagejpeg($image);
            }
        break;
        case "png": //Probably a better format than GIF89a, PNG (Portable Network Graphic) is handled here
            header("Content-type: image/png");
            $im=@imagecreatefrompng($file);
            if($im){
            $image=imagecreatetruecolor(imagesx($im)/(imagesy($im)/$height), $height);
            imagecopyresampled($image, $im, 0,0,0,0, imagesx($image), imagesy($image), imagesx($im), imagesy($im));
            imagepng($image);
            }
            else
            { //Error
            $image=imagecreatetruecolor(imagesx($im)/(imagesy($im)/$height), $height);
            imagefill($image, 0, 0, imagecolorallocate($image, 0, 0, 0));
            imagestring($image, imagesx($image)/4, imagesy($image)/2, 0, "Error!", imagecolorallocate($image, 255, 255, 255));
            imagejpeg($image);
            }
        break;
        default: //We don't know what the format is...so we'll pretend it's a JPEG and hope for the best.
            header("Content-type: image/jpeg"); //<- Make sure we send the correct header.
            $im=@imagecreatefromstring(file_get_contents($file));
            /*We try to make a jpeg with the above line. If we are successful...*/
            if($im){
            $image=imagecreatetruecolor(imagesx($im)/(imagesy($im)/$height), $height);
            imagecopyresampled($image, $im, 0,0,0,0, imagesx($image), imagesy($image), imagesx($im), imagesy($im));
            //Resize the image using the two lines above and then output it as a jpeg to the browser here.
            imagejpeg($image);
            }
            else
            { //Something is wrong and so we make an error image to let teh user know.
            $image=imagecreatetruecolor(imagesx($im)/(imagesy($im)/$height), $height);
            imagefill($image, 0, 0, imagecolorallocate($image, 0, 0, 0));
            imagestring($image, imagesx($image)/4, imagesy($image)/2, 0, "Error!", imagecolorallocate($image, 255, 255, 255));
            imagejpeg($image);
            }
        break;
    }
    /*The most important part of this is to destroy any in-memory images so that
      system resources are preserved and we don't crash the server.*/
    if(isset($im))
        imagedestroy($im);
    if(isset($image))
        imagedestroy($image);
}





/////////////////////////////////////////////////////////////
// Contents of swfobject.js
// Copy the below, commented text into and swfobject.js file
// and save it into the folder this php file goes in.
/////////////////////////////////////////////////////////////
// /*	SWFObject v2.0 <http://code.google.com/p/swfobject/>
//	Copyright (c) 2007 Geoff Stearns, Michael Williams, and Bobby van der Sluis
//	This software is released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
// */
// var swfobject=function(){var Z="undefined",P="object",B="Shockwave Flash",h="ShockwaveFlash.ShockwaveFlash",W="application/x-shockwave-flash",K="SWFObjectExprInst",G=window,g=document,N=navigator,f=[],H=[],Q=null,L=null,T=null,S=false,C=false;var a=function(){var l=typeof g.getElementById!=Z&&typeof g.getElementsByTagName!=Z&&typeof g.createElement!=Z&&typeof g.appendChild!=Z&&typeof g.replaceChild!=Z&&typeof g.removeChild!=Z&&typeof g.cloneNode!=Z,t=[0,0,0],n=null;if(typeof N.plugins!=Z&&typeof N.plugins[B]==P){n=N.plugins[B].description;if(n){n=n.replace(/^.*\s+(\S+\s+\S+$)/,"$1");t[0]=parseInt(n.replace(/^(.*)\..*$/,"$1"),10);t[1]=parseInt(n.replace(/^.*\.(.*)\s.*$/,"$1"),10);t[2]=/r/.test(n)?parseInt(n.replace(/^.*r(.*)$/,"$1"),10):0}}else{if(typeof G.ActiveXObject!=Z){var o=null,s=false;try{o=new ActiveXObject(h+".7")}catch(k){try{o=new ActiveXObject(h+".6");t=[6,0,21];o.AllowScriptAccess="always"}catch(k){if(t[0]==6){s=true}}if(!s){try{o=new ActiveXObject(h)}catch(k){}}}if(!s&&o){try{n=o.GetVariable("$version");if(n){n=n.split(" ")[1].split(",");t=[parseInt(n[0],10),parseInt(n[1],10),parseInt(n[2],10)]}}catch(k){}}}}var v=N.userAgent.toLowerCase(),j=N.platform.toLowerCase(),r=/webkit/.test(v)?parseFloat(v.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):false,i=false,q=j?/win/.test(j):/win/.test(v),m=j?/mac/.test(j):/mac/.test(v);/*@cc_on i=true;@if(@_win32)q=true;@elif(@_mac)m=true;@end@*/return{w3cdom:l,pv:t,webkit:r,ie:i,win:q,mac:m}}();var e=function(){if(!a.w3cdom){return }J(I);if(a.ie&&a.win){try{g.write("<script id=__ie_ondomload defer=true src=//:><\/script>");var i=c("__ie_ondomload");if(i){i.onreadystatechange=function(){if(this.readyState=="complete"){this.parentNode.removeChild(this);V()}}}}catch(j){}}if(a.webkit&&typeof g.readyState!=Z){Q=setInterval(function(){if(/loaded|complete/.test(g.readyState)){V()}},10)}if(typeof g.addEventListener!=Z){g.addEventListener("DOMContentLoaded",V,null)}M(V)}();function V(){if(S){return }if(a.ie&&a.win){var m=Y("span");try{var l=g.getElementsByTagName("body")[0].appendChild(m);l.parentNode.removeChild(l)}catch(n){return }}S=true;if(Q){clearInterval(Q);Q=null}var j=f.length;for(var k=0;k<j;k++){f[k]()}}function J(i){if(S){i()}else{f[f.length]=i}}function M(j){if(typeof G.addEventListener!=Z){G.addEventListener("load",j,false)}else{if(typeof g.addEventListener!=Z){g.addEventListener("load",j,false)}else{if(typeof G.attachEvent!=Z){G.attachEvent("onload",j)}else{if(typeof G.onload=="function"){var i=G.onload;G.onload=function(){i();j()}}else{G.onload=j}}}}}function I(){var l=H.length;for(var j=0;j<l;j++){var m=H[j].id;if(a.pv[0]>0){var k=c(m);if(k){H[j].width=k.getAttribute("width")?k.getAttribute("width"):"0";H[j].height=k.getAttribute("height")?k.getAttribute("height"):"0";if(O(H[j].swfVersion)){if(a.webkit&&a.webkit<312){U(k)}X(m,true)}else{if(H[j].expressInstall&&!C&&O("6.0.65")&&(a.win||a.mac)){D(H[j])}else{d(k)}}}}else{X(m,true)}}}function U(m){var k=m.getElementsByTagName(P)[0];if(k){var p=Y("embed"),r=k.attributes;if(r){var o=r.length;for(var n=0;n<o;n++){if(r[n].nodeName.toLowerCase()=="data"){p.setAttribute("src",r[n].nodeValue)}else{p.setAttribute(r[n].nodeName,r[n].nodeValue)}}}var q=k.childNodes;if(q){var s=q.length;for(var l=0;l<s;l++){if(q[l].nodeType==1&&q[l].nodeName.toLowerCase()=="param"){p.setAttribute(q[l].getAttribute("name"),q[l].getAttribute("value"))}}}m.parentNode.replaceChild(p,m)}}function F(i){if(a.ie&&a.win&&O("8.0.0")){G.attachEvent("onunload",function(){var k=c(i);if(k){for(var j in k){if(typeof k[j]=="function"){k[j]=function(){}}}k.parentNode.removeChild(k)}})}}function D(j){C=true;var o=c(j.id);if(o){if(j.altContentId){var l=c(j.altContentId);if(l){L=l;T=j.altContentId}}else{L=b(o)}if(!(/%$/.test(j.width))&&parseInt(j.width,10)<310){j.width="310"}if(!(/%$/.test(j.height))&&parseInt(j.height,10)<137){j.height="137"}g.title=g.title.slice(0,47)+" - Flash Player Installation";var n=a.ie&&a.win?"ActiveX":"PlugIn",k=g.title,m="MMredirectURL="+G.location+"&MMplayerType="+n+"&MMdoctitle="+k,p=j.id;if(a.ie&&a.win&&o.readyState!=4){var i=Y("div");p+="SWFObjectNew";i.setAttribute("id",p);o.parentNode.insertBefore(i,o);o.style.display="none";G.attachEvent("onload",function(){o.parentNode.removeChild(o)})}R({data:j.expressInstall,id:K,width:j.width,height:j.height},{flashvars:m},p)}}function d(j){if(a.ie&&a.win&&j.readyState!=4){var i=Y("div");j.parentNode.insertBefore(i,j);i.parentNode.replaceChild(b(j),i);j.style.display="none";G.attachEvent("onload",function(){j.parentNode.removeChild(j)})}else{j.parentNode.replaceChild(b(j),j)}}function b(n){var m=Y("div");if(a.win&&a.ie){m.innerHTML=n.innerHTML}else{var k=n.getElementsByTagName(P)[0];if(k){var o=k.childNodes;if(o){var j=o.length;for(var l=0;l<j;l++){if(!(o[l].nodeType==1&&o[l].nodeName.toLowerCase()=="param")&&!(o[l].nodeType==8)){m.appendChild(o[l].cloneNode(true))}}}}}return m}function R(AE,AC,q){var p,t=c(q);if(typeof AE.id==Z){AE.id=q}if(a.ie&&a.win){var AD="";for(var z in AE){if(AE[z]!=Object.prototype[z]){if(z=="data"){AC.movie=AE[z]}else{if(z.toLowerCase()=="styleclass"){AD+=' class="'+AE[z]+'"'}else{if(z!="classid"){AD+=" "+z+'="'+AE[z]+'"'}}}}}var AB="";for(var y in AC){if(AC[y]!=Object.prototype[y]){AB+='<param name="'+y+'" value="'+AC[y]+'" />'}}t.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'+AD+">"+AB+"</object>";F(AE.id);p=c(AE.id)}else{if(a.webkit&&a.webkit<312){var AA=Y("embed");AA.setAttribute("type",W);for(var x in AE){if(AE[x]!=Object.prototype[x]){if(x=="data"){AA.setAttribute("src",AE[x])}else{if(x.toLowerCase()=="styleclass"){AA.setAttribute("class",AE[x])}else{if(x!="classid"){AA.setAttribute(x,AE[x])}}}}}for(var w in AC){if(AC[w]!=Object.prototype[w]){if(w!="movie"){AA.setAttribute(w,AC[w])}}}t.parentNode.replaceChild(AA,t);p=AA}else{var s=Y(P);s.setAttribute("type",W);for(var v in AE){if(AE[v]!=Object.prototype[v]){if(v.toLowerCase()=="styleclass"){s.setAttribute("class",AE[v])}else{if(v!="classid"){s.setAttribute(v,AE[v])}}}}for(var u in AC){if(AC[u]!=Object.prototype[u]&&u!="movie"){E(s,u,AC[u])}}t.parentNode.replaceChild(s,t);p=s}}return p}function E(k,i,j){var l=Y("param");l.setAttribute("name",i);l.setAttribute("value",j);k.appendChild(l)}function c(i){return g.getElementById(i)}function Y(i){return g.createElement(i)}function O(k){var j=a.pv,i=k.split(".");i[0]=parseInt(i[0],10);i[1]=parseInt(i[1],10);i[2]=parseInt(i[2],10);return(j[0]>i[0]||(j[0]==i[0]&&j[1]>i[1])||(j[0]==i[0]&&j[1]==i[1]&&j[2]>=i[2]))?true:false}function A(m,j){if(a.ie&&a.mac){return }var l=g.getElementsByTagName("head")[0],k=Y("style");k.setAttribute("type","text/css");k.setAttribute("media","screen");if(!(a.ie&&a.win)&&typeof g.createTextNode!=Z){k.appendChild(g.createTextNode(m+" {"+j+"}"))}l.appendChild(k);if(a.ie&&a.win&&typeof g.styleSheets!=Z&&g.styleSheets.length>0){var i=g.styleSheets[g.styleSheets.length-1];if(typeof i.addRule==P){i.addRule(m,j)}}}function X(k,i){var j=i?"visible":"hidden";if(S){c(k).style.visibility=j}else{A("#"+k,"visibility:"+j)}}return{registerObject:function(l,i,k){if(!a.w3cdom||!l||!i){return }var j={};j.id=l;j.swfVersion=i;j.expressInstall=k?k:false;H[H.length]=j;X(l,false)},getObjectById:function(l){var i=null;if(a.w3cdom&&S){var j=c(l);if(j){var k=j.getElementsByTagName(P)[0];if(!k||(k&&typeof j.SetVariable!=Z)){i=j}else{if(typeof k.SetVariable!=Z){i=k}}}}return i},embedSWF:function(n,u,r,t,j,m,k,p,s){if(!a.w3cdom||!n||!u||!r||!t||!j){return }r+="";t+="";if(O(j)){X(u,false);var q=(typeof s==P)?s:{};q.data=n;q.width=r;q.height=t;var o=(typeof p==P)?p:{};if(typeof k==P){for(var l in k){if(k[l]!=Object.prototype[l]){if(typeof o.flashvars!=Z){o.flashvars+="&"+l+"="+k[l]}else{o.flashvars=l+"="+k[l]}}}}J(function(){R(q,o,u);if(q.id==u){X(u,true)}})}else{if(m&&!C&&O("6.0.65")&&(a.win||a.mac)){X(u,false);J(function(){var i={};i.id=i.altContentId=u;i.width=r;i.height=t;i.expressInstall=m;D(i)})}}},getFlashPlayerVersion:function(){return{major:a.pv[0],minor:a.pv[1],release:a.pv[2]}},hasFlashPlayerVersion:O,createSWF:function(k,j,i){if(a.w3cdom&&S){return R(k,j,i)}else{return undefined}},createCSS:function(j,i){if(a.w3cdom){A(j,i)}},addDomLoadEvent:J,addLoadEvent:M,getQueryParamValue:function(m){var l=g.location.search||g.location.hash;if(m==null){return l}if(l){var k=l.substring(1).split("&");for(var j=0;j<k.length;j++){if(k[j].substring(0,k[j].indexOf("="))==m){return k[j].substring((k[j].indexOf("=")+1))}}}return""},expressInstallCallback:function(){if(C&&L){var i=c(K);if(i){i.parentNode.replaceChild(L,i);if(T){X(T,true);if(a.ie&&a.win){L.style.display="block"}}L=null;T=null;C=false}}}}}();
//////////////////////////////////////////////////////////////
?>