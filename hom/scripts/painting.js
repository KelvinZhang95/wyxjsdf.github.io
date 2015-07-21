//关于action对象的frame参数为当前播放到的帧数，kind参数为行为
//1、2:英雄行走(left,right) 3、4:小兵行走(left,right) 5、6:英雄攻击(left,right) 7、8:小兵攻击(left,right) 9:塔攻击 11、12: 英雄站立(left,right) 13、14:小兵站立(left,right) 15、16:英雄死亡 17、18:小兵死亡
//19、20:英雄技能一 21、22:英雄技能二  23、24:英雄技能三
var Soldiers;														//所有小兵的对象数组
var Towers, destroyedTowers;										//所有防御塔的对象数组
var Heroes;															//所有英雄的对象数组
var baseCamp;														//大本营的对象数组
var frameTime = 100;												//画面播放的间隔
var CanvasCopy = document.getElementById("myCanvas");				//画布Canvas的Dom元素
var allPicLeft;														//屏幕相对右移的距离
var screenMoveSpeed = 30, screenMoveflag = 0;						//画面移动的速度和判定
var screenMoveBorder = 20;											//响应移动判定的边界距离
var addBloodRadius = 170;											//可以回血的大本营范围
var addBloodRate = 0.01;											//单个间隔血量增加的百分比
var cxtCopy=CanvasCopy.getContext("2d");							//绘画的句柄
var nowMouseX, nowMouseY;											//当前鼠标位置，相对全图
var nowAction = 0;													//当前给玩家控制英雄的指令
var soldierAllHp = 300, soldierAttack = 20;							//小兵的血量、攻击力
var soldierAttackInterval = 1000, soldierSpeed = 10;				//小兵的攻击间隔(ms)，移动速度
var soldierMakeExp = 50; soldierAttackRadius= 22;					//小兵死亡所提供的经验、攻击范围
var towerAllHp = 2000, towerAttack = 5, towerAttackRadius = 150;	//塔的血量、攻击力、攻击距离（塔为放射型攻击）
var towerMakeExp = 500;												//塔毁灭所提供的经验
var campAllHp = 3000, campSoldierInterval = 30000;					//大本营的血量、大本营出兵的间隔
var camSoldierNum = 3;												//大本营一次出兵的数量

var myCanvas = document.createElement('canvas');
var cxt = myCanvas.getContext("2d");
myCanvas.width = 1200;
myCanvas.height = 600;

function getDis(px, py, obj){
	return (Math.sqrt((px - obj.positionX) *(px - obj.positionX) + (py - obj.positionY) * (py - obj.positionY)) - obj.positionRadius);
}

function getMove(hx, hy, tx, ty, speed)					//向一个目标点移动，目标为移动到点上
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

function getMoveFollow(hx, hy, radius, tx, ty, speed)							//向一个对象移动，目标为到一个对象中心点相距radius的距离
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

