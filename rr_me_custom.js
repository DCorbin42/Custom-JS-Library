/**
 * rr_myevolv_custom.js
 * @fileoverview This file extends the library of functions available to use in myEvolv
 * @author Dean Corbin
 * @copyright 2025 Red Raven Consulting, LLC. All Rights Reserved.
 * @version 1.0.0
 * @since 2025-11-25
 */


function CreateFormLine(column, value, udf, el, typeCode) {
    var formLine = {};
    formLine.isDirty = true;
    formLine.columnName = column;
    formLine.value = value;
    formLine.ddColumnsId = "filler";
    formLine.typeCode = typeCode|| "S";
    formLine.userDefined = udf || false;
    formLine.useEventLog = el || false;
    return formLine;
}


function CreateForm(dataTable, keyValue, formMode, extensible, useEventLog) {
    var form = {};
    form.dataTable = dataTable;
    form.primaryKey = dataTable + "_id";
    form.hasData = true;
    form.formCode = null;
    form.keyValue = keyValue;
    form.isEditAllowed = true;
    form.FormLines = [];
    form.formMode = formMode;
    form.parentColumn = "";
    form.parentTable = "";
    form.dataExtensible = extensible || false;
    form.useEventLog = useEventLog || false;
    return form;
}


/*  
*	click2Open
*	Retrieves data attributes from the html element in order to launch an event form in VIEW or EDIT mode
*	DRC 06/11/2025
*
*	Required HTML data attributes:
*		data-event-log-id : this is the event_log_id of the event to be launched
*		data-event-definition-id : this is the event_definition_id of the event to be launched
*		data-form-header-id : this is the form_header_id of the form to be used on launch
*		data-form-mode: Must be "VIEW" or "EDIT" - determine which mode the event being opened will be in upon opening
*		data-win-title : this is the title of the window that will be launched (may be replaced by form name after event completes loading)
*		
*	Usage:  On the myEvolv form where you have elements that you want to become clickable to launch an existing event, add 
*			$(<selector>).on('click', click2Open);
*			within the After Load code or elsewhere to give the selected elements click2Open capabilities
*
*/	
function click2Open(event){
    event.preventDefault();
	
	//Required HTML Data Attributes
	var eventLogId = $(this).data('event-log-id');
	var eventDefinition = $(this).data('event-definition-id');
	var formHeader = $(this).data('form-header-id');
	var formMode = $(this).data('form-mode');
	var winTitle = $(this).data('win-title');
	
	//Optional HTML Data Attributes
	var belongs2Event = $(this).data('belongs2event-id');
	
	//is_edit_allowed Logic
	var isEditAllowed = false;
	if(formMode == "EDIT"){
		isEditAllowed = true;
	}
	
	var properties = {windowName: winTitle};
	var url = buildUrl('Form.aspx', {
		'parent_value': belongs2Event ? belongs2Event : parentValue,  // Sets the parentValue fo the new form to be the same as the origin form unless belongs2Event is set
		'mode': formMode,
		'unit_id': null,
		'key_value': eventLogId,
		'event_id': eventDefinition,
		'form_header_id': formHeader,
		'service_track': serviceTrack,  //This value is coming from the origin form
		'module_code': 'CLIENTS',
		'belongs2event': null,
		'unit': null,
		'rp': null,
		'is_add_allowed': false,
		'is_edit_allowed': isEditAllowed,
		'is_delete_allowed': false,
		'caller': 'Listing',
		'data': 'SERVER',
		'isCompleteScheduledEvent': false,
		'winTitle': winTitle
	});
	
	openRadWindowEx(winTitle, url, properties);
}


