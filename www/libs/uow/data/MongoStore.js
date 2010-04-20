dojo.provide('uow.data.MongoStore');
dojo.require('dojox.data.JsonRestStore');

dojo.declare('uow.data.MongoStore', [dojox.data.JsonRestStore], {
    _doQuery: function(args) {
        console.log('doQuery', args);
        function mongoQuery(obj) {
            var qs = dojo.toJson(obj);
            qs = escape(qs);
            qs = qs.replace('/', '%2F');
            qs = qs.replace('+', '%2B');
            return '?mongoquery=' + qs;
        }
        args.queryStr = mongoQuery(args.query);
        console.log('args', args);
        delete args.query;
        console.log('args', args);
        var r = this.inherited(arguments);
        console.log('r', r);
        return r;
    }
});

