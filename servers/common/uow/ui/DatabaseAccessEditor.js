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

dojo.declare('uow.ui.CollectionAccessEditor', [dijit._Widget, dijit._Templated, 
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
        if(!database) { return; }
        // destroy the current widgets
		this.destroyDescendants();
		// @todo: destroy the child nodes?
		this.database.fetch({
			onItem: this._onPopulate,
			scope: this
		});
    },

	_onAddCollection: function(item) {
		console.log(item);
	}
});