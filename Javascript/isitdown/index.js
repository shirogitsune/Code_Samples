'use strict';
var path = require('path');
var express = require('express');
var session = require('express-session');
var parser = require('body-parser');

var config = require(path.join(__dirname, 'config'));
var port = process.env.port || config.appPort || 80;

var app = express();

//Set rendering engine to use EJS
app.set('view engine', 'ejs');

//Setup parsers
app.use(parser.json());
app.use(parser.urlencoded({
    extended: true
}));

//Map out static 'directories'
app.use('/assets', express.static(path.join(__dirname, 'assets')));

//Setup session handling.
app.use(session({
    secret: config.secret || 'cb135fbb74e0dcf8d59cef557766deea0b11271bbcca204994a7140d2051056d',
    saveUninitialized: true,
    resave: true
}));

// Register the routes.
var routes = require(path.join(__dirname, 'routes/index'));
app.use('/', routes(app));

//Finally, attach a global handler to handle all exceptions from any route.
app.use(function (err, req, res, next) {
    console.log(err);
    res.render(path.join(__dirname, 'error'), {
        pageTitle: 'Error',
        error: err
    });
});

//Catch-all route goes to 404 page.
app.get('*', function (err, req, res, next) {
    console.log(err);
    res.status(500).send(err); 
});

//Start server listening on the provided port.
app.listen(port, function () {
    console.log('Listening on port ' + port);
});