var fs = require('fs');
var path = require('path');
var config = require('./config');
var lib = require('linco.lab').lib;

// 生成app的基础信息，重要，第一个执行
exports.get = function(app){
    this.name = app.name;
    this.version = app.version;
    this.username = app.username;
    // app在版本库中的路径
    this.path = path.join(config.rep.path, this.name);
    // app当前版本的压缩包的真实路径
    this.zip = path.join(this.path, this.getZipName());
    // app在版本库中的配置文件
    this.configFile = path.join(this.path, 'package.json');
}

// 返回当前版本的压缩包名称
exports.getZipName = function(){
    return [this.name, '-', this.version, '.zip'].join('')
}

// 获取当前app的配置信息
exports.config = function(){
    try{
        return JSON.parse(fs.readFileSync(this.configFile, 'utf-8'));
    }
    catch(e){}
}

/**
 * 在版本库初始化一个app
 * 1.在版本库新建app目录
 * 2.新建配置文件package.json
 * 3.初始化package.json信息
 */
exports.init = function(){
    var _config = {};

    // 初始化基础信息
    _config.name = this.name;
    _config.version = this.version;
    _config.versions = [];
    _config.author = this.username;

    // 初始化Time信息
    _config.time = {};
    _config.time.created = lib.now();
    _config.time.modified = _config.time.created;
    _config.time[this.version] = _config.time.created;

    // 创建app目录
    lib.mkdir(this.path);
    // 写入配置文件
    this.writePackage(_config);
}

// 更新app配置文件
exports.update = function(_config){
    _config = this.config();
    _config.version = this.version;
    _config.versions.push(this.version);
    _config.time.modified = lib.now();
    _config.time[this.version] = _config.time.modified;
    this.writePackage(_config);
}

// 写入配置文件
exports.writePackage = function(config){
    fs.writeFileSync(this.configFile, JSON.stringify(config), 'utf-8');
}

// 获取配置文件
exports.getPackage = function(){
    try{
        return JSON.parse(fs.readFileSync(this.configFile, 'utf-8'))
    }catch(e){
        return {}
    }
}

// 检查app是否已存在
exports.isExist = function(){
    var _config;

    try{
        _config = this.config();
        return _config && _config.name ? true : false;
    }catch(e){
        return false;
    }
}

// 检查当前版本是否存在
exports.isVersionExist = function(){
    return lib.isFile(this.zip)
}

// 错误信息
exports.error = function(code){
    var arr = [];

    arr.push('')
    arr.push('当前版本已存在，请更新版本号重新提交')
    arr.push('当前模块名已存在，非开发者没有权限提交')
    arr.push('没有发现该模块')

    return arr[code]
}

// exports.get({name: 'header', version: '1.0.0', username: 'gavinning'})
// console.log(this.isVersionExist())
// console.log(this.getZipName())
// this.init()
// console.log(this.config())