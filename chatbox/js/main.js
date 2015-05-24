var app = angular.module('chatbox', []);

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
				var el = angular.element('<div />');
				switch(chat.type){
					case 'stranger':
					el.append('<span class="stranger">người lạ: </span>'+chat.message);
					break;
					case 'you':
					el.append('<span class="you">bạn: </span>'+chat.message);
					break;
					case 'info':
					el.append('<span class="info">'+chat.message+'</span>');
					break;
				}
				el = $compile(el)($scope);
				element.append(el);
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

app.controller('ChatController', function($scope, $http, $timeout, $log, messageService){

	var userId=0, strangerId=0, attachment= '';
	$scope.tooltip = false;
	$scope.chat={};

	// ham khoi tao
	(function init(){
		$http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
		// login
		startChat();
		// lay so nguoi online
		getNumberOfOnlineUsers();
	})();

	function startChat(){
		// Goi getUserId.php de lay id
		$http.get('getUserId.php').success(function(uid){
			userId = uid;
			// kiem tra user da dang nhap chua
			checkFirstVisit();
			$scope.loading = true;
			// cho ban chan;
			randomChat();
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
		$scope.loading = true;

		var fd = new FormData();console.log(file)
        fd.append('file', file);
        $http.post('uploadFile.php', fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        }).success(function(data){
        	$scope.loading = false;
        	attachment= data;
        });
	}

	function getNumberOfOnlineUsers(){
		$http.get('getTotalOnlineUsers.php').success(function(data){
			$scope.useronline= data;
		});
		$timeout(getNumberOfOnlineUsers, 1000);
	}

	function leaveChat(){
		checkFirstVisit();
		return;
	};
	window.onbeforeunload= leaveChat;

	function checkFirstVisit() {
		var c = document.cookie,
			name = 'useronline=';

		if(c.indexOf(name)==-1) {
    		document.cookie = name+ userId;
		}else {
    		// not first visit
    		var olduseronline= c.substring(name.length,c.length);
    		// logout
    		$http.get('leaveChat.php?userId='+ olduseronline).success(function(){
    			document.cookie = name+ userId;
    		});
		}
	}

	function randomChat(){
		// goi getStrangerId.php lay id cua ban chat
		$http.get('getStrangerId.php?userId='+ userId).success(function(sid){
			strangerId= sid;
			// neu k co ban chat
			if(strangerId== "0"){
				// goi lai ham randomChat() 1s 1lan
				$timeout(randomChat, 1000);
			}else{
				$scope.loading= false;
				$scope.chat = {
					type: 'info',
					message:'Người lạ vừa vào phòng. Chào hỏi nhau đê!'
				}
				// cho tin nhan moi
				listenToRecieve();
			}
		});
	};

	function listenToRecieve(){
		// goi listenToRecieve.php de lay tin nhan moi
		$http.get('listenToRecieve.php?userId='+ userId).success(function(data){
			// neu server tra ve chuoi '||--noResult--||'
			if(data=='||--noResult--||'){
				$scope.loading = true;
				$scope.chat = {
					type: 'info',
					message:'Người lạ đã rời phòng. Đang chờ người khác...'
				}
				// logout
				leaveChat();
				// login
				startChat();
				return;
			}else if(data != ''){
				// Hien thi tin nhan moi
				$scope.chat = {
					type: 'stranger',
					message: data
				};
				$scope.loading= false;
			};
			// goi ham listenToRecieve() 1s 1 lan de lay tin moi
			$timeout(listenToRecieve, 1000);
		});
	};

	$scope.sendMessage = function(){
		// gui tin nhan moi den sendMessage.php
		var message= messageService.replaceEmotions($scope.message);
		if(attachment){
			message= messageService.encodeImage(message, attachment);
		}

		var cc= messageService.objecttoParams({
			userId: userId,
			strangerId: strangerId,
			message: escape(message)
		});

		$http.post('sendMessage.php', cc).success(function(data){
			$scope.chat = {
				type:'you',
				message: data
			};
			attachment='';
			$scope.loading= false;
			$scope.message= '';
		});
	};
})
