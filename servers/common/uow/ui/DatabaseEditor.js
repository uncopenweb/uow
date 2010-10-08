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
dojo.require('dijit.form.Button');
dojo.require('dijit.Dialog');
dojo.require('uow.ui.CollectionEditor');
dojo.require('uow.ui.CollectionSchemaEditor');
dojo.require('uow.ui.DatabaseAccessEditor');
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
        this._colSchemaWidget = null;
        this._colDataWidget = null;
        // confirm dialog
        this._confirmDialog = null;
    },

    postCreate: function() {
        // connect to catch enter on db select
        this.connect(this.dbNameWidget.domNode, 'onkeyup', '_onKeyUpConnect');
		// listen for collection change events from the db access widgets
		this.connect(this.dbAccessWidget, 'onSelectCollection', function(value) {
			this.colNameWidget.attr('value', value);
		});
    },
    
    resize: function(box) {
        this.borderContainer.resize(box);
    },
    
    uninitialize: function() {
        this._confirmDialog.destroyRecursive();
    },

	_setTabTitle: function(tab, title) {
		tab.attr('title', title);
		var tabs = this.editorTabs;
		try {
    		tabs.tablist.pane2button[tab].attr('label', title);
		} catch(e) {}
	},
	
	_getConfirmDialog: function(description) {
	    var dlg = this._confirmDialog;
	    if(!dlg) {
	        // build dialog only once
            dlg = new dijit.Dialog({title : this.labels.drop_dialog_title});
            this._confirmDialog = dlg;
            this.subscribe('/db/confirm', '_onDropResponse');
        }
        var template = dojo.cache('uow.ui.templates', 'ConfirmDialog.html');
        var args = {
            description : description,
            yes : this.labels.yes_button_label,
            no : this.labels.no_button_label
        };
        var html = dojo.replace(template, args);
        dlg.attr('content', html);
        return dlg;
	},

    _onClickConnect: function(event) {
        if(this._db) {
            this._db.close();
        }
        var db = this.dbNameWidget.attr('value');
        if(!db) { 
           this._enableDbControls(null);
        } else {
            var def = uow.manageDatabase({
                database : db
            }).then(dojo.hitch(this, '_enableDbControls'));
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
        var col = this.colNameWidget.attr('value');
        var description = dojo.replace(this.labels.drop_dialog_label, 
            [this._db.database, col]);
        var dlg = this._getConfirmDialog(description);
        dlg.show();
    },

    _onDropResponse: function(value) {
        if(value) {
            var dbName = this._db.database;
            var colName = this.colNameWidget.attr('value');
            // fetch existing collection
            this._db.fetch({
                query: {url : '/data/'+dbName+'/'+colName+'/'},
                onComplete: function(items) {
                    if(items.length == 1) {
                        this._db.deleteItem(items[0]);
                        this._db.save({
                            onComplete: function() {
                                // reset the ui
                                this.colNameWidget.attr('value', '');
                                this.dbAccessWidget.attr('database', this._db);
                                this._confirmDialog.hide();
                            },
                            scope: this
                        });
                    }
                },
                scope: this
            });
        } else {
            this._confirmDialog.hide();
        }
    },
    
    _onSelectCollection: function(value) {
        // build db/col target pair
        var target = [this._db.database, value];
        if(value) {
            this.dropButton.attr('disabled', false);
            if(this._colDataWidget) {
                // update existing tabs
                this._colDataWidget.attr('target', target);
				this._colSchemaWidget.attr('target', target);
            } else {
                // build new tabs
                this._colDataWidget = new uow.ui.CollectionEditor({
                    title : this.labels.data_tab_label,
                    target : target,
                    iconClass : 'uowCollectionData'
                });
                this.editorTabs.addChild(this._colDataWidget);
                this._colSchemaWidget = new uow.ui.CollectionSchemaEditor({
                    title : this.labels.schema_tab_label,
					target: target,
                    iconClass : 'uowCollectionSchema'
                });
                this.editorTabs.addChild(this._colSchemaWidget);
            }
			// set tab titles
			var title = dojo.replace(this.labels.data_tab_label, [value]);
			this._setTabTitle(this._colDataWidget, title);
			title = dojo.replace(this.labels.schema_tab_label, [value]);
			this._setTabTitle(this._colSchemaWidget, title);
			// switch to data tab
			if(this.editorTabs.selectedChildWidget == this.dbAccessWidget) {
				this.editorTabs.selectChild(this._colDataWidget);
			}
        } else if(this._colDataWidget) {
            this.dropButton.attr('disabled', true);
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
			// hook it to the database access view
			this.dbAccessWidget.attr('database', this._db);
			var title = dojo.replace(this.labels.database_tab_label, [db.database]);
			this._setTabTitle(this.dbAccessWidget, title);
            // enable available controls now
            this.colNameWidget.attr('disabled', false);
            // @todo: after implementing wizard
            // this.createButton.attr('disabled', false);
            this.stackWidget.selectChild(this.editorTabs);
        } else {
            // clear collection choices
            this._db = null;
			this.dbAccessWidget.attr('database', null);
            this.colNameWidget.attr('store', null);
            // go back to idle
            this.colNameWidget.attr('disabled', true);
            // @todo
            // this.createButton.attr('disabled', true);
            this.stackWidget.selectChild(this.idlePane);
        }
    }
});

uow.ui.DatabaseEditor.formatCollectionLabel = function(item, store) {
    var url = store.getValue(item, 'url');
    var segs = url.split('/');
    return segs[3] || url;
};