//1、2:英雄行走(left,right) 3、4:小兵行走(left,right) 5、6:英雄攻击(left,right) 7、8:小兵攻击(left,right) 9:塔攻击 11、12: 英雄站立(left,right) 13、14:小兵站立(left,right)
var Soldiers = [[],[]], Towers = [[],[]], Heroes = [[],[]], baseCamp = [], nowAction;
var frameTime = 100,  myCanvas = document.getElementById("myCanvas"), allPicLeft = 0;
var screenMoveSpeed = 20, screenMoveflag = 0;
var cxt=myCanvas.getContext("2d");

function getDis(px, py, obj){
	return (Math.sqrt((px - obj.positionX) *(px - obj.positionX) + (py - obj.positionY) * (py - obj.positionY)) - obj.positionRadius);
}

function getMove(hx, hy, tx, ty, speed)					//向一个目标点移动
{
	var x = tx - hx;
	var y = ty - hy;
	var z = Math.sqrt(x*x + y*y);
	var obj = {}
	if(Math.abs(z - 0) < 1e-6)
	{
		obj.positionX = hx;
		obj.positionY = hy;
		return obj;
	}
	var xspeed = speed * x / z;
	var yspeed = speed * y / z;
	hx += xspeed;
	hy += yspeed;
	if(hx >= tx && xspeed >= 0)
		hx = tx;
	else if(hx < tx && xspeed <= 0)
		hx = tx;
	if(hy >= ty && yspeed >= 0)
		hy = ty;
	else if(hy < ty && yspeed <= 0)
		hy = ty;
	obj.positionX = hx;
	obj.positionY = hy;
	return obj;
}

function getMoveFollow(hx, hy, radio, tx, ty, speed)							//向一个对象移动
{
	var x = tx - hx;
	var y = ty - hy;
	var z = Math.sqrt(x*x + y*y);
	var obj = {}
	if(Math.abs(z - 0) < 1e-6)
	{
		obj.positionX = hx;
		obj.positionY = hy;
		return obj;
	}
	var xspeed = speed * x / z;
	var yspeed = speed * y / z;
	hx += xspeed;
	hy += yspeed;
	var px = tx - radio * x / z;
	var py = ty - radio * y / z;
	
	if(hx >= px && xspeed >= 0)
		hx = px;
	else if(hx < px && xspeed <= 0)
		hx = px;
	if(hy >= py && yspeed >= 0)
		hy = py;
	else if(hy < py && yspeed <= 0)
		hy = py;
	obj.positionX = hx;
	obj.positionY = hy;
	return obj;
}

function checkContain(px, py, obj){
	if (px < obj.positionX - obj.left || px > obj.positionX + obj.right)
		return false;
	if (py < obj.positionY - obj.top || py > obj.positionY + obj.bottom)
		return false;
	return true;
}
function getClickObj(tx, ty, kind){
	var maxDis = 0, maxObj;
	for (var i = 0 ; i < Soldiers[kind].length; i++){
		if (checkContain(tx, ty, Soldiers[kind][i])){
			if (Soldiers[kind][i].positionY > maxDis){
				maxDis = Soldiers[kind][i].positionY;
				maxObj = Soldiers[kind][i];
			}
		}
	}
	for (var i = 0 ; i < Heroes[kind].length; i++){
		if (checkContain(tx, ty, Heroes[kind][i])){
			if (Heroes[kind][i].positionY > maxDis){
				maxDis = Heroes[kind][i].positionY;
				maxObj = Heroes[kind][i];
			}
		}
	}
	for (var i = 0 ; i < Towers[kind].length; i++){
		if (checkContain(tx, ty, Towers[kind][i])){
			if (Towers[kind][i].positionY > maxDis){
				maxDis = Towers[kind][i].positionY;
				maxObj = Towers[kind][i];
			}
		}
	}
	if (checkContain(tx, ty, baseCamp[kind])){
		if (baseCamp[kind].positionY > maxDis){
			maxDis = baseCamp[kind].positionY;
			maxObj = baseCamp[kind];
		}
	}
	if (maxDis > 0)
		return maxObj;
	else return null;
}

