export default function (server) {

    // We can use this method, since we have set the require in the index.js to
    // elasticsearch. So we can access the elasticsearch plugins safely here.
    let call = server.plugins.elasticsearch.callWithRequest;

    server.route({
        path: '/api/kbn_slickgrid/update_row',
        method: 'POST',
        handler(req, reply) {
            console.log(req.payload);
            var id = req.payload._id;
            var index = req.payload._index;
            var type = req.payload._type
            delete req.payload._id;
            delete req.payload._index;
            delete req.payload._type;
            call(req, 'index', {
                index: index,
                type: type,
                id: id,
                body: JSON.stringify(req.payload)
            }).then(function (response) {
                // Return just the names of all indices to the client.
                reply("Updated");
            });
        }
    });

    //// Add a route to retrieve the status of an index by its name
    //server.route({
    //  // We can use path variables in here, that can be accessed on the request
    //  // object in the handler.
    //  path: '/api/elasticsearch_status/index/{name}',
    //  method: 'GET',
    //  handler(req, reply) {
    //    call(req, 'cluster.state', {
    //      metric: 'metadata',
    //      index: req.params.name
    //    }).then(function (response) {
    //      reply(response.metadata.indices[req.params.name]);
    //    });
    //  }
    //});
};