/**
 * Widget for editing and validating JSON schemas.
 *
 * Copyright UNC Open Web Team 2010. All Rights Reserved.
 */
dojo.provide('uow.ui.CollectionSchemaEditor');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dijit._Contained');
dojo.require('dijit.form.Button');
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
        dojo.marginBox(this.textNode, {w : box.w, h: box.h});
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
		// @todo: disable the text area
        // @todo: show loading indicator
		// get the schema collection
		var def = this._getSchemaCollection();
		def.then(dojo.hitch(this, function(db) {
            this._db = db;
            // fetch the schema for the target db/col
            db.fetch({
                query : {
                    database : this.target[0],
                    collection : this.target[1]
                },
                onItem: dojo.hitch(this, function(item) {
                    this.textNode.value = item.schema;
                })
            });
        }));
    }
});