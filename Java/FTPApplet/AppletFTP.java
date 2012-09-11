/* AppletFTP
 * By: Justin Pearce
 * This applet is a one-way FTP client to allow non-tech people upload
 * stupid huge files to a server without havig to know how to use an FTP
 * client or have a specially configured PHP or CGI system to handle the
 * huge uploads.
 */
import java.awt.*;
import java.awt.event.*;
import javax.swing.*;
import java.net.*;
import java.io.*;

/* Class: AppletFTP
 * This is the primary class for the applet!
 * Extends: JApplet
 */
public class AppletFTP extends JApplet{

	/* init()
	 * This function is run when the applet is first loaded by the browser.
	 *  (non-Javadoc)
	 * @see java.applet.Applet#init()
	 * @Access: public
	 * @Returns: void
	 */
	public void init() {
		/* Grab all the parameters from the <PARAM> tags in the HTML */
		String temphost = getParameter("host");
		String tempuser = getParameter("user");
		String tempdir = getParameter("srvdir");
		String temppath = getParameter("appdir");
		
		/* Make sure our params are actually set to something. */
		if(temphost!=null){
			host = temphost;
		}
		if(tempuser!=null){
			username = tempuser;
		}
		if(tempdir!=null){
			serverDir = tempdir;
		}
		if(temppath!=null){
			appletDir = temppath;
		}
		/* In the interest if keeping the FTP password out of the HTML
		   we have it kept in a text file along with the applet's JAR file.
		   the text file in called 'policy.txt' and contains the password on
		   a single line. 
		   The following function reads in the file and extracts the password.*/
		readCredentials();
		
		/* Now the good stuff.
		 * We need to build a lightweight thread to keep the program running over and over.
		 * Here, we build a Runnable object and fire it off with the setup function for the
		 * GUI stuff.
		 */
		try {
	        javax.swing.SwingUtilities.invokeAndWait(new Runnable() {
	            public void run() {
	                showGUI(); //<- It all starts here...
	            }
	        });
	    } catch (Exception e) {
	        System.err.println("Could not draw interface!!!");
	        System.err.println(e.toString());
	        e.printStackTrace();
	    }
	}
	
