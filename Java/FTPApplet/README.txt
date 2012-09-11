AppletFTP

AppletFTP is a ony-way FTP client applet for use by people that are
not able to use or are unfamiliar with the use of a traditional FTP
client application. It is also perfect for situations where you need
the ability for people to send large files to you but you do not wish
for the senders to be able to see the files already uploaded or allow
them to download the files to their computer.

INSTALLATION

1. Create an FTP account to be used by the applet. It is recommended that the
   account have access limited to a single directory in the directory tree for
   your site.

2. Create a file named 'policy.txt'. This file should contain the password to
   the FTP account created in step 1 on a single line.

3. Place the following HTML into the page where the applet is to appear:
   
   <applet code="AppletFTP.class" archive="/path/to/AppletFTP.jar" 
    height="250px" width="250px">
   <param name="host" value="www.example.com" />
   <param name="srvdir" value="/ftp/path/to/upload" />
   <param name="user" value="username" />
   <param name="appdir" value="/appletfoldername" />
   </applet>
       
    Set 'host' to the domain name or IP address of the serve the applet
    resides on.
    
    Set 'srvdrv' to the directory on the server that the files the applet
    uploads will be sent to.
    
    Set 'user' to the username of the FTP account you set up in step 1.
    
    Set 'appdir' to the directory you are uploading the AppletFTP.jar to.

4. Upload 'AppletFTP.jar' and 'policy.txt' to the directory specified 
   in 'appdir' and 'archive'
