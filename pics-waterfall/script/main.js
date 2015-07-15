var xmlhttp , picId = 0, ListHeight = [0,0,0,0,], PicSum=0, ImageLimit = 200;
var flag = true, IsMousedown, lat, lng;
var obj;
var position_option = {
						enableHighAccuracy: true,
						maximumAge: 30000,
						timeout: 20000
};
function getPositionSuccess(position)
{
	lat = position.coords.latitude;
	lng = position.coords.longitude;
//	alert( "您所在的位置： 纬度" + lat + "，经度" + lng );
	if(typeof position.address !== "undefined")
	{
		var country = position.address.country;
		var province = position.address.region;
		var city = position.address.city;
		alert(' 您位于 ' + country + province + '省' + city +'市');
	}
}
function getPositionError(error)
{
	switch (error.code)
	{
		case error.TIMEOUT:
			alert("连接超时，请重试");
			break;
		case error.PERMISSION_DENIED:
			alert("您拒绝了使用位置共享服务，查询已取消");
			break;
		case error.POSITION_UNAVAILABLE:
			alert("获取位置信息失败");
			break;
	}
}
navigator.geolocation.getCurrentPosition(getPositionSuccess, getPositionError, position_option);

function rad(d)
{
   return d * Math.PI / 180.0;
}
function GetDistance(jing, wei)
{
//	wei = 90 - wei;
	var radLat1 = rad(lat);
	var radLat2 = rad(wei);
	var a = radLat1 - radLat2;
	var b = rad(lng) - rad(jing);
	var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2)+Math.cos(radLat1)*Math.cos(radLat2)*Math.pow(Math.sin(b/2),2)));
	s = s * 6378.137;
	s = Math.round(s * 10000) / 10000;
   return parseInt(s);	
}
function loadXMLDoc(url,cfunc)
{
	if (window.XMLHttpRequest)
	{
		xmlhttp = new XMLHttpRequest();
	}
	else
	{
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.onreadystatechange = cfunc;
	xmlhttp.open("POST" ,url ,true);
	xmlhttp.send();
}

function myAfaxFunction()
{
	loadXMLDoc("/json/test.jsonp",function()
	{
		if (xmlhttp.readyState==4 && xmlhttp.status==200)
		{
			obj = eval(xmlhttp.responseText);
			for (var i = 0; i < 20; i++)
			{
				addImage();
			}
//		document.getElementById("myDiv").innerHTML=xmlhttp.responseText;
		}
	});
}
function CommentAfaxFunction(pID, PageNum)
{
	loadXMLDoc("/json/Comment" + pID + "and" + PageNum + ".json",function()
	{
		if (xmlhttp.readyState==4 && xmlhttp.status==200)
		{
			var obj1 = eval('('+ xmlhttp.responseText+')');
			var pp = document.getElementById("CommentBlock");
			pp.innerHTML = '';
			for (var i = 0; i < obj1.len; i++)
			{
				pp.innerHTML += '<div class = "CUser"> <div class = "IdText"> ' + obj1.comments[i].User + ' </div></div> <div class = "CContent"> ' + obj1.comments[i].Content + ' </div>';
			}
			pp.innerHTML += '<div class = "asdf"> 共有' + obj[pID - 1].PageSum + '页，当前为第' + PageNum + '页 </div>'; 
			pp.innerHTML += '<a class = "lianjie" id = "' + pID + 'and' +  PageNum + '"onclick = "ChangePage(this.id, -1)"> 上一页 </a>' + '<a class = "lianjie" id = "' + pID + 'and' +  PageNum + '"onclick = "ChangePage(this.id, 1)"> 下一页 </a>';
			pp.innerHTML += '<div class = "asdf"> 这张图片纬度为：' + obj[pID - 1].weidu.toFixed(2) + ' 经度为：' + obj[pID - 1].jingdu.toFixed(2) + '</div>';
			pp.innerHTML += '<div class = "asdf"> 距离您' + GetDistance(obj[pID - 1].jingdu, obj[pID - 1].weidu) + '千米</div>';
//		document.getElementById("myDiv").innerHTML=xmlhttp.responseText;
	}
	});
}
function loadImage(url, callback)
{
	var img = new Image(); //创建一个Image对象，实现图片的预下载     
	img.src = url;     
	img.onload = function () { //图片下载完毕时异步调用callback函数。         
	callback(1);
	};
	img.onerror = function() {
		callback(0);
	}
	if (img.complete) { // 如果图片已经存在于浏览器缓存，直接调用回调函数     
		callback(1);
		return; // 直接返回，不用再处理onload事件     
	}     
}

function getImage(ListId, picId)
{
	PicSum++;
//	picId++;
	ListHeight[ListId - 1]+= obj[picId].Height / obj[picId].Width;
	return '<div class="pic" id ="Image' +  PicSum + '" ><img src="' + "images/loading.gif" + '" alt="' + obj[picId].name + '" onclick = "BigPicture(this.alt)"/><div class = "OverFlow"> <p> 图片' + (picId +1)+ '</p></div></div>';
}

function ChangePage(pStr, step)
{
	var index = pStr.indexOf("and");
	var pID = parseInt(pStr.substring(0, index));
	var PageNum = parseInt(pStr.substring(index + 3));
	PageNum += step;
	if (PageNum > 0 && PageNum <= obj[pID - 1].PageSum)
		CommentAfaxFunction(pID, PageNum);
}

function BigPicture(ID)
{
	var pp1 = document.getElementById("shadow");
	var pp2 = document.getElementById("BigPic");
	var pp3 = document.getElementById("AllPre");
	var pp4 = document.getElementById("PlaceComment");
	pp1.style.display = "block";
	document.getElementsByClassName("ToTop")[0].style.display = "none";
	pp3.style.display = "block";
	pp3.style.top = "10%";
	pp3.style.left = "20%";
	var pID = parseInt(ID.substring(5)) - 1;
	pp2.src = "images/loading.gif";
	loadImage(obj[pID].url, function(){
		pp2.src = obj[pID].url;
	})
	document.body.style.overflow='hidden';
	CommentAfaxFunction(pID + 1, 1);
	pp4.style.height = parseInt(window.getComputedStyle(pp2, null).height) + 10 +'px';
	pp1.onclick = function(e)
	{
				document.body.style.overflow='scroll';
				document.getElementsByClassName("ToTop")[0].style.display = "block";
				pp1.style.display = "none";
				pp3.style.display = "none";
	}
	pp2.onmousedown = function(e)
	{
        event.preventDefault();
        event.stopPropagation();
		IsMousedown = true;
		e = e||event;
		Left = e.clientX - parseInt(window.getComputedStyle(pp3, null).left);
		Top = e.clientY - parseInt(window.getComputedStyle(pp3, null).top);
		document.onmousemove = function(e)
		{
			e = e||event;
			if (IsMousedown)
			{
				pp3.style.left = e.clientX - Left + "px";
				pp3.style.top = e.clientY - Top + "px";
			}
		}
		pp2.onmouseup=function()
		{
			var LL = e.clientX - parseInt(window.getComputedStyle(pp3, null).left);
			var TT = e.clientY - parseInt(window.getComputedStyle(pp3, null).top);
			IsMousedown=false;
			if (LL == Left && TT == Top)
			{
				document.body.style.overflow='scroll';
				pp1.style.display = "none";
				document.getElementsByClassName("ToTop")[0].style.display = "block";
				pp3.style.display = "none";
			}
		}
	}
	document.onkeydown = function(e){
		if (e.keyCode == 27)
		{
			document.body.style.overflow='scroll';
			document.getElementsByClassName("ToTop")[0].style.display = "block";
			pp1.style.display = "none";
			pp3.style.display = "none";
		}
	};
}
function addInList(ToId)
{
	ListId = parseInt(ToId.charAt(3));
	var picId = parseInt(Math.random() * 50 + 1) - 1;
	document.getElementById(ToId).innerHTML += getImage(ListId, picId);
	var ss = PicSum;
	loadImage(obj[picId].url, function(Type){
		var p0 = document.getElementById('Image' + ss);
		if (Type)
		{
			p0.firstChild.src = obj[picId].url;
		}
		else
		{
			p0.firstChild.src = "images/error.jpg";
		}
	})

//	alert(picdom.style.height+' '+picdom.style.width);
}

function addImage()
{
	if (PicSum >= ImageLimit)
		return;
	var minHeight = 10000000, minList;
	for (var i = 1; i <= 4; i++)
	{
		var pp = document.getElementById("div" + i);
		if (ListHeight[i-1] < minHeight)
		{
			minHeight = ListHeight[i-1];
			minList = i;
		}
	}
	addInList("div" + minList);
}

window.onscroll = function ()
{
	var DomButton = document.getElementById("ToTopButton");
	if (document.documentElement.scrollTop ==0 && document.body.scrollTop == 0)
		{
			DomButton.hidden = true;
		}
		else
		{
			DomButton.hidden = false;
		}
	var ScrollT = document.documentElement.scrollTop||document.body.scrollTop;
	var ScrollH = document.documentElement.scrollHeight||document.body.scrollHeight;
	var ClientH = document.documentElement.clientHeight||document.body.clientHeight;
	if (ScrollT >= ScrollH - ClientH - 500)
	{
		var pp = PicSum;
		for (var i = 0; i < 8; i++)
		{
			addImage();
		}

	}
}
