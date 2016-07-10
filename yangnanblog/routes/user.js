var express = require('express');
var router = express.Router();

/* GET users listing. 注册 当用户访问此路径的时候返回一个空白表单*/
router.get('/reg', function(req, res, next) {
  //第一个是相对路径，相对于views也就是模板的跟目录
  res.render('user/reg',{title:'注册'});
});
//接收注册表单
router.post('/reg',function(req,res){
//  接收请求体，然后保存到数据库中
//  客户端填写注册表单后，点击提交按钮的时候，会把表单内容序列化成查询字符串的格式放在请求体重传到后台 body-parser中间件把它转成对象并赋给req.body
  var user=req.body;
  if(user.password!=user.repassword){
    //console.log('密码和重复密码不一致');
    return res.redirect('back');//表示返回上一个页面
  }
  delete user.repassword;//删除不需要保存的字段
  user.password=md5(user.password);
  user.avatar='https://secure.gravatar.com/avatar/'+md5(user.email)+'?s=48';
  Model('User').create(user,function(err,doc){//保存一个文档
    if(err){
      req.flash('error','注册失败');
      return res.redirect('back');
    }else{
      req.flash('success','注册成功');
      req.session.user=doc;//把保存之后的用户文档对象赋给req.session
      res.redirect('/');
    }
  })
});
function md5(str){
  return require('crypto')//加载加密模块
      .createHash('md5')//指定哈希算法
      .update(str)//指定要加密的字符串
      .digest('hex'); //摘要输出，指定编码为16进制的字节
}
//登陆 当用户访问此路径的时候返回一个空白表单
router.get('/login', function(req, res, next) {
  //第一个是相对路径，相对于views也就是模板的跟目录
  res.render('user/login',{title:'登陆'});
});
router.post('/login',function(req,res){
  var user=req.body;
  user.password=md5(user.password);
  Model('User').findOne(user,function(err,doc){
    if(err){
      req.flash('error','登录失败');
      req.redirect('back');
    }else{
      if(doc){
        req.flash('success','登陆成功');
        req.session.user=doc;
        res.redirect('/');
      }else{
        req.flash('error','登录失败');
        res.redirect('back')
      }
    }
  })
});
//退出 当用户访问此路径的时候返回一个空白表单
router.get('/logout', function(req, res, next) {
  req.session.user=null;
  //res.render('退出');
  res.redirect('/user/login')
});
module.exports = router;
