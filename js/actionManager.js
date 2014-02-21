/**S'occupe de la gestion des gui et interaction (fin de partie, lancement d'un chargement)).
 * @constructor
 */
function ActionManager(){
	this.active = GUI.MAIN;
	this.activeNode = null;
	this.list = [];
	this.currentLevel = 0;
	this.testMode = false;

	var self = this;
	window.addEventListener('load',function(){self.init(self);},false);
}

ActionManager.prototype = {
	/**Permett de lier l'ensemble des évenements et d'initialiser le liste des niveaux.
	 * @param {ActionManager} self
	 */
	init : function(self){
		var levelList = document.getElementById('levelList');
		var result = "";

		for(var i=0, achived="finished active", lvl, s; i<LEVELS.length; i++){
			if(save[i] === undefined)
				save.push(0);

			s = save[i*2]+(save[i*2+1]<<6);

			if(s !== 0){
				lvl = stringToArray(LEVELS[i].slice(6,12));

				if(lvl[0] +(lvl[1]<<6) >= s)
					achived = 'gold';

				else if(lvl[2] +(lvl[3]<<6) >= s)
					achived = 'silver';

				else if(lvl[4] +(lvl[5]<<6) >= s)
					achived = 'copper';

				else
					achived = 'finished';

				achived += ' active';

			}else if(achived.length > 8)
				achived = 'active';

			else
				achived = '';

			result += "<span title='"+ (i+1) +"' class='"+ achived +"'>"+ s +"</span>";
		}

		levelList.innerHTML = result;
		levelList.addEventListener('click', function(e){self.selectLevel(e);}, false);

		this.list = [
			document.getElementById('mainMenu'),
			document.getElementById('guiPlayer'),
			document.getElementById('inGame'),
			document.getElementById('levelSelect'),
			document.getElementById('craftBox'),
			document.getElementById('craftMenu'),
			document.getElementById('tester'),
			document.getElementById('score')
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
		document.getElementsByClassName('quit')[3].onclick = function(){
			self.setActive(GUI.CRAFTBOX, 4);
		};

		document.getElementsByClassName('resume')[0].onclick = function(){
			self.setActive(GUI.GUIPLAYER, 0);
		};
		document.getElementsByClassName('tester')[0].onclick = function(){
			self.setActive(GUI.GUIPLAYER, 1);
		};

		document.getElementsByClassName('quit')[4].onclick = function(){
			self.startNextLevel();
		};

		window.addEventListener('keydown', function(e){self.keyDown(e);}, false);

		document.getElementById('levelHeight').addEventListener('change', function(){
			var value = checkInput(this, parseInt(this.value));
			builder.setSize(value, builder.width);
			builder.export();
		});

		document.getElementById('levelWidth').addEventListener('change', function(){
			var value = checkInput(this, parseInt(this.value));
			builder.setSize(builder.height, value);
			builder.export();
		});

		document.getElementById('gold').addEventListener('change', function(){
			builder.gold = checkInput(this, parseInt(this.value));
			builder.export();
		});
		document.getElementById('silver').addEventListener('change', function(){
			builder.silver = checkInput(this, parseInt(this.value));
			builder.export();
		});
		document.getElementById('copper').addEventListener('change', function(){
			builder.copper = checkInput(this, parseInt(this.value));
			builder.export();
		});


		snake.paused = true;
		this.activeNode = document.getElementById('mainMenu');

		if(window.location.search !== undefined){
			builder.load( location.search.slice(1) );
			self.setActive(GUI.GUIPLAYER, 1);

		}else
			builder.load("");
	},

	/**Permet d'activer une gui, l'id permet de spécifier le traitement pour l'ouverture de celle-ci.
	 * @param{GUI} guiId
	 * @param{Number} id
	 */
	setActive : function(guiId, id){
		switch(guiId){
			case GUI.LEVELSELECT:
				renderManager.startUpdate();
				renderManager.setCamMode(0);

			break;
			case GUI.CRAFTBOX:
				if(id === 1 || id === 2)
					builder.load( (id === 2 ? location.search.slice(1) : "") );

				else if(id === 4){
					renderManager.stopUpdate();
					renderManager.clearGrid();
					renderManager.clearGround();
					snake.clear();
					animationManager.clear();
				}

				if(id === 0 || id ===4){
						snake.setColor(COLOR.GREEN);
						renderManager.setCamMode(1);
						builder.bindEvent();

				}else
					builder.clearArea();

				builder.renderArea();
				renderManager.renderFrame();
				
				this.testMode = false;

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
				if(id === 1){
					var level = location.search.slice(1);
					if(level.length === 0)
						return;

					this.testMode = true;

					map.updateData(level);
					renderManager.startUpdate();
					renderManager.setCamMode(0);

					builder.clearArea();
					builder.clearEvent();
				}

				snake.paused = false;

			break;
			case GUI.INGAME: case GUI.TESTER:
				snake.paused = true;

			break;
			case GUI.CRAFTMENU:
				builder.export();
			break;
		}

		this.activeNode.style.display = 'none';
		this.list[guiId].style.display = '';
		this.active = guiId;
		this.activeNode = this.list[guiId];
	},

	/**Appelé quand le joueur clic sur l'un des boutons de la list des niveaux.
	 * @param{MouseEvent} e
	 */
	selectLevel : function(e){
		if(e.target.localName !== 'span' || e.target.className.indexOf('active') === -1)
			return;

		var index = parseInt(e.target.title) -1;
		this.currentLevel = index;
		map.updateData(LEVELS[index]);

		this.setActive(GUI.GUIPLAYER);
	},

	/**Passe au niveau suivant ou retour a l'éditeur de niveau dans le cas d'un niveau test.*/
	startNextLevel : function(){
		if(this.testMode){
			this.setActive(GUI.CRAFTBOX, 4);
			return;
		}

		var node = document.getElementById('levelList').childNodes[this.currentLevel];
		node.className +=' finished';
		node.firstChild.data = snake.moveCount;

		var score = save[this.currentLevel*2] + (save[this.currentLevel*2+1]>>6);

		if(snake.moveCount < score || score === 0){
			save[this.currentLevel*2] = snake.moveCount &63;
			save[this.currentLevel*2+1] = snake.moveCount >>6;

			localStorage.setItem('save', arrayToString(save));
		}

		this.currentLevel++;

		if(LEVELS.length > this.currentLevel){
			map.updateData(LEVELS[this.currentLevel]);
			var next = document.getElementById('levelList').childNodes[this.currentLevel];
			if(next.className.length === 0)
				next.className = 'active';

		}else{
			console.log('end');
			this.currentLevel = 0;
			map.updateData(LEVELS[this.currentLevel]);
		}

		this.setActive(GUI.GUIPLAYER);
	},

	/**s'occupe de la gestion des inputs claviers.
	 * @param{KeyboardEvent}
	 */
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
								if(this.testMode)
									this.setActive(GUI.TESTER);
								else
									this.setActive(GUI.INGAME);

							break;
						case GUI.CRAFTBOX:
								this.setActive(GUI.CRAFTMENU);

							break;
						case GUI.INGAME:
								this.setActive(GUI.GUIPLAYER);

							break;
						case GUI.CRAFTMENU:
								this.setActive(GUI.CRAFTBOX, 3);
							break;
						case GUI.TESTER:
								this.setActive(GUI.GUIPLAYER);
					}
				break;
		}
	}
};
