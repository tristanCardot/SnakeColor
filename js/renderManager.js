/** s'occupe du render.
 * @constructor
 */
function RenderManager(){
	this.cam = new THREE.PerspectiveCamera(FOV, window.innerWidth/window.innerHeight, 1, 100);
	this.renderer = new THREE.WebGLRenderer({antialias: true});
	this.renderer.setClearColor( 0x888888, 1);

	this.scene = new THREE.Scene();

	this.grid=[];
	this.ground=null;

	CANVAS = this.renderer.domElement;
	this.onRun = false;
	this.lastTick = 0;

	var self = this;
	window.addEventListener('resize', function(){self.updateSize();}, false);
		this.updateSize();
}

RenderManager.prototype = {
	/**Met en route du rendu */
	startUpdate : function(){
		this.onRun = true;
		this.lastTick = Date.now();
		this.update(this);
	},

	/**Met en pause le rendu */
	stopUpdate : function(){
		this.onRun = false;
	},

	/**Met à jour le rendu */
	update : function(rm){//rm => RenderManager
		var delta = Date.now() -rm.lastTick;
		if(delta > 40){
			delta = 40;
			rm.lastTick = Date.now();
		}

		rm.lastTick += delta;
		
		snake.update(delta);
		animationManager.update(delta);

		rm.renderer.render(rm.scene, rm.cam);

		if(rm.onRun)
			requestAnimationFrame(function(){rm.update(rm);});
	},

	/**Mise à jour de la taile de la fenêtre.*/
	updateSize : function(e){
		this.cam.aspect = window.innerWidth /window.innerHeight;
		this.cam.updateProjectionMatrix();

		this.renderer.setSize( window.innerWidth*.80, window.innerHeight*.80);

		SCREENY = window.innerHeight/2 * ( Math.cos( FOV/180*Math.PI/2 ) / Math.sin(FOV/180*Math.PI/2) );
		this.renderFrame();
	},

	/**Initialise la grille servant à contenir les mesh.*/
	initGrid : function(height, width){
		this.clearGrid();
		this.clearGround();

		this.grid = [];
		for(var i=0, j; i<width; i++){
			this.grid.push([]);

			for(j=0; j<height; j++)
				this.grid[i].push(null);
		}

		var mat = MAT.grayGradient.clone();
		mat.attributes = {grad : {type: 'f', value: []}};

		this.ground = new THREE.Mesh(new THREE.Geometry(), mat);
		this.scene.add( this.ground);
	},

	/**Supprimes la grille et les mesh de la scene.*/
	clearGrid : function(){
		for(var i=0, j=0; i<this.grid.length; i++)
			for(j=0; j<this.grid[0].length; j++)
				if(this.grid[i][j] !== null){
					this.scene.remove(this.grid[i][j]);
					this.grid[i][j] = null;
				}
	},

	/**Construit une mesh celon sont type et sa position.
	 * @param {TYPE} type
	 * @param {number} x
	 * @param {number} y
	 */
	craftMesh : function(type, x, y){
		if(type === undefined)
			return;

		var mesh = type.mesh.clone();
		mesh.position.x = x;
		mesh.position.z = y;

		this.grid[x][y] = mesh;
		this.scene.add(mesh);
		return mesh;
	},

	/**Retir la mesh en x,y
	 * @param {number} x
	 * @param {number} y
	 */
	clearPos : function(x, y){
		this.scene.remove(this.grid[x][y]);
		this.grid[x][y] = null;
	},

	/**retirn une mesh
	 * @param {Mesh} mesh
	 */
	clearMesh : function(mesh){
		this.scene.remove(mesh);
	},

	/**ajoute une mesh
	 * @param {Mesh} mesh
	 */
	addMesh : function(mesh){
		this.scene.add(mesh);
	},

	/**ajoute une mesh au sol
	 * @param {TYPE} type
	 * @param {number} x
	 * @param {number} y
	 */
	addGround : function(type, x, y){
		if(type.ground !== true)
			return;
		
		var ground = type.mesh.clone();
		ground.position.x = x;
		ground.position.z = y;
		THREE.GeometryUtils.merge(this.ground.geometry, ground);

		var grad = this.ground.material.attributes.grad;
		grad.value = grad.value.concat(ground.material.attributes.grad.value);
	},

	/**Retir le sol de la scene*/
	clearGround : function(){
		this.scene.remove(this.ground);
	},

	/**Fait le rendu une fois*/
	renderFrame : function(){
		this.renderer.render(this.scene, this.cam);
	},

	/**Passe la de vue en jeu à la vue création*/
	setCamMode : function(id){
		switch(id){
			case 0:
					snake.setCamRotation(2);
				break;
			case 1:
					renderManager.cam.position.set(1, 12, 1);
					renderManager.cam.rotation.set(-Math.PI/2, 0, 0);
				break;
		}
	}
};
