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
        
    },

    postCreate: function() {

    },
    
    resize: function(box) {
        this.borderContainer.resize(box);
    }
});