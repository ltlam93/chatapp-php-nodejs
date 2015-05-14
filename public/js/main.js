var app = angular.module('chatbox', []);

app.factory('AuthenticationService', function($http){
	return {
		check: function(){
			return $http.get('/api/auth');
		}
	};
});

app.factory('RoomService', function($http){
	return{
		check: function(path){
			return $http.get('/api'+ path);
		}
	}
})

app.factory('UserService', function($http){
	return{
		login: function(u, p){
			return $http.post('/api/login', {username:u, password: p});
		},
		register: function(u, p){
			return $http.post('/api/register', {username:u,password:p});
		},
		logout: function(){
			return $http.post('/api/logout');
		}
	}
})

app.factory('messageService', function($compile){
	var sv= {};
	var emotions = [
		':))',
		':)',
		':(',
		';)',
		':D',
		':((',
		'=))',
		':>'
	];
	sv.replaceEmotions= function(raw){
		raw= raw||'';
		for(var i=0;i<emotions.length;i++){
			raw= raw.replace(emotions[i], '<img src=img/'+i+'.gif />');
		}
		return raw;
	}

	sv.objecttoParams= function(obj) {
    	var p = [];
    	for (var key in obj) {
        	p.push(key + '=' + obj[key]);
    	}
    	return p.join('&');
	};

	sv.decodeImage= function(message){
		var div = angular.element('<div />');
		var i = div.html(message).find('i');
		var url = i.attr('data-link');
		i.attr('ng-click', 'toggleTooltip('+url+')');
		return div.html();
	}

	sv.encodeImage= function(text, url){
		var ex= url.toLowerCase();
		if(ex.match(/\.(mp4|webm|ogg)$/)){
			return text+' <i ng-click="toggle(\''+url+'\', 1)" class="glyphicon glyphicon-film"</i>';
		}else if(ex.match(/\.(jpg|jpeg|gif|png|bmp)$/)){
			return text+' <i ng-click="toggle(\''+url+'\', 0)" class="glyphicon glyphicon-picture"</i>';
		}
	}
	return sv;
});

app.directive('ngMessage', function($compile){
	return{
		restrict: 'AE',
		link: function($scope, element, attrs){
			$scope.$watch(attrs.ngModel, function(chat){
				if(chat.name){
					var el = angular.element('<div />');
					el.append('<b><a href=# >'+chat.name+'</a></b>: '+chat.message);
					el = $compile(el)($scope);
					element.append(el);
				}
			}, true);
		}
	}
});

app.directive('readFile', function(){
	return{
		link: function($scope, element){
			element.bind('change', function(e){
				var file = (e.srcElement||e.target).files[0];
				$scope.sendFile(file);
			});
		}
	}
});

app.controller('ChatController', function($scope, $rootScope, $http, $timeout, $log, messageService, AuthenticationService, UserService, RoomService){

	var socket, fileName= '';
	$scope.toggleLogin= false;
	$scope.toggleRegister= false;
	$scope.tooltip = false;
	$scope.username= null;
	$scope.chat={};

	var SERVER= 'SERVER',
		UPDATE_CHAT= 'update-chat',
		JOIN= 'join',
		UPDATE_ROOM_MEMBERS= 'update-room-members',
		SEND_CHAT= 'send-chat';

	// ham khoi tao
	(function init(){
		RoomService.check(location.pathname).success(function(room){
			$scope.room= room;
			$rootScope.room= room;
		});

		AuthenticationService.check().success(function(_username){
			$scope.username= _username;
			startChat();
		});
	})();

	function startChat(){
		$scope.toggleLogin= false;
		$scope.toggleRegister= false;

		socket= io.connect();
		socket.on('connect', function(){
			console.log('client: connect');
			socket.emit(JOIN, $scope.room.id);
		});

		//startChat
		socket.on(UPDATE_CHAT, function(data){
			console.log(UPDATE_CHAT, data);
			$scope.$apply(function(){
				$scope.chat= {
					name: data.username,
					message: data.message
				};
			});
		});
		// lay so nguoi online
		socket.on(UPDATE_ROOM_MEMBERS, function(counter){
			$scope.$apply(function(){
				$scope.room.members= counter;
			})
		});
	}

	$scope.sendMessage = function(){
		// gui tin nhan moi den sendMessage.php
		var message= messageService.replaceEmotions($scope.message);
		if(fileName){
			message= messageService.encodeImage(message, fileName);
		}

		socket.emit(SEND_CHAT, {
			roomID: $scope.room.id,
			message: message
		});
		$scope.message= '';
	};

	$scope.login= function(_username, _password){
		if(_username&&_password){
			UserService.login(_username, _password).success(function(){
				$scope.isLoggedIn= true;
				$scope.username= _username;
				startChat();
			}).error(console.log);
		}
	}

	$scope.register= function(u,p){
		if(u&&p){
			UserService.register(u,p).success(function(){
				$scope.username= u;
				startChat();
			}).error(console.log);
		}
	}

	$scope.logout= function(){
		UserService.logout().success(function(){
			delete $scope.username;
			location.pathname= '/';
		});
	}

	$scope.toggle= function(url, type){
		$scope.tooltip = !$scope.tooltip;
		if(!url){
			$scope.imagesrc='';
			$scope.videosrc='';
		}
		if(type==0){
			$scope.imagesrc= url;
		}else if(type==1){
			$scope.videosrc= url;
		}
	}

	$scope.sendFile= function(file){
		//$scope.loading = true;

		var fd = new FormData();
        fd.append('file', file);
        $http.post('/api/upload', fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        }).success(function(data){
        	console.log('sent file ', data);
        	fileName= data;
        });
	}
})