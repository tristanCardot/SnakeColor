/**Permet la création de map et gére le test direct d'une map.
 * @constructor
 */
function Builder(){
	this.buildArea = [];
	this.height = 10;
	this.width = 10;

	this.dotCount = 0;
	this.gold = 0;
	this.silver = 0;
	this.copper = 0;

	this.spawn = {x:0, y:0};

	this.mouse = {
		isDown : false,
		downX : 0,
		downY : 0,
		posX : 0,
		posY : 0
	};

	this.activeNode;
	this.selectedColor = 0;
	this.selectedDir = 0;
	this.selectedType = TYPE.GROUND;
	this.selectedId = 0;

	var rules = document.getElementById('style').sheet.cssRules;
	this.ruleGeo = rules[0].style;
	this.ruleFrame = rules[1].style;

	var self = this;
	// créer les évenement lié à la souris.
	this.mouseMove = function(e){
		if(!self.mouse.isDown)
			return;

		var scale = renderManager.cam.position.y /SCREENY;
		var pos = renderManager.cam.position;
		pos.x += (self.mouse.posX -e.clientX) *scale;
		pos.z += (self.mouse.posY -e.clientY) *scale;

		if(pos.x < -1)
			pos.x = -1;
		else if(pos.x > self.width+1)
			pos.x = self.width+1;

		if(pos.z < -1)
			pos.z = -1;
		else if(pos.z > self.height+1)
			pos.z = self.height+1;

		self.mouse.posX = e.clientX;
		self.mouse.posY = e.clientY;
		renderManager.renderFrame();
	};

	this.mouseDown = function(e){
		self.mouse.isDown = true;
		self.mouse.posX = self.mouse.downX = e.clientX;
		self.mouse.posY = self.mouse.downY = e.clientY;
	};

	this.mouseUp = function(e){
		if(e.target.localName === 'canvas' && self.mouse.posX === self.mouse.downX && self.mouse.posY === self.mouse.downY){
			var pos = getGridPos(self.mouse.posX, self.mouse.posY);

			if(pos.x>-1 && pos.x<self.width && pos.y>-1 && pos.y<self.height)
				self.updatePos(self.selectedId, pos.x, pos.y);
		}

		renderManager.renderFrame();
		self.mouse.isDown = false;
	};

	window.addEventListener('load', function(){
		self.bindBuildBox(self);
	}, false);
}

