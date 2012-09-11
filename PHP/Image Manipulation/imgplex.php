<?php
/*
 function pleximage
 This function takes a given image file and makes a small, medium, and large
 scaled versions of the huge (presumably from a camera) image.
 @Args: string imagefile
 @Returns: boolean success
*/
function pleximage($imagefile = ""){

    if(isset($imagefile) && $imagefile!=""){
    		//Setup file names
        $sfile = dirname($imagefile)."/s_".basename($imagefile);
        $mfile = dirname($imagefile)."/m_".basename($imagefile);
        $lfile = dirname($imagefile)."/l_".basename($imagefile);
				//Open source file        
        if(@$source = imagecreatefromstring(file_get_contents($imagefile)))
        {
          if(imagesx($source)>imagesy($source))  //If wider than tall...
          {
            //Get sizes of the respective images, taking into account the possibility that they are not proportionate
            $lh=480; $lw=imagesx($source)/(imagesy($source)/480);
            $mh=240; $mw=imagesx($source)/(imagesy($source)/240);
            $sh=imagesy($source)/(imagesx($source)/100); $sw=100; //Thumbnail sizes must be consistant            
          }
          else
          {
            //Get sizes of the respective images, taking into account the possibility that they are not proportionate
            $lw=640; $lh=imagesy($source)/(imagesx($source)/640);
            $mw=320; $mh=imagesy($source)/(imagesx($source)/320);
            $sh=imagesy($source)/(imagesx($source)/100); $sw=100; //Thumbnail sizes must be consistant           
          }
            //Then we actually setup the images and create them one by one.
            $smallimage = imagecreatetruecolor(100, 75); //Create small image object.
            // Resize the source to target and resample
            imagecopyresampled($smallimage, $source, 0, 0, 0, 0, $sw, $sh, imagesx($source), imagesy($source));
            imagejpeg($smallimage, $sfile); //Output image oject to file.
            imagedestroy($smallimage); //Remove small image object from memory.
            $midimage = imagecreatetruecolor($mw, $mh); //Create medium image object.
            // Resize the source to target and resample
            imagecopyresampled($midimage, $source, 0, 0, 0, 0, $mw, $mh, imagesx($source), imagesy($source));
            imagejpeg($midimage, $mfile); //Output image oject to file.
            imagedestroy($midimage); //Remove medium image object from memory.
            $largeimage = imagecreatetruecolor($lw, $lh); //Create large image object.
            // Resize the source to target and resample
            imagecopyresampled($largeimage, $source, 0, 0, 0, 0, $lw, $lh, imagesx($source), imagesy($source));
            imagejpeg($largeimage, $lfile); //Output image oject to file.
            imagedestroy($largeimage); //Remove large image object from memory.
            //Clean up
            imagedestroy($source); //Remove huge image from memory.
            unlink($imagefile); //Remove huge image from hard drive.
            // ~fin~
            return true;            
        }
        else //Could not open image
        {
          return false;
        }
    }
}
/*
 function plexhelp
 This function displays help info for the above function
 @Args: none
 @Returns: none
*/
function plexhelp()
{
    echo 'Thank you for using imgplex.php! To expedite your use of this script, please follow the below example. Good luck!'."\n\n"
        .'include(\'/path/to/imgplex.php\');.'."\n"
        .'pleximage(\'/path/to/image/file\');</CODE>'."\n\n"
        .'Your image should now exist in three separate files, with the original file removed!'."\n"
        .'Thank you and have a nice day!'."\n";
        exit();
}
?>
