'use strict'
var express = require('express'),
path = require('path'),
favicon = require('serve-favicon'),
logger = require('morgan'),
cookieParser = require('cookie-parser'),
bodyParser = require('body-parser'),
router = require('./routes'),
port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3000, 
host = process.env.OPENSHIFT_NODEJS_IP,
app = express(),
DocumentDBClient = require('documentdb').DocumentClient,
TaskDao = require('./src/taskDao'),
API = require('./src/api'),
config = require('./config');



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// DocumentDB init
var docDbClient = new DocumentDBClient(config.host, {
    masterKey: config.authKey
});
//multile collection models
var taskDao_iq = new TaskDao(docDbClient, config.databaseId, config.collectionId[0]);
taskDao_iq.init();
var taskDao_gemcrush = new TaskDao(docDbClient, config.databaseId, config.collectionId[1]);
taskDao_gemcrush.init();

var api_iq = new API(taskDao_iq);
var api_gemcrush = new API(taskDao_gemcrush);


//CORS on Express.js
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // or http://*.example.com
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


// DocumentDB API
// Raw API
app.get('/api/iq/get', api_iq.get.bind(api_iq));
app.post('/api/iq/add', api_iq.add.bind(api_iq));
app.post('/api/iq/update', api_iq.update.bind(api_iq));

app.get('/api/gemcrush/get', api_gemcrush.get.bind(api_gemcrush));
app.post('/api/gemcrush/add', api_gemcrush.add.bind(api_gemcrush));
app.post('/api/gemcrush/update', api_gemcrush.update.bind(api_gemcrush));

//TODO: basic auth
app.use(express.static('./'));
app.use('/', router);
app.use('*', function (req, res) {
    res.render('pages/404');
});


app.listen(port, host, function () {
    host = host || 'localhost';
    console.log('Server is running at ' + host + ':' + port);    
});
// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//     var err = new Error('Not Found');
//     err.status = 404;
//     next(err);
// });

// // error handlers

// // development error handler
// // will print stacktrace
// if (app.get('env') === 'development') {
//     app.use(function(err, req, res, next) {
//         res.status(err.status || 500);
//         res.render('error', {
//             message: err.message,
//             error: err
//         });
//     });
// }

// // production error handler
// // no stacktraces leaked to user
// app.use(function(err, req, res, next) {
//     res.status(err.status || 500);
//     res.render('error', {
//         message: err.message,
//         error: {}
//     });
// });

// module.exports = app;