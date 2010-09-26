/**
 * Widget for assigning granting access modes to roles for a single collection.
 *
 * Copyright UNC Open Web Team 2010. All Rights Reserved.
 */
dojo.provide('uow.ui.CollectionAccessEditor');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dijit.form.CheckBox');
dojo.require('dojo.i18n');
dojo.requireLocalization('uow.ui', 'DatabaseEditor');

dojo.declare('uow.ui.CollectionAccessEditor', [dijit._Widget, dijit._Templated], {
    widgetsInTemplate: true,
    templatePath: dojo.moduleUrl('uow.ui', 'templates/CollectionAccessEditor.html'),

    postMixInProperties: function() {
        this.labels = dojo.i18n.getLocalization('uow.ui','CollectionAccessEditor');
    },

    postCreate: function() {

    }
});