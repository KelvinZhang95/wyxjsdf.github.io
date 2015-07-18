var nickName = '', arrayName =[];
var myDataRef = new Firebase('https://burning-heat-1712.firebaseio.com/');
window.setInterval(showOnline, 5000);
function showOnline()
{
	var myDate = new Date();
	myDataRef.child(nickName).set({name:nickName, time:myDate.getTime()});
}
myDataRef.on('child_added', function(snapshot) {
	var message = snapshot.val();
	var myDate = new Date();
	if (!('time' in message))
		displayChatMessage(message.name, message.text);
	else if (myDate.getTime() - message.time <= 60000)
	{
		if ($.inArray(message.name, arrayName) == -1){
			arrayName.push(message.name);
			$('<div class = "nameList"/>').text(message.name).appendTo($('#userList'));
		}
	}
});
myDataRef.on('child_removed', function(oldChildsnapshot) {
	var message = oldChildsnapshot.val();
	var p = $.inArray(message.name, arrayName);
	if (p != -1)
	{
		arrayName.splice(p, 1);
		$('#userList').children()[p + 1].remove();
	}
});

$(window).unload(function(){
	if (nickName != '')
	{
		removeName(nickName);
	}
});
function removeName(nickName){
	myDataRef.child(nickName).remove();
}

function displayChatMessage(name, text) {
	for (var i = 0; i < text.length; i++)
		if (text.charAt(i) == '\n'){
			text = text.substring(0, i) + '<br/>' + text.substring(i + 1);
			i += 4;
		}
	$('#messageBox')[0].innerHTML += '<div class ="oneMessage"><div class = "oneName"> '+ name + ':</div><div class = "oneContent"><div class = "oneContentText">' + text + '</div> </div></div>';
//	$('<div class = "oneMessage"/>').append($('<div class="oneName"/>').text(name+': ')).append($('<div class="oneContent"/>').append($('<div class="oneContentText"/>').text(text))).appendTo($('#messageBox'));
	$('#messageBox')[0].scrollTop = $('#messageBox')[0].scrollHeight;
};
function sendMessage(){
	var text = $('#inputMessage').val();
	if (nickName == '') {
		changeNickName();
	}
	else {
	myDataRef.push({name: nickName, text: text});
	$('#inputMessage').val('');
	}
}
function changeNickName()
{
	apprise("请输入你的昵称",{input:true},function(aText){
		if ($.inArray(aText, arrayName) != -1)
			return 1;
		else{
			if (nickName != '')
			{
				removeName(nickName);
			}
			nickName = aText;
			$('.nickWait').text(nickName);
			return 0;
		}
	});
}
