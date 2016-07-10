var express = require('express');
var async=require('async');
//路由生产一个路由的实例
var router = express.Router();
router.get('/add', function (req, res) {
  res.render('article/add', {title: '发表文章'});
});
router.get('/list', function (req, res) {
  var keyword = req.query.keyword;
  var pageNum = req.query.pageNum ? Number(req.query.pageNum) : 1;//当前页码，默认是第一页
  var pageSize = req.query.pageSize ? Number(req.query.pageSize) : 2;//每页条数 默认值为每页2条
  var query = {};
  if (keyword) {
    query.title = new RegExp(keyword);
  }
  Model('Article').find(query).count(function(err,count){
    Model('Article').find(query).skip((pageNum - 1) * pageSize).limit(pageSize).populate('user').exec(function (err, docs) {
      res.render('article/list', {
        title: '文章列表',
        articles: docs, //当前页的记录
        pageNum: pageNum, //当前页码
        pageSize: pageNum, //每页条数
        keyword: keyword,//关键字
        totalPage:Math.ceil(count/pageSize)
      });
    });
  })
});
router.post('/add', function (req, res) {
  var article = req.body;//请求体转成对象放在req.body上
  article.user = req.session.user._id;
  Model('Article').create(article, function (err, doc) {
    if (err) {
      req.flash('error', '发表文章失败');
      return res.redirect('back');
    } else {
      req.flash('success', '发表文章成功');
      return res.redirect('/');
    }
  })
});
//路径参数，把参数放在路劲里面
router.get('/detail/:_id', function (req, res) {
  var _id = req.params._id;
  async.parallel([
    function(cb){
      Model('Article').update({_id:id},{$inc:{pv:1}},function(err,result){
        cb();
      })
    },
    function(cb){
      //按照ID查询文章的对象
      Model('Article').findById(_id, function (err, doc) {
        cb(err,doc);

      })
    }
  ],function(err,result){
    if (err) {
      req.flash('error', '查看详情失败');
      res.redirect('back');
    } else {
      //渲染详情页的模板
      res.render('article/detail', {title: '文章详情', article: result[1]});
    }
    });

});
router.get('/delete/:_id', function (req, res) {
  var _id = req.params._id;//得到路径中ID
  Model('Article').remove({_id: _id}, function (err, result) {
    if (err) {
      req.flash('error', '删除失败');
      return res.redirect('back');
    } else {
      req.flash('success', '删除成功');
      return res.redirect('/')
    }
  })
});
router.get('/update/:_id', function (req, res) {
  var _id = req.params._id;
  Model('Article').findById(_id, function (err, doc) {
    if (err) {
      req.flash('error', '更新出错');
      return res.redirect('back');
    } else {
      res.render('article/add', {
        title: '更新文章',
        article: doc
      })
    }
  })
});
module.exports = router;
