/**Représente le serpent du joueur.
 * @constructor
 */
function Snake(){
	this.pos = {x: 0, y: 0};
	this.off = {x: 0, y: 0};
	this.maxLength = 5;
	this.speed = 400;

	this.nextMove = 0;
	this.moveCount = 0;
	this.camRotation = 0;

	this.paused = true;
	this.lockedDir = false;

	this.dir = -1;
	this.parts = [];
	this.color = COLOR.GREEN;
	this.mat = TYPE.LIST[ TYPE.SNAKE].mesh.material;
	this.nodeScore = null;
}

Snake.prototype = {
	/**Permet d'ajouter 1 à la taille max du serpent.*/
	growUp : function(){
		this.maxLength++;
	},

	/**Permet de mettre à jourla direction du serpent.
	 * @param {number} newDir
	 */
	setDir : function(newDir){
		if(this.lockedDir)
			return;

		if(this.dir === -1)
			this.setCamRotation(0);

		newDir = (newDir + this.camRotation) %4;

		var lastPart = this.parts[this.parts.length-2];
		if(lastPart === undefined){
			this.dir = newDir;
			return;
		}

		switch(newDir){
			case 0:
					if(this.pos.x !== lastPart.x || this.pos.y !== lastPart.y+1)
						this.dir = newDir;
				break;
			case 1:
					if(this.pos.y !== lastPart.y || this.pos.x !== lastPart.x+1)
						this.dir = newDir;
				break;
			case 2:
					if(this.pos.x !== lastPart.x || this.pos.y !== lastPart.y-1)
						this.dir = newDir;
				break;
			case 3:
					if(this.pos.y !== lastPart.y || this.pos.x !== lastPart.x-1)
						this.dir = newDir;
				break;
		}
	},

	/**Mais à jour le serpent.
	 * @param {number} delta
	 */
	update : function(delta){
		if(this.paused)
			return;

		this.nextMove-=delta;
		if(this.nextMove>0)
			return;

		this.nextMove+=this.speed;

		switch(this.dir){
			case 0: this.pos.y--;
				break;
			case 1: this.pos.x--;
				break;
			case 2: this.pos.y++;
				break;
			case 3: this.pos.x++;
				break;
			default: return;
		}

		this.lockedDir = false;
		this.moveCount++;
		this.nodeScore.data = this.moveCount;

		if(this.parts.length > this.maxLength){
			var part = this.parts[0];

			if(TYPE.REUSABLE[ part.type ])
				map.setPos(part.x, part.y, TYPE.LIST[part.type]);
			else
				map.setPos(part.x, part.y, TYPE.LIST[TYPE.GROUND]);

			this.parts = this.parts.splice(1);

			animationManager.pushAnimation(part.mesh, [
				['position', {from: new V3(part.x, 0, part.y), to: new V3(this.parts[0].x, 0, this.parts[0].y)}],
				['scale', {from: new V3(1,1,1), to: new V3(.1,.1,.1)}]
			], this.speed, 0,
			function(mesh){renderManager.clearMesh(mesh);});
		}

		var vx = (this.dir === 1 ? 1 : this.dir === 3 ? -1 : 0);
		var vz = (this.dir === 0 ? 1 : this.dir === 2 ? -1 : 0);

		switch(map.moveIn(this)){
			case 0: case false:
					map.reset();
				break;

			case 2:
					snake.paused = true;
					snake.dir = -1;

			case 1: case true:
					var lastPart = this.parts[this.parts.length-1];

					var mesh = TYPE.LIST[TYPE.SNAKE].mesh.clone();
					mesh.position.x = this.pos.x;
					mesh.position.z = this.pos.y;
					renderManager.addMesh(mesh);
					
					animationManager.pushAnimation(mesh, [
						['position', {from: new V3(this.pos.x +vx *.6, 0, this.pos.y +vz *.6), to: mesh.position.clone()}],
						['scale', {from: new V3(.1,.1,.1), to: new V3(1,1,1)}]
					], this.speed*.5, 0);

					var camP = renderManager.cam.position.clone();

					animationManager.pushAnimation(renderManager.cam, [
						['position', {from: camP, to: new V3(this.pos.x+this.off.x, 5, this.pos.y+this.off.y)}]
					], this.speed, 0);

					this.parts.push({x: this.pos.x, y: this.pos.y, type: map.getType(this.pos), mesh:mesh});
					map.setPos(this.pos.x, this.pos.y, TYPE.LIST[TYPE.SNAKE]);
				break;
		}
	},

	/**Modifie la couleur du serpent
	 * @param {COLOR} color
	 */
	setColor : function(color){
			snake.color = color;
			snake.mat.uniforms.color.value = COLOR.RGB[ color];
	},

	/**Modifie la rotation de la camera
	 * @param {number} id (direction de rotation ou reset)
	 */
	setCamRotation : function(id){
		var newR, newP;

		switch(id){
			case 0: case 2:
					this.camRotation = 0;
					renderManager.cam.rotation.y %= Math.PI*2;

					if(renderManager.cam.rotation.y > Math.PI)
						renderManager.cam.rotation.y -= Math.PI*2;
					else if(renderManager.cam.rotation.y < -Math.PI)
						renderManager.cam.rotation.y += Math.PI*2;

					if(id === 0)
						newR = new V3(-Math.PI/32*12, -Math.PI/16, 0);
					else
						newR = new V3(-Math.PI/2, 0, 0);

				break;
			case 1:
					newR = new V3(-Math.PI/32*12, renderManager.cam.rotation.y +Math.PI/2, 0);

				break;
			case -1:
					newR = new V3(-Math.PI/32*12, renderManager.cam.rotation.y -Math.PI/2, 0);

				break;
			default: return;
		}

		if( id !== 2) {
			this.camRotation += id;

			if(this.camRotation < 0)
				this.camRotation += 4;

			this.camRotation %= 4;

		} else
			this.camRotation = -1;

		switch( this.camRotation ){
			case -1: newP = new V3( map.width/2, 15, map.height/2 );
				break;
			case 0: newP = new V3( this.pos.x-.5, 5, this.pos.y+2 );
				break;
			case 1: newP = new V3( this.pos.x+2, 5,  this.pos.y+.5 );
				break;
			case 2: newP = new V3( this.pos.x+.5, 5, this.pos.y-2 );
				break;
			case 3: newP = new V3( this.pos.x-2, 5,  this.pos.y-.5 );
				break;
		}

		this.off.x = newP.x -this.pos.x;
		this.off.y = newP.z -this.pos.y;

		animationManager.pushAnimation(renderManager.cam, [
				['position', {from: renderManager.cam.position.clone(), to: newP}],
				['rotation', {from: renderManager.cam.rotation.clone(), to: newR}]
			], this.speed*.8, 0);
	},

	/**Rénisialise le serpent*/
	reset : function(){
		this.clear();

		this.moveCount = 0;
		this.maxLength = 5;
		this.dir = -1;

		this.pos.x = map.spawn.x;
		this.pos.y = map.spawn.y;

		this.setColor(COLOR.GREEN);
		this.setCamRotation(2);

		var mesh = TYPE.LIST[TYPE.SNAKE].mesh.clone();
		mesh.position.x = map.spawn.x;
		mesh.position.z = map.spawn.y;
		renderManager.addMesh(mesh);

		animationManager.pushAnimation(mesh, [
			['scale', {from: new V3(.05,.05,.05), to: new V3(1,1,1)}]
		],this.speed, 0);

		map.setPos(this.pos.x, this.pos.y, TYPE.LIST[TYPE.SNAKE]);
		this.parts =[{x: this.pos.x, y: this.pos.y, type: TYPE.GROUND, mesh: mesh}];
		snake.paused = false;
	},

	/**Retir les mesh du serpent de la scene*/
	clear : function(){
		for(var i=0; i<this.parts.length; i++)
			renderManager.clearMesh( this.parts[i].mesh);
	}
};