function checkSort(a, b){
	if (a.positionY > b.positionY){
		return 1;
	}
	else return -1;	
}
function gameOver(kind){
	alert('gameOver');
}
var soldierClass ={								//小兵的对象
	createNew : function(px, py, direct){
		var soldierRet = {};
		soldierRet.idType = 'Soldier';
		soldierRet.kind = direct;
		soldierRet.positionX = px;
		soldierRet.positionY = py;
		soldierRet.picX = 253;
		soldierRet.picY = 233;
		soldierRet.left = 18;
		soldierRet.right = 18;
		soldierRet.bottom = 0;
		soldierRet.top = 88;
		soldierRet.positionRadius = 18;
		soldierRet.speed = 10;
		soldierRet.attack = 20;
		soldierRet.attackRadius = 5;
		soldierRet.attackInterval = Math.round(1000 / frameTime);
		soldierRet.attackWait = 0;
		soldierRet.allHp = 300;
		soldierRet.nowHp = soldierRet.allHp;
		soldierRet.action = {kind:direct + 3, frame:0};
		soldierRet.perform = function(kind){
			var minDis = 100000000, minObj;
			if (soldierRet.attackWait > 0)
				soldierRet.attackWait--;
			soldierRet.action.frame = (soldierRet.action.frame + 1) % actionFlash[soldierRet.action.kind].len;
			if ((soldierRet.action.kind === 7 || soldierRet.action.kind === 8) && soldierRet.action.frame === 0){						//攻击动作完成
				soldierRet.action.kind = soldierRet.action.kind - 4;
				soldierRet.action.frame = 0;
			}
			for (var i = 0; i < Soldiers[1 - kind].length; i++){																						//以下为获取距当前对象最近的敌对对象
				var p = getDis(soldierRet.positionX, soldierRet.positionY, Soldiers[1 - kind][i]);
				if (p < minDis){
					minDis = p;
					minObj = Soldiers[1 - kind][i];
				}
			}
			for (var i = 0; i < Towers[1 - kind].length; i++){
				var p = getDis(soldierRet.positionX, soldierRet.positionY, Towers[1 - kind][i]);
				if (p < minDis){
					minDis = p;
					minObj = Towers[1 - kind][i];
				}
			}
			for (var i = 0; i < Heroes[1 - kind].length; i++){
				var p = getDis(soldierRet.positionX, soldierRet.positionY, Heroes[1 - kind][i]);
				if (p < minDis){
					minDis = p;
					minObj = Heroes[1 - kind][i];
				}
			}
			var p = getDis(soldierRet.positionX, soldierRet.positionY, baseCamp[1 - kind]);
			if (p < minDis){
				minDis = p;
				minObj = baseCamp[1 - kind];
			}
			if (minDis < soldierRet.attackRadius + 1 && soldierRet.action.kind != 8 && soldierRet.action.kind != 7) {				//执行攻击操作
				if (soldierRet.attackWait === 0){
					soldierRet.attackWait = soldierRet.attackInterval;
					minObj.attacked(soldierRet.attack);
					soldierRet.action.frame = 0;
					if (minObj.positionX < soldierRet.positionX)
						soldierRet.action.kind = 7;
					else soldierRet.action.kind = 8;
				}
				else {																											//等待攻击CD
					if (minObj.positionX < soldierRet.positionX)
						soldierRet.action.kind = 13;
					else soldierRet.action.kind = 14;
					soldierRet.action.frame = 0;
				}
			}
			else if (soldierRet.action.kind != 8 && soldierRet.action.kind != 7){																	//执行移动操作
				if (soldierRet.action.kind === 14 || soldierRet.action.kind === 13)
					soldierRet.action.frame = 0;
				if (minObj.positionX < soldierRet.positionX)
					soldierRet.action.kind = 3;
				else soldierRet.action.kind = 4;
				var pObj = getMoveFollow(soldierRet.positionX, soldierRet.positionY, minObj.positionRadius + soldierRet.attackRadius, minObj.positionX, minObj.positionY, soldierRet.speed);			//向目标对象移动
				soldierRet.positionX = pObj.positionX;
				soldierRet.positionY = pObj.positionY;
			}
		}
		soldierRet.attacked = function(attackNum){
			soldierRet.nowHp -= attackNum;
		}
		return soldierRet;
	}
};

