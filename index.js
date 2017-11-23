const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const helmet = require('helmet');
const app = express();
require('./config/config');
require('./config/dbConfig'); // Importing database connection when server starts
const routes = require('./routes/routes');

//Security Middleware
app.use(helmet());

app.set('port', 3000);


app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, Authorization, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, HEAD,PUT,DELETE");
  if ('OPTIONS' === req.method) {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ 'extended': true }));

//Using the compression middleware
app.use(compression());

//Handles routes in the app
app.use('/api', routes);

// When route is not found error messege is thrown
app.use('/', function (req, res) {
  res.status(404).send('Route Not Found');
});

// error handler
app.use(function (err, req, res, next) {
  res.status(err.status || 500).send(err.message || 'Internal Server Error');
});

//Best practices app settings
app.set('query parser', `extended`);

app.listen(app.get('port'), () => {
  console.log(`Find the server at: http://localhost:${app.get('port')}/`);
});
