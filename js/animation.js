function AnimationManager(){
	this.list = [];
}

AnimationManager.prototype = {
	pushAnimation : function(mesh, param, duration, delay, callback){
		if(mesh != null)
			this.list.push(new Animation(mesh, param, duration, delay, callback));
	},

	update : function(delta){
		for(var i=0; i<this.list.length; i++)
			if(this.list[i].update(delta)){
				this.list.splice(i,1);
				i--;
			}
	}
};

function Animation(mesh, param, duration, delay, callback){
	this.mesh = mesh;
	this.param = param;
	this.duration = duration;
	this.delay = delay || 0;
	this.callback = callback;

	if(this.delay === 0)
		for(var i=0; i<this.param.length; i++)
			this.mesh[this.param[i][0]].set(
				this.param[i][1].from.x,
				this.param[i][1].from.y,
				this.param[i][1].from.z
			);
}

Animation.prototype = {
	update : function(delta){
		this.delay -= delta;

		if(this.delay>0)
			return;

		var off = -this.delay/ this.duration;

		if(off>1)
			off = 1;

		var offN = 1-off;

		for(var i=0; i<this.param.length; i++)
			this.mesh[this.param[i][0]].set(
				this.param[i][1].from.x *offN + this.param[i][1].to.x *off,
				this.param[i][1].from.y *offN + this.param[i][1].to.y *off,
				this.param[i][1].from.z *offN + this.param[i][1].to.z *off
			);

		if(off === 1){
			if(this.callback)
				this.callback(this.mesh);
			return true;
		}

		return false;
	}
};
