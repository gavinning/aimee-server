var fs = require('fs');
var path = require('path');
var app = require('./app');
var lib = require('linco.lab').lib;
var express = require('express');
var router = express.Router();
var config = require('./config');
var cache = require('./db');
var crypto = system.crypto;

// system.app.name
exports.name = 'aimee';
exports.router = router;
exports.static = path.join(__dirname, 'static');

// 检查用户是否已登录
function isLogin(req) {
    return crypto.baseToHEX(req.headers.auth) === config.user[req.headers.username].password ?
        true : false;
}

function isAuthor(req) {

}

router.get('/', function(req, res){
    res.status(200).send('Hello aimee')
})

/**
 * 查询模块信息api
 * @param   {String}  req.query.name  查询的模块名称
 * @return  {object}                  模块信息
 * @example curl -G domain/api/query?name=header
 * @example curl -G http://127.0.0.1:3000/app/aimee/api/query?name=header
 */
router.get('/api/query', function(req, res){
    // req.query.name
    app.get(req.query);

    // 检查app是否已存在
    if(!app.isExist()){
        // 返回模块已存在提示信息
        return res.status(404).send(app.error(3))
    }

    // 返回模块信息
    return res.status(200).json(app.config());
})

/**
 * 提交模块api
 * @param   {String}  req.headers.name      提交模块名称
 * @param   {String}  req.headers.version   提交模块版本
 * @param   {String}  req.headers.username  提交模块用户
 * @return  {String}                        响应信息
 * @example fs.createReadStream(zip).pipe(request.post(domain/api/publish, fn))
 */
router.post('/api/publish', function(req, res){
    var package;

    // 检查是否已登录
    if(!isLogin(req)){
        return res.status(403).send('Plase login first')
    }

    // 获取app信息
    // req.headers.name
    // req.headers.version
    // req.headers.username
    app.get(req.headers);

    // 检查app是否已存在，不存在则初始化该模块
    if(!app.isExist()){
        app.init()
    }

    // 获取该模块配置信息，用于对比用户权限
    package = app.getPackage();

    // 检查是否有更新权限
    if(package.author !== req.headers.username){
        // 如果已存在则返回错误提示
        return res.status(403).send('Permission denied')
    }

    // 检查当前提交的版本是否已存在
    if(app.isVersionExist()){
        // 如果已存在则返回错误提示
        return res.status(403).send(app.error(1))
    }

    // 写入模块包
    req.pipe(fs.createWriteStream(app.zip));

    // 响应客户端请求
    req.on('end', function(){
        // 更新版本库信息
        app.update();
        // 返回信息
        res.status(200).send('success')
        // 解压包到preview路径下
    })
})

/**
 * 下载模块api
 * @param   {String}  req.query.name    名称
 * @param   {String}  req.query.version 版本
 * @return  {Zipper}                    Zip压缩包
 * @example curl -G domain/api/app?name=header&version=1.0.0
 * @example curl -G http://127.0.0.1:3000/app/aimee/api/app?name=header&version=1.0.0
 */
router.get('/api/app', function(req, res){
    app.get(req.query)
    res.status(200).download(app.zip)
})

// login
router.post('/api/login', function(req, res){
    var someone = config.user[req.body.username];

    // 检查用户是否存在
    if(!someone || !someone.username){
        return res.status(403).send('Username is not exist')
    }

    // 检查密码是否正确
    if(someone.password === crypto.hex(req.body.password)){
        res.status(200).send(crypto.base(req.body.password))
    }

    else{
        res.status(403).send('Password mistake')
    }
})


// 检查用户注册信息
function regCheck(req) {
    // 检查注册用户名
    if(!req.body.username){
        return {code: 403, message: 'Can\'t find username'}
    }

    // 检查注册密码
    if(!req.body.password){
        return {code: 403, message: 'Can\'t find password'}
    }

    // 检查已注册用户是否重复
    if(config.user[req.body.username]){
        return {code: 403, message: 'user is exist'}
    }

    return {code: 200, message: req.body.username + ' is reg'}
}

// reg
router.post('/api/reg', function(req, res){
    var user = cache.get('user');
    var msg = regCheck(req);

    if(msg.code !== 200){
        return res.status(msg.code).send(msg.message)
    }

    // 注册用户
    user.set(req.body.username, {
        username: req.body.username,
        password: crypto.hex(req.body.password),
        email: req.body.email
    })
    // 持久化存储
    user.save(function(err, success){
        if(err){
            res.status(500).json(err)
        }

        else {
            // 更新config.user
            config.user = user.get();
            res.status(msg.code).send(crypto.base(req.body.password))
        }
    })
})
