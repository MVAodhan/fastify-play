module.exports = function (fastify, options, done) {
	fastify.get("/test", async (request, reply) => {
		const client = await fastify.pg.connect();
		try {
			const { rows } = await client.query("SELECT * FROM test");
			// Note: avoid doing expensive computation here, this will block releasing the client
			return rows;
		} finally {
			// Release the client immediately after query resolves, or upon error
			client.release();
		}
	});
	fastify.post("/test", (req, reply) => {
		// will return a promise, fastify will send the result automatically
		return fastify.pg.transact(async (client) => {
			// will resolve to an id, or reject with an error
			const record = await client.query(
				"INSERT INTO test(id, name) VALUES($1, $2) RETURNING id",
				[req.body.id, req.body.name]
			);
			// potentially do something with id
			return record;
		});
	});
	fastify.get("/", async (request, reply) => {
		const res = await fetch("https://www.learnwithjason.dev/api/v2/schedule");
		const data = await res.json();
		reply.send(data);
	});

	fastify.get("/:slug", async (request, reply) => {
		const slug = request.params.slug;
		const res = await fetch("https://www.learnwithjason.dev/api/v2/schedule");
		const data = await res.json();
		const ep = data.filter((episode) => episode.slug === slug);
		reply.send(ep);
	});
	done();
};
