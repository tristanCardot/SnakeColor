var SCREENY = 0,
	FOV = 75,
	V3 = THREE.Vector3,
	F3 = THREE.Face3,
	CANVAS,
	VERSION = '0.1b',


	LEVELS = [
		"FFAAGAOAOAOAAAMAMAABAAMBBBMAABAAMAMAA",//14/14/14
		"FFCCDAQAWAeANAAAMAFAEAAAAABAGAAAOABAB",//16/22/30
		"HLBDFAZAcAiABAAAAABBBAAABBABAAABAABADABABADMDAABAADAABABAAABAABAAABABAALAABBALELABBBALABB",//25/28/34
		"NNGGIACCbC+CAAAAAABAAAAAAAFAAAABAAAAHAAABAAABAAABAAAAABAMBOABAAAAAAABAAABAAAAAAAMAAAAAOAAABBBBAAAAABBBBAAAPAAAAANAAAAAAABAAABAAAAAAABANBPABAAAAABAAABAAABAAAGAAAABAAAAEAAAAAAABAAAAAA", //130,155,190
		"FNGEKA-AEBaBAAAAAAAAAAAABNNABAMHAODAAABAMAGBEBAABAMAAODAAABAMFAABPPAAAAAAAAAA",//63/68/90
		"JJAEEAxA1A8ABBAAAAABBBBAAAAABBAABAAABAAAAABMBAAAAAANTPAAAAAABMBAAAAABAAABAAABAAAAABAHAAAAAAAF",//49/53/60
		"LLAEUAaCqC+CAAABAANAAAAAPABAAAOAMAAAAOAAPAANAMAMAAABAABBAAABAEANAAAANAAGAFAAPAAAAAAHABAAABBOABAPAOAAAAAAAAAAAANAOAAMAABMAAAAAPAAABAAA",//154/170/190
		"MPBBOA5BHCWCAAABANVMAVAAAAABAbAbYBBAAAABAXAXABAABYBBABMBNBBABABBAVAVABAAAAAFAbAbWBBAAAABANXNAVAAAAABBBBBBBBAAAaAAABABABABBBNBMBBBBBABBBABAAAMAAAUAATBMBABABMABBABAAAMAAAABBABABABABAEAAUBAMAAAMA",//121/135/150
	],

	GUI = {
		MAIN : 0,
		GUIPLAYER : 1,
		INGAME : 2,
		LEVELSELECT : 3,
		CRAFTBOX : 4,
		CRAFTMENU : 5,
		TESTER : 6,
		SCORE : 7
	},

	COLOR = {
		BLACK: 0,
		GREEN: 1,
		RED: 2,
		YELLOW: 3,
		BLUE: 4,
		CYAN: 5,
		VIOLET: 6,
		WHITE: 7,

		RGB:[
			new V3(0,0,0),
			new V3(1/255*40, 1/255*180, 1/255*20),
			new V3(1,0,0),
			new V3(1,1,0),
			new V3(0,0,1),
			new V3(0,1,1),
			new V3(1,0,1),
			new V3(1,1,1)
		]
	};

