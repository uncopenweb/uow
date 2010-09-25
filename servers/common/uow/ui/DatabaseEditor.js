/**
 * High level widget containing collection and database editors for data,
 * access, and schemas.
 *
 * Copyright UNC Open Web Team 2010. All Rights Reserved.
 */
dojo.provide('uow.ui.DatabaseEditor');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dijit.form.RadioButton');
dojo.require('dijit.Toolbar');
dojo.require('dijit.form.TextBox');
dojo.require('dijit.form.FilteringSelect');
dojo.require('dijit.layout.StackContainer');
dojo.require('dijit.layout.ContentPane');
dojo.require('dijit.layout.TabContainer');
dojo.require('uow.ui.CollectionEditor');
dojo.require('dojo.i18n');
dojo.requireLocalization('uow.ui', 'DatabaseEditor');

dojo.declare('uow.ui.DatabaseEditor', [dijit._Widget, dijit._Templated], {
    widgetsInTemplate: true,
    templatePath: dojo.moduleUrl('uow.ui', 'templates/DatabaseEditor.html'),

    postMixInProperties: function() {
        this.labels = dojo.i18n.getLocalization('uow.ui','DatabaseEditor');
        // db connection for catalog list
        this._db = null;
    },

    postCreate: function() {

    },
    
    resize: function(box) {
        this.borderContainer.resize(box);
    },
    
    _onClickConnect: function(event) {
        var def = uow.getDatabase({
            database : this.dbNameWidget.attr('value'), 
            collection: '*',
            mode : 'L' // @todo: add delete support
        }).then(dojo.hitch(this, '_onListDb'));
    },
    
    _onListDb: function(db) {
        // store the list only db
        this._db = db;
        debug = this._db;
        // hook it to the filtering select for collection selection
        this.colNameWidget.attr('store', this._db);
        this.colNameWidget.attr('disabled', false);
    }
});

uow.ui.DatabaseEditor.formatCollectionLabel = function(item, store) {
    var url = store.getValue(item, 'url');
    var segs = url.split('/');
    return segs[3] || url;
};