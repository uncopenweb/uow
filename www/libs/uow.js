dojo.provide('uow');
dojo.registerModulePath('info.mindtrove', '/libs/info/mindtrove');
dojo.registerModulePath('uow', '/libs/uow');
// @todo: if we do this on-demand, we have to wait til dojo.ready again
//   which is more for students to worry about (async) but scales better
dojo.require('info.mindtrove.JSonic');

uow._audio = null;
uow.getAudio = function(args) {
    if(!uow._audio) {
        args = args || {};
        args.jsonicURI = '/jsonic/';
        uow._audio = new info.mindtrove.JSonic(args);
    }
    return uow._audio;
};