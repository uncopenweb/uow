/**
 * Grid based editor for collections with defined schemas.
 *
 * Copyright UNC Open Web Team 2010. All Rights Reserved.
 */
dojo.provide('uow.ui.CollectionEditor');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dijit.Toolbar');
dojo.require('dijit.layout.BorderContainer');
dojo.require('dijit.layout.ContentPane');
dojo.require('dojox.grid.DataGrid');
dojo.require('dojox.json.schema');
dojo.require('dojo.i18n');
dojo.requireLocalization('uow.ui', 'CollectionEditor');

dojo.declare('uow.ui.CollectionEditor', [dijit._Widget, dijit._Templated], {
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
        // grid
        this._grid = null;
    },
    
    postCreate: function() {
        
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
            this.connect(this._db, 'onInsert', '_onInsertItem');
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
        var result = dojox.json.schema.validate(item, this._schema);
        if(result.valid) {
            setTimeout(dojo.hitch(this._db, 'save'), 0);
        }
    },
    
    _onInsertItem: function(item, parentInfo) {
        
    },
    
    _onDeleteItem: function(item) {
        
    },

    _onClickNew: function() {
        var grid = this._grid;
        var item = this._db.newItem({});
        // start editing new cell immediately
        var count = grid.attr('rowCount');
        var cell = grid.getCell(0);
        setTimeout(function() { grid.edit.start(cell, count-1, true); }, 0);
    },
    
    _onClickDelete: function() {
        this._grid.removeSelectedRows();
        this._grid.edit.apply();
        this._db.save();
    },
    
    _onClickUndo: function() {
        
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