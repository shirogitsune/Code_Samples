/*
	Waterfall Banner Ad Rotator
	This code uses the Mootools library built into most version of Joomla! to 
	provide a pretty image crossfade between a number of images in a singl banner
	or work in concert with other instances of the rotator to build a 'waterfall'
	image rotator. An example of the effect can be found on http://www.lapalmera.com
*/	
var res = new Array();
function adRotator(bannum, id){
      this.id=id;
      this.bannum = bannum;
      this.loader='';
      this.loaderArray = new Array();
      this.tDiv='';
      this.vDiv='';
      this.which=1;
      this.swapImage = function(){
        if(this.which == 1){
            this.tDiv = 'image'+this.bannum+this.id+'b';
            this.vDiv = 'image'+this.bannum+this.id+'a';
            $('image'+this.bannum+this.id+'1').src='http://www.example.tld/'+res[this.bannum].images[res[this.bannum].counter].imageurl;
            if(res[this.bannum].images[res[this.bannum].counter].id!=-1){
             $('image'+this.bannum+this.id+'b-link').href='index.php?option=com_banners&task=click&id='+res[this.bannum].images[res[this.bannum].counter].id;
            }else{
             $('image'+this.bannum+this.id+'b-link').href='#';
            }
            if(res[this.bannum].images[res[this.bannum].counter].ext!=0){
             $('image'+this.bannum+this.id+'b-link').target='_blank';
            }else{
             $('image'+this.bannum+this.id+'b-link').target='_top';
            }
            this.which=2;
            res[this.bannum].counter++;
            if(res[this.bannum].counter>=res[this.bannum].images.length){res[this.bannum].counter=0;}
        }else{
            this.tDiv = 'image'+this.bannum+this.id+'a';
            this.vDiv = 'image'+this.bannum+this.id+'b';
            $('image'+this.bannum+this.id+'2').src='http://www.example.tld/'+res[this.bannum].images[res[this.bannum].counter].imageurl;
            if(res[this.bannum].images[res[this.bannum].counter].id!=-1){
             $('image'+this.bannum+this.id+'a-link').href='index.php?option=com_banners&task=click&id='+res[this.bannum].images[res[this.bannum].counter].id;
            }else{
              $('image'+this.bannum+this.id+'a-link').href='#';
            }
            if(res[this.bannum].images[res[this.bannum].counter].ext!=0){
             $('image'+this.bannum+this.id+'a-link').target='_blank';
            }else{
             $('image'+this.bannum+this.id+'a-link').target='_top';
            }
            this.which=1;
            res[this.bannum].counter++;
            if(res[this.bannum].counter>=res[this.bannum].images.length){res[this.bannum].counter=0;}
        }
        $(this.tDiv).fade('in');
        $(this.vDiv).fade('out');
      }
      this.waterfallImage = function(){
        if(this.which == 1){
            this.tDiv = 'image'+this.bannum+this.id+'b';
            this.vDiv = 'image'+this.bannum+this.id+'a';
            $(this.vDiv).fade('out');
            $('image'+this.bannum+this.id+'1').src='http://www.example.tld/'+res[this.bannum].images[res[this.bannum].counter].imageurl;
            if(res[this.bannum].images[res[this.bannum].counter].id!=-1){
             $('image'+this.bannum+this.id+'b-link').href='index.php?option=com_banners&task=click&id='+res[this.bannum].images[res[this.bannum].counter].id;
            }else{
             $('image'+this.bannum+this.id+'b-link').href='#';
            }
            if(res[this.bannum].images[res[this.bannum].counter].ext!=0){
             $('image'+this.bannum+this.id+'b-link').target='_blank';
            }else{
             $('image'+this.bannum+this.id+'b-link').target='_top';
            }
            this.which=2;
            res[this.bannum].counter++;
            if(res[this.bannum].counter>=res[this.bannum].images.length){res[this.bannum].counter=0;}
        }else{
            this.tDiv = 'image'+this.bannum+this.id+'a';
            this.vDiv = 'image'+this.bannum+this.id+'b';
            $(this.vDiv).fade('out');
            $('image'+this.bannum+this.id+'2').src='http://www.example.tld/'+res[this.bannum].images[res[this.bannum].counter].imageurl;
            if(res[this.bannum].images[res[this.bannum].counter].id!=-1){
             $('image'+this.bannum+this.id+'a-link').href='index.php?option=com_banners&task=click&id='+res[this.bannum].images[res[this.bannum].counter].id;
            }else{
              $('image'+this.bannum+this.id+'a-link').href='#';
            }
            if(res[this.bannum].images[res[this.bannum].counter].ext!=0){
             $('image'+this.bannum+this.id+'a-link').target='_blank';
            }else{
             $('image'+this.bannum+this.id+'a-link').target='_top';
            }
            this.which=1;
            res[this.bannum].counter++;
            if(res[this.bannum].counter>=res[this.bannum].images.length){res[this.bannum].counter=0;}
        }
        window.setTimeout('$(\''+this.tDiv+'\').fade(\'in\')', 600);
      }
    }
    
  //Code generated from database
	res[1] = {
	images:[{"imageurl":"images\/banners\/little1.png","width":180,"height":93,"alt":"","id":18, "ext":1},
			{"imageurl":"images\/banners\/little2.png","width":180,"height":93,"alt":"facebook","id":65, "ext":1},
			{"imageurl":"images\/little3.png","width":180,"height":93,"alt":"","id":20, "ext":0},
			{"imageurl":"images\/banners\/little4.png","width":180,"height":93,"alt":"","id":59, "ext":0},
			{"imageurl":"images\/banners\/little5.png","width":180,"height":93,"alt":"","id":60, "ext":0},
			{"imageurl":"images\/banners\/little6.png","width":180,"height":93,"alt":"","id":61, "ext":0}], 
	preloaded:0, 
	counter:0, 
	j:0, 
	offset: 0, 
	loader: '',
	interval: '', 
	type: '', 
	delay:6000, 
	loaderArray: Array(), bannerArray: Array(), 
	init:function(t){
		this.type=t; 
		if(this.preloaded==0){
			this.preloaded=1; 
			 for(this.j=0; this.j<this.images.length; this.j++){ 
				this.loader = new Image(); 
				this.loader.src = 'http://www.example.tld/'+this.images[this.j].imageurl; 
				this.loaderArray.push(this.loader);
			 } 
			 this.j=0;
		}
	}, 
	animate:function(){
		window.clearTimeout(this.interval);
		if(this.j<this.bannerArray.length){
			for(this.j=0; this.j<this.bannerArray.length; this.j++){
					if(this.type=='swap'){window.setTimeout('res[1].bannerArray['+this.j+'].swapImage()', this.offset); }
					if(this.type=='roll'){window.setTimeout('res[1].bannerArray['+this.j+'].waterfallImage()', this.offset); }
					this.offset=this.offset+200; 
			}
			this.offset=0;
		}else{
			for(this.j=this.bannerArray.length-1; this.j>=0; this.j--){
					if(this.type=='swap'){window.setTimeout('res[1].bannerArray['+this.j+'].swapImage()', this.offset); }
					if(this.type=='roll'){window.setTimeout('res[1].bannerArray['+this.j+'].waterfallImage()', this.offset); }
					this.offset=this.offset+200; 
			}
			this.offset=0;
		}
		this.interval = window.setTimeout('res[1].animate()', this.delay);
	}, 
	sleep:function(milliSeconds){ 
		startTime = new Date().getTime(); 
		while(new Date().getTime() < (startTime + milliSeconds)){};
	} 
	};
	window.addEvent('domready', function(){res[1].init('roll');}); 
	window.addEvent('load', function(){res[1].animate();}); 

	res[1].bannerArray[0]=new adRotator(1, 0);
	res[1].bannerArray[1]=new adRotator(1, 1);
	res[1].bannerArray[2]=new adRotator(1, 2);
	res[1].bannerArray[3]=new adRotator(1, 3);
	res[1].bannerArray[4]=new adRotator(1, 4);

  //Code generated from database
	res[2] = {
	images:[{"imageurl":"images\/banners\/big1.jpg","width":900,"height":400,"alt":"","id":73, "ext":0},
			{"imageurl":"images\/banners\/big2.jpg","width":900,"height":400,"alt":"","id":-1, "ext":0},
			{"imageurl":"images\/banners\/big3.jpg","width":900,"height":400,"alt":"","id":-1, "ext":0},
			{"imageurl":"images\/banners\/big4.jpg","width":900,"height":400,"alt":"","id":72, "ext":0},
			{"imageurl":"images\/banners\/big5.jpg","width":900,"height":400,"alt":"","id":-1, "ext":0}], 
	preloaded:0, 
	counter:0, 
	j:0, .
	offset: 0, 
	loader: '',
	interval: '', 
	type: '', 
	delay:6000, 
	loaderArray: Array(), 
	bannerArray: Array(), 
	init:function(t){
		this.type=t; 
		if(this.preloaded==0){
			this.preloaded=1; 
			for(this.j=0; this.j<this.images.length; this.j++){ 
				this.loader = new Image(); 
				this.loader.src = 'http://www.example.tld/'+this.images[this.j].imageurl; 
				this.loaderArray.push(this.loader);
			} 
			this.j=0;
		}
	}, 
	animate:function(){
		window.clearTimeout(this.interval);
		 if(this.j<this.bannerArray.length){
				for(this.j=0; this.j<this.bannerArray.length; this.j++){
						if(this.type=='swap'){window.setTimeout('res[2].bannerArray['+this.j+'].swapImage()', this.offset); }
						if(this.type=='roll'){window.setTimeout('res[2].bannerArray['+this.j+'].waterfallImage()', this.offset); }
						this.offset=this.offset+200; 
				}
				this.offset=0;
			}else{
				 for(this.j=this.bannerArray.length-1; this.j>=0; this.j--){
						if(this.type=='swap'){window.setTimeout('res[2].bannerArray['+this.j+'].swapImage()', this.offset); }
						if(this.type=='roll'){window.setTimeout('res[2].bannerArray['+this.j+'].waterfallImage()', this.offset); }
						this.offset=this.offset+200; 
					}
					this.offset=0;
			}
			this.interval = window.setTimeout('res[2].animate()', this.delay);
	}, 
	sleep:function(milliSeconds){ startTime = new Date().getTime(); while(new Date().getTime() < (startTime + milliSeconds)){};} 
	};
	window.addEvent('domready', function(){res[2].init('swap');}); 
	window.addEvent('load', function(){res[2].animate();}); 

	res[2].bannerArray[0]=new adRotator(2, 0);