var nickName = '';						//当前使用的昵称名
var arrayName =[];						//在线用户
var AllMessage = 0;						//接受到信息条数
var myDataRef = new Firebase('https://burning-heat-1712.firebaseio.com/');

window.setInterval(showOnline, 5000);	//每隔5s向服务器发送信息
function showOnline()
{
	var myDate = new Date();
	myDataRef.child(nickName).set({name:nickName, time:myDate.getTime()});
}

myDataRef.on('child_added', function(snapshot) {		//firebase新增节点响应事件
	var message = snapshot.val();
	var myDate = new Date();
	if (!('time' in message))							//判断信息类型
		displayChatMessage(message.name, message.text);
	else if (myDate.getTime() - message.time <= 60000)	//判断用户是否在线
	{
		if ($.inArray(message.name, arrayName) == -1){
			arrayName.push(message.name);
			$('<div class = "nameList"/>').text(message.name).appendTo($('#userList'));
		}
	}
});

myDataRef.once('value', function(snapshot) {		//firebase新增节点响应事件
	var messages = snapshot.val();
	var myDate = new Date();
	for	(var i = 0; i < messages.length; i++)
		if (('time' in messages[i]) && myDate.getTime() - messages[i].time <= 60000)	//判断用户是否在线
		{
			if ($.inArray(messages[i].name, arrayName) == -1){
				arrayName.push(messages.name);
				$('<div class = "nameList"/>').text(messages.name).appendTo($('#userList'));
			}
		}
	if (nickName == '') {
		changeNickName();
	}
});

myDataRef.on('child_removed', function(oldChildsnapshot) {		//用户下线通知
	var message = oldChildsnapshot.val();
	var p = $.inArray(message.name, arrayName);
	if (p != -1)
	{
		arrayName.splice(p, 1);
		$('#userList').children()[p + 1].remove();
	}
});

$(window).keydown(function(e){									//键盘响应事件
	if (e.ctrlKey && e.keyCode == 13)
		sendMessage();
});

$(window).unload(function(){									//离开页面时用户下线
	if (nickName != '')
	{
		removeName(nickName);
	}
});

function removeName(nickName){									//删去用户信息
	myDataRef.child(nickName).remove();
}

function displayChatMessage(name, text) {						//将信息加入到页面中去
	for (var i = 0; i < text.length; i++)						//处理换行符
		if (text.charAt(i) == '\n'){
			text = text.substring(0, i) + '<br/>' + text.substring(i + 1);
			i += 4;
		}
	AllMessage++;
	if (AllMessage > 200)										//控制页面显示的信息条数
	{
		AllMessage--;
		$('#messageBox').children()[0].remove();
	}
	$('#messageBox')[0].innerHTML += '<div class ="oneMessage"><div class = "oneName"> '+ name + ':</div><div class = "oneContent"><div class = "oneContentText">' + text + '</div> </div></div>';
//	$('<div class = "oneMessage"/>').append($('<div class="oneName"/>').text(name+': ')).append($('<div class="oneContent"/>').append($('<div class="oneContentText"/>').text(text))).appendTo($('#messageBox'));
	$('#messageBox')[0].scrollTop = $('#messageBox')[0].scrollHeight;
};

function sendMessage(){											//发送信息
	var text = $('#inputMessage').val();
	if (nickName == '') {
		changeNickName();
	}
	else {
	myDataRef.push({name: nickName, text: text});
	$('#inputMessage').val('');
	}
}

function changeNickName()										//修改昵称
{
	apprise("请输入你的昵称",{input:true},function(aText){		//新增对话框
		if ($.inArray(aText, arrayName) != -1)
			return 1;
		else{
			if (nickName != '')
			{
				removeName(nickName);
			}
			nickName = aText;
			$('.nickWait').text(nickName);
			$('#inputMessage').focus();
			return 0;
		}
	});
}