var heroClass ={									//英雄的对象
	createNew : function(px, py, kindHero){
		var heroRet = {};
		heroRet.idType = 'Hero';
		heroRet.kind = kindHero;
		heroRet.positionX = px;
		heroRet.positionY = py;
		heroRet.picX = 176;
		heroRet.picY = 215;
		heroRet.positionRadius = 45 * 0.7;
		heroRet.left = 43 * 0.7;
		heroRet.right = 43 * 0.7;
		heroRet.top = 160 * 0.7;
		heroRet.bottom = 0;
		heroRet.speed = 20;
		heroRet.attack = 60;
		heroRet.attackRadius = 15;
		heroRet.attackInterval = Math.round(1000 / frameTime);
		heroRet.attackWait = 0;
		heroRet.allHp = 3000;
		heroRet.nowHp = heroRet.allHp;
		heroRet.allMp = 300;
		heroRet.nowMp = 300;
		heroRet.action = {kind:12 - kindHero, frame:0};
		heroRet.positionObj = null;
		heroRet.positionTo = null;
		heroRet.perform = function(){						//玩家控制英雄的行为
			heroRet.action.frame = (heroRet.action.frame + 1) % actionFlash[heroRet.action.kind].len;
			if (heroRet.attackWait > 0)
				heroRet.attackWait--;
			if ((heroRet.action.kind === 5 || heroRet.action.kind === 6) && heroRet.action.frame === 0){
				heroRet.action.kind = heroRet.action.kind + 6;
				heroRet.action.frame = 0;
			}
			if (heroRet.action.kind != 5 && heroRet.action.kind != 6){
				if (heroRet.positionObj != null){
					var temObj = heroRet.positionObj;
					var p = getDis(heroRet.positionX, heroRet.positionY, temObj);
					if (p < heroRet.attackRadius + 1){
						if (heroRet.attackWait === 0){
							heroRet.attackWait = heroRet.attackInterval;
							temObj.attacked(heroRet.attack);
							heroRet.action.frame = 0;
							if (temObj.positionX < heroRet.positionX)
							heroRet.action.kind = 5;
							else heroRet.action.kind = 6;
						}
						else {																											//等待攻击CD
							if (temObj.positionX < heroRet.positionX)
								heroRet.action.kind = 11;
							else heroRet.action.kind = 12;
							heroRet.action.frame = 0;
						}
					}
					else{
						if (heroRet.action.kind != 1 && heroRet.action.kind != 2){
							heroRet.action.frame = 0;
						}
						if (temObj.positionX < heroRet.positionX)
							heroRet.action.kind = 1;
						else
							heroRet.action.kind = 2;
						var pObj = getMoveFollow(heroRet.positionX, heroRet.positionY, temObj.positionRadius + heroRet.attackRadius, temObj.positionX, temObj.positionY, heroRet.speed);
						heroRet.positionX = pObj.positionX;
						heroRet.positionY = pObj.positionY;
					}
				}
				else if (heroRet.positionTo != null){
					if (heroRet.action.kind != 1 && heroRet.action.kind != 2){
						heroRet.action.frame = 0;
					}
					if (heroRet.positionTo.x < heroRet.positionX)
						heroRet.action.kind = 1;
					else
						heroRet.action.kind = 2;
					var pObj = getMove(heroRet.positionX, heroRet.positionY, heroRet.positionTo.x, heroRet.positionTo.y, heroRet.speed);
					heroRet.positionX = pObj.positionX;
					heroRet.positionY = pObj.positionY;
					if (heroRet.positionX === heroRet.positionTo.x && heroRet.positionY === heroRet.positionTo.y){
						heroRet.action.frame = 0;
						heroRet.action.kind += 10;
						heroRet.positionTo = null;
					}
				}
				else{
					heroRet.action.kind = 12 - heroRet.action.kind % 2;
					heroRet.action.frame = 0;
				}
			}
		}
		heroRet.performAI = function(kind){								//电脑AI的行为
		}
		heroRet.attacked = function(attackNum){
			heroRet.nowHp -= attackNum;
		}
		return heroRet;
	}
};

