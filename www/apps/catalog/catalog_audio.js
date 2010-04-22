dojo.ready(function() {
    dojo.query('button').connect('onclick', function(event) {
        var code = dojo.byId(event.target.id+'code');
        dojo.create('script', {innerHTML : code.textContent}, dojo.body());
    });
});