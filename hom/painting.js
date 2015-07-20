//1��2:Ӣ������(left,right) 3��4:С������(left,right) 5��6:Ӣ�۹���(left,right) 7��8:С������(left,right) 9:������ 11��12: Ӣ��վ��(left,right) 13��14:С��վ��(left,right)
var Soldiers = [[],[]], Towers = [[],[]], Heroes = [[],[]], baseCamp = [], nowAction;
var frameTime = 100�� var myCanvas = document.getElementById("myCanvas");;

function getDis(px, py, obj){
	return (Math.sqrt((px - obj.positonX) *(px - obj.positonX) + (px - obj.positonY) * (py - obj.positonY)) - obj.positonRadius);
}

function getMove(hx, hy, tx, ty, speed)					//��һ��Ŀ����ƶ�
{
	var x = tx - hx;
	var y = ty - hy;
	var z = Math.sqrt(x*x + y*y);
	if(Math.abs(z - 0) < 1e-6)
	{
		return;
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
	this.positionX = hx;
	this.positionY = hy;
}

function getMoveFollow(hx, hy, radio, tx, ty, speed)							//��һ�������ƶ�
{
	var x = tx - hx;
	var y = ty - hy;
	var z = Math.sqrt(x*x + y*y);
	if(Math.abs(z - 0) < 1e-6)
	{
		return;
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
	this.positionX = hx;
	this.positionY = hy;
}

function getClickObj(tx, ty, kind){
	var maxDis = 0, maxObj;
	for (var i = 0 ; i < Soldiers[kind].length; i++){
		if (checkContain(tx, ty, Soldiers[kind][i])){
			if (Soldiers[kind][i].positonY > maxDis){
				maxDis = Soldiers[kind][i].positonY;
				maxObj = Soldiers[kind][i];
			}
		}
	}
	for (var i = 0 ; i < Heroes[kind].length; i++){
		if (checkContain(tx, ty, Heroes[kind][i])){
			if (Heroes[kind][i].positonY > maxDis){
				maxDis = Heroes[kind][i].positonY;
				maxObj = Heroes[kind][i];
			}
		}
	}
	for (var i = 0 ; i < Towers[kind].length; i++){
		if (checkContain(tx, ty, Towers[kind][i])){
			if (Towers[kind][i].positonY > maxDis){
				maxDis = Towers[kind][i].positonY;
				maxObj = Towers[kind][i];
		}
	}
	if (checkContain(tx, ty, baseCamp[kind])){
		if (baseCamp[kind].positonY > maxDis){
			maxDis = baseCamp[kind].positonY;
			maxObj = baseCamp[kind];
	}
	if (maxDis > 0)
		return maxObj;
	else return null;
}
function gameOver(kind){
	alert('gameOver');
}
var soldierClass ={								//С���Ķ���
	createNew : function(px, py, direct){
		var soldierRet = {};
		soldierRet.idType = 'Soldier';
		soldierRet.positonX = px;
		soldierRet.positonY = py;
		soldierRet.picX = 253;
		soldierRet.picY = 233;
		soldierRet.left = 18;
		soldierRet.right = 18;
		soldierRet.bottom = 0;
		soldierRet.top = 88;
		soldierRet.positonRadius = 18;
		soldierRet.speed = 15;
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
			if ((soldierRet.action.kind === 7 || soldierRet.action.kind === 8) && soldierRet.action.frame === actionFlash[7].len){						//�����������
				soldierRet.action.kind = soldierRet.action.kind - 4;
				soldierRet.action.frame = 0;
			}
			for (var i = 0; i < Soldiers[1 - kind].length; i++){																						//����Ϊ��ȡ�൱ǰ��������ĵжԶ���
				var p = getDis(soldierRet.positonX, soldierRet.positonY, Soldiers[1 - kind][i]);
				if (p < minDis){
					minDis = p;
					minObj = Soldiers[1 - kind][i];
				}
			}
			for (var i = 0; i < Towers[1 - kind].length; i++){
				var p = getDis(soldierRet.positonX, soldierRet.positonY, Towers[1 - kind][i]);
				if (p < minDis){
					minDis = p;
					minObj = Towers[1 - kind][i];
				}
			}
			for (var i = 0; i < Heroes[1 - kind].length; i++){
				var p = getDis(soldierRet.positonX, soldierRet.positonY, Heroes[1 - kind][i]);
				if (p < minDis){
					minDis = p;
					minObj = Heroes[1 - kind][i];
				}
			}
			var p = getDis(soldierRet.positonX, soldierRet.positonY, baseCamp[1 - kind]);
			if (p < minDis){
				minDis = p;
				minObj = baseCamp[1 - kind];
			}
			if (minDis < soldierRet.attackRadius + 1 && soldierRet.action.kind != 8 && soldierRet.action.kind != 7) {				//ִ�й�������
				if (soldierRet.attackWait === 0){
					soldierRet.attackWait = soldierRet.attackInterval;
					minObj.attacked(soldierRet.attack);
					soldierRet.action.frame = 0;
					if (minObj.positionX < soldierRet.positionX)
						soldierRet.action.kind = 7;
					else soldierRet.action.kind = 8;
				}
				else {																											//�ȴ�����CD
					if (minObj.positionX < soldierRet.positionX)
						soldierRet.action.kind = 13;
					else soldierRet.action.kind = 14;
					soldierRet.action.frame = 0;
				}
			}
			else if (soldierRet.action.kind != 8 && soldierRet.action.kind != 7){																	//ִ���ƶ�����
				if (soldierRet.action.kind === 14 || soldierRet.action.kind === 13)
					soldierRet.action.frame = 0;
				if (minObj.positionX < soldierRet.positionX)
					soldierRet.action.kind = 3;
				else soldierRet.action.kind = 4;
				var pObj = getMoveFollow(soldierRet.positionX, soldierRet.positonY, minObj.positonRadius + soldierRet.attackRadius, minObj.positionX, minObj.positonY, soldierRet.speed);			//��Ŀ������ƶ�
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

var heroClass ={									//Ӣ�۵Ķ���
	createNew : function(px, py){
		var heroRet = {};
		heroRet.idType = 'Hero';
		heroRet.positonX = px;
		heroRet.positonY = py;
		heroRet.picX = 250;
		heroRet.picY = 284;
		heroRet.positonRadius = 45;
		heroRet.left = 43;
		heroRet.right = 43;
		heroRet.top = 160;
		heroRet.bottom = 0;
		heroRet.speed = 20;
		heroRet.attack = 60;
		heroRet.attackRadius = 5;
		heroRet.attackInterval = Math.round(1000 / frameTime);
		heroRet.attackWait = 0;
		heroRet.allHp = 3000;
		heroRet.nowHp = heroRet.allHp;
		heroRet.allMp = 300;
		heroRet.nowMp = 300;
		heroRet.action = {kind:11, frame:0};
		heroRet.positionObj = null;
		heroRet.positionTo = {};
		heroRet.perform = function(kind){						//��ҿ���Ӣ�۵���Ϊ
			heroRet.action.frame = (heroRet.action.frame + 1) % actionFlash[heroRet.action.kind].len;
			if (heroRet.attackWait > 0)
				heroRet.attackWait--;
			if ((heroRet.action.kind === 5 || heroRet.action.kind === 6) && heroRet.action.frame === actionFlash[5].len){
				heroRet.action.kind = heroRet.action.kind + 6;
				heroRet.action.frame = 0;
			}
			if (heroRet.action.kind != 5 && heroRet.action.kind != 6){
				if (heroRet.positionObj != null){
					var temObj = heroRet.positionObj;
					var p = getDis(heroRet.positonX, heroRet.positonY, temObj);
					if (p < heroRet.attackRadius + 1){
						if (heroRet.attackWait === 0){
							heroRet.attackWait = heroRet.attackInterval;
							temObj.attacked(heroRet.attack);
							heroRet.action.frame = 0;
							if (temObj.positionX < heroRet.positionX)
							heroRet.action.kind = 5;
							else heroRet.action.kind = 6;
						}
						else {																											//�ȴ�����CD
							if (temObj.positionX < heroRet.positionX)
								heroRet.action.kind = 11;
							else heroRet.action.kind = 12;
							heroRet.action.frame = 0;
						}
					}
				}
				else if (heroRet.positionTo != {}){
					if (heroRet.action.kind != 1 && heroRet.action.kind != 2){
						heroRet.action.frame = 0;
					}
					if (heroRet.positionTo.x < heroRet.positionX)
						heroRet.action.kind = 1;
					else
						heroRet.action.kind = 2;
					var pObj = getMoveFollow(heroRet.positionX, heroRet.positonY, heroRet.positionTo.x, heroRet.positonTo.y, heroRet.speed);
					heroRet.positionX = pObj.positionX;
					heroRet.positionY = pObj.positionY;
				}
				else{
					heroRet.action.kind = 12 - heroRet.action.kind % 2;
					heroRet.action.frame = 0;
				}
			}
		}
		heroRet.performAI = function(kind){								//����AI����Ϊ
		}
		heroRet.attacked = function(attackNum){
			heroRet.nowHp -= attackNum;
		}
	}
};

var towerClass ={									//���Ķ���
	createNew : function(px, py, qx, qy,pleft,pright,ptop,pbuttom,pradius,picx,picy){
		var towerRet = {};
		towerRet.idType = 'Tower';
		towerRet.picX = picx;
		towerRet.picX = picy;
		towerRet.positonX = px;
		towerRet.positonY = py;
		towerRet.positonRadius = pradius;
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
				if (towerRet.action.frame == towerRet.attackInterval)		//һ�ֹ�������ʱ
				{
					towerRet.action.frame = 0;
					if (getDis(towerRet.positonX, towerRet.positonY, towerRet.target) > towerRet.attackRadius){		//ԭ��Ŀ�����뿪�򲻴���
						towerRet.action.kind = 0;
						towerRet.target = null;

					}
				}
			}
			if (towerRet.action.kind === 0){
				var minDis = 100000000, minObj;
				for (var i = 0; i < Soldiers[1 - kind].length; i++){
					var p = getDis(towerRet.positonX, towerRet.positonY, Soldiers[1 - kind][i]);
					if (p < minDis){
						minDis = p;
						minObj = Soldiers[1 - kind][i];
					}
				}
				for (var i = 0; i < Heroes[1 - kind].length; i++){
					var p = getDis(towerRet.positonX, towerRet.positonY, Heroes[1 - kind][i]);
					if (p < minDis){
						minDis = p;
						minObj = Soldiers[1 - kind][i];
					}
				}
				if (minDis <= towerRet.attackRadius){							//��ʼ����
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

var campClass ={															//��Ӫ�Ķ���
	createNew : function(px, py,picx,picy){
		var campRet = {};
		campRet.idType = 'Camp';
		campRet.picX = picx;
		campRet.picy = picy
		campRet.positonX = px;
		campRet.positonY = py;
		campRet.positonRadius = 38;            //????????????
		campRet.left = 0;
		campRet.right = 0;
		campRet.bottom = 0;
		campRet.top = 0;
		campRet.nowHp = 7000;
		campRet.allHp = 7000;
		campRet.soldierInterval = Math.round(30000 / frameTime);						//һ�������
		campRet.totalNum = 3;															//һ��������
		campRet.nowNum = 0;																//��ǰ�Ѵ�֡��
		campRet.oneInterval = 10;															//�������������
		campRet.perform = function(kind){
			campRet.nowNum++;
			if (campRet.nowNum % campRet.oneInterval === 0 && campRet.nowNum <= campRet.oneInterval * campRet.totalNum)
				Soldiers[kind].push(soldierClass.createNew(campRet.positonX, campRet.positonY + 20));
			if (campRet.nowNum == campRet.soldierInterval)
				campRet.nowNum = 0;
		}
		campRet.attacked = function(attackNum){
			campRet.nowHp -= attackNum;
			if (campRet.nowHp < 0){
				gameOver(kind);
			}
		}
		return campRet;
	}
}
setInterval(cycleOperation, frameTime);					//��ʱ����

myCanvas.onmousedown = function(e) { 

    // use pageX and pageY to get the mouse position 
    // relative to the browser window 
   	var tx = e.pageX - myCanvas.offsetLeft;
	var ty = e.pageY - myCanvas.offsetTop;
    if (e.button==2)
    {
		var clickObj = getClickObj(tx, ty, 1);
		if (clickObj == null){		//�ƶ�����λ��
			Heroes[0][0].positionTo.x = tx;
			Heroes[0][0].positionTo.y = ty;
			Heroes[0][0].positionObj = null;
		}
		else{						//����Ŀ��
			Heroes[0][0].positionTo = {};
			Heroes[0][0].positionObj = clickObj;
		}
    }


function initial(){
	baseCamp.push(campClass.createNew(268,401,76.72,72.60));
	baseCamp.push(campClass.createNew(3358,401,76.72,72.60));
	Towers[0].push(towerClass.createNew(482.13,296.64,474,186.5,35,35,118.5,11,37,74,123.75));
	Towers[0].push(towerClass.createNew(480.49,530.42,478.04,422.37,35,35,118.5,11,37,74,123.75));
	Towers[0].push(towerClass.createNew(1375,409,1370,265,47,47,157.5,21,53.5,73.5,117,95));
	Towers[1].push(towerClass.createNew(3146.18,295.68,3137.18,186.68,35,35,118.5,11,37,74,123.75));
	Towers[1].push(towerClass.createNew(3146.18,532.18,3142.18,421.18,35,35,118.5,11,37,74,123.75));
	Towers[1].push(towerClass.createNew(2226,413,2221,268,47,47,157.5,21,53.5,73.5,117.95));
	Heroes[0].push(heroClass.createNew(100, 400));
}
function cycleOperation(){										//��ʱִ��
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
	for (var k = 0; k < 2; k++)
		baseCamp[k].perform(k);
	Heroes[0][0].perform(nowAction);
	paintOn();
}
function paintOn()													//������ͼ����canvas��
{
	
}