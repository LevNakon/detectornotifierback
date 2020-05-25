const mongoose = require('mongoose');
const config = require('config');

mongoose.connect(
    `mongodb://${config.get(`${process.env.NODE_ENV}.host`)}:${config.get(`${process.env.NODE_ENV}.port`)}/${config.get(`${process.env.NODE_ENV}.database`)}`,
    { useNewUrlParser: true }
);

const connection = mongoose.connection;

module.exports = connection;