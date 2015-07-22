//关于action对象的frame参数为当前播放到的帧数，kind参数为行为
//1、2:英雄行走(left,right) 3、4:小兵行走(left,right) 5、6:英雄攻击(left,right) 7、8:小兵攻击(left,right) 9:塔攻击 11、12: 英雄站立(left,right) 13、14:小兵站立(left,right) 15、16:英雄死亡 17、18:小兵死亡
//19、20:英雄技能一 21、22:英雄技能二  23、24:英雄技能三
var MyInterval;
var Soldiers;														//所有小兵的对象数组
var Towers, destroyedTowers;										//所有防御塔的对象数组
var Heroes;															//所有英雄的对象数组
var baseCamp;														//大本营的对象数组
var frameTime = 100;												//画面播放的间隔
var CanvasCopy = document.getElementById("myCanvas");				//画布Canvas的Dom元素
var allPicLeft;														//屏幕相对右移的距离
var screenMoveSpeed = 60, screenMoveflag = 0;						//画面移动的速度和判定
var screenMoveBorder = 20;											//响应移动判定的边界距离
var addBloodRadius = 170;											//可以回血的大本营范围
var addBloodRate = 0.01;											//单个间隔血量增加的百分比
var cxtCopy=CanvasCopy.getContext("2d");							//绘画的句柄
var nowMouseX, nowMouseY;											//当前鼠标位置，相对全图
var soldierAllHp = 300, soldierAttack = 20;							//小兵的血量、攻击力
var soldierAttackRadius = 22;										//小兵的攻击范围
var soldierAttackInterval = 1000, soldierSpeed = 10;				//小兵的攻击间隔(ms)，移动速度
var soldierMakeExp = 20, soldierMakeHp = 10;						//小兵死亡所提供的经验、最后一击血量
var towerAllHp = 2000, towerAttack = 5, towerAttackRadius = 150;	//塔的血量、攻击力、攻击距离（塔为放射型攻击）
var towerMakeExp = 150, towerMakeHp = 80;							//塔毁灭所提供的经验、最后一击血量
var campAllHp = 3000, campSoldierInterval = 30000;					//大本营的血量、大本营出兵的间隔
var camSoldierNum = 3;												//大本营一次出兵的数量
var heroMakeExp = 100, heroMakeHp = 50;								//击杀英雄所提供的经验、最后一击血量
var heroAttackRadius = 45, heroAttackInterval = 1000;				//英雄普通攻击范围、间隔
var heroSkill2Radius = 150, heroSkill3Speed = 100;					//英雄技能二攻击范围，技能三攻击速度
var heroSkill3Border = 10;											//英雄技能三攻击速度
var getExpRadius = 300;												//获取经验的间距
var expLevel = [100, 300, 600, 1000, 1500, 2100, 2700, 3300, 3900, 9999];								//等级对应经验值
var levelMax = 10;													//最大等级
var gameover_kind,gameover_frame,flagDebug1 = false, flagDebug2 = false;


var attackLevel = [60, 65, 70,75, 80, 85, 90, 95, 100, 105];									//英雄物理攻击
var speedLevel = [16, 16, 17, 17, 18, 18, 19, 19, 20, 20];										//英雄的速度
var HpLevel = [1000, 1120, 1240, 1360, 1480, 1600, 1720, 1840, 1960, 2080];						//英雄生命值
var skill1AttackLevel = [1, 1, 1.2, 1.2, 1.2, 1.4, 1.4, 1.4, 1.6, 1.6];							//技能一攻击加成
var skill2AttackLevel = [1, 1, 1.2, 1.2, 1.2, 1.4, 1.4, 1.4, 1.6, 1.6];							//技能二攻击加成
var skill3AttackLevel = [2.7, 2.7, 3.0, 3.0, 3.5, 3.5, 3.5, 3.8, 3.8, 4.1];						//技能三攻击加成
var skill1SpeedLevel = [0.9, 0.9, 0.9, 1.0, 1.0, 1.0, 1.1, 1.1, 1.2, 1.2];						//技能一移动速度加成
var skill1BuffLevel = [4000, 4000, 4000, 4000, 4000, 4500, 4500, 4500, 4500, 5000];				//技能一buff时间
var skill1CDLevel = [8000, 8000, 7500, 7500, 7500, 7000, 7000, 7000, 6500, 6500];				//技能一CD时间
var skill2CDLevel = [10000, 10000, 9500, 9500, 9000, 9000, 8500, 8500, 8000, 8000];				//技能二CD时间
var skill3CDLevel = [35000, 34000, 33000, 32000, 31000, 30000, 29000, 28000, 27000, 26000];		//技能三CD时间
var deathLevel = [10000, 10000, 12000, 12000, 12000, 12000, 12000, 13000, 13000, 13000];		//英雄死亡等待时间

