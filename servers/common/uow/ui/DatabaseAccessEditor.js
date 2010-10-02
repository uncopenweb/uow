/**
 * Widget for granting access modes to roles for all collections in a db.
 *
 * Copyright UNC Open Web Team 2010. All Rights Reserved.
 */
dojo.provide('uow.ui.DatabaseAccessEditor');
dojo.require('uow.ui.CollectionAccessEditor')
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dijit._Contained');
dojo.require('dojo.i18n');
dojo.requireLocalization('uow.ui', 'DatabaseAccessEditor');

dojo.declare('uow.ui.DatabaseAccessEditor', [dijit._Widget, dijit._Templated, 
											 dijit._Container, dijit._Contained], {
    // database object
    database : null,
    widgetsInTemplate: true,
    templatePath: dojo.moduleUrl('uow.ui', 'templates/DatabaseAccessEditor.html'),

    postMixInProperties: function() {
        this.labels = dojo.i18n.getLocalization('uow.ui','DatabaseAccessEditor');
    },

	postCreate: function() {
		
	},
	
	_setDatabaseAttr: function(database) {
        this.database = database;
		 // destroy the current widgets and dom
		this.destroyDescendants();
		dojo.empty(this.containerNode);
        if(!database) { return; }       
		this.database.fetch({
			onItem: this._onAddCollection,
			scope: this
		});
    },

	_onAddCollection: function(item) {
		var col = item.url.split('/');
		var a = dojo.create('a', {href : '#'}, this.containerNode);
		var h2 = dojo.create('h2', {
			innerHTML : col[3]
		}, a);
		dojo.connect(a, 'onclick', this, function(event) {
			dojo.stopEvent(event);
			// invoke extension point
			this.onSelectCollection(col[3]);
		});
	},
	
	onSelectCollection: function(value) {
		// extension point
	}
});