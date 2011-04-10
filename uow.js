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
uow.ui.hideBusy = function(args) {
    dojo.require('uow.ui.BusyOverlay');
    var def = new dojo.Deferred();
    dojo.ready(function() {
        uow.ui.BusyOverlay.hide(args.overlay);
        def.callback();
    });
    return def;
};

// Listen for global keys
uow.ui.connectKeys = function(context) {
    if(!context || !context.window) {
        // support listening on different windows
        context = uow.ui;
        context.window = window;
    }
    if(context._keyToks) {
        throw new Error('keys connected');
    }
    context._keyToks = [];
    // keep track of key state to avoid down repeat
    context._keyState = {};
    
    var _isIgnoredKey = function(event) {
        if(!context._keyIgnores) {return false;}
        for(var i=0, l=context._keyIgnores.length; i<l; i++) {
            var ignore = context._keyIgnores[i];
            var match = true;
            for(var key in ignore) {
                if(ignore[key] !== event[key]) {
                    // does not match this ignore pattern, skip to next
                    match = false;
                    break;
                }
            }
            if(match) {
                // pattern matches, ignore
                return true;
            }
        }
        // no pattern matches, do not ignore
        return false;
    };
    
    var tok;
    tok = dojo.connect(context.window, 'onkeyup', function(event) {
        // cleanup any tracked key state 
        delete context._keyState[event.keyCode];
        if(!_isIgnoredKey(event)) {
            // publish a key up event
            dojo.publish('/uow/key/up', [event]);
        }
    });
    context._keyToks.push(tok);
    tok = dojo.connect(context.window, 'onkeydown', function(event) {
        var ignore = _isIgnoredKey(event);
        if (!context._keyState[event.keyCode]) {
            // first down event for a key
            context._keyState[event.keyCode] = 'd';
            if(!ignore) {
                // fire an initial event
                dojo.publish('/uow/key/down/initial', [event]);
                // set a flag on the event for down handlers to read too
                event.initialDown = true;
            }
        }
        if(!ignore) {
            // publish a down event
            dojo.publish('/uow/key/down', [event]);
        }
    });
    context._keyToks.push(tok);
    tok = dojo.connect(context.window, 'onkeypress', function(event) {
        if(!_isIgnoredKey(event)) {
            // publish a press event
            dojo.publish('/uow/key/press', [event]);
        }
    });
    context._keyToks.push(tok);
};

// Stop listening for global keys
uow.ui.disconnectKeys = function(context) {
    if(!context) {
        context = uow.ui;
    }
    if(!context._keyToks) {
        throw new Error('keys not connected');
    }
    dojo.forEach(context._keyToks, dojo.disconnect, dojo);
    context._keyToks = null;
};

// Add key events to ignore (i.e., not publish events for them).
uow.ui.ignoreKeys = function(ignores, context) {
    if(!context) {
        context = uow.ui;
    }
    if(!context._keyIgnores) {
        context._keyIgnores = [];
    }
    context._keyIgnores = context._keyIgnores.concat(ignores);
};

// Remove all key events from the ignore list.
uow.ui.clearIgnoredKeys = function(context, keys) {
    if(!context) {
        context = uow.ui;
    }
    delete context._keyIgnores;
};