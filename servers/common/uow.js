/*
 * Factory functions for all UOW services. 
 *
 * Copyright UNC Open Web Team 2010. All Rights Reserved.
**/
dojo.provide('uow');
dojo.registerModulePath('uow', '/libs/uow');
dojo.require('uow.audio.JSonic');
dojo.require('uow.data.MongoStore');
dojo.require('dojox.encoding.base64');
dojo.require('dojo.cookie');

// Gets the singleton JSonic audio manager
uow._audio = null;
uow.getAudio = function(args) {
    var def = new dojo.Deferred();
    if(!uow._audio) {
        args = args || {};
        args.jsonicURI = '/jsonic/';
        if (!args.audioEngine && dojo.isChrome) {
            args.audioEngine = 'flash';
        }
        if (args.audioEngine == 'flash' && typeof(soundManager) === 'undefined') {
            dojo.xhrGet({
                url: '/libs/uow/audio/soundmanager2.js',
                handleAs: 'javascript',
                load: function(data) {
                    soundManager.url = '/libs/uow/audio/swf/';
                    soundManager.flashVersion = 9; // optional: shiny features (default = 8)
                    soundManager.useFlashBlock = false; // optionally, enable when you're ready to dive in
                    soundManager.consoleOnly = true;
                    soundManager.debugMode = false;
                    soundManager.onready(function() {
                        uow._audio = new uow.audio.JSonic(args);
                        def.callback(uow._audio);
                    });
                }
            });
        } else {
            uow._audio = new uow.audio.JSonic(args);
            def.callback(uow._audio);
        }
    } else {
        def.callback(uow._audio);
    }
    return def;
};

// Gets a MongoStore instance (like dojox.data.JSONRestStore)
uow.getDatabase = function(args) {
    var defargs = { idAttribute: '_id',
                    mode: 'crud' };
    args = args || {};
    args = dojo.mixin(defargs, args);
    var xhr = {
        url: '/data/_auth',
        handleAs: 'json',
        postData: dojo.toJson({
            database: args.database,
            collection: args.collection,
            mode: args.mode
        }),
        headers: { "Content-Type": "application/json" }
    };

    var def = new dojo.Deferred();
    dojo.xhrPost(xhr).addCallback(function(response) {
        args.target = response.url;
        args.accessKey = response.key;
        def.callback(new uow.data.MongoStore(args));
    }).addErrback(function(err) {
        def.errback(err);
    });
    return def;
};

// Ask the server to return the current user
uow.getUser = function(args) {
    return dojo.xhrGet( {
        url: '/data/_auth/user',
        handleAs: 'json'
    } );
};

// Triggers an OpenID login using whatever provider the server has configured
uow.triggerLogin = function() {
    var loginDeferred = new dojo.Deferred();
    uow._handleOpenIDResponse = function(flag) {
        uow.getUser().addCallback(function(user) {
            loginDeferred.callback({ flag: flag, user: user });
        });
    };
    // uow._openIDWindowOpened = false;
    // setTimeout(function() {
    //     if (!uow._openIDWindowOpened) {
    //         loginDeferred.errback('timeout waiting for login window');
    //     }
    // }, 1000);
    // uow._handleOpenIDStart = function() {
    //     uow._openIDWindowOpened = true;
    // }
    popup = window.open('/data/_auth', 'Login_Popup', 'width=790,height=580');
    return loginDeferred;
};

// Logs the user out and refreshes the page to clear private info.
uow.logout = function() {
    dojo.cookie('user', null, {path : '/', expires: -1});
    window.location.reload();
};
