/**
 * Modules to handle client side scripting for Automation data provider interface
 * The modules included in this file:
 *
 * - TestPackages
 * - TestClasses
 * - TestMethods
 * - TestMethod
 * - TestCaseSamples
 * - TestCaseSample
 *
 * These modules constitute the data models / data providers for the UI interface
 * @author Justin Pearce <jpearce@eastbay.com>
 */
 
//Use Strict interpreter rules
"use strict";

/**
 * TestPackages
 * Represents a collection of packages.
 * @param args - An object of options to be passed to the constructor.
 */
var TestPackages = function (args) {
	var options = args || {};
	if (this instanceof TestPackages) {
		if (typeof options.prefix !== 'undefined') {
			this.prefix = options.prefix;
		}
		this.getAllPackages();
	} else {
		return new TestPackages(options);
	}
}
//Class Definition
TestPackages.prototype = {
	constructor : TestPackages,
	serviceEndpoint : '/testcases-service-rest/testpackages',
	packagePrefix : 'com.fleb.qaautomation.testcases.',
	name : 'Packages',
	key : 'packageName',
	//Definition for was a row looks like
	definition : {
		"key" : "name",
		"name" : ""
	},
	//Local persistence cache for he model
	packages : [],
	/**
	 * Requests a list of all packages.
	 * @throws Exception on server error.
	 */
	getAllPackages : function () {
		var obj = this;
		$.ajax({
			context : obj,
			url : System.Url + obj.serviceEndpoint + '/',
			method : 'GET',
			contentType : 'application/json',
			cache : false,
			async : false
		}).done(function (data) {
			//Set the local persistence cache
			obj.packages = [];
			if($.isArray(data)) {
				for (var i = 0; i < data.length; i++) {
					obj.packages.push({"name":data[i]});
				}
			}
		}).fail(function (xhr, status, error) {
			var reply = JSON.parse(xhr.responseText);
			var responseMessage = reply.status + ' ' + reply.error + ': ' + reply.exception + ': ' + reply.message;
			throw new Error("Error getting package list. Server replied: " + responseMessage );
		});
	},
	/**
	 * Forces the object to refresh it's data content
	 * @returns boolean success / failure
	 */
	refresh : function () {
		try {
			this.getAllPackages();
			return true;
		} catch (ex) {
			return false;
		}
	},
	/**
	 * Get the data contained within as an array
	 * @returns Array of data members
	 */
	toArray : function () {
		return this.packages;
	},
	/**
	 * Requests a package of the given name be added by the service and, on success,
	 * updates the client side data.
	 * @param packageName - The name of the package to be added.
	 * @throws Exception on existing package or server error.
	 */
	add : function (packageObj) {
		var obj = this;
		var newPackageName = packageObj.name;
		//Test for valid package name
		obj.validate(newPackageName);		
		$.ajax({
			context : obj,
			url : System.Url + obj.serviceEndpoint + '/',
			cache : false,
			async : false,
			method : 'POST',
			contentType : 'application/json',
			mimeType : 'text/html',
			data : JSON.stringify({"packageName" : newPackageName})
		}).done(function (data) {
			return obj.refresh();
		}).fail(function (xhr, status, error) {
			var reply = JSON.parse(xhr.responseText);
			var responseMessage = reply.status + ' ' + reply.error + ': ' + reply.exception + ': ' + reply.message;
			throw new Error("Error adding package " +newPackageName +". Server replied: " + responseMessage );
		});
	},
	/**
	 * Requests an update to the package identified by the provided id and, on success,
	 * update the client side data.
	 * @param id - The id of the package to update.
	 * @param packageObj - The name of the package to update.
	 * @throws
	 */
	update : function (id, packageObj) {
		var obj = this;
		var updatePackageName = packageObj.name;
		//Test for valid package name
		obj.validate(updatePackageName);	
		$.ajax({
			context : obj,
			url : System.Url + obj.serviceEndpoint + '/?packageName=' + id,
			cache : false,
			async : false,
			method : 'PUT',
			contentType : 'application/json',
			mimeType : 'text/html',
			data : JSON.stringify({"packageName" : packageObj.name})
		}).done(function (data) {
			return obj.refresh();
		}).fail(function (xhr, status, error) {
			var reply = JSON.parse(xhr.responseText);
			var responseMessage = reply.status + ' ' + reply.error + ': ' + reply.exception + ': ' + reply.message;
			throw new Error("Error updating package " + packageObj.name + ". Server replied: " + responseMessage );
		});
	},
	/**
	 * Requests a package be deleted by the service and, on success, deletes it
	 * client side.
	 * @param id - The id of the package to delete.
	 * @throws Exception on invalid id or server error.
	 */
	remove : function (id) {
		var obj = this;
		$.ajax({
			context : obj,
			url : System.Url + obj.serviceEndpoint + '/?packageName=' + id,
			cache : false,
			async : false,
			method : 'DELETE',
			mimeType : 'text/html'
		}).done(function (data) {
			return obj.refresh();
		}).fail(function (xhr, status, error) {
			var reply = JSON.parse(xhr.responseText);
			var responseMessage = reply.status + ' ' + reply.error + ': ' + reply.exception + ': ' + reply.message;
			throw new Error("Error removing package " + id + ". Server replied: " + responseMessage );
		});
	},
	/**
	 * Run various validation criteria against the provided name and raise an exception if 
	 * any of those criteria fail.
	 * @param packageName - The mane of the package to validate against.
	 * @returns True if all criteria pass
	 * @throws Exception of any criteria fail.
	 */
	validate : function (packageName) {
		var nameCheck = new RegExp('^(' + this.packagePrefix.replace('/\./g', '\.') + ')', 'm');
		if (packageName.trim().length < 1) {
			throw new Error("Package name parameter must have one or more non-whitespace characters!"); 
		}
		if (!nameCheck.test(packageName)) {
			throw new Error("Packages must start with " + this.packagePrefix);
		}
		//Iterate over the local persistence cache to determine if the name exists
		for (var i = 0; i < this.packages.length; i++) {
			if (this.packages[i].name === packageName) {
				throw new Error("Package " + packageName + " already exists!");
			}
		}
		return true;
	}
};
//End TestPackages

