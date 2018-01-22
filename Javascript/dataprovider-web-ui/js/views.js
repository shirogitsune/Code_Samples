/**
 * Modules to handle client side scripting for Automation data provider interface
 * The modules included in this file:
 * - ListView
 * - MethodConfigView
 * - SampleConfigView
 *
 * These modules constitute the views for the UI interface.
 * @author Justin Pearce <jpearce@eastbay.com>
 */
 //Use Strict interpreter rules
"use strict";

/**
 * ListView
 * Module for handling list display operations. The function assigned to the variable acts as a
 * constructor would. 
 * @param args - An object containing options to initialize the object with.
 */
var ListView = function (args) {
	var options = args || {};
	if (this instanceof ListView) {
		this.container = $(options.container);
		this.view = $(options.view);
		this.template = $(options.template);
		this.dataProvider = options.dataProvider;
		//Only assign the callbacks if they are defined
		if (typeof options.onEdit !== 'undefined') {
			this.onEdit = options.onEdit;
		}
		if (typeof options.onNavigate !== 'undefined') {
			this.onNavigate = options.onNavigate;
		}
		if (typeof options.onCancel !== 'undefined') {
			this.onCancel = options.onCancel;
		}
		if (typeof options.onDelete !== 'undefined') {
			this.onDelete = options.onDelete;
		}
		if (typeof options.onSave !== 'undefined') {
			this.onSave = options.onSave;
		}
		if (typeof options.onReorder !== 'undefined') {
			this.onReorder = options.onReorder;
		}
		//Throw exception on non-existent containers.
		if (this.container.length === 0 || this.template.length === 0 || this.view.length === 0) {
			throw "The container, template, and view variables must be defined!";
		}
		//Throw exception on missing data provider / model
		if (typeof this.dataProvider === 'undefined') {
			throw "The data provider is required."
		}
		//Only configure these if the exist.
		if (typeof options.deleteMessage !== 'undefined') {
			this.deleteMessage = options.deleteMessage;
		}
		if (typeof options.readOnlyColumns !== 'undefined') {
			this.readOnlyColumns = options.readOnlyColumns;
		}
		if (typeof options.sortColumn !== 'undefined') {
			this.sortColumn = options.sortColumn;
		}
		if (typeof options.inputFilter !== 'undefined') {
			this.inputFilter = options.inputFilter;
		}
		if (typeof options.maxLength !== 'undefined') {
			this.maxLength = options.maxLength;
		}
		if (typeof options.initialValue !== 'undefined') {
			this.initialValue = options.initialValue;
		}
		this.exceptionHandler = options.exceptionHandler;
	} else {
		return new ListView(options);
	}
};
//Class definition.
ListView.prototype = {
	container : undefined,
	view : undefined,
	template : undefined,
	dataProvider : undefined,
	deleteMessage : 'Are you sure you wish to delete this row?',
	readOnlyColumns : [],
	sortColumn : 'ordinal',
	inputFilter : '',
	maxLength : '-1',
	initialValue : '',
	exceptionHandler : undefined,
	/**
	 * Construct the List Display primary UI component.
	 */
	build : function () {
		var obj = this;
		//Prep the content area
		if (obj.container.html().length > 0) {
			obj.container.empty();
		}
		//Get records as an array from the data provider
		var records = obj.dataProvider.toArray();
		var currRow, viewport, columns;
		//Get our view template
		viewport = obj.view.clone();
		//Iterate through the rows provided by the model.
		for (var i = 0; i < records.length; i++) {
			var record = records[i];
			//Get the list item template
			currRow = obj.template.clone();
			//Set the rows record id in the HTML for later reference.
			if (record.hasOwnProperty('id')) {
				currRow.attr('data-id', record['id']);
			} else if (record.hasOwnProperty(obj.dataProvider.definition.key)) {
				currRow.attr('data-id', record[obj.dataProvider.definition.key]);
			}
			//Iterate over the template's columns 
			currRow.find('span').not('.Controls,.order').each(function () {
				var className = $(this).attr('class').split(' ')[0];
				//Populate the list item's fields only if the record contains them
				if (record.hasOwnProperty(className)) {
					//If the column in the model's row definition is an object
					if ($.isPlainObject(obj.dataProvider.definition[className])) {
						//Then we need to get the label for that column's data type to present it as 
						//a 'user friendly' display.
						for (var key in obj.dataProvider.definition[className]) {
							if (key === record[className].displayName) {
								$(this).html(key);
							}
						}
					} else {
						//Everything else gets output as text
						$(this).html(record[className]);
					}
				} else {
					$(this).hide();
				}
			});
			//Add the row to the view
			viewport.find('.section_container').append(currRow);

		}			
		//Update the view's heading (if applicable).
		if (typeof obj.dataProvider.name !== 'undefined' && obj.dataProvider.name !== '') {
			viewport.find('.section_heading .section_name').html(obj.dataProvider.name);
		}
		//Add the view to the container
		obj.container.append(viewport);
		//Add event handlers to the controls in the view.
		obj.attachHandlers();
	},
	/**
	 * Empties out the existing content and rebuilds the UI.
	 */
	refresh : function () {
		this.container.empty();
		this.dataProvider.refresh();
		$('#processing').hide();
		this.build();
	},
	/**
	 * Attaches event handlers to UI components.
	 */
	attachHandlers : function () {
		var obj = this;
		var hover;
		//Fetch the content area to avoid repeated calls.
		var content = this.container.find('.section_container');
		
		//Handle clicking on the name of a row item to navigate the hierarchy.
		content.on('click', 'span.list_item_name', function () {
			//Get the columns parent (the row)
			var row = $(this).parent();
			//Override this method body only if onNavigate is a function
			if (!$.isFunction(obj.onNavigate)) {
				if (typeof obj.dataProvider.key !== 'undefined') {
					//Don't do anything if the row is new or being edited.
					if (row.hasClass('editing') || row.hasClass('adding')) {
						return false;
					}
					//Otherwise, go to that level's destination.
					obj.navigateLevel(row.attr('data-id'));
				}
			} else {
				//Fire the onNavigate callback, passing the row's record id as a argument
				if (row.hasClass('editing') || row.hasClass('adding')) {
					return false;
				}
				obj.onNavigate.apply(null, [row.attr('data-id')]);
			}
		});
		//Handle clicking the delete/cancel button
		content.on('click', 'button[name="delete"]', function (evt) {
			var row = $(this).parent().parent();
			if ($(this).val() === 'delete') {
				row.addClass('deleting');
				//Override the method body for delete if onDelete is a function
				if (!$.isFunction(obj.onDelete)) {
					//As the user to confirm deletion before executing
					if (confirm(obj.deleteMessage)) {
						if (obj.deleteRow(row)) {
							alert($(this).text() + 'd Successfully!');
						}
					} else {
						row.removeClass('deleting');
					}
				} else {
					//Fire the onDelete callback, passing the whole row object as a parameter
					obj.onDelete.apply(null, $(this).parent().parent());
				}
			} else if ($(this).val() === 'cancel') {
				//Override the method body for cancel if onCancel is a function
				if (!$.isFunction(obj.onCancel)) {
					//Just refresh the view
					obj.refresh();
				} else {
					//Fire the onCancel callback
					obj.onCancel.apply();
				}
			}
			//If our model supports reordering rows, set the order controls to be draggable.
			if ($.isFunction(obj.dataProvider.reorder)) {
				content.find('.order').attr('draggable', true);
			}
		});
		//Handle clicking the edit/save button
		content.on('click', 'button[name="edit"]', function (evt) {
			//Get button's parent's (Controls column) parent (the row)
			var row = $(this).parent().parent();
			if ($(this).val() === 'edit') {
				//Override the method body for edit if onEdit is a function
				if (!$.isFunction(obj.onEdit)) {
					content.find('.Controls').css('visibility', 'hidden');
					row.find('.Controls').css('visibility', '');
					obj.editRow(row);
				} else {
					//Fire onEdit callback, passing the row's record id as an argument.
					obj.onEdit.apply(null, [row.attr('data-id')]);
				}
			} else if ($(this).val() === 'save') {
				//Override the method body for save if onSave is a function
				if (!$.isFunction(obj.onSave)) {
					content.find('.Controls').css('visibility', '');
					if (row.hasClass('editing')) {
						if (obj.updateRow(row)) {
							alert('Updated Successfully!');
						}
					} else if (row.hasClass('adding')) {
						if (obj.addRow(row)) {
							alert('Added Successfully!');
						}
					}
				} else {
					//Fire onSave callback, passing the entire row object as an argument.
					obj.onSave.apply(null, [row]);
				}
			}
		});
		//Handle clicking the add row button.
		this.container.find('.section_controls button[name="add"]').on('click', function (evt) {
			if (obj.container.find('.adding').length > 0) {
				return false;
			}
			content.find('.Controls').css('visibility', 'hidden');
			obj.appendAddRow();
		});
		//If the data provider for this view supports the reorder method
		//Then we attach native drag-and-drop listeners to the rows to order by the
		//column specified by the value of sortColumn
		if ($.isFunction(obj.dataProvider.reorder)) {
			//Dummy row so we can drag to the 'first' row.
			content.find('.list_view_item').first().before('<div class="list_view_item dropper"><div class="droptarget"></div><div>');
			//Enable drag-and-drop listeners
			content.find('.list_view_item .order').attr('draggable', true);
			//Handle dragging on the order control
			content.find('.list_view_item .order').on('dragstart', function (ev) {
				//Don't allow rows being added, edited or deleted to be effected.
				if (content.find('.adding,.editing,.deleting').length > 0) {
					return false;
				}
				obj.hover = $(this).parents('.list_view_item');
				obj.hover.addClass('dragging');
			});
			//Handle when we let go of the mouse button when dragging (and reorder the rows).
			content.find('.list_view_item .order').on('dragend', function (ev) {
				//Don't allow rows being added, edited or deleted to be effected.
				if (content.find('.adding,.editing,.deleting').length > 0) {
					return false;
				}
				obj.hover.removeClass('dragging');
				//Fire off the reordering call.
				obj.reorderList(obj.container.find('.list_view_item').not('.dropper'));
			});
			//Handle the dragging element entering an existing row.
			content.find('.list_view_item').on('dragenter', function (ev) {
				//Don't allow rows being added, edited or deleted to be effected.
				if (content.find('.adding,.editing,.deleting').length > 0) {
					return false;
				}
				//Move the element to the position after the target's row
				$(ev.target).parents('.list_view_item').after(obj.hover);
			});
			//Trap drop and dragover events
			content.on('drop', function (ev) {
				ev.preventDefault();
			});
			content.on('dragover', function (ev) {
				ev.preventDefault();
			});
		} else {
			//Hide the order control, since we don't support reordering.
			content.find('.list_view_item .order').hide();
		}
	},
	/**
	 * Perform the navigation of the levels in the list.
	 * @param id - The id for the record to navigate by. This is combined with the data
	 *		  provider's key to build the hash value for the window.
	 */
	navigateLevel : function (id) {
		window.location.hash = this.dataProvider.key + '-' + id;
	},
	/**
	 * Append a new row with form fields to collect new data.
	 */
	appendAddRow : function () {
		var obj = this;
		//Get the list item template
		var currRow = obj.template.clone();
		//Populate the list item's fields
		currRow.find('span').not('.Controls,.order').each(function () {
			var className = $(this).attr('class').split(' ')[0];
			if (obj.dataProvider.definition.hasOwnProperty(className)) {
				//Determine if the column is supposed to be 'read only'
				if ($.inArray(className, obj.readOnlyColumns) < 0) {
					if ($.isPlainObject(obj.dataProvider.definition[className])) {
						//The value in the definition is a key/value pair object
						//So make a drop down element
						$(this).html('<select name="' + className + '"></select>');
						for (var key in obj.dataProvider.definition[className]) {
							var value = obj.dataProvider.definition[className][key];
							$(this).find('select').append('<option value="' + value + '">' + key + '</option>');
						}
					} else {
						//Normal field
						$(this).html('<input type="text" name="' + className + '" ' +
									 'maxlength="' + obj.maxLength + '" placeholder="' + className + '" value="' + obj.initialValue + '" />');
						if (obj.inputFilter !== '') {
							var badChars = obj.getIllegalCharacterSet(obj.inputFilter).split('');
							var message = 'The following characters are illegal for this field:\n' + badChars.join(' ');
							$(this).append(obj.buildTooltip(message));
						}
					}
				} else {
					//Read only columns get a hidden field
					$(this).append(obj.dataProvider.definition[className]);
					$(this).append('<input type="hidden" name="' + className + '" value="" />');
				}
			} else {
				$(this).hide();
			}
		});
		//Flag the row as being a 'new' row
		currRow.addClass('adding');
		//Setup the control buttons from 'edit and 'delete' to 'save' and 'cancel'
		currRow.find('.Controls').find('button[name="edit"]').html('Save').val('save');
		currRow.find('.Controls').find('button[name="delete"]').html('Cancel').val('cancel');
		//Insert the row
		obj.container.find('.section_container').append(currRow);
		currRow.find('input').first().focus();
		currRow.find('input')[0].setSelectionRange(currRow.find('input').first().val().length, currRow.find('input').first().val().length);
	},
	/**
	 * Attempt to add a row to the data provider.
	 * @param row - The row object to be interacted with.
	 */
	addRow : function (row) {
		var obj = this;
		var record = {};
		var emptyField = false;
		var haltProcess = false;
		$('#processing').show();
		$(row).find('.Controls').children('button').removeAttr('disabled');
		//Iterate over the columns to pick up the values needed
		$(row).find('span').not('.Controls').each(function () {
			var field = $(this).children().first();
			if ($(field).is(':input')) {
				if (obj.filterString($(field).val(), obj.inputFilter) === '' && $(field).attr('type') !== 'hidden') {
					emptyField = true;
				}
				if ($(field).attr('type') !== 'hidden' && !$(field).is('select')) {
					if (obj.filterString($(field).val(), obj.inputFilter).length !== $(field).val().length) {
						if (confirm('There are illegal characters in the "' + $(field).attr('name') + '" field. Filter these out?')) {
							record[$(field).attr('name')] = obj.filterString($(field).val(), obj.inputFilter);
						} else {
							haltProcess = true;;
						}
					} else {
						record[$(field).attr('name')] = obj.filterString($(field).val(), obj.inputFilter);
					}
				} else {
					record[$(field).attr('name')] = $(field).val();
				}
			}
		});
		if (emptyField) {
			alert ('One or more fields are empty. Please fill in the empty fields and try again!');
			//Reset the columns in this row back to their previous values.
			row.parent().find('.Controls').css('visibility', 'hidden');
			row.find('.Controls').css('visibility', '');
			$(row).find('.Controls').children('button').removeAttr('disabled');
			$('#processing').hide();
			return false;
		}
		if (haltProcess) {
			row.parent().find('.Controls').css('visibility', 'hidden');
			row.find('.Controls').css('visibility', '');
			$(row).find('.Controls').children('button').removeAttr('disabled');
			$('#processing').hide();
			return false;
		}
		try {
			//Send the update to the service and refresh the view.
			this.dataProvider.add(record);
			this.refresh();
			return true;
		} catch (ex) {
			//Remove this row because of a failure.
			if ($.isFunction(obj.exceptionHandler)) {
				obj.exceptionHandler('Error adding row', ex);
			}
			$('#processing').hide();
			row.remove();
		}
	},
	/**
	 * Attempt to perform a delete operation on the row displayed.
	 * @param row - The row object to be interacted with.
	 */
	deleteRow : function (row) {
		$('#processing').show();
		try {
			this.dataProvider.remove($(row).attr('data-id'));
			this.refresh();
			return true;
		} catch (ex) {
			if ($.isFunction(this.exceptionHandler)) {
				this.exceptionHandler('Error deleting row', ex);
			}
			$('#processing').hide();
			$(row).removeClass('deleted');
		}
	},
	/**
	 * Attempt to perform an update on the given row displayed.
	 * @param row - The row object to be interacted with.
	 */
	updateRow : function (row) {
		var obj = this;
		var record = {};
		var emptyField = false;
		var haltProcess = false;
		$('#processing').show();
		//Flag the row as updating
		$(row).addClass('updating');
		//Get the columns from the form
		$(row).find('span').not('.Controls').each(function () {
			var field = $(this).children().first();
			if ($(field).is(':input')) {
				if (obj.filterString($(field).val(), obj.inputFilter) === ''  && $(field).attr('type') !== 'hidden') {
					emptyField = true;
				}
				if ($(field).attr('type') !== 'hidden' && !$(field).is('select')) {
					if (obj.filterString($(field).val(), obj.inputFilter).length !== $(field).val().length) {
						if (confirm('There are illegal characters in the "' + $(field).attr('name') + '" field. Filter these out?')) {
							record[$(field).attr('name')] = obj.filterString($(field).val(), obj.inputFilter);
						} else {
							haltProcess = true;
						}
					} else {
						record[$(field).attr('name')] = obj.filterString($(field).val(), obj.inputFilter);
					}
				} else {
					record[$(field).attr('name')] = $(field).val();
				}
			}
		});
		if (emptyField) {
			alert ('One or more fields are empty. Please fill in the empty fields and try again!');
			//Reset the columns in this row back to their previous values.
			$(row).find('span').not('.Controls').each(function () {
				if ($(this).attr('data-previous') !== '') {
					$(this).html($(this).attr('data-previous'));
				}
			});
			$(row).find('.Controls').children('button').removeAttr('disabled');
			$(row).removeClass('editing');
			$('#processing').hide();
			return false;
		}
		if (haltProcess) {
			row.parent().find('.Controls').css('visibility', 'hidden');
			row.find('.Controls').css('visibility', '');
			$(row).find('.Controls').children('button').removeAttr('disabled');
			$('#processing').hide();
			return false;
		}
		//Reset the control buttons back to 'edit' and 'delete'
		$(row).find('.Controls').find('button[name="edit"]').html('Edit').val('edit');
		$(row).find('.Controls').find('button[name="delete"]').html('Deactivate').val('delete');
		$(row).find('.Controls').children('button').removeAttr('disabled');
		try {
			//Submit the update request and refresh the view.
			this.dataProvider.update($(row).attr('data-id'), record);
			this.refresh();
			return true;
		} catch (ex) {
			if ($.isFunction(obj.exceptionHandler)) {
				obj.exceptionHandler('Error updating row', ex);
			}
			//Reset the columns in this row back to their previous values.
			$(row).find('span').not('.Controls').each(function () {
				if ($(this).attr('data-previous') !== '') {
					$(this).html($(this).attr('data-previous'));
				}
			});
			$(row).find('.Controls').children('button').removeAttr('disabled');
			$(row).removeClass('editing');
			$('#processing').hide();
			return false;
		}
	},
	/**
	 * Set the row to edit mode.
	 * @param row - The row object to be interacted with.
	 */
	editRow : function (row) {
		var obj = this;
		//Flag the row as editing
		$(row).addClass('editing');
		//Configure the controls from 'edit' and 'delete' to 'save' and 'cancel'
		$(row).find('.Controls').find('button[name="edit"]').html('Save').val('save');
		$(row).find('.Controls').find('button[name="delete"]').html('Cancel').val('cancel');
		//Iterate over the fields in the row
		$(row).find('span').not('.Controls').each(function () {
			if ($(this).text() !== '') {
				var fieldName = $(this).attr('class').split(' ')[0];
				var fieldValue = $(this).text();
				//Determine if the column is 'read only'
				if ($.inArray(fieldName, obj.readOnlyColumns) < 0) {
					if ($.isPlainObject(obj.dataProvider.definition[fieldName])) {
						// If this column in the row's definition is an object, we need to build a drop down of the
						// key/value pairs available and select the one appropriate for this value.
						$(this).html('<select name="' + fieldName + '"></select>');
						for (var key in obj.dataProvider.definition[fieldName]) {
							var value = obj.dataProvider.definition[fieldName][key];
							$(this).find('select').append('<option value="' + value + '">' + key + '</option>');
						}
						$(this).attr('data-previous', obj.dataProvider.definition[fieldName][fieldValue]);
						//Store the previous value for to revert to
						$(this).find('select').val($(this).attr('data-previous'));
					} else {
						//Store the previous value for to revert to
						$(this).attr('data-previous', fieldValue);
						//Normal field
						$(this).html('<input type="text" name="' + fieldName + '" placeholder="' + fieldName + '" ' +
									 'maxlength="' + obj.maxLength + '" value="' + fieldValue + '" />');
						if (obj.inputFilter !== '') {
							var badChars = obj.getIllegalCharacterSet(obj.inputFilter).split('');
							var message = 'The following characters are illegal for this field:\n' + badChars.join(' ');
							$(this).append(obj.buildTooltip(message));
						}
					}
				} else {
					//Read only field
					$(this).text(fieldValue);
					$(this).attr('data-previous', fieldValue);
					$(this).append('<input type="hidden" name="' + fieldName + '" value="' + fieldValue + '" />');
				}
			}
		});
		$(row).find('input').first().focus();
		$(row).find('input')[0].setSelectionRange($(row).find('input').first().val().length, $(row).find('input').first().val().length);
	},
	/**
	 * Perform the reordering operation on the list elements provided.
	 * @param rows - An object representing the rows in the list.
	 */
	reorderList : function (rows) {
		var obj = this;
		var rowsToReorder = [];
		//Iterate over the rows in the view
		rows.each(function () {
			var row = $(this);
			var rowObj = {};
			//Iterate over the columns in the row to collect the values.
			row.find('span').not('.Controls').each(function () {
				rowObj.Id = row.attr('data-id');
				var className = $(this).attr('class').split(' ')[0];
				if (obj.dataProvider.definition.hasOwnProperty(className)) {
					if ($.isPlainObject(obj.dataProvider.definition[className])) {
						for (var key in obj.dataProvider.definition[className]) {
							if (key === $(this).text()) {
								rowObj[className] = obj.dataProvider.definition[className][key];
							}
						}
					} else {
						rowObj[className] = $(this).text();
					}
				}
			});
			//Push the row to the array in the new order
			rowsToReorder.push(rowObj);
		});
		//Reorder the rows at the data model / provider.
		obj.dataProvider.reorder(rowsToReorder, obj.sortColumn);
		//If onReorder is a function, fire the callback
		if ($.isFunction(obj.onReorder)) {
			obj.onReorder.apply(null, rowsToReorder);
		} else {
			//...otherwise, refresh this view.
			obj.refresh();
		}
	},
	/**
	 * Filter a string based on a regular expression pattern specified in the view. 
	 * If no pattern specified, return the input string.
	 * @param dirtyString - The string to be filtered
	 * @param pattern - The regular expression pattern to filter the string by.
	 * @returns Filtered string.
	 */
	filterString : function (dirtyString, pattern) {
		var illegalCharacters = '';
		var cleanString = '';
		if (pattern !== '') {
			cleanString = dirtyString.replace(new RegExp(pattern, 'g'), '');
			return cleanString;
		} else {
			return dirtyString;
		}
	},
	/**
	 * Builds out a tooltip element with the specified message
	 * @param message - The message to use in the tool tip
	 * @return jQuery object instance of a tool tip element
	 */
	buildTooltip : function (message) {
		var tip = $('<span class="tooltip" title="">[?]</span>');
		tip.attr('title', message);
		return tip;
	},
	/**
	 * Returns a list of type-able characters that fit within a pattern of characters 
	 * to exclude.
	 * @param pattern - The regular expression pattern to check against.
	 * @returns The filtered set string.					
	 */
	getIllegalCharacterSet : function(pattern){
		var set='1234567890-=!@#$%^&*()_+qwertyuiopasdfghjklzxcv'
			   +'bnmQWERTYUIOPASDFGHJKLZXCVBNM{}:"<>?[];\',./`~';
		//Invert the pattern to remove legal characters.
		if (pattern.search(/\[\^/g) === 0) {
			pattern = pattern.replace(/\[\^/g, '[');
		} else {
			pattern = pattern.replace('[', '[^');
		}
		return set.replace(new RegExp(pattern, 'g'), '');
	}
};
//End ListDisplay

/**
 * MethodConfigView
 * Module for handling more method configuration. This module takes composites the
 * ListView control into it's own display and overrides some of the ListView's methods.
 * @param args - Object containing parameters to be used in the constructor.
 */
var MethodConfigView = function (args) {
	var options = args || {};
	if (this instanceof MethodConfigView) {
		this.container = $(options.container);
		this.view = $(options.view);
		this.rowTemplate = options.rowTemplate;
		this.dataProvider = options.dataProvider;
		if (this.container.length === 0 || this.rowTemplate.length === 0 || this.view.length === 0) {
			throw "The container, template, and view variables must be defined!";
		}
		if (typeof this.dataProvider === 'undefined') {
			throw "The data provider is required."
		}
		if (typeof options.inputFilter !== 'undefined') {
			this.inputFilter = options.inputFilter;
		}
		if (typeof options.readOnlyColumns !== 'undefined') {
			this.readOnlyColumns = options.readOnlyColumns;
		}
		if (typeof options.maxLength !== 'undefined') {
			this.maxLength = options.maxLength;
		}
		this.exceptionHandler = options.exceptionHandler;
	} else {
		return new MethodConfigView(options);
	}
}
//Class Definition
MethodConfigView.prototype = {
	constructor : MethodConfigView,
	container : undefined,
	view : undefined,
	dataProvider : undefined,
	listView : undefined,
	inputFilter : '',
	maxLength : '-1',
	exceptionHandler : undefined,
	readOnlyColumns : ['ordinal'],
	/**
	 * Build out the UI of the control.
	 */
	build : function () {
		var obj = this;
		//Setup the container to hold this view
		if (this.container.html().length > 0) {
			this.container.empty();
		}
		//Get records as an array from the data provider
		var record = this.dataProvider.data;
		var currRow, viewport, columns, rows;
		//Get our view template
		viewport = this.view.clone();
		//Set the view name field
		viewport.find('.method_name input[name="name"]').attr('maxlength', obj.maxLength).val(record.methodName);
		if (obj.inputFilter !== '') {
			var badChars = obj.getIllegalCharacterSet(obj.inputFilter).split('');
			var message = 'The following characters are illegal for this field:\n' + badChars.join(' ');
			viewport.find('.method_name input[name="name"]').after(obj.buildTooltip(message));
		}
		//Set the record's id in the template
		viewport.attr('data-id', obj.dataProvider.id);
		//Add the view to the container
		this.container.append(viewport);
		//Load up a sub view for displaying the parameters as a list.
		this.listView = new ListView({
				container : '#content_area .section_content .rows',
				view : '#views .list_view',
				template : obj.rowTemplate,
				dataProvider : obj.dataProvider,
				readOnlyColumns : obj.readOnlyColumns,
				inputFilter : obj.inputFilter,
				maxLength : obj.maxLength,
				exceptionHandler : this.exceptionHandler,
				//Override the cancel to refresh this view.
				onCancel : function () {
					obj.refresh();
				},
				//Override the save to perform the save and refresh this view.
				onSave : function (row) {
					if(row.hasClass('adding')) {
						if (row.find('dataType').text() === 'Assertion' && obj.dataProvider.hasAssertions()) {
							alert ('An Assertion set already exists for thing method.\nOnly one assertion set is required per method.');
							obj.refresh();
							return false;
						}
						obj.listView.addRow(row);
					} else {
						obj.listView.updateRow(row);
					}
					obj.refresh();
				},
				//Override the delete  to perform a delete and refresh this view.
				onDelete : function (row) {
					if (confirm(obj.listView.deleteMessage)) {
						obj.listView.deleteRow(row);
					} else {
						$(row).removeClass('deleting');
					}
					obj.refresh();
				},
				//Append to the reorder operation to update this view on reordering.
				onReorder : function () {
					obj.refresh();
				},
				deleteMessage : 'Are you sure you wish to remove this parameter?'
			});
		//Build the sub view.
		this.listView.build();
		//Strip off the sub view's heading.
		this.container.find('.rows .section_heading').remove();
		this.container.find('.rows button[name="delete"]').text('Delete');
		//Add event handlers.
		this.attachHandlers();
		$('#processing').hide();
	},
	/**
	 * Empties out the existing content and rebuilds the UI.
	 */
	refresh : function () {
		//Ensure the data model is up to date.
		//this.dataProvider.refresh();
		this.container.empty();
		$('#processing').hide();
		this.build();
	},
	/**
	 * Add event handlers to the UI elements.
	 */
	attachHandlers : function () {
		var obj = this;
		var rows = this.container.find('.section_content .rows');
		//Handle save button
		this.container.find('.method_controls button[name="save"]').on('click', function () {
			obj.save(rows);
		});
		//Handle add parameter button
		this.container.find('.method_controls button[name="add"]').on('click', function () {
			//If we're already adding a row, cancel this.
			if (obj.container.find('.adding').length > 0) {
				return false;
			}
			//Call the sub view to append a new row.
			obj.listView.appendAddRow();
		});
	},
	/**
	 * Attempts to save updates to the service. On failure, it requests the data from the
	 * service to revert the view.

	 */
	save : function () {
		var obj = this;
		var name = '';
		var previous = obj.dataProvider.name;
		//Get the name and set in both the data model and the model's data
		$('#processing').show();
		name = obj.filterString(obj.container.find('.method_name input[name="name"]').val(), obj.inputFilter);
		if (name === '') {
			alert('The name field cannot be blank!');
			$('#processing').hide();
			return false;
		}
		if (name.length < obj.container.find('.method_name input[name="name"]').val().length) {
			if (confirm('There are illegal characters in the method name field. Filter these out?')) {
				obj.dataProvider.name = obj.filterString(name, obj.inputFilter);
				obj.dataProvider.data.methodName = obj.filterString(name, obj.inputFilter);
			} else {
				$('#processing').hide();
				return false;
			}
		} else {
			obj.dataProvider.name = obj.filterString(name, obj.inputFilter);
			obj.dataProvider.data.methodName = obj.filterString(name, obj.inputFilter);
		}
		//Attempt an update.
		try {
			obj.dataProvider.update();
			alert('Saved!');
			//If we update the method name, we have to redirect to the new method's location
			//by key. So split the id, cut off the prefix and method name and glue it back 
			//together.
			if (previous !== name) {
				var navKeys = obj.dataProvider.id.split('-');
				navKeys.shift();
				navKeys.pop();
				window.location.hash = 'className-' + navKeys.join('+');
			} else {
				obj.refresh();
			}
		} catch (ex) {
			if ($.isFunction(obj.exceptionHandler)) {
				obj.exceptionHandler('Error saving method', ex);
			}
			obj.refresh();
		}
	},
	/**
	 * Filter a string based on a regular expression pattern specified in the view. 
	 * If no pattern specified, return the input string.
	 * @param dirtyString - The string to be filtered
	 * @param pattern - The regular expression pattern to filter the string by.
	 * @returns Filtered string.
	 */
	filterString : function (dirtyString, pattern) {
		var illegalCharacters = '';
		var cleanString = '';
		if (pattern !== '') {
			cleanString = dirtyString.replace(new RegExp(pattern, 'g'), '');
			return cleanString;
		} else {
			return dirtyString;
		}
	},
	/**
	 * Builds out a tooltip element with the specified message
	 * @param message - The message to use in the tool tip
	 * @return jQuery object instance of a tool tip element
	 */
	buildTooltip : function (message) {
		var tip = $('<span class="tooltip" title="">[?]</span>');
		tip.attr('title', message);
		return tip;
	},
	/**
	 * Returns a list of type-able characters that fit within a pattern of characters 
	 * to exclude.
	 * @param pattern - The regular expression pattern to check against.
	 * @returns The filtered set string.					
	 */
	getIllegalCharacterSet : function(pattern){
		var set='1234567890-=!@#$%^&*()_+qwertyuiopasdfghjklzxcv'
			   +'bnmQWERTYUIOPASDFGHJKLZXCVBNM{}:"<>?[];\',./`~';
		//Invert the pattern to remove legal characters.
		if (pattern.search(/\[\^/g) === 0) {
			pattern = pattern.replace(/\[\^/g, '[');
		} else {
			pattern = pattern.replace('[', '[^');
		}
		return set.replace(new RegExp(pattern, 'g'), '');
	}
}
//End MethodConfigView

/**
 * SampleConfigView
 * Module that represents a test case sample configuration view.
 * @param args - An object containing parameters to be passed to the module's constructor.
 */
var SampleConfigView = function (args) {
	var options = args || {};
	if (this instanceof SampleConfigView) {
		this.container = $(options.container);
		this.view = $(options.view);
		this.rowTemplate = $(options.rowTemplate);
		this.assertionTemplate = $(options.assertionTemplate);
		this.objectView = $(options.objectView);
		this.objectFieldTemplate = $(options.objectFieldTemplate);
		//Ensure that we have all the required view elements set.
		if (typeof options.container == 'undefined' || typeof options.rowTemplate == 'undefined' || 
			typeof options.view == 'undefined' || typeof options.assertionTemplate == 'undefined' || 
			typeof options.objectView == 'undefined' || typeof options.objectFieldTemplate == 'undefined') {
			throw "The container, templates, and view variables must be defined!";
		}
		this.dataProvider = options.dataProvider;
		//Ensure that the data model is set
		if (typeof this.dataProvider === 'undefined') {
			throw "The data provider is required."
		}
		//Set other optional parameters
		if (typeof options.hiddenColumns !== 'undefined') {
			this.hiddenColumns = options.hiddenColumns;
		}
		if (typeof options.writableColumns !== 'undefined') {
			this.writableColumns = options.writableColumns;
		}
		if (typeof options.assertionColumn != 'undefined') {
			this.assertionColumn = options.assertionColumn;
		}
		if (typeof options.deleteMessage != 'undefined') {
			this.deleteMessage = options.deleteMessage;
		}
		if (typeof options.inputFilter != 'undefined') {
			this.inputFilter = options.inputFilter;
		}
		if (typeof options.parameterFilter != 'undefined') {
			this.parameterFilter = options.parameterFilter;
		}
		if (typeof options.maxLength !== 'undefined') {
			this.maxLength = options.maxLength;
		}
		this.exceptionHandler = options.exceptionHandler;
	} else {
		return new SampleConfigView(options);
	}
};
//Class Definition
SampleConfigView.prototype = {
	constructor : SampleConfigView,
	container : undefined,
	//Templates
	view : undefined,
	rowTemplate : undefined,
	assertionTemplate : undefined,
	objectView : undefined,
	objectFieldTemplate : undefined,
	//Data model
	dataProvider : undefined,
	//Other Variables
	assertionColumn : 'Assertion',
	hiddenColumns : ['ordinal'],
	writableColumns : ['value'],
	deleteMessage : 'Are you sure you wish to delete this assertion criteria? This cannot be undone.',
	inputFilter : '',
	parameterFilter : '',
	maxLength : '-1',
	exceptionHandler : undefined,
	/**
	 * Construct the List Display primary UI component.
	 */
	build : function () {
		var obj = this;
		//Setup the content area
		if (obj.container.html().length > 0) {
			obj.container.empty();
		}
		//Get records as an array from the data provider
		var records = obj.dataProvider.toArray();
		var currRow, viewport, columns, index = 0;
		//Get our view template
		viewport = obj.view.clone();
		//Set the name field
		viewport.find('.sample_name input[name="name"]').attr('maxlength', obj.maxLength).val(obj.dataProvider.name);
		if (obj.inputFilter !== '') {
			var badCharsA = obj.getIllegalCharacterSet(obj.inputFilter).split('');
			var messageA = 'The following characters are illegal for this field:\n' + badCharsA.join(' ');
			viewport.find('.sample_name input[name="name"]').after(obj.buildTooltip(messageA));
		}
		//Set the record's id in the template.
		viewport.attr('data-id', obj.dataProvider.id);
		//Iterate over the rows in this record
		for (var i = 0; i < records.length; i++) {
			var record = records[i];
			//Get the list item template
			currRow = obj.rowTemplate.clone();
			//Set the item's id
			if (record.hasOwnProperty('id')) {
				currRow.attr('data-id', record['id']);
			} else {
				currRow.attr('data-id', record[obj.dataProvider.definition.key]);
			}
			//Populate the list item's fields
			currRow.find('span').not('.Controls,.order').each(function () {
				var className = $(this).attr('class').split(' ')[0];
				if (record.hasOwnProperty(className)) {
					if ($.isPlainObject(obj.dataProvider.definition[className])) {
						//If the column in the row definition is an object, then we need to get the key for the value
						for (var key in obj.dataProvider.definition[className]) {
							if (obj.dataProvider.definition[className][key] === record[className].className) {
								$(this).html(key);
								//Assertions are handled differently from other parameters, so flag them
								if (key === obj.assertionColumn) {
									$(this).parent().attr('data-assertion', 'true');
								}	
							}
						}
					} else {
						if ($.isPlainObject(record[className])) {
							//If the value of a parameter is an object, handle it differently
							//This allows for complex data types.
							$(this).html('<input type="hidden" name="' + className + 
										 '" value="' + encodeURIComponent(JSON.stringify(record[className])) + '"/>' +
										 '<button name="object" value="edit">Edit</button>');
						} else if ($.inArray(className, obj.writableColumns) >= 0) {
							//Normal field
							$(this).html('<input type="text" placeholder="'+className+'" name="' + className + '" ' +
										 'maxlength="' + obj.maxLength + '" value="' + record[className] + '"/>');
							if (obj.parameterFilter !== '') {
								var badChars = obj.getIllegalCharacterSet(obj.parameterFilter).split('');
								var message = 'The following characters are illegal for this field:\n' + badChars.join(' ');
								$(this).append(obj.buildTooltip(message));
							}
						} else {
							//Read only field
							$(this).html(record[className]);
						}
					}
					//Hide select columns as needed.
					if($.inArray(className, obj.hiddenColumns) >= 0) {
						$(this).hide();
					}
				} else {
					$(this).hide();
				}
			});
			if (currRow.attr('data-assertion') !== 'true') {
				//Not an assertion, add the row to the parameters container
				currRow.find('.Controls').hide();
				viewport.find('.parameters .rows').append(currRow);
			} else {
				//Assertion, get the row's value to process as a set
				var assertions = record["value"];
				//Set the assertion rows id to this record's id.
				viewport.find('.assertions').attr('data-id', currRow.attr('data-id'));
				viewport.find('.assertions .heading .header').after(record['name']);
				//Build out the assertion set list.
				if (typeof assertions !== 'undefined' && assertions !== null) {
					for (var z = 0; z < assertions.length; z++) {
						var assert = assertions[z];
						//Get the assertion row template
						var assertionRow = obj.assertionTemplate.clone();
						assertionRow.attr('data-assertion', 'true');
						//Populate the columns for the assertion.
						assertionRow.children('span.Name').html('<input type="text" name="key" value="' + Object.keys(assert)[0] + '"/>');
						assertionRow.children('span.Value').html('<input type="text" name="value" value="' + assert[Object.keys(assert)[0]] + '"/>');
						//Setup the trim check box control
						assertionRow.find('input[type="checkbox"]').attr('id', 'trim'+z);
						assertionRow.find('label').attr('title', 'Status: Trim Value');
						assertionRow.find('label').attr('for', 'trim'+z);
						//Set the row's index in the array
						assertionRow.attr('data-index', index);
						index++;
						//Append the row to the assertion area.
						viewport.find('.assertions .rows').append(assertionRow);
					}					
				} else {
					viewport.find('.assertions').hide();
				}
			}
		}
		if (records.length === 0) {
			viewport.find('.parameters').hide().before('<h3>There are no parameters for this sample\'s method! '
			+ 'Please go back up to Methods,<br>select the desired method and add parameters.</h3>');
			viewport.find('.assertions').hide();
		} else if (viewport.find('.assertions').attr('data-id') === ''){
			viewport.find('.assertions').before('<h3>There is no assertion criteria for this method! '
			+ 'Please go back up to Methods,<br>select the desired method and add parameters.</h3>');
			viewport.find('.assertions').hide();
		}
		$('#processing').hide();
		//Add the view to the container
		obj.container.append(viewport);
		//Add event handlers.
		obj.attachHandlers();
	},
	/**
	 * Refresh the display of the UI
	 */
	refresh : function () {
		this.container.empty();
		this.dataProvider.refresh();
		$('#processing').hide();
		this.build();
	},
	/**
	 * Add event handlers to the UI elements.
	 */
	attachHandlers : function () {
		var obj = this;
		var lastIndex = 0;
		//Get the row areas for efficiency.
		var parameters = obj.container.find('.parameters .rows');
		var assertions = obj.container.find('.assertions .rows');
		
		//Handle records save button
		obj.container.find('button[name="save"]').on('click', function () {
			if (obj.save(parameters, assertions)) {
				alert('Saved!');
				obj.refresh();
			}
		});
		//Handle add assertion button
		obj.container.find('button[name="add"]').on('click', function () {
			lastIndex = assertions.children().length + 1;
			//Get the assertion row template
			var assertion = obj.assertionTemplate.clone();
			//Build out the fields for an assertion.
			assertion.children('span.Name').html('<input type="text" name="key" placeholder="Key" value=""/>');
			assertion.children('span.Value').html('<input type="text" name="value" placeholder="Value" value=""/>');
			//Configure the 'delete' button to be a 'cancel' button.
			assertion.find('.Controls button[name="delete"]').val('cancel').text('Cancel');
			assertion.find('.Controls input[name="trim"]').attr('id', 'trim'+lastIndex);
			assertion.find('.Controls label').attr('for', 'trim'+lastIndex);
			assertions.append(assertion);
		});
		//Handle complex object edit buttons
		obj.container.find('button[name="object"]').on('click', function () {
			//Get the row containing the button
			var row = $(this).parent().parent();
			//Complex objects are stored in a hidden field in the row, URI encoded so
			//that they don't break the HTML because of special characters.
			//So, extract the content, decode it, and parse it as an object.
			var data = JSON.parse(decodeURIComponent(row.find('.Value input[name="value"]').val()));
			if ($(this).val() === 'edit') {
				var objectView = '';
				//Set the button up as a cancel button
				$(this).val('cancel').text('Cancel');
				//Build out the view for this complex data type
				objectView = obj.buildParameterObject(data);
				//Setup the save button in the sub view.
				objectView.find('button[name="save"]').val(row.attr('data-id'));
				//Append the sub view
				row.append(objectView);
			} else if ($(this).val() === 'cancel') {
				//Reset the button
				$(this).val('edit').text('Edit');
				//Remove the sub view
				row.find('.object_view').remove();
			}
		});
		//Handle complex data type save buttons
		obj.container.find('.parameters .rows').on('click', 'button[name="save"]', function () {
			var data = {};
			//Get the row containing this item  by the row's id
			var row = $(this).parents('[data-id="' + $(this).val() + '"]');
			//Get this button's parent view (row's sub view)
			var dataObject = $(this).parent().parent();
			//Get the key / value pairs from the sub view
			dataObject.find('.fields input').each(function () {
				data[$(this).attr('name')] = obj.filterString($(this).val(), obj.inputFilter);
			});
			//Serialize, encode, and store the object
			row.find('.Value input').val(encodeURIComponent(JSON.stringify(data)));
			//Reset the button
			row.find('button[name="object"]').val('edit').text('Edit');
			//Remove the sub view
			dataObject.remove();
		});
		//Handle delete buttons on assertion criteria
		obj.container.find('.assertions .rows').on('click', 'button[name="delete"]', function () {
			//Get this button's parent row
			var row = $(this).parent().parent();
			if($(this).val() === 'delete') {
				//Remove the assertion upon user confirmation
				if (confirm(obj.deleteMessage)) {
					obj.deleteAssertion(row.parent().parent().attr('data-id'), row);
				}
			} else if ($(this).val() === 'cancel') {
				//Remove the new row
				row.remove();
			}
		});
		//Handle changing assertion values to auto-trim on confirm if trim checked.
		obj.container.find('.assertions .rows').on('change', 'input[name="value"]', function () {
			//Get the value
			var previous = $(this).val();
			//Get the field's parent row
			var row = $(this).parent().parent();
			//If the trim check box is set
			if(row.find('input[name="trim"]').is(':checked')) {
				//Trim the string
				var trimmed = previous.trim();
				//If there's a difference in the string length changed
				if(trimmed.length < previous.length) {
					//Confirm that the user wants the string change and update it.
					if (confirm('This value is extra whitespace charaters. Trim this value?')) {
						$(this).val(trimmed);
					} else {
						//Leave it alone and un-check the trim
						row.find('input[name="trim"]').prop('checked', false);
					}
				}
			}
		});
		//Handling change state on the trim check boxes.
		obj.container.find('.assertions .rows').on('click', 'input[name="trim"]', function () {
			//Get the control's parent row
			var row = $(this).parent().parent().parent().parent();
			var label = row.find('label[for="' + $(this).attr('id') + '"]');
			if ($(this).is(':checked')) {
				label.attr('title', 'Status: Trim Value');
				//Get the value for this field.
				var previous = row.find('input[name="value"]').val();
				//Trim the value
				var trimmed = previous.trim();
				//If the trimmed value and the original value differ
				if (trimmed.length < previous.length) {
					//Confirm that the user wants the string change and update it.
					if (confirm('This value is extra whitespace charaters. Trim this value?')) {
						row.find('input[name="value"]').val(trimmed);
					} else {
						//Leave it alone and un-check the box.
						$(this).prop('checked', false);
					}
				}
			} else {
				label.attr('title', 'Status: Do Not Trim Value');
			}
		});	
	},
	/**
	 * Process saving the information about this sample, it's parameters, and assertions.
	 * @param parameters - The row set containing the parameter members.
	 * @param assertions - The row set containing the assertion data.
	 * @returns Boolean success/failure
	 */
	save : function (parameters, assertions) {
		var obj = this;
		//Get the name of the sample
		var name = obj.filterString(obj.container.find('.sample_name input[name="name"]').val(), obj.inputFilter);
		//Get the record id
		var assertionId = assertions.parents('.assertions').first().attr('data-id');
		var assertionsList = [];
		$('#processing').show();
		//Set the name and id on the data model.
		if (name === '') {
			alert('The name field cannot be blank!');
			return false;
		}
		if (name.length < obj.container.find('.sample_name input[name="name"]').val().length) {
			if (confirm('There are illegal characters in the method name field. Filter these out?')) {
				obj.dataProvider.name = obj.filterString(name, obj.inputFilter);
			} else {
				$('#processing').hide();
				return false;
			}
		} else {
			obj.dataProvider.name = obj.filterString(name, obj.inputFilter);
		}
		obj.dataProvider.name = name;
		//Iterate over the parameter rows and update those fields
		parameters.children().each(function () {
			var value = '';
			var field = $(this).find('input[name="value"]');
			if (field.prop('type') === 'hidden') {
				//Complex types are stored as encoded strings in the fields
				//Because quotes break the HTML
				value = JSON.parse(decodeURIComponent(field.val()));
			} else {
				value = obj.filterString(field.val(), obj.parameterFilter);
			}
			//Set the parameter at the parameter's id
			obj.dataProvider.setParameterValue($(this).attr('data-id'), value);
		});
		//Iterate over the assertions and update those fields
		assertions.children().each(function () {
			var assertion = {};
			var key = $(this).find('input[name="key"]').val();
			var value = $(this).find('input[name="value"]').val();
			assertion[key] = value;
			assertionsList.push(assertion);
		});
		//Set the value of the assertion parameter
		obj.dataProvider.setParameterValue(assertionId, assertionsList);
		//Request the service update the data.
		try {
			obj.dataProvider.update();
			$('#processing').hide();
			return true;
		} catch (ex) {
			if ($.isFunction(obj.exceptionHandler)) {
				obj.exceptionHandler('Error saving sample', ex);
			}
			$('#processing').hide();
			return false;
		}
	},
	/**
	 * Select the assertions data member and remove the assertion at the specified index.
	 * @param id - The id of the sample parameter containing the assertion data.
	 * @param row - The row object of the assertion criteria to remove.
	 */
	deleteAssertion : function (id, row) {
		var obj = this, i = 0, assertions = [];
		//Is this really an assertion?
		if (row.attr('data-assertion') === 'true') {
			//Get the assertion parameter.
			assertions = obj.dataProvider.getParameterValue(id);
			if (typeof assertions !== 'undefined') {
				//Remove the criteria and update the data.
				assertions.splice(row.attr('data-index'), 1);
				if (obj.dataProvider.setParameterValue(id, assertions)) {
					//Remove the row from the view
					row.remove();
				}
			}
		}
	},
	/**
	 * Build the view for complex data types and return it to the caller.
	 * @param object - The object to be build out.
	 * @returns A jQuery object representing the object view.
	 */
	buildParameterObject : function (object) {
		var obj = this;
		//Get the complex data type template
		var view = obj.objectView.clone();
		var field = {};
		//Get all of the fields in the template
		var fields = view.find('.fields');
		//Iterate over the keys in the object
		for (var key in object) {
			//Get the key/value row template
			field = obj.objectFieldTemplate.clone();
			//Set the key and values for this row
			field.find('.Key').text(key);
			field.find('.Value').html('<input name="' + key + '" placeholder="' + key + '" value="' + object[key] + '"/>');
			//Add the row to the view.
			fields.append(field);
		}
		//Return the populated view to the caller.
		return view;
	},
	/**
	 * Filter a string based on a regular expression pattern specified in the view. 
	 * If no pattern specified, return the input string.
	 * @param dirtyString - The string to be filtered
	 * @param pattern - The regular expression pattern to filter the string by.
	 * @returns Filtered string.
	 */
	filterString : function (dirtyString, pattern) {
		var illegalCharacters = '';
		var cleanString = '';
		if (pattern !== '') {
			cleanString = dirtyString.replace(new RegExp(pattern, 'g'), '');
			return cleanString;
		} else {
			return dirtyString;
		}
	},
	/**
	 * Builds out a tooltip element with the specified message
	 * @param message - The message to use in the tool tip
	 * @return jQuery object instance of a tool tip element
	 */
	buildTooltip : function (message) {
		var tip = $('<span class="tooltip" title="">[?]</span>');
		tip.attr('title', message);
		return tip;
	},
	/**
	 * Returns a list of type-able characters that fit within a pattern of characters 
	 * to exclude.
	 * @param pattern - The regular expression pattern to check against.
	 * @returns The filtered set string.					
	 */
	getIllegalCharacterSet : function(pattern){
		var set='1234567890-=!@#$%^&*()_+qwertyuiopasdfghjklzxcv'
			   +'bnmQWERTYUIOPASDFGHJKLZXCVBNM{}:"<>?[];\',./`~';
		//Invert the pattern to remove legal characters.
		if (pattern.search(/\[\^/g) === 0) {
			pattern = pattern.replace(/\[\^/g, '[');
		} else {
			pattern = pattern.replace('[', '[^');
		}
		return set.replace(new RegExp(pattern, 'g'), '');
	}
}
//End SampleConfigView