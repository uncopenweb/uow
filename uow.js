/*
 * Factory functions for all UOW services. 
 *
 * Copyright UNC Open Web Team 2010. All Rights Reserved.
**/
dojo.provide('uow');
dojo.registerModulePath('uow', '/libs/uow');
dojo.require('uow.audio.JSonic');
dojo.require('uow.ui.BrowserDialog');
dojo.require('uow.data.MongoStore');
dojo.require('dojo.cookie');

// Gets the singleton JSonic audio manager
uow._audio = null;
uow.getAudio = function(args) {
    var def = new dojo.Deferred();
    if(!uow._audio) {
        args = args || {};
        args.jsonicURI = '/jsonic/';
        uow._audio = new uow.audio.JSonic(args);
    }
    def.callback(uow._audio);
    return def;
};

// Gets a MongoStore instance (like dojox.data.JSONRestStore)
uow.getDatabase = function(args) { return uow.data.getDatabase(args); };

// Return a store for listing and deleting collections from a database
uow.manageDatabase = function(args) { return uow.data.manageDatabase(args); };

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
uow.checkBrowser = function() {
    // @todo: what to check? right now just IE
    if(dojo.isIE) {
        uow.ui.BrowserDialog.show();
    }
};