/**
 * TestClasses
 * Represents a collection of classes associated with a given package id.
 * @param args - An object containing parameters for the constructor. Passing an
 * object with packageId loads all the classes for that given package id.
 */
var TestClasses = function (args) {
	var options = args || {};
	if (this instanceof TestClasses) {
		this.packageName = options.packageName;
		if (typeof this.packageName != 'undefined') {
			this.getClassesByPackageName(this.packageName);
		}
		if (typeof options.prefix !== 'undefined') {
			this.prefix = options.prefix;
		}
	} else {
		return new TestClasses(options);
	}
};
//Class definition
TestClasses.prototype = {
	constructor : TestClasses,
	serviceEndpoint : '/testcases-service-rest/testclasses',
	name : 'Classes',
	key : 'className',
	//Definition for was a row looks like
	definition : {
		"key" : "name",
		"name" : "",
		"id" : ""
	},
	packageName : undefined,
	classesForPackage : [],
	/**
	 * Gets the the classes for a given package identified by the provided id.
	 * @param name - The name of the package to get classes for.
	 * @throws Exception on invalid name or server error.
	 */
	getClassesByPackageName : function (name) {
		var obj = this;
		$.ajax({
			context : obj,
			url : System.Url + obj.serviceEndpoint + '/?packageName=' + name,
			method : 'GET',
			contentType : 'application,json',
			cache : false,
			async : false
		}).done(function (data) {
			//Set the local persistence cache
			obj.classesForPackage = [];
			obj.packageName = name;
			if($.isArray(data)) {
				for (var i = 0; i < data.length; i++) {
					if(data[i] !== '') {
						obj.classesForPackage.push({"name":data[i], "id":obj.packageName+"+"+data[i]});
					}
				}
			}
		}).fail(function (xhr, status, error) {
			var reply = JSON.parse(xhr.responseText);
			var responseMessage = reply.status + ' ' + reply.error + ': ' + reply.exception + ': ' + reply.message;
			throw new Error("Error getting classes for package " + name + ". Server replied: " + responseMessage );
		});
	},
	/**
	 * Forces the object to refresh it's data content
	 * @returns boolean success / failure
	 */
	refresh : function () {
		try {
			this.getClassesByPackageName(this.packageName);
			return true;
		} catch (ex) {
			return false;
		}
	},
	/**
	 * Get the data contained within as an array
	 * @returns Array of data members
	 */
	toArray : function () {
		return this.classesForPackage;
	},
	/**
	 * Requests a class of the given name be added and, on success, adds the class
	 * client side.
	 * @param className - The name of the class to add.
	 * @throws Exception of duplicate class name or server error.
	 */
	add : function (classObj) {
		var obj = this;
		var className = classObj.name;
		//Test for valid class name
		obj.validate(className);
		$.ajax({
			context : obj,
			url : System.Url + obj.serviceEndpoint + '/?packageName=' + obj.packageName,
			cache : false,
			async : false,
			method : 'POST',
			contentType : 'application/json',
			mimeType : 'text/html',
			data : JSON.stringify({"packageName":obj.packageName ,"className":className})
		}).done(function (data) {
			//Update the record with the returned id and add it to the local cache
			return obj.refresh();
		}).fail(function (xhr, status, error) {
			var reply = JSON.parse(xhr.responseText);
			var responseMessage = reply.status + ' ' + reply.error + ': ' + reply.exception + ': ' + reply.message;
			throw new Error("Error adding class " + className + " for package " + obj.packageName + 
							". Server replied: " + responseMessage );
		});
	},
	/**
	 * Requests the server update the class at the specified id.
	 * @param id - The id of he class to update.
	 * @param classObj - The name to update the class to.
	 * @throws Exception if the server returns an error.
	 */
	update : function (id, classObj) {
		var obj = this;
		var className = classObj.name;
		//Test for valid class name
		obj.validate(className);
		$.ajax({
			context : obj,
			url : System.Url + obj.serviceEndpoint + '/?packageName=' + obj.packageName + '&className='+id.split('+')[1],
			cache : false,
			async : false,
			method : 'PUT',
			contentType : 'application/json',
			mimeType : 'text/html',
			data : JSON.stringify({"packageName":obj.packageName, "className" : classObj.name})
		}).done(function (data) {
			return obj.refresh();
		}).fail(function (xhr, status, error) {
			var reply = JSON.parse(xhr.responseText);
			var responseMessage = reply.status + ' ' + reply.error + ': ' + reply.exception + ': ' + reply.message;
			throw new Error("Error updating class " + classObj.name + ". Server replied: " + responseMessage );
		});
	},
	/**
	 * Requests the specified class to be removed.
	 * @param id - The identifier for this class
	 * @throws Exception if the server returns an error.
	 */
	remove : function (id) {
		var obj = this;
		$.ajax({
			context : obj,
			url : System.Url + obj.serviceEndpoint + '/?packageName=' + obj.packageName + '&className='+id.split('+')[1],
			cache : false,
			async : false,
			method : 'DELETE',
			contentType : 'application/json',
			mimeType : 'text/html'
		}).done(function (data) {
			return obj.refresh();
		}).fail(function (xhr, status, error) {
			var reply = JSON.parse(xhr.responseText);
			var responseMessage = reply.status + ' ' + reply.error + ': ' + reply.exception + ': ' + reply.message;
			throw new Error("Error deleting class. Server replied: " + responseMessage );
		});
	},
	/**
	 * Tests the provided class name against certain criteria and throw an exception on failure
	 * of any criteria.
	 * @param className - The name of the class to test against.
	 * @returns True on passing all criteria
	 * @throws Exception of failing any criteria
	 */
	validate : function (className) {
		if(className.trim().length < 1) {
			throw new Error("Class name parameter must have one or more non-whitespace characters!"); 
		}
		//Search the local cache for an existing record to prevent duplicates
		for (var i = 0; i < this.classesForPackage.length; i++) {
			if (this.classesForPackage[i].name === className) {
				throw new Error("Class " + className + " already exists!");
			}
		}
		return true;
	}
};
//End TestClasses

