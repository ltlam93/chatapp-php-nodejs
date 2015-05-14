var express = require('express.io')
	,app = express().http().io();

var SERVER= 'SERVER',
		UPDATE_CHAT= 'update-chat',
		JOIN= 'join',
		UPDATE_ROOM_MEMBERS= 'update-room-members',
		SEND_CHAT= 'send-chat';

//format json data
app.use(express.cookieParser());
app.use(express.json());
app.use(express.session({secret: '123456qwerty'}));
//upload file
app.use(express.bodyParser());
app.use(express.static(__dirname + '/public'));
app.use('/room', express.static(__dirname + '/public'));
app.use('/upload', express.static(__dirname+ '/upload'));

var sv= require('./controller.js').server;
app.get(/^\/room\/(\d+)/, sv.loadRoom);
app.post('/api/upload', sv.requireAuth, sv.upload);
app.get(/^\/api\/room\/(\d+)/, sv.checkRoom);
app.get('/api/auth', sv.authentication);
app.post('/api/login', sv.login);
app.post('/api/register', sv.register);
app.post('/api/logout', sv.logout);

var counter= [];
console.log('nodejs begin....................');
app.io.route(JOIN, function(req){
	var username= req.session.username;
	if(!username || sv.room.id != parseInt(req.data)){
		return;
	}
	console.log(username, ' joined room ', sv.room.id);
	req.io.join(sv.room.id);
	app.io.room(sv.room.id).broadcast(UPDATE_CHAT, {
		username: SERVER,
		message: username+' has connected to this room'
	});

	console.log('usersonline1: ',counter[sv.room.id]);
	counter[sv.room.id]= counter[sv.room.id]+1||1;
	console.log('usersonline2: ',counter[sv.room.id]);
	app.io.room(sv.room.id).broadcast(UPDATE_ROOM_MEMBERS, counter[sv.room.id]);
});

app.io.route(SEND_CHAT, function(req){
	console.log('server:sendChat:',req.data,req.session.username);
	//var sv.room.id= parseInt(req.data.sv.room.id);
	app.io.room(req.data.roomID).broadcast(UPDATE_CHAT, {
		username: req.session.username, 
		message: req.data.message
	});
});

app.io.route('disconnect', function(req){
	console.log('disconnection');
	if(counter[sv.room.id]>0){
		counter[sv.room.id]--;
		app.io.room(sv.room.id).broadcast(UPDATE_ROOM_MEMBERS, counter[sv.room.id]);
	}
})
app.listen(9000);