	/* showGUI()
	 * This function sets up all the GUI items used by the applet, including
	 * the actionListeners for the buttons.
	 * @Access: public
	 * @Returns: void
	 */
	public void showGUI(){
		/* Build the content pane and set it to white. We'll use BoxLayout for this one. */
		Container c = this.getContentPane();
		c.setBackground(new Color(255, 255, 255));
		c.setLayout(new BoxLayout(c, BoxLayout.Y_AXIS));
		
		/* Create a file chooser item so we can pick files on the local machine */
		selecTron = new JFileChooser();
		selecTron.setFileSelectionMode(JFileChooser.FILES_ONLY);
		
		/* Setup 3 Labels for general messages to the user. */
		label1 = new Label("", Label.CENTER);
		label1.setFont(Font.decode("DIALOG-BOLD-12"));
		c.add(label1);
		label2 = new Label("", Label.CENTER);
		label2.setFont(Font.decode("DIALOG-BOLD-12"));
		c.add(label2);
		label3 = new Label("", Label.CENTER);
		label3.setFont(Font.decode("DIALOG-BOLD-12"));
		c.add(label3);
		
		/* Create our button to invoke the file chooser */
		button1 = new Button("Browse Files...");
		button1.setMinimumSize(new Dimension(150, 25));
		button1.setMaximumSize(new Dimension(150, 25));
		button1.setPreferredSize(new Dimension(150, 25));
		c.add(button1);
		
		/* Create our button to fire off the upload */
		button2 = new Button("Upload");
		button2.setMinimumSize(new Dimension(150, 25));
		button2.setMaximumSize(new Dimension(150, 25));
		button2.setPreferredSize(new Dimension(150, 25));
		button2.setSize(125, 25);
		button2.setEnabled(false); //<-We want this disabled until we get a new file.
		c.add(button2);

		/* Create the action listener for the file chooser button so that 
		   clicking the button will invoke the file chooser... */
		button1.addActionListener(new ActionListener(){
			public void actionPerformed(ActionEvent e){
				int returnVal;
				returnVal=selecTron.showOpenDialog(selecTron.getParent());
				/* Show the file chooser until the user clicks open with a valid file. */
				if(returnVal==JFileChooser.APPROVE_OPTION){
						/* Set the paths to the file */
						filePath = selecTron.getSelectedFile().getAbsolutePath();
						fileName = selecTron.getSelectedFile().getName();
						label1.setText("Upload: "+fileName);
						label2.setText("");
						label3.setText("Click Upload to start");
						button2.setEnabled(true); //<- Now we can upload!
				}
			}
		});
		
		/* Create the action listener to actually fire up out FTP client class
		   and send the file on it's way. */
		button2.addActionListener(new ActionListener(){
			public void actionPerformed(ActionEvent e){
				/* Turn off the this button for now */
				button2.setEnabled(false);
				/* Create our FTP client class object */
				comm = new SunFtpWrapper();
				/* Initialize labels */
				comm.label1 = label1;
				comm.label2 = label2;
				comm.label3 = label3;
				try{
					/* If we can open a connection to the server (on port 21) */
					comm.openServer(host);
					if(comm.serverIsOpen()){
						/* Login using the username and password */
						comm.login(username, password);
						/* If we're in the successful range */
						if(comm.getResponseCode()==230){
							/* Turn off the file chooser button */
							button1.setEnabled(false);
							/* Change to the desired directory */
							comm.cd(serverDir);
							if(comm.getResponseCode()>=300){
								label1.setText("Error changing folders.");
								label2.setText("Please contact webmaster!");
								label3.setText("");
							}
							/* Change to binary transfer mode (safest) */
							comm.binary();
							/* Fire off the upload to the server */
							if(comm.uploadFile(filePath, fileName)){
								/* If the File was uploaded... */
								label1.setText("");
								label2.setText("Upload Complete!");
								label3.setText("");
							}else{
								/* Something broke! */
								label1.setText("Error Uploading File!");
								label2.setText("Response code: "+comm.getResponseCode());
								label3.setText("Please contact webmaster!");
							}
							/* We're done...set file chooser back to 'on' */
							button1.setEnabled(true);
						}
						/* Close connection to the server for now */
						comm.closeServer();
					}else{
						label1.setText("Error Uploading File!");
						label2.setText("Cannot connect to server!");
						label3.setText("Contact Webmaster!");
					}
				}
				catch(Exception ex){
					/* BOOOOOOOM!! */
					ex.toString();
					label1.setText("An error occurred!");
					label2.setText("Contact Webmaster!");
					label3.setText("");
				}
			}
		});
	}
	
	/* stop()
	 * This function is called when the applet is navigated away from.
	 *  (non-Javadoc)
	 * @see java.applet.Applet#stop()
	 * @Access: public
	 * @Returns: void
	 */
	public void stop(){
		try{
			/* Close server connection if we have one open */
			comm.closeServer();
		}
		catch(Exception ex){
			/* We're just going to catch this because the connection might be
			   up or down... */
			ex.toString();
		}
	}

	/* readCredentials()
	 * This function opens a connection to the host and reads our 'credentials' from the server
	 * @Access: private
	 * @Returns: void
	 */
	private void readCredentials(){
		try{
			/* Set up the URL to the file */
			URL thisPath = new URL("http", host, appletDir+"/policy.txt");
			/* Create a connection based on this URL */
			URLConnection connection = thisPath.openConnection();
			/* Make a reader object and connect it to the connection's input stream */
			BufferedReader b = new BufferedReader(new InputStreamReader(connection.getInputStream()));
			/* Read from the file */
			String passkey = b.readLine();
			/* Set the 'password' */
			password = passkey;			
		}
		catch(Exception ex){
			/* Something didn't work... */
			//System.out.println(ex.toString());
		}
	}
	/* Declarations */
	//GUI Components
	private Button button1;
	private Button button2;
	public Label label1;
	public Label label2;
	public Label label3;
	private JFileChooser selecTron;
	//Strings
	private String filePath = "";
	private String fileName = "";
	private String host = "";
	private String username = "";
	private String password = "";
	private String serverDir = "";
	private String appletDir = "";
	//Special Objects
	public SunFtpWrapper comm;
	/* Not that we need this...it's just so the IDE program stops complaining. */
	final static long serialVersionUID = 1248163264;
	/* ~fin~ */
}