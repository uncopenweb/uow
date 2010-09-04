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
dojo.require('dojo.i18n');
dojo.requireLocalization('uow.ui', 'CollectionEditor');

dojo.declare('uow.ui.CollectionEditor', [dijit._Widget, dijit._Templated], {
    // database name
    database: '',
    // collection name
    collection: '',
    widgetsInTemplate: true,
    templatePath: dojo.moduleUrl('uow.ui', 'templates/CollectionEditor.html'),
    
    postMixInProperties: function() {
        this.labels = dojo.i18n.getLocalization('uow.ui', 'CollectionEditor');
        // fetched schema
        this._schema = null;
        // fetched db
        this._db = null;
    },
    
    postCreate: function() {
        var def = uow.getDatabase({
            database : this.database, 
            collection: this.collection
        }).then(dojo.hitch(this, function(db) {
            // store the data db
            this._db = db;
            // fetch the schemas collection next
            return uow.getDatabase({
                database : 'Admin',
                collection : 'Schemas'
            });
        })).then(dojo.hitch(this, function(schemas) {
            // fetch the schema for the db
            x = schemas.fetch({
                query : {
                    database : this.database,
                    collection : this.collection
                },
                onComplete: dojo.hitch(this, function(items) {
                    this._buildGrid(items[0]);
                })
            });
        }));
    },
    
    _buildGrid: function(schema) {
        this._schema = schema;
        var layout = [
            {
                field: 'user',
                name: 'User ID',
                width: '50%'
            },
            {
                field: 'role',
                name: 'Role',
                width: '50%'
            }
        ];
        
        this.grid = new dojox.grid.DataGrid({
            store: this._db,
            structure: layout
        });
        this.borderContainer.addChild(this.grid);
        this.borderContainer._setupChild(this.grid.domNode);
    }
});