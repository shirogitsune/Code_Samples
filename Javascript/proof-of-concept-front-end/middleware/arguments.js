'use strict';
var yargs = require('yargs');
module.exports = {
    parse: (rawArgs)=>{
        return yargs.parse(rawArgs);
    }
};