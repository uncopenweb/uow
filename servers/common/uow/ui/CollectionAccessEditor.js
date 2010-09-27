/**
 * Widget for assigning granting access modes to roles for a single collection.
 *
 * Copyright UNC Open Web Team 2010. All Rights Reserved.
 */
dojo.provide('uow.ui.CollectionAccessEditor');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dijit._Contained');
dojo.require('dijit.form.CheckBox');
dojo.require('dojo.i18n');
dojo.requireLocalization('uow.ui', 'CollectionAccessEditor');

dojo.declare('uow.ui.CollectionAccessEditor', [dijit._Widget, dijit._Templated, dijit._Contained], {
    widgetsInTemplate: true,
    templatePath: dojo.moduleUrl('uow.ui', 'templates/CollectionAccessEditor.html'),

    postMixInProperties: function() {
        this.labels = dojo.i18n.getLocalization('uow.ui','CollectionAccessEditor');
    },

    postCreate: function() {
        // build checkboxes
        var modes = dojo.query('th[data-mode]', this.tableHead)
            .map('return item.getAttribute("data-mode")');
        var rows = dojo.query('tr[data-role]', this.tableBody);
        var roles = rows.map('return item.getAttribute("data-role")');
        rows.forEach(function(tr, i) {
            var role = roles[i];
            dojo.forEach(modes, function(mode) {
                var td = dojo.create('td', null, tr);
                var cb = new dijit.form.CheckBox();
                dojo.place(cb.domNode, td);
                this.connect(cb, 'onChange', 
                    dojo.partial(this.onCheck, role, mode));
            }, this);
        }, this);
    },
    
    resize: function(box) {
        dojo.marginBox(this.tableNode, {w : box.w});
    },
    
    onCheck: function(role, mode, value) {
        console.log(role, mode, value);
    }
});