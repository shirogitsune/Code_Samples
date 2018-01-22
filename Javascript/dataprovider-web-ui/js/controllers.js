/**
 * Modules to handle client side scripting for Automation data provider interface
 * The modules included in this file:
 * - System
 * - BreadCrumbs
 * - UIController
 * 
 * These modules constitute UI controllers and global utility modules for the UI interface.
 * @author Justin Pearce <jpearce@eastbay.com>
 */
 
//Use Strict interpreter rules
"use strict";

/**********************

SYSTEM
The global system object. This acts as a 'mount point' for commonly used objects and values
to avoid polluting the global window name space.

***********************/
var System = {
	/** Page title */
	Title : 'QA Automation Test Case Manager',
	/** Base service URL */
	Url : 'http://waudevwtc01:8080',
	KeyPrefix : 'QaAutomation',
	PackagePrefix : 'com.fleb.qaautomation.testcases.',
	/** Global UI Controller */
	Controller : undefined,
};

/**********************

UTILITY
This section contains modules that provide utility operations for the UI interface.

***********************/

/**
 * BreadCrumbs
 * Module to handle breadcrumbs operation. The function assigned to the variable acts as a
 * constructor would.
 * @param args - An object containing options to initialize the object with.
 */
var BreadCrumbs = function (args) {
	var options = args || {};
	if (this instanceof BreadCrumbs) {
		this.container = $(options.container);
		this.view = $(options.view);
		this.separator = $(options.separator);
		this.initialize();
	} else {
		return new BreadCrumbs(options);
	}
};
//Class Definition
BreadCrumbs.prototype = {
	constructor : BreadCrumbs,
	container : undefined,
	view : undefined,
	separator : undefined,
	stack : [],
	previousLocals : [],
	store : window.localStorage,
	/**
	 * Initialize the breadcrumbs control and build the UI.
	 */
	initialize : function () {
		var obj = this;
		var viewport = obj.view.clone();
		//Empty the container.
		if (obj.container.html().length > 0) {
			obj.container.empty();
		}
		try {
			if (obj.stack.length > 0) {
				obj.store.setItem('breadcrumbs', JSON.stringify(obj.stack));
			} else {
				if($.isArray(JSON.parse(obj.store.getItem('breadcrumbs')))) {
					obj.stack = JSON.parse(obj.store.getItem('breadcrumbs'));
				} else {
					obj.store.setItem('breadcrumbs', '');
				}
			}
		} catch (ex) {
			console.info('Local storage could not be initialized. Are you executing this locally?');
		}
		//Show all but the last (latest/current) breadcrumb.
		for (var i=0; i<obj.stack.length - 1 ; i++) {
			viewport.append('<a href="#' + obj.stack[i].path + '">' + obj.stack[i].title + '</a>');
			viewport.append(obj.separator.clone());
		}
		//Pop the last separator off as it's unneeded
		viewport.find('.separator').last().remove();
		obj.container.append(viewport);
	},
	/**
	 * Push a location object to the breadcrumbs stack.
	 * @param location - An object representing the location in the system.
     *		  A location consists of a title for the link and the value of the hash
	 *		  to navigate by.
	 */
	push : function (location) {
		this.stack.push(location);
	},
	/**
	 * Pops a location object off the stack and returns that object.
	 * @returns A location object.
	 */
	pop : function () {
		return this.stack.pop();
	},
	/**
	 * Tracks the navigation through the system by pushing locations to the stack or
	 * popping additional locations from the stack as needed.
	 * @param location - An object representing the location in the system.
     *		  A location consists of a title for the link and the value of the hash
	 *		  to navigate by.
	 * @return An array of previous locations (if they exist).
	 */
	track : function (location) {
		var obj = this;
		var pointer = obj.stack.length;
		var previousLocals = [];
		//Find an existing path and mark it (if it exists).
		$.grep(obj.stack, function (element, i) {
			if (element.path === location.path) {
				pointer = i;
			} 
		});
		//If it's not in the stack, add it
		if (pointer >= obj.stack.length) {
			obj.push(location);
		} else {
			//Remove all the previous items
			while (obj.stack.length > pointer + 1) {
				previousLocals.push(obj.pop());
			}
		}
		//Set the backtrace
		obj.previousLocals = previousLocals;
		//Rebuild the view.
		obj.initialize();
	},
	/**
	 * Get the breadcrumbs that were previously dropped when backtracking.
	 * @returns Array of previous location objects or empty array.
	 */
	getBackTrace : function () {
		return this.previousLocals;
	},
	/**
	 * Reset the local storage object to empty.
	 */
	resetStore : function () {
		try {
			this.store.setItem('breadcrumbs', '');
		} catch (ex) {
			console.info('Local storage could not be initialized. Are you executing this locally?');
		}
	},
	/**
	 * Peek at the bread crumbs local storage to see if it has been initialized to 
	 * out stack.
	 * @returns boolean indicating state
	 */
	peekStore : function () {
		try {
			return $.isArray(this.store.getItem('breadcrumbs'));
		} catch (ex) {
			return false;
		}
	}
};
//End BreadCrumbs



