/**
 * Widget for granting access modes to roles for a single collection.
 *
 * Copyright UNC Open Web Team 2010. All Rights Reserved.
 */
dojo.provide('uow.ui.CollectionAccessEditor');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dijit._Contained');
dojo.require('dijit.form.CheckBox');
dojo.require('dojo.i18n');
dojo.requireLocalization('uow.ui', 'CollectionAccessEditor');

dojo.declare('uow.ui.CollectionAccessEditor', [dijit._Widget, dijit._Templated, dijit._Contained], {
    // database and collection name pair as a tuple
    target : [],
    widgetsInTemplate: true,
    templatePath: dojo.moduleUrl('uow.ui', 'templates/CollectionAccessEditor.html'),

    postMixInProperties: function() {
        this.labels = dojo.i18n.getLocalization('uow.ui','CollectionAccessEditor');
        // Admin database, AccessModes collection 
        this._db = null;
        // all suppoerted modes
        this._modes = [];
        // all supported roles
        this._roles = [];
        // mutex indicating checks should be ignored during initial seeding
        this._mutex = false;
    },

    postCreate: function() {
        // build checkboxes for input
        var modes = dojo.query('th[data-mode]', this.tableHead)
            .map('return item.getAttribute("data-mode")');
        this._modes = modes;
        var rows = dojo.query('tr[data-role]', this.tableBody);
        var roles = rows.map('return item.getAttribute("data-role")');
        this._roles = roles;
        rows.forEach(function(tr, i) {
            var role = roles[i];
            dojo.forEach(modes, function(mode) {
                var td = dojo.create('td', {
                    'data-input' : 'true',
                    'style' : 'display: none'
                }, tr);
                var cb = new dijit.form.CheckBox({
                    id : this.id+'_'+role+'_'+mode
                });
                cb.domNode.setAttribute('data-mode', mode);
                dojo.place(cb.domNode, td);
                this.connect(cb, 'onChange', 
                    dojo.partial(this._onCheck, role, mode));
            }, this);
        }, this);
    },
    
    resize: function(box) {
        dojo.marginBox(this.tableNode, {w : box.w});
    },

    _setTargetAttr: function(target) {
        this.target = target;
        if(!this.target || !this.target.length) { return; }
		// @todo: don't have to refetch db all the time
        this._db = null;
        // hide checkbox cells
        dojo.query('td[data-input]', this.tableBody).style({display: 'none'});
        // show loading indicator
        this._showGridLoading();
        // show db / col names
        this.dbNameNode.textContent = target[0];
        this.colNameNode.textContent = target[1];		
        // open the access modes for the db,collection
        var def = uow.getDatabase({
            database : 'Admin', 
            collection: 'AccessModes',
            mode : 'cur'
        }).then(dojo.hitch(this, function(db) {
            this._db = db;
            // fetch the roles/modes for the target db/col
            db.fetch({
                query : {
                    database : this.target[0],
                    collection : this.target[1]
                },
                onComplete: dojo.hitch(this, function(items) {
                    this._buildGrid(items);
                })
            });
        }));
        // @todo: handle error case
    },
    
    _onCheck: function(role, mode, value) {
        if(this._mutex) { return; }

        // if r or R is going on, make sure the other is off
        if(value) {
            var rw;
            if(mode == 'R') {
                rw = dijit.byId(this.id+'_'+role+'_r');
                if(rw.attr('checked')) {
                    rw.attr('checked', false);
                    // don't do anything else, we'll get another checked event
                    // for that widget
                    return;
                }
            } else if(mode == 'r') {
                rw = dijit.byId(this.id+'_'+role+'_R');
                if(rw.attr('checked')) {
                    rw.attr('checked', false);
                    return;
                }            
            }
        }
        
        // get the row for the role
        var row = dojo.query('tr[data-role="'+role+'"]', this.tableBody)[0];
        // get all the checkboxes
        var modes = [];
        dojo.query('[widgetid]', row).forEach(function(node) {
            var w = dijit.byNode(node);
            if(w.attr('checked')) {
                modes.push(node.getAttribute('data-mode'));
            }
        });
        var modeStr = modes.join('');
        console.log(modeStr);
        
        // update an item for the db/collection/role in the the Admin, 
        // AccessModes collection, else create one
        var args = {
            role : role, 
            database : this.target[0], 
            collection : this.target[1]
        };
        this._db.fetch({
            query : args,
            onComplete: function(items) {
                if(items.length) {
                    // @todo: handle more than one match, that's badness
                    this._db.setValue(items[0], 'permission', modeStr);
                } else {
                    // create a new item to hold the permission
                    args.permission = modeStr;
                    this._db.newItem(permission);
                }
                this._db.save();
            },
            scope: this
        });
    },
    
    _buildGrid: function(items) {
        // hide the idle message
        dojo.style(this.idleNode, 'display', 'none');

        // build role to mode hash
        var rm = {};
        dojo.forEach(items, function(item) {
            rm[item.role] = item.permission;
        });
    
        // iterate over all checkboxes to get them into the right state
        this._mutex = true;
        dojo.forEach(this._roles, function(role) {
            var allowed = rm[role];
            dojo.forEach(this._modes, function(mode) {
                var cb = dijit.byId(this.id+'_'+role+'_'+mode);
                if(allowed && allowed.search(mode) != -1) {
                    cb.attr('value', true);
                } else {
                    cb.attr('value', false);
                }
                dojo.style(cb.domNode.parentNode, 'display', '');
            }, this);
        }, this);
        // check box updates happen async, don't unset mutex immediately
        setTimeout(dojo.hitch(this, function() {
            this._mutex = false;
        }), 0);
    },
    
    _showGridLoading: function() {
        dojo.style(this.idleNode, 'display', '');
    },
    
    _showGridError: function(msg) {
        // @todo
    }
});