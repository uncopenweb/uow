/*
 * Factory functions for all UOW services. 
 *
 * Copyright UNC Open Web Team 2010. All Rights Reserved.
**/
dojo.provide('uow');
dojo.registerModulePath('uow', '/libs/uow');
dojo.require('uow.data.MongoStore');
dojo.require('dojo.cookie');

// Gets the singleton JSonic audio manager
uow._audio = null;
uow.getAudio = function(args) {
    dojo.require('uow.audio.JSonic');
    var def = new dojo.Deferred();
    dojo.ready(function() {
        if(!uow._audio) {
            args = args || {};
            args.jsonicURI = '/jsonic/';
            uow._audio = new uow.audio.JSonic(args);
        }
        def.callback(uow._audio);
    });
    return def;
};

// Gets a MongoStore instance (like dojox.data.JSONRestStore)
uow.getDatabase = function(args) { return uow.data.getDatabase(args); };

// Ask the server to return the current user
uow.getUser = function(args) { return uow.data.getUser(args); };

// Triggers an OpenID login using whatever provider the server has configured
uow.triggerLogin = function() {
    var loginDeferred = new dojo.Deferred();
    uow._handleOpenIDResponse = function(flag) {
        uow.getUser().addCallback(function(user) {
            loginDeferred.callback({ flag: flag, user: user });
        });
    };
    popup = window.open('/data/_auth', 'Login_Popup', 'width=790,height=580');
    return loginDeferred;
};

// Logs the user out and refreshes the page to clear private info.
uow.logout = function() {
    dojo.cookie('user', null, {path : '/', expires: -1});
    window.location.reload();
};

// Check browser compatibility
uow.ui = {};
uow.ui.checkBrowser = function() {
    dojo.require('uow.ui.BrowserDialog');
    var def = new dojo.Deferred();
    dojo.ready(function() {
        var ok = !dojo.isIE;
        if(!ok) {
            uow.ui.BrowserDialog.show();
        }
        def.callback(ok);
    });
    return def;
};

// Show a busy overlay
uow.ui.showBusy = function(args) {
    dojo.require('uow.ui.BusyOverlay');
    var def = new dojo.Deferred();
    dojo.ready(function() {
        var inst = uow.ui.BusyOverlay.show(args);
        def.callback(inst);
    });
    return def;
};

// Hide a busy overlay
uow.ui.hideBusy = function(inst) {
    dojo.require('uow.ui.BusyOverlay');
    var def = new dojo.Deferred();
    dojo.ready(function() {
        uow.ui.BusyOverlay.hide(inst);
        def.callback();
    });
    return def;
};