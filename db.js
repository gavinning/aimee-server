var path = require('path');
var cache = require('vpm-cache');
module.exports = cache(path.join(__dirname, 'cache/db'));