/**
 * TestMethods
 * Represents a collection of methods associated with a given class id.
 * @param args - An object containing parameters for the constructor. Passing an
 * object with classId loads all the methods for that given class id.
 */
var TestMethods = function (args) {
	var options = args || {};
	if (this instanceof TestMethods) {
		this.packageId = options.packageId;
		this.classId = options.classId;
		if (typeof this.packageId != 'undefined' && typeof this.classId != 'undefined') {
			this.getMethods(this.packageId, this.classId);
		}
		if (typeof options.prefix !== 'undefined') {
			this.prefix = options.prefix;
		}
	} else {
		return new TestMethods(options);
	}
};
//Class definition
TestMethods.prototype = {
	constructor : TestMethods,
	serviceEndpoint : '/testcases-service-rest',
	name : 'Methods',
	key : 'methodName',
	prefix : 'QaAutomation',
	//Definition for was a row looks like
	definition : {
		"key" : "name",
		"name" : "",
		"id" : ""
	},
	packageId : undefined,
	classId : undefined,
	methodsForClass : [],
	/**
	 * Gets a collection of methods associated with a class indicated by the specified id.
	 * @param packageId - The identifier for he package
	 * @param classId - The identifier for the class
	 * @throws Exception if the server returns an error.
	 */
	getMethods : function (packageId, classId) {
		var obj = this;
		$.ajax({
			context : obj,
			url : System.Url + obj.serviceEndpoint + '/testmethods/?packageName=' + packageId + '&className='+ classId,
			cache : false,
			async : false,
			method : 'GET',
			contentType : 'application/json'
		}).done(function (data) {
			//Set the local persistence cache to the returned data.
			obj.methodsForClass = [];
			obj.packageId = packageId;
			obj.classId = classId;
			if ($.isArray(data)) {
				for (var i = 0; i < data.length; i++) {
					obj.methodsForClass.push({"name":data[i], "id":packageId+"+"+classId+"+"+data[i]});
				}
			}
		}).fail(function (xhr, status, error) {
			var reply = JSON.parse(xhr.responseText);
			var responseMessage = reply.status + ' ' + reply.error + ': ' + reply.exception + ': ' + reply.message;
			throw new Error("Error getting methods for class " + classId + ". Server replied: " + responseMessage );
		});
	},
	/**
	 * Forces the object to refresh it's data content
	 * @returns boolean success / failure
	 */
	refresh : function () {
		try {
			this.getMethods(this.packageId, this.classId);
			return true;
		} catch (ex) {
			return false;
		}
	},
	/**
	 * Get the data contained within as an array
	 * @returns Array of data members
	 */
	toArray : function () {
		return this.methodsForClass;
	},
	/**
	 * Requests the service create a method for the provided name and, if successful, add
	 * the new method to the client side records.
	 * @param methodName - The name of the method to create.
	 * @throws Exception on duplicate method name or server error.
	 */
	add : function (methodObj) {
		var obj = this;
		var key = obj.prefix + '-';
		var methodName = methodObj.name;
		//Test for valid method name
		obj.validate(methodName);
		//Build out method key by appending to the prefix
		key += obj.packageId + '-' + obj.classId + '-' + methodName
		$.ajax({
			context : obj,
			url : System.Url + obj.serviceEndpoint + '/testmethods/?packageName=' + obj.packageId + '&className=' + obj.classId,
			cache : false,
			async : false,
			method : 'POST',
			contentType : 'application/json',
			mimeType : 'text/html',
			data : JSON.stringify({"packageName":obj.packageId,"className":obj.classId,"methodName":methodName})
		}).done(function (data) {
			//Set the object id to the returned id and add it to the local cache
			return obj.refresh();
		}).fail(function (xhr, status, error) {
			var reply = JSON.parse(xhr.responseText);
			var responseMessage = reply.status + ' ' + reply.error + ': ' + reply.exception + ': ' + reply.message;
			throw new Error("Error adding method for class " + obj.classId + ". Server replied: " + responseMessage );
		});
	},
	/**
	 * Requests the service delete the method identified by the provided it and, if the
	 * service deletes the record, delete the client side record.
	 * @param id - The id of the record to delete.
	 * @throws Exception on server error.
	 */
	remove : function (id) {
		var obj = this;
		var key = obj.prefix + '-' + id.replace(/\+/g, '-');
		$.ajax({
			context : obj,
			url : System.Url + obj.serviceEndpoint + '/' + key,
			cache : false,
			async : false,
			method : 'DELETE',
			contentType : 'application/json',
			mimeType : 'text/html'
		}).done(function (data) {
			//Force update of local cache
			return obj.refresh();
		}).fail(function (xhr, status, error) {
			var reply = JSON.parse(xhr.responseText);
			var responseMessage = reply.status + ' ' + reply.error + ': ' + reply.exception + ': ' + reply.message;
			throw new Error("Error deleting method. Server replied: " + responseMessage );
		});
	},
	/**
	 * Test the provided method name against certain criteria and throw an exception if any one
	 * of those criteria fail.
	 * @param methodName - The name of the method to test against
	 * @returns True if all criteria pass
	 * @throws Exception if any criteria fail.
	 */
	validate : function (methodName) {
		if(methodName.trim().length < 1) {
			throw new Error("Method name parameter must have one or more non-whitespace characters!"); 
		}
		//Iterate over the local persistence cache to check for duplicates.
		for (var i = 0; i < this.methodsForClass.length; i++) {
			if (this.methodsForClass[i].name === methodName) {
				throw new Error("Method " + methodName + " already exists!");
			}
		}
		return true;
	}
};
//End TestMethods

