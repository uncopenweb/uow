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
    args = args || {};
    args.target = '/data/'+args.database+'/'+args.collection+'/';
    args.idAttribute = '_id';
    var def = new dojo.Deferred();
    def.callback(new uow.data.MongoStore(args));
    return def;
};