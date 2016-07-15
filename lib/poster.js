var multipart = require('connect-multiparty');
var multipartMiddleware = multipart({uploadDir: '/tmp/server-upload'});
var Poster = require('node-post-server');
var poster = module.exports = new Poster;
poster.ParseFiles = multipartMiddleware;

// 允许上传的安全路径
poster.config.merge({
    safePaths: [
        '/Users/gavinning/Documents/lab/services'
    ]
})