/**
 * TestMethod
 * Represents a single instance of a test method.
 * @param args - An object containing parameters for the constructor. The following
 * parameters are used by the constructor:
 *		- id  : The id of the method to be loaded by the constructor.
 *		- name: The method's name (optional).
 * 		- data: The complete object representation of the method (optional).
 */
var TestMethod = function (args) {
	var options = args || {};
	if (this instanceof TestMethod) {
		this.methodId = options.methodId;
		this.classId = options.classId;
		this.packageId = options.packageId;
		this.data = options.data || {};
		if (typeof this.methodId != 'undefined' &&
			typeof this.classId != 'undefined' &&
			typeof this.packageId != 'undefined') {
			this.getMethod(this.methodId, this.classId, this.packageId);
		}
		if (typeof options.prefix !== 'undefined') {
			this.prefix = options.prefix;
		}
	} else {
		return new TestMethod(options);
	}
}
//Class definition
TestMethod.prototype = {
	constructor : TestMethod,
	serviceEndpoint : '/testcases-service-rest',
	id : undefined,
	methodId : undefined,
	classId : undefined,
	packageId : undefined,
	name : '',
	prefix : 'QaAutomation',
	//Definition for was a row looks like (in this case, each of the parameters
	definition : {
		"key" : "name",
		"name" : "",
		"dataType" : {
			"String" : "java.lang.String",
			"Assertion" : "java.util.Map"
		},
		"ordinal" : "#"
	},
	data : {},
	/**
	 * Requests the data from the server for the method defined.
	 * @param id - The id of the method to load.
	 * @throws Exception on invalid id or server error.
	 */
	getMethod : function (methodId, classId, packageId) {
		var obj = this;
		var key = obj.prefix + '-' + packageId + '-' + classId + '-' + methodId;
		$.ajax({
			context : obj,
			url : System.Url + obj.serviceEndpoint + '/' + key + '/',
			method : 'GET',
			cache : false,
			async : false,
			contentType : 'application/json'
		}).done(function (data) {
			//Set up the model with the returned data.
			obj.data = data;
			if (!$.isArray(obj.data.parameters)) {
				obj.data.parameters = [];
			}
			if (!$.isArray(obj.data.samples)) {
				obj.data.samples = [];
			}
			obj.name = data.methodName;
			obj.id = key;
		}).fail(function (xhr, status, error) {
			var reply = JSON.parse(xhr.responseText);
			var responseMessage = reply.status + ' ' + reply.error + ': ' + reply.exception + ': ' + reply.message;
			throw new Error("Error getting method " + methodId + ". Server replied: " + responseMessage );
		});
	},
	/**
	 * Requests the provided parameter be added to the method.
	 * @param paramObj - An object representing the parameter to be added
	 * @throws Exception on duplicate parameter or server error.
	 */
	add : function (paramObj) {
		var obj = this;
		var parameter, typeName;
		obj.validate(paramObj);
		for(var key in obj.definition.dataType){
			if (obj.definition.dataType[key] === paramObj.dataType) {
				typeName = key;
			}
		}
		parameter= {"name":paramObj.name,
					"dataType":{"className":paramObj.dataType,
								"displayName":typeName},
					"ordinal":(obj.data.parameters.length + 1).toString()};
		obj.data.parameters.push(parameter);
		$.ajax({
			context : obj,
			url : System.Url + obj.serviceEndpoint + '/' + obj.id + '/method/',
			method : 'PUT',
			cache : false,
			async : false,
			contentType : 'application/json',
			mimeType : 'text/html',
			data : JSON.stringify(obj.data)
		}).done(function (data) {
				return obj.refresh();
		}).fail(function (xhr, status, error) {
			var reply = JSON.parse(xhr.responseText);
			var responseMessage = reply.status + ' ' + reply.error + ': ' + reply.exception + ': ' + reply.message;
			throw new Error("Error adding parameter to method. Server replied: " + responseMessage );
		});
	},
	/**
	 * Send an update request to the service and, on success, update the client data.
	 * @param id - The identifier of the test parameter row to update
	 * @param updateObj - The test parameter row to update.
	 * @returns true/false on success/failure
	 */
	update : function (id, updateObj) {
		var obj = this;
		var parameter = {}, typeName = '';
		//Test for valid parameter name.
		if (typeof updateObj !== 'undefined') {
			obj.validate(updateObj);
		}
		//If there's an id provided, we're updating a specific parameter
		if (typeof id !== 'undefined') {
			//Locate the parameter to update in the cache and update it
			var locator = obj.definition.key || 'id';
			for (var i = 0; i < obj.data.parameters.length; i++) {
				if (obj.data.parameters[i][locator] == id) {
					
					for (var key in obj.definition.dataType) {
						if (obj.definition.dataType[key] == updateObj.dataType) {
							typeName = key;
						}
					}
					parameter = {"name":updateObj.name,
								 "dataType":{"className":updateObj.dataType,
											 "displayName":typeName},
								 "ordinal":updateObj.ordinal.toString()
								};
								
					obj.data.parameters[i] = parameter;
				}
			}
		}
		obj.data.methodName = obj.name;	
		obj.data.methodId = obj.name;
		//Send the update.
		$.ajax({
			context : obj,
			url : System.Url + obj.serviceEndpoint + '/' + obj.id + '/method/',
			cache : false,
			async: false,
			method : 'PUT',
			contentType : 'application/json',
			mimeType : 'text/html',
			data : JSON.stringify(obj.data)
		}).done(function (data) {			
			return obj.refresh();
		}).fail(function (xhr, status, error) {
			var reply = JSON.parse(xhr.responseText);
			var responseMessage = reply.status + ' ' + reply.error + ': ' + reply.exception + ': ' + reply.message;
			throw new Error("Error updating method " + obj.name + ". Server replied: " + responseMessage );
		});
	},
	/**
	 * Refresh the data for this instance.
	 * @returns Boolean on success/failure
	 */
	refresh : function () {
		try {
			this.getMethod(this.methodId, this.classId, this.packageId);
			return true;
		} catch (ex) {
			return false;
		}
	},
	/**
	 * Get the data contained within the TestParameters as an array
	 * @returns Array of data members
	 */
	toArray : function () {
		//Send only the test parameters array.
		return this.data.parameters;
	},
	/**
	 * Remove a Test Parameter from the internal record. Requires and update
	 * be run to save the changes.
	 * @param id - The id of the parameter to remove.
	 */
	remove : function (id) {
		var obj = this;
		//Search the test parameters for the requested item and remove it form the cache.
		var locator = obj.definition.key || 'id';
		for (var i = 0; i < obj.data.parameters.length; i++) {
			if (obj.data.parameters[i][locator] === id) {
				obj.data.parameters.splice(i, 1);
			}
		}
		obj.reorder(obj.data.parameters, 'ordinal');
		obj.update();
	},
	/**
	 * Reorder the incoming array of row objects by the specified numeric column.
	 * @param rows - The rows of parameter objects to be reordered.
	 * @param orderBy - The name of the ordinal value to be ordered by.
	 */
	reorder : function (rows, orderBy) {
		var obj = this;
		var newOrder = [];
		//Update the row's order by column (Ordinal) by their position in the array.
		for (var i = 0; i < rows.length; i++) {
			var row = rows[i];
			//Because dataType can be an object, we have to parse it as such.
			var dataType = '';
			var dataDisplay = '';
			if ($.isPlainObject(row.dataType)) {
				dataType = row.dataType.className;
			} else {
				dataType = row.dataType;
			}
			//Get the defined display name for that type.
			for (var key in obj.definition.dataType) {
					if (obj.definition.dataType[key] === dataType) {
						dataDisplay = key;
					}
			}
			
			row[orderBy] = (i + 1).toString();
			row.dataType = {"className" : dataType, 
							"displayName":dataDisplay };
			newOrder[row[orderBy] - 1] = rows[i];
		}
		//Update the local cache
		obj.data.parameters = newOrder;
	},
	/**
	 * Searches through the parameters for this method to determine if the method has
	 * an Assertion set defined or not.
	 * @returns Boolean on existence of Assertion set.
	 */
	hasAssertions : function () {
		var obj = this;
		if (typeof obj.data.parameters !== 'undefined' && obj.data.parameters !== null) {
			for (var i = 0; i < obj.data.parameters.length; i++) {
				if (obj.data.parameters[i].dataType.displayName === 'Assertion') {
					return true;
				}
			}
		} else {
			return false;
		}
	},
	/**
	 * Test that the provided parameter name meets a certain criteria and throws an exception 
	 * if any of those criteria fail.
	 * @param parameterName - The name of the parameter to test.
	 * @returns True if all criteria pass
	 * @throws Exception if any criteria fail.
	 */
	validate : function (parameterObj) {
		if(parameterObj.name.trim().length < 1) {
			throw new Error("Parameter name must have one or more non-whitespace characters!"); 
		}
		//Search the local cache to determine if this exists already.
		for (var i = 0; i < this.data.parameters.length; i++) {
			if (this.data.parameters[i].name === parameterObj.name && 
					parseInt(this.data.parameters[i].ordinal, 10) !== parseInt(parameterObj.ordinal, 10)) {
				throw new Error("Parameter " + parameterObj.name + " already exists!");
			}
		}
		return true;
	}
};
//End TestMethod

