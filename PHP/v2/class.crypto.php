<?php
/* Class: crypto
 * This class handles cryptographic functions within the system. These include:
 * encryption, decryption, key generation, iv generation, hashing, and hash
 * comparison. Cryptography in an application is good for security sake,
 * especially for data that you just plain want to not be read by anyone but
 * yourself (especially passwords in files and databases).
 * By: Justin Pearce (whitefox@guardianfox.net)     
 */ 
class Crypto{
  
  var $_KEY; // Key
  var $_IV;  // Initialization Vector
  var $_ALGORITHM; // Algorithm to be used
  var $_PATH; // Path to IV and Key files
  var $_CIPHER;
  var $_ERROR;
  
  /* Constructor
   * This is our class constructor. It initializes everything it needs to run
   * the class. It also registers a function to be run when this class is to be
   * terminated.
   * @Args: None
   * @Returns: None            
   */   
  function __construct(){
    $this->_ERROR='';
    if(!function_exists('mcrypt_module_open')){
      $this->_ERROR = '[Class: Crypto] Error: mcrypt is not available! '
                     .'Cryptography disabled!';
    }
    $this->_PATH = dirname(__FILE__).'/crypto';
    if(!$this->checkCrypto()){
      generateCrypto();
    }else{
        if($this->loadCrypto()){
            if($this->_IV=='' || $this->_KEY==''){
              $this->_ERROR = '[Class: Crypto] Error: Could not load Key and IV. '
                             .'The Key and IV files may be empty! Please '
                             .'regenerate these files or replace them with backups.';
            }else{
              $this->_CIPHER = mcrypt_module_open($this->_ALGORITHM, '', 
                                                  MCRYPT_MODE_CFB, '' 
                                                  );
              mcrypt_generic_init($this->_CIPHER, $this->_KEY, $this->_IV);
            }
        }else{
           $this->_ERROR = '[Class: Crypto] Error: Could not load Key and IV. '
                           .'The Key and IV files may not exist! '
                           .'Cannot initialize cryptography!';        
        }  
    }
    
  }
  
  /* Function encrypt
   * This function does what it says: it encrypts the data provided as an
   * argument.
   * @Args: mixed Data
   * @Returns: Encrypted Data	    
   */
  function encrypt($data){
    return mcrypt_generic(&$this->CIPHER, $data);
  }
  
  /* Function decrypt
   * This function does what it says: it decrypts the data provided as an
   * argument.
   * @Args: Encrypted Data
   * @Returns: Decrypted Data	    
   */  
  function decrypt($crypt){
    return mdecrypt_generic(&$this->_CIPHER, $crypt);
  }
  
  /* Function generateKey
   * This function generates a key from a passphrase provided to the size of the
   * algorithm set in the class (Usually MCRYPT_RIJNDAEL_256 (AES)).
   * The resulting hash is generated from a random seed, so this should not be
   * used for hashing passwords. This is all about getting a totally random hash
   * for use in the encryption/decryption and as a good salt for other hashes.
   * MAKE SURE YOU HANG ON TO THIS KEY SOMEWHERE! YOUR ENCRYPTED AND HASHED 
   * STUFF IS MEANINGLESS WITHOUT IT!
   * @Args: string Passphrase
   * @Returns: string Key                         
   */
  function generateKey($passphrase){
    //If there is no algorithm set. Set it to AES equivalent.
    if($this->_ALGORITHM==''){
      $this->_ALGORITHM=MCRYPT_RIJNDAEL_256;
    }
    
    // Make a seed value...
    $seed = substr(sha1(time().mt_rand()), 0, 5);
    // Return our 'key'
    return substr(strtoupper(sha1($passphrase.$seed)), 0, 
                  mcrypt_get_key_size(&$this->_ALGORITHM, MCRYPT_MODE_CFB)
                 );
  }
  