/*  
*	click2Add
*	Retrieves data attributes from the html element in order to launch an event form in ADD mode
*	DRC 06/11/2025
*
*	Required HTML data attributes:
*		data-event-definition-id : this is the event_definition_id of the event to be launched
*		data-form-header-id : this is the form_header_id of the form to be used on launch
*		data-win-title : this is the title of the window that will be launched (may be replaced by form name after event completes loading)
*		
*	Optional HTML data attributes:
*		data-belongs2event-id : if present, the event that launches will have this value set as its belongs2event_id
*		data-problem-library-id:  if present, the event that launches will be linked to this problem-library-id - used for creating new needs
*		data-need-id: if present, the event that launches can be linkesd to this problem event - used for creating new resources		
*		data-events2do-event-definition-id:  used for adding scheduled tasks - sets the event_definition_id in the task scheduling form
*		
*		
*	Usage:  On the myEvolv form where you have elements that you want to become clickable to launch a new event, add 
*			$(<selector>).on('click', click2Add);
*			within the After Load code or elsewhere to give the selected elements click2Add capabilities
*
*/	
function click2Add(event){
    event.preventDefault();
	
	//Required HTML Data Attributes
	var eventDefinition = $(this).data('event-definition-id');
	var formHeader = $(this).data('form-header-id');
	var winTitle = $(this).data('win-title');
	
	//Optional HTML Data Attributes
	var belongs2Event = $(this).data('belongs2event-id');
	sessionStorage.setItem("belongs_to_event", belongs2Event);
	
	var problemLibraryId = $(this).data('problem-library-id');
	sessionStorage.setItem("problem_library_id", problemLibraryId);
	
	var needId = $(this).data('need-id');
	sessionStorage.setItem("need_id", needId);
	
	sessionStorage.setItem("people_id", parentValue);
	
	var events2doEventDefinitionId = $(this).data('events2do-event-definition-id');
	sessionStorage.setItem("events2do_event_definition_id", events2doEventDefinitionId);
	
	var properties = {windowName: winTitle};
	var url = buildUrl('Form.aspx', {
		'parent_value': belongs2Event ? belongs2Event : parentValue,  // Sets the parentValue of the new form to be the same as the origin form unless belongs2Event is set
		'mode': 'ADD',
		'unit_id': null,
		'key_value': 'new', // This is a new event, so there will be no key_value until save
		'event_id': eventDefinition,
		'form_header_id': formHeader,
		'service_track': serviceTrack,  //This value is coming from the origin form
		'module_code': 'CLIENTS',
		'belongs2event': belongs2Event,
		'unit': null,
		'rp': null,
		'is_add_allowed': true,
		'is_edit_allowed': true,
		'is_delete_allowed': false,
		'caller': 'Listing',
		'data': 'SERVER',
		'isCompleteScheduledEvent': false,
		'winTitle': winTitle
	});
	
	openRadWindowEx(winTitle, url, properties);
}

/*  
*	click2Complete
*	Retrieves data attributes from the html element in order to launch an event form in ADD mode that will complete a related scheduled task
*	DRC 06/16/2025
*
*	Required HTML data attributes:
*		data-events2do-id : this is the events2do_id of the scheduled task to be completed
*		data-event-definition-id : this is the event_definition_id of the event to be launched
*		data-form-header-id : this is the form_header_id of the form to be used on launch
*		data-win-title : this is the title of the window that will be launched (may be replaced by form name after event completes loading)
*		
*	Optional HTML data attributes:
*		data-belongs2event-id : if present, the event that launches will have this value set as its belongs2event_id
*		
*		
*	Usage:  On the myEvolv form where you have elements that you want to become clickable to complete, add 
*			$(<selector>).on('click', click2Complete);
*			within the After Load code or elsewhere to give the selected elements click2Complete capabilities
*
*/	
function click2Complete(event){
    event.preventDefault();
	
	//Required HTML Data Attributes
	var events2Do = $(this).data('events2do-id');
	var eventDefinition = $(this).data('event-definition-id');
	var formHeader = $(this).data('form-header-id');
	var winTitle = $(this).data('win-title');
	
	//Optional HTML Data Attributes
	var belongs2Event = $(this).data('belongs2event-id');
	sessionStorage.setItem("belongs_to_event", belongs2Event);	
	
	var properties = {windowName: winTitle};
	var url = buildUrl('Form.aspx', {
		'parent_value': parentValue,  // Sets the parentValue of the new form to be the same as the origin form unless belongs2Event is set
		'mode': 'ADD',
		'unit_id': null,
		'key_value': events2Do,
		'events2do_id': events2Do,
		'event_id': eventDefinition,
		'form_header_id': formHeader,
		'service_track': serviceTrack,  //This value is coming from the origin form
		'module_code': 'CLIENTS',
		'belongs2event': belongs2Event,
		'unit': null,
		'rp': null,
		'is_add_allowed': true,
		'is_edit_allowed': true,
		'is_delete_allowed': false,
		'caller': 'Listing',
		'data': 'SERVER',
		'isCompleteScheduledEvent': true,
		'winTitle': winTitle
	});
	
	openRadWindowEx(winTitle, url, properties);
}


