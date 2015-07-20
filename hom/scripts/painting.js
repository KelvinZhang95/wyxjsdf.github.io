//����action�����frame����Ϊ��ǰ���ŵ���֡����kind����Ϊ��Ϊ
//1��2:Ӣ������(left,right) 3��4:С������(left,right) 5��6:Ӣ�۹���(left,right) 7��8:С������(left,right) 9:������ 11��12: Ӣ��վ��(left,right) 13��14:С��վ��(left,right) 15,16:Ӣ������ 17,18:С������
var Soldiers = [[],[]];												//����С���Ķ�������
var Towers = [[],[]], destroyedTowers =[[],[]];						//���з������Ķ�������
var Heroes = [[],[]];												//����Ӣ�۵Ķ�������
var baseCamp = [];													//��Ӫ�Ķ�������
var frameTime = 100;												//���沥�ŵļ��
var myCanvas = document.getElementById("myCanvas");					//����Canvas��DomԪ��
var allPicLeft = 0;													//��Ļ������Ƶľ���
var screenMoveSpeed = 30, screenMoveflag = 0;						//�����ƶ����ٶȺ��ж�
var screenMoveBorder = 20;											//��Ӧ�ƶ��ж��ı߽����
var addBloodRadius = 170;											//���Ի�Ѫ�Ĵ�Ӫ��Χ
var addBloodRate = 0.01;											//�������Ѫ�����ӵİٷֱ�
var cxt=myCanvas.getContext("2d");									//�滭�ľ��
var soldierAllHp = 300, soldierAttack = 20;							//С����Ѫ����������
var soldierAttackInterval = 1000, soldierSpeed = 10;				//С���Ĺ������(ms)���ƶ��ٶ�
var soldierMakeExp = 50; soldierAttackRadius= 22;					//С���������ṩ�ľ��顢������Χ
var towerAllHp = 2000, towerAttack = 5, towerAttackRadius = 150;	//����Ѫ�������������������루��Ϊ�����͹�����
var towerMakeExp = 500;												//���������ṩ�ľ���
var campAllHp = 3000, campSoldierInterval = 30000;					//��Ӫ��Ѫ������Ӫ�����ļ��
var camSoldierNum = 3;												//��Ӫһ�γ���������



function getDis(px, py, obj){
	return (Math.sqrt((px - obj.positionX) *(px - obj.positionX) + (py - obj.positionY) * (py - obj.positionY)) - obj.positionRadius);
}

function getMove(hx, hy, tx, ty, speed)					//��һ��Ŀ����ƶ���Ŀ��Ϊ�ƶ�������
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

function getMoveFollow(hx, hy, radius, tx, ty, speed)							//��һ�������ƶ���Ŀ��Ϊ��һ���������ĵ����radius�ľ���
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
	var px = tx - radius * x / z;
	var py = ty - radius * y / z;
	
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