/**
 * TestCaseSamples
 * Represents a collection of test case samples.
 */
var TestCaseSamples = function (args) {
	var options = args || {};
	if (this instanceof TestCaseSamples) {
		this.packageId = options.packageId;
		this.classId = options.classId;
		this.methodId = options.methodId;
		if (typeof this.packageId != 'undefined' && typeof this.classId != 'undefined' && typeof this.methodId != 'undefined') {
			this.getTestCaseSamples(this.packageId, this.classId, this.methodId);
		}
		if (typeof options.prefix !== 'undefined') {
			this.prefix = options.prefix;
		}
	} else {
		return new TestCaseSamples(options);
	}
};
// Class Definition
TestCaseSamples.prototype = {
	constructor : TestCaseSamples,
	serviceEndpoint : '/testcases-service-rest',
	name : 'Samples',
	prefix : 'QaAutomation',
	//Definition for was a row looks like (in this case, each of the parameters
	definition : {
		"id" : "",
		"name" : "",
		"ordinal" : "#"
	},
	packageId : undefined,
	classId : undefined,
	methodId : undefined,
	samplesForMethod : [],
	data : {},
	/**
	 * Requests test case samples for a given method, class, package
	 */
	getTestCaseSamples : function (packageId, classId, methodId) {
		var obj = this;
		var key = obj.prefix + '-' + packageId + '-' + classId + '-' + methodId;
		$.ajax({
			context : obj,
			url : System.Url + obj.serviceEndpoint + '/' + key + '/',
			method : 'GET',
			cache : false,
			async : false,
			contentType : 'application/json'
		}).done(function (data) {
			//Update the model with the returned data.
			obj.data = data;
			obj.samplesForMethod = [];
			if ($.isArray(data.samples)) {
				for ( var i=0; i < data.samples.length; i++) {
					var sample = data.samples[i];
					sample.id = packageId + '+' + classId + '+' + methodId + '+' + sample.ordinal;
					obj.samplesForMethod.push(sample);
				}
			}
		}).fail(function (xhr, status, error) {
			var reply = JSON.parse(xhr.responseText);
			var responseMessage = reply.status + ' ' + reply.error + ': ' + reply.exception + ': ' + reply.message;
			throw new Error("Error getting samples for method " + methodId + ". Server replied: " + responseMessage );
		});
	},
	/**
	 * Forces the object to refresh it's data content
	 * @returns boolean success / failure
	 */
	refresh : function () {
		try {
			this.getTestCaseSamples(this.packageId, this.classId, this.methodId);
			return true;
		} catch (ex) {
			return false;
		}
	},
	/**
	 * Get the data contained within as an array
	 * @returns Array of data members
	 */
	toArray : function () {
		return this.samplesForMethod;
	},
	/**
	 * Requests that a test case sample of the given name be added by the service and,
	 * on success, update the client side view.
	 * @param testCaseName - The the name desired by for the test case.
	 * @throws Exception on existing test case name or server error.
	 */
	add : function (sampleObj) {
		var obj = this;
		var sampleName = sampleObj.name;
		var sample;
		//Test for valid sample name
		obj.validate(sampleName);
		//Build out the sample object (minus the artificial id)
		sample = {"name":sampleName,
				  "ordinal":(obj.samplesForMethod.length + 1).toString(),
				  "arguments":[] };
		//Update the internal cache
		obj.samplesForMethod.push(sample);
		obj.data.samples = obj.samplesForMethod;
		$.ajax({
			context : obj,
			url : System.Url + obj.serviceEndpoint + '/' + obj.data.key + '/samples/',
			method : 'PUT',
			cache : false,
			async : false,
			contentType : 'application/json',
			mimeType : 'text/html',
			data : JSON.stringify({"samples":obj.samplesForMethod})
		}).done(function (data) {
			//Update the object with the returned id and update the local cache
			return obj.refresh();
		}).fail(function (xhr, status, error) {
			var reply = JSON.parse(xhr.responseText);
			var responseMessage = reply.status + ' ' + reply.error + ': ' + reply.exception + ': ' + reply.message;
			throw new Error("Error adding sample " + sampleObj.name + ". Server replied: " + responseMessage );
		});
	},
	/**
	 * Update the list of samples
	 * @returns Boolean success/failure
	 */
	update : function () {
		var obj = this;
		var samples = [];
		obj.data.samples = [];
		for (var i = 0; i < obj.samplesForMethod.length; i++) {
			var sample = {"name":obj.samplesForMethod[i].name,
						  "ordinal":obj.samplesForMethod[i].ordinal,
						  "arguments":obj.samplesForMethod[i].arguments};
			samples.push(sample);
		}
		obj.data.samples = samples;
		obj.samplesForMethod = samples;
		$.ajax({
			context : obj,
			url : System.Url + obj.serviceEndpoint + '/' + obj.data.key + '/samples/',
			cache : false,
			async : false,
			method : 'PUT',
			contentType : 'application/json',
			mimeType : 'text/html',
			data : JSON.stringify({"samples":obj.samplesForMethod})
		}).done(function (data) {
			return true;
		}).fail(function (xhr, status, error) {
			var reply = JSON.parse(xhr.responseText);
			var responseMessage = reply.status + ' ' + reply.error + ': ' + reply.exception + ': ' + reply.message;
			throw new Error("Error updating samples. Server replied: " + responseMessage );
		});
	},
	/**
	 * Requests that the test case sample at the given id be deleted by the service.
	 * @param id - The id of the desired test case sample to delete.
	 * @throws Exception of invalid id or server error.
	 */
	remove : function (id) {
		var obj = this;
		var samples = [];
		obj.data.samples.splice(0, obj.data.samples.length);
		for (var i = 0; i < obj.samplesForMethod.length; i++) {
			if(obj.samplesForMethod[i].id !== id) {
				var sample = {"name":obj.samplesForMethod[i].name,"ordinal":obj.samplesForMethod[i].ordinal,"arguments":obj.samplesForMethod[i].arguments};
				obj.data.samples.push(sample);
			}
		}
		obj.samplesForMethod = obj.data.samples;
		$.ajax({
			context : obj,
			url : System.Url + obj.serviceEndpoint + '/' + obj.data.key + '/samples/',
			method : 'PUT',
			cache : false,
			async : false,
			contentType : 'application/json',
			mimeType : 'text/html',
			data : JSON.stringify({"samples":obj.samplesForMethod})
		}).done(function (data) {				
			return true;
		}).fail(function (xhr, status, error) {
			var reply = JSON.parse(xhr.responseText);
			var responseMessage = reply.status + ' ' + reply.error + ': ' + reply.exception + ': ' + reply.message;
			throw new Error("Error removing sample. Server replied: " + responseMessage );
		});
	},
	/**
	 * Reorder the incoming array of row objects by the specified numeric column.
	 * @param rows - The rows of parameter objects to be reordered.
	 * @param orderBy - The name of the ordinal value to be ordered by.
	 */
	reorder : function (rows, orderBy) {
		var obj = this;
		var newOrder = [];
		//Update the order by (Ordinal) column with the position in the array
		for (var i = 0; i < rows.length; i++) {
			var row = rows[i];
			row[orderBy] = (i + 1).toString();
			newOrder[row[orderBy] - 1] = rows[i];
		}
		obj.samplesForMethod = newOrder;
	},
	/**
	 */
	validate : function (sampleName) {
		if(sampleName.trim().length < 1) {
			throw new Error("Sample name parameter must have one or more non-whitespace characters!"); 
		}
		//Search the local cache for duplicates
		for (var i = 0; i < this.samplesForMethod.length; i++) {
			if (this.samplesForMethod[i].name === sampleName) {
				throw new Error("Sample " + sampleName + "already exists in this method!");
			}
		}
	}
};
//End TestCaseSamples

