const MongoClient = require('mongodb').MongoClient;
const config = require('./config');
const url = config.db.url + config.db.name || 'mongodb://localhost:27017/';

global.db = MongoClient.connect(url);
global.db.then((db, err) => {
  global.db = db;
});
//Exported the database connection to be imported at the server
exports.default = global.db;
