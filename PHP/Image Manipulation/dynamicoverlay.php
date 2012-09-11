<?php
/* Image Overlay
 * This script takes an image file as an argument via the GET array.
 * It then resizes the image to fit (if necessary) and places it into the
 * $image object we create. It then takes an alpha-blended image and overlays
 * it on top of the image.
 * By: Justin Pearce  09/05/2006
 */
//[Configuration:]/////////////////////////////////////////////////
// The $logobar is made frm a PNG, due to the format's supiriority
// over GIF89a in number of colors and transparency.
//-----------------------------------------------------------------
//Image Overlay
$logobar=@imagecreatefrompng("logo_overlay.png"); //MUST BE PNG FORMAT!
//Image Dimensions
$imageWidth=569;  //Width
$imageHeight=314; //Height
//Background Color
$bR=232; //RED
$bG=223; //GREEN
$bB=200; //BLUE
//[End Configuration]/////////////////////////////////////////////

/*Path to Image File*/
$picture=$_GET['file'];
/*Open the file specified and try to load it...*/
if(!($img=@imagecreatefromstring(file_get_contents($picture))))
        {   //The following creates an overlayed image with an error mesage alerting the
            //user that the image cannot be loaded for oe reason or another.
            $image=imagecreatetruecolor($imageWidth, $imageHeight);
            $background=imagecolorallocate($image, $bR, $bG, $bB);
            $textcolor=imagecolorallocate($image, 0, 0, 0);
            imagefill($image, 0, 0, $background);
            imagestring($image, 5, 20, $imageHeight/3, "Error: There was an error loading the image ".$picture, $textcolor);
            imagecopy($image, $logobar, 0, (imagesy($image)-imagesy($logobar)), 0, 0, imagesx($logobar), imagesy($logobar));
            header('Content-type:image/jpeg');
            imagejpeg($image);
            imagedestroy($image);
        }
        else
        {
             /*Build a "canvas" to work on...*/
            $image=imagecreatetruecolor(569, 314);
            /*Set the background color*/
            $background=imagecolorallocate($image, $bR, $bG, $bB);
            /*Paint the background the specified color*/
            imagefill($image, 0, 0, $background);
            /*Calculate the new height of the image based on the width*/
            $nh=floor(imagesy($img)/(imagesx($img)/$imageWidth));
            /*Resize and resample the image to the canvas*/
            imagecopyresampled($image, $img, 0, 0, 0, 0, $imageWidth, $nh, imagesx($img), imagesy($img));
            /*Copy the overlay image onto the canvas, taking into account the alpha*/
            imagecopy($image, $logobar, 0, (imagesy($image)-imagesy($logobar)), 0, 0, imagesx($logobar), imagesy($logobar));
            /*Send our header and image data to the browser*/
            header('Content-type:image/jpeg');
            imagejpeg($image);
            imagedestroy($image); //<- Very important to throw the leftovers away...
        }
?>
