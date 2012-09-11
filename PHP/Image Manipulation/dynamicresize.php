<?php
$imagefile=$HTTP_GET_VARS['file'];//Syntax for using the script is:
$nheight=$HTTP_GET_VARS['h'];	 // dynamicresize.php?file=<path/to/image>&h=<desired height as integer>
if(!($inimage=@imagecreatefromstring(file_get_contents($imagefile))))
{
$image = imagecreate(320, 240);
$colorwhite = imagecolorallocate($image, 255, 255, 255);
$colorblack = imagecolorallocate($image, 0, 0, 0);
imagefill($image, 0, 0, $colorwhite);
imagestring($image, 2, 10, 10, "No Load:".$imagefile, $colorblack);
header("content-type:image/jpg");
imagejpeg($image);
exit();
}
if(!isset($nheight))
{$nheight=imagesy($inimage);}
$nwidth=floor(imagesx($inimage)/(imagesy($inimage)/$nheight));
$disImage = imagecreatetruecolor($nwidth, $nheight);
$backfill = imagecolorallocate($disImage, 0, 0, 0);
imagefill($disImage, 0, 0, $backfill);

imagecopyresampled($disImage, $inimage, 0, 0, 0, 0, $nwidth, $nheight, imagesx($inimage), imagesy($inimage));
header("content-type:image/jpg");
imagejpeg($disImage);
?>
