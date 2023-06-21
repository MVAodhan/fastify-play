const fastify = require("fastify")({ logger: true });
const routes = require("./routes");
const bearerAuthPlugin = require("@fastify/bearer-auth");
const keys = new Set(["a-super-secret-key", "another-super-secret-key"]);
const fs = require("fs");
const util = require("util");
const { pipeline } = require("stream");

const pump = util.promisify(pipeline);
const multipart = require("@fastify/multipart");
require("dotenv").config();

fastify.register(multipart);
// fastify.register(bearerAuthPlugin, { keys });
fastify.register(routes);
fastify.post("/upload", async function (req, reply) {
	const data = await req.file();
	await pump(data.file, fs.createWriteStream(`./uploads/${data.filename}`));

	return { message: "file uploaded" };
});
// fastify.get("/keys", (req, reply) => {
// 	let bearerKeys = [];
// 	for (let key of keys) {
// 		let keyObj = { code: key };
// 		bearerKeys = [...bearerKeys, keyObj];
// 	}

// 	reply.send(bearerKeys);
// });
// fastify.post("/keys", (req, reply) => {
// 	keys.add("new-key");
// 	reply.send({ key: "successfull added" });
// });

fastify.register(require("@fastify/postgres"), {
	connectionString: process.env.CONNECTION_STRING,
});
fastify.listen({ port: 8080 }, (err, address) => {
	if (err) {
		fastify.log.error(err);
		process.exit(1);
	}

	console.log(`server listening on \${address}`);
	// console.log(fastify.config.CONNECTION_STRING);
});