var towerClass ={									//塔的对象
	createNew : function(px, py, qx, qy,pleft,pright,ptop,pbuttom,pradius,picx,picy, id){
		var towerRet = {};
		towerRet.idType = id;
		towerRet.picX = picx;
		towerRet.picY = picy;
		towerRet.positionX = px;
		towerRet.positionY = py;
		towerRet.positionRadius = pradius;
		towerRet.left = pleft;
		towerRet.right = pright;
		towerRet.top = ptop;
		towerRet.bottom = pbuttom;
		towerRet.attackX = qx;
		towerRet.attackY = qy;
		towerRet.allHp = 20000;
		towerRet.nowHp = 20000;
		towerRet.attackRadius = 100;
		towerRet.attack = 200;
		towerRet.attackInterval = Math.round(10000 / frameTime);
		towerRet.attackSeries = 5;
		towerRet.action = {kind:0, frame:0}
		towerRet.target = null;
		towerRet.perform = function(kind){
			if (towerRet.action.kind === 9){
				towerRet.action.frame++;
				if (towerRet.target.nowHp <= 0)
				{
					towerRet.action.frame = 0;
					towerRet.action.kind = 0;
				}
				if (towerRet.action.frame == towerRet.attackInterval)		//一轮攻击结束时
				{
					towerRet.action.frame = 0;
					if (getDis(towerRet.positionX, towerRet.positionY, towerRet.target) > towerRet.attackRadius){		//原先目标已离开或不存在
						towerRet.action.kind = 0;
						towerRet.target = null;

					}
				}
			}
			if (towerRet.action.kind === 0){
				var minDis = 100000000, minObj;
				for (var i = 0; i < Soldiers[1 - kind].length; i++){
					var p = getDis(towerRet.positionX, towerRet.positionY, Soldiers[1 - kind][i]);
					if (p < minDis){
						minDis = p;
						minObj = Soldiers[1 - kind][i];
					}
				}
				for (var i = 0; i < Heroes[1 - kind].length; i++){
					var p = getDis(towerRet.positionX, towerRet.positionY, Heroes[1 - kind][i]);
					if (p < minDis){
						minDis = p;
						minObj = Soldiers[1 - kind][i];
					}
				}
				if (minDis <= towerRet.attackRadius){							//开始攻击
					towerRet.action.kind = 9;
					towerRet.action.frame = 0;
					towerRet.target = minObj;
					minObj.attacked(towerRet.attack);
					
				}
			}
		}
		towerRet.attacked = function(attackNum){
			towerRet.nowHp -= attackNum;
		}
		return towerRet;
	}
};

var campClass ={															//大本营的对象
	createNew : function(px, py,picx,picy, kidTyop){
		var campRet = {};
		campRet.idType = 'Camp';
		campRet.picX = picx;
		campRet.picy = picy
		campRet.positionX = px;
		campRet.positionY = py;
		campRet.positionRadius = 54;            //????????????
		campRet.left = 58;
		campRet.right = 58;
		campRet.bottom = 25;
		campRet.top = 94;
		campRet.nowHp = 1000;
		campRet.allHp = 7000;
		campRet.kind = kidTyop;
		campRet.soldierInterval = Math.round(30000 / frameTime);						//一批兵间隔
		campRet.totalNum = 3;															//一批兵数量
		campRet.nowNum = 0;																//当前已达帧数
		campRet.oneInterval = 10;															//相邻两个兵间隔
		campRet.perform = function(kind){
			campRet.nowNum++;
			if (campRet.nowNum % campRet.oneInterval === 0 && campRet.nowNum <= campRet.oneInterval * campRet.totalNum)
				Soldiers[kind].push(soldierClass.createNew(campRet.positionX, campRet.positionY + (Math.random() -1) *80, kind));
			if (campRet.nowNum == campRet.soldierInterval)
				campRet.nowNum = 0;
		}
		campRet.attacked = function(attackNum){
			campRet.nowHp -= attackNum;
			if (campRet.nowHp < 0){
				gameOver(this.kind);
			}
		}
		return campRet;
	}
};

window.onmousemove = function(e) {
   	var tx = e.pageX - myCanvas.getBoundingClientRect().left;
	var ty = e.pageY - myCanvas.getBoundingClientRect().top;
	if (tx < 0)
		e.pageX = myCanvas.getBoundingClientRect().left;
	if (tx > cxt.canvas.width)
		e.pageX = myCanvas.getBoundingClientRect().right;
	if (tx <= 30)
		screenMoveflag = 1;
	else if (tx >= cxt.canvas.width - 30)
		screenMoveflag = 2;
	else screenMoveflag = 0;
//	if (tx )
}
myCanvas.onmousedown = function(e) { 

    // use pageX and pageY to get the mouse position 
    // relative to the browser window 
   	var tx = e.pageX - myCanvas.getBoundingClientRect().left  + allPicLeft;
	var ty = e.pageY - myCanvas.getBoundingClientRect().top;
    if (e.button==2)
    {
		var clickObj = getClickObj(tx, ty, 1);
		if (clickObj == null){		//移动到该位置
			Heroes[0][0].positionTo = {x:tx, y:ty};
			Heroes[0][0].positionObj = null;
		}
		else{						//攻击目标
			Heroes[0][0].positionTo = null;
			Heroes[0][0].positionObj = clickObj;
		}
    }
};

