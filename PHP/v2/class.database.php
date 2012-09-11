<?php
/* class Database
 * This provides an API for interfacing with a MySQL database. It is to simplify
 * the connection process and data retrieval and storage without calling the
 * various PHP functions over and over and over...
 * By: Justin Pearce (whitefox@guardianfox.net)    
 */
class Database{
		var $_conn = '';
		var $_user = '';
		var $_host = '';
		var $_pass = '';
		var $_db = '';
		var $sql = '';
		var $_RESULTSET = '';
		
  /* Constructor
   * This takes the relavent information for connecting to a database, stores it
   * in the class object and connects to the database   
   */
		function __construct(){
			include(dirname(__FILE__).'/../config.php');
			$this->_user = $DBUSER;
			$this->_host = $DBHOST;
			$this->_pass = $DBPASS;
			$this->_db = $DBDB;
			$this->_conn=mysql_connect($this->_host, $this->_user, $this->_pass);
			if(!$this->_conn){
      	die('[Class: Database] Unable to connect to MySQL database!<br>The error returned was: '.mysql_error());
    	}else{
     	 	mysql_select_db($this->_db);
    	}	
		}
		
		/* Function query
		 * This function performs a database query using the provided SQL
		 * statement. It then sets the internal record set to the results.
		 * Upon success, it returns true otherwise it returns false.
		 * @Args: SQL statement
		 * @Returns: bool		 		 		 		 
		 */
		function query($q){
			$this->sql = $q;
			$res = mysql_query($this->sql);
			if($res){
				$this->_RESULTSET =& $res;
				return true;
			}else{
				return false;
			}
		}

		/* Function execute
		 * This function takes the provided SQL query and returns the result
		 * set directly, bypassing the internal record set.
		 * @Args: SQL statement
		 * @Returns: MySQL record set		 		 		 
		 */		
		function execute($q){
				return mysql_query($q, &$this->_conn);
		}
		
		/* Function getInsertId
		 * This function returns the insert id of the last INSERT statement
		 * on the database.
		 * @Args: None;
		 * @Returns: int		 		 		 
		 */
		function getInsertId(){
			return mysql_insert_id(&$this->_conn);
		}
		
		/* Function getNumRows
		 * This function returns the number of rows in the last result set.
		 * @Args: None
		 * @Returns: integer		 		 
		 */
		function getNumRows(){
			return mysql_num_rows(&$this->_RESULTSET);
		}
		
		/* Function getObjectList
		 * Following the query() command, this function returns the result set
		 * as an array of objects from the database.
		 * @Args: None
		 * @Returns: Array objects		 		 		 
		 */
		function getObjectList(){
			$list = array();
			if($this->_RESULTSET){
				while($row=mysql_fetch_object(&$this->_RESULTSET, &$this->_conn)){
					array_push($list, $row);
				}
				return $list;
			}else{
				return false;
			}
		}
		
		/* Function getArrayList
		 * Following the query() command, this function returns the result set
		 * as an array of arrays from the database.
		 * @Args: None
		 * @Returns: Array array		 		 		 
		 */
		function getArrayList(){
			$list = array();
			if($this->_RESULTSET){
				while($row=mysql_fetch_array(&$this->_RESULTSET, &$this->_conn)){
					array_push($list, $row);
				}
				return $list;
			}else{
				return false;
			}
		}

		/* Function getResource
		 * This function simply returns a reference to the result set resource stored
		 * in the class object.
		 * @Args: None;
		 * @Returns resource Results         
		 */
		function getResource(){
		  return $this->_RESULTSET;
		}
		
		/* Function: getConnection
		 * This function simply returns a reference to the connection object within
		 * this class.
		 * @Args: None
		 * @Returns: resource Connection         
		 */
		function getConnection(){
		  return $this->_conn;
		}
		
		/* Function: getError
		 * This function returns the last error raised by the MySQL server
		 * @Args: None
		 * @Results: string Error      
		 */
		function getError(){
		  return '[Class: Database] '.mysql_error();
		}
		
	  /* Function: getServerStats
	   * This returns an associative array containing the values for various
	   * server statistics.
	   * @Args: None
	   * @Returns: array Stats          
	   */
	  function getServerStats(){
	    $stats = explode(':', mysql_stat(&$this->_conn));
	    return array('uptime'=>trim($stats[1]), 'threads'=>trim($stats[3]), 'quieres'=>trim($stats[5]), 
	                 'slow queries'=>trim($stats[7]), 'opens'=>trim($stats[9]), 'flush tables'=>trim($stats[11]), 
	                 'open tables'=>trim($stats[13]), 'quieries per second avg'=>trim($stats[15]));
	  }
	  
	  /* Function: getQueryInfo
	   * This returns a string of information related to the last query executed
	   * against the database.
	   * @Args: None
	   * @Returns string Info         
	   */
	  function getQueryInfo(){
	    return mysql_info(&$this->_conn);
	  }
	  
		/* Destructor
		 * Free resources that were initialized and close the database
		 */
		function __destruct(){
			unset($this->sql);                                                 
			unset($this->_RESULTSET);
			mysql_close($this->_conn);
			unset($this->_conn);
		} 
}
?>