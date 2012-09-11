<?php
/* Dynamic Watermarking
 * By: Justin Pearce
 * This script takes a file path and and applys a pre-defined watermark image to the
 * image and sends it to the browser.
 * The file path to the file to be watermarked needs to be run through the function
 * urlencode(base64_encode(/full/path/to/file)) to "hide" the filepath (helps prevent
 * leeching)...
*/
$id = base64_decode(urldecode($_GET['id'])); //Unhamburger our filepath
$wmfile="wmlogor2.gif"; //Watermark file
  $watermark=@imagecreatefromstring(file_get_contents($wmfile));//Snag the watermark
  if(!($temp = @imagecreatefromstring(file_get_contents($id)))){
   $image = imagecreate(320, 240); //This set of code is for images that don't work
   $colorwhite = imagecolorallocate($image, 255, 255, 255);
   $colorblack = imagecolorallocate($image, 0, 0, 0);
   imagefill($image, 0, 0, $colorblack);
   imagestring($image, 2, 10, 10, 'No Load: '.$id, $colorwhite);
   header('Content-type:image/jpeg');
   imagejpeg($image); //Send out image and exit
   exit;
  }
 else{
    imagecopymerge($image, $watermark, 0, 0, 0, 0, imagesx($watermark), imagesy($watermark), 50); //Apply the watermark
    header('Content-type:image/jpeg');
    imagejpeg($image); //Send image to browser
  }
?>
