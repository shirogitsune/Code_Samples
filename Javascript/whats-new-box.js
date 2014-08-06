<script>
var showNews = false;
function toggleNews(){
    if(showNews){showNews=false;}else{showNews=true;}
    if(!showNews){
        $('newsbox').fade();
        window.setTimeout("$('rightbox').morph({'width':'0px', 'left':'900px', 'background-color':'#000000'})", 500);
    }else{
        $('rightbox').morph({'width':'124px', 'left':'900px', 'background-color':'#0E5B65'});
        window.setTimeout("$('newsbox').fade()", 500);
    }
} 		
</script>