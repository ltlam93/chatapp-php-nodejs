var db= require('./database.js');

exports.room= (function(){
	var roomDB= db('room');
	var ob= {};

	ob.getRoomIDs= function(cb){
		roomDB.select('id').exec(cb);
	}

	ob.check= function(_roomID, cb){
		var roomDB= db('room');
		console.log('model.room.check', roomDB.select().where({
			id: _roomID
		}).toString());
		roomDB.select().where({
			id: _roomID
		}).exec(cb);
		//db.close();
	}

	return ob;
})();

exports.user= (function(){
	var ob= {};
	var userDB= db('user');

	ob.login= function(data, cb){
		var userDB= db('user');
		console.log(userDB.select('username').where(data).toString());
		userDB.select('username').where(data).exec(cb);
	}

	ob.checkUsername= function(name, cb){
		userDB= db('user');
		userDB.select('username').where({username:name}).exec(cb);
	}

	ob.save= function(data, cb){
		var userDB= db('user');
		console.log(userDB.insert(data).toString());
		userDB.insert(data).exec(cb);
	}

	return ob;
})();

/*
exports.User= (function(user){
	var _user={
		username: user.username.match(/\w+/g).join('');
	}
	if(!user){
		throw {message:'user is not exist.'};
	}
	if(typeof(user.username) !== 'string'){
		throw {message: 'username is not string'};
	}
	if(user.username.length>100){
		throw {message: 'username.length is bigger than 100'};
	}
	if(user.username.length<6){
		throw {message:'username.length is smaller than 6'};
	}
})()

function(){
	var that={};
	that.string= function(_x){
		that.x= _x;
		if(typeof(that.x) !== 'string'){
			throw {message: 'that is not string.'};
		}
		if(that.x.length === 0){
			throw {message:'that is empty.'}
		}
		return that;
	}

	that.min= function(n){
		if(typeof(n) !== 'number'){
			throw {message: 'arg is not number.'};
		}
		if((typeof(that.x)==='string' && that.x.length<n) || (typeof(that.x)==='number' && that.x<n))){
			throw {message:'that is smaller than '+n};
		}
		return that;
	}

	that.max= function(n){
		if(typeof(n) !== 'number'){
			throw {message: 'arg is not number.'};
		}
		if((typeof(that.x)==='string' && that.x.length>n) || (typeof(that.x)==='number' && that.x>n))){
			throw {message:'that is bigger than '+n};
		}
		return that;
	}

	that.between= function(n,m){
		if(typeof(n) !== 'number' || typeof(m) !== 'number'){
			throw {message: 'arg is not number.'};
		}
		if((typeof(that.x)==='string' && that.x.length<n) || (typeof(that.x)==='number' && that.x<n))){
			throw {message:'that is smaller than '+n};
		}
		if((typeof(that.x)==='string' && that.x.length>m) || (typeof(that.x)==='number' && that.x>m))){
			throw {message:'that is bigger than '+m};
		}
		return that;
	}

	that.toWord= function(){
		that.x= that.x.match(/\w+/g).join('');
		return that;
	}

	that.regex= function(rg){
		that.x= that.x.match(rg).join('');
		return that;
	}

	that.getValue= function(){
		return that.x;
	}

*/