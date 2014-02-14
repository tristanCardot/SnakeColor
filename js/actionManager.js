
function ActionManager(){
	this.active = GUI.MAIN;
	this.activeNode = null;
	this.list = [];
	this.currentLevel = 0;

	var self = this;
	window.addEventListener('load',function(){self.init(self);},false);
}

ActionManager.prototype = {
	init : function(self){
		var levelList = document.getElementById('levelList');
		var result = "";

		for(var i=0, achived="finished active", lvl, s; i<LEVELS.length; i++){
			if(save[i] === undefined)
				save.push(0);

			s = save[i*2]+(save[i*2+1]<<5);

			if(s !== 0){
				lvl = stringToArray(LEVELS[i].slice(6,12));

				if(lvl[0] +(lvl[1]<<5) > s)
					achived = 'gold';

				else if(lvl[2] +(lvl[3]<<5) > s)
					achived = 'silver';

				else if(lvl[4] +(lvl[5]<<5) > s)
					achived = 'copper';

				else
					achived = 'finished';

				achived += ' active';

			}else if(achived.length > 8)
				achived = 'active';

			else
				achived = '';

			result+="<span title='"+s+"' class='"+achived+"'>"+i+"</span>";
		}

		levelList.innerHTML = result;
		levelList.addEventListener('click', function(e){self.selectLevel(e);}, false);

		this.list = [
			document.getElementById('mainMenu'),
			document.getElementById('guiPlayer'),
			document.getElementById('inGame'),
			document.getElementById('levelSelect'),
			document.getElementById('craftBox'),
			document.getElementById('craftMenu')
		];

		document.getElementsByClassName('quit')[0].onclick = function(){
			self.setActive(GUI.MAIN, 0);
		};
		document.getElementsByClassName('quit')[1].onclick = function(){
			self.setActive(GUI.MAIN, 1);
		};
		document.getElementsByClassName('quit')[2].onclick = function(){
			self.setActive(GUI.MAIN, 2);
		};

		document.getElementsByClassName('play')[0].onclick = function(){
			self.setActive(GUI.LEVELSELECT);
		};

		document.getElementsByClassName('build')[0].onclick = function(){
			self.setActive(GUI.CRAFTBOX, 0);
		};
		document.getElementsByClassName('clear')[0].onclick = function(){
			self.setActive(GUI.CRAFTBOX, 1);
		};
		document.getElementsByClassName('load')[0].onclick = function(){
			self.setActive(GUI.CRAFTBOX, 2);
		};

		document.getElementsByClassName('resume')[0].onclick = function(){
			self.setActive(GUI.GUIPLAYER);
		};

		window.addEventListener('keydown', function(e){self.keyDown(e);}, false);

		document.getElementById('levelHeight').addEventListener('change', function(){
			var value = checkInput(this, parseInt(this.value));
			builder.setSize(value, builder.width);
		});

		document.getElementById('levelWidth').addEventListener('change', function(){
			var value = checkInput(this, parseInt(this.value));
			builder.setSize(builder.height, value);
		});

		document.getElementById('gold').addEventListener('change', function(){
			builder.gold = checkInput(this, parseInt(this.value));
		});
		document.getElementById('silver').addEventListener('change', function(){
			builder.silver = checkInput(this, parseInt(this.value));
		});
		document.getElementById('copper').addEventListener('change', function(){
			builder.copper = checkInput(this, parseInt(this.value));
		});

		snake.paused = true;
		this.activeNode = document.getElementById('mainMenu');
	},

	setActive : function(guiId, id){
		switch(guiId){
			case GUI.LEVELSELECT:
				renderManager.startUpdate();
				renderManager.setCamMode(0);

			break;
			case GUI.CRAFTBOX:
				if(id === 0){
						snake.setColor(COLOR.GREEN);
						renderManager.setCamMode(1);
						builder.bindEvent();

				}else{
					builder.clearArea();
				}

				if(id !== 4)
					builder.load( (id === 2 ? document.getElementById('levelData').value : "") );

				builder.renderArea();
				renderManager.renderFrame();

			break;
			case GUI.MAIN :
				if(id === 2){
					builder.clearArea();
					builder.clearEvent();
					renderManager.renderFrame();

				}else{
					renderManager.stopUpdate();
					renderManager.clearGrid();
					renderManager.clearGround();
					snake.clear();
				}

			break;
			case GUI.GUIPLAYER:
				snake.paused = false;
			break;
			case GUI.INGAME:
				snake.paused = true;
			break;
			case GUI.CRAFTMENU:
				document.getElementById('levelData').value = builder.export();
			break;
		}

		this.activeNode.style.display = 'none';
		this.list[guiId].style.display = '';
		this.active = guiId;
		this.activeNode = this.list[guiId];
	},

	selectLevel : function(e){
		if(e.target.localName !== 'span' || e.target.className.indexOf('active') === -1)
			return;

		var index = e.target.firstChild.data;
		this.currentLevel = index;
		map.updateData(LEVELS[index]);

		this.setActive(GUI.GUIPLAYER);
	},

	startNextLevel : function(){
		var node = document.getElementById('levelList').childNodes[this.currentLevel];
		node.className +=' finished';
		node.title = snake.moveCount;

		var score = save[this.currentLevel*2] + (save[this.currentLevel*2+1]>>5);

		if(snake.moveCount < score || score === 0){
			save[this.currentLevel*2] = snake.moveCount &31;
			save[this.currentLevel*2+1] = snake.moveCount >>5;

			localStorage.setItem('save', arrayToString(save));
		}

		this.currentLevel++;

		if(LEVELS.length > this.currentLevel){
			map.updateData(LEVELS[this.currentLevel]);
			document.getElementById('levelList').childNodes[this.currentLevel].className='active';

		}else{
			console.log('end');
			this.currentLevel = 0;
			map.updateData(LEVELS[this.currentLevel]);
		}
	},

	quit : function(){
	},

	keyDown : function(e){
		switch(e.keyCode){
			case 90: case 87: case 38:
					if(!snake.paused)
						snake.setDir(0);
				break;

			case 83: case 40:
					if(!snake.paused)
						snake.setDir(2);
				break;

			case 81: case 65: case 37:
					if(!snake.paused)
						snake.setDir(1);
				break;

			case 68: case 39:
					if(!snake.paused)
						snake.setDir(3);
				break;

			case 80: case 27:
					switch(this.active){
						case GUI.GUIPLAYER:
								this.setActive(GUI.INGAME);
							break;
						case GUI.CRAFTBOX:
								this.setActive(GUI.CRAFTMENU);
							break;
						case GUI.INGAME:
								this.setActive(GUI.GUIPLAYER);
							break;
						case GUI.CRAFTMENU:
								this.setActive(GUI.CRAFTBOX,4);
							break;
					}
				break;
		}
	}
};