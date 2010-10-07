/**
 * Widget for editing and validating JSON schemas.
 *
 * Copyright UNC Open Web Team 2010. All Rights Reserved.
 */
dojo.provide('uow.ui.CollectionSchemaEditor');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dijit._Contained');
dojo.require('dijit.Toolbar');
dojo.require('dijit.layout.BorderContainer');
dojo.require('dijit.layout.ContentPane');
dojo.require('dijit.form.Button');
dojo.require('dojox.json.schema');
dojo.require('dojo.i18n');
dojo.requireLocalization('uow.ui', 'CollectionSchemaEditor');

dojo.declare('uow.ui.CollectionSchemaEditor', [dijit._Widget, dijit._Templated, dijit._Contained], {
    // database and collection name pair as a tuple
    target : [],
    widgetsInTemplate: true,
    templatePath: dojo.moduleUrl('uow.ui', 'templates/CollectionSchemaEditor.html'),

    postMixInProperties: function() {
        this.labels = dojo.i18n.getLocalization('uow.ui','CollectionSchemaEditor');
        // Admin database, Schemas collection 
        this._db = null;
    },

    resize: function(box) {
        this.borderContainer.resize(box);
    },

    _getSchemaCollection: function() {
        if(!this._db) {
            return uow.getDatabase({
                database : 'Admin', 
                collection: 'Schemas',
                mode : 'crud'
            });
        } else {
            var def = new dojo.Deferred();
            def.callback(this._db);
            return def;
        }
    },

    _setTargetAttr: function(target) {
        this.target = target;
        if(!this.target || !this.target.length) { return; }
        // show loading indicator
        this._showSchemaLoading();
        // show db / col names
        this.dbNameNode.textContent = target[0];
        this.colNameNode.textContent = target[1];
        // get the schema collection
        var def = this._getSchemaCollection();
        def.then(dojo.hitch(this, function(db) {
            this._db = db;
            this._fetchSchema();
        }));
    },
    
    _fetchSchema: function() {
        // fetch the schema for the target db/col
        this._db.fetch({
            query : {
                database : this.target[0],
                collection : this.target[1]
            },
            onComplete: dojo.hitch(this, function(items) {
                if(items.length > 1) {
                    this._showSchemaError(this.labels.schema_error_label);
                } else {
                    this._showSchema(items[0].schema);
                }
            })
        });
    },

    _onChangeText: function(event) {
        // make sure the json is at least valid, even if the schema isn't
        try {
            dojo.fromJson(this.textNode.value);
            this.saveButton.attr('disabled', false);
        } catch(e) {
            this.saveButton.attr('disabled', true);
        }
    },

    _onClickSave: function(event) {
        var schema = this.textNode.value;
        var args = {
            database : this.target[0], 
            collection : this.target[1]
        };
        this._db.fetch({
            query : args,
            onComplete: function(items) {
                if(items.length) {
                    // @todo: handle more than one match, that's badness
                    this._db.setValue(items[0], 'schema', schema);
                } else {
                    // create a new item to hold the permission
                    args.schema = schema;
                    this._db.newItem(args);
                }
                this._db.save();
            },
            scope: this
        });
    },
    
    _onClickRefresh: function(event) {
        this._fetchSchema();
    },
    
    _showSchema: function(schema) {
        this.textNode.value = schema;
        this.contentPane.attr('content', this.textNode);
        this.saveButton.attr('disabled', false);
    },

    _showSchemaLoading: function() {
        this.contentPane.attr('content', this.contentPane.loadingMessage);
        this.saveButton.attr('disabled', true);
    },
    
    _showSchemaError: function(msg) {
        msg = dojo.replace("<span class='dijitContentPaneError'>{0}</span>", [msg]);
        this.contentPane.attr('content', msg);
        this.saveButton.attr('disabled', true);
    }
});