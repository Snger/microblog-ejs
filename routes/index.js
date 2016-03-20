var express = require('express');
var router = express.Router();
var session = require('express-session');
var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');
var monent = require('moment');

/* GET home page. */
router.get('/', function(req, res, next) {
  // throw new Error('An error for test purposes.');
	Post.get(null, function(err, posts) {
		var userPosts = [];
		posts.forEach(function(post, index){
			post.time = monent(
					monent(post.time).format('YYYY-MM-DD hh:mm:ss')
				).fromNow();
		});
		userPosts = posts;
	  res.render('index', { 
	  	title: 'Welcome to Express',
	  	user: req.session.user,
	  	msg: req.session.message,
	  	posts: userPosts
	  });
	});
});

router.get('/u/:userName', function (req, res) {
	var user = req.session.user;
	var post = new Post(user.name);
	var userPosts = [];
	Post.get(user.name, function(err, posts) {
		posts.forEach(function(post, index){
			post.time = monent(
					monent(post.time).format('YYYY-MM-DD hh:mm:ss')
				).fromNow();
		});
		var userPosts = posts;
		res.render('pages/user', { 
	  	title: 'Welcome ' + user.name,
	  	user: user,
	  	msg: req.session.message,
	  	posts: userPosts
	  });
	});
});
router.get('/post', function (req, res) {
	var user = req.session.user;
	res.render('pages/post', {
		title: '发表文章',
  	user: user,
  	msg: req.session.message
	});
});
// router.post('/post', checkLogin);
router.post('/post', function (req, res) {
	var user = req.session.user;
	var post = new Post(user.name, req.body.post);
	post.save(function(err) {
		if (err) {
			req.ression.message = '发表失败';
			res.redirect('/post');
		}
		req.session.message = '发表成功';
		res.redirect('u/' + user.name);
	});
});
router.get('/reg', function (req, res) {
	res.render('pages/reg', {
		title: '欢迎注册',
		msg: req.session.message
	});
});
router.post('/reg', function (req, res) {
	if (req.body.password !== req.body['re-password']) {
		req.session.messages = '两次输入密码不一致';
		return res.redirect('/reg');
	}
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');
	// var password = req.body.password;

	var newUser = new User({
		name: req.body.name,
		password: password,
		email: req.body.email
	});

	User.get(newUser.name, function (err, user) {
		if (user) {
			err = 'Username already exists.';
		}
		if (err) {
			req.session.messages = err;
			return res.redirect('/reg');
		}
		newUser.save(function (err) {
			if (err) {
				req.session.messages = err;
				return res.redirect('/reg');
			}
			req.session.user = newUser;
			req.session.messages = '注册成功';
			return res.redirect('/');
		});
	});
});
router.get('/login', function (req, res) {
	res.render('pages/reg', {title: 'Express'});
});
router.post('/login', function (req, res) {
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');

	User.get(req.body.name, function(err, user) {
		if(!user) {
			req.session.messages = '用户不存在';
			res.end('用户不存在');
			return;
		}
		if (user.password !== password) {
			req.session.messages = '密码错误';
			res.end('密码错误');
			return;
		}
		req.session.user = user;
		req.session.messages = '登录成功';
		// Todo 判断路径，非首页则跳回首页
		return res.redirect('/');
	});
});
router.get('/logout', function (req, res) {
	req.session.user = null;
	req.session.mesage = '登出成功';
	res.redirect('/');
});

module.exports = router;
