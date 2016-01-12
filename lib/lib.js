var fs = require('fs');
var ass = require('assert');
var path = require('path');
var cache = require('./cache');
var config = require('./config');
var lib = require('linco.lab').lib;
var package = require('vpm-package');
var showdown  = require('showdown');
var xssFilters = require('xss-filters');
var Markdown = new showdown.Converter();

lib.extend({

    /**
     * 获取全部的app列表
     * @return  {Object}  所有app的数据对象 {app1: Aimee.json, app2: Aimee.json, ...}
     * @example var allPackagesList = this.getAllPackageList()
     */
    getAllPackageList: function(){
        var arr = [];
        // 查找rep目录
        var folders = lib.dir(config.rep.path, {deep: false}).folders;
        // 遍历所有app
        folders.forEach(function(item){
            arr.push(require(path.join(item, config.name.configFile)))
        })
        return arr;
    },

    // 同上，加入了缓存模块，推荐调用此模块
    getAllPackageListFromCache: function(){
        var allPackagesList = cache.get('allPackagesList');

        // 检查缓存数据
        if(!allPackagesList){
            // 查询本地列表
            allPackagesList = lib.getAllPackageList();
            // 缓存数据
            cache.set('allPackagesList', allPackagesList);
        }

        return allPackagesList;
    },

    /**
     * 解压app到preview目录
     * @param   {String}  app.name    App.name
     * @param   {String}  app.version App.version
     * @example this.unzipToPreview({name: aimee, version: 1.0.0})
     */
    unzipToPreview: function(app){
        // 获取Preview路径
        app.preview = path.join(config.rep.preview, app.name, app.version);
        // 创建解压目录
        lib.mkdir(app.preview);
        // 解压到指定目录
        package.unzip(app.zip, app.preview);
    },

    /**
     * Search and parse readme.md
     * @param   {String}  app.name    App.name
     * @param   {String}  app.version App.version
     * @example this.preview({name: aimee, version: 1.0.0})
     */
    preview: function(app){
        var md, packagejson;
        // 获取 app 系统配置文件
        app.configFile = path.join(config.rep.path, app.name, config.name.configFile);
        // 获取Preview路径
        app.preview = path.join(config.rep.preview, app.name, app.version);
        // 检查当前版本是否存在
        if(!lib.isDir(app.preview)){
            return {code: 1, message: 'Can\'t find this app'}
        }
        // 查找 readme.md
        lib.dir(app.preview, {deep: false}).files.forEach(function(item){
            if(item.match(/readme.md/i)){
                md = fs.readFileSync(item, 'utf-8');
            }
        })
        // Get package.json
        try{
            packagejson = require(app.configFile)
        }catch(e){
            console.log(e.message, 123)
        }
        return {
            code: 0,
            data: {
                md: lib.makeImgsrc(app, xssFilters.inHTMLComment(Markdown.makeHtml(md))),
                info: require(path.join(app.preview, config.name.appConfigFile)),
                INFO: packagejson
            }
        }
    },

    /**
     * 修正app中readme.md内img.src的引用地址
     * @param   {String}  app.name    App.name
     * @param   {String}  app.version App.version
     * @param   {String}  string      需要优化的dom字符串
     * @return  {String}              优化后的dom字符串
     * @example this.makeImgsrc({name: app, version: 1.0.0}, '<img src="log.png">')
     */
    makeImgsrc: function(app, string){
        string = string.replace(/src="([^\s]+\.(?:png|jpg|gif))[^\s]/g, function($1, $2){
            return $1.replace($2, path.join(config.url.appImgPrefix, app.name, app.version, $2))
        })
        return string;
    },

    /**
     * 为数据分页
     * @param   {Array}   list            要分页的数据
     * @param   {Number}  opt.pageNumber  页码
     * @param   {Number}  opt.pageCounts  每页数据长度
     * @return  {Array}                   分页结果数据
     * @example this.paging([], {pageNumber: 1, pageCounts: 100})
     */
    paging: function(list, opt){
        var x, y, length;
        var def = {
            pageNumber: 1,
            pageCounts: 100
        }
        // 合并查询
        opt = this.extend({}, def, opt);

        // 修正 list
        if(!list || !Array.isArray(list)){
            list = []
        }
        // 修正 opt.pageNumber
        if(!opt.pageNumber || !lib.isNumber(opt.pageNumber-0) || opt.pageNumber < 1){
            opt.pageNumber = 1;
        }
        // 修正 opt.pageCounts
        if(!opt.pageCounts || !lib.isNumber(opt.pageCounts-0) || opt.pageCounts < 1){
            opt.pageCounts = 100;
        }

        length = list.length;
        // list.slice(x, y)
        // 计算x坐标位置
        x = (opt.pageNumber - 1) * opt.pageCounts;
        // 计算y坐标位置
        y = opt.pageNumber * opt.pageCounts;

        // 返回分页结果
        return x > length ? [] : list.slice(x, Math.min(y, length))
    },

    // TODO: 简单的搜索规则，只匹配 name, 和查询关键字 keyword，后续完善
    searchKeyword: function(list, keyword){
        var search = [];
        list.forEach(function(item){
            item.name.match(new RegExp(keyword, 'i')) ? search.push(item) : '';
        })
        return search;
    }
})

module.exports = lib;
