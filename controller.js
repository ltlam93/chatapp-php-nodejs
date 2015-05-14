var model= require('./model.js');

exports.server= server= (function(){
	var ob= {};
	var app= require('./server.js');
	var SERVER= 'SERVER',
		UPDATE_CHAT= 'update-chat',
		JOIN= 'join',
		UPDATE_ROOM_MEMBERS= 'update-room-members',
		SEND_CHAT= 'send-chat';

	ob.room={};
	ob.login= function(req, res){
		var post= req.body;
		model.user.login(post, checked);

		function checked(err, data){
			if(!err && data.length>0){
				req.session.test='1234';
				console.log('dang nhap thanh cong')
				req.session.username= post.username;
				req.session.save(function(){
					console.log('session saved.', req.session.username);
					res.end();
				});
			}else{
				console.log('loi dang nhap')
				res.status(500).send(err);
			}
		}
	}

	ob.register= function(req, res){
		var acc= req.body;console.log(acc)

		if(acc){
			model.user.login(acc, checked);
		}

		function checked(err, data){
			if(!err && data.length>0){
				console.log('user da ton tai', data);
				req.session.username= acc.username;
				res.send('');
			}else{
				console.log('user chua ton tai');
				model.user.save(acc, saved);
			}
		}

		function saved(err){
			if(!err){
				console.log(acc.username, ' da dang ki moi')
				req.session.username= acc.username;
				res.send('');
			}else{
				console.error('loi insert csdl',err);
				res.status(500).send(err);
			}
		}
	}

	ob.loadRoom= function(req, res){
		res.sendfile(__dirname + '/public/chatbox.html');
	}

	ob.logout= function(req, res){
		delete req.session.username;
		res.redirect('/');
	}

	ob.checkRoom= function(req, res){
		var roomID= req.params[0];

		model.room.check(roomID, checked);
		
		function checked(err, data){
			if(!err && data.length>0){
				ob.room= {
					id: roomID,
					name: data[0].name,
					members: 0
				};
				res.send(ob.room);
			}else{
				res.status(404).end('RoomID khong ton tai trong csdl');
			}
		}
	}

	ob.upload= function(req, res){
		var fs= require('fs');
		var fl= req.files.file;
		fs.readFile(fl.path, function(err, data){
			var np= __dirname+'/upload/'+fl.name;
			fs.writeFile(np, data, function(err){
				if(!err){
					console.log('server:sent ', np)
					res.send(fl.name);
				}else{
					console.log('server:send_error: ', err);
					res.status(500).send();
				}
			})
		});
	}

	ob.authentication= function(req, res){
		var username= req.session.username;
		if(username){
			res.send(username)
		}else{
			res.status(500).end('chua dang nhap')
		}
	}

	ob.requireAuth= function(req, res, next){
		var username= req.session.username;
		if(username){
			next();
		}else{
			res.status(500).end('chua dang nhap')
		}
	}

	ob.requiredAuth= function(req, res, next){
		if(req.session.username){
			next();
		}else{
			res.status(500).end('chua dang nhap');
		}
	}

	return ob;
})();