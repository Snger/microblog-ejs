var mongodb = require('./db');

function Post(username, post, time) {
	this.username = username;
	this.post = post;
	if (time) {
		this.time = time;
	} else {
		this.time = new Date();
	}
}
module.exports = Post;

Post.prototype.save = function(callback) {
	var post = {
		username: this.username,
		post: this.post,
		time: this.time
	};
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.ensureIndex('username');
			collection.insert(post, {safe: true}, function(err, post) {
				mongodb.close();
				if (err) {
          return callback(err);//错误，返回 err 信息
        }
				callback(err, post);
			});
		});
	});
};
Post.get = function(username, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			var query = {};
			if (username) {
				query.username = username;
			}
			collection.find(query)
			.sort({time: -1})
			.toArray(function(err, docs) {
				mongodb.close();
				var posts = [];
				docs.forEach(function(doc, index) {
					var post = new Post(doc.username, doc.post, doc.time);
					posts.push(post);
				});
				callback(err, posts);
			});
		});
	});
};