var myCanvas = document.createElement('canvas');					//用于双缓冲的画布
var cxt = myCanvas.getContext("2d");
	myCanvas.width = 1200;
	myCanvas.height = 600;

function getDis(px, py, obj){										//获取一个点到一个对象边界的距离
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
function gameOver(kind){	//游戏结束的响应，kind为失败方
	clearInterval(MyInterval);
	gameover_frame = 0;
	gameover_kind = kind;
	var temp = setInterval("draw_gameOver()",50)	;												
	//alert('gameOver');
	document.getElementById("replaybutton").style.display = "block";
	initial();
	document.getElementById("replaybutton").style.display = "none";
	clearInterval(temp);

}
function draw_gameOver(){
	
	if(gameover_frame <= 60){
		cxtCopy.fillStyle="#0000ff";
		//cxtCopy.clearRect(0,0,1200,600);
		cxtCopy.fillRect(0,0,10*gameover_frame,600);
		cxtCopy.fillRect(1200 - 10*gameover_frame,0,10*gameover_frame,600);
		gameover_frame++;
	}
	else{
		cxtCopy.fillStyle= "rgb(255,10,67)";
		cxtCopy.font="60px Arial";
		if (gameover_kind == 1)
			cxtCopy.fillText("YOU WIN!",600 - 140,300);
		else
			cxtCopy.fillText("YOU Lose!",600 - 140,300);
	}
	

}
var soldierClass ={											//小兵的对象
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
		soldierRet.target = null;														//当前攻击的目标
		soldierRet.attackInterval = Math.round(soldierAttackInterval / frameTime);
		soldierRet.attackWait = 0;
		soldierRet.allHp = soldierAllHp;
		soldierRet.nowHp = soldierRet.allHp;
		soldierRet.action = {kind:direct + 3, frame:0};																					//初始为移动状态
		soldierRet.makeExp = soldierMakeExp;																							//杀死小兵可以获取的经验值
		soldierRet.makeHp =  soldierMakeHp;																								//最后一刀可以获得的血量
		soldierRet.perform = function(kind){																							//每回合执行的操作函数
			if (soldierRet.attackWait > 0)																								//CD时间减少
				soldierRet.attackWait--;
			soldierRet.action.frame = (soldierRet.action.frame + 1) % actionFlash[soldierRet.action.kind].len;							//画面播放帧数增加
			if (soldierRet.nowHp <= 0)																									//死亡士兵不执行
				return;
			if ((soldierRet.action.kind === 7 || soldierRet.action.kind === 8) && soldierRet.action.frame === 0){						//攻击动作完成
				soldierRet.target.attacked(soldierRet.attack, soldierRet);																			//在攻击动作完成时造成伤害
				soldierRet.action.kind = soldierRet.action.kind - 4;																	//转为行走状态
				soldierRet.action.frame = 0;
				soldierRet.target = null;
			}
			var minDis = 100000000, minObj;
			for (var i = 0; i < Soldiers[1 - kind].length; i++){																		//以下为获取距当前对象最近的敌对对象
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
					if (minObj.positionX < soldierRet.positionX)																	//判断攻击朝向
						soldierRet.action.kind = 7;
					else soldierRet.action.kind = 8;
				}
				else {																												//原地站立，等待攻击CD
					if (minObj.positionX < soldierRet.positionX)
						soldierRet.action.kind = 13;
					else soldierRet.action.kind = 14;
					soldierRet.action.frame = 0;
				}
			}
			else if (soldierRet.action.kind != 8 && soldierRet.action.kind != 7){													//当目标状态在范围以外，且当前为非攻击状态，执行移动操作
				if (soldierRet.action.kind === 14 || soldierRet.action.kind === 13)													//站立状态转为移动状态
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
			if (soldierRet.nowHp <= 0)
				return;
			soldierRet.nowHp -= attackNum;
			if (soldierRet.nowHp <= 0){																					//当小兵死亡时，给周围英雄加经验
				obj.nowHp += soldierRet.makeHp;
				if (obj.idType == 'Hero')
					obj.killSoldiers++;
				if (obj.nowHp > obj.allHp)
					obj.allHp = obj.nowHp;
				for (var i = 0; i < Heroes[1 - soldierRet.kind].length; i++){
					var p = getDis(soldierRet.positionX, soldierRet.positionY, Heroes[1 - soldierRet.kind][i]);
					if (p < getExpRadius){
						Heroes[1 - soldierRet.kind][i].exp += soldierRet.makeExp;
					}
				}
			}
		}
		return soldierRet;
	}
};
function checkHeroAttackKind(kind){																						//判断当前英雄行动的类型
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
function getBuff(str, buff){																							//获取str属性的buff加成总和
	var s = 0;
	for (var i = 0; i < buff.length; i++)
		if (str in buff[i])
			s += buff[i][str];
	return s;
}

function checkHit(x1,y1,x2,y2,l,a,b,r){																					//判断一条粗线段和一个圆是否相交
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

var heroClass ={															//玩家控制英雄的对象
	createNew : function(px, py, kindHero, name){
		var heroRet = {};
		heroRet.idType = 'Hero';
		heroRet.name = name;
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
		heroRet.speed = speedLevel[0];														//移动速度
		heroRet.exp = 0;														//英雄的经验
		heroRet.level = 0;														//英雄的等级
		heroRet.makeExp = heroMakeExp;
		heroRet.makeHp = heroMakeHp;
		heroRet.nowAction = 0;
		heroRet.killSoldiers = 0;												//杀兵的数量
		heroRet.killHeroes = 0;													//杀英雄的数量
		heroRet.skills = [{attack : attackLevel[0], attackRadius : heroAttackRadius, attackInterval : Math.round(heroAttackInterval / frameTime), attackWait : 0},
					   {attackRate:skill1AttackLevel[0], speedRate:skill1SpeedLevel[0], attackInterval : Math.round(skill1CDLevel[0] / frameTime), buffLast:Math.round(skill1BuffLevel[0] / frameTime), attackWait:0},
					   {attackRate:skill2AttackLevel[0], attack:0, attackInterval:Math.round(skill2CDLevel[0] / frameTime), attackWait:0, attackRadius:heroSkill2Radius},
					   {attackRate:skill3AttackLevel[0],attack:0, attackInterval:Math.round(skill3CDLevel[0] / frameTime), attackWait:0, attackBorder:heroSkill3Border, targetX:0, targetY:0, positionX:0, positionY:0, attackSpeed : heroSkill3Speed}];
		heroRet.buff = [];														//当前buff
		heroRet.allHp = HpLevel[0];
		heroRet.nowHp = heroRet.allHp;
		heroRet.deathCD = Math.round(deathLevel[0] / frameTime);
		heroRet.nowDeathCD = -1;
		heroRet.pastX = 0;														//大招时前一个点的坐标
		heroRet.pastY = 0;
		heroRet.action = {kind:12 - kindHero, frame:0};							//当前行为
		heroRet.target = null;													//当前正在攻击的对象
		heroRet.positionObj = null;												//当前正在追逐的对象(右键点击)只能为敌对对象
		heroRet.positionTo = null;												//当前正在追逐的点(右键点击)
		heroRet.perform = function(kind, kind0){										//玩家控制英雄的行为
			heroRet.action.frame = (heroRet.action.frame + 1) % actionFlash[heroRet.action.kind].len;						//画面播放帧数增加
			for (var i = 0; i < heroRet.buff.length; i++){																	//buff的持续时间减少
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
				if (checkHeroAttackKind(heroRet.action.kind) == 2){												//技能二造成范围伤害

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
			if (kind == 1 || kind0 != 0){																				//非玩家控制英雄获取AI操作
				heroRet.getAI(kind);
			}
			if (heroRet.positionObj != null && heroRet.positionObj.nowHp <= 0)
				heroRet.positionObj = null;
			if (checkHeroAttackKind(heroRet.action.kind) < 0){														//当前为非进攻状态时
				if (heroRet.nowAction == 1 && heroRet.skills[1].attackWait == 0){									//如有技能1的指令且无CD则执行，增加buff
					fighter_q.play();
					heroRet.buff.push({attack:heroRet.skills[0].attack * heroRet.skills[1].attackRate, speed:heroRet.speed * heroRet.skills[1].speedRate, buffLast:heroRet.skills[1].buffLast});
					heroRet.skills[1].attackWait = heroRet.skills[1].attackInterval;
					heroRet.nowAction = 0;
				}
				else if (heroRet.nowAction == 2 && heroRet.skills[2].attackWait == 0){								//如有技能2的指令且无CD则执行
					fighter_w.play();
					heroRet.action.kind = 21;
					heroRet.action.frame = 0;
					heroRet.skills[2].attackWait = heroRet.skills[2].attackInterval;
					heroRet.skills[2].attack = heroRet.skills[0].attack * (1 + heroRet.skills[2].attackRate);
					heroRet.nowAction = 0;
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
					}				}
				else if (heroRet.nowAction == 3 && heroRet.skills[3].attackWait == 0){								//如有技能3的指令且无CD则执行
					fighter_e.play();
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
					var p = 10000 , q = 10000;																		//调整目标点的位置
					if (nowMouseX != px)
						p =  Math.abs(3600 / (nowMouseX - px));
					if (nowMouseY != heroRet.positionY)
						q =  Math.abs(600 / (nowMouseY - py));
					if (q < p) p = q;
					heroRet.skills[3].targetX = nowMouseX + (nowMouseX - px) * q;
					heroRet.skills[3].targetY = nowMouseY + (nowMouseY - py) * q;
					heroRet.skills[3].attack = heroRet.skills[0].attack * (1 + heroRet.skills[3].attackRate);
					heroRet.nowAction = 0;
				}
				else if (heroRet.positionObj != null){																			//当前有追逐对象时
					var temObj = heroRet.positionObj;
					var p = getDis(heroRet.positionX, heroRet.positionY, temObj);
					if (p < heroRet.skills[0].attackRadius + 1){																//在攻击范围内则攻击
						if (heroRet.skills[0].attackWait === 0){
							fighter_a.play();																					//无CD时间时开始攻击
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
			else if (checkHeroAttackKind(heroRet.action.kind) == 3 && heroRet.action.frame >= 2){							//当为技能3的攻击状态时，则继续发射光线
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
		heroRet.getAI = function(kind){								//电脑AI的行为
			heroRet.positionTo = null;
			heroRet.positionObj = null;
			heroRet.nowAction = 0;
			if (heroRet.nowHp <= 0.2 * heroRet.allHp){
				if (kind == 1)
					heroRet.positionTo = {x:3500, y:400};
				else
					heroRet.positionTo = {x:100, y:400};
				return;
			}
			if (((kind == 1 && heroRet.positionX > 3600 - addBloodRadius)||(kind == 0 && heroRet.positionX < addBloodRadius)) && heroRet.nowHp < heroRet.allHp){
				return;
			}
			var minDis = 100000000, minObj;
			for (var i = 0; i < Soldiers[1 - kind].length; i++){																						//以下为获取距当前对象最近的敌对对象
				var p = getDis(heroRet.positionX, heroRet.positionY, Soldiers[1 - kind][i]);
				if (p < minDis && Soldiers[1 - kind][i].nowHp > 0){
					minDis = p;
					minObj = Soldiers[1 - kind][i];
				}
			}
			for (var i = 0; i < Towers[1 - kind].length; i++){
				var p = getDis(heroRet.positionX, heroRet.positionY, Towers[1 - kind][i]);
				if (p < minDis && Towers[1 - kind][i].nowHp > 0){
					minDis = p;
					minObj = Towers[1 - kind][i];
				}
			}
			for (var i = 0; i < Heroes[1 - kind].length; i++){
				var p = getDis(heroRet.positionX, heroRet.positionY, Heroes[1 - kind][i]);
				if (p < heroRet.skills[3].attackSpeed * 5 && heroRet.skills[3].attackWait == 0)
				{
					nowMouseX = Heroes[1-kind][i].positionX;
					nowMouseY = Heroes[1-kind][i].positionY;
					heroRet.nowAction = 3;
					return;
				}
				if (p < minDis && Heroes[1 - kind][i].nowHp > 0){
					minDis = p;
					minObj = Heroes[1 - kind][i];
				}
			}
			var p = getDis(heroRet.positionX, heroRet.positionY, baseCamp[1 - kind]);
			if (p < minDis && baseCamp[1 - kind].nowHp > 0){
				minDis = p;
				minObj = baseCamp[1 - kind];
			}
			if (minDis < heroRet.skills[2].attackRadius && heroRet.skills[2].attackWait == 0){
				heroRet.nowAction = 2;
				return;
			}
			heroRet.positionObj = minObj;
			if (heroRet.skills[1].attackWait == 0){
				heroRet.nowAction = 1;
			}
			
		}
		heroRet.attacked = function(attackNum, obj){							//收到伤害
			if (heroRet.nowHp <= 0)
				return;
			heroRet.nowHp -= attackNum;
			if (heroRet.nowHp <= 0){																					//当英雄死亡时，给周围英雄加经验
				obj.nowHp += heroRet.makeHp;
				if (obj.idType == 'Hero')
					obj.killHeroes++;
				if (obj.nowHp > obj.allHp)
					obj.allHp = obj.nowHp;
				for (var i = 0; i < Heroes[1 - heroRet.kind].length; i++){
					var p = getDis(heroRet.positionX, heroRet.positionY, Heroes[1 - heroRet.kind][i]);
					if (p < getExpRadius){
						Heroes[1 - heroRet.kind][i].exp += heroRet.makeExp;
					}
				}
			}
		}
		return heroRet;
	}
};



var towerClass ={									//塔的对象
	createNew : function(px, py, qx, qy,pleft,pright,ptop,pbuttom,pradius,picx,picy, id, kindType){
		var towerRet = {};
		towerRet.idType = id;
		towerRet.kind = kindType;
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
		towerRet.attack = towerAttack;										//攻击为持续攻击
		towerRet.target = null;												//攻击对象
		towerRet.makeExp = towerMakeExp;									//提供经验
		towerRet.makeHp = towerMakeHp;
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
			if (towerRet.nowHp <= 0)
				return;
			towerRet.nowHp -= attackNum;
			if (towerRet.nowHp <= 0){																					//当英雄死亡时，给周围英雄加经验
				obj.nowHp += towerRet.makeHp;
				if (obj.nowHp > obj.allHp)
					obj.allHp = obj.nowHp;
				for (var i = 0; i < Heroes[1 - towerRet.kind].length; i++){
					var p = getDis(towerRet.positionX, towerRet.positionY, Heroes[1 - towerRet.kind][i]);
					if (p < getExpRadius){
						Heroes[1 - towerRet.kind][i].exp += towerRet.makeExp;
					}
				}
			}
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
		campRet.allHp = campAllHp;
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
			if (Towers[campRet.kind].length > 0)
				return;
			campRet.nowHp -= attackNum;
			if (campRet.nowHp <= 0){								//大本营没血时游戏结束
				gameOver(campRet.kind);
			}
		}
		return campRet;
	}
};

window.onmousemove = function(e) {	
	if (window.event) e = window.event;
		xm = (e.x || e.clientX) - (nx  * .5) + dim * .5;
		ym = (e.y || e.clientY) - (ny * .5) + dim * .5;												//鼠标移动事件的响应，用于靠左、靠右移动画面
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
window.onkeydown = function(e){																	//键盘事件响应,'q','w','e'放技能，‘space’返回到英雄位置
	if (e.keyCode == 81){
		Heroes[0][0].nowAction = 1;
	}
	else if (e.keyCode == 87){
		Heroes[0][0].nowAction = 2;
		Heroes[0][0].positionObj = null;
		Heroes[0][0].positionTo = null;
	}
	else if (e.keyCode == 69){
		Heroes[0][0].nowAction = 3;
		Heroes[0][0].positionObj = null;
		Heroes[0][0].positionTo = null;
	}
	else if (e.keyCode == 32){
		allPicLeft = Heroes[0][0].positionX - 600;
		if (allPicLeft < 0)
			allPicLeft = 0;
	}
	else if (e.keyCode == 82){					//r
		flagDebug1 = !flagDebug1;
	}
	else if (e.keyCode == 84){					//t
		flagDebug2 = !flagDebug2;
	}
}
CanvasCopy.onmousedown = function(e) {													//鼠标点击事件的响应
   	var tx = e.pageX - CanvasCopy.getBoundingClientRect().left  + allPicLeft;
	var ty = e.pageY - CanvasCopy.getBoundingClientRect().top;
    if (e.button==2)																	//鼠标右击为英雄的移动攻击
    {
		var clickObj = getClickObj(tx, ty, 1);
		Heroes[0][0].nowAction = 0;
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
	Heroes[0].push(heroClass.createNew(100, 400, 0, 'Player'));																	//加入英雄
	Heroes[1].push(heroClass.createNew(3500, 400, 1, 'Computer 1'));																	//加入英雄
	Heroes[0].push(heroClass.createNew(100, 360, 0, 'Computer 3'));																	//加入英雄
	Heroes[1].push(heroClass.createNew(3500, 440, 1, 'Computer 2'));																	//加入英雄
	MyInterval = setInterval(cycleOperation, frameTime);					//计时函数

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
	for (var k = 0; k < 2; k++)										//两方英雄行动
		for (var i = 0; i < Heroes[k].length; i++){
			Heroes[k][i].perform(k, i);
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
	checkMargin();													//调整非法移动
	checkAddLevel();												//判断等级增加
	changeBar(Heroes[0][0]);
	paintOn();														//绘制图形
}
function changeBar(obj){
	$('#string').text(obj.name);
	if (obj.buff.length > 0)
		$('#level').text('Speed:'+Math.round(obj.speed+obj.buff[0].speed)+'(+'+Math.round(obj.buff[0].speed));
	else
		$('#level').text('Speed:'+Math.round(obj.speed));
	if (obj.buff.length > 0)
		$('#ad').text('Attack:'+Math.round(obj.skills[0].attack+obj.buff[0].attack)+'(+'+Math.round(obj.buff[0].attack));
	else
		$('#ad').text('Attack:'+Math.round(obj.skills[0].attack));
	$('#hp').text('HP:'+obj.nowHp +'/'+obj.allHp);
	
	$('#buff').text('level:'+ obj.level +' (' + obj.exp + '/' + expLevel[obj.level] + ')');
	$('#q_cd').text(Math.round(obj.skills[1].attackWait * frameTime / 1000));
	$('#w_cd').text(Math.round(obj.skills[2].attackWait * frameTime / 1000));
	$('#e_cd').text(Math.round(obj.skills[3].attackWait * frameTime / 1000));
	$('#kkk1').text('Kill Soldiers: ' + obj.killSoldiers);
	$('#kkk2').text('Kill Heroes: ' + obj.killHeroes);
}
function checkAddLevel(){
	for (var k = 0; k < 2; k++)
		for (var i = 0; i < Heroes[k].length; i++)
			if (Heroes[k][i].level < levelMax - 1 && Heroes[k][i].exp >= expLevel[Heroes[k][i].level]){
				Heroes[k][i].level++;
				var l = Heroes[k][i].level;
				Heroes[k][i].speed = speedLevel[l];
				Heroes[k][i].allHp = HpLevel[l];
				Heroes[k][i].nowHp += HpLevel[l] - HpLevel[l - 1];
				Heroes[k][i].deathCD = Math.round(deathLevel[l] / frameTime);
				Heroes[k][i].skills[0].attack = attackLevel[l];
				Heroes[k][i].skills[1].attackRate = skill1AttackLevel[l];
				Heroes[k][i].skills[1].speedRate = skill1SpeedLevel[l];
				Heroes[k][i].skills[1].attackInterval = Math.round(skill1CDLevel[l] / frameTime);
				Heroes[k][i].skills[1].buffLast = Math.round(skill1BuffLevel[l] / frameTime);
				Heroes[k][i].skills[2].attackRate = skill2AttackLevel[l];
				Heroes[k][i].skills[2].attackInterval = Math.round(skill2CDLevel[l] / frameTime);
				Heroes[k][i].skills[3].attackRate = skill3AttackLevel[l];
				Heroes[k][i].skills[3].attackInterval = Math.round(skill3CDLevel[l] / frameTime);
			}
		
}
function checkDead(){													//判断对象死亡
	for (var k = 0; k < 2; k++)
		for (var i = 0; i < Soldiers[k].length; i++){
			if (Soldiers[k][i].nowHp <= 0){
				if (Soldiers[k][i].action.kind != 17 && Soldiers[k][i].action.kind != 18){
					Soldiers[k][i].action.kind = 17 + Soldiers[k][i].action.kind % 2;
					Soldiers[k][i].action.frame = 0;
				}
				else if (Soldiers[k][i].action.frame === 0){			//完成死亡动画后删去对象
					Soldiers[k].splice(i, 1);
					i--;
				}
			}
		}
	for (var k = 0; k < 2; k++)											//塔毁灭后删去，加入到被删去的塔中
		for (var i = 0; i < Towers[k].length; i++){
			if (Towers[k][i].nowHp <= 0){
				destroyedTowers[k].push(Towers[k][i]);
				Towers[k].splice(i, 1);
				i--;
			}
		}
	for (var k = 0; k < 2; k++)											//英雄死亡
		for (var i = 0; i < Heroes[k].length; i++){
			if (Heroes[k][i].nowHp <= 0){								//开始播放死亡效果
				if (Heroes[k][i].action.kind != 15 && Heroes[k][i].action.kind != 16 && Heroes[k][i].nowDeathCD < 0){
					Heroes[k][i].action.kind = 15 + Heroes[k][i].action.kind % 2;
					Heroes[k][i].action.frame = 0;
					Heroes[k][i].nowDeathCD = Heroes[k][i].deathCD;
				}
				else if (Heroes[k][i].nowDeathCD >= 0){	
					Heroes[k][i].nowDeathCD--;
					if (Heroes[k][i].nowDeathCD < 0){						//复活
						Heroes[k][i].nowHp = Heroes[k][i].allHp;
						Heroes[k][i].action.kind = 12 - k;
						Heroes[k][i].action.frame = 0;
					}
					if ((Heroes[k][i].action.kind === 15 || Heroes[k][i].action.kind === 16)&& Heroes[k][i].action.frame == 0){		//死亡动画结束时回到泉水
						Heroes[k][i].positionObj = null;
						Heroes[k][i].positionTo = null;
						Heroes[k][i].positionY = 400;
						if (k == 0)
							Heroes[k][i].positionX = 150;
						else
							Heroes[k][i].positionX = 3450;
						if (k == 0 && i == 0)
							allPicLeft = 0;
						Heroes[k][i].action.kind = 12 - k;
					}
				}
			}
			else if ((k == 0 && Heroes[k][i].positionX <= addBloodRadius)||(k == 1 && Heroes[k][i].positionX >= 3600 - addBloodRadius)){		//在泉水内回血
				Heroes[k][i].nowHp = Math.round(Heroes[k][i].nowHp + Heroes[k][i].allHp * addBloodRate);
				if (Heroes[k][i].nowHp > Heroes[k][i].allHp)
					Heroes[k][i].nowHp = Heroes[k][i].allHp;
			}
		}
}
function adjustPosition(obj){											//调整位置
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
function checkMargin(){													//判断边缘，用于小兵、英雄与塔之间
	for (var k = 0; k < 2; k++)
		for (var i = 0; i < Soldiers[k].length; i++){
			adjustPosition(Soldiers[k][i]);
		}
	for (var k = 0; k < 2; k++)
		for (var i = 0; i < Heroes[k].length; i++){
			adjustPosition(Heroes[k][i]);
		}
}

function drawTowerAttack(drawObj){										//防御塔的攻击效果
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


function drawNowHp(drawObj){//推荐英雄血量在700-2000之间			每种对象的血量
	var bloodheight = 5;
	var headtoblood = 10;
	var bloodhalfwidth = drawObj.left + 16;
	if(drawObj.idType === 'Hero')
	{
		bloodheight = 16;
		cxt.fillStyle = 'rgb(69,79,81)';
		cxt.fillRect(drawObj.positionX - bloodhalfwidth - allPicLeft, drawObj.positionY  - drawObj.top - bloodheight - headtoblood, 2 * bloodhalfwidth, bloodheight);//allHp
		var rate = drawObj.nowHp / drawObj.allHp;

		if(drawObj.kind === 0)
			cxt.fillStyle = 'rgb(26,184,63)';
		else if(drawObj.kind === 1)
			cxt.fillStyle = 'rgb(255,10,67)';
		var hundrednum = Math.round(drawObj.nowHp / 100);
		var nowHpWidth = (2 * bloodhalfwidth) * rate;
		cxt.fillRect(drawObj.positionX - bloodhalfwidth - allPicLeft, drawObj.positionY  - drawObj.top - bloodheight - headtoblood, nowHpWidth, bloodheight);//nowHp
		cxt.fillStyle = 'rgb(2,64,85)';
		cxt.strokeStyle = 'rgb(245,251,42)';
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
		cxt.font="20px Arial";
		cxt.fillText('Lv. ' + drawObj.level + " " + drawObj.name,drawObj.positionX - bloodhalfwidth - allPicLeft  + 5,drawObj.positionY  - drawObj.top - bloodheight - headtoblood - 5);

	}
	else
	{
	cxt.fillStyle = 'rgb(69,79,81)';
	cxt.fillRect(drawObj.positionX - drawObj.left - allPicLeft, drawObj.positionY  - drawObj.top - bloodheight - headtoblood, drawObj.left + drawObj.right, bloodheight);//allHp
	var rate = drawObj.nowHp / drawObj.allHp;
	if(drawObj.nowHp < 0)
	{
		rate = 0;
	}
	cxt.fillStyle = 'rgb(26,184,63)';
	if(drawObj.kind === 0)
			cxt.fillStyle = 'rgb(26,184,63)';
		else if(drawObj.kind === 1)
			cxt.fillStyle = 'rgb(255,10,67)';
	cxt.fillRect(drawObj.positionX - drawObj.left - allPicLeft, drawObj.positionY  - drawObj.top - 15, (drawObj.left + drawObj.right) * rate, 5);//nowHp
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
	allObject.sort(checkSort);										//所有对象按Y坐标排序，用于处理图像的层叠效果
	var img1 = allImg[allImg.length - 3];
	cxt.drawImage(img1, 0 - allPicLeft, 0);
	for (var k = 0; k < 2; k++)										//绘制塔的攻击效果
		for (var i = 0; i < Towers[k].length; i++)
			if (Towers[k][i].target != null)
				drawTowerAttack(Towers[k][i]);
	drawNowHp(baseCamp[0]);											//绘制大本营血量
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
				if (allObject[i].buff.length > 0){								//有buff时展现不同的攻击效果
					img= actionFlash[allObject[i].action.kind + 14].src[0][allObject[i].action.frame];
					if (allObject[i].action.frame == actionFlash[allObject[i].action.kind + 14].len - 1)
						allObject[i].buff.splice(0, 1);
				}
			}
			else if (checkHeroAttackKind(allObject[i].action.kind) == 2){		//技能二绘制叠加效果图
				var img1 = actionFlash[22].src[0][allObject[i].action.frame];
				cxt.drawImage(img1, allObject[i].positionX - 289 - allPicLeft, allObject[i].positionY - 416);
			}
			else if (checkHeroAttackKind(allObject[i].action.kind) == 3 && allObject[i].action.frame >= 2){		//技能三绘制光线
				var px = allObject[i].positionX, py = allObject[i].positionY - 111;
				if (allObject[i].action.kind % 2 == 1)
					px -= 16;
				else px += 30;
				cxt.beginPath();
				var grd=cxt.createRadialGradient(75,50,5,90,60,100);
				grd.addColorStop(0,"red");
				grd.addColorStop(1,"rgb(255,255,0)");
				cxt.strokeStyle=grd;
				cxt.shadowBlur=20;
				cxt.shadowColor="white";
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
		if (allObject[i].nowHp > 0)						//绘制血量条
			drawNowHp(allObject[i]);
		else if (allObject[i].idType == 'Hero' && allObject[i].nowDeathCD >=0 ){
			cxt.font="20px Arial";
			cxt.strokeStyle = 'rgb(245,251,42)';
			cxt.fillText('剩余复活时间：'+Math.round(allObject[i].nowDeathCD * frameTime / 1000), allObject[i].positionX - allPicLeft - 32, allObject[i].positionY - allObject[i].top);
		}
		cxt.drawImage(img, allObject[i].positionX - allObject[i].picX - allPicLeft, allObject[i].positionY - allObject[i].picY);
		cxt.strokeStyle="#0000ff";
		if (flagDebug2)
			cxt.strokeRect(allObject[i].positionX - allObject[i].left - allPicLeft, allObject[i].positionY - allObject[i].top,allObject[i].right + allObject[i].left,allObject[i].bottom + allObject[i].top);
		cxt.beginPath();
		if (flagDebug1)
			cxt.arc(allObject[i].positionX - allPicLeft, allObject[i].positionY, allObject[i].positionRadius,0,  Math.PI*2, true);
		cxt.stroke();
	}
	cxtCopy.drawImage(myCanvas, 0, 0);
}
