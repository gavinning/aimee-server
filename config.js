var fs = require('fs');
var path = require('path');
var cache = require('./db');
var config = module.exports = {};

config.rep = {};
config.rep.path = path.join(__dirname, 'cache/rep');
config.user = cache.get('user').get();
