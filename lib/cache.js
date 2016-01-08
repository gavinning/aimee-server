var lru = require('lru-cache');
var lruOptions = {
    max: 500,
    length: function (n, key) { return n * 2 + key.length },
    dispose: function (key, n) { n.close() },
    maxAge: 1000 * 60 * 60
};
module.exports = lru(lruOptions);
