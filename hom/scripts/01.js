var s = window.screen;
var mode = 1;//1代表开始淡化 2代表背景故事 3代表游戏界面
var divs = document.getElementsByClassName('caidan'); 
var width  = q.width = s.width;
var height  = q.height = s.height;
var letters = Array(256).join(1).split('');
var start_frame = 0;
var fight_back = document.getElementById('fight_back');
var beijing = document.getElementById('beijing');
var m_start = document.getElementById('start');
var fighter_w = document.getElementById('fighter_w');
var fighter_e = document.getElementById('fighter_e');
var fighter_a = document.getElementById('fighter_a');
var click = document.getElementById('click');
var fighter_q = document.getElementById('fighter_q');

T    = "\n\n瓦罗然，居于正义之地心脏中心，是正义之地面积最大的大陆。在正义之地没有一个地方能比得上瓦罗然，它富饶茂盛，简直是整个正义之地的中心。所有谋求森林之地霸权的势力，都将焦点放在了瓦罗然。\n\n\n\n\n瓦罗然也是火柴人王国的子民们世代居住和守护的地方，他们一代又一代用生命维护着瓦罗然的和平。因为世人坚信，只要瓦罗然不倒，混乱终归会走向和平，正义终会击败邪恶。瓦罗然就像一面旗帜，在邪恶的罡风中屹立不倒，坚守着世间的正义。\n\n\n\n\n\n\n\n\n\n然而世事难料，在二十年前，邪恶力量召唤出了无比强大的怪物作为他们的首领，瓦罗然大陆的防线一道一道被攻破，在最后的危急关头，老国王拼尽全力派出唯一的亲卫把年幼的儿子送往大山的另一边，与世隔绝，同时也向亲信传达了唯一的命令：“保护火柴人王子，世界在等待他的凯旋，勿忘初心！”\n\n\n\n\n\n\n\n\n终于在二十年后的今天，流淌着王室血液的火柴人王子拿出自己的王者之剑，披上老国王遗留的盔甲，走向了属于自己的那条道路：为族人复仇，拯救世界！屏幕前的玩家，现在就由你来操控火柴人王子，与他一起冒险，一起击败邪恶的大魔王，最终摧毁黑暗力量枢纽，还世界以秩序吧！勿忘初心，方得始终！\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n";
I    = 0;
o    = new Array();
xm   = -1000;
ym   = -1000;
///////////////
rad  = 80;
dim  = 500;
///////////////
W    = 0;
H    = 0;
NX   = 24;
NY   = 24;
var nx;
var ny;
var beijinggushi = document.getElementsByClassName("beijinggushi");
window.onload = function () {
	
	beijing.volume = 0.1;
	m_start.volume = 0.1;
	var play = document.getElementsByClassName("play");
	var help = document.getElementsByClassName("help");
	m_start.play();
	play[0].style.left = width/2 - play[0].offsetWidth-20 + "px";
	help[0].style.left = width/2 + 20 + "px";
	setInterval(draw, 33);
	DOOT = document.getElementById("doot");
	with(DOOT.style){
		left = -dim/2 + "px";
		top  = -dim/2 + "px";
		width = dim + "px";
		height = dim + "px";
	}
	resize();
	W = (dim  / NX) / 2;
	H = (dim / NY) / 2;
	K = 0;
	for(var j=0;j<NY;j++){
		for(var i=0;i<NX;i++){
			c=T.charAt((I++)%T.length).toUpperCase();
			if(c==" ")c="¡¤";
			o[K] = new CObj(K++,i,j,c);
		}
	}
	run();
	}
function play(){
	click.play();
	m_start.pause();
	beijing.play();
	var beijinggushi = document.getElementsByClassName("beijinggushi");
	var start = document.getElementsByClassName("start");
	beijinggushi[0].style.display = "block";
	start[0].style.display = "none";
	mode = 2;
	
}
function skip(){
	if (!flag)
		return;
	mode = 3;
	//$("body").overflow = "scroll";
	document.body.style.overflow = "scroll";
	beijing.pause();
	fight_back.play();
	fight_back.volume = 0.3;
	var beijinggushi = document.getElementsByClassName("beijinggushi");
	beijinggushi[0].style.display = "none";
	var canvas = document.getElementsByClassName("canvas");
	canvas[0].style.display = "block";
	initial();
}


