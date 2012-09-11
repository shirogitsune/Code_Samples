<?php
//require_once('classes/class.database.php'); //<- Required here to make sure we have DB
require_once('class.database.php'); //<- Required here to make sure we have DB
require_once('class.crypto.php');  //<- Required here to make sure we have encryption
/*
    Class: Auth
    By: Justin Pearce
    Copyright © 2007 Agama Advertising, All Rights Reserved
    This class provides basic authentication checking against a database object.
    It requires that session_start() be called before running the authorize()
    function. This ensures that session_start() is only called once.
*/
class Auth{

/* Start Variables */
  var $DB; //<- Object holder for the Database class object
  var $Crypto; //<- Object holder for the Crypto class object
// End Variables

/* Start Functions */

/*
    'Constructor': Auth
    This initializes the Auth object
    @Args: none
    @Returns: none
*/
  function Auth(){
    include('./config.php');
    $this->DB=new Database($DBHOST, $DBUSER, $DBPASS, $DBNAME);
    $this->Crypto=new Crypto();
    register_shutdown_function(array(&$this, 'closeAuth'));

    session_start(); //<- Start a session for persistance
  }


/*
    Function: authorize
    This function checks a provided username and password against the database.
    Username and password are scrubbed before executing the query.
    This function sets several session variables for later use:
        UID: The user's user_id from the database
        SUID: The user's username
        SSID: The user's password encrypted
        TYPE: The user's user type.
    @Args: string user, string password
    @Returns: boolean authorize
*/
  function authorize($user, $password){
    /* Take the username and password and escape them to prevent SQL injection*/
    $user=$this->DB->scrubVar($user);
    $password=$this->DB->scrubVar($password);

    /* Prepare query for database */
    $sql="SELECT `uid`, `username`, `password`, `type` FROM `users` "
        ."WHERE `disabled`=0 AND `username`='".$user."' AND password='"
        .mysql_real_escape_string($this->Crypto->encrypt($password))."' "
        ."LIMIT 1";

    /* Execute query and return the results */
    $check=$this->DB->execute($sql);

    if($check){
        /* If we get a result, set the session variables
          (session_start() needs to be called before this happens, otherwise
          there will be errors, pain, death, weaping, gnashing of teeth, etc */
        $row=mysql_fetch_array($check);
            $_SESSION['UID']=$row['uid'];
            $_SESSION['SUID']=$row['username'];
            $_SESSION['SSID']=$row['password'];
            $_SESSION['TYPE']=$row['type'];
            /* Return 'YES' */
            return true;
    }else{
        /* Return 'NO'...no authorization for you! */
        return false;
    }
  }


/*
    Function: isAuthorized
    This function is for checking to make sure that someone does, in fact, have
    authorized credentials to be in the system. We need to make sure that the
    session_start() function is called before this function, since it relies
    on session variables to hold most of the data. We grab the session variables,
    scrub them (because some assclown might decide to try a sql injection by
    twiddling the session variables :( ), and then chek to see if they are really
    a user (since some assclown might just try to get around authentication by
    thinking they can meerly forge some session variables hoping we're being
    sloppy :( ... if they think that, they have another thing coming >:D )
    @Args: none
    @Returns: boolean isAuthorized
*/
  function isAuthorized(){
   /* Do the UID, SUID, and SSID session variables exist? */
    if(isset($_SESSION['UID']) && isset($_SESSION['SUID']) && isset($_SESSION['SSID'])){
        /* Grab the other  */
        $testuser=$this->DB->scrubVar($_SESSION['SUID']);
        $testpass=$this->DB->scrubVar($this->Crypto->decrypt($_SESSION['SSID']));
        $sql="SELECT `uid` FROM `users` WHERE username='".$testuser."' AND password='"
        .mysql_real_escape_string($this->Crypto->encrypt($testpass))."' "
            ."AND `disabled`=0 LIMIT 1";
        $check=$this->DB->execute($sql);
        if($check){
            $row=mysql_fetch_array($check);
            if($_SESSION['UID']==$row['uid']){

                /* Good Day, Professor Falken.
                   Would you like to play a game of chess? */

                return true; //<- We cool...

            }else{
                /* Wrong UID! Nope. */
                return false;
            }
        }else{
            /* Not in the database! Nope. */
            return false;
        }
    }else{
        /* Not logged in or authorized, sorry. :( */
        return false;
    }
  }


/*
    Function: unAuthorize
    This function completely de-authorizes the user by killing the
    session variables. This requires that session_start() be called before this
    function.
    @Args: none
    @Returns: boolean unAuthorize
*/
  function unAuthorize(){
    if(isset($_SESSION['UID']) && isset($_SESSION['SUID']) && isset($_SESSION['SSID'])){
        unset($_SESSION['UID']); //<- The only way to win...is not to play. (Kill variables)
        unset($_SESSION['SUID']);
        unset($_SESSION['SSID']);
        unset($_SESSION['TYPE']);
        return true;
    }else{
        return false;
    }

  }


/*
    Function: getUserType
    This function returns the session variable containing the user type.
    @Args: none
    @Returns: string Type
*/
  function getUserType(){
    return $_SESSION['TYPE'];
  }


/*
    Fucntion: getUserName
    This function returns the session variable containing the user name.
    @Args: none
    @Returns: string Username
*/
  function getUserName(){
    return $_SESSION['SUID'];
  }


/*
    Function: getUserId()
    This function returns the session variable containing the user ID.
    @Args: none
    @Returns: string UserID
*/
  function getUserId(){
    return $_SESSION['UID'];
  }


/*
    Function: getUserPassword
    This function returns the decrypted password for the user.
    THIS FUNCTION IS FOR UTILITY PURPOSES ONLY! DO NOT USE THIS FUNCTION
    FOR ANYTHING BUT DEBUGGING, SINCE IT DOES EXPOSE TH USER'S PASSWORD
    IN PLAIN TEXT! YOU HAVE BEEN WARNED! e.e
    @Args: none
    @Returns: string Password (desrypted)
*/
  function getUserPassword(){
    return $this->Crypto->decrypt($_SESSION['SSID']);
  }


/*
    Function: closeAuth
    This acts as a destructor for the class
    @Args: none
    @Returns: none
*/
  function closeAuth(){
    unset($this->DB);
    unset($this->Crypto);
  }

//End Functions
}
// End Class: Auth
/*

~fin~

*/
?>
