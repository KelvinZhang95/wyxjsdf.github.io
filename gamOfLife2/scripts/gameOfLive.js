/*处理游戏逻辑和绘制图形*/
var board, board_copy;
var dom_canvas, dom_div, cxt;
var now_status = 1;
var ceilW, ceilH, ceilRadius, n, m;
var timeInterval = parseInt(document.getElementById("speedRange").value);
var cellDensity;

var dx = [0, 0, 1, -1, 0, 0, 2, -2];
var dy = [1, -1, 0, 0, 2, -2, 0, 0];

function initial(){		//初始化网格
	var ceil = parseInt(document.getElementById("sizeRange").value);
	ceilW = ceil;
	ceilH = ceil;
	ceilRadius = ceil / 2;
	dom_canvas = document.getElementById('drawRec');
	dom_div = document.getElementById('divCanvas');
	dom_canvas.width = dom_div.clientWidth;
	dom_canvas.height = dom_div.clientHeight;
	cxt = dom_canvas.getContext('2d');
	n = parseInt(dom_div.clientWidth / ceilW);
	m = parseInt(dom_div.clientHeight / ceilH);
	board = new Array(n);
	board_copy = new Array(n);
	for (var i = 0; i < n; i++){
		board[i] = new Array(m);
		board_copy[i] = new Array(m);
		for (var j = 0; j < m; j++)
			board[i][j] = 0;
	}
}

function initial_content(){
	cellDensity = parseInt(document.getElementById("cellRange").value);
	for (var i = 0; i < n; i++){
		for (var j = 0; j < m; j++)
			if (board[i][j] != 2){
			board[i][j] = Math.random() * 100;
			if (board[i][j] < cellDensity)
				board[i][j] = 1;
			else
				board[i][j] = 0;
		}
	}
}

function transform(){		//状态变换
	for (var i = 0; i < n; i++){
		for (var j = 0; j < m; j++)
			if (board[i][j] != 2){
			var s = 0;
			for (var k = 0; k < 8; k++){
				var x = i + dx[k], y = j + dy[k];
				x = (x + n) % n;
				y = (y + m) % m;
				if (board[x][y] == 1)
					s++;
			}
			if (s == 3)
				board_copy[i][j] = 1;
			else if (s != 2)
				board_copy[i][j] = 0;
			else board_copy[i][j] = board[i][j];
		}
		else
			board_copy[i][j] = board[i][j];
	}
	for (var i = 0; i < n; i++)
		for (var j = 0; j < m; j++)
			board[i][j] = board_copy[i][j];
}

function paint(){		//绘图
	cxt.clearRect(0, 0, dom_canvas.clientWidth, dom_canvas.clientHeight);
	for (var i = 0; i < n; i++){
		for (var j = 0; j < m; j++){
			if (board[i][j] == 1)
				cxt.fillStyle = "lightblue";
			else if (board[i][j] == 2)
				cxt.fillStyle = "black";
			else
				cxt.fillStyle = "white";
			cxt.beginPath();
			cxt.fillRect(i * ceilW, j * ceilH, ceilW, ceilH);
			cxt.closePath();
			cxt.fill();
			cxt.strokeRect(i * ceilW, j * ceilH, ceilW, ceilH);
		}
	}
}


function gameLoop() {	//定时函数
	paint();
	if (now_status)
		transform();
	setTimeout(gameLoop, 5000 / timeInterval);
}

initial();
initial_content();
gameLoop();

document.getElementById("refreshMap").onclick = function(){
	now_status = 1;
	var ceil = parseInt(document.getElementById("sizeRange").value);
	if (ceil != ceilH)
		initial();
	initial_content();
}

document.getElementById("setWall").onclick = function(){
	now_status = 0;
	initial();
	for (var i = 0; i < n; i++){
		for (var j = 0; j < m; j++)
			board[i][j] = 0;
		}
	paint();
}


document.getElementById("speedRange").onchange = function(){
	timeInterval = parseInt(document.getElementById("speedRange").value);
}


dom_canvas.onmouseup = function(e) {
	if (now_status)
		return;
	var tx = e.pageX - dom_canvas.getBoundingClientRect().left;
	var ty = e.pageY - dom_canvas.getBoundingClientRect().top;
	var x = parseInt(tx / ceilW);
	var y = parseInt(ty / ceilH);
	if (e.button == 2){
		board[x][y] = 0;
	}
	else{
		board[x][y] = 2;
	}
	paint();
}