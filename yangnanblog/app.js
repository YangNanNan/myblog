var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session=require('express-session');
var MongStore=require('connect-mongo')(session);
var routes = require('./routes/index');
var user = require('./routes/user');
var article=require('./routes/article');
var db=require('./db');//引入数据库操作模块
var app = express();
var settings=require('./settings');
var flash=require('connect-flash');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html',require('ejs').__express);

var fs=require('fs');
var ws=fs.createReadStream('./access.log',{flags:'a'});
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('tiny'),{stream:ws});//dev是一种日志格式
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret:'zfpx',
  resave:true,
  saveUninitialized:true,
  store:new MongStore({
    url:settings.url
  })
}));
app.use(flash());
app.use(function(req,res,next){
  res.locals.keyword='';
  res.locals.user=req.session.user;
  res.locals.success=req.flash('success').toString();
  res.locals.error=req.flash('error').toString();
  next()
});
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', routes);
app.use('/user', user);
app.use('/article',article);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  res.render('404',{});
  //next(err);
});

// error handlers
var errorLog=fs.createReadStream('./error.log',{flags:a});
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    errorLog.write(err.status+''+err.stack);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
