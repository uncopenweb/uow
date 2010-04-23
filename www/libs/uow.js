dojo.provide('uow');
dojo.registerModulePath('info.mindtrove', '/libs/info/mindtrove');
dojo.registerModulePath('uow', '/libs/uow');
dojo.require('info.mindtrove.JSonic');
dojo.require('dojox.data.JsonRestStore');

uow._audio = null;
uow.getAudio = function(args) {
    if(!uow._audio) {
        args = args || {};
        args.jsonicURI = '/jsonic/';
        uow._audio = new info.mindtrove.JSonic(args);
    }
    return uow._audio;
};

uow.getDatabase = function(args) {
    args = args || {};
    args.target = '/data/'+args.database+'/'+args.collection+'/';
    args.idAttribute = '_id';
    return new dojox.data.JsonRestStore(args);
};