var draw = function () {
	if(mode === 1){
		start_frame++;
	q.getContext('2d').fillStyle='rgba(0,0,0,.05)';
	q.getContext('2d').fillRect(0,0,width,height);
	q.getContext('2d').fillStyle='#cccccc';
	letters.map(function(y_pos, index){
		text = String.fromCharCode(3e4+Math.random()*33);
		x_pos = index * 10;
		q.getContext('2d').fillText(text, x_pos, y_pos);
		letters[index] = (y_pos > 758 + Math.random() * 1e4) ? 0 : y_pos + 10;
	});
	//divs[0].innerHTML = start_frame;
	if(start_frame <= 30)
		q.getContext('2d').drawImage(img_start,s.width/2 - 259 -300 + 3 * start_frame,start_frame * 10);
	else if (30<start_frame && start_frame<= 50)
		q.getContext('2d').drawImage(img_start,s.width/2 - 259 -300 + 3 * start_frame,300 - ((start_frame-30) * 9.5));
	else if (50<start_frame && start_frame <= 70)
		q.getContext('2d').drawImage(img_start,s.width/2 - 259 -300 + 3 * start_frame,(start_frame - 50) * 9.5 + 108);
	else if (70<start_frame && start_frame <= 85)
		q.getContext('2d').drawImage(img_start,s.width/2 - 259 -300 + 3 * start_frame,300-((start_frame - 70) * 8.2));
	else if (85<start_frame && start_frame <= 100)
		q.getContext('2d').drawImage(img_start,s.width/2 - 259 -300 + 3 * start_frame,(start_frame - 85) * 8.2 + 177);
	else if(100<start_frame && start_frame <= 105)
		{
			q.getContext('2d').drawImage(img_start,s.width/2 - 259,300);
			q.getContext('2d').drawImage(img_start_01,s.width/2 + 289,(start_frame - 100) * 0.6);
		}
	else if(105<start_frame && start_frame <= 110)
		{
			q.getContext('2d').drawImage(img_start,s.width/2 - 259,300);
			q.getContext('2d').drawImage(img_start_01,s.width/2 + 289,(start_frame - 105) * 4.8 + 8);
		}
	else if(110<start_frame && start_frame <= 115)
		{
			q.getContext('2d').drawImage(img_start,s.width/2 - 259,300);
			q.getContext('2d').drawImage(img_start_01,s.width/2 + 289,(start_frame - 110) * 8 + 32);
		}
	else if(115<start_frame && start_frame <= 120)
		{
			q.getContext('2d').drawImage(img_start,s.width/2 - 259,300);
			q.getContext('2d').drawImage(img_start_01,s.width/2 + 289,(start_frame - 115) * 11.2 + 72);
		}	
	else if(130<start_frame && start_frame <= 125)
		{
			q.getContext('2d').drawImage(img_start,s.width/2 - 259,300);
			q.getContext('2d').drawImage(img_start_01,s.width/2 + 289,(start_frame - 130) * 14.4 + 128);
		}
	else
		{
			q.getContext('2d').drawImage(img_start,s.width/2 - 259,300);
			q.getContext('2d').drawImage(img_start_01,s.width/2 + 289,200);
		}
	}
	

};
//接下来是背景故事介绍的画面


// window.onmousemove = function(e){
// 	if (window.event) e = window.event;
// 	xm = (e.x || e.clientX) - (nx  * .5) + dim * .5;
// 	ym = (e.y || e.clientY) - (ny * .5) + dim * .5;
// }

function resize() {
	if(mode != 3){
		nx = document.body.offsetWidth;
		ny = height;
	}
	
}
onresize = resize;

function CObj(N,i,j,c){
	this.obj = document.createElement("span");
	this.obj.innerHTML = c;
	DOOT.appendChild(this.obj);
	this.N    = N;
	this.To   = 16;
	this.x0   = i*2*W;
	this.y0   = j*2*H;
	this.anim = true;

	this.mainloop = function(){
		with (this) {
 			dx   = xm - x0;
			dy   = ym - y0;
			dist = Math.sqrt(dx * dx + dy * dy);
			if (dist < rad) {
				anim = true;
				M    = Math.cos(.5 * Math.PI * Math.abs(dist / rad));
				c    = Math.round(84 + M * 171);
				with(obj.style){
					left     = x0 - dx * M + "px";
					top      = y0 - dy * M + "px";
					zIndex   = Math.round(100 + M);
					fontSize = 8 + M * W * 2 + "px";
					color    = "RGB("+c+","+c+","+c+")";
				}
			} else {
				if(anim){
					with(obj.style){
						left     = x0 + "px";
						top      = y0 + "px";
						zIndex   = 0;
						fontSize = 3 + "px";
						color    = "RGB(40,40,40)";
					}
				anim = false;
				}
			}
		}
	}
}
function run(){
	if(mode != 3){
	for(i in o)o[i].mainloop();
	setTimeout(run,16);
	}
}

