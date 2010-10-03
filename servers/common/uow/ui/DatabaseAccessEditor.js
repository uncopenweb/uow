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
	
	resize: function(box) {
        dojo.marginBox(this.domNode, {w : box.w, h: box.h});
    },
	
	_setDatabaseAttr: function(database) {
        this.database = database;
		 // destroy the current widgets and dom
		this.destroyDescendants();
		dojo.empty(this.containerNode);
        if(!database) { return; }       
		this.database.fetch({
			onItem: this._onAddCollection,
			onComplete: this._onParseWidgets,
			scope: this
		});
    },

	_onAddCollection: function(item) {
		var col = item.url.split('/');
		var tmpl = dojo.cache('uow.ui.templates', 'DatabaseAccessEditorItem.html');
		var args = {
			labels : this.labels,
			collection : col[3],
			target : this.database.database + ',' + col[3],
			id : this.id + '_' + item.url
		};
		var html = dojo.replace(tmpl, args);
		dojo.place(html, this.containerNode);
		// hook events
		var a = dojo.byId('a_'+args.id);
		var tok = dojo.connect(a, 'onclick', this, function(event) {
			dojo.stopEvent(event);
			// invoke extension point
			this.onSelectCollection(args.collection);
		});
		// hook nodes
		var total = dojo.byId('total_'+args.id);
		// show total number of records
		uow.getDatabase({database: this.database.database, collection : col[3]})
			.then(dojo.hitch(this, function(db) {
				db.fetch({
					query : {},
					start : 0,
					count : 0,
					onBegin: function(size, request) {
						total.innerHTML = size;
					}
				});
			}));
	},
	
	_onParseWidgets: function() {
		dojo.parser.parse(this.containerNode);
	},
	
	onSelectCollection: function(value) {
		// extension point
	}
});