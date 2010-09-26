/**
 * High level widget containing collection and database editors for data,
 * access, and schemas.
 *
 * Copyright UNC Open Web Team 2010. All Rights Reserved.
 */
dojo.provide('uow.ui.DatabaseEditor');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dijit._Contained');
dojo.require('dijit.Toolbar');
dojo.require('dijit.form.RadioButton');
dojo.require('dijit.form.TextBox');
dojo.require('dijit.form.FilteringSelect');
dojo.require('dijit.layout.StackContainer');
dojo.require('dijit.layout.ContentPane');
dojo.require('dijit.layout.TabContainer');
dojo.require('uow.ui.CollectionEditor');
dojo.require('dojo.i18n');
dojo.requireLocalization('uow.ui', 'DatabaseEditor');

dojo.declare('uow.ui.DatabaseEditor', [dijit._Widget, dijit._Templated, dijit._Contained], {
    widgetsInTemplate: true,
    templatePath: dojo.moduleUrl('uow.ui', 'templates/DatabaseEditor.html'),

    postMixInProperties: function() {
        this.labels = dojo.i18n.getLocalization('uow.ui','DatabaseEditor');
        // database connections
        this._db = null;
        this._col = null;
        
        // collection views
        this._dbAccessWidget = null;
        this._colAccessWidget = null;
        this._colSchemaWidget = null;
        this._colDataWidget = null;
    },

    postCreate: function() {
        // connect to private methods
        this.connect(this.dbNameWidget.domNode, 'onkeyup', '_onKeyUpConnect');
    },
    
    resize: function(box) {
        this.borderContainer.resize(box);
    },

    _onClickConnect: function(event) {
        var db = this.dbNameWidget.attr('value');
        if(!db) { 
           this._enableDbControls(null);
        } else {
            var def = uow.getDatabase({
                database : db, 
                collection: '*',
                mode : 'LD'
            }).then(dojo.hitch(this, '_onListDb'));
        }
    },
    
    _onKeyUpConnect: function(event) {
        if(event.keyCode == dojo.keys.ENTER) {
            this._onClickConnect();
        }
    },

    _onClickCreate: function() {
        
    },
    
    _onClickDrop: function() {
        
    },
    
    _onListDb: function(db) {
        this._enableDbControls(db);
    },
    
    _onSelectCollection: function(value) {
        if(value && !this._colDataWidget) {
            this.dropButton.attr('disabled', false);
            this._colDataWidget = new dijit.layout.ContentPane({
                title : this.labels.data_tab_label,
                iconClass : 'uowCollectionData'
            });
            this.editorTabs.addChild(this._colDataWidget);
            this._colSchemaWidget = new dijit.layout.ContentPane({
                title : this.labels.schema_tab_label,
                iconClass : 'uowCollectionSchema'
            });
            this.editorTabs.addChild(this._colSchemaWidget);
            this._colAccessWidget = new dijit.layout.ContentPane({
                title : this.labels.access_tab_label,
                iconClass : 'uowCollectionAccess'
            });
            this.editorTabs.addChild(this._colAccessWidget);            
        } else if(!value && this._colDataWidget) {
            this.dropButton.attr('disabled', true);
            this.editorTabs.removeChild(this._colAccessWidget);
            this._colAccessWidget = null;
            this.editorTabs.removeChild(this._colSchemaWidget);
            this._colSchemaWidget = null;
            this.editorTabs.removeChild(this._colDataWidget);
            this._colDataWidget = null;
        }
    },
    
    _enableDbControls: function(db) {
        // clear collection choice no matter what
        this.colNameWidget.attr('value', '');
        if(db) {
            // store the list only db
            this._db = db;
            // hook it to the filtering select for collection selection
            this.colNameWidget.attr('store', this._db);
            // enable available controls now
            this.colNameWidget.attr('disabled', false);
            this.createButton.attr('disabled', false);
            this.stackWidget.selectChild(this.editorTabs);
        } else {
            // clear collection choices
            this._db = null;
            this.colNameWidget.attr('store', null);
            // go back to idle
            this.colNameWidget.attr('disabled', true);
            this.createButton.attr('disabled', true);
            this.stackWidget.selectChild(this.idlePane);
        }
    }
});

uow.ui.DatabaseEditor.formatCollectionLabel = function(item, store) {
    var url = store.getValue(item, 'url');
    var segs = url.split('/');
    return segs[3] || url;
};