  /* Function: generateIV
   * This function generates the initialization vector for the given encryption
   * algorithm. If no algorithm is specified, set the algorithm to AES
   * equivalent. MAKE SURE THAT YOU STORE THIS IV SOMEWHERE! WITHOUT IT ALL YOUR
   * ENCRYPTED DATA BECOMES MEANINGLESS WITHOUT IT!   
   * @Args: None
   * @Returns: string IV      
   */      
  function generateIV(){
    // Set the algorithm, if not already present
    if($this->_ALGORITHM==''){
      $this->_ALGORITHM=MCRYPT_RIJNDAEL_256;
    }
    
    // Fire up the cipher module
    $cipher = mcrypt_module_open($this->_ALGORITHM, '', MCRYPT_MODE_CFB, '');
    // Get the max iv size for this cipher
    $csize = mcrypt_enc_get_iv_size($cipher);
    // Output the iv
    return  mcrypt_create_iv($csize, MYCRYPT_DEV_RANDOM);
  }
  
  /* Function: checkCrypto
   * This function checks to see if there are the required crypto elements
   * needed to do encryption/decryption
   * @Args: None
   * @Returns: boolean Exists         
   */
  function checkCrypto(){
    if(is_dir($this->_PATH) && file_exists($this->_PATH.'/crypto.iv') && file_exists($this->_PATH.'/crypto.key')){
            return true;
       }else{
            return false;
       }
  }
  
  /* Function: generateCrypto
   * This function generates the key and iv needed by this class for encryption
   * ans decryption and writes them to the correct files. This should only need
   * to be called once, when setting up the system for the first time.
   * An optional passphrase can be specified for generating the key.
   * @Args: string Passphrase (optional)
   * @Returns: boolean Success               
   */   
  function generateCrypto($passphrase){
    // If there's no passphrase, make one up
    if($passphrase==''){
        $passphrase=md5(time().mt_rand());
    }
    // Make the IV
    $this->_IV = $this->generateIV();
    // Make the key
    $this->_KEY = $this->generateKey($passphrase);
    ///Do we have the crypto directory?
    if(!is_dir($this->_PATH)){
      mkdir($this->_PATH, 0755); //Make it if not
    }
    //Do we have the key file?
    if(!file_exists($this->_PATH.'/crypto.key')){
        // Make the file and write the key to disk
        $h = fopen($this->_PATH.'/crypto.key', 'x');
        if(!fwrite($h, $this->_KEY)){
          fclose($h); // Can't write, so close the handle and fail
          return false;
        }
        // Close the file and set permissions to read-only by non-owners
        fclose($h);
        chmod($this->_PATH.'/crypto.key', 0644);
    }
    //Do we have the IV file?
    if(!file_exists($this->_PATH.'/crypto.iv')){
        // Make the file and write the iv to disk
        $h = fopen($this->_PATH.'/crypto.iv', 'x');
        if(!fwrite($h, $this->_IV)){
          fclose($h); // Can't write, so close the handle and fail
          return false;
        }
        // Close the file and set permissions to read-only by non-owners
        fclose($h);
        chmod($this->_PATH.'/crypto.iv', 0644);
    }
    // Set the directory to read only by non-owners
    chmod($this->_PATH, 0644);
    return true; //Success!
  }
  
  
  /* Function: loadCrypto
   * This function loads the key and iv used by this class from their proper
   * files.
   * @Args: None
   * @Returns: boolean Success      
   */
  function loadCrypto(){
    if(file_exists($this->_PATH.'/crypto.iv')){
        $this->_IV = file_get_contents($this->_PATH.'/crypto.iv');
    }else{
        return false;
    }
    if(file_exists($this->_PATH.'/crypto.key')){
        $this->_KEY = file_get_contents($this->_PATH.'/crypto.key');
    }else{
        return false;
    }
    return true;
  }

	/* Function: getError
	 * This function returns the error variable.
	 * @Args: None
	 * @Returns: string Error	 
	 */  
  function getError(){
  	return $this->_ERROR;
	}
  
  /* Destructor
   * This function acts as out class deconstructor by cleaning up and shutting
   * down things left behind when we're done.
   * @Args: None
   * @Returns: None         
   */   
  function __destruct(){
    mcrypt_generic_deinit($this->_CIPHER);
    mcrypt_module_close($this->_CIPHER);
    unset($this->_CIPHER);
    unset($this->_KEY);
    unset($this->_IV);
  } 
}
?>
