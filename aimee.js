var fs = require('fs');
var ass = require('assert');
var path = require('path');
var pm = require('thenjs');
var lib = require('./lib/lib');
var app = require('./lib/app');
var cache = require('./lib/cache');
var config = require('./lib/config');
var crypto = system.crypto;
var router = system.express.Router();
var user = system.app.user;

// system.app.name
exports.name = 'aimee';
exports.router = router;
exports.static = path.join(__dirname, 'static');


router.get('/', function(req, res){
    res.status(200).send('Hello aimee')
})

// For aimee-cli start

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

    pm()
        .then(function(cont){
            user.isLogin(req.headers, function(err, isLogin){
                err ?
                    res.status(403).send(err.message):
                    isLogin ?
                        cont():
                        res.status(403).send('Plase login first');
            })
        })
        .then(function(cont){
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

            // app提交成功，响应客户端请求
            req.on('end', function(){
                // 更新版本库信息
                app.update();
                // 返回信息
                res.status(200).send('success')
                // 解压包到preview路径下
                lib.unzipToPreview(app)
            })
        })
})

// For aimee-cli end...
// For aimee-sage start

/*
cache = {
    "allPackagesList": "所有的模块列表"
}
 */

// 获取App列表
router.get('/api/getPackages', function(req, res){
    var allPackagesList = lib.getAllPackageListFromCache();
    // 数据分页
    var pagingList = lib.paging(allPackagesList, req.query);
    // 响应请求
    res.status(200).json({code: 0, data: {list: pagingList}});
})

// 查询App
router.get('/api/package', function(req, res){
    var msg = lib.preview(req.query);
    msg.code === 0 ?
        // res.render(path.join(__dirname, 'views/index'), {md: msg.data.md}):
        res.status(200).send(msg):
        res.status(404).send(msg);
})

// 搜索App
router.get('/api/search', function(req, res){
    var allPackagesList, searchList, pagingList;

    if(!req.query.keyword){
        res.status(404).send('Not found');
    }

    allPackagesList = lib.getAllPackageListFromCache();
    searchList = lib.searchKeyword(allPackagesList, req.query.keyword);
    // 数据分页
    pagingList = lib.paging(searchList, req.query);
    res.status(200).json({code: 0, data: {list: pagingList}});
})














//
