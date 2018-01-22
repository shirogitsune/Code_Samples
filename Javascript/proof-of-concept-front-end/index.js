/* Application Entry Point */

'use strict';
var path = require('path');
var argsv = require(path.join(__dirname, 'middleware/arguments'));
var express = require('express');
var passport = require('passport');
var session = require('express-session');
var app = express();

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var path = require('path');

var args = argsv.parse(process.argv.slice(2));
var config = require(path.join(__dirname, 'config'));
var port = args.port || process.env.port || config.appPort || 80;

// Set rendering engine to use EJS
app.set('view engine', 'ejs');

// Setup parsers
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

//Map out static 'directories'
app.use('/app', express.static(path.join(__dirname, 'app')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

//Setup session handling.
app.use(session({
    secret: args.secret || config.secret || 'cb135fbb74e0dcf8d59cef557766deea0b11271bbcca204994a7140d2051056d',
    saveUninitialized: true,
    resave: true
}));

// Set up passport and tell it to use sessions.
app.use(passport.initialize());
app.use(passport.session());

// Set up authentication provider
require(path.join(__dirname, 'middleware/passport'))(passport);

// Register the routes.
var routes = require(path.join(__dirname, 'routes/index'));
app.use('/', routes(app, passport));

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