/**
 * TestCaseSample
 * Represents a single instance of a test sample.
 * @param args - An object containing parameters for the constructor. The following
 * parameters are used by the constructor:
 *		- id  : The id of the sample to be loaded by the constructor.
 *		- name: The sample's name (optional).
 *		- ord: The ordinal value (it's order in the set) of the test case (optional).
 * 		- data: The complete object representation of the sample (optional).
 */
var TestCaseSample = function (args) {
	var options = args || {};
	if (this instanceof TestCaseSample) {
		this.packageId = options.packageId;
		this.classId = options.classId;
		this.methodId = options.methodId;
		this.name = options.name || '';
		this.ord = options.ordinal || 0;
		if (typeof this.packageId != 'undefined' && 
			typeof this.classId != 'undefined' && 
			typeof this.methodId != 'undefined') {
			this.getTestCaseSample(this.packageId, this.classId, this.methodId, this.ord);
		}
		if (typeof options.prefix !== 'undefined') {
			this.prefix = options.prefix;
		}
	} else {
		return new TestCaseSample(options);
	}
};
//Class definition
TestCaseSample.prototype = {
	constructor : TestCaseSample,
	serviceEndpoint : '/testcases-service-rest',
	id : undefined,
	packageId : undefined,
	classId : undefined,
	methodId : undefined,
	name : '',
	ord : 0,
	prefix : 'QaAutomation',
	//Definition for was a row looks like (In this case each sample parameter)
	definition : {
		"key" : "ordinal",
		"name" : "",
		"value" : "",
		"dataType" : {
			"String" : "java.lang.String",
			"Assertion" : "java.util.Map"
		},
		"ordinal" : "#"
	},
	data : {},
	/**
	 * Requests a test case sample object from the service for he given id.
	 * @param packageId - The identifier of the package containing the sample.
	 * @param classId - The identifier of the class containing.
	 * @param methodId - The identifier of the method containing this sample.
	 * @param sampleOrdinal - The ordinal index of the desired sample
	 * @throws Exception on invalid id or server error.
	 */
	getTestCaseSample : function (packageId, classId, methodId, sampleOrdinal) {
		var obj = this;
		obj.id = obj.prefix + '-' + packageId + '-' + classId + '-' + methodId;
		$.ajax({
			context : obj,
			url : System.Url + obj.serviceEndpoint + '/' + obj.id + '/',
			method : 'GET',
			cache : false,
			async : false,
		}).done(function (data) {
			//Set the model's data
			var desiredSample = data.samples[(parseInt(sampleOrdinal, 10) - 1)];
			obj.data = data;
			obj.name = desiredSample.name;
			obj.ord = parseInt(desiredSample.ordinal, 10);
		}).fail(function (xhr, status, error) {
			var reply = JSON.parse(xhr.responseText);
			var responseMessage = reply.status + ' ' + reply.error + ': ' + reply.exception + ': ' + reply.message;
			throw new Error("Error getting sample for method " + methodId + ". Server replied: " + responseMessage );
		});
	},
	/**
	 * Forces the object to refresh it's data content
	 * @returns boolean success / failure
	 */
	refresh : function () {
		try {
			this.getTestCaseSample(this.packageId, this.classId, this.methodId, this.ord);
			return true;
		} catch (ex) {
			return false;
		}
	},
	/**
	 * Return the test case sample parameters as an array
	 * @returns Array of test case sample parameter objects
	 */
	toArray : function () {
		var obj = this;
		var samplesForParameter = [];
		if (obj.data.parameters === null) {
			obj.data.parameters = [];
		}
		//Because the parameters and their values live in two arrays
		//we need to 'stitch' them together for the sample view to consume.
		for (var i = 0; i < obj.data.parameters.length; i++) {
			var parameter = {};
			//Populate the empty parameter object with the keys from the definition
			//object and cherry pick values from their respective arrays
			for (var key in obj.definition) {
				switch(key) {
					case 'name':
					case 'dataType':
						parameter[key] = obj.data.parameters[i][key];
					break;
					case 'ordinal':
						parameter[key] = parseInt(obj.data.parameters[i][key], 10);
					break;
					case 'value' :
						//Check if it's an array and not empty
						if ($.isArray(obj.data.samples[(obj.ord - 1)].arguments) && obj.data.samples[(obj.ord - 1)].arguments.length > 0) {
							//Because the above might evaluate to true while the data is null or undefined (WTF), we need to account for that
							if (typeof obj.data.samples[(obj.ord - 1)].arguments !== 'undefined' && obj.data.samples[(obj.ord - 1)].arguments !== null) {
								//Check that this specific element is not undefined.
								if (typeof obj.data.samples[(obj.ord - 1)].arguments[i] !== 'undefined') {
									try {
										//Try to parse this as an object
										parameter[key] = JSON.parse(obj.data.samples[(obj.ord - 1)].arguments[i][key]);
									} catch (jex) {
										//Otherwise, just get the value
										parameter[key] = obj.data.samples[(obj.ord - 1)].arguments[i][key];
									}
								} else {
									//Empty value
									parameter[key] = '';
								}
							} else {
								//No arguments! Set the arguments and set this parameter to empty
								obj.data.samples[(obj.ord - 1)].arguments = [];
								parameter[key] = '';
							}
						} else {
							//Empty value
							parameter[key] = '';
						}
					break;
				}
			}
			samplesForParameter.push(parameter);
		}
		//Return our patchwork array
		return samplesForParameter;
	},
	/**
	 * Requests the test case sample be updated by the service and, on success, displays
	 * those updates client side.
	 * @throws Exception on server error.
	 */
	update : function () {
		var obj = this;
		var previousName = obj.data.samples[(obj.ord - 1)].name;
		obj.data.samples[(obj.ord - 1)].name = obj.name;
		//If we have arguments
		if ($.isArray(obj.data.samples[(obj.ord - 1)].arguments)) {
			for (var i=0; i<obj.data.samples[(obj.ord - 1)].arguments.length; i++) {
				//If the argument is an array, stringify it
				if ($.isArray(obj.data.samples[(obj.ord - 1)].arguments[i].value)) {
					obj.data.samples[(obj.ord - 1)].arguments[i].value = JSON.stringify(obj.data.samples[(obj.ord - 1)].arguments[i].value);
				}
			}
		}
		$.ajax({
			context : obj,
			url : System.Url + obj.serviceEndpoint + '/' + obj.id + '/samples/' + previousName,
			method : 'PUT',
			cache : false,
			async : false,
			contentType : 'application/json',
			mimeType : 'text/html',
			data : JSON.stringify(obj.data.samples[(obj.ord - 1)])
		}).done(function (data) {
			return obj.refresh();
		}).fail(function (xhr, status, error) {
			var reply = JSON.parse(xhr.responseText);
			var responseMessage = reply.status + ' ' + reply.error + ': ' + reply.exception + ': ' + reply.message;
			throw new Error("Error updating sample. Server replied: " + responseMessage );
		});
	},
	/**
	 * Get the value of the parameter identified by the given id.
	 * @param id - The id of the parameter to get the value for.
	 * @returns Parameter value (if set)
	 */
	getParameterValue : function (id) {
		var obj = this;
		var parameter;
		//Search through the parameters for the requested value
		for (var i = 0; i<obj.data.parameters.length; i++) {
			if (obj.data.parameters[i].ordinal == id) {
				if ($.isArray(obj.data.samples[(obj.ord - 1)].arguments) && obj.data.samples[(obj.ord - 1)].arguments.length > 0) {
					try {
						parameter = JSON.parse(obj.data.samples[(obj.ord - 1)].arguments[i].value);
					} catch (jex) {
						parameter = obj.data.samples[(obj.ord - 1)].arguments[i].value;
					}
				} else {
					parameter = '';
				}
			}
		}		
		//...and return it
		return parameter;
	},
	/**
	 * Sets the value of a parameter specified by the provided id
	 * @param id - The identifier of the parameter to set
	 * @param value - The value to give to the specified parameter
	 * @returns boolean on success/failure
	 */
	setParameterValue : function (id, value) {
		var obj = this;
		//Search through the parameters for the requested object and update it's value
		for (var i = 0; i < obj.data.parameters.length; i++) {
			if (obj.data.parameters[i].ordinal == id) {
				if ($.isArray(obj.data.samples[(obj.ord - 1)].arguments) && obj.data.samples[(obj.ord - 1)].arguments.length > i) {
					obj.data.samples[(obj.ord - 1)].arguments[i].value = value;
				} else {
					if (obj.data.samples[(obj.ord - 1)].arguments === null) {
						obj.data.samples[(obj.ord - 1)].arguments = [];
						obj.data.samples[(obj.ord - 1)].arguments.push({"value":value,"ordinal":parseInt(id, 10)});
					} else {
						obj.data.samples[(obj.ord - 1)].arguments.push({"value":value,"ordinal":parseInt(id, 10)});
					}
				}
				return true;
			}
		}	
		//Return false on not finding it.
		return false;
	}
};
//End TestCaseSample