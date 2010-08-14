/*
 * Factory functions for all UOW services. 
 *
 * :requires: Dojo 1.4.x, JSonic 0.1
 * :copyright: Gary Bishop, Peter Parente 2010
 * :license: BSD
**/
dojo.provide('uow');
dojo.registerModulePath('info.mindtrove', '/libs/info/mindtrove');
dojo.registerModulePath('uow', '/libs/uow');
dojo.require('info.mindtrove.JSonic');
dojo.require('uow.data.MongoStore');
dojo.require('dojox.encoding.base64');
dojo.require('dojo.cookie');

uow._audio = null;
uow.getAudio = function(args) {
    if(!uow._audio) {
        args = args || {};
        args.jsonicURI = '/jsonic/';
        uow._audio = new info.mindtrove.JSonic(args);
    }
    var def = new dojo.Deferred();
    def.callback(uow._audio);
    return def;
};

uow.getDatabase = function(args) {
    def = { idAttribute: '_id',
            mode: 'crud' };
    args = args || {};
    args = dojo.mixin(def, args);
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

// ask the server to return the current user
uow.getUser = function(args) {
    return dojo.xhrGet( {
        url: '/data/_auth/user',
        handleAs: 'json'
    } );
};

// ask the server to popup the OpenID login window
uow.triggerLogin = function() {
    var loginDeferred = new dojo.Deferred();
    uow._handleOpenIDResponse = function(flag) {
        uow.getUser().addCallback(function(user) {
            loginDeferred.callback({ flag: flag, user: user });
        });
    }
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

