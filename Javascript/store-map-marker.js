<script type="text/javascript">
  var marker = {
      graphics: new Array('/components/com_mallmap/images/mapi1.png', 
						  '/components/com_mallmap/images/mapi2.png', 
						  '/components/com_mallmap/images/mapi3.png', 
						  '/components/com_mallmap/images/mapi4.png', 
						  '/components/com_mallmap/images/mapi5.png', 
						  '/components/com_mallmap/images/mapi1.png'),
      timer:0,
      frame:0,
      loader:null,
      i:0,
      maxframe:6,
      init:function(){
          this.loader = new Image();
          for(this.i=0; this.i<this.graphics.length; this.i++){ this.loader.src=this.graphics[this.i]; }
          document.getElementById('gp1').src=this.graphics[0];
          this.loader=null; this.i=0;
      },
      animate:function(){
          window.clearTimeout(this.timer);
          this.timer=null;
          this.frame++;
          if(this.frame>=this.maxframe){ this.frame=0; }
          if((this.frame%2)>0){
              document.getElementById('gp2').src=this.graphics[this.frame];
              $('g2').fade('in');
              $('g1').fade('out');
          }else{
              document.getElementById('gp1').src=this.graphics[this.frame];
              $('g1').fade('in');
              $('g2').fade('out');
          }
          this.timer = window.setTimeout('marker.animate()', 200);
      },
      stop:function(){
          this.frame=0;
          document.getElementById('gp1').src=this.graphics[this.frame];
          $('g1').fade('in');
          $('g2').fade('out');
          window.clearTimeout(this.timer);
      },
      show:function(){
          $('mcont').fade('in');
      },
      hide:function(){
          $('mcont').fade('out');
      },
      moveTo:function(x, y){
          document.getElementById('mcont').style.position='absolute';
          $('mcont').morph({top:(y-24)+'px', left:(x-24)+'px'});
      }
  }
</script>