function checkContain(px, py, obj){													//�жϵ�ǰ�Ƿ����������ĵ�����ڣ�Ϊ����������¼�
	if (px < obj.positionX - obj.left || px > obj.positionX + obj.right)
		return false;
	if (py < obj.positionY - obj.top || py > obj.positionY + obj.bottom)
		return false;
	return true;
}
function getClickObj(tx, ty, kind){													//��ȡ��ǰ��������Ķ���ע�����Ĳ�νṹ
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

function checkSort(a, b){															//�ȽϺ�������Y��С������������ڲ�λ�ͼ
	if (a.positionY > b.positionY){
		return 1;
	}
	else return -1;	
}
function gameOver(kind){															//��Ϸ��������Ӧ��kindΪʧ�ܷ�
	alert('gameOver');
}
var soldierClass ={								//С���Ķ���
	createNew : function(px, py, direct){					//���캯��
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
		soldierRet.speed = soldierSpeed;
		soldierRet.attack = soldierAttack;
		soldierRet.attackRadius = soldierAttackRadius;
		soldierRet.target = null;
		soldierRet.attackInterval = Math.round(soldierAttackInterval / frameTime);
		soldierRet.attackWait = 0;
		soldierRet.allHp = soldierAllHp;
		soldierRet.nowHp = soldierRet.allHp;
		soldierRet.action = {kind:direct + 3, frame:0};																					//��ʼΪ�ƶ�״̬
		soldierRet.makeExp = soldierMakeExp;
		soldierRet.perform = function(kind){																							//ÿ�غ�ִ�еĲ�������
			var minDis = 100000000, minObj;
			if (soldierRet.attackWait > 0)																								//CDʱ�����
				soldierRet.attackWait--;
			soldierRet.action.frame = (soldierRet.action.frame + 1) % actionFlash[soldierRet.action.kind].len;							//���沥��֡������
			if (soldierRet.nowHp <= 0)																									//����ʿ����ִ��
				return;
			if ((soldierRet.action.kind === 7 || soldierRet.action.kind === 8) && soldierRet.action.frame === 0){						//�����������
				soldierRet.target.attacked(soldierRet.attack);																			//�ڹ����������ʱ����˺�
				soldierRet.action.kind = soldierRet.action.kind - 4;																	//תΪ����״̬
				soldierRet.action.frame = 0;
				soldierRet.target = null;
			}
			for (var i = 0; i < Soldiers[1 - kind].length; i++){																						//����Ϊ��ȡ�൱ǰ��������ĵжԶ���
				var p = getDis(soldierRet.positionX, soldierRet.positionY, Soldiers[1 - kind][i]);
				if (p < minDis && Soldiers[1 - kind][i].nowHp > 0){
					minDis = p;
					minObj = Soldiers[1 - kind][i];
				}
			}
			for (var i = 0; i < Towers[1 - kind].length; i++){
				var p = getDis(soldierRet.positionX, soldierRet.positionY, Towers[1 - kind][i]);
				if (p < minDis && Towers[1 - kind][i].nowHp > 0){
					minDis = p;
					minObj = Towers[1 - kind][i];
				}
			}
			for (var i = 0; i < Heroes[1 - kind].length; i++){
				var p = getDis(soldierRet.positionX, soldierRet.positionY, Heroes[1 - kind][i]);
				if (p < minDis && Heroes[1 - kind][i].nowHp > 0){
					minDis = p;
					minObj = Heroes[1 - kind][i];
				}
			}
			var p = getDis(soldierRet.positionX, soldierRet.positionY, baseCamp[1 - kind]);
			if (p < minDis && baseCamp[1 - kind].nowHp > 0){
				minDis = p;
				minObj = baseCamp[1 - kind];
			}
			if (minDis < soldierRet.attackRadius + 1 && soldierRet.action.kind != 8 && soldierRet.action.kind != 7) {				//������жԶ����ڻ���������Χ�ڣ���ִ�й�������
				if (soldierRet.attackWait === 0){																					//������CDʱ���ѵ������й���
					soldierRet.attackWait = soldierRet.attackInterval;
					soldierRet.target = minObj;
					soldierRet.action.frame = 0;
					if (minObj.positionX < soldierRet.positionX)																//�жϹ�������
						soldierRet.action.kind = 7;
					else soldierRet.action.kind = 8;
				}
				else {																											//ԭ��վ�����ȴ�����CD
					if (minObj.positionX < soldierRet.positionX)
						soldierRet.action.kind = 13;
					else soldierRet.action.kind = 14;
					soldierRet.action.frame = 0;
				}
			}
			else if (soldierRet.action.kind != 8 && soldierRet.action.kind != 7){																	//��Ŀ��״̬�ڷ�Χ���⣬�ҵ�ǰΪ�ǹ���״̬��ִ���ƶ�����
				if (soldierRet.action.kind === 14 || soldierRet.action.kind === 13)																	//վ��״̬תΪ�ƶ�״̬
					soldierRet.action.frame = 0;
				if (minObj.positionX < soldierRet.positionX)
					soldierRet.action.kind = 3;
				else soldierRet.action.kind = 4;
				var pObj = getMoveFollow(soldierRet.positionX, soldierRet.positionY, minObj.positionRadius + soldierRet.attackRadius, minObj.positionX, minObj.positionY, soldierRet.speed);			//��Ŀ������ƶ�
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

var heroClass ={									//��ҿ���Ӣ�۵Ķ���
	createNew : function(px, py, kindHero){
		var heroRet = {};
		heroRet.idType = 'Hero';
		heroRet.kind = kindHero;
		heroRet.positionX = px;												//����һ��Ӣ�۵Ĵ��·�λ����
		heroRet.positionY = py;
		heroRet.picX = 176;
		heroRet.picY = 215;
		heroRet.positionRadius = 45 * 0.7;
		heroRet.left = 43 * 0.7;
		heroRet.right = 43 * 0.7;
		heroRet.top = 160 * 0.7 + 28;
		heroRet.bottom = 0;
		heroRet.speed = 20;														//�ƶ��ٶ�
		heroRet.attack = 60;													//�˺�
		heroRet.attackRadius = 40;												//������Χ
		heroRet.attackInterval = Math.round(1000 / frameTime);					//�������
		heroRet.attackWait = 0;													//��ǰCDʱ��
		heroRet.allHp = 1000;
		heroRet.nowHp = heroRet.allHp;
		heroRet.deathCD = Math.round(10000 / frameTime);
		heroRet.nowDeathCD = -1;
		heroRet.action = {kind:12 - kindHero, frame:0};							//��ǰ��Ϊ
		heroRet.target = null;													//��ǰ���ڹ����Ķ���
		heroRet.positionObj = null;												//��ǰ����׷��Ķ���(�Ҽ����)ֻ��Ϊ�жԶ���
		heroRet.positionTo = null;												//��ǰ����׷��ĵ�(�Ҽ����)
		heroRet.perform = function(){						//��ҿ���Ӣ�۵���Ϊ
			heroRet.action.frame = (heroRet.action.frame + 1) % actionFlash[heroRet.action.kind].len;						//���沥��֡������
			if (heroRet.attackWait > 0)																						//CDʱ�����
				heroRet.attackWait--;
			if (heroRet.nowHp <= 0)																							//Ӣ������ʱ��ִ��
				return;
			if ((heroRet.action.kind === 5 || heroRet.action.kind === 6) && heroRet.action.frame === 0){					//Ӣ��һ�ι���������תΪ��ֹ״̬
				heroRet.target.attacked(heroRet.attack);																	//��Ŀ������˺�
				heroRet.target = null;
				heroRet.action.kind = heroRet.action.kind + 6;
				heroRet.action.frame = 0;
			}
			if (heroRet.positionObj != null && heroRet.positionObj.nowHp <= 0)
				heroRet.positionObj = null;
			if (heroRet.action.kind != 5 && heroRet.action.kind != 6){														//��ǰΪ�ǽ���״̬ʱ
				if (heroRet.positionObj != null){																			//��ǰ��׷�����ʱ
					var temObj = heroRet.positionObj;
					var p = getDis(heroRet.positionX, heroRet.positionY, temObj);
					if (p < heroRet.attackRadius + 1){																		//�ڹ�����Χ���򹥻�
						if (heroRet.attackWait === 0){																		//��CDʱ��ʱ��ʼ����
							heroRet.attackWait = heroRet.attackInterval;
							heroRet.target = temObj;
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
					else{																									//��Ŀ��״̬�ƶ�
						if (heroRet.action.kind != 1 && heroRet.action.kind != 2){											//���ƶ�״̬תΪ�ƶ�״̬
							heroRet.action.frame = 0;
						}
						if (temObj.positionX < heroRet.positionX)															//�ж��ƶ�����
							heroRet.action.kind = 1;
						else
							heroRet.action.kind = 2;
						var pObj = getMoveFollow(heroRet.positionX, heroRet.positionY, temObj.positionRadius + heroRet.attackRadius, temObj.positionX, temObj.positionY, heroRet.speed);
						heroRet.positionX = pObj.positionX;
						heroRet.positionY = pObj.positionY;
					}
				}
				else if (heroRet.positionTo != null){																		//��һ�����ƶ�
					if (heroRet.action.kind != 1 && heroRet.action.kind != 2){												//���ƶ�״̬תΪ�ƶ�״̬
						heroRet.action.frame = 0;
					}
					if (heroRet.positionTo.x < heroRet.positionX)
						heroRet.action.kind = 1;
					else
						heroRet.action.kind = 2;
					var pObj = getMove(heroRet.positionX, heroRet.positionY, heroRet.positionTo.x, heroRet.positionTo.y, heroRet.speed);
					heroRet.positionX = pObj.positionX;
					heroRet.positionY = pObj.positionY;
					if (heroRet.positionX === heroRet.positionTo.x && heroRet.positionY === heroRet.positionTo.y){			//�ѵִ�Ŀ���ʱ��תΪ��ֹ״̬
						heroRet.action.frame = 0;
						heroRet.action.kind += 10;
						heroRet.positionTo = null;
					}
				}
				else{																										//�޲�������ֹ
					heroRet.action.kind = 12 - heroRet.action.kind % 2;
					heroRet.action.frame = 0;
				}
			}
		}
		heroRet.performAI = function(kind){								//����AI����Ϊ
		}
		heroRet.attacked = function(attackNum){							//�յ��˺�
			heroRet.nowHp -= attackNum;
		}
		return heroRet;
	}
};

var towerClass ={									//���Ķ���
	createNew : function(px, py, qx, qy,pleft,pright,ptop,pbuttom,pradius,picx,picy, id){
		var towerRet = {};
		towerRet.idType = id;
		towerRet.picX = picx;												//����Ϊ����λ�ò���
		towerRet.picY = picy;
		towerRet.positionX = px;
		towerRet.positionY = py;
		towerRet.positionRadius = pradius;
		towerRet.left = pleft;
		towerRet.right = pright;
		towerRet.top = ptop;
		towerRet.bottom = pbuttom;
		towerRet.attackX = qx;												//����������λ��
		towerRet.attackY = qy;
		towerRet.allHp = towerAllHp;
		towerRet.nowHp = towerRet.allHp;
		towerRet.attackRadius = towerAttackRadius;
		towerRet.attack = towerAttack;												//����Ϊ��������
		towerRet.target = null;												//��������
		towerRet.makeExp = 500;												//�ṩ����
		towerRet.perform = function(kind){
			if (towerRet.nowHp <= 0)											//�����ٻ�ʱ����
				return;
			if (towerRet.target != null){									//��ǰ���ڹ���Ŀ��ʱ
				if (getDis(towerRet.positionX, towerRet.positionY, towerRet.target) > towerRet.attackRadius){		//ԭ��Ŀ�����뿪�򲻴���
					towerRet.target = null;
				}
				if (towerRet.target != null){
					towerRet.target.attacked(towerRet.attack);					//����˺�
					if (towerRet.target.nowHp <= 0)
						towerRet.target = null;
				}
			}
			else {															//��ǰ�����ڹ���Ŀ��ʱ
				var minDis = 100000000, minObj;								//���Ҿ���������ĵжԶ���
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
						minObj = Heroes[1 - kind][i];
					}
				}
				if (minDis <= towerRet.attackRadius){							//���˶��������Ĺ�����Χ֮��ʱ��ʼ����
					towerRet.target = minObj;
					
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
	createNew : function(px, py,picx,picy, kidType){
		var campRet = {};
		campRet.idType = 'Camp';
		campRet.picX = picx;									//����Ϊ��Ӫ��λ�ò���
		campRet.picy = picy
		campRet.positionX = px;
		campRet.positionY = py;
		campRet.positionRadius = 54;
		campRet.left = 58;
		campRet.right = 58;
		campRet.bottom = 25;
		campRet.top = 94;
		campRet.allHp = campSoldierInterval;
		campRet.nowHp = campRet.allHp;
		campRet.kind = kidType;							//��Ӫ������һ��
		campRet.soldierInterval = Math.round(campSoldierInterval / frameTime);						//һ�������
		campRet.totalNum = camSoldierNum;															//һ��������
		campRet.nowNum = 0;																//��ǰ�Ѵ�֡��
		campRet.oneInterval = 10;															//�������������
		campRet.perform = function(kind){
			campRet.nowNum++;
			if (campRet.nowNum % campRet.oneInterval === 0 && campRet.nowNum <= campRet.oneInterval * campRet.totalNum)				//���ϳ�������ʱ��ʼ����
				Soldiers[kind].push(soldierClass.createNew(campRet.positionX, campRet.positionY + (Math.random() -1) *80, kind));
			if (campRet.nowNum == campRet.soldierInterval)
				campRet.nowNum = 0;
		}
		campRet.attacked = function(attackNum){
			campRet.nowHp -= attackNum;
			if (campRet.nowHp <= 0){								//��ӪûѪʱ��Ϸ����
				gameOver(this.kind);
			}
		}
		return campRet;
	}
};

window.onmousemove = function(e) {													//����ƶ��¼�����Ӧ�����ڿ��󡢿����ƶ�����
   	var tx = e.pageX - myCanvas.getBoundingClientRect().left;
	var ty = e.pageY - myCanvas.getBoundingClientRect().top;
	if (tx < 0)
		e.pageX = myCanvas.getBoundingClientRect().left;
	if (tx > cxt.canvas.width)
		e.pageX = myCanvas.getBoundingClientRect().right;
	if (tx <= screenMoveBorder)
		screenMoveflag = 1;
	else if (tx >= cxt.canvas.width - screenMoveBorder)
		screenMoveflag = 2;
	else screenMoveflag = 0;
}
myCanvas.onmousedown = function(e) {													//������¼�����Ӧ
   	var tx = e.pageX - myCanvas.getBoundingClientRect().left  + allPicLeft;
	var ty = e.pageY - myCanvas.getBoundingClientRect().top;
    if (e.button==2)																	//����һ�ΪӢ�۵��ƶ�����
    {
		var clickObj = getClickObj(tx, ty, 1);
		if (clickObj == null){		//�ƶ�����λ��
			Heroes[0][0].positionTo = {x:tx, y:ty};
			Heroes[0][0].positionObj = null;
		}
		else{						//����Ŀ��
			Heroes[0][0].positionTo = null;
			Heroes[0][0].positionObj = clickObj;
		}
    }
};

function initial(){																			//��ʼ������
	document.body.oncontextmenu=function rightClick(){ window.event.returnValue= false;}					//��������һ�ԭʼ�¼�
	baseCamp.push(campClass.createNew(266,422,77,92, 0));													//�����Ӫ
	baseCamp.push(campClass.createNew(3359,422,77,92, 1));
	Towers[0].push(towerClass.createNew(482.13,296.64,474,186.5,35,35,118.5,11,37,74,141,'towerSmall'));					//���������
	Towers[0].push(towerClass.createNew(480.49,530.42,478.04,422.37,35,35,118.5,11,37,74,141, 'towerSmall'));
	Towers[0].push(towerClass.createNew(1375,409,1370,265,47,47,157.5,21,53.5,75,161, 'towerBig'));
	Towers[1].push(towerClass.createNew(3146.18,295.68,3137.18,186.68,35,35,118.5,11,37,74,141, 'towerSmall'));
	Towers[1].push(towerClass.createNew(3146.18,532.18,3142.18,421.18,35,35,118.5,11,37,74,141, 'towerSmall'));
	Towers[1].push(towerClass.createNew(2226,413,2221,268,47,47,157.5,21,53.5,75,161, 'towerBig'));
	Heroes[0].push(heroClass.createNew(100, 400, 0));																	//����Ӣ��
	setInterval(cycleOperation, frameTime);					//��ʱ����

}
function cycleOperation(){										//��ʱִ��
	for (var k = 0; k < 2; k++)										//С���ж�
		for (var i = 0; i < Soldiers[k].length; i++){
			Soldiers[k][i].perform(k);
		}
	for (var k = 0; k < 2; k++)										//�������ж�
		for (var i = 0; i < Towers[k].length; i++){
			Towers[k][i].perform(k);
		}
	Heroes[0][0].perform();											//����Ӣ���ж�
	for (var i = 0; i < Heroes[1].length; i++){						//�з�Ӣ���ж�
		Heroes[1][i].performAI(1);
	}
	for (var k = 0; k < 2; k++)										//��Ӫ�ж�
		baseCamp[k].perform(k);
	if (screenMoveflag === 1)										//�жϻ����Ƿ��ƶ�
		allPicLeft -= screenMoveSpeed;
	else if (screenMoveflag === 2)
		allPicLeft += screenMoveSpeed;
	if (allPicLeft < 0)												//�ƶ���Χ����
		allPicLeft = 0;
	if (allPicLeft > 3600 - cxt.canvas.width)
		allPicLeft = 3600 - cxt.canvas.width;
	checkDead();													//�ж϶�������
	checkMargin();													//�����ƶ��Ƿ�
	paintOn();
}
function checkDead(){													//�ж���Ϸ����
	for (var k = 0; k < 2; k++)
		for (var i = 0; i < Soldiers[k].length; i++){
			if (Soldiers[k][i].nowHp <= 0){
				if (Soldiers[k][i].action.kind != 17 && Soldiers[k][i].action.kind != 18){
					Soldiers[k][i].action.kind = 17 + Soldiers[k][i].action.kind % 2;
					Soldiers[k][i].action.frame = 0;
				}
				else if (Soldiers[k][i].action.frame === 0){
					Soldiers[k].splice(i, 1);
					i--;
				}
			}
		}
	for (var k = 0; k < 2; k++)
		for (var i = 0; i < Towers[k].length; i++){
			if (Towers[k][i].nowHp <= 0){
				destroyedTowers[k].push(Towers[k][i]);
				Towers[k].splice(i, 1);
				i--;
			}
		}
	for (var k = 0; k < 2; k++)
		for (var i = 0; i < Heroes[k].length; i++){
			if (Heroes[k][i].nowHp <= 0){
				if (Heroes[k][i].action.kind != 15 && Heroes[k][i].action.kind != 16 && Heroes[k][i].nowDeathCD < 0){
					Heroes[k][i].action.kind = 15 + Heroes[k][i].action.kind % 2;
					Heroes[k][i].action.frame = 0;
					Heroes[k][i].nowDeathCD = Heroes[k][i].deathCD;
				}
				else if (Heroes[k][i].nowDeathCD >= 0){
					Heroes[k][i].nowDeathCD--;
					if (Heroes[k][i].nowDeathCD < 0){
						Heroes[k][i].nowHp = Heroes[k][i].allHp;
						Heroes.action.kind = 12 - k;
						Heroes.action.frame = 0;
					}
					if (Heroes[k][i].action.kind >= 15 && Heroes[k][i].action.frame == 0){
						Heroes[k][i].positionObj = null;
						Heroes[k][i].positionTo = null;
						Heroes[k][i].positionY = 400;
						if (k == 0)
							Heroes[k][i].positionX = 150;
						else
							Heroes[k][i].positionX = 3450;
						Heroes[k][i].action.kind = 12 - k;
					}
				}
			}
			else if ((k == 0 && Heroes[k][i].positionX <= addBloodRadius)||(k == 1 && Heroes[k][i].positionX >= 3600 - addBloodRadius)){
				Heroes[k][i].nowHp = Math.round(Heroes[k][i].nowHp + Heroes[k][i].allHp * addBloodRate);
				if (Heroes[k][i].nowHp > Heroes[k][i].allHp)
					Heroes[k][i].nowHP = Heroes[k][i].allHp;
			}
		}
}
function adjustPosition(obj){
	if (obj.positionX < 0)
		obj.positionX = 0;
	if (obj.positionY < 229)
		obj.positionY = 229;
	if (obj.positionX > 3600)
		obj.positionX = 3600;
	if (obj.positionY > 600)
		obj.positionY = 600;
	for (var k = 0; k < 2; k++)
		for (var i = 0; i < Towers[k].length; i++){
			if (getDis(obj.positionX, obj.positionY, Towers[k][i]) <= obj.positionRadius){
				var pp = Math.sqrt((obj.positionRadius + Towers[k][i].positionRadius) * (obj.positionRadius + Towers[k][i].positionRadius) - (obj.positionX - Towers[k][i].positionX) * (obj.positionX - Towers[k][i].positionX));
				if (obj.positionY < Towers[k][i].positionY)
					obj.positionY = Towers[k][i].positionY - pp;
				else obj.positionY = Towers[k][i].positionY + pp;
				
			}
		}
}
function checkMargin(){													//�ж�
	for (var k = 0; k < 2; k++)
		for (var i = 0; i < Soldiers[k].length; i++){
			adjustPosition(Soldiers[k][i]);
		}
	for (var k = 0; k < 2; k++)
		for (var i = 0; i < Heroes[k].length; i++){
			adjustPosition(Heroes[k][i]);
		}
}

function drawTowerAttack(drawObj){
	cxt.beginPath();
	var grd=cxt.createRadialGradient(75,50,5,90,60,100);
	grd.addColorStop(0,"red");
	grd.addColorStop(1,"white");
	cxt.strokeStyle=grd;
	cxt.shadowBlur=20;
	cxt.shadowColor="black";
	cxt.lineWidth = 5;
	//cxt.strokeStyle = 'rgb(245,250,42)';
	cxt.moveTo(drawObj.attackX - allPicLeft, drawObj.attackY);
	cxt.lineTo(drawObj.target.positionX - allPicLeft, drawObj.target.positionY - drawObj.target.top / 2);
	cxt.stroke();
	cxt.lineWidth = 1;
	cxt.shadowBlur=0;
}


function drawNowHp(drawObj){//�Ƽ�Ӣ��Ѫ����700-2000֮��
	var bloodheight = 5;
	var headtoblood = 10;
	var bloodhalfwidth = drawObj.left + 16;
	if(drawObj.idType === 'Hero')
	{
		bloodheight = 16;
		cxt.fillStyle = 'rgb(69,79,81)';
		cxt.fillRect(drawObj.positionX - bloodhalfwidth - allPicLeft, drawObj.positionY  - drawObj.top - bloodheight - headtoblood, 2 * bloodhalfwidth, bloodheight);//allHP
		var rate = drawObj.nowHp / drawObj.allHp;
		cxt.fillStyle = 'rgb(26,184,63)';
		var hundrednum = Math.round(drawObj.nowHp / 100);
		var nowHpWidth = (2 * bloodhalfwidth) * rate;
		cxt.fillRect(drawObj.positionX - bloodhalfwidth - allPicLeft, drawObj.positionY  - drawObj.top - bloodheight - headtoblood, nowHpWidth, bloodheight);//nowHP
		cxt.fillStyle = 'rgb(2,64,85)';
		cxt.strokeStyle = 'rgb(245,250,42)';
		cxt.beginPath();
		// cxt.moveTo(drawObj.positionX - allPicLeft, drawObj.positionY);
		// cxt.lineTo(drawObj.positionX - allPicLeft, drawObj.positionY - drawObj.top);
		for(var i = 1;i <= hundrednum;i++)
		{
			cxt.moveTo(drawObj.positionX - bloodhalfwidth - allPicLeft + i * nowHpWidth / hundrednum, drawObj.positionY  - drawObj.top - bloodheight - headtoblood +1);
			cxt.lineTo(drawObj.positionX - bloodhalfwidth - allPicLeft + i * nowHpWidth / hundrednum, drawObj.positionY  - drawObj.top - bloodheight - headtoblood + bloodheight -1);
			//cxt.lineTo(0,0);
		}
		cxt.stroke();
	}
	else
	{
	cxt.fillStyle = 'rgb(69,79,81)';
	cxt.fillRect(drawObj.positionX - drawObj.left - allPicLeft, drawObj.positionY  - drawObj.top - bloodheight - headtoblood, drawObj.left + drawObj.right, bloodheight);//allHP
	var rate = drawObj.nowHp / drawObj.allHp;
	cxt.fillStyle = 'rgb(26,184,63)';
	cxt.fillRect(drawObj.positionX - drawObj.left - allPicLeft, drawObj.positionY  - drawObj.top - 15, (drawObj.left + drawObj.right) * rate, 5);//nowHP
	}
	
}
function paintOn()													//������ͼ����canvas��
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
		for (var i = 0; i < destroyedTowers[k].length; i++)
			allObject.push(destroyedTowers[k][i]);
	for (var k = 0; k < 2; k++)
		for (var i = 0; i < Heroes[k].length; i++)
			allObject.push(Heroes[k][i]);
	allObject.sort(checkSort);
	var img1 = new Image();
	img1.src= 'images/mappic/background.png';
	cxt.drawImage(img1, 0 - allPicLeft, 0);
	for (var k = 0; k < 2; k++)
		for (var i = 0; i < Towers[k].length; i++)
			if (Towers[k][i].target != null)
				drawTowerAttack(Towers[k][i]);
	drawNowHp(baseCamp[0]);
	drawNowHp(baseCamp[1]);
	for (var i = 0; i < allObject.length; i++){
		var img = new Image();
		if (allObject[i].idType == 'towerBig')
			img.src = 'images/mappic/tower_big.png';
		else if (allObject[i].idType == 'towerSmall')
			img.src = 'images/mappic/tower_home.png';
		else if (allObject[i].idType == 'Hero'){
			img.src= actionFlash[allObject[i].action.kind].src[0][allObject[i].action.frame];
			if (!((allObject[i].action.kind == 1 ||��allObject[i].action.kind == 2 || allObject[i].action.kind == 5 || allObject[i].action.kind == 6 || allObject[i].action.kind == 11 || allObject[i].action.kind == 12|| allObject[i].action.kind == 15 || allObject[i].action.kind == 16)&&allObject[i].action.frame < actionFlash[allObject[i].action.kind].len && allObject[i].action.frame >=0))
				alert(12345);
		}
		else
			img.src= actionFlash[allObject[i].action.kind].src[allObject[i].kind][allObject[i].action.frame];
		if ((allObject[i].idType == 'towerBig' || allObject[i].idType == 'towerSmall')&&allObject[i].nowHp <= 0){
			if (allObject[i].idType == 'towerBig')
				img.src = 'images/mappic/tower_big_destroyed.png';
			else
				img.src = 'images/mappic/tower_home_destroyed.png';
		}
		if (allObject[i].nowHp > 0)
			drawNowHp(allObject[i]);
		cxt.drawImage(img, allObject[i].positionX - allObject[i].picX - allPicLeft, allObject[i].positionY - allObject[i].picY);
		cxt.strokeStyle="#0000ff";
		cxt.strokeRect(allObject[i].positionX - allObject[i].left - allPicLeft, allObject[i].positionY - allObject[i].top,allObject[i].right + allObject[i].left,allObject[i].bottom + allObject[i].top);
		cxt.beginPath();
		cxt.arc(allObject[i].positionX - allPicLeft, allObject[i].positionY, allObject[i].positionRadius,0,  Math.PI*2, true);
		cxt.stroke();
	}
}