var GEO = {
	snakePart: (function(){
		var geo = new THREE.Geometry();
		geo.vertices = convertArray([
			-.4, .4, -.4,
			-.4, .4,  .4,
			 .4, .4,  .4,
			 .4, .4, -.4,

			-.4, .4, -.4,
			-.4, .0, -.4,
			-.4, .0,  .4,
			-.4, .4,  .4,

			-.4, .4,  .4,
			-.4, .0,  .4,
			 .4, .0,  .4,
			 .4, .4,  .4,

			 .4, .4,  .4,
			 .4, .0,  .4,
			 .4, .0, -.4,
			 .4, .4, -.4,

			 .4, .4, -.4,
			 .4, .0, -.4,
			-.4, .0, -.4,
			-.4, .4, -.4
		], V3);

		geo.faces = convertArray([
			0,1,2,    0,2,3,
			4,5,6,    4,6,7,
			8,9,10,   8,10,11,
			12,13,14, 12,14,15,
			16,17,18, 16,18,19
		], F3);
		return geo;
	})(),

	dot: (function(){
		var geo = new THREE.Geometry();
		geo.vertices = convertArray([
			-.1, .1, -.1,
			-.1, .1,  .1, 
			 .1, .1,  .1,
			 .1, .1, -.1,

			-.1, .0, -.1,
			-.1, .0,  .1,
			 .1, .0,  .1,
			 .1, .0, -.1
		], V3);

		geo.faces = convertArray([
			0,1,2, 0,2,3,
			0,4,5, 0,5,1,
			1,5,6, 1,6,2,
			2,6,7, 2,7,3,
			3,7,4, 3,4,0,
			5,4,7, 5,7,6 
		], F3);
		return geo;
	})(),

	colorSwaper: (function(){
		var geo = new THREE.Geometry();
		geo.vertices = convertArray([
			-.0, 0, -.0,
			-.0, 0,  .0, 
			 .0, 0,  .0,
			 .0, 0, -.0,

			-.2,  .1, -.2,
			-.2,  .1,  .2,
			 .2,  .1,  .2,
			 .2,  .1, -.2,

			-.4, 0, -.4,
			-.4, 0,  .4,
			 .4, 0,  .4,
			 .4, 0, -.4
		], V3);

		geo.faces = convertArray([
			0,4,5, 0,5,1,
			1,5,6, 1,6,2,
			2,6,7, 2,7,3,
			3,7,4, 3,4,0,

			0,5,4, 0,1,5,
			1,6,5, 1,2,6,
			2,7,6, 2,3,7,
			3,4,7, 3,0,4,

			4,8,9,   4,9,5,
			5,9,10,  5,10,6,
			6,10,11, 6,11,7,
			7,11,8,  7,8,4

		], F3);

		return geo;
	})(),

	ground: (function(){
		var geo = new THREE.Geometry();
		geo.vertices = convertArray([
			-.4,  0, -.4,
			-.4,  0,  .4,
			 .4,  0,  .4,
			 .4,  0, -.4,

			-.4,   0, -.4,
			-.5, -.1, -.5,
			-.5, -.1,  .5,
			-.4,   0,  .4,

			-.4,   0,  .4,
			-.5, -.1,  .5,
			 .5, -.1,  .5,
			 .4,   0,  .4,

			 .4,   0,  .4,
			 .5, -.1,  .5,
			 .5, -.1, -.5,
			 .4,   0, -.4,

			 .4,   0, -.4,
			 .5, -.1, -.5,
			-.5, -.1, -.5,
			-.4,   0, -.4
		], V3);

		geo.faces = convertArray([
			0,1,2,    0,2,3,
			4,5,6,    4,6,7,
			8,9,10,   8,10,11,
			12,13,14, 12,14,15,
			16,17,18, 16,18,19
		], F3);

		return geo;
	})(),

	wall: (function(){
		var geo = new THREE.Geometry();
		geo.vertices = convertArray([
			-.4,.4,-.4,  -.4,.4,.4,  .4,.4,.4,  .4,.4,-.4,

			-.4,.4,-.4,  -.5,.3,-.4,  -.5,.3,.4,  -.4,.4,.4,
			-.4,.4,.4,  -.4,.3,.5,  .4,.3,.5,  .4,.4,.4,
			.4,.4,.4,  .5,.3,.4,  .5,.3,-.4,  .4,.4,-.4,
			.4,.4,-.4,  .4,.3,-.5,  -.4,.3,-.5,  -.4,.4,-.4,

			-.4,.4,-.4, -.4,.3,-.5, -.5,.3,-.4,
			-.4,.4,.4, -.5,.3,.4, -.4,.3,.5,
			.4,.4,.4,  .4,.3,.5,  .5,.3,.4,
			.4,.4,-.4, .5,.3,-.4, .4,.3,-.5,

			-.5,.3,-.4,  -.5,-.1,-.4,  -.5,-.1,.4,  -.5,.3,.4,
			-.4,.3,.5,  -.4,-.1,.5,  .4,-.1,.5,  .4,.3,.5,
			.5,.3,.4,  .5,-.1,.4,  .5,-.1,-.4,  .5,.3,-.4,
			.4,.3,-.5,  .4,-.1,-.5,  -.4,-.1,-.5,  -.4,.3,-.5,

			-.4,.3,-.5, -.4,-.1,-.5, -.5,-.1,-.4, -.5,.3,-.4,
			 -.5,.3,.4, -.5,-.1,.4, -.4,-.1,.5, -.4,.3,.5,
			.4,.3,.5, .4,-.1,.5, .5,-.1,.4, .5,.3,.4,
			.5,.3,-.4, .5,-.1,-.4, .4,-.1,-.5, .4,.3,-.5,

			-.5,-.1,-.5, -.5,-.1,-.4, -.4,-.1,-.5,
			-.5,-.1,.5, -.4,-.1,.5, -.5,-.1,.4,
			.5,-.1,.5, .5,-.1,.4, .4,-.1,.5,
			.5,-.1,-.5, .4,-.1,-.5, .5,-.1,-.4
		], V3);

		geo.faces = convertArray([
			0,1,2,    0,2,3,
			4,5,6,    4,6,7,
			8,9,10,   8,10,11,
			12,13,14, 12,14,15,
			16,17,18, 16,18,19,

			20,21,22, 23,24,25,
			26,27,28, 29,30,31,

			32,33,34, 32,34,35,
			36,37,38, 36,38,39,
			40,41,42, 40,42,43,
			44,45,46, 44,46,47,

			48,49,50, 48,50,51,
			52,53,54, 52,54,55,
			56,57,58, 56,58,59,
			60,61,62, 60,62,63,

			64,65,66, 67,68,69,
			70,71,72, 73,74,75

		], F3);

		return geo;
	})(),

	camRotatorPOS: (function(){
		var geo = new THREE.Geometry();
		geo.vertices = convertArray([
			.05, .01,-.35,
		   -.15, .01,-.15,
		    .05, .01, .05,

		   -.05, .01, .35,
		    .15, .01, .15,
		   -.05, .01,-.05
		], V3);

		geo.faces = convertArray([
			0,1,2, 
			3,4,5
		], F3);

		return geo;
	})(),

	camRotatorNEG: (function(){
		var geo = new THREE.Geometry();
		geo.vertices = convertArray([
		   -.05, .01,-.35,
		    .15, .01,-.15,
		   -.05, .01, .05, 

		    .05, .01, .35,
		   -.15, .01, .15,
		    .05, .01,-.05
		], V3);

		geo.faces = convertArray([
			0,2,1,
			3,5,4
		], F3);

		return geo;
	})(),

	cross: (function(){
		var geo = new THREE.Geometry();
		geo.vertices = convertArray([
			-.25, .05,-.35, -.35, .05,-.25,
			-.35, .05, .25, -.25, .05, .35, 
			 .25, .05, .35,  .35, .05, .25,
			 .35, .05,-.25,  .25, .05,-.35
		], V3);

		geo.faces = convertArray([
			0,1,4, 0,4,5,
			2,3,6, 2,6,7
		], F3);

		return geo;
	})(),

	arrow : (function(){
		var geo = new THREE.Geometry();
		geo.vertices = convertArray([
			  0, .05, -.4, 
			-.3, .05, -.1,
			 .3, .05, -.1,

			 .1, .05, -.1,
			-.1, .05, -.1,
			-.1, .05,  .3,
			 .1, .05,  .3,
		], V3);

		geo.faces = convertArray([
			0,1,2,
			3,4,5, 3,5,6
		], F3);

		return geo;
	})()
};