/*  
*	click2View
*	Retrieves data attributes from the html element in order to launch an formset member
*	DRC 06/11/2025
*
*	Required HTML data attributes:
*		data-form-header-id : this is the form_header_id of the form to be used on launch
*		data-module : this is the module_id of the formset member to be launched
*		data-formset-member : this is the formset_member_id of the formset member to be launched
*		data-form-mode: this value sets the mode that the form will open in - 'VIEW' or 'EDIT' [optional -- default 'VIEW']
*		data-win-title : this is the title of the window that will be launched (may be replaced by form name after event completes loading)
*		
*	Optional HTML data attributes:
*		data-belongs2event-id : if present, the event that launches will have this value set as its belongs2event_id
*		data-problem-library-id: if present, the problem_library_id value will be set in sessionStorage for use on the opening form
*		
*		
*	Usage:  On the myEvolv form where you have elements that you want to become clickable to launch a formset member, add 
*			$(<selector>).on('click', click2View);
*			within the After Load code or elsewhere to give the selected elements click2View capabilities
*
*/		
function click2View(event){
    event.preventDefault();
	
	var formHeader = $(this).data('form-header-id');
	var formFamily = getDataValue('form_header', 'form_header_id', formHeader, 'form_family_id');
	var module = $(this).data('module');
	var formsetMember = $(this).data('formset-member');
	var formMode = $(this).data('form-mode');
	var winTitle = $(this).data('win-title');
	
	//Optional HTML Data Attributes
	var belongs2Event = $(this).data('belongs2event-id');
	
	var isEditAllowed = false;
	if(formMode == "EDIT"){
		isEditAllowed = true;
	}
	
	var problemLibraryId = $(this).data('problem-library-id');
	sessionStorage.setItem("problem_library_id", problemLibraryId);
	
	var properties = {windowName: winTitle};
	var url = buildUrl('Form.aspx', {
		'defaultForm': formHeader,
		'fsm': formsetMember,
		'form_set_members_id': formsetMember,
		'form_header_id': formHeader,
		'parent_value': belongs2Event ? belongs2Event : parentValue,   // Sets the parentValue of the new form to be the same as the origin form unless belongs2Event is set
		'form_family_id': formFamily,
		'event_category': null,
		'event_groups_id': null,
		'parent_column': 'people_id',  
		'modules_id': module,
		'module_code': 'CLIENT',
		'useEventLog': false,
		'unit_id': null,
		'service_track': serviceTrack,  //This value is coming from the origin form
		'belongs2event': null,
		'mode': !formMode ? 'VIEW' : formMode,
		'doModuleRefresh': true,
		'apply_security': true,
		'is_add_allowed': false,
		'is_edit_allowed': isEditAllowed,
		'is_delete_allowed': false,
		'useBelongs2': false,
		'rp': null,
		'caller': 'FormSetMember',
		'defaultFormEvents2Do': null,
		'winTitle': winTitle
	});
	
	openRadWindowEx(winTitle, url, properties);
}