function checkContain(px, py, obj){													//判断当前是否在这个对象的点击块内，为处理鼠标点击事件
	if (px < obj.positionX - obj.left || px > obj.positionX + obj.right)
		return false;
	if (py < obj.positionY - obj.top || py > obj.positionY + obj.bottom)
		return false;
	return true;
}
function getClickObj(tx, ty, kind){													//获取当前被点击到的对象，注意对象的层次结构
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

function checkSort(a, b){															//比较函数，是Y从小到大的排序，用于层次绘图
	if (a.positionY > b.positionY){
		return 1;
	}
	else return -1;	
}
function gameOver(kind){															//游戏结束的响应，kind为失败方
	alert('gameOver');
}
var soldierClass ={								//小兵的对象
	createNew : function(px, py, direct){					//构造函数
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
		soldierRet.action = {kind:direct + 3, frame:0};																					//初始为移动状态
		soldierRet.makeExp = soldierMakeExp;
		soldierRet.perform = function(kind){																							//每回合执行的操作函数
			var minDis = 100000000, minObj;
			if (soldierRet.attackWait > 0)																								//CD时间减少
				soldierRet.attackWait--;
			soldierRet.action.frame = (soldierRet.action.frame + 1) % actionFlash[soldierRet.action.kind].len;							//画面播放帧数增加
			if (soldierRet.nowHp <= 0)																									//死亡士兵不执行
				return;
			if ((soldierRet.action.kind === 7 || soldierRet.action.kind === 8) && soldierRet.action.frame === 0){						//攻击动作完成
				soldierRet.target.attacked(soldierRet.attack);																			//在攻击动作完成时造成伤害
				soldierRet.action.kind = soldierRet.action.kind - 4;																	//转为行走状态
				soldierRet.action.frame = 0;
				soldierRet.target = null;
			}
			for (var i = 0; i < Soldiers[1 - kind].length; i++){																						//以下为获取距当前对象最近的敌对对象
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
			if (minDis < soldierRet.attackRadius + 1 && soldierRet.action.kind != 8 && soldierRet.action.kind != 7) {				//当最近敌对对象在机房攻击范围内，则执行攻击操作
				if (soldierRet.attackWait === 0){																					//当进攻CD时间已到，进行攻击
					soldierRet.attackWait = soldierRet.attackInterval;
					soldierRet.target = minObj;
					soldierRet.action.frame = 0;
					if (minObj.positionX < soldierRet.positionX)																//判断攻击朝向
						soldierRet.action.kind = 7;
					else soldierRet.action.kind = 8;
				}
				else {																											//原地站立，等待攻击CD
					if (minObj.positionX < soldierRet.positionX)
						soldierRet.action.kind = 13;
					else soldierRet.action.kind = 14;
					soldierRet.action.frame = 0;
				}
			}
			else if (soldierRet.action.kind != 8 && soldierRet.action.kind != 7){																	//当目标状态在范围以外，且当前为非攻击状态，执行移动操作
				if (soldierRet.action.kind === 14 || soldierRet.action.kind === 13)																	//站立状态转为移动状态
					soldierRet.action.frame = 0;
				if (minObj.positionX < soldierRet.positionX)
					soldierRet.action.kind = 3;
				else soldierRet.action.kind = 4;
				var pObj = getMoveFollow(soldierRet.positionX, soldierRet.positionY, minObj.positionRadius + soldierRet.attackRadius, minObj.positionX, minObj.positionY, soldierRet.speed);			//向目标对象移动
				soldierRet.positionX = pObj.positionX;
				soldierRet.positionY = pObj.positionY;
			}
		}
		soldierRet.attacked = function(attackNum, obj){
			soldierRet.nowHp -= attackNum;
		}
		return soldierRet;
	}
};
function checkHeroAttackKind(kind){
	if (kind === 1 || kind === 2)
		return - 2;
	else if (kind === 5 || kind === 6)
		return 0;
	else if (kind === 11 || kind === 12)
		return -1;
	else if (kind === 19 || kind === 20)
		return 1;
	else if (kind === 21 || kind === 22)
		return 2;
	else if (kind === 23 || kind === 24)
		return 3;
}
function getBuff(str, buff){
	var s = 0;
	for (var i = 0; i < buff.length; i++)
		if (str in buff[i])
			s += buff[i][str];
	return s;
}

function checkHit(x1,y1,x2,y2,l,a,b,r){
	var dic;
	r += 5;
	var temporary_r1,temporary_r2;
	var temporary1,temporary2,panduan1,panduan2;
	temporary1 = (y2 - y1) * a - (x2 - x1) * b + x2 * y1 - x1 * y2;
	temporary2 = (x2 - x1) * (x2 -x1) + (y2 - y1) * (y2 - y1);
	panduan1 = (r -l/2) * (r - l/2);
	dic = temporary1 * temporary1 / temporary2;
	temporary_r1 = (x1 - a)*(x2 -x1) + (y1 -b)*(y2 - y1);
	temporary_r2 = (x2 - a)*(x2 -x1) + (y2 -b)*(y2 - y1);
	if((temporary_r1 * temporary_r2) >= 0);
	{
		panduan2 = (x1 - a)*(x1 - a) + (y1 - b)*(y1 - b);
		if(((x2 - a)*(x2 - a) + (y2 - b)*(y2 - b)) < panduan2)
			panduan2 = (x2 - a)*(x2 - a) + (y2 - b)*(y2 - b);
	}
	if((temporary_r1 * temporary_r2) < 0)
	{
		panduan2 = 0;
	}
	if((dic < panduan1) && (panduan2 < panduan1))
	{
		return true;//激光打中;
	}
	else
		return false;//激光未打中;
}

var heroClass ={									//玩家控制英雄的对象
	createNew : function(px, py, kindHero){
		var heroRet = {};
		heroRet.idType = 'Hero';
		heroRet.kind = kindHero;
		heroRet.positionX = px;												//以下一个英雄的大致方位布局
		heroRet.positionY = py;
		heroRet.picX = 176;
		heroRet.picY = 215;
		heroRet.positionRadius = 45 * 0.7;
		heroRet.left = 43 * 0.7;
		heroRet.right = 43 * 0.7;
		heroRet.top = 160 * 0.7 + 28;
		heroRet.bottom = 0;
		heroRet.speed = 20;														//移动速度
		heroRet.exp = 0;														//英雄的经验
		heroRet.level = 1;														//英雄的等级
		heroRet.skills = [{attack : 60, attackRadius : 45, attackInterval : Math.round(1000 / frameTime), attackWait : 0},
					   {attackRate:1, speedRate:1, attackInterval : Math.round(8000 / frameTime), buffLast:Math.round(4000 / frameTime), attackWait:0},
					   {attackRate:0.4, attack:0, attackInterval:Math.round(10000 / frameTime), attackWait:0, attackRadius:110},
					   {attackRate:4,attck:0, attackInterval:Math.round(3000 / frameTime), attackWait:0, attackBorder:10, targetX:0, targetY:0, positionX:0, positionY:0, attackSpeed : 100}];
		heroRet.buff = [];
		heroRet.allHp = 1000;
		heroRet.nowHp = heroRet.allHp;
		heroRet.deathCD = Math.round(10000 / frameTime);
		heroRet.nowDeathCD = -1;
		heroRet.pastX = 0;														//大招时前一个点的坐标
		heroRet.pastY = 0;
		heroRet.action = {kind:12 - kindHero, frame:0};							//当前行为
		heroRet.target = null;													//当前正在攻击的对象
		heroRet.positionObj = null;												//当前正在追逐的对象(右键点击)只能为敌对对象
		heroRet.positionTo = null;												//当前正在追逐的点(右键点击)
		heroRet.perform = function(kind){						//玩家控制英雄的行为
			heroRet.action.frame = (heroRet.action.frame + 1) % actionFlash[heroRet.action.kind].len;						//画面播放帧数增加
			for (var i = 0; i < heroRet.buff.length; i++){
				heroRet.buff[i].buffLast--;
				if (heroRet.buff[i].buffLast === 0){
					heroRet.buff.splice(i, 1);
					i--;
				}
			}
			for (var i = 0; i < 4; i++)
				if (heroRet.skills[i].attackWait > 0)																		//CD时间减少
					heroRet.skills[i].attackWait--;
			
			if (heroRet.nowHp <= 0)																							//英雄死亡时不执行
				return;
			
			if (checkHeroAttackKind(heroRet.action.kind) >= 0 && heroRet.action.frame === 0){					//英雄一次攻击结束，转为静止状态
				if (checkHeroAttackKind(heroRet.action.kind) == 2){
					for (var i = 0; i < Soldiers[1 - heroRet.kind].length; i++){
						var p = getDis(heroRet.positionX, heroRet.positionY, Soldiers[1 - heroRet.kind][i]);
						if (p <= heroRet.skills[2].attackRadius){
							Soldiers[1 - heroRet.kind][i].attacked(heroRet.skills[2].attack, heroRet);
						}
					}
					for (var i = 0; i < Heroes[1 - heroRet.kind].length; i++){
						var p = getDis(heroRet.positionX, heroRet.positionY, Heroes[1 - heroRet.kind][i]);
						if (p <= heroRet.skills[2].attackRadius){
							Heroes[1 - heroRet.kind][i].attacked(heroRet.skills[2].attack, heroRet);
						}
					}
				}
				else if (checkHeroAttackKind(heroRet.action.kind) == 3){
				}
				else{
					heroRet.target.attacked(heroRet.skills[0].attack+getBuff('attack',heroRet.buff),heroRet);
					heroRet.target = null;
				}
				heroRet.action.kind = 12 - heroRet.action.kind % 2;
				heroRet.action.frame = 0;
			}
			if (heroRet.positionObj != null && heroRet.positionObj.nowHp <= 0)
				heroRet.positionObj = null;
			if (checkHeroAttackKind(heroRet.action.kind) < 0){														//当前为非进攻状态时
				if (nowAction == 1 && heroRet.skills[1].attackWait == 0){
					heroRet.buff.push({attack:heroRet.skills[0].attack * heroRet.skills[1].attackRate, speed:heroRet.speed * heroRet.skills[1].speedRate, buffLast:heroRet.skills[1].buffLast});
					heroRet.skills[1].attackWait = heroRet.skills[1].attackInterval;
					nowAction = 0;
				}
				else if (nowAction == 2 && heroRet.skills[2].attackWait == 0){
					heroRet.action.kind = 21;
					heroRet.action.frame = 0;
					heroRet.skills[2].attackWait = heroRet.skills[2].attackInterval;
					heroRet.skills[2].attack = heroRet.skills[0].attack * (1 + heroRet.skills[2].attackRate);
					nowAction = 0;
				}
				else if (nowAction == 3 && heroRet.skills[3].attackWait == 0){
					if (nowMouseX < heroRet.positionX)
						heroRet.action.kind = 23;
					else
						heroRet.action.kind = 24;
					heroRet.action.frame = 0;
					heroRet.skills[3].attackWait = heroRet.skills[3].attackInterval;
					var px = heroRet.positionX, py = heroRet.positionY - 111;
					if (heroRet.action.kind % 2 == 1)
						px -= 16;
					else px += 30;
					heroRet.skills[3].positionX = px;
					heroRet.skills[3].positionY = py;
					if (px == nowMouseX && py == nowMouseY)
						nowMouseX++;
					var p = 10000 , q = 10000;
					if (nowMouseX != px)
						p =  Math.abs(3600 / (nowMouseX - px));
					if (nowMouseY != heroRet.positionY)
						q =  Math.abs(600 / (nowMouseY - py));
					if (q < p) p = q;
					heroRet.skills[3].targetX = nowMouseX + (nowMouseX - px) * q;
					heroRet.skills[3].targetY = nowMouseY + (nowMouseY - py) * q;
					heroRet.skills[3].attack = heroRet.skills[0].attack * (1 + heroRet.skills[3].attackRate);
					nowAction = 0;
				}
				else if (heroRet.positionObj != null){																			//当前有追逐对象时
					var temObj = heroRet.positionObj;
					var p = getDis(heroRet.positionX, heroRet.positionY, temObj);
					if (p < heroRet.skills[0].attackRadius + 1){																		//在攻击范围内则攻击
						if (heroRet.skills[0].attackWait === 0){																		//无CD时间时开始攻击
							heroRet.skills[0].attackWait = heroRet.skills[0].attackInterval;
							heroRet.target = temObj;
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
					else{																									//向目标状态移动
						if (heroRet.action.kind != 1 && heroRet.action.kind != 2){											//非移动状态转为移动状态
							heroRet.action.frame = 0;
						}
						if (temObj.positionX < heroRet.positionX)															//判定移动方向
							heroRet.action.kind = 1;
						else
							heroRet.action.kind = 2;
						var pObj = getMoveFollow(heroRet.positionX, heroRet.positionY, temObj.positionRadius + heroRet.skills[0].attackRadius, temObj.positionX, temObj.positionY, heroRet.speed + getBuff('speed', heroRet.buff));
						heroRet.positionX = pObj.positionX;
						heroRet.positionY = pObj.positionY;
					}
				}
				else if (heroRet.positionTo != null){																		//向一个点移动
					if (heroRet.action.kind != 1 && heroRet.action.kind != 2){												//非移动状态转为移动状态
						heroRet.action.frame = 0;
					}
					if (heroRet.positionTo.x < heroRet.positionX)
						heroRet.action.kind = 1;
					else
						heroRet.action.kind = 2;
					var pObj = getMove(heroRet.positionX, heroRet.positionY, heroRet.positionTo.x, heroRet.positionTo.y, heroRet.speed + getBuff('speed', heroRet.buff));
					heroRet.positionX = pObj.positionX;
					heroRet.positionY = pObj.positionY;
					if (heroRet.positionX === heroRet.positionTo.x && heroRet.positionY === heroRet.positionTo.y){			//已抵达目标点时，转为静止状态
						heroRet.action.frame = 0;
						heroRet.action.kind += 10;
						heroRet.positionTo = null;
					}
				}
				else{																										//无操作，静止
					heroRet.action.kind = 12 - heroRet.action.kind % 2;
					heroRet.action.frame = 0;
				}
			}
			else if (checkHeroAttackKind(heroRet.action.kind) == 3 && heroRet.action.frame >= 2){
					var pObj = getMove(heroRet.skills[3].positionX, heroRet.skills[3].positionY, heroRet.skills[3].targetX, heroRet.skills[3].targetY, heroRet.skills[3].attackSpeed);
					if (pObj.positionX < 0){
						pObj.positionY -= (pObj.positionY - heroRet.skills[3].positionY) * pObj.positionX / (pObj.positionX - heroRet.skills[3].positionX);
						pObj.positionX = 0;
					}
					if (pObj.positionY < 229){
						pObj.positionX -= (pObj.positionX - heroRet.skills[3].positionX) * (pObj.positionY - 229)/ (pObj.positionY - heroRet.skills[3].positionY);
						pObj.positionY = 229;
					}
					if (pObj.positionX > 3600){
						pObj.positionY -= (pObj.positionY - heroRet.skills[3].positionY) * (pObj.positionX - 3600)/ (pObj.positionX - heroRet.skills[3].positionX);
						pObj.positionX = 3600;
					}
					if (pObj.positionY > 600){
						pObj.positionX -= (pObj.positionX - heroRet.skills[3].positionX) * (pObj.positionY - 600)/ (pObj.positionY - heroRet.skills[3].positionY);
						pObj.positionY = 600;
					}
					for (var i = 0; i < Soldiers[1 - heroRet.kind].length; i++){
						if (checkHit(heroRet.skills[3].positionX, heroRet.skills[3].positionY,pObj.positionX, pObj.positionY, heroRet.skills[3].attackBorder, Soldiers[1-heroRet.kind][i].positionX, Soldiers[1-heroRet.kind][i].positionY, Soldiers[1-heroRet.kind][i].positionRadius)){
							if (heroRet.action.frame == 1 || 
							!checkHit(heroRet.pastX, heroRet.pastY, heroRet.skills[3].positionX, heroRet.skills[3].positionY, heroRet.skills[3].attackBorder, Soldiers[1-heroRet.kind][i].positionX, Soldiers[1-heroRet.kind][i].positionY, Soldiers[1-heroRet.kind][i].positionRadius)){
								Soldiers[1-heroRet.kind][i].attacked(heroRet.skills[3].attack, heroRet);
							}
						}
					}
					for (var i = 0; i < Heroes[1 - heroRet.kind].length; i++){
						if (checkHit(heroRet.skills[3].positionX, heroRet.skills[3].positionY,pObj.positionX, pObj.positionY, heroRet.skills[3].attackBorder, Heroes[1-heroRet.kind][i].positionX, Heroes[1-heroRet.kind][i].positionY, Heroes[1-heroRet.kind][i].positionRadius)){
							if (heroRet.action.frame == 1 || 
							!checkHit(heroRet.pastX, heroRet.pastY, heroRet.skills[3].positionX, heroRet.skills[3].positionY, heroRet.skills[3].attackBorder, Heroes[1-heroRet.kind][i].positionX, Heroes[1-heroRet.kind][i].positionY, Heroes[1-heroRet.kind][i].positionRadius)){
								Heroes[1-heroRet.kind][i].attacked(heroRet.skills[3].attack, heroRet);
							}
						}
					}
					heroRet.pastX = heroRet.skills[3].positionX;
					heroRet.pastY = heroRet.skills[3].positionY;
					heroRet.skills[3].positionX = pObj.positionX;
					heroRet.skills[3].positionY = pObj.positionY;
			}
		}
		heroRet.performAI = function(kind){								//电脑AI的行为
		}
		heroRet.attacked = function(attackNum, obj){							//收到伤害
			heroRet.nowHp -= attackNum;
		}
		return heroRet;
	}
};

var heroAIClass ={				//电脑控制英雄的对象
	
}






var towerClass ={									//塔的对象
	createNew : function(px, py, qx, qy,pleft,pright,ptop,pbuttom,pradius,picx,picy, id, kindType){
		var towerRet = {};
		towerRet.idType = id;
		this.kind = kindType;
		towerRet.picX = picx;												//以下为塔的位置参数
		towerRet.picY = picy;
		towerRet.positionX = px;
		towerRet.positionY = py;
		towerRet.positionRadius = pradius;
		towerRet.left = pleft;
		towerRet.right = pright;
		towerRet.top = ptop;
		towerRet.bottom = pbuttom;
		towerRet.attackX = qx;												//攻击点所在位置
		towerRet.attackY = qy;
		towerRet.allHp = towerAllHp;
		towerRet.nowHp = towerRet.allHp;
		towerRet.attackRadius = towerAttackRadius;
		towerRet.attack = towerAttack;												//攻击为持续攻击
		towerRet.target = null;												//攻击对象
		towerRet.makeExp = 500;												//提供经验
		towerRet.perform = function(kind){
			if (towerRet.nowHp <= 0)											//塔被毁坏时返回
				return;
			if (towerRet.target != null){									//当前存在攻击目标时
				if (getDis(towerRet.positionX, towerRet.positionY, towerRet.target) > towerRet.attackRadius){		//原先目标已离开或不存在
					towerRet.target = null;
				}
				if (towerRet.target != null){
					towerRet.target.attacked(towerRet.attack, towerRet);					//造成伤害
					if (towerRet.target.nowHp <= 0)
						towerRet.target = null;
				}
			}
			else {															//当前不存在攻击目标时
				var minDis = 100000000, minObj;								//查找距离塔最近的敌对对象
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
				if (minDis <= towerRet.attackRadius){							//当此对象在塔的攻击范围之内时开始攻击
					towerRet.target = minObj;
					
				}
			}
		}
		towerRet.attacked = function(attackNum, obj){
			towerRet.nowHp -= attackNum;
		}
		return towerRet;
	}
};

var campClass ={															//大本营的对象
	createNew : function(px, py,picx,picy, kidType){
		var campRet = {};
		campRet.idType = 'Camp';
		campRet.picX = picx;									//以下为大本营的位置参数
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
		campRet.kind = kidType;							//大本营属于哪一方
		campRet.soldierInterval = Math.round(campSoldierInterval / frameTime);						//一批兵间隔
		campRet.totalNum = camSoldierNum;															//一批兵数量
		campRet.nowNum = 0;																//当前已达帧数
		campRet.oneInterval = 10;															//相邻两个兵间隔
		campRet.perform = function(kind){
			campRet.nowNum++;
			if (campRet.nowNum % campRet.oneInterval === 0 && campRet.nowNum <= campRet.oneInterval * campRet.totalNum)				//符合出兵条件时开始出兵
				Soldiers[kind].push(soldierClass.createNew(campRet.positionX, campRet.positionY + (Math.random() -1) *80, kind));
			if (campRet.nowNum == campRet.soldierInterval)
				campRet.nowNum = 0;
		}
		campRet.attacked = function(attackNum, obj){
			campRet.nowHp -= attackNum;
			if (campRet.nowHp <= 0){								//大本营没血时游戏结束
				gameOver(this.kind);
			}
		}
		return campRet;
	}
};

window.onmousemove = function(e) {													//鼠标移动事件的响应，用于靠左、靠右移动画面
   	var tx = e.pageX - CanvasCopy.getBoundingClientRect().left;
	var ty = e.pageY - CanvasCopy.getBoundingClientRect().top;
	nowMouseX = tx + allPicLeft;
	nowMouseY = ty;
	if (tx < 0)
		e.pageX = CanvasCopy.getBoundingClientRect().left;
	if (tx > cxt.canvas.width)
		e.pageX = CanvasCopy.getBoundingClientRect().right;
	if (tx <= screenMoveBorder)
		screenMoveflag = 1;
	else if (tx >= cxt.canvas.width - screenMoveBorder)
		screenMoveflag = 2;
	else screenMoveflag = 0;
}
window.onkeydown = function(e){
	if (e.keyCode == 81){
		nowAction = 1;
	}
	else if (e.keyCode == 87){
		nowAction = 2;
		Heroes[0][0].positionObj = null;
		Heroes[0][0].positionTo = null;
	}
	else if (e.keyCode == 69){
		nowAction = 3;
		Heroes[0][0].positionObj = null;
		Heroes[0][0].positionTo = null;
	}
	else if (e.keyCode == 32){
		allPicLeft = Heroes[0][0].positionX - 600;
		if (allPicLeft < 0)
			allPicLeft = 0;
	}
}
CanvasCopy.onmousedown = function(e) {													//鼠标点击事件的响应
   	var tx = e.pageX - CanvasCopy.getBoundingClientRect().left  + allPicLeft;
	var ty = e.pageY - CanvasCopy.getBoundingClientRect().top;
    if (e.button==2)																	//鼠标右击为英雄的移动攻击
    {
		var clickObj = getClickObj(tx, ty, 1);
		nowAction = 0;
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

function initial(){																			//初始化过程
	baseCamp = [];
	Towers = [[],[]];
	Heroes = [[],[]];
	Soldiers = [[],[]];
	destroyedTowers = [[],[]];
	allPicLeft = 0;
	document.body.oncontextmenu=function rightClick(){ window.event.returnValue= false;}					//禁用鼠标右击原始事件
	baseCamp.push(campClass.createNew(266,422,77,92, 0));													//加入大本营
	baseCamp.push(campClass.createNew(3359,422,77,92, 1));
	Towers[0].push(towerClass.createNew(482.13,296.64,474,186.5,35,35,118.5,11,37,74,141,'towerSmall', 0));					//加入防御塔
	Towers[0].push(towerClass.createNew(480.49,530.42,478.04,422.37,35,35,118.5,11,37,74,141, 'towerSmall', 0));
	Towers[0].push(towerClass.createNew(1375,409,1370,265,47,47,157.5,21,53.5,75,161, 'towerBig', 0));
	Towers[1].push(towerClass.createNew(3146.18,295.68,3137.18,186.68,35,35,118.5,11,37,74,141, 'towerSmall', 1));
	Towers[1].push(towerClass.createNew(3146.18,532.18,3142.18,421.18,35,35,118.5,11,37,74,141, 'towerSmall', 1));
	Towers[1].push(towerClass.createNew(2226,413,2221,268,47,47,157.5,21,53.5,75,161, 'towerBig', 1));
	Heroes[0].push(heroClass.createNew(100, 400, 0));																	//加入英雄
	setInterval(cycleOperation, frameTime);					//计时函数

}
function cycleOperation(){										//定时执行
	for (var k = 0; k < 2; k++)										//小兵行动
		for (var i = 0; i < Soldiers[k].length; i++){
			Soldiers[k][i].perform(k);
		}
	for (var k = 0; k < 2; k++)										//防御塔行动
		for (var i = 0; i < Towers[k].length; i++){
			Towers[k][i].perform(k);
		}
	Heroes[0][0].perform();											//己方英雄行动
	for (var i = 0; i < Heroes[1].length; i++){						//敌方英雄行动
		Heroes[1][i].performAI(1);
	}
	for (var k = 0; k < 2; k++)										//大本营行动
		baseCamp[k].perform(k);
	if (screenMoveflag === 1)										//判断画面是否移动
		allPicLeft -= screenMoveSpeed;
	else if (screenMoveflag === 2)
		allPicLeft += screenMoveSpeed;
	if (allPicLeft < 0)												//移动范围修正
		allPicLeft = 0;
	if (allPicLeft > 3600 - cxt.canvas.width)
		allPicLeft = 3600 - cxt.canvas.width;
	checkDead();													//判断对象死亡
	checkMargin();													//调整移动非法
	paintOn();
}
function checkDead(){													//判断游戏死亡
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
						Heroes[k][i].action.kind = 12 - k;
						Heroes[k][i].action.frame = 0;
					}
					if ((Heroes[k][i].action.kind === 15 || Heroes[k][i].action.kind === 16)&& Heroes[k][i].action.frame == 0){
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
					Heroes[k][i].nowHp = Heroes[k][i].allHp;
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
function checkMargin(){													//判断
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


function drawNowHp(drawObj){//推荐英雄血量在700-2000之间
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
		var img;
		if (allObject[i].idType == 'towerBig')
			img = allImg[allImg.length - 5];
		else if (allObject[i].idType == 'towerSmall')
			img = allImg[allImg.length - 4];
		else if (allObject[i].idType == 'Hero'){
			img= actionFlash[allObject[i].action.kind].src[0][allObject[i].action.frame];
			if (checkHeroAttackKind(allObject[i].action.kind) == 0){
				if (allObject[i].buff.length > 0){
					img= actionFlash[allObject[i].action.kind + 14].src[0][allObject[i].action.frame];
					if (allObject[i].action.frame == actionFlash[allObject[i].action.kind + 14].len - 1)
						allObject[i].buff.splice(0, 1);
				}
			}
			else if (checkHeroAttackKind(allObject[i].action.kind) == 2){
				var img1 = actionFlash[22].src[0][allObject[i].action.frame];
				cxt.drawImage(img1, allObject[i].positionX - 289 - allPicLeft, allObject[i].positionY - 416);
			}
			else if (checkHeroAttackKind(allObject[i].action.kind) == 3 && allObject[i].action.frame >= 2){
				var px = allObject[i].positionX, py = allObject[i].positionY - 111;
				if (allObject[i].action.kind % 2 == 1)
					px -= 16;
				else px += 30;
				cxt.beginPath();
				var grd=cxt.createRadialGradient(75,50,5,90,60,100);
				grd.addColorStop(0,"red");
				grd.addColorStop(1,"white");
				cxt.strokeStyle=grd;
				cxt.shadowBlur=20;
				cxt.shadowColor="black";
				cxt.lineWidth = allObject[i].skills[3].attackBorder;
				//cxt.strokeStyle = 'rgb(245,250,42)';
				cxt.moveTo(px - allPicLeft, py);
				cxt.lineTo(allObject[i].skills[3].positionX - allPicLeft, allObject[i].skills[3].positionY);
				cxt.stroke();
				cxt.lineWidth = 1;
				cxt.shadowBlur=0;
			}
//			if (!((allObject[i].action.kind == 1 || allObject[i].action.kind == 2 || allObject[i].action.kind == 5 || allObject[i].action.kind == 6 || allObject[i].action.kind == 11 || allObject[i].action.kind == 12|| allObject[i].action.kind == 15 || allObject[i].action.kind == 16)&&allObject[i].action.frame < actionFlash[allObject[i].action.kind].len && allObject[i].action.frame >=0))
//				alert(12345);
		}
		else
			img = actionFlash[allObject[i].action.kind].src[allObject[i].kind][allObject[i].action.frame];
		if ((allObject[i].idType == 'towerBig' || allObject[i].idType == 'towerSmall')&&allObject[i].nowHp <= 0){
			if (allObject[i].idType == 'towerBig')
				img = allImg[allImg.length - 2];
			else
				img = allImg[allImg.length - 1];
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
	cxtCopy.drawImage(myCanvas, 0, 0);
}