var MAT = {
	snakeColor : (function(){
		var vert = [
			"#ifdef GL_ES",
			"precision mediump float;",
			"#endif",

			"attribute float saturation;",
			"varying float vSaturation;",

			"void main(){",
				"vSaturation = saturation;",
				"gl_Position = projectionMatrix *modelViewMatrix *vec4(position, 1.0);",
			"}"
		].join('\n');
		var frag = [
			"#ifdef GL_ES",
			"precision mediump float;",
			"#endif",

			"uniform vec3 color;",
			"varying float vSaturation;",

			"void main(void){",
				"gl_FragColor = vec4(color *vSaturation, 1.);",
			"}"
		].join('\n');

		return new THREE.ShaderMaterial({
			uniforms: {color : {type: 'v3', value: new V3(0,0,0)} },
			attributes: {saturation : {type: 'f', value: [
				.75, .75, .75, .75,
				  1,   1,   1,   1,
				 .9,  .9,  .9,  .9,
				 .6,  .6,  .6,  .6,
				.45, .45, .45, .45
			]} },
			vertexShader:   vert,
			fragmentShader: frag
		});
	})(),

	color : (function(){
		var vert = [
			"#ifdef GL_ES",
			"precision mediump float;",
			"#endif",

			"void main(){",
				"gl_Position = projectionMatrix *modelViewMatrix *vec4(position, 1.0);",
			"}"
		].join('\n');
		var frag = [
			"#ifdef GL_ES",
			"precision mediump float;",
			"#endif",

			"uniform vec3 color;",

			"void main(void){",
				"gl_FragColor = vec4(color, 1.);",
			"}"
		].join('\n');
		var attributes = [];

		return new THREE.ShaderMaterial({
	        uniforms: {color : {type: 'v3', value: new V3(0,0,0)} },
	        attributs : {},
	        vertexShader:   vert,
	        fragmentShader: frag
	    });
	})(),

	alphaGradient : (function(){
		var vert = [
			"#ifdef GL_ES",
			"precision mediump float;",
			"#endif",

    		"varying float vAlpha;",
    		"attribute float alpha;",

			"void main(){",
				"vAlpha = alpha;",
				"gl_Position = projectionMatrix *modelViewMatrix *vec4(position, 1.0);",
			"}"
		].join('\n');
		var frag = [
			"#ifdef GL_ES",
			"precision mediump float;",
			"#endif",

			"uniform vec3 color;",
    		"varying float vAlpha;",

			"void main(void){",
				"gl_FragColor = vec4(color, vAlpha);",
			"}"
		].join('\n');
		var attributes = [];

		return new THREE.ShaderMaterial({
			uniforms: {color : {type: 'v3', value: new V3(0,0,0)} },
			attributes: {alpha : {type: 'f', value: [-.5,-.5,-.5,-.5, .75,.75,.75,.75, 0,0,0,0]} },
			vertexShader:   vert,
			fragmentShader: frag,
			transparent: true
		});
	})(),

	grayGradient : (function(){
		var vert = [
			"#ifdef GL_ES",
			"precision mediump float;",
			"#endif",

			"varying float vGrad;",
			"attribute float grad;",

			"void main(){",
				"vGrad = grad;",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0 );",
			"}"
		].join('\n');
		var frag = [
			"#ifdef GL_ES",
			"precision mediump float;",
			"#endif",

    		"varying float vGrad;",

			"void main(void){",
				"gl_FragColor = vec4(vGrad, vGrad, vGrad,1.);",
			"}"
		].join('\n');
		var attributes = [];

		return new THREE.ShaderMaterial({
			uniforms: {},
			attributes: {
				grad : {type: 'f', value: []}
			},
			vertexShader:   vert,
			fragmentShader: frag
		});
	})()
};

/**constructeur d'Array d'Objet
 * @param {Array.<number>} list
 * @param {Object} type
 * @return {Array.<type>}
 */
function convertArray(list, type){
	var r = [];//result

		for(var i=0; i<list.length; i+=3)
			r.push(new type(list[i], list[i+1], list[i+2]));

	return r;
}
