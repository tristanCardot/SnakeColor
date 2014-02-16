function SnakePart(id){
	this.id = id;
	this.color;
	this.mesh = this.craftMesh();
}

SnakePart.prototype = {
	moveIn : function(){
		return false;
	},

	craftMesh : function(){
		var mat = MAT.snakeColor.clone();
		this.color = mat.uniforms.color.value = COLOR.RGB[ COLOR.GREEN ];

		return new THREE.Mesh(GEO.snakePart, mat);
	}
};


function ColorSwaper(id, color, pos){
	this.id = id;
	this.color = color;
	this.mesh = this.craftMesh();
}

ColorSwaper.prototype =	{
	moveIn : function(snake, mesh){
		snake.setColor(this.color);

		animationManager.pushAnimation(mesh, [
				['scale', {from: new V3(1,1,1), to: new V3(.05,.05,.05)}]
			], 500, 0, function(mesh){
				renderManager.clearMesh(mesh);
			});

		return true;
	},

	craftMesh : function(){
		var mat = MAT.alphaGradient.clone();
		mat.uniforms.color.value = COLOR.RGB[this.color];

		return new THREE.Mesh(GEO.colorSwaper, mat);
	}
};

function Block(id, type){
	this.id = id;
	this.type = type;
	this.mesh = this.craftMesh();
}

Block.prototype = {
	ground : true,
	moveIn : function(snake){
		return this.type !== 1;
	},

	craftMesh : function(){
		var mat = MAT.grayGradient.clone(),
			geo;

		if(this.type === 0){
			geo = GEO.ground;
			mat.attributes = {grad: {type:'f', value:[.35,.35,.35,.35, .45,.45,.45,.45, .40,.40,.40,.40, .3,.3,.3,.3, .25,.25,.25,.25]}};

		}else if (this.type === 1){
			geo = GEO.wall;
			mat.attributes = {grad: {type:'f', value:[
				.25,.25,.25,.25,

				.35,.35,.35,.35,
				.30,.30,.30,.30,
				.2,.2,.2,.2,
				.15,.15,.15,.15,

				.25,.25,.25,
				.325,.325,.325,
				.25,.25,.25,
				.175,.175,.175,

				.4,.4,.4,.4,
				.35,.35,.35,.35,
				.25,.25,.25,.25,
				.2,.2,.2,.2,

				.3,.3,.3,.3,
				.375,.375,.375,.375,
				.3,.3,.3,.3,
				.225,.225,.225,.225,

				.35,.35,.35,
				.35,.35,.35,
				.35,.35,.35,
				.35,.35,.35
			]}};
		}

		return new THREE.Mesh(geo, mat);
	}
};


function Dot(id, color){
	this.id = id;
	this.color = color;
	this.mesh = this.craftMesh();
}

Dot.prototype = {
	moveIn : function(snake, mesh){
		if(snake.color === this.color){
			snake.maxLength++;

			animationManager.pushAnimation(mesh, [
				['rotation', {from: new V3(0,0,0), to: new V3(0,Math.PI,0)}]
			], 500, 0, function(mesh){
				renderManager.clearMesh(mesh);
			});

			return map.updateDotCount(-1);

		}else
			return false;
	},

	craftMesh : function(){
		var mat = MAT.color.clone();
		mat.uniforms.color.value = COLOR.RGB[this.color];

		return new THREE.Mesh(GEO.dot, mat);
	}
};


function CamRotator(id, dir){
	this.id = id;
	this.dir = dir;

	this.mesh = this.craftMesh();
}

CamRotator.prototype = {
	moveIn : function(snake, color){
		snake.setCamRotation(this.dir);
		return true;
	},

	craftMesh : function(){
		var mat = MAT.grayGradient.clone();
		mat.attributes = {grad: {type:'f', value:[
			.25,.25,.25, .30,.30,.30
		]}};

		return new THREE.Mesh(this.dir === 1 ? GEO.camRotatorPOS : GEO.camRotatorNEG, mat);
	}
};


function Arrow(id, dir){
	this.id = id;
	this.dir = dir;

	this.mesh = this.craftMesh();
}

Arrow.prototype = {
	moveIn : function(snake, mesh){
		if(this.dir !== (snake.dir+2) %4){
			snake.dir = this.dir;
			snake.lockedDir = true;

			return true;
		}
		
		return false;
	},

	craftMesh : function(){
		var mat = MAT.grayGradient.clone();
		mat.attributes = {grad: {type:'f', value:[
			.25,.25,.25, .25,.25,.35,.35
		]}};

		var mesh = new THREE.Mesh(GEO.arrow, mat);
		mesh.rotation.y = this.dir *Math.PI /2;
		return mesh;
	}
};


function BannedColor(id, color){
	this.id = id;
	this.color = color;
	this.mesh = this.craftMesh();
}

BannedColor.prototype = {
	moveIn : function(snake, mesh){
		return this.color !== snake.color;
	},

	craftMesh : function(){
		var mat = MAT.color.clone();
		mat.uniforms.color.value = COLOR.RGB[this.color];

		return new THREE.Mesh(GEO.cross, mat);
	}
};


var TYPE = {
	GROUND: 0,
	WALL: 1,
	BLOCK : {0:1, 1:1},

	SNAKE: 2,

	SWAPER: 3,
	DOT : 11,
	BANNED : 25,

	ISDOT : {11:1, 12:1, 13:1, 14:1, 15:1, 16:1, 17:1, 18:1},

	COLOR : {3:1, 4:1, 5:1, 6:1, 7:1, 8:1, 9:1, 10:1,
			 11:1, 12:1, 13:1, 14:1, 15:1, 16:1, 17:1, 18:1,
			 25:1, 26:1, 27:1, 28:1, 29:1, 30:1, 31:1, 32:1},

	CAMROTATOR : 19,
	ARROW : 21,

	REUSABLE : {19:1, 20:1,
				21:1, 22:1, 23:1, 24:1,
			    25:1, 26:1, 27:1, 28:1, 29:1, 30:1, 31:1, 32:1},

	LIST: [
		new Block(0, 0),
		new Block(1, 1),
		new SnakePart(2),

		new ColorSwaper(3, COLOR.BLACK),
		new ColorSwaper(4, COLOR.GREEN),
		new ColorSwaper(5, COLOR.RED),
		new ColorSwaper(6, COLOR.YELLOW),
		new ColorSwaper(7, COLOR.BLUE),
		new ColorSwaper(8, COLOR.CYAN),
		new ColorSwaper(9, COLOR.VIOLET),
		new ColorSwaper(10, COLOR.WHITE),

		new Dot(11, COLOR.BLACK),
		new Dot(12, COLOR.GREEN),
		new Dot(13, COLOR.RED),
		new Dot(14, COLOR.YELLOW),
		new Dot(15, COLOR.BLUE),
		new Dot(16, COLOR.CYAN),
		new Dot(17, COLOR.VIOLET),
		new Dot(18, COLOR.WHITE),

		new CamRotator(19, 1),
		new CamRotator(20,-1),

		new Arrow(21, 0),
		new Arrow(22, 1),
		new Arrow(23, 2),
		new Arrow(24, 3),

		new BannedColor(25, COLOR.BLACK),
		new BannedColor(26, COLOR.GREEN),
		new BannedColor(27, COLOR.RED),
		new BannedColor(28, COLOR.YELLOW),
		new BannedColor(29, COLOR.BLUE),
		new BannedColor(30, COLOR.CYAN),
		new BannedColor(31, COLOR.VIOLET),
		new BannedColor(32, COLOR.WHITE)
	]
};
TYPE.LIST['undefined'] = TYPE.LIST[0];
