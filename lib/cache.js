var lru = require('lru-cache');
var lruOptions = {
    max: 500,
    length: function (n, key) { return n * 2 + key.length },
    maxAge: 1000 * 60 * 60 * 24 * 30
};
module.exports = lru(lruOptions);
