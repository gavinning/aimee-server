var fs = require('fs');
var path = require('path');

module.exports = {

    rep: {
        path: path.join(__dirname, '../../repository/rep'),
        preview: path.join(__dirname, '../../repository/preview')
    },

    name: {
        configFile: 'package.json',
        appConfigFile: 'aimee.json'
    },

    url: {
        appImgPrefix: '/g/aimee/static/preview'
    }
}
