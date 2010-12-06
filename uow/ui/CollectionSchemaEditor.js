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
        // last text for save comparison
        this._lastText = null;
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
    
    _cleanUpData: function(o) {
        // clean up the CRAP they put in objects from the database
        var res;
        if (typeof(o) == 'object') {
            res = {};
            for(var p in o) {
                if (p[0] != '_') {
                    res[p] = this._cleanUpData(o[p])
                }
            }
        } else if(typeof(o) == 'array') {
            res = [];
            for(var i = 0; i < o.length; i++) {
                res[i] = this._cleanUpData(o[i]);
            }
        } else {
            res = o;
        }
        return res;
    },
    
    _fetchSchema: function() {
        // fetch the schema for the target db/col
        var args = {
            database : this.target[0],
            collection : this.target[1]
        };
        this._db.fetch({
            query : args,
            onComplete: function(items) {
                if(items.length > 1) {
                    this._showSchemaError(this.labels.schema_error_label);
                } else if(items.length == 1) {
                    this._showSchema(dojo.toJson(this._cleanUpData(items[0].schema), true));
                } else {
                    this._showSchema('');
                }
            },
            scope: this
        });
    },

    _onChangeText: function(event) {
        // make sure the json is at least valid, even if the schema isn't
        var text = this.textNode.value;
        var valid = false;
        try {
            dojo.fromJson(text);
            valid = true;            
        } catch(e) {
        }
        this.saveButton.attr('disabled', false);
        if(valid) {
            dojo.removeClass(this.textNode, 'uowCollectionSchemaEditorInvalid');
            if(this._lastText !== text) {
                this.saveButton.attr('disabled', false);
            } else {
                this.saveButton.attr('disabled', true);
            }
        } else {
            dojo.addClass(this.textNode, 'uowCollectionSchemaEditorInvalid');
            this.saveButton.attr('disabled', true);
        }
    },

    _onClickSave: function(event) {
        var schema = dojo.fromJson(this.textNode.value);
        var args = {
            database : this.target[0], 
            collection : this.target[1]
        };
        this._db.fetch({
            query : args,
            onComplete: function(items) {
                var item;
                if(items.length) {
                    // @todo: handle more than one match, that's badness
                    this._db.setValue(items[0], 'schema', schema);
                    item = items[0];
                } else {
                    // create a new item to hold the permission
                    args.schema = schema;
                    item = this._db.newItem(args);
                }
                this._db.save({
                    onComplete: function() {
                        // indicate we have saved
                        this._lastText = item.schema;
                        dojo.removeClass(this.textNode, 'uowCollectionSchemaEditorInvalid');
                        this.saveButton.attr('disabled', true);
                    },
                    scope : this
                });
            },
            scope: this
        });
    },
    
    _onClickRefresh: function(event) {
        this._fetchSchema();
    },
    
    _onClickGuess: function(event) {
        uow.getDatabase({
            database: this.target[0],
            collection: this.target[1],
            mode: 'r'
        }).then(dojo.hitch(this, function(db) {
            db.fetch({
                query: {},
                count: 1,
                onItem: dojo.hitch(this, function(item) {
                    var schema = this._guessSchema(item);
                    this._showSchema(dojo.toJson(schema, true));
                    this.saveButton.attr('disabled', false);
                }),
                scope: this
            });
        }));
    },
    
    _guessSchema: function(item) {
        if (typeof(item) === 'string') {
            return { type: 'string' };
        } else if (dojo.isArray(item)) {
            return { type: 'array',
                     items: this._guessSchema(item[0]) };
        } else if (typeof(item) === 'number') {
            if (Math.floor(item) === item) {
                return { type: 'integer' };
            } else {
                return { type: 'number' };
            }
        } else if (typeof(item) === 'object') {
            var r = { type: 'object',
                      properties: {} };
            for (var p in item) {
                if (!p.match(/_/)) {
                    r.properties[p] = this._guessSchema(item[p]);
                }
            }
            return r;
        } else {
            return { type: 'unknown' };
        }
    },
    
    _showSchema: function(schema) {
        this._lastText = schema;
        this.textNode.value = schema;
        this.contentPane.attr('content', this.textNode);
        this.saveButton.attr('disabled', true);
        dojo.removeClass(this.textNode, 'uowCollectionSchemaEditorInvalid');
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
