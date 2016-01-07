var fs = require('fs');
var path = require('path');

module.exports = {

    rep: {
        path: path.join(__dirname, 'cache/rep'),
        preview: path.join(__dirname, 'cache/preview')
    },

    name: {
        configFile: 'package.json'
    }
}
