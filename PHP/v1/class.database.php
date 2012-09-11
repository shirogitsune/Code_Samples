<?php
/*
    Class: Database
    By: Justin Pearce
    Copyright © 2007 Agama Advertising, All Rights Reserved
    This class provides basic access to a MySQL database.
*/

class Database{

 /* Start Variables */
  var $CONNECTION; //<- This holds the connection resource for the class
  var $DATASET; //<- This holds the returned data set for the class functions
  var $ERROR; //<- Holder for the last error
 // End Variables

 /* Start Functions */

 /*
    'Constructor': Database
    This initializes the database class object
 */
  function Database($host, $user, $pass, $db){
    $this->CONNECTION = mysql_pconnect($host, $user, $pass);
    mysql_select_db($db);
    register_shutdown_function(array(&$this, 'closeDB'));
  }

  /*
    Function: query
    This function takes the provided SQL query and executes it against the database
    and stores the result set in the object.
    @Args: string SQL Query
    @Returns: boolean Successful
  */
  function query($SQL){
    $temp = mysql_query($SQL, $this->CONNECTION);
    if(($error=mysql_error($this->CONNECTION))!=''){
        $this->ERROR=$error;
        return false;
    }else{
        $this->DATASET = $temp;
        return true;
    }
  }

  /*
    Function: execute
    This function takes the provided SQL query and executes it against the database
    @Args: string SQL Query
    @Returns: resource MySQL Dataset or false on failure
  */
  function execute($SQL){
    $temp = mysql_query($SQL, $this->CONNECTION);
    if(($error=mysql_error($this->CONNECTION))!=''){
        $this->ERROR=$error;
        return false;
    }else{
        return $temp;
    }
  }

  /*
    Function: getResult
    This function returns this objects dataset object.
    @Args: none
    @Returns: resource MySQL Dataset
  */
  function getResult(){
    return $this->DATASET;
  }
  
  /*
    Function: getError
    This function returns the last error this object encountered when
    communicating with the database.
    @Args: none
    @Returns: string Error
  */
  function getError(){
    return $this->ERROR;
  }

  /*
    Function: getInsertId
    This function returns the id returned by the database upon inserting a record
    into the database. This is helpful when we are adding records and need to
    know the id without querying the database.
    @Args: none
    @Returns: int getInsertId
  */
  function getInsertId(){
    return mysql_insert_id($this->CONNECTION);
  }

  /*
    Function: getObjectList
    This function returns an array of object pulled from this objects result set
    @Args: none
    @Returns: array Objects
  */
  function getObjectList(){
    $values=array();
    if($this->DATASET)
    while($row=mysql_fetch_object($this->DATASET)){
        array_push($values, $row);
    }
    return $values;
  }

  /*
    Function: getConnection
    This function returns the current connection object of this class
    @Args: none
    @Returns: resource MySQL Connection Object
  */
  function getConnection(){
    return $this->CONNECTION;
  }

  /*
    Function scrubArray
    This function takes a provided array and escapes the values of the array
    for use in a MySQL database table. Returns false of the provided data is not
    an array.
    @Args: array arr
    @Returns: array arr or boolean false if arr is not an array
  */
  function scrubArray($arr){
      if(is_array($arr)){
          if(get_magic_quotes_gpc()){
              $arr=array_map('stripslashes', $arr);
          }
          $arr=array_map('mysql_real_escape_string', $arr);
          return $arr;
        }else{
          return false;
        }
  }

  /*
    Function scrubVar
    This function takes a provided value and escapes the value for use in a
    MySQL database table.
    @Args: mixed var
    @Returns: mixed var
  */
  function scrubVar($var){
        if(get_magic_quotes_gpc()){
            $var=stripslashes($var);
        }
        if(!is_numeric($var)){
            $var=mysql_real_escape_string($var);
        }
    return $var;
  }

  /*
    Function: closeDB
    This function closes the DB resource. It is used as the destructor for
    this class.
    @Args: none
    @Returns: none
  */
  function closeDB(){
    unset($this->DATASET);
    unset($this->CONNECTION);
  }
 // End Functions

}
// End Class: Database
/*

~fin~

*/
?>