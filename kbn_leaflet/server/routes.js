

module.exports = function (server) {
	const call = server.plugins.elasticsearch.callWithRequest;

	server.route({
    path: '/api/kbn_leaflet/geojson',
    method: 'POST',
    handler(req, reply) {
    	let searchReq = {
    		index: req.payload.index,
    		body: {
					query: {
						bool: {
					  	must: {
					    	term: {
					      	BeamName: req.payload.beamName
					    	}
					  	}
						}
					}
				}
			};

    	call(req, 'search', searchReq)
    	.then(function (response) {
        reply(response.hits.hits);
      }).catch(function (resp) {
        console.error("Error while fetching beams", resp);
        reply([]);  
      });;
    }
  });
};