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
	// JSON schema's schema
	schemaJSON: '{"$schema":"http://json-schema.org/hyper-schema#","id":"http://json-schema.org/schema#","type":"object","properties":{"type":{"type":["string","array"],"items":{"type":["string",{"$ref":"#"}]},"optional":true,"uniqueItems":true,"default":"any"},"properties":{"type":"object","additionalProperties":{"$ref":"#"},"optional":true,"default":{}},"items":{"type":[{"$ref":"#"},"array"],"items":{"$ref":"#"},"optional":true,"default":{}},"optional":{"type":"boolean","optional":true,"default":false},"additionalProperties":{"type":[{"$ref":"#"},"boolean"],"optional":true,"default":{}},"requires":{"type":["string",{"$ref":"#"}],"optional":true},"minimum":{"type":"number","optional":true},"maximum":{"type":"number","optional":true},"minimumCanEqual":{"type":"boolean","optional":true,"requires":"minimum","default":true},"maximumCanEqual":{"type":"boolean","optional":true,"requires":"maximum","default":true},"minItems":{"type":"integer","optional":true,"minimum":0,"default":0},"maxItems":{"type":"integer","optional":true},"uniqueItems":{"type":"boolean","optional":true,"default":false},"pattern":{"type":"string","optional":true,"format":"regex"},"minLength":{"type":"integer","optional":true,"minimum":0,"default":0},"maxLength":{"type":"integer","optional":true},"enum":{"type":"array","optional":true,"minItems":1,"uniqueItems":true},"title":{"type":"string","optional":true},"description":{"type":"string","optional":true},"format":{"type":"string","optional":true},"contentEncoding":{"type":"string","optional":true},"default":{"type":"any","optional":true},"divisibleBy":{"type":"number","minimum":0,"minimumCanEqual":false,"optional":true,"default":1},"disallow":{"type":["string","array"],"items":{"type":"string"},"optional":true,"uniqueItems":true},"extends":{"type":[{"$ref":"#"},"array"],"items":{"$ref":"#"},"optional":true,"default":{}}},"optional":true,"default":{}}',
    widgetsInTemplate: true,
    templatePath: dojo.moduleUrl('uow.ui', 'templates/CollectionSchemaEditor.html'),

    postMixInProperties: function() {
        this.labels = dojo.i18n.getLocalization('uow.ui','CollectionSchemaEditor');
        // Admin database, Schemas collection 
        this._db = null;
		// JSON schema's schema
		this._schema = dojox.json.ref.fromJson(this.schemaJSON);
		console.log(this._schema);
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
            // fetch the schema for the target db/col
            db.fetch({
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
        }));
    },

	_onChangeText: function(event) {
		// validate against json schema
		var obj = dojo.fromJson(this.textNode.value);
		console.log('obj', obj);
		console.log('schema', this._schema);
		var result = dojox.json.schema.validate(obj, this._schema);
		console.log(result);
	},

	_onClickSave: function(event) {
		
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