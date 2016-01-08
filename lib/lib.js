var fs = require('fs');
var ass = require('assert');
var path = require('path');
var cache = require('./cache');
var config = require('./config');
var lib = require('linco.lab').lib;
var package = require('vpm-package');
var showdown  = require('showdown');
var xssFilter = require('showdown-xss-filter');
var Markdown = new showdown.Converter({ extensions: [xssFilter] });

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
                md: Markdown.makeHtml(md),
                info: require(path.join(app.preview, config.name.appConfigFile))
            }
        }
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
