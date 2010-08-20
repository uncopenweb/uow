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

// Gets the singleton JSonic audio manager
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

// Gets a MongoStore instance (like dojox.data.JSONRestStore)
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

// Placeholder
uow._handleOpenIDResponse = function(id) {
};

// Gets information about the authenticated user
uow.getUser = function() {
    var cookie = dojo.cookie('user');
    if (!cookie) {
        return { email: null };
    }
    var parts = cookie.split('|');
    var bytearray = dojox.encoding.base64.decode(parts[0]);
    var chararray = dojo.map(bytearray, function(code) { return String.fromCharCode(code); });
    var userjson = chararray.join('');
    var user = dojo.fromJson(userjson);
    return user;
};

// Triggers an OpenID login using whatever provider the server has configured
uow.triggerLogin = function() {
    var loginDeferred = new dojo.Deferred();
    uow._handleOpenIDResponse = function(flag) {
        loginDeferred.callback({ flag: flag, user: uow.getUser() });
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

// Logs the user out and refreshes the page to clear private info.
uow.logout = function() {
    dojo.cookie('user', null, {path : '/', expires: -1});
    window.location.reload();
};