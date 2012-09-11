<?php
/*
    Class: Crypto
    By: Justin Pearce
    Copyright © 2007 Agama Advertising, All Rights Reserved
    This class provides basic encryption/decryption methods to the user
    via the conspicuously named 'encrypt' and 'decrypt' functions.
*/

class Crypto{

/* Begin Variables */

/*
    cryptObj: Array variable for storing the cryptography objects used by the
    functions of this class.
*/
var $cryptObj=array();

// End Variables
/* Start Functions */

/*
    'Constructor' for Class: Crypto
    This initializes the crypto object and registers it's shutdown function
    @Args: string key (optional)
    @Returns: none
*/
function Crypto($key='mine hovercraft is full of eels'){
  /* Initialize the Crypto object class */
  $this->startCrypto($key);
  /* Set closing function for this class to be the endCrypto function */
  register_shutdown_function(array(&$this, 'endCrypto'));
}

/*
    Function: void startCrypto(string key)
    This function initializes the cryptography module for the class,
    using the provided key.
    @Args: string key
    @Returns: None
*/
function startCrypto($k){
    /* Load up AES equivalent encryption module */
    $crypto = mcrypt_module_open('rijndael-128', '', 'nofb', '');
    /* Create an initialization vector */
    if(isset($_SESSION['iv'])){
        $iv=$_SESSION['iv'];
    }else{
     if(!file_exists('classes/crypto/iv.rij128')){
        $iv=mcrypt_create_iv(mcrypt_enc_get_iv_size($crypto), MCRYPT_DEV_RANDOM);
        $_SESSION['iv']=$iv;
      }else{
          $iv=file_get_contents('classes/crypto/iv.rij128', FILE_BINARY);
      }
    }
      /* Get the key size for the algorithm*/
      $keysize=mcrypt_enc_get_key_size($crypto);
    if(!file_exists('classes/crypto/key.rij128')){
      /* Build a key */
      $key=substr(md5($k), 0, $keysize);
    }else{
      $key=substr(md5(file_get_contents('classes/crypto/key.rij128')), 0, $keysize);
    }
    $this->cryptObj=array('crypto' => $crypto, 'iv' => $iv, 'key' => $key);
}

/*
    Function: mixed encrypt(mixed data)
    This function takes the provided data and encrypts it, returning the
    encrypted data.
    @Args: mixed data
    @Returns: mixed crypt
*/
function encrypt($data){
    $cypher=$this->cryptObj;
    mcrypt_generic_init($cypher['crypto'], $cypher['key'], $cypher['iv']);
    $crypt=mcrypt_generic($cypher['crypto'], $data);
    mcrypt_generic_deinit($cypher['crypto']);
    return $crypt;
}

/*
    Function: mixed decrypt(mixed crypt)
    This function takes encrypted data and decrypts it, returning the decrypted
    data.
    @Args: mixed crypt
    @Returns: mixed data
*/
function decrypt($crypt){
    $cypher=$this->cryptObj;
    mcrypt_generic_init($cypher['crypto'], $cypher['key'], $cypher['iv']);
    $data=mcrypt_generic($cypher['crypto'], $crypt);
    mcrypt_generic_deinit($cypher['crypto']);
    return $data;
}

/*
    Function void endCrypto()
    This function closes the cryptography module and deleted the crypto
    objects. Used as a destructor for the class.
    Args: none
    Returns: none
*/
function endCrypto(){
    $cypher=$this->cryptObj;
    mcrypt_module_close($cypher['crypto']);
    unset($cypher);
    unset($this->cryptObj);
}

// End Functions

}
//End Class: Crypto

/*


~fin~


*/
?>