Builder.prototype = {
	/**Lie les évements lié à la créations de map au différents elements du DOM.
	 *@param {Builder} self
	 */
	bindBuildBox : function(self){
		document.getElementById('craftColor').addEventListener('click', function(e){
			var color = e.target.className.split(' ')[0];

			if(COLOR[color] === undefined)
				return;

			self.selectedColor = COLOR[color];
			self.updateSelectedId();

			var last = this.getElementsByClassName('select')[0];
			last.className = last.className.split(' ')[0];

			e.target.className = color +' select';
		}, false);

		document.getElementById('craftDir').addEventListener('click', function(e){
			var dir = parseInt( e.target.dataset.dir );
		window.spanS = e.target;
			if(isNaN(dir) || dir>4)
				return;

			self.selectedDir = dir;
			self.updateSelectedId();

			this.getElementsByClassName('select')[0].className = '';

			e.target.className = 'select';
		}, false);

		document.getElementById('craftGeo').addEventListener('click', function(e){
			var off = Math.floor(e.offsetX/60)*60;
			self.ruleFrame.left = off +'px';
			self.ruleGeo.backgroundPosition = '-'+ off +'px 0px';

			off /= 60;
			switch(off){
				case 0: case 1: self.selectedType = off;
					break;
				case 2: self.selectedType = TYPE.SWAPER;
					break;
				case 3: self.selectedType = TYPE.DOT;
					break;
				case 4: self.selectedType = TYPE.SNAKE;
					break;
				case 5: self.selectedType = TYPE.CAMROTATOR;
					break;
				case 6: self.selectedType = TYPE.ARROW;
					break;
				case 7: self.selectedType = TYPE.BANNED;
			}
			 
			self.updateSelectedId();
		}, false);

		self.ruleGeo.background = 'url('+ self.getBGGeo() +')';
	},

	/**Crée l'image servant de font aux choix du type de géométry
	 * @return {String}
	 */
	getBGGeo : function(){
		var canvas = document.createElement('canvas');
		canvas.height = 60;
		canvas.width = 480;
		var ctx = canvas.getContext('2d');
		ctx.fillRect(0,0,480,60);

		var list = [
			['#aaa',5,40, 27,50, 54,40, 32,30],

			['#aaa',87,30, 114,20, 92,10, 65,20],
			['#888',65,20, 65,45, 87,55, 87,30],
			['#555',87,30, 87,55, 114,45, 114,20],

			['#aaa',152,30, 125,40, 137,40, 152,34],
			['#888',152,30, 152,34, 163,40, 174,40],
			['#333',174,40, 163,40, 147,46, 147,50],
			['#555',147,50, 147,46, 137,40, 125,40],

			['#aaa',204,27, 212,27, 216,23, 208,23],
			['#888',212,27, 204,27, 204,35, 212,35],
			['#555',216,23, 212,27, 212,35, 216,31],

			['#aaa',264,27, 272,27, 281,18, 273,18],
			['#888',272,27, 264,27, 264,35, 272,35],
			['#555',281,18, 272,27, 272,35, 281,26],

			['#aaa',332,4, 318,18, 332,32, 328,18],
			['#888',327,27, 331,41, 327,55, 341,41],

			['#aaa',389,11, 376,24, 389,24, 402,24],
			['#aaa',385,24, 385,47, 393,47, 393,24],

			['#aaa',429,2, 422,9, 470,57, 477,50],
			['#aaa',470,2, 422,50, 429,57, 477,9]
		];

		for(var i=0, s; i<list.length; i++){
			s = list[i];
			ctx.fillStyle =s[0];

			ctx.beginPath();
				ctx.moveTo(s[1], s[2]);
				ctx.lineTo(s[3], s[4]);
				ctx.lineTo(s[5], s[6]);
				ctx.lineTo(s[7], s[8]);
			ctx.fill();
			ctx.closePath();
		}

		return canvas.toDataURL(canvas.toDataURL());
	},

	/** génére les données lié au niveau crée.
	 * @return {String}
	 */
	export : function(){
		if(this.dotCount === 0){
			history.pushState({}, "SnakeCustom", location.pathname);
			return '-----';
		}

		var list = [
			this.height, this.width,
			this.spawn.x, this.spawn.y,
			this.dotCount&63, this.dotCount>>6,
			this.gold&63, this.gold>>6,
			this.silver&63, this.silver>>6,
			this.copper&63, this.copper>>6
		];

		for(var i=0, j; i<this.buildArea.length; i++)
			for(j=0; j<this.buildArea[i].length; j++)
				list.push(this.buildArea[i][j].data);

		list[this.spawn.x *this.height +this.spawn.y  +12] = 0;

		var result = arrayToString(list);

		history.pushState({}, "SnakeCustom", location.pathname +'?'+result);
		return result;
	},

	/**Génére la map dans l'éditeur celon les données passés en paramétre.
	 * @param {String} data
	 */
	load : function(data){
		if(data !== "" && data.indexOf('-') === -1){
			data = stringToArray(data);

			this.height = data[0];
			this.width = data[1];

			this.spawn.x = data[2];
			this.spawn.y = data[3];

			this.dotCount = data[4]+ (data[5]<<6);
			this.gold = data[6]+ (data[7]<<6);
			this.silver = data[8]+ (data[9]<<6);
			this.copper = data[10]+ (data[11]<<6);

		}else{
			data = [];

			this.height = 10;
			this.width = 10;
			this.spawn.x = 0;
			this.spawn.y = 0;

			this.dotCount = 0;
			this.gold = 0;
			this.silver = 0;
			this.copper = 0;
		}

		document.getElementById('levelHeight').value = this.height;
		document.getElementById('levelWidth').value = this.width;
		this.setSize(this.height, this.width);

		for(var i=0, j; i<this.buildArea.length; i++)
			for(j=0; j<this.buildArea[i].length; j++)
				this.clearPos(this.buildArea[i][j]);

		this.buildArea = [];

		var mesh, type;
		for(var i=0, j; i<this.width; i++){
			this.buildArea.push([]);

			for(j=0; j<this.height; j++){
				type = data[i*this.height +j +12] || TYPE.GROUND;

				mesh = TYPE.LIST[ type ].mesh.clone();
				mesh.position.x = i;
				mesh.position.z = j;

				this.buildArea[i].push({data: type, meshes:[ mesh ]});

				if(type.ground !== true){
					mesh = TYPE.LIST[ TYPE.GROUND ].mesh.clone();
					mesh.position.x = i;
					mesh.position.z = j;
					this.buildArea[i][j].meshes.push(mesh);
				}
			}
		}

		this.buildArea[this.spawn.x][this.spawn.y].data = TYPE.SNAKE;

		mesh = TYPE.LIST[TYPE.SNAKE].mesh.clone();
		mesh.position.x = this.spawn.x;
		mesh.position.z = this.spawn.y;
		this.buildArea[this.spawn.x][this.spawn.y].meshes.push(mesh);
	},

	/**Mais à jour l'id choisi celon l'ensemble de données (couleur direction goé).*/
	updateSelectedId : function(){
		if(this.selectedType<3){
			this.selectedId = this.selectedType;

		}else if(TYPE.COLOR[ this.selectedType ]){
			this.selectedId = this.selectedType + this.selectedColor;

			document.getElementById('craftDir').style.display = 'none';

		}else{
			if(this.selectedType === TYPE.CAMROTATOR)
				this.selectedId = this.selectedType + (this.selectedDir%2);

			else if(this.selectedType === TYPE.ARROW)
				this.selectedId = this.selectedType + this.selectedDir;

			document.getElementById('craftDir').style.display = '';
		}
	},

	/**permet d'ajouter une mesh (éditeur)
	 * @param {number} id
	 * @param {number} x
	 * @param {number} y
	 */
	addMesh : function(id, x, y){
		var mesh = TYPE.LIST[id].mesh.clone();
		mesh.position.x = x;
		mesh.position.z = y;

		renderManager.addMesh( mesh );
		return mesh;
	},

	/** Met à jour le type présent en x,y
	 * @param {number} typeId
	 * @param {number} x
	 * @param {number} y
	 */
	updatePos : function(typeId, x, y){
		if(x === this.spawn.x && y === this.spawn.y)
			return;

		this.clearPos(this.buildArea[x][y]);

		if(TYPE.BLOCK[typeId])
			this.buildArea[x][y].meshes.push( this.addMesh(typeId, x, y) );

		else{
			if(typeId === TYPE.SNAKE){
				if(this.spawn.x !== -1){
					var posA = this.buildArea[this.spawn.x][this.spawn.y];
					this.clearPos(posA);
					posA.meshes.push( this.addMesh(TYPE.GROUND, this.spawn.x, this.spawn.y) );
					posA.data = 0;
				}

				this.spawn.x = x;
				this.spawn.y = y;
			}

			this.buildArea[x][y].meshes.push(
				this.addMesh(TYPE.GROUND, x, y),
				this.addMesh(typeId, x, y)
			);
		}

		this.updateDotCount(typeId, x, y);
		this.buildArea[x][y].data = typeId;
	},

	/**Met à jour le nombre de points présent sur la map
	 * @param {number} typeId
	 * @param {number} x
	 * @param {number} y
	 */
	updateDotCount : function(typeId, x, y){
		if(TYPE.ISDOT[this.buildArea[x][y].data])
			this.dotCount--;
		if(TYPE.ISDOT[typeId])
			this.dotCount++;
	},

	/**changement des dimmensions de la map.
	 * @param {number} height
	 * @param {number} width
	 */
	setSize : function(height, width){
		if(this.height < height)
			for(var i=0, j; i<this.width; i++)
				for(j=this.height; j<height; j++)
					this.buildArea[i].push({data: 0, meshes:[
							this.addMesh(TYPE.GROUND, i, j)
						]});

		else if(this.height > height)
			for(var i=0, j; i<this.width; i++){
				for(j=height; j<this.height; j++){
					this.updateDotCount(TYPE.GROUND, i, j);
					this.clearPos(this.buildArea[i][j]);
				}

				this.buildArea[i].splice(height);
			}
		
		this.height = height;

		if(this.width < width)
			for(var i=this.width, j; i<width; i++){
				this.buildArea.push([]);

				for(j=0; j<this.height; j++)
					this.buildArea[i].push({data: 0, meshes:[
							this.addMesh(TYPE.GROUND, i, j)
						]});
			}

		else if(this.width > width){
			for(var i=width, j; i<this.width; i++)
				for(j=0; j<this.buildArea[i].length; j++){
					this.updateDotCount(TYPE.GROUND, i, j);
					this.clearPos(this.buildArea[i][j]);
				}

			this.buildArea.splice(width);
		}

		this.width = width;
		renderManager.renderFrame();
	},

	/**supprime le contenue d'un emplacement.
	 * @param {Object} pos
	 */
	clearPos : function(pos){
		for(var i=0; i<pos.meshes.length; i++)
			renderManager.clearMesh(pos.meshes[i]);
		pos.meshes.splice(0);
	},

	/**supprime l'ensemble des mesh lié à la création de map de la scene*/
	clearArea : function(){
		for(var i=0, j, k, pos; i<this.buildArea.length; i++)
			for(j=0; j<this.buildArea[i].length; j++)
				for(k=0; k<this.buildArea[i][j].meshes.length; k++)
					renderManager.clearMesh( this.buildArea[i][j].meshes[k] );
	},

	/**ajoute l'ensemble des mesh lié à la création de map à la scene*/
	renderArea : function(){
		for(var i=0, j, k, meshes; i<this.buildArea.length; i++)
			for( j=0; j<this.buildArea[i].length; j++){
				meshes = this.buildArea[i][j].meshes;

				for(k=0; k<meshes.length; k++)
					renderManager.addMesh(meshes[k]);
			}
	},

	/** ajout les évenements liés à la souris*/
	bindEvent : function(){
		window.addEventListener('mousedown', this.mouseDown, false);
		window.addEventListener('mouseup', this.mouseUp, false);
		window.addEventListener('mousemove', this.mouseMove, false);
	},

	/** supprime les évenements liés à la souris*/
	clearEvent : function(){
		window.removeEventListener('mousedown', this.mouseDown, false);
		window.removeEventListener('mouseup', this.mouseUp, false);
		window.removeEventListener('mousemove', this.mouseMove, false);
	}
};

/**récupére le x,y de la map celon la position de la souris et de la camera.
 * @param {number} x
 * @param {number} y 
 * @return {Object}
 */
function getGridPos(x, y){
	var offY = renderManager.cam.position.y *Math.tan(  Math.atan( (y - window.innerHeight/2) /SCREENY)  );
	var offX = renderManager.cam.position.y *Math.tan(  Math.atan( (x - window.innerWidth/2) /SCREENY)  );

	return {
		x: Math.round(renderManager.cam.position.x + offX),
		y: Math.round(renderManager.cam.position.z + offY)
	};
};
