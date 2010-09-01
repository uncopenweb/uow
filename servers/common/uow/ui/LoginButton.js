/**
 * Login button widget.
 *
 * Copyright UNC Open Web Team 2010. All Rights Reserved.
 */
dojo.provide('uow.ui.LoginButton');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dojo.i18n');
dojo.requireLocalization('uow.ui', 'LoginButton');

dojo.declare('uow.ui.LoginButton', [dijit._Widget, dijit._Templated], {
    displayField: 'email',
    widgetsInTemplate: true,
    templatePath: dojo.moduleUrl('uow.ui', 'templates/LoginButton.html'),

    postMixInProperties: function() {
        this.labels = dojo.i18n.getLocalization('uow.ui', 'LoginButton');
    },

    triggerLogin: function() {
        var def = uow.getUser();
        def.addCallback(this, function(user) {
            if(user.email) {
                this._onAuth(user);
            } else {
                throw new Error('not authed')
            }            
        }).addErrback(this, '_onNoAuth');
    },
    
    _onAuth: function(user) {
        dojo.style(this.loginNode, 'display', 'none');
        var welcome = dojo.replace(this.labels.welcome_user_label, 
            [user[this.displayField]]);
        this.welcomeNode.innerHTML = welcome;
        dojo.style(this.authedNode, 'display', '');
        dojo.publish('/uow/auth', [user]);
    },
    
    _onNoAuth: function() {
        dojo.style(this.loginNode, 'display', '');
        dojo.publish('/uow/auth', [null]);
    },
    
    _onClickLogin: function() {
        var def = uow.triggerLogin();
        def.addCallback(this, function(response) {
            if(response.flag == 'ok') {
                this._onAuth(response.user);
            } else {
                throw new Error('not authed')
            }
        }).addErrback(this, '_onNoAuth');
    },
    
    _onClickLogout: function() {
        uow.logout();
    }
});