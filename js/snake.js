function Snake(){
	this.pos = {x: 0, y: 0};
	this.off = {x: 0, y: 0};
	this.maxLength = 5;
	this.speed = 400;
	this.nextMove = 0;
	this.moveCount = 0;
	this.paused = true;
	this.camRotation = 0;

	this.dir = -1;
	this.parts = [];
	this.color = COLOR.GREEN;
	this.mat = TYPE.LIST[ TYPE.SNAKE].mesh.material;
	this.nodeScore = null;
}

Snake.prototype = {
	growUp : function(){
		this.maxLength++;
	},

	setDir : function(newDir){
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

		if(map.moveIn(this)){
			var lastPart = this.parts[this.parts.length-1];

			var mesh = TYPE.LIST[TYPE.SNAKE].mesh.clone();
			mesh.position.x = this.pos.x;
			mesh.position.z = this.pos.y;
			renderManager.addMesh(mesh);

			var vx = (this.dir === 1 ? 1 : this.dir === 3 ? -1 : 0);
			var vz = (this.dir === 0 ? 1 : this.dir === 2 ? -1 : 0);

			animationManager.pushAnimation(mesh, [
				['position', {from: new V3(this.pos.x +vx *.6, 0, this.pos.y +vz *.6), to: mesh.position.clone()}],
				['scale', {from: new V3(.1,.1,.1), to: new V3(1,1,1)}]
			], this.speed*.75, 0);

			var camP = renderManager.cam.position.clone();

			animationManager.pushAnimation(renderManager.cam, [
				['position', {from: camP, to: new V3(this.pos.x+this.off.x, camP.y, this.pos.y+this.off.y)}]
			], this.speed, 0);

			this.parts.push({x: this.pos.x, y: this.pos.y, type: map.getType(this.pos), mesh:mesh});
			map.setPos(this.pos.x, this.pos.y, TYPE.LIST[TYPE.SNAKE]);
		}else
			map.reset();
	},

	setColor : function(color){
			snake.color = color;
			snake.mat.uniforms.color.value = COLOR.RGB[ color];
	},

	setCamRotation : function(id){
		var newR, newP;

		switch(id){
			case 0:
					this.camRotation = 0;
					renderManager.cam.rotation.y %= Math.PI*2;
					newR = new V3(-Math.PI/32*12, -Math.PI/16, 0);
				break;
			case 1:
					newR = new V3(-Math.PI/32*12, renderManager.cam.rotation.y +Math.PI/2, 0);
				break;
			case -1:
					newR = new V3(-Math.PI/32*12, renderManager.cam.rotation.y -Math.PI/2, 0);
				break;
			default: return;
		}

		this.camRotation += id;
		if(this.camRotation < 0)
			this.camRotation += 4;
		this.camRotation %= 4;

		switch(this.camRotation){
			case 0: newP = new V3(this.pos.x-.5, 4, this.pos.y+2);
				break;
			case 1: newP = new V3(this.pos.x+2, 4,  this.pos.y+.5);
				break;
			case 2: newP = new V3(this.pos.x+.5, 4, this.pos.y-2);
				break;
			case 3: newP = new V3(this.pos.x-2, 4,  this.pos.y-.5);
				break;
		}

		this.off.x = newP.x -this.pos.x;
		this.off.y = newP.z -this.pos.y;

		animationManager.pushAnimation(renderManager.cam, [
				['position', {from: renderManager.cam.position.clone(), to: newP}],
				['rotation', {from: renderManager.cam.rotation.clone(), to: newR}]
			], 500, 0);
	},

	reset : function(){
		this.clear();

		this.moveCount = 0;
		this.maxLength = 5;
		this.dir = -1;

		this.pos.x = map.spawn.x;
		this.pos.y = map.spawn.y;

		this.setColor(COLOR.GREEN);
		this.setCamRotation(0);

		var mesh = TYPE.LIST[TYPE.SNAKE].mesh.clone();
		mesh.position.x = map.spawn.x;
		mesh.position.z = map.spawn.y;
		renderManager.addMesh(mesh);

		animationManager.pushAnimation(mesh, [
			['scale', {from: new V3(.05,.05,.05), to: new V3(1,1,1)}]
		],400, 0);

		map.setPos(this.pos.x, this.pos.y, TYPE.LIST[TYPE.SNAKE]);
		this.parts =[{x: this.pos.x, y: this.pos.y, type: TYPE.GROUND, mesh: mesh}];
		snake.paused = false;
	},

	clear : function(){
		for(var i=0; i<this.parts.length; i++)
			renderManager.clearMesh( this.parts[i].mesh);
	}
};
