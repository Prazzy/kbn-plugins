module.exports = function (server) {
	const call = server.plugins.elasticsearch.callWithRequest;

	server.route({
    path: '/api/kbn_autocomplete/search',
    method: 'POST',
    handler(req, reply) {
    	let searchReq = {
    		index: req.payload.index,
    		body: {
          aggs: {
            fieldAggs: {
              terms : { field: req.payload.searchField, size: 10000 }
            }
          },
          size: 0
        }
			};
    	call(req, 'search', searchReq)
    	.then(function (resp) {
        reply(resp.aggregations.fieldAggs.buckets);
      }).catch(function (resp) {
        console.error("Error while fetching beams", resp);
        reply([]);  
      });;
    }
  });
};