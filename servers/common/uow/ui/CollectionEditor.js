/**
 * Grid based editor for collections with defined schemas.
 *
 * Copyright UNC Open Web Team 2010. All Rights Reserved.
 */
dojo.provide('uow.ui.CollectionEditor');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dijit._Contained');
dojo.require('dijit.Toolbar');
dojo.require('dijit.layout.BorderContainer');
dojo.require('dijit.layout.ContentPane');
dojo.require('dojox.grid.DataGrid');
dojo.require('dojox.json.schema');
dojo.require('dojo.i18n');
dojo.requireLocalization('uow.ui', 'CollectionEditor');

dojo.declare('uow.ui.CollectionEditor', [dijit._Widget, dijit._Templated, dijit._Contained], {
    // database and collection name pair as a tuple
    target : [],
    widgetsInTemplate: true,
    templatePath: dojo.moduleUrl('uow.ui', 'templates/CollectionEditor.html'),
    
    postMixInProperties: function() {
        this.labels = dojo.i18n.getLocalization('uow.ui', 'CollectionEditor');
        // fetched schema
        this._schema = null;
        // fetched db
        this._db = null;
        // grid widget
        this._grid = null;
        // undo history
        this._undo = [];
        // redo history
        this._redo = [];
        // undo mutex
        this._undoMutex = false;
    },
    
    resize: function(box) {
        this.borderContainer.resize(box);
    },
    
    _setTargetAttr: function(target) {
        this.target = target;
        // destroy any existing grid
        if(this._grid) {
            this._grid.destroyRecursive();
            this._grid = null;
        }
        // show loading indicator
        this._showGridLoading();
        // show db / col names
        this.dbNameNode.textContent = target[0];
        this.colNameNode.textContent = target[1];
        // open the new db,collection
        var def = uow.getDatabase({
            database : this.target[0], 
            collection: this.target[1],
            mode : 'crud'
        }).then(dojo.hitch(this, function(db) {
            // store the data db
            this._db = db;
            // listen for updates
            this.connect(this._db, 'onSet', '_onSetItem');
            this.connect(this._db, 'onNew', '_onNewItem');
            this.connect(this._db, 'onDelete', '_onDeleteItem');
            
            // fetch the schemas collection next
            return uow.getDatabase({
                database : 'Admin',
                collection : 'Schemas',
                mode : 'r'
            });
        })).then(dojo.hitch(this, function(schemas) {
            // fetch the schema for the db
            x = schemas.fetch({
                query : {
                    database : this.target[0],
                    collection : this.target[1]
                },
                onComplete: dojo.hitch(this, function(items) {
                    if(!items.length) {
                        // show error indicator
                        this._showGridError(this.labels.schema_error_label);
                    } else {
                        this._buildGrid(items[0].schema);
                    }
                })
            });
        }));
    },
    
    _buildGrid: function(schema) {
        // parse it to get the layout
        var layout = this._buildLayout(schema);
        // build the grid
        this._grid = new dojox.grid.DataGrid({
            store : this._db,
            structure: layout
        });
        this.connect(this._grid, 'onStyleRow', '_onStyleRow');
        this.contentPane.set('content', this._grid);
        this._grid.startup();
        this.borderContainer.layout();
    },
    
    _buildLayout: function(schema) {
        schema = dojo.fromJson(schema);
        this._schema = schema;
        var layout = [];
        for(var name in schema.properties) {
            var prop = schema.properties[name];
            var col = {};
            col.field = name;
            col.name = prop.title;
            col.title = prop.description;
            col.editable = (!prop.readonly && name != '_id');
            if(prop['enum']) {
                col.type = dojox.grid.cells.Select;
                col.options = prop['enum'];
            }
            if(prop.maxLength) {
                col.width = prop.maxLength * 4 + 'px';
            } else {
                col.width = 100 + 'px';
            }
            layout.push(col);
        }
        return layout;
    },

    _onStyleRow: function(row) {
        var item = this._grid.getItem(row.index);
        // abort if we couldn't find the item for this row
        if(!item) {return;}
        var result = dojox.json.schema.validate(item, this._schema);
        if(result.valid) {
            dojo.query('td[role="gridcell"]', row.node).style('color', '');
        } else {
            dojo.query('td[role="gridcell"]', row.node).style('color', 'red');
        }
    },
    
    _onSetItem: function(item, attr, oldValue, newValue) {
        console.log('set', attr, newValue, oldValue);
        // ignore id changes
        if(attr == '_id' || newValue == oldValue) { 
            this._grid.update();
            return; 
        }
        if(!this._undoMutex) {
            this.undoButton.attr('disabled', false);
            this._undo.push({
                action : 'set', 
                item : item, 
                attr: attr, 
                newValue: newValue,
                oldValue: oldValue
            });
        }
        // if valid, commit
        var result = dojox.json.schema.validate(item, this._schema);
        if(result.valid) {
            setTimeout(dojo.hitch(this, function() {
                this._db.save();
            }), 0);
        }
        console.log('set done');
    },
    
    _onNewItem: function(item, parentInfo) {
        console.log('new', item);
        if(!this._undoMutex) {
            this.undoButton.attr('disabled', false);
            this._undo.push({action : 'new', item : item});
        }
        // if valid, commit
        var result = dojox.json.schema.validate(item, this._schema);
        if(result.valid) {
            setTimeout(dojo.hitch(this, function() {
                this._db.save();
            }), 0);
        }
        console.log('new done');
    },
    
    _onDeleteItem: function(item) {
        console.log('delete');
        //var citem = dojo.clone(item);
        if(!this._undoMutex) {
            this.undoButton.attr('disabled', false);
            this._undo.push({action : 'delete', item : item});
        }
        console.log('delete done');
    },

    _onClickNew: function() {
        var grid = this._grid;
        var item = this._db.newItem({});
        // start editing new cell immediately
        //var count = grid.attr('rowCount');
        //var cell = grid.getCell(0);
        //setTimeout(function() { grid.edit.start(cell, count-1, true); }, 0);
    },
    
    _onClickDelete: function() {
        this._grid.removeSelectedRows();
        this._db.save();
        console.log('batch delete done');
        //this._grid.edit.apply();
        //this._db.save();
    },
    
    _onClickUndo: function() {
        // pop the last action
        var obj = this._undo.pop();
        // do the inverse
        if(obj.action == 'new') {
            // delete the item
            console.log('undoing new');
            this._undoMutex = true;
            this._db.deleteItem(obj.item);
            this._undoMutex = false;
            this._db.save();
            console.log('undo new done')
        } else if(obj.action == 'delete') {
            console.log('undoing delete');
            // insert the deleted item, sans private attributes
            var copy = {};
            console.log('deleted item id:', obj.item.__id, obj.item._id);
            for(var x in obj.item) {
                if(x.charAt(0) != '_') {
                    copy[x] = obj.item[x];
                }
            }
            this._undoMutex = true;
            var newItem = this._db.newItem(copy);
            console.log('new item id:', newItem.__id, newItem._id);
            this._undoMutex = false;
            // run through the history and fix any ids
            dojo.forEach(this._undo, function(old) {
                console.log('undo item', old.item.__id, old.item._id);
                if(old.item._id == obj.item._id) {
                    old.item = newItem;
                }
            });
            console.log('undo delete done')
        } else if(obj.action == 'set') {
            console.log('undoing set', obj.attr);
            this._undoMutex = true;
            this._db.setValue(obj.item, obj.attr, obj.oldValue);
            this._undoMutex = false;
            console.log('undo set done');
        }
        if(!this._undo.length) {
            this.undoButton.attr('disabled', true);
        }
    },
    
    _onClickRedo: function() {
        
    },
    
    _showGridLoading: function() {
        this.contentPane.attr('content', this.contentPane.loadingMessage);
    },
    
    _showGridError: function(msg) {
        msg = dojo.replace("<span class='dijitContentPaneError'>{0}</span>", [msg]);
        this.contentPane.attr('content', msg);
    }
});