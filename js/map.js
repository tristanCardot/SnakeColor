function Map(){
	this.currentData = null;
	this.grid = [];
	this.ld = {};

	this.height = 0;
	this.width = 0;

	this.dotCount = 0;
	this.gold = 0;
	this.silver = 0;
	this.copper = 0;

	this.spawn = {x: 0, y: 0};
}

Map.prototype = {
	updateData : function(ld){
		var result = stringToArray(ld);
		this.ld = result;

		this.height = result[0];
		this.width = result[1];
		this.spawn = {x: result[2]+1, y: result[3]+1};

		this.dotCount = result[4]+ (result[5]<<6);
		this.gold =  result[6]+ (result[7]<<6);
		this.silver =  result[8]+ (result[9]<<6);
		this.copper =  result[10]+ (result[11]<<6);

		renderManager.initGrid(this.height+2, this.width+2);

		this.grid = [];
		for(var i=-1, endI=this.width+1, endJ=this.height+1, length, select;  i<endI;  i++){
			this.grid.push([]);

			length = this.grid.length-1;

			for(var j=-1; j<endJ; j++){
				if(i<0 || j<0 || i>=this.width || j>=this.height)
					select = TYPE.LIST[ TYPE.WALL ];
				else
					select = TYPE.LIST[ result[i *map.height +j +12] ];


				if(select !== undefined){
					if(select.ground === true)
						renderManager.addGround(select, i+1, j+1);

					else{
						renderManager.craftMesh(select, i+1, j+1);
						renderManager.addGround(TYPE.LIST[TYPE.GROUND], i+1, j+1);
					}

					this.grid[i+1].push(select);

				}else{
					this.grid[i+1].push(TYPE.LIST[TYPE.GROUND]);
					renderManager.addGround(TYPE.LIST[TYPE.GROUND], i+1, j+1);
				}
			}
		}

		snake.reset();
	},

	moveIn : function(snake){
		return this.grid[snake.pos.x][snake.pos.y].moveIn(snake, renderManager.grid[snake.pos.x][snake.pos.y]);
	},

	getType : function(pos){
		return this.grid[pos.x][pos.y].id;
	},

	setPos : function(x, y, type){
		this.grid[x][y] = type;
	},

	updateDotCount : function(offset){
		this.dotCount += offset;

		if(this.dotCount <= 0){
			actionManager.startNextLevel();
			return false;
		}

		return true;
	},

	reset : function(){
		snake.paused = true;
		snake.dir = -1;

		this.dotCount = this.ld[4];

		if(actionManager.testMode){
			actionManager.testMode = false;
			return;
		}

		for(var i= (snake.parts.length>25 ? snake.parts.length-25 : 0); i<snake.parts.length; i++)
			animationManager.pushAnimation(snake.parts[i].mesh, [
				['rotation', {from: new V3(0,0,0), to: new V3(0, Math.PI*1.5, 0)}],
				['scale', {from: new V3(1,1,1), to: new V3(0.05, 0.05, 0.05)}]
			], 400, i*50,
			function(mesh){renderManager.clearMesh(mesh);});

		setTimeout( function(){
				renderManager.clearGrid();

				for(var i=0, j; i<map.width; i++)
					for(var j=0; j<map.height; j++){
						select = TYPE.LIST[ map.ld[i *map.height +j +12] ];

						if(select !== undefined)
							if(select.ground !== true){
								renderManager.craftMesh(select, i+1, j+1);
								map.grid[i+1][j+1] = select;

							}else{
								renderManager.clearPos(i+1, j+1);
								map.grid[i+1][j+1] = select;
							}
					}

				snake.reset();
			}, Math.min(25, snake.parts.length) *50+200);
	}
};
