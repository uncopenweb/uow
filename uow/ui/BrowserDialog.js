/*
 *  BrowserDialog.js
 *
 *  Copyright UNC Open Web Team 2010. All Rights Reserved.
 */ 
dojo.provide('uow.ui.BrowserDialog');
dojo.require('dijit.Dialog');
dojo.require('dojo.i18n');
dojo.requireLocalization('uow.ui', 'BrowserDialog');

(function() {
    var labels = dojo.i18n.getLocalization('uow.ui', 'BrowserDialog');
    uow.ui.BrowserDialog.show = function() {
        // build the dialog
        var dlg = new dijit.Dialog({
            closable: false,
            draggable: false,
            title : labels.dialog_title
        });
        // prevent closing
        dojo.style(dlg.closeButtonNode, 'display', 'none');
        var onKey = dojo.hitch(dlg, '_onKey');
        dlg._onKey = function(event) { 
            if(event.charOrCode == dojo.keys.ESCAPE) {
                return;
            }
            onKey(event);
        }
        var template = dojo.cache('uow.ui.templates', 'BrowserDialog.html');
        var args = {
            labels : labels,
            image_path : dojo.moduleUrl('uow.ui.css', 'icons')
        };
        var html = dojo.replace(template, args);
        dlg.attr('content', html);
        dlg.show();
        return dlg;
    };
}());