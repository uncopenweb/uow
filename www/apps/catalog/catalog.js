/**
 * Startup script for the UOW catalog application.
 *
 * :requires: Dojo 1.4.x
 * :copyright: Gary Bishop, Peter Parente 2010
 * :license: BSD
 */
dojo.provide('uow.app.catalog');
dojo.require('dojo.hash');
dojo.require('dijit.layout.BorderContainer');
dojo.require('dijit.layout.ContentPane');
dojo.require('dijit.layout.TabContainer');
dojo.require('dojox.layout.ContentPane');
dojo.require("dojox.highlight");
dojo.require("dojox.highlight.languages.javascript");
dojo.require("dojox.highlight.languages.pygments.javascript");

dojo.ready(function() {
    console.log('ready');
    dojo.removeClass(dojo.body(), 'loading');
    var tabs = dijit.byId('tabs');
    var onSelectTab = function() {
        dojo.hash(tabs.selectedChildWidget.id);
    };
    dojo.connect(tabs, 'selectChild', onSelectTab);
    var h = dojo.hash();
    if(h) {
        tabs.selectChild(dijit.byId(h));
    }
});

uow.app.catalog.serviceStatus = function(name, available) {
    var status, cssClass;
    if(available) {
        status = 'OK';
        cssClass = 'available';
    } else {
        status = 'NA';
        cssClass = 'unavailable'
    }
    var text = dojo.replace('{name} ({status})', 
        {name : name, status : status});
    dojo.create('li', {
        innerHTML : text,
        'class' : cssClass
    }, 'home_status');
};

uow.app.catalog.parseExamples = function(node) {
    node = dojo.byId(node);
    dojo.query('button', node).connect('onclick', function(event) {
        var code = dojo.byId(event.target.id+'code');
        dojo.create('script', {innerHTML : code.textContent}, dojo.body());
    });
};