/**********************





CONTROLLER
Handles command routing and base initialization of the application UI.




***********************/
/**
 * UIController
 * Represents an instance of the UI controller for handling UI related methods and
 * operations separate from the data model operations.
 * @param args - An object containing parameters to be passed to the object constructor.
 */
var UIController = function (args) {
	var options = args || {};
	if (this instanceof UIController) {
		if (typeof options.container !== 'undefined') {
			this.container = options.container;
		}
		if (typeof options.defaultFilter !== 'undefined') {
			this.defaultFilter = options.defaultFilter;
		}
		if (typeof options.packagePrefix !== 'undefined') {
			this.packagePrefix = options.packagePrefix;
		}
	} else {
		return new UIController(options);
	}
};
//Class Definition
UIController.prototype = {
	constructor : UIController,
	container : '',
	List : undefined,
	BreadCrumbs : undefined,
	defaultFilter : '',
	packagePrefix : '',
	/**
	 * Initialize the UI
	 */
	initialize : function () {
		//Set page title
		document.title = System.Title;
		//Setup the breadcrumb view 
		this.BreadCrumbs = new BreadCrumbs({
			container : '#breadcrumbs',
			view : '#views .breadcrumbs',
			separator : '#templates .separator',
		});
		if (window.location.hash !== '') {
			//If hash value is set, run update method.
			System.Controller.locationFragmentUpdate(window.location.hash);
		} else {
			try {
				$('#processing').show();
				var filter = '[^a-zA-Z0-9.]';
				//Initialize the default view, locating up the base packages data provider / model
				this.List = new ListView({
						container : this.container,
						view : '#views .list_view',
						template : '#templates .list_view_item',
						dataProvider : new TestPackages(),
						inputFilter : filter || this.defaultFilter,
						exceptionHandler : this.exceptionHandler,
						maxLength : '75',
						initialValue : this.packagePrefix,
						deleteMessage : 'Are you sure you wish to inactivate this package?\nOnce inactive, this package name can no longer be used.'
					});
				this.List.refresh();
				//Push the default packages 'anchor' breadcrumb.
				this.BreadCrumbs.track({"title":"Packages", "path":''});
				$('#pageheading').text('Test Packages');
				$('#returnHome').hide();
				$('#processing').hide();
			} catch (ex) {
				this.exceptionHandler('There was error initializing the initial list view.', ex);
			}
		}
		
		//Attach the routing method to the onhashchange event listener
		window.onhashchange = function () {
			System.Controller.locationFragmentUpdate(window.location.hash);
		}
	},
	/**
	 * Attached as a listener to the window to perform a function on the update of the url fragment
	 * (value after the '#' sign). This method handles routing for all navigation within the application.
	 * @param hash - The value of the URL fragments (including the #).
	 */
	locationFragmentUpdate : function (hash) {
		var obj = this;
		//Get the value of the window hash (minus the # sign)
		var hashValue = hash.substring(1);
		//Set up the default data provider / model as empty
		var provider = undefined;
		//Set up placeholders for defining callbacks to override certain methods.
		var editCallback = undefined;
		var navigateCallback = undefined;
		var reorderCallback = undefined;
		//Other variables 
		var readOnly = [];
		var dmessage = undefined;
		var title = '';
		var filter, maxLength, initialValue;
		$('#processing').show();
		//Parse on non-empty hash value
		if (hashValue !== '') {
			//Split the hash value into routing key and value
			var parameters = hashValue.split('-', 2);
			//Ensure that routing value also exists
			if (parameters.length > 1) {
				//On the routing key...
				switch (parameters[0]) {
				case 'packageName':
					//...configure the breadcrumb and model for operating on classes
					title = 'Classes';
					filter = '[^a-zA-Z0-9.]';
					maxLength = '60';
					initialValue = '';
					try {
						provider = new TestClasses({
								"packageName" : parameters[1],
						});
					} catch (ex) {
						obj.exceptionHandler('There was an error initializing test packages.', ex);
					}
					dmessage = 'Are you sure you wish to inactivate this class?\nOnce inactive, this class name can no longer be used';
					$('#pageheading').text('Test Classes');
					break;
				case 'className':
					//...configure the breadcrumb and model for operating on methods
					var params = parameters[1].split('+');
					title='Methods';
					filter = '[^a-zA-Z0-9.]';
					maxLength = '60';
					initialValue = '';
					try {
						provider = new TestMethods({
								"classId" : params[1],
								"packageId" : params[0]
						});
					} catch (ex) {
						obj.exceptionHandler('There was an error initializing test methods.', ex);
					}
					dmessage = 'Are you sure you wish to inactivate this method?\nOnce inactive, this method name can no longer be used.';
					//...and override the edit button to go to the method individual method config view.
					editCallback = function (args) {
						window.location.hash = 'method-' + args;
					}
					$('#pageheading').text('Test Methods');
					break;
				case 'methodName':
					//...configure the breadcrumb and model for operating on samples
					var params = parameters[1].split('+');
					title='Samples';
					filter = '[^a-zA-Z0-9.]';
					maxLength = '60';
					initialValue = '';
					try {
						provider = new TestCaseSamples({
							"methodId" : params[2],
							"classId" : params[1],
							"packageId" : params[0]
						});
					} catch (ex) {
						obj.exceptionHandler('There was an error initializing test samples.', ex);
					}
					dmessage = 'Are you sure you wish to delete this sample?';
					//...and flag Ordinal as a read-only column in the view
					readOnly = ['ordinal'];
					//...and override the edit button to go to the individual sample config view
					navigateCallback = editCallback = function (args) {
						window.location.hash = 'sample-' + args;
					}
					//...and add a call back to the reorder method so that we can update the data provider.
					reorderCallback = function (args) {
						obj.List.dataProvider.update();
						obj.List.dataProvider.refresh();
						obj.List.refresh();
					}
					$('#pageheading').text('Test Case Samples');
					break;
				case 'method':
					//...configure the breadcrumb and
					title = 'Methods';
					filter = '[^a-zA-Z0-9.]';
					maxLength = '60';
					initialValue = '';
					var params = parameters[1].split('+');
					try {
						//...build out the method config view
						var methodView = new MethodConfigView({
								container : obj.container,
								view : '#views .method_config_view',
								rowTemplate : '#templates .list_view_item',
								inputFilter : filter || obj.defaultFilter,
								exceptionHandler : obj.exceptionHandler,
								maxLength : maxLength,
								//...with a new data provider
								dataProvider : new TestMethod({
									"methodId" : params[2],
									"classId" : params[1],
									"packageId" : params[0]
								})
							});
						methodView.build();
						$('#pageheading').text('Test Method: ' + methodView.dataProvider.name);
					} catch (ex) {
						obj.exceptionHandler('There was an error initializing the method configuration view.', ex);
					}
					break;
				case 'sample':
					//...configure the breadcrumb and 
					var parameterFilter = '["]';
					title = 'Samples';
					filter = '[^a-zA-Z0-9.]';					
					maxLength = '60';
					initialValue = '';
					var params = parameters[1].split('+');
					try {
						//...build out the sample config view
						var samplesView = new SampleConfigView({
								container : obj.container,
								view : '#views .sample_config_view',
								rowTemplate : '#templates .list_view_item',
								assertionTemplate : '#templates .assertion_list_view_item',
								objectView : '#views .object_view',
								objectFieldTemplate : '#templates .object_view_item.key_value_pair',
								inputFilter : filter || obj.defaultFilter,
								parameterFilter : parameterFilter || obj.defaultFilter,
								maxLength : maxLength,
								exceptionHandler : obj.exceptionHandler,
								//...with a new data provider
								dataProvider : new TestCaseSample({
									"methodId" : params[2],
									"classId" : params[1],
									"packageId" : params[0],
									"ordinal" : params[3]
								})
							});
						samplesView.build();
						$('#pageheading').text('Test Case Sample: ' + samplesView.dataProvider.name);
					} catch (ex) {
						obj.exceptionHandler('There was an error initializing the sample config view.', ex);
					}
					break;
				default:
					//Invalid hash section (unknown key), reset to empty.
					window.location.hash = '';
					this.BreadCrumbs.resetStore();
					break;
				}
			} else {
				//Invalid hash section (undefined value), reset to empty.
				window.location.hash = '';
				this.BreadCrumbs.resetStore();
			}
			
		} else {
			//Configure the breadcrumb and data model / provider to the default
			title='Packages';
			filter = '[^a-zA-Z0-9.]';
			maxLength = '75';
			initialValue = this.packagePrefix;
			provider = new TestPackages();
			dmessage = 'Are you sure you wish to inactivate this package?\nOnce inactive, this package name can no longer be used.';
			$('#pageheading').text('Test Packages');
			this.BreadCrumbs.resetStore();
		}
		//Display list view with the given data provider (if it's defined)
		if (typeof provider !== 'undefined') {
			try {
				this.List = new ListView({
						container : obj.container,
						view : '#views .list_view',
						template : '#templates .list_view_item',
						dataProvider : provider,
						onEdit : editCallback,
						onNavigate : navigateCallback,
						onReorder : reorderCallback,
						deleteMessage : dmessage,
						readOnlyColumns : readOnly,
						exceptionHandler : obj.exceptionHandler,
						maxLength : maxLength,
						initialValue : initialValue,
						inputFilter : filter || obj.defaultFilter
					});
				this.List.build();
			} catch (ex) {
				this.exceptionHandler('There was an error initializing this list view.', ex);
			}
		}
		//If the breadcrumb title is set, track the location for the breadcrumbs
		if (title !== '') {
			this.BreadCrumbs.track({"title":title, "path":hashValue});
		}
		if ($(this.BreadCrumbs.container).children('.container').children().length !== 0 || !this.BreadCrumbs.peekStore()) {
			$('#returnHome').hide();
		} else {
			$('#returnHome').show();
		}
		$('#processing').hide();
	},
	/**
	 * Handles exceptions generated by the UI so that a user-friendly message can be generated
	 * @param message - The initial message for the handler to use.
	 * @param ex - The exception raised by the application
	 */
	exceptionHandler : function (message, ex) {
		var file = '', messageext = '';
		var content = $(this.container);
		var bodyMessage = '';
		//If the browser's JS implementation supports file name and line number parameters
		if (typeof ex.fileName !== 'undefined' && 
			typeof ex.lineNumber !== 'undefined') {
			file = ex.fileName.split('/');
			//...add on the exception source and line numbers for error tracking / identification.
			messageext = '[Exception Source: ' + file[file.length - 1] + ' : ' + ex.lineNumber + ']';
		}
		//Raise the exception as a native browser alert
		alert(message + '\nThe error was:\n' + ex.message + '\n\n' +
			 'If this error persists, contact your Administrator.\n' + messageext);
		//...and configure an in page message to be placed in the content area.
		bodyMessage = '<span id="exceptions"><h1>An Error Occurred!</h1>' + 
					  '<h2>Please refresh the page and try again. If the error persists, contact your Administrator.</h2>' + 
					  '<h4>' + messageext + '</h4></span>';
		if (content.html().length < 1) {
			content.html(bodyMessage); //Set the whole body to the message if empty
		}
		$('#processing').hide();
	}
}

/*


BOOT UP
Attach an 'on ready' listener to the document to start the UI.

*/
$(document).ready(function () {
	//Instantiate UI controller
	System.Controller = new UIController({
		container : '#content_area',
		defaultFilter : '["]',
		packagePrefix : System.PackagePrefix
	});
	System.Controller.initialize();
});
