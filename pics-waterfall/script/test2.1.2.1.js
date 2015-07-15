var currentPosition,timer;  
var speed;
function moveToTop()			//移到顶端的动画
{
    currentPosition=document.documentElement.scrollTop || document.body.scrollTop;
    currentPosition -= speed;  
	speed += 5;
    if(currentPosition > 0)  
    {  
        window.scrollTo(0,currentPosition);  
    }  
    else  
    {  
        window.scrollTo(0,0);  
        clearInterval(timer);
    }  
}  

function ToTop()
{
	speed = 10;
    timer=setInterval("moveToTop()",1); 
}

function createObject()
{
	var DD = document.createElement('div');			//创捷控件
	DD.className = "ToTop";
	var DomButton = document.createElement('a');
	DD.appendChild(DomButton);
	DomButton.id = "ToTopButton"
	DomButton.display = "block";
	var TextNode = document.createTextNode("Top");
	DomButton.appendChild(TextNode);
	try{document.getElementsByTagName('body')[0].appendChild(DD)}
	catch(e) {};
	DomButton.addEventListener('click', ToTop);						//添加点击事件

	window.onload = function(){								
		if (document.documentElement.scrollTop ==0 && document.body.scrollTop == 0)
		{
			DomButton.hidden = true;
		}
		else
		{
			DomButton.hidden = false;
		}
	}
	DomButton.style.position = "fixed";
	DomButton.style.left = "4%";
	DomButton.style.top = "4%";
	DomButton.style.bottom = "auto";
	DomButton.style.right = "auto";
	DD.init = function(obj)
	{
		if (obj.LeftUp)
		{
			DomButton.style.position = "fixed";
			DomButton.style.left = "4%";
			DomButton.style.top = "4%";
			DomButton.style.bottom = "auto";
			DomButton.style.right = "auto";
		}
		else if (obj.RightUp)
		{
			DomButton.style.position = "fixed";
			DomButton.style.right = "4%";
			DomButton.style.top = "4%";
			DomButton.style.left = "auto";
			DomButton.style.bottom = "auto";
		}
		else if (obj.LeftDown)
		{
			DomButton.style.position = "fixed";
			DomButton.style.left = "4%";
			DomButton.style.bottom = "4%";
			DomButton.style.right = "auto";
			DomButton.style.top = "auto";
		}
		else if (obj.RightDown)
		{
			DomButton.style.position = "fixed";
			DomButton.style.right = "4%";
			DomButton.style.bottom = "4%";
			DomButton.style.left = "auto";
			DomButton.style.top = "auto";
		}
		else
		{
			DomButton.style.position = "fixed";
			DomButton.style.left = obj.x + 'px';
			DomButton.style.top = obj.y+'px';
		}
	};
	return DD;
}