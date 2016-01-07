var fs = require('fs');
var ass = require('assert');
var path = require('path');
var config = require('./config');
var lib = require('linco.lab').lib;
var package = require('vpm-package');
var markdown = require('markdown');

lib.extend({

    // 获取全部的app列表
    getAllPackageList: function(){
        var data = {};
        var folders = lib.dir(config.rep.path, {deep: false}).folders;
        folders.forEach(function(item){
            var name = path.basename(item);
            data[name] = require(path.join(item, config.name.configFile))
        })
        return data;
    },

    // 解压app到preview目录
    unzipToPreview: function(app){
        // 获取Preview路径
        app.preview = path.join(config.rep.preview, app.name, app.version);
        // 创建解压目录
        lib.mkdir(app.preview);
        // 解压到指定目录
        package.unzip(app.zip, app.preview);
    },

    preview: function(app){
        var md;

        app.preview = path.join(config.rep.preview, app.name, app.version);

        if(!lib.isDir(app.preview)){
            return {code: 1, message: 'Can\'t find this app'}
        }

        lib.dir(app.preview, {deep: false}).files.forEach(function(item){
            if(item.match(/readme.md/i)){
                console.log(item)
                md = fs.readFileSync(item, 'utf-8');
            }
        })

        return {
            code: 0,
            data: {
                md: markdown.parse(md)
            }
        }
    }
})

module.exports = lib;
