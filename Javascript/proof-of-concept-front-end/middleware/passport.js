var path = require('path');
var LocalStrategy = require('passport-local').Strategy;
var pwdhash = require('password-hash');
var profile = require(path.join(__dirname, 'ProfileModel'));
var argsv = require(path.join(__dirname, 'arguments.js'));
var config = require(path.join(__dirname, '../config'));

module.exports = function(passport) {
  
    /**
     * Serialize the user information into the session.
     */
    passport.serializeUser(function(user, done) {
        done(null, user);
    });
    
    /**
     * Deserialize the information from the session.
     */
    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });
    
    /**
     * Configure a LocalStrategy for passport to use for registration as a form of authentication.
     */
    passport.use('local-signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, function(req, email, password, done) {
        var args = argsv.parse(process.argv.slice(2));
        var hostname = req.hostname;
        var proto = req.protocol + '://';
        var port = args.serviceport || config.servicePort;
        profile.get(email, proto + '' + hostname, port, function(data) {
            if (data.hasOwnProperty('user_id')) {
                return done(null, false);                
            } else {
                var profileObj = {
                    email: email,
                    password: pwdhash.generate(password),
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    addresses : [
                        {
                            type:'billing',
                            name:req.body.billname,
                            line1:req.body.billline1,
                            line2:req.body.billline2,
                            city:req.body.billcity,
                            state:req.body.billstate,
                            zipcode:req.body.billzip
                        },
                        {
                            type:'shipping',
                            name:req.body.shipname,
                            line1:req.body.shipline1,
                            line2:req.body.shipline2,
                            city:req.body.shipcity,
                            state:req.body.shipstate,
                            zipcode:req.body.shipzip
                        }
                    ],
                    preferences: [
                        req.body.pref1,
                        req.body.pref2
                    ]
                };
                profile.create(profileObj, function(success) {
                    if (success) {
                        //delete profileObj.password;
                        return done(null, profileObj);
                    }  
                });
            }
        });
    }));
    
    /**
     * Configure a LocalStrategy for passport to use for login.
     */
    passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, function (req, email, password, done) {
        var args = argsv.parse(process.argv.slice(2));
        var hostname = req.hostname;
        var proto = req.protocol + '://';
        var port = args.serviceport || config.servicePort;
        profile.get(email, proto + '' + hostname, port, function(data) {
            if (data.hasOwnProperty('user_id')) {
                if (pwdhash.verify(password, data.password)) {
                    delete data.password;
                    return done(null, data);    
                } else {
                    return done(null, false);
                }                                
            } else {
                return done(null, false);                
            }
        });
    }));
};