function initial(){
	document.body.oncontextmenu=function rightClick(){ window.event.returnValue= false;}
	baseCamp.push(campClass.createNew(266,422,77,92, 0));
	baseCamp.push(campClass.createNew(3359,422,77,92, 1));
	Towers[0].push(towerClass.createNew(482.13,296.64,474,186.5,35,35,118.5,11,37,74,123.75,'towerSmall'));
	Towers[0].push(towerClass.createNew(480.49,530.42,478.04,422.37,35,35,118.5,11,37,74,123.75, 'towerSmall'));
	Towers[0].push(towerClass.createNew(1375,409,1370,265,47,47,157.5,21,53.5,73.5,117.95, 'towerBig'));
	Towers[1].push(towerClass.createNew(3146.18,295.68,3137.18,186.68,35,35,118.5,11,37,74,123.75, 'towerSmall'));
	Towers[1].push(towerClass.createNew(3146.18,532.18,3142.18,421.18,35,35,118.5,11,37,74,123.75, 'towerSmall'));
	Towers[1].push(towerClass.createNew(2226,413,2221,268,47,47,157.5,21,53.5,73.5,117.95, 'towerBig'));
	Heroes[0].push(heroClass.createNew(100, 400, 0));
	setInterval(cycleOperation, frameTime);					//计时函数

}
function cycleOperation(){										//定时执行
	for (var k = 0; k < 2; k++)
		for (var i = 0; i < Soldiers[k].length; i++){
			Soldiers[k][i].perform(k);
		}
	for (var k = 0; k < 2; k++)
		for (var i = 0; i < Towers[k].length; i++){
			Towers[k][i].perform(k);
		}
	Heroes[0][0].perform();
	for (var i = 0; i < Heroes[1].length; i++){
		Heroes[1][i].performAI(1);
	}
	for (var k = 0; k < 2; k++)
		baseCamp[k].perform(k);
	if (screenMoveflag === 1)
		allPicLeft -= screenMoveSpeed;
	else if (screenMoveflag === 2)
		allPicLeft += screenMoveSpeed;
	if (allPicLeft < 0)
		allPicLeft = 0;
	if (allPicLeft > 2400)
		allPicLeft = 2400;

	paintOn();
}

function paintOn()													//将所有图画到canvas上
{
	var allObject = [];
	cxt.clearRect(0,0,cxt.canvas.width, cxt.canvas.height);
	for (var k = 0; k < 2; k++)
		for (var i = 0; i < Soldiers[k].length; i++)
			allObject.push(Soldiers[k][i]);
	for (var k = 0; k < 2; k++)
		for (var i = 0; i < Towers[k].length; i++)
			allObject.push(Towers[k][i]);
	for (var k = 0; k < 2; k++)
		for (var i = 0; i < Heroes[k].length; i++)
			allObject.push(Heroes[k][i]);
	allObject.sort(checkSort);
	var img1 = new Image();
	img1.src= 'images/mappic/background.png';
	cxt.drawImage(img1, 0 - allPicLeft, 0);
	for (var i = 0; i < allObject.length; i++){
		var img = new Image();
		if (allObject[i].idType == 'towerBig')
			img.src = 'images/mappic/tower_big.png';
		else if (allObject[i].idType == 'towerSmall')
			img.src = 'images/mappic/tower_home.png';
		else if (allObject[i].idType == 'Hero')
			img.src= actionFlash[allObject[i].action.kind].src[0][allObject[i].action.frame];
		else
			img.src= actionFlash[allObject[i].action.kind].src[allObject[i].kind][allObject[i].action.frame];
		cxt.drawImage(img, allObject[i].positionX - allObject[i].picX - allPicLeft, allObject[i].positionY - allObject[i].picY);
	}
}
