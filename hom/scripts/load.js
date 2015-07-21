var actionFlash = [{len:0,kind:0},{len:6,kind:1},{len:6,kind:1},{len:6,kind:2},{len:6,kind:2},
				   {len:6,kind:1},{len:6,kind:1},{len:4,kind:2},{len:4,kind:2},{len:0,kind:0},
				   {len:0,kind:0},{len:1,kind:1},{len:1,kind:1},{len:1,kind:2},{len:1,kind:2},
				   {len:6,kind:1},{len:6,kind:1},{len:4,kind:2},{len:4,kind:2},{len:6,kind:1},
				   {len:6,kind:1},{len:10,kind:1},{len:10,kind:1},{len:10,kind:1},{len:10,kind:1}];
var allPicSrc= [];
	for (var i = 0; i < 6; i++)
		allPicSrc.push('images/fighter/fighter_run_l/' + 'Frame' + i + '.png');
	for (var i = 0; i < 6; i++)
		allPicSrc.push('images/fighter/fighter_run_r/' + 'Frame' + i + '.png');
	for (var i = 0; i < 6; i++)
		allPicSrc.push('images/xiaobing/xiaobing_run_l/blue/' + 'Frame' + i + '.png');
	for (var i = 0; i < 6; i++)
		allPicSrc.push('images/xiaobing/xiaobing_run_l/red/' + 'Frame' + i + '.png');
	for (var i = 0; i < 6; i++)
		allPicSrc.push('images/xiaobing/xiaobing_run_r/blue/' + 'Frame' + i + '.png');
	for (var i = 0; i < 6; i++)
		allPicSrc.push('images/xiaobing/xiaobing_run_r/red/' + 'Frame' + i + '.png');
	for (var i = 0; i < 6; i++)
		allPicSrc.push('images/fighter/fighter_a_l/' + 'Frame' + i + '.png');
	for (var i = 0; i < 6; i++)
		allPicSrc.push('images/fighter/fighter_a_r/' + 'Frame' + i + '.png');
	for (var i = 0; i < 4; i++)
		allPicSrc.push('images/xiaobing/xiaobing_a_l/blue/' + 'Frame' + i + '.png');
	for (var i = 0; i < 4; i++)
		allPicSrc.push('images/xiaobing/xiaobing_a_l/red/' + 'Frame' + i + '.png');
	for (var i = 0; i < 4; i++)
		allPicSrc.push('images/xiaobing/xiaobing_a_r/blue/' + 'Frame' + i + '.png');
	for (var i = 0; i < 4; i++)
		allPicSrc.push('images/xiaobing/xiaobing_a_r/red/' + 'Frame' + i + '.png');
	for (var i = 0; i < 1; i++)
		allPicSrc.push('images/fighter/fighter_stand_l/' + 'Frame' + i + '.png');
	for (var i = 0; i < 1; i++)
		allPicSrc.push('images/fighter/fighter_stand_r/' + 'Frame' + i + '.png');
	for (var i = 0; i < 1; i++)
		allPicSrc.push('images/xiaobing/xiaobing_stand_l/blue/' + 'Frame' + i + '.png');
	for (var i = 0; i < 1; i++)
		allPicSrc.push('images/xiaobing/xiaobing_stand_l/red/' + 'Frame' + i + '.png');
	for (var i = 0; i < 1; i++)
		allPicSrc.push('images/xiaobing/xiaobing_stand_r/blue/' + 'Frame' + i + '.png');
	for (var i = 0; i < 1; i++)
		allPicSrc.push('images/xiaobing/xiaobing_stand_r/red/' + 'Frame' + i + '.png');
	for (var i = 0; i < 6; i++)
		allPicSrc.push('images/fighter/fighter_die_l/' + 'Frame' + i + '.png');
	for (var i = 0; i < 6; i++)
		allPicSrc.push('images/fighter/fighter_die_r/' + 'Frame' + i + '.png');
	for (var i = 0; i < 4; i++)
		allPicSrc.push('images/xiaobing/xiaobing_die_l/blue/' + 'Frame' + i + '.png');
	for (var i = 0; i < 4; i++)
		allPicSrc.push('images/xiaobing/xiaobing_die_l/red/' + 'Frame' + i + '.png');
	for (var i = 0; i < 4; i++)
		allPicSrc.push('images/xiaobing/xiaobing_die_r/blue/' + 'Frame' + i + '.png');
	for (var i = 0; i < 4; i++)
		allPicSrc.push('images/xiaobing/xiaobing_die_r/red/' + 'Frame' + i + '.png');
	for (var i = 0; i < 6; i++)
		allPicSrc.push('images/fighter/fighter_skill01_l/' + 'Frame' + i + '.png');
	for (var i = 0; i < 6; i++)
		allPicSrc.push('images/fighter/fighter_skill01_r/' + 'Frame' + i + '.png');
	for (var i = 0; i < 10; i++)
		allPicSrc.push('images/fighter/fighter_skill02/' + 'Frame' + i + '.png');
	for (var i = 0; i < 10; i++)
		allPicSrc.push('images/fighter/fighter_skill02_add/' + 'Frame' + i + '.png');
	for (var i = 0; i < 10; i++)
		allPicSrc.push('images/fighter/fighter_skill03_l/' + 'Frame' + i + '.png');
	for (var i = 0; i < 10; i++)
		allPicSrc.push('images/fighter/fighter_skill03_r/' + 'Frame' + i + '.png');
	allPicSrc.push('images/mappic/home.png');
	allPicSrc.push('images/mappic/tower_big.png');
	allPicSrc.push('images/mappic/tower_home.png');
	allPicSrc.push('images/mappic/background.png');
	allPicSrc.push('images/mappic/tower_big_destroyed.png');
	allPicSrc.push('images/mappic/tower_home_destroyed.png');
	var allImg = [], sum = 0, flag = false;
	for (var i = 0; i < allPicSrc.length; i++){
		allImg[i] = new Image();
		allImg[i].src = allPicSrc[i];
		allImg[i].onload = function(){
			sum++;
			if (sum == (allPicSrc.length - 6) * 2 + 6){
				flag = true;
			}
		}
	}
	var sum = 0;
	for (var i = 0; i < actionFlash.length ;i++){
		actionFlash[i].src = [[],[]];
			for (var k = 0; k < actionFlash[i].kind; k++){
				for(var j = 0; j < actionFlash[i].len; j++,sum++)
					actionFlash[i].src[k].push(allImg[sum]);
				}
	}
	var img_start = new Image();
	var img_start_01 = new Image();
	img_start.src = "images/other/hom_01.png";
	img_start_01.src = "images/other/hom.png";


