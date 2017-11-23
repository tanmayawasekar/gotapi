var config = {};

config.db = {
  url: 'mongodb://tanmayawasekar:7825tanmay@ds117156.mlab.com:17156/',
  name: 'gameofthronesbattle'
};

config.client = process.env.CLIENT_URL || '*';

module.exports = config;

require('./dbConfig');