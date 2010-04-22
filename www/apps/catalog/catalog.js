dojo.require('dojo.hash');
dojo.require('dijit.layout.BorderContainer');
dojo.require('dijit.layout.ContentPane');
dojo.require('dijit.layout.TabContainer');
dojo.require('dojox.layout.ContentPane');
dojo.require("dojox.highlight");
dojo.require("dojox.highlight.languages.javascript");
dojo.require("dojox.highlight.languages.pygments.javascript");

dojo.ready(function() {
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