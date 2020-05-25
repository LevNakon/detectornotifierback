const express = require("express");
const bodyParser = require("body-parser");
const config = require("config");
const cors = require("cors");
const logger = require("./utils/logger");
const connection = require('./models');
const auth = require('./api/middleware/auth');
const classesSocket = require('./utils/socket').classesSocket;

// routes
const user = require("./api/routes/user");

const server = express();
const port = config.get("http.port");

server.use(cors());
server.use(express.json());
server.use(bodyParser.json());

server.use("/user", user);

server.use((error, req, res, next) => {
	const { statusCode = 500, success = false, message = '' } = error;
	res.status(statusCode).json({ message, success });
});

connection.once('open', () => {
	const serv = server.listen(port, (err) => {
		if (err) {
			logger.info(err);
		}
		logger.info("Server is listening on port %d", port);
	});
	classesSocket(serv);
});


