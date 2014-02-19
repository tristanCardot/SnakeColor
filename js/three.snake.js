var THREE = { REVISION: '66' };
//-UNIFORMSUTILS
THREE.UniformsUtils = {

	merge: function ( uniforms ) {

		var u, p, tmp, merged = {};

		for ( u = 0; u < uniforms.length; u ++ ) {

			tmp = this.clone( uniforms[ u ] );

			for ( p in tmp ) {

				merged[ p ] = tmp[ p ];

			}

		}

		return merged;

	},

	clone: function ( uniforms_src ) {

		var u, p, parameter, parameter_src, uniforms_dst = {};

		for ( u in uniforms_src ) {

			uniforms_dst[ u ] = {};

			for ( p in uniforms_src[ u ] ) {

				parameter_src = uniforms_src[ u ][ p ];

				if ( parameter_src instanceof THREE.Color ||
					 parameter_src instanceof THREE.Vector3 ||
					 parameter_src instanceof THREE.Matrix4) {

					uniforms_dst[ u ][ p ] = parameter_src.clone();

				} else if ( parameter_src instanceof Array ) {

					uniforms_dst[ u ][ p ] = parameter_src.slice();

				} else {

					uniforms_dst[ u ][ p ] = parameter_src;

				}

			}

		}

		return uniforms_dst;

	}
};


//-COLOR
THREE.Color = function ( color ) {
	if ( arguments.length === 3 )
		return this.setRGB( arguments[ 0 ], arguments[ 1 ], arguments[ 2 ] );
	else
		return this.set( color );
};

THREE.Color.prototype = {
	constructor: THREE.Color,

	r: 1, g: 1, b: 1,

	set: function ( value ) {

		if ( value instanceof THREE.Color )
			this.copy( value );

		else if ( typeof value === 'number' ) 
			this.setHex( value );

		return this;

	},

	setHex: function ( hex ) {

		hex = Math.floor( hex );

		this.r = ( hex >> 16 & 255 ) / 255;
		this.g = ( hex >> 8 & 255 ) / 255;
		this.b = ( hex & 255 ) / 255;

		return this;

	},

	copy: function ( color ) {

		this.r = color.r;
		this.g = color.g;
		this.b = color.b;

		return this;

	},

	clone: function () {
		return new THREE.Color().setRGB( this.r, this.g, this.b );
	}
};


//-MATH
THREE.Math = {
	PI2: Math.PI * 2,

	generateUUID: function () {
		var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
		var uuid = new Array(36);
		var rnd = 0, r;

		return function () {

			for ( var i = 0; i < 36; i ++ ) {

				if ( i == 8 || i == 13 || i == 18 || i == 23 ) {
			
					uuid[ i ] = '-';
			
				} else if ( i == 14 ) {
			
					uuid[ i ] = '4';
			
				} else {
			
					if (rnd <= 0x02) rnd = 0x2000000 + (Math.random()*0x1000000)|0;
					r = rnd & 0xf;
					rnd = rnd >> 4;
					uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];

				}
			}
			
			return uuid.join('');
		};

	}(),

	degToRad: function() {

		var degreeToRadiansFactor = Math.PI / 180;

		return function ( degrees ) {
			return degrees * degreeToRadiansFactor;
		};

	}(),

	radToDeg: function() {

		var radianToDegreesFactor = 180 / Math.PI;

		return function ( radians ) {
			return radians * radianToDegreesFactor;
		};

	}()
};


//-EVENTDISPATCHER
THREE.EventDispatcher = function () {};

THREE.EventDispatcher.prototype = {

	constructor: THREE.EventDispatcher,

	apply: function ( object ) {

		object.addEventListener = THREE.EventDispatcher.prototype.addEventListener;
		object.hasEventListener = THREE.EventDispatcher.prototype.hasEventListener;
		object.removeEventListener = THREE.EventDispatcher.prototype.removeEventListener;
		object.dispatchEvent = THREE.EventDispatcher.prototype.dispatchEvent;

	},

	addEventListener: function ( type, listener ) {

		if ( this._listeners === undefined ) this._listeners = {};

		var listeners = this._listeners;

		if ( listeners[ type ] === undefined ) {

			listeners[ type ] = [];

		}

		if ( listeners[ type ].indexOf( listener ) === - 1 ) {

			listeners[ type ].push( listener );

		}

	},

	hasEventListener: function ( type, listener ) {

		if ( this._listeners === undefined ) return false;

		var listeners = this._listeners;

		if ( listeners[ type ] !== undefined && listeners[ type ].indexOf( listener ) !== - 1 ) {

			return true;

		}

		return false;

	},

	removeEventListener: function ( type, listener ) {

		if ( this._listeners === undefined ) return;

		var listeners = this._listeners;
		var listenerArray = listeners[ type ];

		if ( listenerArray !== undefined ) {

			var index = listenerArray.indexOf( listener );

			if ( index !== - 1 ) {

				listenerArray.splice( index, 1 );

			}

		}

	},

	dispatchEvent: function () {

		var array = [];

		return function ( event ) {

			if ( this._listeners === undefined ) return;

			var listeners = this._listeners;
			var listenerArray = listeners[ event.type ];

			if ( listenerArray !== undefined ) {

				event.target = this;

				var length = listenerArray.length;

				for ( var i = 0; i < length; i ++ ) {

					array[ i ] = listenerArray[ i ];

				}

				for ( var i = 0; i < length; i ++ ) {

					array[ i ].call( this, event );

				}

			}

		};

	}()
};


//-VECTOR3
THREE.Vector3 = function ( x, y, z ) {
	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
};

THREE.Vector3.prototype = {
	constructor: THREE.Vector3,

	set: function ( x, y, z ) {

		this.x = x;
		this.y = y;
		this.z = z;

		return this;

	},

	copy: function ( v ) {

		this.x = v.x;
		this.y = v.y;
		this.z = v.z;

		return this;

	},

	addScalar: function ( s ) {

		this.x += s;
		this.y += s;
		this.z += s;

		return this;

	},

	multiplyScalar: function ( scalar ) {

		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;

		return this;

	},

	applyMatrix3: function ( m ) {

		var x = this.x;
		var y = this.y;
		var z = this.z;

		var e = m.elements;

		this.x = e[0] * x + e[3] * y + e[6] * z;
		this.y = e[1] * x + e[4] * y + e[7] * z;
		this.z = e[2] * x + e[5] * y + e[8] * z;

		return this;

	},

	applyMatrix4: function ( m ) {

		// input: THREE.Matrix4 affine matrix

		var x = this.x, y = this.y, z = this.z;

		var e = m.elements;

		this.x = e[0] * x + e[4] * y + e[8]  * z + e[12];
		this.y = e[1] * x + e[5] * y + e[9]  * z + e[13];
		this.z = e[2] * x + e[6] * y + e[10] * z + e[14];

		return this;

	},

	applyProjection: function ( m ) {

		// input: THREE.Matrix4 projection matrix

		var x = this.x, y = this.y, z = this.z;

		var e = m.elements;
		var d = 1 / ( e[3] * x + e[7] * y + e[11] * z + e[15] ); // perspective divide

		this.x = ( e[0] * x + e[4] * y + e[8]  * z + e[12] ) * d;
		this.y = ( e[1] * x + e[5] * y + e[9]  * z + e[13] ) * d;
		this.z = ( e[2] * x + e[6] * y + e[10] * z + e[14] ) * d;

		return this;

	},

	applyQuaternion: function ( q ) {

		var x = this.x;
		var y = this.y;
		var z = this.z;

		var qx = q.x;
		var qy = q.y;
		var qz = q.z;
		var qw = q.w;

		// calculate quat * vector

		var ix =  qw * x + qy * z - qz * y;
		var iy =  qw * y + qz * x - qx * z;
		var iz =  qw * z + qx * y - qy * x;
		var iw = -qx * x - qy * y - qz * z;

		// calculate result * inverse quat

		this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
		this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
		this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;

		return this;

	},

	divideScalar: function ( scalar ) {

		if ( scalar !== 0 ) {

			var invScalar = 1 / scalar;

			this.x *= invScalar;
			this.y *= invScalar;
			this.z *= invScalar;

		} else {

			this.x = 0;
			this.y = 0;
			this.z = 0;

		}

		return this;

	},

	length: function () {

		return Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z );

	},

	normalize: function () {

		return this.divideScalar( this.length() );

	},

	setLength: function ( l ) {

		var oldLength = this.length();

		if ( oldLength !== 0 && l !== oldLength  ) {

			this.multiplyScalar( l / oldLength );
		}

		return this;

	},

	setFromMatrixPosition: function ( m ) {

		this.x = m.elements[ 12 ];
		this.y = m.elements[ 13 ];
		this.z = m.elements[ 14 ];

		return this;

	},

	setFromMatrixScale: function ( m ) {

		var sx = this.set( m.elements[ 0 ], m.elements[ 1 ], m.elements[  2 ] ).length();
		var sy = this.set( m.elements[ 4 ], m.elements[ 5 ], m.elements[  6 ] ).length();
		var sz = this.set( m.elements[ 8 ], m.elements[ 9 ], m.elements[ 10 ] ).length();

		this.x = sx;
		this.y = sy;
		this.z = sz;

		return this;
	},

	setFromMatrixColumn: function ( index, matrix ) {

		var offset = index * 4;

		var me = matrix.elements;

		this.x = me[ offset ];
		this.y = me[ offset + 1 ];
		this.z = me[ offset + 2 ];

		return this;

	},

	clone: function () {
		return new THREE.Vector3( this.x, this.y, this.z );
	}
};

//-MATRIX3
THREE.Matrix3 = function ( n11, n12, n13, n21, n22, n23, n31, n32, n33 ) {
	this.elements = new Float32Array(9);

	this.set(
		( n11 !== undefined ) ? n11 : 1, n12 || 0, n13 || 0,
		n21 || 0, ( n22 !== undefined ) ? n22 : 1, n23 || 0,
		n31 || 0, n32 || 0, ( n33 !== undefined ) ? n33 : 1
	);
};

THREE.Matrix3.prototype = {
	constructor: THREE.Matrix3,

	set: function ( n11, n12, n13, n21, n22, n23, n31, n32, n33 ) {
		var te = this.elements;

		te[0] = n11; te[3] = n12; te[6] = n13;
		te[1] = n21; te[4] = n22; te[7] = n23;
		te[2] = n31; te[5] = n32; te[8] = n33;

		return this;
	},

	multiplyScalar: function ( s ) {

		var te = this.elements;

		te[0] *= s; te[3] *= s; te[6] *= s;
		te[1] *= s; te[4] *= s; te[7] *= s;
		te[2] *= s; te[5] *= s; te[8] *= s;

		return this;

	},

	getInverse: function ( matrix, throwOnInvertible ) {

		// input: THREE.Matrix4
		// ( based on http://code.google.com/p/webgl-mjs/ )

		var me = matrix.elements;
		var te = this.elements;

		te[ 0 ] =   me[10] * me[5] - me[6] * me[9];
		te[ 1 ] = - me[10] * me[1] + me[2] * me[9];
		te[ 2 ] =   me[6] * me[1] - me[2] * me[5];
		te[ 3 ] = - me[10] * me[4] + me[6] * me[8];
		te[ 4 ] =   me[10] * me[0] - me[2] * me[8];
		te[ 5 ] = - me[6] * me[0] + me[2] * me[4];
		te[ 6 ] =   me[9] * me[4] - me[5] * me[8];
		te[ 7 ] = - me[9] * me[0] + me[1] * me[8];
		te[ 8 ] =   me[5] * me[0] - me[1] * me[4];

		var det = me[ 0 ] * te[ 0 ] + me[ 1 ] * te[ 3 ] + me[ 2 ] * te[ 6 ];

		// no inverse

		if ( det === 0 ) {
			var msg = "Matrix3.getInverse(): can't invert matrix, determinant is 0";

			if ( throwOnInvertible || false )
				throw new Error( msg );

			else
				console.warn( msg );

			this.identity();

			return this;
		}

		this.multiplyScalar( 1.0 / det );

		return this;
	},

	transpose: function () {
		var tmp, m = this.elements;

		tmp = m[1]; m[1] = m[3]; m[3] = tmp;
		tmp = m[2]; m[2] = m[6]; m[6] = tmp;
		tmp = m[5]; m[5] = m[7]; m[7] = tmp;

		return this;
	},

	getNormalMatrix: function ( m ) {
		this.getInverse( m ).transpose();
		return this;
	}
};


//-PLANE
THREE.Plane = function ( normal, constant ) {
	this.normal = ( normal !== undefined ) ? normal : new THREE.Vector3( 1, 0, 0 );
	this.constant = ( constant !== undefined ) ? constant : 0;
};

THREE.Plane.prototype = {
	constructor: THREE.Plane,

	setComponents: function ( x, y, z, w ) {
		this.normal.set( x, y, z );
		this.constant = w;

		return this;
	},

	copy: function ( plane ) {
		this.normal.copy( plane.normal );
		this.constant = plane.constant;

		return this;
	},

	normalize: function () {
		var inverseNormalLength = 1.0 / this.normal.length();
		this.normal.multiplyScalar( inverseNormalLength );
		this.constant *= inverseNormalLength;

		return this;
	},

	equals: function ( plane ) {
		return plane.normal.equals( this.normal ) && ( plane.constant == this.constant );
	},

	clone: function () {
		return new THREE.Plane().copy( this );
	}
};

//-FRUSTUM
THREE.Frustum = function ( p0, p1, p2, p3, p4, p5 ) {

	this.planes = [
		( p0 !== undefined ) ? p0 : new THREE.Plane(),
		( p1 !== undefined ) ? p1 : new THREE.Plane(),
		( p2 !== undefined ) ? p2 : new THREE.Plane(),
		( p3 !== undefined ) ? p3 : new THREE.Plane(),
		( p4 !== undefined ) ? p4 : new THREE.Plane(),
		( p5 !== undefined ) ? p5 : new THREE.Plane()
	];
};

THREE.Frustum.prototype = {
	constructor: THREE.Frustum,

	setFromMatrix: function ( m ) {

		var planes = this.planes;
		var me = m.elements;
		var me0 = me[0], me1 = me[1], me2 = me[2], me3 = me[3];
		var me4 = me[4], me5 = me[5], me6 = me[6], me7 = me[7];
		var me8 = me[8], me9 = me[9], me10 = me[10], me11 = me[11];
		var me12 = me[12], me13 = me[13], me14 = me[14], me15 = me[15];

		planes[ 0 ].setComponents( me3 - me0, me7 - me4, me11 - me8, me15 - me12 ).normalize();
		planes[ 1 ].setComponents( me3 + me0, me7 + me4, me11 + me8, me15 + me12 ).normalize();
		planes[ 2 ].setComponents( me3 + me1, me7 + me5, me11 + me9, me15 + me13 ).normalize();
		planes[ 3 ].setComponents( me3 - me1, me7 - me5, me11 - me9, me15 - me13 ).normalize();
		planes[ 4 ].setComponents( me3 - me2, me7 - me6, me11 - me10, me15 - me14 ).normalize();
		planes[ 5 ].setComponents( me3 + me2, me7 + me6, me11 + me10, me15 + me14 ).normalize();

		return this;

	},

	intersectsBox : function() {
		var p1 = new THREE.Vector3(),
			p2 = new THREE.Vector3();

		return function( box ) {
			var planes = this.planes;
			
			for ( var i = 0; i < 6 ; i ++ ) {
				var plane = planes[i];
				
				p1.x = plane.normal.x > 0 ? box.min.x : box.max.x;
				p2.x = plane.normal.x > 0 ? box.max.x : box.min.x;
				p1.y = plane.normal.y > 0 ? box.min.y : box.max.y;
				p2.y = plane.normal.y > 0 ? box.max.y : box.min.y;
				p1.z = plane.normal.z > 0 ? box.min.z : box.max.z;
				p2.z = plane.normal.z > 0 ? box.max.z : box.min.z;

				var d1 = plane.distanceToPoint( p1 );
				var d2 = plane.distanceToPoint( p2 );

				if ( d1 < 0 && d2 < 0 )
					return false;
			}

			return true;
		};

	}()
};

//-MATRIX4
THREE.Matrix4 = function ( n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44 ) {

	this.elements = new Float32Array( 16 );

	// TODO: if n11 is undefined, then just set to identity, otherwise copy all other values into matrix
	//   we should not support semi specification of Matrix4, it is just weird.

	var te = this.elements;

	te[0] = ( n11 !== undefined ) ? n11 : 1; te[4] = n12 || 0; te[8] = n13 || 0; te[12] = n14 || 0;
	te[1] = n21 || 0; te[5] = ( n22 !== undefined ) ? n22 : 1; te[9] = n23 || 0; te[13] = n24 || 0;
	te[2] = n31 || 0; te[6] = n32 || 0; te[10] = ( n33 !== undefined ) ? n33 : 1; te[14] = n34 || 0;
	te[3] = n41 || 0; te[7] = n42 || 0; te[11] = n43 || 0; te[15] = ( n44 !== undefined ) ? n44 : 1;

};

THREE.Matrix4.prototype = {
	constructor: THREE.Matrix4,

	copy: function ( m ) {
		this.elements.set( m.elements );

		return this;
	},

	extractRotation: function () {
		var v1 = new THREE.Vector3();

		return function ( m ) {
			var te = this.elements;
			var me = m.elements;

			var scaleX = 1 / v1.set( me[0], me[1], me[2] ).length();
			var scaleY = 1 / v1.set( me[4], me[5], me[6] ).length();
			var scaleZ = 1 / v1.set( me[8], me[9], me[10] ).length();

			te[0] = me[0] * scaleX;
			te[1] = me[1] * scaleX;
			te[2] = me[2] * scaleX;

			te[4] = me[4] * scaleY;
			te[5] = me[5] * scaleY;
			te[6] = me[6] * scaleY;

			te[8] = me[8] * scaleZ;
			te[9] = me[9] * scaleZ;
			te[10] = me[10] * scaleZ;

			return this;
		};
	}(),

	makeRotationFromQuaternion: function ( q ) { 

		var te = this.elements;

		var x = q.x, y = q.y, z = q.z, w = q.w;
		var x2 = x + x, y2 = y + y, z2 = z + z;
		var xx = x * x2, xy = x * y2, xz = x * z2;
		var yy = y * y2, yz = y * z2, zz = z * z2;
		var wx = w * x2, wy = w * y2, wz = w * z2;

		te[0] = 1 - ( yy + zz );
		te[4] = xy - wz;
		te[8] = xz + wy;

		te[1] = xy + wz;
		te[5] = 1 - ( xx + zz );
		te[9] = yz - wx;

		te[2] = xz - wy;
		te[6] = yz + wx;
		te[10] = 1 - ( xx + yy );

		// last column
		te[3] = 0;
		te[7] = 0;
		te[11] = 0;

		// bottom row
		te[12] = 0;
		te[13] = 0;
		te[14] = 0;
		te[15] = 1;

		return this;
	},

	lookAt: function() {

		var x = new THREE.Vector3();
		var y = new THREE.Vector3();
		var z = new THREE.Vector3();

		return function ( eye, target, up ) {

			var te = this.elements;

			z.subVectors( eye, target ).normalize();

			if ( z.length() === 0 ) {

				z.z = 1;

			}

			x.crossVectors( up, z ).normalize();

			if ( x.length() === 0 ) {

				z.x += 0.0001;
				x.crossVectors( up, z ).normalize();

			}

			y.crossVectors( z, x );


			te[0] = x.x; te[4] = y.x; te[8] = z.x;
			te[1] = x.y; te[5] = y.y; te[9] = z.y;
			te[2] = x.z; te[6] = y.z; te[10] = z.z;

			return this;

		};
	}(),

	multiplyMatrices: function ( a, b ) {

		var ae = a.elements;
		var be = b.elements;
		var te = this.elements;

		var a11 = ae[0], a12 = ae[4], a13 = ae[8], a14 = ae[12];
		var a21 = ae[1], a22 = ae[5], a23 = ae[9], a24 = ae[13];
		var a31 = ae[2], a32 = ae[6], a33 = ae[10], a34 = ae[14];
		var a41 = ae[3], a42 = ae[7], a43 = ae[11], a44 = ae[15];

		var b11 = be[0], b12 = be[4], b13 = be[8], b14 = be[12];
		var b21 = be[1], b22 = be[5], b23 = be[9], b24 = be[13];
		var b31 = be[2], b32 = be[6], b33 = be[10], b34 = be[14];
		var b41 = be[3], b42 = be[7], b43 = be[11], b44 = be[15];

		te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
		te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
		te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
		te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

		te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
		te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
		te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
		te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

		te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
		te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
		te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
		te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

		te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
		te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
		te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
		te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

		return this;
	},

	multiplyScalar: function ( s ) {

		var te = this.elements;

		te[0] *= s; te[4] *= s; te[8] *= s; te[12] *= s;
		te[1] *= s; te[5] *= s; te[9] *= s; te[13] *= s;
		te[2] *= s; te[6] *= s; te[10] *= s; te[14] *= s;
		te[3] *= s; te[7] *= s; te[11] *= s; te[15] *= s;

		return this;
	},

	multiplyVector3Array: function() {

		var v1 = new THREE.Vector3();

		return function ( a ) {

			for ( var i = 0, il = a.length; i < il; i += 3 ) {

				v1.x = a[ i ];
				v1.y = a[ i + 1 ];
				v1.z = a[ i + 2 ];

				v1.applyProjection( this );

				a[ i ]     = v1.x;
				a[ i + 1 ] = v1.y;
				a[ i + 2 ] = v1.z;

			}

			return a;

		};
	}(),

	setPosition: function ( v ) {

		var te = this.elements;

		te[12] = v.x;
		te[13] = v.y;
		te[14] = v.z;

		return this;
	},

	getInverse: function ( m, throwOnInvertible ) {

		// based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
		var te = this.elements;
		var me = m.elements;

		var n11 = me[0], n12 = me[4], n13 = me[8], n14 = me[12];
		var n21 = me[1], n22 = me[5], n23 = me[9], n24 = me[13];
		var n31 = me[2], n32 = me[6], n33 = me[10], n34 = me[14];
		var n41 = me[3], n42 = me[7], n43 = me[11], n44 = me[15];

		te[0] = n23*n34*n42 - n24*n33*n42 + n24*n32*n43 - n22*n34*n43 - n23*n32*n44 + n22*n33*n44;
		te[4] = n14*n33*n42 - n13*n34*n42 - n14*n32*n43 + n12*n34*n43 + n13*n32*n44 - n12*n33*n44;
		te[8] = n13*n24*n42 - n14*n23*n42 + n14*n22*n43 - n12*n24*n43 - n13*n22*n44 + n12*n23*n44;
		te[12] = n14*n23*n32 - n13*n24*n32 - n14*n22*n33 + n12*n24*n33 + n13*n22*n34 - n12*n23*n34;
		te[1] = n24*n33*n41 - n23*n34*n41 - n24*n31*n43 + n21*n34*n43 + n23*n31*n44 - n21*n33*n44;
		te[5] = n13*n34*n41 - n14*n33*n41 + n14*n31*n43 - n11*n34*n43 - n13*n31*n44 + n11*n33*n44;
		te[9] = n14*n23*n41 - n13*n24*n41 - n14*n21*n43 + n11*n24*n43 + n13*n21*n44 - n11*n23*n44;
		te[13] = n13*n24*n31 - n14*n23*n31 + n14*n21*n33 - n11*n24*n33 - n13*n21*n34 + n11*n23*n34;
		te[2] = n22*n34*n41 - n24*n32*n41 + n24*n31*n42 - n21*n34*n42 - n22*n31*n44 + n21*n32*n44;
		te[6] = n14*n32*n41 - n12*n34*n41 - n14*n31*n42 + n11*n34*n42 + n12*n31*n44 - n11*n32*n44;
		te[10] = n12*n24*n41 - n14*n22*n41 + n14*n21*n42 - n11*n24*n42 - n12*n21*n44 + n11*n22*n44;
		te[14] = n14*n22*n31 - n12*n24*n31 - n14*n21*n32 + n11*n24*n32 + n12*n21*n34 - n11*n22*n34;
		te[3] = n23*n32*n41 - n22*n33*n41 - n23*n31*n42 + n21*n33*n42 + n22*n31*n43 - n21*n32*n43;
		te[7] = n12*n33*n41 - n13*n32*n41 + n13*n31*n42 - n11*n33*n42 - n12*n31*n43 + n11*n32*n43;
		te[11] = n13*n22*n41 - n12*n23*n41 - n13*n21*n42 + n11*n23*n42 + n12*n21*n43 - n11*n22*n43;
		te[15] = n12*n23*n31 - n13*n22*n31 + n13*n21*n32 - n11*n23*n32 - n12*n21*n33 + n11*n22*n33;

		var det = n11 * te[ 0 ] + n21 * te[ 4 ] + n31 * te[ 8 ] + n41 * te[ 12 ];

		if ( det == 0 ) {

			var msg = "Matrix4.getInverse(): can't invert matrix, determinant is 0";

			if ( throwOnInvertible || false ) {

				throw new Error( msg ); 

			} else {

				console.warn( msg );

			}

			this.identity();

			return this;
		}

		this.multiplyScalar( 1 / det );

		return this;
	},

	scale: function ( v ) {

		var te = this.elements;
		var x = v.x, y = v.y, z = v.z;

		te[0] *= x; te[4] *= y; te[8] *= z;
		te[1] *= x; te[5] *= y; te[9] *= z;
		te[2] *= x; te[6] *= y; te[10] *= z;
		te[3] *= x; te[7] *= y; te[11] *= z;

		return this;
	},

	compose: function ( position, quaternion, scale ) {

		this.makeRotationFromQuaternion( quaternion );
		this.scale( scale );
		this.setPosition( position );

		return this;
	},

	decompose: function () {

		var vector = new THREE.Vector3();
		var matrix = new THREE.Matrix4();

		return function ( position, quaternion, scale ) {

			var te = this.elements;

			var sx = vector.set( te[0], te[1], te[2] ).length();
			var sy = vector.set( te[4], te[5], te[6] ).length();
			var sz = vector.set( te[8], te[9], te[10] ).length();

			// if determine is negative, we need to invert one scale
			var det = this.determinant();
			if( det < 0 ) {
				sx = -sx;
			}

			position.x = te[12];
			position.y = te[13];
			position.z = te[14];

			// scale the rotation part

			matrix.elements.set( this.elements ); // at this point matrix is incomplete so we can't use .copy()

			var invSX = 1 / sx;
			var invSY = 1 / sy;
			var invSZ = 1 / sz;

			matrix.elements[0] *= invSX;
			matrix.elements[1] *= invSX;
			matrix.elements[2] *= invSX;

			matrix.elements[4] *= invSY;
			matrix.elements[5] *= invSY;
			matrix.elements[6] *= invSY;

			matrix.elements[8] *= invSZ;
			matrix.elements[9] *= invSZ;
			matrix.elements[10] *= invSZ;

			quaternion.setFromRotationMatrix( matrix );

			scale.x = sx;
			scale.y = sy;
			scale.z = sz;

			return this;

		};
	}(),

	makeFrustum: function ( left, right, bottom, top, near, far ) {
		var te = this.elements;
		var x = 2 * near / ( right - left );
		var y = 2 * near / ( top - bottom );

		var a = ( right + left ) / ( right - left );
		var b = ( top + bottom ) / ( top - bottom );
		var c = - ( far + near ) / ( far - near );
		var d = - 2 * far * near / ( far - near );

		te[0] = x;	te[4] = 0;	te[8] = a;	te[12] = 0;
		te[1] = 0;	te[5] = y;	te[9] = b;	te[13] = 0;
		te[2] = 0;	te[6] = 0;	te[10] = c;	te[14] = d;
		te[3] = 0;	te[7] = 0;	te[11] = - 1;	te[15] = 0;

		return this;
	},

	makePerspective: function ( fov, aspect, near, far ) {
		var ymax = near * Math.tan( THREE.Math.degToRad( fov * 0.5 ) );
		var ymin = - ymax;
		var xmin = ymin * aspect;
		var xmax = ymax * aspect;

		return this.makeFrustum( xmin, xmax, ymin, ymax, near, far );
	},

	makeOrthographic: function ( left, right, top, bottom, near, far ) {
		var te = this.elements;
		var w = right - left;
		var h = top - bottom;
		var p = far - near;

		var x = ( right + left ) / w;
		var y = ( top + bottom ) / h;
		var z = ( far + near ) / p;

		te[0] = 2 / w;	te[4] = 0;	te[8] = 0;	te[12] = -x;
		te[1] = 0;	te[5] = 2 / h;	te[9] = 0;	te[13] = -y;
		te[2] = 0;	te[6] = 0;	te[10] = -2/p;	te[14] = -z;
		te[3] = 0;	te[7] = 0;	te[11] = 0;	te[15] = 1;

		return this;
	},

	clone: function () {
		var te = this.elements;

		return new THREE.Matrix4(
			te[0], te[4], te[8], te[12],
			te[1], te[5], te[9], te[13],
			te[2], te[6], te[10], te[14],
			te[3], te[7], te[11], te[15]
		);
	}
};

//-QUATERNION
THREE.Quaternion = function ( x, y, z, w ) {
	this._x = x || 0;
	this._y = y || 0;
	this._z = z || 0;
	this._w = ( w !== undefined ) ? w : 1;
};

THREE.Quaternion.prototype = {
	constructor: THREE.Quaternion,
	_x: 0,_y: 0, _z: 0, _w: 0,
	_euler: undefined,

	_updateEuler: function ( callback ) {
		if ( this._euler !== undefined )
			this._euler.setFromQuaternion( this, undefined, false );
	},

	get x () {
		return this._x;
	},

	set x ( value ) {
		this._x = value;
		this._updateEuler();
	},

	get y () {
		return this._y;
	},

	set y ( value ) {
		this._y = value;
		this._updateEuler();
	},

	get z () {
		return this._z;
	},

	set z ( value ) {
		this._z = value;
		this._updateEuler();
	},

	get w () {
		return this._w;
	},

	set w ( value ) {
		this._w = value;
		this._updateEuler();
	},

	set: function ( x, y, z, w ) {
		this._x = x;
		this._y = y;
		this._z = z;
		this._w = w;

		this._updateEuler();

		return this;
	},

	copy: function ( quaternion ) {
		this._x = quaternion._x;
		this._y = quaternion._y;
		this._z = quaternion._z;
		this._w = quaternion._w;

		this._updateEuler();

		return this;
	},

	setFromEuler: function ( euler, update ) {
		if ( euler instanceof THREE.Euler === false )
			throw new Error( 'ERROR: Quaternion\'s .setFromEuler() now expects a Euler rotation rather than a Vector3 and order.  Please update your code.' );

		// http://www.mathworks.com/matlabcentral/fileexchange/
		// 	20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/
		//	content/SpinCalc.m

		var c1 = Math.cos( euler._x / 2 );
		var c2 = Math.cos( euler._y / 2 );
		var c3 = Math.cos( euler._z / 2 );
		var s1 = Math.sin( euler._x / 2 );
		var s2 = Math.sin( euler._y / 2 );
		var s3 = Math.sin( euler._z / 2 );

		switch(euler.order){
			case 'XYZ': 
					this._x = s1 * c2 * c3 + c1 * s2 * s3;
					this._y = c1 * s2 * c3 - s1 * c2 * s3;
					this._z = c1 * c2 * s3 + s1 * s2 * c3;
					this._w = c1 * c2 * c3 - s1 * s2 * s3;

				break;
			case 'YXZ':
					this._x = s1 * c2 * c3 + c1 * s2 * s3;
					this._y = c1 * s2 * c3 - s1 * c2 * s3;
					this._z = c1 * c2 * s3 - s1 * s2 * c3;
					this._w = c1 * c2 * c3 + s1 * s2 * s3;
				break;
			case 'ZXY':
					this._x = s1 * c2 * c3 - c1 * s2 * s3;
					this._y = c1 * s2 * c3 + s1 * c2 * s3;
					this._z = c1 * c2 * s3 + s1 * s2 * c3;
					this._w = c1 * c2 * c3 - s1 * s2 * s3;
				break;
			case 'ZYX':
					this._x = s1 * c2 * c3 - c1 * s2 * s3;
					this._y = c1 * s2 * c3 + s1 * c2 * s3;
					this._z = c1 * c2 * s3 - s1 * s2 * c3;
					this._w = c1 * c2 * c3 + s1 * s2 * s3;
				break;
			case 'YZX':
					this._x = s1 * c2 * c3 + c1 * s2 * s3;
					this._y = c1 * s2 * c3 + s1 * c2 * s3;
					this._z = c1 * c2 * s3 - s1 * s2 * c3;
					this._w = c1 * c2 * c3 - s1 * s2 * s3;
				break;
			case 'XZY':
					this._x = s1 * c2 * c3 - c1 * s2 * s3;
					this._y = c1 * s2 * c3 - s1 * c2 * s3;
					this._z = c1 * c2 * s3 + s1 * s2 * c3;
					this._w = c1 * c2 * c3 + s1 * s2 * s3;
			break;
		}

		if ( update !== false ) this._updateEuler();

		return this;
	}
};

THREE.Quaternion.slerp = function ( qa, qb, qm, t ) {

	return qm.copy( qa ).slerp( qb, t );

}


//-OBJECT3D
THREE.Object3D = function () {
	this.id = THREE.Object3DIdCount ++;
	this.uuid = THREE.Math.generateUUID();

	this.name = '';

	this.parent = undefined;
	this.children = [];

	this.up = new THREE.Vector3( 0, 1, 0 );

	this.position = new THREE.Vector3();
	this._rotation = new THREE.Euler();
	this._quaternion = new THREE.Quaternion();
	this.scale = new THREE.Vector3( 1, 1, 1 );

	// keep rotation and quaternion in sync

	this._rotation._quaternion = this.quaternion;
	this._quaternion._euler = this.rotation;

	this.renderDepth = null;

	this.rotationAutoUpdate = true;

	this.matrix = new THREE.Matrix4();
	this.matrixWorld = new THREE.Matrix4();

	this.matrixAutoUpdate = true;
	this.matrixWorldNeedsUpdate = true;

	this.visible = true;

	this.castShadow = false;
	this.receiveShadow = false;

	this.frustumCulled = true;

	this.userData = {};
};

THREE.Object3D.prototype = {

	constructor: THREE.Object3D,
	
	get rotation () { 
		return this._rotation; 
	},

	set rotation ( value ) {
		
		this._rotation = value;
		this._rotation._quaternion = this._quaternion;
		this._quaternion._euler = this._rotation;
		this._rotation._updateQuaternion();
		
	},

	get quaternion () { 
		return this._quaternion; 
	},
	
	set quaternion ( value ) {
		
		this._quaternion = value;
		this._quaternion._euler = this._rotation;
		this._rotation._quaternion = this._quaternion;
		this._quaternion._updateEuler();
		
	},

	applyMatrix: function ( matrix ) {
		this.matrix.multiplyMatrices( matrix, this.matrix );
		this.matrix.decompose( this.position, this.quaternion, this.scale );
	},

	setRotationFromAxisAngle: function ( axis, angle ) {
		this.quaternion.setFromAxisAngle( axis, angle );
	},

	setRotationFromEuler: function ( euler ) {
		this.quaternion.setFromEuler( euler, true );
	},

	setRotationFromMatrix: function ( m ) {
		this.quaternion.setFromRotationMatrix( m );
	},

	setRotationFromQuaternion: function ( q ) {
		this.quaternion.copy( q );
	},

	rotateOnAxis: function() {
		var q1 = new THREE.Quaternion();

		return function ( axis, angle ) {
			q1.setFromAxisAngle( axis, angle );
			this.quaternion.multiply( q1 );

			return this;
		}
	}(),

	rotateX: function () {
		var v1 = new THREE.Vector3( 1, 0, 0 );

		return function ( angle ) {
			return this.rotateOnAxis( v1, angle );
		};
	}(),

	rotateY: function () {
		var v1 = new THREE.Vector3( 0, 1, 0 );

		return function ( angle ) {
			return this.rotateOnAxis( v1, angle );
		};
	}(),

	rotateZ: function () {
		var v1 = new THREE.Vector3( 0, 0, 1 );

		return function ( angle ) {
			return this.rotateOnAxis( v1, angle );
		};
	}(),

	translateOnAxis: function () {
		// translate object by distance along axis in object space
		// axis is assumed to be normalized

		var v1 = new THREE.Vector3();

		return function ( axis, distance ) {
			v1.copy( axis );
			v1.applyQuaternion( this.quaternion );
			this.position.add( v1.multiplyScalar( distance ) );

			return this;
		}
	}(),

	translateX: function () {
		var v1 = new THREE.Vector3( 1, 0, 0 );

		return function ( distance ) {
			return this.translateOnAxis( v1, distance );
		};
	}(),

	translateY: function () {
		var v1 = new THREE.Vector3( 0, 1, 0 );

		return function ( distance ) {
			return this.translateOnAxis( v1, distance );
		};
	}(),

	translateZ: function () {
		var v1 = new THREE.Vector3( 0, 0, 1 );

		return function ( distance ) {
			return this.translateOnAxis( v1, distance );
		};
	}(),

	localToWorld: function ( vector ) {
		return vector.applyMatrix4( this.matrixWorld );
	},

	worldToLocal: function () {
		var m1 = new THREE.Matrix4();

		return function ( vector ) {
			return vector.applyMatrix4( m1.getInverse( this.matrixWorld ) );
		};
	}(),

	lookAt: function () {
		// This routine does not support objects with rotated and/or translated parent(s)
		var m1 = new THREE.Matrix4();

		return function ( vector ) {
			m1.lookAt( vector, this.position, this.up );
			this.quaternion.setFromRotationMatrix( m1 );
		};
	}(),

	add: function ( object ) {
		if ( object === this ) {
			console.warn( 'THREE.Object3D.add: An object can\'t be added as a child of itself.' );
			return;
		}

		if ( object instanceof THREE.Object3D ) {
			if ( object.parent !== undefined )
				object.parent.remove( object );

			object.parent = this;
			object.dispatchEvent( { type: 'added' } );

			this.children.push( object );

			// add to scene

			var scene = this;

			while ( scene.parent !== undefined )
				scene = scene.parent;

			if ( scene !== undefined && scene instanceof THREE.Scene )
				scene.__addObject( object );
		}

	},

	remove: function ( object ) {
		var index = this.children.indexOf( object );

		if ( index !== - 1 ) {
			object.parent = undefined;
			object.dispatchEvent( { type: 'removed' } );

			this.children.splice( index, 1 );

			var scene = this;

			while ( scene.parent !== undefined )
				scene = scene.parent;

			if ( scene !== undefined && scene instanceof THREE.Scene )
				scene.__removeObject( object );
		}
	},

	traverse: function ( callback ) {
		callback( this );

		for ( var i = 0, l = this.children.length; i < l; i ++ )
			this.children[ i ].traverse( callback );
	},

	getObjectById: function ( id, recursive ) {
		for ( var i = 0, l = this.children.length; i < l; i ++ ) {

			var child = this.children[ i ];

			if ( child.id === id )
				return child;

			if ( recursive === true ){
				child = child.getObjectById( id, recursive );

				if ( child !== undefined )
					return child;
			}
		}

		return undefined;
	},

	getObjectByName: function ( name, recursive ) {
		for ( var i = 0, l = this.children.length; i < l; i ++ ) {
			var child = this.children[ i ];

			if ( child.name === name )
				return child;

			if ( recursive === true ) {
				child = child.getObjectByName( name, recursive );

				if ( child !== undefined )
					return child;
			}
		}

		return undefined;
	},

	getDescendants: function ( array ) {

		if ( array === undefined ) array = [];

		Array.prototype.push.apply( array, this.children );

		for ( var i = 0, l = this.children.length; i < l; i ++ ) {

			this.children[ i ].getDescendants( array );

		}

		return array;

	},

	updateMatrix: function () {

		this.matrix.compose( this.position, this.quaternion, this.scale );

		this.matrixWorldNeedsUpdate = true;

	},

	updateMatrixWorld: function ( force ) {

		if ( this.matrixAutoUpdate === true ) this.updateMatrix();

		if ( this.matrixWorldNeedsUpdate === true || force === true ) {

			if ( this.parent === undefined ) {

				this.matrixWorld.copy( this.matrix );

			} else {

				this.matrixWorld.multiplyMatrices( this.parent.matrixWorld, this.matrix );

			}

			this.matrixWorldNeedsUpdate = false;

			force = true;

		}

		// update children

		for ( var i = 0, l = this.children.length; i < l; i ++ ) {

			this.children[ i ].updateMatrixWorld( force );

		}

	},

	clone: function ( object, recursive ) {

		if ( object === undefined ) object = new THREE.Object3D();
		if ( recursive === undefined ) recursive = true;

		object.name = this.name;

		object.up.copy( this.up );

		object.position.copy( this.position );
		object.quaternion.copy( this.quaternion );
		object.scale.copy( this.scale );

		object.renderDepth = this.renderDepth;

		object.rotationAutoUpdate = this.rotationAutoUpdate;

		object.matrix.copy( this.matrix );
		object.matrixWorld.copy( this.matrixWorld );

		object.matrixAutoUpdate = this.matrixAutoUpdate;
		object.matrixWorldNeedsUpdate = this.matrixWorldNeedsUpdate;

		object.visible = this.visible;

		object.castShadow = this.castShadow;
		object.receiveShadow = this.receiveShadow;

		object.frustumCulled = this.frustumCulled;

		object.userData = JSON.parse( JSON.stringify( this.userData ) );

		if ( recursive === true ) {

			for ( var i = 0; i < this.children.length; i ++ ) {

				var child = this.children[ i ];
				object.add( child.clone() );

			}

		}

		return object;

	}
};

THREE.EventDispatcher.prototype.apply( THREE.Object3D.prototype );
THREE.Object3DIdCount = 0;

//-CAMERA
THREE.Camera = function () {
	THREE.Object3D.call( this );

	this.matrixWorldInverse = new THREE.Matrix4();
	this.projectionMatrix = new THREE.Matrix4();
};

THREE.Camera.prototype = Object.create( THREE.Object3D.prototype );

THREE.Camera.prototype.lookAt = function () {
	// This routine does not support cameras with rotated and/or translated parent(s)

	var m1 = new THREE.Matrix4();

	return function ( vector ) {

		m1.lookAt( this.position, vector, this.up );

		this.quaternion.setFromRotationMatrix( m1 );

	};

}();

THREE.PerspectiveCamera = function ( fov, aspect, near, far ) {
	THREE.Camera.call( this );

	this.fov = fov !== undefined ? fov : 50;
	this.aspect = aspect !== undefined ? aspect : 1;
	this.near = near !== undefined ? near : 0.1;
	this.far = far !== undefined ? far : 2000;

	this.updateProjectionMatrix();
};

THREE.PerspectiveCamera.prototype = Object.create( THREE.Camera.prototype );

THREE.PerspectiveCamera.prototype.setViewOffset = function ( fullWidth, fullHeight, x, y, width, height ) {
	this.fullWidth = fullWidth;
	this.fullHeight = fullHeight;
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;

	this.updateProjectionMatrix();
};

THREE.PerspectiveCamera.prototype.updateProjectionMatrix = function () {
	if ( this.fullWidth ) {
		var aspect = this.fullWidth / this.fullHeight;
		var top = Math.tan( THREE.Math.degToRad( this.fov * 0.5 ) ) * this.near;
		var bottom = -top;
		var left = aspect * bottom;
		var right = aspect * top;
		var width = Math.abs( right - left );
		var height = Math.abs( top - bottom );

		this.projectionMatrix.makeFrustum(
			left + this.x * width / this.fullWidth,
			left + ( this.x + this.width ) * width / this.fullWidth,
			top - ( this.y + this.height ) * height / this.fullHeight,
			top - this.y * height / this.fullHeight,
			this.near,
			this.far
		);

	} else
		this.projectionMatrix.makePerspective( this.fov, this.aspect, this.near, this.far );
};

//-FACE3
THREE.Face3 = function ( a, b, c, normal, color, materialIndex ) {

	this.a = a;
	this.b = b;
	this.c = c;

	this.normal = normal instanceof THREE.Vector3 ? normal : new THREE.Vector3();
	this.vertexNormals = normal instanceof Array ? normal : [ ];

	this.color = color instanceof THREE.Color ? color : new THREE.Color();
	this.vertexColors = color instanceof Array ? color : [];

	this.vertexTangents = [];

	this.materialIndex = materialIndex !== undefined ? materialIndex : 0;

	this.centroid = new THREE.Vector3();

};

THREE.Face3.prototype = {
	constructor: THREE.Face3,

	clone: function () {
		var face = new THREE.Face3( this.a, this.b, this.c );

		face.normal.copy( this.normal );
		face.color.copy( this.color );
		face.centroid.copy( this.centroid );

		face.materialIndex = this.materialIndex;

		var i, il;
		for ( i = 0, il = this.vertexNormals.length; i < il; i ++ ) face.vertexNormals[ i ] = this.vertexNormals[ i ].clone();
		for ( i = 0, il = this.vertexColors.length; i < il; i ++ ) face.vertexColors[ i ] = this.vertexColors[ i ].clone();
		for ( i = 0, il = this.vertexTangents.length; i < il; i ++ ) face.vertexTangents[ i ] = this.vertexTangents[ i ].clone();

		return face;
	}
};


//-WEBGLRENDERER
THREE.WebGLRenderer = function ( parameters ) {
	console.log( 'THREE.WebGLRenderer', THREE.REVISION );

	parameters = parameters || {};

	var _canvas = parameters.canvas !== undefined ? parameters.canvas : document.createElement( 'canvas' ),
	_context = parameters.context !== undefined ? parameters.context : null,

	_precision = parameters.precision !== undefined ? parameters.precision : 'highp',

	_buffers = {},

	_alpha = parameters.alpha !== undefined ? parameters.alpha : false,
	_premultipliedAlpha = parameters.premultipliedAlpha !== undefined ? parameters.premultipliedAlpha : true,
	_antialias = parameters.antialias !== undefined ? parameters.antialias : false,
	_stencil = parameters.stencil !== undefined ? parameters.stencil : true,
	_preserveDrawingBuffer = parameters.preserveDrawingBuffer !== undefined ? parameters.preserveDrawingBuffer : false,

	_clearColor = new THREE.Color( 0x000000 ),
	_clearAlpha = 0;

	// public properties

	this.domElement = _canvas;
	this.context = null;
	this.devicePixelRatio = parameters.devicePixelRatio !== undefined
				? parameters.devicePixelRatio
				: self.devicePixelRatio !== undefined
					? self.devicePixelRatio
					: 1;

	// clearing

	this.autoClear = true;
	this.autoClearColor = true;
	this.autoClearDepth = true;
	this.autoClearStencil = true;

	// scene graph

	this.sortObjects = true;
	this.autoUpdateObjects = true;

	// physically based shading

	this.gammaInput = false;
	this.gammaOutput = false;

	// shadow map

	this.shadowMapEnabled = false;
	this.shadowMapAutoUpdate = true;
	this.shadowMapType = THREE.PCFShadowMap;
	this.shadowMapCullFace = THREE.CullFaceFront;
	this.shadowMapDebug = false;
	this.shadowMapCascade = false;

	// morphs

	this.maxMorphTargets = 8;
	this.maxMorphNormals = 4;

	// flags

	this.autoScaleCubemaps = true;

	// custom render plugins

	this.renderPluginsPre = [];
	this.renderPluginsPost = [];

	// info

	this.info = {

		memory: {

			programs: 0,
			geometries: 0,
			textures: 0

		},

		render: {

			calls: 0,
			vertices: 0,
			faces: 0,
			points: 0

		}

	};

	// internal properties

	var _this = this,

	_programs = [],
	_programs_counter = 0,

	// internal state cache

	_currentProgram = null,
	_currentFramebuffer = null,
	_currentMaterialId = -1,
	_currentGeometryGroupHash = null,
	_currentCamera = null,

	_usedTextureUnits = 0,

	// GL state cache

	_oldDoubleSided = -1,
	_oldFlipSided = -1,

	_oldBlending = -1,

	_oldBlendEquation = -1,
	_oldBlendSrc = -1,
	_oldBlendDst = -1,

	_oldDepthTest = -1,
	_oldDepthWrite = -1,

	_oldPolygonOffset = null,
	_oldPolygonOffsetFactor = null,
	_oldPolygonOffsetUnits = null,

	_oldLineWidth = null,

	_viewportX = 0,
	_viewportY = 0,
	_viewportWidth = _canvas.width,
	_viewportHeight = _canvas.height,
	_currentWidth = 0,
	_currentHeight = 0,

	_enabledAttributes = new Uint8Array( 16 ),

	// frustum

	_frustum = new THREE.Frustum(),

	 // camera matrices cache

	_projScreenMatrix = new THREE.Matrix4(),
	_projScreenMatrixPS = new THREE.Matrix4(),

	_vector3 = new THREE.Vector3(),

	// light arrays cache

	_direction = new THREE.Vector3(),

	_lightsNeedUpdate = true,

	_lights = {

		ambient: [ 0, 0, 0 ],
		directional: { length: 0, colors: new Array(), positions: new Array() },
		point: { length: 0, colors: new Array(), positions: new Array(), distances: new Array() },
		spot: { length: 0, colors: new Array(), positions: new Array(), distances: new Array(), directions: new Array(), anglesCos: new Array(), exponents: new Array() },
		hemi: { length: 0, skyColors: new Array(), groundColors: new Array(), positions: new Array() }

	};

	// initialize

	var _gl;

	var _glExtensionTextureFloat;
	var _glExtensionTextureFloatLinear;
	var _glExtensionStandardDerivatives;
	var _glExtensionTextureFilterAnisotropic;
	var _glExtensionCompressedTextureS3TC;

	initGL();

	setDefaultGLState();

	this.context = _gl;

	// GPU capabilities

	var _maxTextures = _gl.getParameter( _gl.MAX_TEXTURE_IMAGE_UNITS );
	var _maxVertexTextures = _gl.getParameter( _gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS );
	var _maxTextureSize = _gl.getParameter( _gl.MAX_TEXTURE_SIZE );
	var _maxCubemapSize = _gl.getParameter( _gl.MAX_CUBE_MAP_TEXTURE_SIZE );

	var _maxAnisotropy = _glExtensionTextureFilterAnisotropic ? _gl.getParameter( _glExtensionTextureFilterAnisotropic.MAX_TEXTURE_MAX_ANISOTROPY_EXT ) : 0;

	var _supportsVertexTextures = ( _maxVertexTextures > 0 );
	var _supportsBoneTextures = _supportsVertexTextures && _glExtensionTextureFloat;

	var _compressedTextureFormats = _glExtensionCompressedTextureS3TC ? _gl.getParameter( _gl.COMPRESSED_TEXTURE_FORMATS ) : [];

	//

	var _vertexShaderPrecisionHighpFloat = _gl.getShaderPrecisionFormat( _gl.VERTEX_SHADER, _gl.HIGH_FLOAT );
	var _vertexShaderPrecisionMediumpFloat = _gl.getShaderPrecisionFormat( _gl.VERTEX_SHADER, _gl.MEDIUM_FLOAT );
	var _vertexShaderPrecisionLowpFloat = _gl.getShaderPrecisionFormat( _gl.VERTEX_SHADER, _gl.LOW_FLOAT );

	var _fragmentShaderPrecisionHighpFloat = _gl.getShaderPrecisionFormat( _gl.FRAGMENT_SHADER, _gl.HIGH_FLOAT );
	var _fragmentShaderPrecisionMediumpFloat = _gl.getShaderPrecisionFormat( _gl.FRAGMENT_SHADER, _gl.MEDIUM_FLOAT );
	var _fragmentShaderPrecisionLowpFloat = _gl.getShaderPrecisionFormat( _gl.FRAGMENT_SHADER, _gl.LOW_FLOAT );

	var _vertexShaderPrecisionHighpInt = _gl.getShaderPrecisionFormat( _gl.VERTEX_SHADER, _gl.HIGH_INT );
	var _vertexShaderPrecisionMediumpInt = _gl.getShaderPrecisionFormat( _gl.VERTEX_SHADER, _gl.MEDIUM_INT );
	var _vertexShaderPrecisionLowpInt = _gl.getShaderPrecisionFormat( _gl.VERTEX_SHADER, _gl.LOW_INT );

	var _fragmentShaderPrecisionHighpInt = _gl.getShaderPrecisionFormat( _gl.FRAGMENT_SHADER, _gl.HIGH_INT );
	var _fragmentShaderPrecisionMediumpInt = _gl.getShaderPrecisionFormat( _gl.FRAGMENT_SHADER, _gl.MEDIUM_INT );
	var _fragmentShaderPrecisionLowpInt = _gl.getShaderPrecisionFormat( _gl.FRAGMENT_SHADER, _gl.LOW_INT );

	// clamp precision to maximum available

	var highpAvailable = _vertexShaderPrecisionHighpFloat.precision > 0 && _fragmentShaderPrecisionHighpFloat.precision > 0;
	var mediumpAvailable = _vertexShaderPrecisionMediumpFloat.precision > 0 && _fragmentShaderPrecisionMediumpFloat.precision > 0;

	if ( _precision === "highp" && ! highpAvailable ) {
		if ( mediumpAvailable ) {
			_precision = "mediump";
			console.warn( "WebGLRenderer: highp not supported, using mediump" );

		} else {
			_precision = "lowp";
			console.warn( "WebGLRenderer: highp and mediump not supported, using lowp" );
		}
	}

	if ( _precision === "mediump" && ! mediumpAvailable ) {
		_precision = "lowp";
		console.warn( "WebGLRenderer: mediump not supported, using lowp" );
	}

	// API

	this.getContext = function () {
		return _gl;
	};

	this.supportsVertexTextures = function () {
		return _supportsVertexTextures;
	};

	this.supportsFloatTextures = function () {
		return _glExtensionTextureFloat;
	};

	this.supportsStandardDerivatives = function () {
		return _glExtensionStandardDerivatives;
	};

	this.supportsCompressedTextureS3TC = function () {
		return _glExtensionCompressedTextureS3TC;
	};

	this.getMaxAnisotropy  = function () {
		return _maxAnisotropy;
	};

	this.getPrecision = function () {
		return _precision;
	};

	this.setSize = function ( width, height, updateStyle ) {

		_canvas.width = width * this.devicePixelRatio;
		_canvas.height = height * this.devicePixelRatio;

		if ( this.devicePixelRatio !== 1 && updateStyle !== false ) {

			_canvas.style.width = width + 'px';
			_canvas.style.height = height + 'px';

		}

		this.setViewport( 0, 0, width, height );

	};

	this.setViewport = function ( x, y, width, height ) {

		_viewportX = x * this.devicePixelRatio;
		_viewportY = y * this.devicePixelRatio;

		_viewportWidth = width * this.devicePixelRatio;
		_viewportHeight = height * this.devicePixelRatio;

		_gl.viewport( _viewportX, _viewportY, _viewportWidth, _viewportHeight );

	};

	// Clearing
	this.setClearColor = function ( color, alpha ) {

		_clearColor.set( color );
		_clearAlpha = alpha !== undefined ? alpha : 1;

		_gl.clearColor( _clearColor.r, _clearColor.g, _clearColor.b, _clearAlpha );

	};

	this.getClearColor = function () {
		return _clearColor;
	};

	this.getClearAlpha = function () {
		return _clearAlpha;
	};

	this.clear = function ( color, depth, stencil ) {
		var bits = 0;

		if ( color === undefined || color ) bits |= _gl.COLOR_BUFFER_BIT;
		if ( depth === undefined || depth ) bits |= _gl.DEPTH_BUFFER_BIT;
		if ( stencil === undefined || stencil ) bits |= _gl.STENCIL_BUFFER_BIT;

		_gl.clear( bits );
	};

	this.clearColor = function () {
		_gl.clear( _gl.COLOR_BUFFER_BIT );
	};

	this.clearDepth = function () {
		_gl.clear( _gl.DEPTH_BUFFER_BIT );
	};

	this.clearStencil = function () {
		_gl.clear( _gl.STENCIL_BUFFER_BIT );
	};

	this.clearTarget = function ( renderTarget, color, depth, stencil ) {
		this.setRenderTarget( renderTarget );
		this.clear( color, depth, stencil );
	};

	function createMeshBuffers ( geometryGroup ) {

		geometryGroup.__webglVertexBuffer = _gl.createBuffer();
		geometryGroup.__webglNormalBuffer = _gl.createBuffer();
		geometryGroup.__webglTangentBuffer = _gl.createBuffer();
		geometryGroup.__webglColorBuffer = _gl.createBuffer();
		geometryGroup.__webglUVBuffer = _gl.createBuffer();
		geometryGroup.__webglUV2Buffer = _gl.createBuffer();

		geometryGroup.__webglSkinIndicesBuffer = _gl.createBuffer();
		geometryGroup.__webglSkinWeightsBuffer = _gl.createBuffer();

		geometryGroup.__webglFaceBuffer = _gl.createBuffer();
		geometryGroup.__webglLineBuffer = _gl.createBuffer();

		var m, ml;

		if ( geometryGroup.numMorphTargets ) {

			geometryGroup.__webglMorphTargetsBuffers = [];

			for ( m = 0, ml = geometryGroup.numMorphTargets; m < ml; m ++ ) {

				geometryGroup.__webglMorphTargetsBuffers.push( _gl.createBuffer() );

			}

		}

		if ( geometryGroup.numMorphNormals ) {

			geometryGroup.__webglMorphNormalsBuffers = [];

			for ( m = 0, ml = geometryGroup.numMorphNormals; m < ml; m ++ ) {

				geometryGroup.__webglMorphNormalsBuffers.push( _gl.createBuffer() );

			}

		}

		_this.info.memory.geometries ++;

	};

	// Events

	var onGeometryDispose = function ( event ) {

		var geometry = event.target;

		geometry.removeEventListener( 'dispose', onGeometryDispose );

		deallocateGeometry( geometry );

	};

	var onMaterialDispose = function ( event ) {

		var material = event.target;

		material.removeEventListener( 'dispose', onMaterialDispose );

		deallocateMaterial( material );

	};

	function initMeshBuffers ( geometryGroup, object ) {
		var geometry = object.geometry,
			faces3 = geometryGroup.faces3,

			nvertices = faces3.length * 3,
			ntris     = faces3.length * 1,
			nlines    = faces3.length * 3,

			material = getBufferMaterial( object, geometryGroup ),

			uvType = bufferGuessUVType( material ),
			normalType = bufferGuessNormalType( material ),
			vertexColorType = bufferGuessVertexColorType( material );

		geometryGroup.__vertexArray = new Float32Array( nvertices * 3 );

		if ( normalType )
			geometryGroup.__normalArray = new Float32Array( nvertices * 3 );


		geometryGroup.__faceArray = new Uint16Array( ntris * 3 );
		geometryGroup.__lineArray = new Uint16Array( nlines * 2 );


		geometryGroup.__webglFaceCount = ntris * 3;
		geometryGroup.__webglLineCount = nlines * 2;

		// custom attributes

		if ( material.attributes ) {
			if ( geometryGroup.__webglCustomAttributesList === undefined )
				geometryGroup.__webglCustomAttributesList = [];

			for ( var a in material.attributes ) {

				var originalAttribute = material.attributes[ a ];

				var attribute = {};

				for ( var property in originalAttribute )
					attribute[ property ] = originalAttribute[ property ];

				if ( !attribute.__webglInitialized || attribute.createUniqueBuffers ) {
					attribute.__webglInitialized = true;

					var size = 1;		// "f" and "i"
					switch(attribute.type){
						case "v2": size = 2; break;
						case "v3": size = 3; break;
						case "v4": size = 4; break;
						case "c" : size = 3; break;
					}

					attribute.size = size;
					attribute.array = new Float32Array( nvertices * size );

					attribute.buffer = _gl.createBuffer();
					attribute.buffer.belongsToAttribute = a;

					originalAttribute.needsUpdate = true;
					attribute.__original = originalAttribute;
				}

				geometryGroup.__webglCustomAttributesList.push( attribute );
			}
		}

		geometryGroup.__inittedArrays = true;
	};

	function getBufferMaterial( object, geometryGroup ) {
		return object.material;
	};

	function materialNeedsSmoothNormals ( material ) {
		return material && material.shading !== undefined && material.shading === THREE.SmoothShading;
	};

	function bufferGuessNormalType ( material ) {
			return THREE.FlatShading;
	};

	function bufferGuessVertexColorType( material ) {
		return false;
	};

	function bufferGuessUVType( material ) {
		return (material instanceof THREE.ShaderMaterial );
	};

	// Buffer setting
	function setMeshBuffers( geometryGroup, object, hint, dispose, material ) {
		if ( ! geometryGroup.__inittedArrays )
			return;

		var normalType = bufferGuessNormalType( material ),
		vertexColorType = bufferGuessVertexColorType( material ),
		uvType = bufferGuessUVType( material ),

		needsSmoothNormals = ( normalType === THREE.SmoothShading );

		var f, fl, fi, face,
		vertexNormals, faceNormal, normal,
		vertexColors, faceColor,
		vertexTangents,
		uv, uv2, v1, v2, v3, v4, t1, t2, t3, t4, n1, n2, n3, n4,
		c1, c2, c3, c4,
		sw1, sw2, sw3, sw4,
		si1, si2, si3, si4,
		sa1, sa2, sa3, sa4,
		sb1, sb2, sb3, sb4,
		m, ml, i, il,
		vn, uvi, uv2i,
		vk, vkl, vka,
		nka, chf, faceVertexNormals,
		a,

		vertexIndex = 0,

		offset = 0,
		offset_uv = 0,
		offset_uv2 = 0,
		offset_face = 0,
		offset_normal = 0,
		offset_tangent = 0,
		offset_line = 0,
		offset_color = 0,
		offset_skin = 0,
		offset_morphTarget = 0,
		offset_custom = 0,
		offset_customSrc = 0,

		value,

		vertexArray = geometryGroup.__vertexArray,
		uvArray = geometryGroup.__uvArray,
		uv2Array = geometryGroup.__uv2Array,
		normalArray = geometryGroup.__normalArray,
		tangentArray = geometryGroup.__tangentArray,
		colorArray = geometryGroup.__colorArray,

		skinIndexArray = geometryGroup.__skinIndexArray,
		skinWeightArray = geometryGroup.__skinWeightArray,

		morphTargetsArrays = geometryGroup.__morphTargetsArrays,
		morphNormalsArrays = geometryGroup.__morphNormalsArrays,

		customAttributes = geometryGroup.__webglCustomAttributesList,
		customAttribute,

		faceArray = geometryGroup.__faceArray,
		lineArray = geometryGroup.__lineArray,

		geometry = object.geometry, // this is shared for all chunks

		dirtyVertices = geometry.verticesNeedUpdate,
		dirtyElements = geometry.elementsNeedUpdate,
		dirtyUvs = geometry.uvsNeedUpdate,
		dirtyNormals = geometry.normalsNeedUpdate,
		dirtyTangents = geometry.tangentsNeedUpdate,
		dirtyColors = geometry.colorsNeedUpdate,
		dirtyMorphTargets = geometry.morphTargetsNeedUpdate,

		vertices = geometry.vertices,
		chunk_faces3 = geometryGroup.faces3,
		obj_faces = geometry.faces,

		obj_uvs  = geometry.faceVertexUvs[ 0 ],
		obj_uvs2 = geometry.faceVertexUvs[ 1 ],

		obj_colors = geometry.colors,

		obj_skinIndices = geometry.skinIndices,
		obj_skinWeights = geometry.skinWeights,

		morphTargets = geometry.morphTargets,
		morphNormals = geometry.morphNormals;

		if ( dirtyVertices ) {

			for ( f = 0, fl = chunk_faces3.length; f < fl; f ++ ) {

				face = obj_faces[ chunk_faces3[ f ] ];

				v1 = vertices[ face.a ];
				v2 = vertices[ face.b ];
				v3 = vertices[ face.c ];

				vertexArray[ offset ]     = v1.x;
				vertexArray[ offset + 1 ] = v1.y;
				vertexArray[ offset + 2 ] = v1.z;

				vertexArray[ offset + 3 ] = v2.x;
				vertexArray[ offset + 4 ] = v2.y;
				vertexArray[ offset + 5 ] = v2.z;

				vertexArray[ offset + 6 ] = v3.x;
				vertexArray[ offset + 7 ] = v3.y;
				vertexArray[ offset + 8 ] = v3.z;

				offset += 9;

			}

			_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryGroup.__webglVertexBuffer );
			_gl.bufferData( _gl.ARRAY_BUFFER, vertexArray, hint );

		}

		if ( dirtyMorphTargets ) {

			for ( vk = 0, vkl = morphTargets.length; vk < vkl; vk ++ ) {

				offset_morphTarget = 0;

				for ( f = 0, fl = chunk_faces3.length; f < fl; f ++ ) {

					chf = chunk_faces3[ f ];
					face = obj_faces[ chf ];

					// morph positions

					v1 = morphTargets[ vk ].vertices[ face.a ];
					v2 = morphTargets[ vk ].vertices[ face.b ];
					v3 = morphTargets[ vk ].vertices[ face.c ];

					vka = morphTargetsArrays[ vk ];

					vka[ offset_morphTarget ] 	  = v1.x;
					vka[ offset_morphTarget + 1 ] = v1.y;
					vka[ offset_morphTarget + 2 ] = v1.z;

					vka[ offset_morphTarget + 3 ] = v2.x;
					vka[ offset_morphTarget + 4 ] = v2.y;
					vka[ offset_morphTarget + 5 ] = v2.z;

					vka[ offset_morphTarget + 6 ] = v3.x;
					vka[ offset_morphTarget + 7 ] = v3.y;
					vka[ offset_morphTarget + 8 ] = v3.z;

					// morph normals

					if ( material.morphNormals ) {

						if ( needsSmoothNormals ) {

							faceVertexNormals = morphNormals[ vk ].vertexNormals[ chf ];

							n1 = faceVertexNormals.a;
							n2 = faceVertexNormals.b;
							n3 = faceVertexNormals.c;

						} else {

							n1 = morphNormals[ vk ].faceNormals[ chf ];
							n2 = n1;
							n3 = n1;

						}

						nka = morphNormalsArrays[ vk ];

						nka[ offset_morphTarget ] 	  = n1.x;
						nka[ offset_morphTarget + 1 ] = n1.y;
						nka[ offset_morphTarget + 2 ] = n1.z;

						nka[ offset_morphTarget + 3 ] = n2.x;
						nka[ offset_morphTarget + 4 ] = n2.y;
						nka[ offset_morphTarget + 5 ] = n2.z;

						nka[ offset_morphTarget + 6 ] = n3.x;
						nka[ offset_morphTarget + 7 ] = n3.y;
						nka[ offset_morphTarget + 8 ] = n3.z;

					}

					//

					offset_morphTarget += 9;

				}

				_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryGroup.__webglMorphTargetsBuffers[ vk ] );
				_gl.bufferData( _gl.ARRAY_BUFFER, morphTargetsArrays[ vk ], hint );

				if ( material.morphNormals ) {

					_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryGroup.__webglMorphNormalsBuffers[ vk ] );
					_gl.bufferData( _gl.ARRAY_BUFFER, morphNormalsArrays[ vk ], hint );

				}

			}

		}

		if ( obj_skinWeights.length ) {

			for ( f = 0, fl = chunk_faces3.length; f < fl; f ++ ) {

				face = obj_faces[ chunk_faces3[ f ]	];

				// weights

				sw1 = obj_skinWeights[ face.a ];
				sw2 = obj_skinWeights[ face.b ];
				sw3 = obj_skinWeights[ face.c ];

				skinWeightArray[ offset_skin ]     = sw1.x;
				skinWeightArray[ offset_skin + 1 ] = sw1.y;
				skinWeightArray[ offset_skin + 2 ] = sw1.z;
				skinWeightArray[ offset_skin + 3 ] = sw1.w;

				skinWeightArray[ offset_skin + 4 ] = sw2.x;
				skinWeightArray[ offset_skin + 5 ] = sw2.y;
				skinWeightArray[ offset_skin + 6 ] = sw2.z;
				skinWeightArray[ offset_skin + 7 ] = sw2.w;

				skinWeightArray[ offset_skin + 8 ]  = sw3.x;
				skinWeightArray[ offset_skin + 9 ]  = sw3.y;
				skinWeightArray[ offset_skin + 10 ] = sw3.z;
				skinWeightArray[ offset_skin + 11 ] = sw3.w;

				// indices

				si1 = obj_skinIndices[ face.a ];
				si2 = obj_skinIndices[ face.b ];
				si3 = obj_skinIndices[ face.c ];

				skinIndexArray[ offset_skin ]     = si1.x;
				skinIndexArray[ offset_skin + 1 ] = si1.y;
				skinIndexArray[ offset_skin + 2 ] = si1.z;
				skinIndexArray[ offset_skin + 3 ] = si1.w;

				skinIndexArray[ offset_skin + 4 ] = si2.x;
				skinIndexArray[ offset_skin + 5 ] = si2.y;
				skinIndexArray[ offset_skin + 6 ] = si2.z;
				skinIndexArray[ offset_skin + 7 ] = si2.w;

				skinIndexArray[ offset_skin + 8 ]  = si3.x;
				skinIndexArray[ offset_skin + 9 ]  = si3.y;
				skinIndexArray[ offset_skin + 10 ] = si3.z;
				skinIndexArray[ offset_skin + 11 ] = si3.w;

				offset_skin += 12;

			}

			if ( offset_skin > 0 ) {

				_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryGroup.__webglSkinIndicesBuffer );
				_gl.bufferData( _gl.ARRAY_BUFFER, skinIndexArray, hint );

				_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryGroup.__webglSkinWeightsBuffer );
				_gl.bufferData( _gl.ARRAY_BUFFER, skinWeightArray, hint );

			}

		}

		if ( dirtyElements ) {

			for ( f = 0, fl = chunk_faces3.length; f < fl; f ++ ) {

				faceArray[ offset_face ] 	 = vertexIndex;
				faceArray[ offset_face + 1 ] = vertexIndex + 1;
				faceArray[ offset_face + 2 ] = vertexIndex + 2;

				offset_face += 3;

				lineArray[ offset_line ]     = vertexIndex;
				lineArray[ offset_line + 1 ] = vertexIndex + 1;

				lineArray[ offset_line + 2 ] = vertexIndex;
				lineArray[ offset_line + 3 ] = vertexIndex + 2;

				lineArray[ offset_line + 4 ] = vertexIndex + 1;
				lineArray[ offset_line + 5 ] = vertexIndex + 2;

				offset_line += 6;

				vertexIndex += 3;

			}

			_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, geometryGroup.__webglFaceBuffer );
			_gl.bufferData( _gl.ELEMENT_ARRAY_BUFFER, faceArray, hint );

			_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, geometryGroup.__webglLineBuffer );
			_gl.bufferData( _gl.ELEMENT_ARRAY_BUFFER, lineArray, hint );

		}

		if ( customAttributes ) {

			for ( i = 0, il = customAttributes.length; i < il; i ++ ) {

				customAttribute = customAttributes[ i ];

				if ( ! customAttribute.__original.needsUpdate ) continue;

				offset_custom = 0;
				offset_customSrc = 0;

				if ( customAttribute.size === 1 ) {

					if ( customAttribute.boundTo === undefined || customAttribute.boundTo === "vertices" ) {

						for ( f = 0, fl = chunk_faces3.length; f < fl; f ++ ) {

							face = obj_faces[ chunk_faces3[ f ]	];

							customAttribute.array[ offset_custom ] 	   = customAttribute.value[ face.a ];
							customAttribute.array[ offset_custom + 1 ] = customAttribute.value[ face.b ];
							customAttribute.array[ offset_custom + 2 ] = customAttribute.value[ face.c ];

							offset_custom += 3;

						}

					} else if ( customAttribute.boundTo === "faces" ) {

						for ( f = 0, fl = chunk_faces3.length; f < fl; f ++ ) {

							value = customAttribute.value[ chunk_faces3[ f ] ];

							customAttribute.array[ offset_custom ] 	   = value;
							customAttribute.array[ offset_custom + 1 ] = value;
							customAttribute.array[ offset_custom + 2 ] = value;

							offset_custom += 3;

						}

					}

				} else if ( customAttribute.size === 2 ) {

					if ( customAttribute.boundTo === undefined || customAttribute.boundTo === "vertices" ) {

						for ( f = 0, fl = chunk_faces3.length; f < fl; f ++ ) {

							face = obj_faces[ chunk_faces3[ f ]	];

							v1 = customAttribute.value[ face.a ];
							v2 = customAttribute.value[ face.b ];
							v3 = customAttribute.value[ face.c ];

							customAttribute.array[ offset_custom ] 	   = v1.x;
							customAttribute.array[ offset_custom + 1 ] = v1.y;

							customAttribute.array[ offset_custom + 2 ] = v2.x;
							customAttribute.array[ offset_custom + 3 ] = v2.y;

							customAttribute.array[ offset_custom + 4 ] = v3.x;
							customAttribute.array[ offset_custom + 5 ] = v3.y;

							offset_custom += 6;

						}

					} else if ( customAttribute.boundTo === "faces" ) {

						for ( f = 0, fl = chunk_faces3.length; f < fl; f ++ ) {

							value = customAttribute.value[ chunk_faces3[ f ] ];

							v1 = value;
							v2 = value;
							v3 = value;

							customAttribute.array[ offset_custom ] 	   = v1.x;
							customAttribute.array[ offset_custom + 1 ] = v1.y;

							customAttribute.array[ offset_custom + 2 ] = v2.x;
							customAttribute.array[ offset_custom + 3 ] = v2.y;

							customAttribute.array[ offset_custom + 4 ] = v3.x;
							customAttribute.array[ offset_custom + 5 ] = v3.y;

							offset_custom += 6;

						}

					}

				} else if ( customAttribute.size === 3 ) {

					var pp;

					if ( customAttribute.type === "c" ) {

						pp = [ "r", "g", "b" ];

					} else {

						pp = [ "x", "y", "z" ];

					}

					if ( customAttribute.boundTo === undefined || customAttribute.boundTo === "vertices" ) {

						for ( f = 0, fl = chunk_faces3.length; f < fl; f ++ ) {

							face = obj_faces[ chunk_faces3[ f ]	];

							v1 = customAttribute.value[ face.a ];
							v2 = customAttribute.value[ face.b ];
							v3 = customAttribute.value[ face.c ];

							customAttribute.array[ offset_custom ] 	   = v1[ pp[ 0 ] ];
							customAttribute.array[ offset_custom + 1 ] = v1[ pp[ 1 ] ];
							customAttribute.array[ offset_custom + 2 ] = v1[ pp[ 2 ] ];

							customAttribute.array[ offset_custom + 3 ] = v2[ pp[ 0 ] ];
							customAttribute.array[ offset_custom + 4 ] = v2[ pp[ 1 ] ];
							customAttribute.array[ offset_custom + 5 ] = v2[ pp[ 2 ] ];

							customAttribute.array[ offset_custom + 6 ] = v3[ pp[ 0 ] ];
							customAttribute.array[ offset_custom + 7 ] = v3[ pp[ 1 ] ];
							customAttribute.array[ offset_custom + 8 ] = v3[ pp[ 2 ] ];

							offset_custom += 9;

						}

					} else if ( customAttribute.boundTo === "faces" ) {

						for ( f = 0, fl = chunk_faces3.length; f < fl; f ++ ) {

							value = customAttribute.value[ chunk_faces3[ f ] ];

							v1 = value;
							v2 = value;
							v3 = value;

							customAttribute.array[ offset_custom ] 	   = v1[ pp[ 0 ] ];
							customAttribute.array[ offset_custom + 1 ] = v1[ pp[ 1 ] ];
							customAttribute.array[ offset_custom + 2 ] = v1[ pp[ 2 ] ];

							customAttribute.array[ offset_custom + 3 ] = v2[ pp[ 0 ] ];
							customAttribute.array[ offset_custom + 4 ] = v2[ pp[ 1 ] ];
							customAttribute.array[ offset_custom + 5 ] = v2[ pp[ 2 ] ];

							customAttribute.array[ offset_custom + 6 ] = v3[ pp[ 0 ] ];
							customAttribute.array[ offset_custom + 7 ] = v3[ pp[ 1 ] ];
							customAttribute.array[ offset_custom + 8 ] = v3[ pp[ 2 ] ];

							offset_custom += 9;

						}

					} else if ( customAttribute.boundTo === "faceVertices" ) {

						for ( f = 0, fl = chunk_faces3.length; f < fl; f ++ ) {

							value = customAttribute.value[ chunk_faces3[ f ] ];

							v1 = value[ 0 ];
							v2 = value[ 1 ];
							v3 = value[ 2 ];

							customAttribute.array[ offset_custom ] 	   = v1[ pp[ 0 ] ];
							customAttribute.array[ offset_custom + 1 ] = v1[ pp[ 1 ] ];
							customAttribute.array[ offset_custom + 2 ] = v1[ pp[ 2 ] ];

							customAttribute.array[ offset_custom + 3 ] = v2[ pp[ 0 ] ];
							customAttribute.array[ offset_custom + 4 ] = v2[ pp[ 1 ] ];
							customAttribute.array[ offset_custom + 5 ] = v2[ pp[ 2 ] ];

							customAttribute.array[ offset_custom + 6 ] = v3[ pp[ 0 ] ];
							customAttribute.array[ offset_custom + 7 ] = v3[ pp[ 1 ] ];
							customAttribute.array[ offset_custom + 8 ] = v3[ pp[ 2 ] ];

							offset_custom += 9;

						}

					}

				} else if ( customAttribute.size === 4 ) {

					if ( customAttribute.boundTo === undefined || customAttribute.boundTo === "vertices" ) {

						for ( f = 0, fl = chunk_faces3.length; f < fl; f ++ ) {

							face = obj_faces[ chunk_faces3[ f ]	];

							v1 = customAttribute.value[ face.a ];
							v2 = customAttribute.value[ face.b ];
							v3 = customAttribute.value[ face.c ];

							customAttribute.array[ offset_custom  ] 	= v1.x;
							customAttribute.array[ offset_custom + 1  ] = v1.y;
							customAttribute.array[ offset_custom + 2  ] = v1.z;
							customAttribute.array[ offset_custom + 3  ] = v1.w;

							customAttribute.array[ offset_custom + 4  ] = v2.x;
							customAttribute.array[ offset_custom + 5  ] = v2.y;
							customAttribute.array[ offset_custom + 6  ] = v2.z;
							customAttribute.array[ offset_custom + 7  ] = v2.w;

							customAttribute.array[ offset_custom + 8  ] = v3.x;
							customAttribute.array[ offset_custom + 9  ] = v3.y;
							customAttribute.array[ offset_custom + 10 ] = v3.z;
							customAttribute.array[ offset_custom + 11 ] = v3.w;

							offset_custom += 12;

						}

					} else if ( customAttribute.boundTo === "faces" ) {

						for ( f = 0, fl = chunk_faces3.length; f < fl; f ++ ) {

							value = customAttribute.value[ chunk_faces3[ f ] ];

							v1 = value;
							v2 = value;
							v3 = value;

							customAttribute.array[ offset_custom  ] 	= v1.x;
							customAttribute.array[ offset_custom + 1  ] = v1.y;
							customAttribute.array[ offset_custom + 2  ] = v1.z;
							customAttribute.array[ offset_custom + 3  ] = v1.w;

							customAttribute.array[ offset_custom + 4  ] = v2.x;
							customAttribute.array[ offset_custom + 5  ] = v2.y;
							customAttribute.array[ offset_custom + 6  ] = v2.z;
							customAttribute.array[ offset_custom + 7  ] = v2.w;

							customAttribute.array[ offset_custom + 8  ] = v3.x;
							customAttribute.array[ offset_custom + 9  ] = v3.y;
							customAttribute.array[ offset_custom + 10 ] = v3.z;
							customAttribute.array[ offset_custom + 11 ] = v3.w;

							offset_custom += 12;

						}

					} else if ( customAttribute.boundTo === "faceVertices" ) {

						for ( f = 0, fl = chunk_faces3.length; f < fl; f ++ ) {

							value = customAttribute.value[ chunk_faces3[ f ] ];

							v1 = value[ 0 ];
							v2 = value[ 1 ];
							v3 = value[ 2 ];

							customAttribute.array[ offset_custom  ] 	= v1.x;
							customAttribute.array[ offset_custom + 1  ] = v1.y;
							customAttribute.array[ offset_custom + 2  ] = v1.z;
							customAttribute.array[ offset_custom + 3  ] = v1.w;

							customAttribute.array[ offset_custom + 4  ] = v2.x;
							customAttribute.array[ offset_custom + 5  ] = v2.y;
							customAttribute.array[ offset_custom + 6  ] = v2.z;
							customAttribute.array[ offset_custom + 7  ] = v2.w;

							customAttribute.array[ offset_custom + 8  ] = v3.x;
							customAttribute.array[ offset_custom + 9  ] = v3.y;
							customAttribute.array[ offset_custom + 10 ] = v3.z;
							customAttribute.array[ offset_custom + 11 ] = v3.w;

							offset_custom += 12;

						}

					}

				}

				_gl.bindBuffer( _gl.ARRAY_BUFFER, customAttribute.buffer );
				_gl.bufferData( _gl.ARRAY_BUFFER, customAttribute.array, hint );

			}

		}

		if ( dispose ) {

			delete geometryGroup.__inittedArrays;
			delete geometryGroup.__colorArray;
			delete geometryGroup.__normalArray;
			delete geometryGroup.__tangentArray;
			delete geometryGroup.__uvArray;
			delete geometryGroup.__uv2Array;
			delete geometryGroup.__faceArray;
			delete geometryGroup.__vertexArray;
			delete geometryGroup.__lineArray;
			delete geometryGroup.__skinIndexArray;
			delete geometryGroup.__skinWeightArray;

		}

	};

	// used by renderBufferDirect for THREE.Line
	/*function setupLinesVertexAttributes( material, programAttributes, geometryAttributes, startIndex ) {
		var attributeItem, attributeName, attributePointer, attributeSize;

		for ( attributeName in programAttributes ) {

			attributePointer = programAttributes[ attributeName ];
			attributeItem = geometryAttributes[ attributeName ];
			
			if ( attributePointer >= 0 ) {

				if ( attributeItem ) {

					attributeSize = attributeItem.itemSize;
					_gl.bindBuffer( _gl.ARRAY_BUFFER, attributeItem.buffer );
					enableAttribute( attributePointer );
					_gl.vertexAttribPointer( attributePointer, attributeSize, _gl.FLOAT, false, 0, startIndex * attributeSize * 4 ); // 4 bytes per Float32

				} else if ( material.defaultAttributeValues ) {

					if ( material.defaultAttributeValues[ attributeName ].length === 2 )
						_gl.vertexAttrib2fv( attributePointer, material.defaultAttributeValues[ attributeName ] );

					else if ( material.defaultAttributeValues[ attributeName ].length === 3 )
						_gl.vertexAttrib3fv( attributePointer, material.defaultAttributeValues[ attributeName ] );
				}
			}
		}
	};*/

	this.renderBuffer = function ( camera, lights, fog, material, geometryGroup, object ) {

		if ( material.visible === false ) return;

		var linewidth, a, attribute, i, il,
			program = setProgram( camera, lights, fog, material, object ),
			attributes = program.attributes,
			updateBuffers = false,
			wireframeBit = material.wireframe ? 1 : 0,
			geometryGroupHash = ( geometryGroup.id * 0xffffff ) + ( program.id * 2 ) + wireframeBit;

		if ( geometryGroupHash !== _currentGeometryGroupHash ) {
			_currentGeometryGroupHash = geometryGroupHash;
			updateBuffers = true;
		}

		if ( updateBuffers )
			disableAttributes();

		// vertices
		if ( !material.morphTargets && attributes.position >= 0 ) {
			if ( updateBuffers ) {
				_gl.bindBuffer( _gl.ARRAY_BUFFER, geometryGroup.__webglVertexBuffer );
				enableAttribute( attributes.position );
				_gl.vertexAttribPointer( attributes.position, 3, _gl.FLOAT, false, 0, 0 );
			}

		} else if ( object.morphTargetBase )
			setupMorphTargets( material, geometryGroup, object );

		if ( updateBuffers ) {
			// custom attributes
			// Use the per-geometryGroup custom attribute arrays which are setup in initMeshBuffers
			if ( geometryGroup.__webglCustomAttributesList ) {
				for ( i = 0, il = geometryGroup.__webglCustomAttributesList.length; i < il; i ++ ) {
					attribute = geometryGroup.__webglCustomAttributesList[ i ];

					if ( attributes[ attribute.buffer.belongsToAttribute ] >= 0 ) {
						_gl.bindBuffer( _gl.ARRAY_BUFFER, attribute.buffer );
						enableAttribute( attributes[ attribute.buffer.belongsToAttribute ] );
						_gl.vertexAttribPointer( attributes[ attribute.buffer.belongsToAttribute ], attribute.size, _gl.FLOAT, false, 0, 0 );
					}
				}
			}
		}

		// render mesh
		if ( object instanceof THREE.Mesh ) {
			// wireframe
			if ( material.wireframe ) {
				setLineWidth( material.wireframeLinewidth );

				if ( updateBuffers ) 
					_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, geometryGroup.__webglLineBuffer );
				_gl.drawElements( _gl.LINES, geometryGroup.__webglLineCount, _gl.UNSIGNED_SHORT, 0 );

			// triangles

			} else {
				if ( updateBuffers ) 
					_gl.bindBuffer( _gl.ELEMENT_ARRAY_BUFFER, geometryGroup.__webglFaceBuffer );
				_gl.drawElements( _gl.TRIANGLES, geometryGroup.__webglFaceCount, _gl.UNSIGNED_SHORT, 0 );
			}

			_this.info.render.calls ++;
			_this.info.render.vertices += geometryGroup.__webglFaceCount;
			_this.info.render.faces += geometryGroup.__webglFaceCount / 3;
		}
	};

	function enableAttribute( attribute ) {
		if ( _enabledAttributes[ attribute ] === 0 ) {
			_gl.enableVertexAttribArray( attribute );
			_enabledAttributes[ attribute ] = 1;
		}
	};

	function disableAttributes() {
		for ( var attribute in _enabledAttributes )
			if ( _enabledAttributes[ attribute ] === 1 ) {
				_gl.disableVertexAttribArray( attribute );
				_enabledAttributes[ attribute ] = 0;
			}
	};

	// Sorting TODO HERE
	function painterSortStable ( a, b ) {
		if ( a.z !== b.z )
			return b.z - a.z;
		else
			return a.id - b.id;
	};

	// Rendering
	this.render = function ( scene, camera, renderTarget, forceClear ) {
		if ( camera instanceof THREE.Camera === false ) {
			console.error( 'THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.' );
			return;
		}

		var i, il,
		webglObject, object,
		renderList,

		lights = scene.__lights,
		fog = scene.fog;

		// reset caching for this frame

		_currentMaterialId = -1;
		_lightsNeedUpdate = true;

		// update scene graph
		if ( scene.autoUpdate === true ) 
			scene.updateMatrixWorld();

		// update camera matrices and frustum
		if ( camera.parent === undefined ) 
			camera.updateMatrixWorld();

		camera.matrixWorldInverse.getInverse( camera.matrixWorld );

		_projScreenMatrix.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
		_frustum.setFromMatrix( _projScreenMatrix );

		// update WebGL objects
		if ( this.autoUpdateObjects ) 
			this.initWebGLObjects( scene );

		// custom render plugins (pre pass)
		renderPlugins( this.renderPluginsPre, scene, camera );

		//
		_this.info.render.calls = 0;
		_this.info.render.vertices = 0;
		_this.info.render.faces = 0;
		_this.info.render.points = 0;

		this.setRenderTarget( renderTarget );

		if ( this.autoClear || forceClear )
			this.clear( this.autoClearColor, this.autoClearDepth, this.autoClearStencil );

		// set matrices for regular objects (frustum culled)

		renderList = scene.__webglObjects;

		for ( i = 0, il = renderList.length; i < il; i ++ ) {
			webglObject = renderList[ i ];
			object = webglObject.object;

			webglObject.id = i;
			webglObject.render = false;

			if ( object.visible ) {
				if ( ! ( object instanceof THREE.Mesh || object instanceof THREE.ParticleSystem ) || ! ( object.frustumCulled ) || true/*_frustum.intersectsObject( object )*/ ) {
					setupMatrices( object, camera );
					unrollBufferMaterial( webglObject );
					webglObject.render = true;

					if ( this.sortObjects === true ) {
						if ( object.renderDepth !== null )
							webglObject.z = object.renderDepth;

						else{
							_vector3.setFromMatrixPosition( object.matrixWorld );
							_vector3.applyProjection( _projScreenMatrix );

							webglObject.z = _vector3.z;
						}
					}
				}
			}
		}

		if ( this.sortObjects )
			renderList.sort( painterSortStable );

		// set matrices for immediate objects
		renderList = scene.__webglObjectsImmediate;

		for ( i = 0, il = renderList.length; i < il; i ++ ) {
			webglObject = renderList[ i ];
			object = webglObject.object;

			if ( object.visible ) {
				setupMatrices( object, camera );
				unrollImmediateBufferMaterial( webglObject );
			}
		}

		if ( scene.overrideMaterial ) {
			var material = scene.overrideMaterial;

			this.setBlending( material.blending, material.blendEquation, material.blendSrc, material.blendDst );
			this.setDepthTest( material.depthTest );
			this.setDepthWrite( material.depthWrite );
			setPolygonOffset( material.polygonOffset, material.polygonOffsetFactor, material.polygonOffsetUnits );

			renderObjects( scene.__webglObjects, false, "", camera, lights, fog, true, material );
			renderObjectsImmediate( scene.__webglObjectsImmediate, "", camera, lights, fog, false, material );

		} else {
			var material = null;

			// opaque pass (front-to-back order)
			this.setBlending( THREE.NoBlending );

			renderObjects( scene.__webglObjects, true, "opaque", camera, lights, fog, false, material );
			renderObjectsImmediate( scene.__webglObjectsImmediate, "opaque", camera, lights, fog, false, material );

			// transparent pass (back-to-front order)
			renderObjects( scene.__webglObjects, false, "transparent", camera, lights, fog, true, material );
			renderObjectsImmediate( scene.__webglObjectsImmediate, "transparent", camera, lights, fog, true, material );
		}

		// custom render plugins (post pass)
		renderPlugins( this.renderPluginsPost, scene, camera );

		// Generate mipmap if we're using any kind of mipmap filtering
		if ( renderTarget && renderTarget.generateMipmaps && renderTarget.minFilter !== THREE.NearestFilter && renderTarget.minFilter !== THREE.LinearFilter )
			updateRenderTargetMipmap( renderTarget );

		// Ensure depth buffer writing is enabled so it can be cleared on next render
		this.setDepthTest( true );
		this.setDepthWrite( true );
		// _gl.finish();
	};

	function renderPlugins( plugins, scene, camera ) {
		if ( ! plugins.length ) 
			return;

		for ( var i = 0, il = plugins.length; i < il; i ++ ) {
			// reset state for plugin (to start from clean slate)
			_currentProgram = null;
			_currentCamera = null;

			_oldBlending = -1;
			_oldDepthTest = -1;
			_oldDepthWrite = -1;
			_oldDoubleSided = -1;
			_oldFlipSided = -1;
			_currentGeometryGroupHash = -1;
			_currentMaterialId = -1;

			_lightsNeedUpdate = true;

			plugins[ i ].render( scene, camera, _currentWidth, _currentHeight );

			// reset state after plugin (anything could have changed)
			_currentProgram = null;
			_currentCamera = null;

			_oldBlending = -1;
			_oldDepthTest = -1;
			_oldDepthWrite = -1;
			_oldDoubleSided = -1;
			_oldFlipSided = -1;
			_currentGeometryGroupHash = -1;
			_currentMaterialId = -1;

			_lightsNeedUpdate = true;
		}
	};

	function renderObjects( renderList, reverse, materialType, camera, lights, fog, useBlending, overrideMaterial ) {
		var webglObject, object, buffer, material, start, end, delta;

		if ( reverse ) {
			start = renderList.length - 1;
			end = -1;
			delta = -1;

		} else {
			start = 0;
			end = renderList.length;
			delta = 1;
		}

		for ( var i = start; i !== end; i += delta ) {
			webglObject = renderList[ i ];

			if ( webglObject.render ) {
				object = webglObject.object;
				buffer = webglObject.buffer;

				if ( overrideMaterial )
					material = overrideMaterial;

				else {
					material = webglObject[ materialType ];

					if ( ! material ) 
						continue;

					if ( useBlending ) 
						_this.setBlending( material.blending, material.blendEquation, material.blendSrc, material.blendDst );

					_this.setDepthTest( material.depthTest );
					_this.setDepthWrite( material.depthWrite );
					setPolygonOffset( material.polygonOffset, material.polygonOffsetFactor, material.polygonOffsetUnits );
				}

				_this.setMaterialFaces( material );
				_this.renderBuffer( camera, lights, fog, material, buffer, object );
			}
		}
	};

	function renderObjectsImmediate ( renderList, materialType, camera, lights, fog, useBlending, overrideMaterial ) {
		var webglObject, object, material, program;

		for ( var i = 0, il = renderList.length; i < il; i ++ ) {
			webglObject = renderList[ i ];
			object = webglObject.object;

			if ( object.visible ) {
				if ( overrideMaterial )
					material = overrideMaterial;

				else {
					material = webglObject[ materialType ];

					if ( ! material ) 
						continue;

					if ( useBlending ) 
						_this.setBlending( material.blending, material.blendEquation, material.blendSrc, material.blendDst );

					_this.setDepthTest( material.depthTest );
					_this.setDepthWrite( material.depthWrite );
					setPolygonOffset( material.polygonOffset, material.polygonOffsetFactor, material.polygonOffsetUnits );

				}

				_this.renderImmediateObject( camera, lights, fog, material, object );
			}
		}
	};
/*
	this.renderImmediateObject = function ( camera, lights, fog, material, object ) {

		var program = setProgram( camera, lights, fog, material, object );

		_currentGeometryGroupHash = -1;

		_this.setMaterialFaces( material );

		if ( object.immediateRenderCallback ) {

			object.immediateRenderCallback( program, _gl, _frustum );

		} else {

			object.render( function( object ) { _this.renderBufferImmediate( object, program, material ); } );

		}

	};*/

	function unrollImmediateBufferMaterial ( globject ) {
		var object = globject.object,
			material = object.material;

		if ( material.transparent ) {
			globject.transparent = material;
			globject.opaque = null;

		} else {
			globject.opaque = material;
			globject.transparent = null;
		}
	};

	function unrollBufferMaterial ( globject ) {
		var object = globject.object;
		var buffer = globject.buffer;

		var geometry = object.geometry;
		var material = object.material;

		if ( material ) {
			if ( material.transparent ) {
				globject.transparent = material;
				globject.opaque = null;

			} else {
				globject.opaque = material;
				globject.transparent = null;
			}
		}
	};

	// Objects refresh
	this.initWebGLObjects = function ( scene ) {
		if ( !scene.__webglObjects ) {
			scene.__webglObjects = [];
			scene.__webglObjectsImmediate = [];
			scene.__webglSprites = [];
			scene.__webglFlares = [];
		}

		while ( scene.__objectsAdded.length ) {
			addObject( scene.__objectsAdded[ 0 ], scene );
			scene.__objectsAdded.splice( 0, 1 );
		}

		while ( scene.__objectsRemoved.length ) {
			removeObject( scene.__objectsRemoved[ 0 ], scene );
			scene.__objectsRemoved.splice( 0, 1 );
		}

		// update must be called after objects adding / removal
		for ( var o = 0, ol = scene.__webglObjects.length; o < ol; o ++ ) {
			var object = scene.__webglObjects[ o ].object;

			// TODO: Remove this hack (WebGLRenderer refactoring)
			if ( object.__webglInit === undefined ) {
				if ( object.__webglActive !== undefined )
					removeObject( object, scene );

				addObject( object, scene );
			}

			updateObject( object );
		}
	};

	// Objects adding
	function addObject( object, scene ) {
		var g, geometry, material, geometryGroup;

		if ( object.__webglInit === undefined ) {
			object.__webglInit = true;
			object._modelViewMatrix = new THREE.Matrix4();
			object._normalMatrix = new THREE.Matrix3();

			if ( object.geometry !== undefined && object.geometry.__webglInit === undefined ) {
				object.geometry.__webglInit = true;
				object.geometry.addEventListener( 'dispose', onGeometryDispose );
			}

			geometry = object.geometry;

			if ( geometry === undefined ) {
				// fail silently for now <= WHAT
			} else if ( object instanceof THREE.Mesh ) {
				material = object.material;

				if ( geometry.geometryGroups === undefined )
					geometry.makeGroups( false);
				// create separate VBOs per geometry chunk

				for ( g in geometry.geometryGroups ) {
					geometryGroup = geometry.geometryGroups[ g ];

					// initialise VBO on the first access
					if ( ! geometryGroup.__webglVertexBuffer ) {
						createMeshBuffers( geometryGroup );
						initMeshBuffers( geometryGroup, object );

						geometry.verticesNeedUpdate = true;
						geometry.morphTargetsNeedUpdate = true;
						geometry.elementsNeedUpdate = true;
						geometry.uvsNeedUpdate = true;
						geometry.normalsNeedUpdate = true;
						geometry.tangentsNeedUpdate = true;
						geometry.colorsNeedUpdate = true;
					}
				}
			}
		}

		if ( object.__webglActive === undefined ) {
			if ( object instanceof THREE.Mesh ) {
				geometry = object.geometry;

				if ( geometry instanceof THREE.Geometry ) {
					for ( g in geometry.geometryGroups ) {
						geometryGroup = geometry.geometryGroups[ g ];
						addBuffer( scene.__webglObjects, geometryGroup, object );
					}
				}
			}

			object.__webglActive = true;
		}
	};

	function addBuffer( objlist, buffer, object ) {

		objlist.push(
			{
				id: null,
				buffer: buffer,
				object: object,
				opaque: null,
				transparent: null,
				z: 0
			}
		);

	};


	// Objects updates
	function updateObject( object ) {
		var geometry = object.geometry,
			geometryGroup, customAttributesDirty, material;

		if ( object instanceof THREE.Mesh ) {
			// check all geometry groups

			for( var i = 0, il = geometry.geometryGroupsList.length; i < il; i ++ ) {
				geometryGroup = geometry.geometryGroupsList[ i ];
				material = getBufferMaterial( object, geometryGroup );

				if ( geometry.buffersNeedUpdate )
					initMeshBuffers( geometryGroup, object );

				customAttributesDirty = material.attributes && areCustomAttributesDirty( material );

				if ( geometry.verticesNeedUpdate || geometry.morphTargetsNeedUpdate || geometry.elementsNeedUpdate || customAttributesDirty )
					setMeshBuffers( geometryGroup, object, _gl.DYNAMIC_DRAW, !geometry.dynamic, material );
			}

			geometry.verticesNeedUpdate = false;
			geometry.morphTargetsNeedUpdate = false;
			geometry.elementsNeedUpdate = false;
			geometry.uvsNeedUpdate = false;
			geometry.normalsNeedUpdate = false;
			geometry.colorsNeedUpdate = false;
			geometry.tangentsNeedUpdate = false;

			geometry.buffersNeedUpdate = false;

			material.attributes && clearCustomAttributes( material );

		}
	};

	// Objects updates - custom attributes check
	function areCustomAttributesDirty( material ) {
		for ( var a in material.attributes )
			if ( material.attributes[ a ].needsUpdate ) 
				return true;

		return false;
	};

	function clearCustomAttributes( material ) {
		for ( var a in material.attributes )
			material.attributes[ a ].needsUpdate = false;
	};

	// Objects removal

	function removeObject( object, scene ) {
		if ( object instanceof THREE.Mesh)
			removeInstances( scene.__webglObjects, object );

		else if ( object instanceof THREE.Sprite )
			removeInstancesDirect( scene.__webglSprites, object );

		else if ( object instanceof THREE.LensFlare )
			removeInstancesDirect( scene.__webglFlares, object );

		else if ( object instanceof THREE.ImmediateRenderObject || object.immediateRenderCallback )
			removeInstances( scene.__webglObjectsImmediate, object );

		delete object.__webglActive;
	};

	function removeInstances( objlist, object ) {
		for ( var o = objlist.length - 1; o >= 0; o -- )
			if ( objlist[ o ].object === object )
				objlist.splice( o, 1 );
	};

	function removeInstancesDirect( objlist, object ) {
		for ( var o = objlist.length - 1; o >= 0; o -- )
			if ( objlist[ o ] === object )
				objlist.splice( o, 1 );
	};

	// Materials

	this.initMaterial = function ( material, lights, fog, object ) {
		material.addEventListener( 'dispose', onMaterialDispose );
		var u, a, identifiers, i, parameters, maxLightCount, maxBones, maxShadows, shaderID;

		if ( shaderID )
			setMaterialShaders( material, THREE.ShaderLib[ shaderID ] );

		// heuristics to create shader parameters according to lights in the scene
		// (not to blow over maxLights budget)

		maxLightCount = allocateLights( lights );
		maxShadows = allocateShadows( lights );
		maxBones = allocateBones( object );

		parameters = {
			map: !!material.map,
			envMap: !!material.envMap,
			lightMap: !!material.lightMap,
			bumpMap: !!material.bumpMap,
			normalMap: !!material.normalMap,
			specularMap: !!material.specularMap,

			vertexColors: material.vertexColors,

			fog: fog,
			useFog: material.fog,
			fogExp: false,

			sizeAttenuation: material.sizeAttenuation,

			skinning: material.skinning,
			maxBones: maxBones,
			useVertexTexture: _supportsBoneTextures && object && object.useVertexTexture,

			morphTargets: material.morphTargets,
			morphNormals: material.morphNormals,
			maxMorphTargets: this.maxMorphTargets,
			maxMorphNormals: this.maxMorphNormals,

			maxDirLights: maxLightCount.directional,
			maxPointLights: maxLightCount.point,
			maxSpotLights: maxLightCount.spot,
			maxHemiLights: maxLightCount.hemi,

			maxShadows: maxShadows,
			shadowMapEnabled: this.shadowMapEnabled && object.receiveShadow,
			shadowMapType: this.shadowMapType,
			shadowMapDebug: this.shadowMapDebug,
			shadowMapCascade: this.shadowMapCascade,

			alphaTest: material.alphaTest,
			metal: material.metal,
			wrapAround: material.wrapAround,
			doubleSided: material.side === THREE.DoubleSide,
			flipSided: material.side === THREE.BackSide
		};

		material.program = buildProgram( shaderID, material.fragmentShader, material.vertexShader, material.uniforms, material.attributes, material.defines, parameters, material.index0AttributeName );
		var attributes = material.program.attributes;

		if ( material.morphTargets ) {

			material.numSupportedMorphTargets = 0;

			var id, base = "morphTarget";

			for ( i = 0; i < this.maxMorphTargets; i ++ ) {
				id = base + i;

				if ( attributes[ id ] >= 0 )
					material.numSupportedMorphTargets ++;
			}
		}

		if ( material.morphNormals ) {
			material.numSupportedMorphNormals = 0;
			var id, base = "morphNormal";

			for ( i = 0; i < this.maxMorphNormals; i ++ ) {
				id = base + i;

				if ( attributes[ id ] >= 0 )
					material.numSupportedMorphNormals ++;
			}
		}

		material.uniformsList = [];

		for ( u in material.uniforms )
			material.uniformsList.push( [ material.uniforms[ u ], u ] );
	};

	function setMaterialShaders( material, shaders ) {
		material.uniforms = THREE.UniformsUtils.clone( shaders.uniforms );
		material.vertexShader = shaders.vertexShader;
		material.fragmentShader = shaders.fragmentShader;
	};

	function setProgram( camera, lights, fog, material, object ) {
		_usedTextureUnits = 0;

		if ( material.needsUpdate ) {
			if ( material.program ) 
				deallocateMaterial( material );

			_this.initMaterial( material, lights, fog, object );
			material.needsUpdate = false;
		}

		var refreshMaterial = false;

		var program = material.program,
			p_uniforms = program.uniforms,
			m_uniforms = material.uniforms;

		if ( program !== _currentProgram ) {
			_gl.useProgram( program );
			_currentProgram = program;

			refreshMaterial = true;
		}

		if ( material.id !== _currentMaterialId ) {
			_currentMaterialId = material.id;
			refreshMaterial = true;
		}

		if ( refreshMaterial || camera !== _currentCamera ) {
			_gl.uniformMatrix4fv( p_uniforms.projectionMatrix, false, camera.projectionMatrix.elements );

			if ( camera !== _currentCamera ) 
				_currentCamera = camera;
		}

		// skinning uniforms must be set even if material didn't change
		// auto-setting of texture unit for bone texture must go before other textures
		// not sure why, but otherwise weird things happen

		if ( material.skinning ) {
			if ( _supportsBoneTextures && object.useVertexTexture ) {
				if ( p_uniforms.boneTexture !== null ) {
					var textureUnit = getTextureUnit();

					_gl.uniform1i( p_uniforms.boneTexture, textureUnit );
					_this.setTexture( object.boneTexture, textureUnit );
				}

				if ( p_uniforms.boneTextureWidth !== null )
					_gl.uniform1i( p_uniforms.boneTextureWidth, object.boneTextureWidth );

				if ( p_uniforms.boneTextureHeight !== null )
					_gl.uniform1i( p_uniforms.boneTextureHeight, object.boneTextureHeight );

			} else if ( p_uniforms.boneGlobalMatrices !== null )
					_gl.uniformMatrix4fv( p_uniforms.boneGlobalMatrices, false, object.boneMatrices );
		}

		if ( refreshMaterial ) {
			// refresh uniforms common to several materials

			if ( fog && material.fog )
				refreshUniformsFog( m_uniforms, fog );

			// load common uniforms
			loadUniformsGeneric( program, material.uniformsList );

			// load material specific uniforms
			// (shader material also gets them for the sake of genericity)
			if ( material instanceof THREE.ShaderMaterial)
				if ( p_uniforms.cameraPosition !== null ) {
					_vector3.setFromMatrixPosition( camera.matrixWorld );
					_gl.uniform3f( p_uniforms.cameraPosition, _vector3.x, _vector3.y, _vector3.z );
				}

			if ( material instanceof THREE.ShaderMaterial)
				if ( p_uniforms.viewMatrix !== null )
					_gl.uniformMatrix4fv( p_uniforms.viewMatrix, false, camera.matrixWorldInverse.elements );
		}

		loadUniformsMatrices( p_uniforms, object );

		if ( p_uniforms.modelMatrix !== null )
			_gl.uniformMatrix4fv( p_uniforms.modelMatrix, false, object.matrixWorld.elements );

		return program;
	};

	// Uniforms (refresh uniforms objects) <= don't need

	// Uniforms (load to GPU)
	function loadUniformsMatrices ( uniforms, object ) {
		_gl.uniformMatrix4fv( uniforms.modelViewMatrix, false, object._modelViewMatrix.elements );

		if ( uniforms.normalMatrix )
			_gl.uniformMatrix3fv( uniforms.normalMatrix, false, object._normalMatrix.elements );
	};

	function loadUniformsGeneric ( program, uniforms ) {
		var uniform, value, type, location, texture, textureUnit, i, il, j, jl, offset;

		for ( j = 0, jl = uniforms.length; j < jl; j ++ ) {
			location = program.uniforms[ uniforms[ j ][ 1 ] ];
			if ( !location ) 
				continue;

			uniform = uniforms[ j ][ 0 ];
			type = uniform.type;
			value = uniform.value;

			switch(type){
				case 'i': _gl.uniform1i( location, value ); break;
				case 'f': _gl.uniform1f( location, value ); break;
				case 'v2': _gl.uniform2f( location, value.x, value.y ); break;
				case 'v3': _gl.uniform3f( location, value.x, value.y, value.z ); break;
				case 'v4': _gl.uniform4f( location, value.x, value.y, value.z, value.w ); break;
				case 'c': _gl.uniform3f( location, value.r, value.g, value.b ); break;
				default:
					console.warn( 'THREE.WebGLRenderer: Unknown uniform type: ' + type );
			}
		}
	};

	function setupMatrices ( object, camera ) {
		object._modelViewMatrix.multiplyMatrices( camera.matrixWorldInverse, object.matrixWorld );
		object._normalMatrix.getNormalMatrix( object._modelViewMatrix );
	};

	// GL state setting

	this.setFaceCulling = function ( cullFace, frontFaceDirection ) {

		if ( cullFace === THREE.CullFaceNone )
			_gl.disable( _gl.CULL_FACE );

		else {
			if ( frontFaceDirection === THREE.FrontFaceDirectionCW )
				_gl.frontFace( _gl.CW );
			else
				_gl.frontFace( _gl.CCW );

			if ( cullFace === THREE.CullFaceBack )
				_gl.cullFace( _gl.BACK );
			else if ( cullFace === THREE.CullFaceFront )
				_gl.cullFace( _gl.FRONT );
			else
				_gl.cullFace( _gl.FRONT_AND_BACK );

			_gl.enable( _gl.CULL_FACE );
		}

	};

	this.setMaterialFaces = function ( material ) {
		var doubleSided = material.side === THREE.DoubleSide;
		var flipSided = material.side === THREE.BackSide;

		if ( _oldDoubleSided !== doubleSided ) {
			if ( doubleSided )
				_gl.disable( _gl.CULL_FACE );

			else
				_gl.enable( _gl.CULL_FACE );

			_oldDoubleSided = doubleSided;
		}

		if ( _oldFlipSided !== flipSided ) {
			if ( flipSided )
				_gl.frontFace( _gl.CW );

			else
				_gl.frontFace( _gl.CCW );

			_oldFlipSided = flipSided;
		}
	};

	this.setDepthTest = function ( depthTest ) {
		if ( _oldDepthTest !== depthTest ) {
			if ( depthTest )
				_gl.enable( _gl.DEPTH_TEST );

			else
				_gl.disable( _gl.DEPTH_TEST );

			_oldDepthTest = depthTest;
		}
	};

	this.setDepthWrite = function ( depthWrite ) {
		if ( _oldDepthWrite !== depthWrite ) {
			_gl.depthMask( depthWrite );
			_oldDepthWrite = depthWrite;
		}
	};

	function setPolygonOffset ( polygonoffset, factor, units ) {
		if ( _oldPolygonOffset !== polygonoffset ) {
			if ( polygonoffset )
				_gl.enable( _gl.POLYGON_OFFSET_FILL );

			else
				_gl.disable( _gl.POLYGON_OFFSET_FILL );

			_oldPolygonOffset = polygonoffset;
		}

		if ( polygonoffset && ( _oldPolygonOffsetFactor !== factor || _oldPolygonOffsetUnits !== units ) ) {
			_gl.polygonOffset( factor, units );

			_oldPolygonOffsetFactor = factor;
			_oldPolygonOffsetUnits = units;
		}
	};

	this.setBlending = function ( blending, blendEquation, blendSrc, blendDst ) {
		if ( blending !== _oldBlending ) {
			if ( blending === THREE.NoBlending ) {
				_gl.disable( _gl.BLEND );

			} else if ( blending === THREE.AdditiveBlending ) {
				_gl.enable( _gl.BLEND );
				_gl.blendEquation( _gl.FUNC_ADD );
				_gl.blendFunc( _gl.SRC_ALPHA, _gl.ONE );

			} else if ( blending === THREE.SubtractiveBlending ) {
				// TODO: Find blendFuncSeparate() combination
				_gl.enable( _gl.BLEND );
				_gl.blendEquation( _gl.FUNC_ADD );
				_gl.blendFunc( _gl.ZERO, _gl.ONE_MINUS_SRC_COLOR );

			} else if ( blending === THREE.MultiplyBlending ) {
				// TODO: Find blendFuncSeparate() combination
				_gl.enable( _gl.BLEND );
				_gl.blendEquation( _gl.FUNC_ADD );
				_gl.blendFunc( _gl.ZERO, _gl.SRC_COLOR );

			} else if ( blending === THREE.CustomBlending ) {
				_gl.enable( _gl.BLEND );

			} else {
				_gl.enable( _gl.BLEND );
				_gl.blendEquationSeparate( _gl.FUNC_ADD, _gl.FUNC_ADD );
				_gl.blendFuncSeparate( _gl.SRC_ALPHA, _gl.ONE_MINUS_SRC_ALPHA, _gl.ONE, _gl.ONE_MINUS_SRC_ALPHA );

			}

			_oldBlending = blending;
		}

		if ( blending === THREE.CustomBlending ) {
			if ( blendEquation !== _oldBlendEquation ) {
				_gl.blendEquation( paramThreeToGL( blendEquation ) );
				_oldBlendEquation = blendEquation;
			}

			if ( blendSrc !== _oldBlendSrc || blendDst !== _oldBlendDst ) {
				_gl.blendFunc( paramThreeToGL( blendSrc ), paramThreeToGL( blendDst ) );

				_oldBlendSrc = blendSrc;
				_oldBlendDst = blendDst;
			}

		} else {
			_oldBlendEquation = null;
			_oldBlendSrc = null;
			_oldBlendDst = null;
		}
	};

	// Defines

	function generateDefines ( defines ) {
		var value, chunk, chunks = [];

		for ( var d in defines ) {
			value = defines[ d ];
			if ( value === false ) 
				continue;

			chunk = "#define " + d + " " + value;
			chunks.push( chunk );
		}

		return chunks.join( "\n" );
	};

	// Shaders

	function buildProgram ( shaderID, fragmentShader, vertexShader, uniforms, attributes, defines, parameters, index0AttributeName ) {

		var p, pl, d, program, code;
		var chunks = [];

		// Generate code

		if ( shaderID ) {
			chunks.push( shaderID );

		} else {
			chunks.push( fragmentShader );
			chunks.push( vertexShader );

		}

		for ( d in defines ) {
			chunks.push( d );
			chunks.push( defines[ d ] );
		}

		for ( p in parameters ) {
			chunks.push( p );
			chunks.push( parameters[ p ] );
		}

		code = chunks.join();

		// Check if code has been already compiled
		for ( p = 0, pl = _programs.length; p < pl; p ++ ) {
			var programInfo = _programs[ p ];

			if ( programInfo.code === code ) {
				programInfo.usedTimes ++;

				return programInfo.program;
			}
		}

		var shadowMapTypeDefine = "SHADOWMAP_TYPE_BASIC";

		if ( parameters.shadowMapType === THREE.PCFShadowMap ) {

			shadowMapTypeDefine = "SHADOWMAP_TYPE_PCF";

		} else if ( parameters.shadowMapType === THREE.PCFSoftShadowMap ) {

			shadowMapTypeDefine = "SHADOWMAP_TYPE_PCF_SOFT";

		}

		// console.log( "building new program " );

		//

		var customDefines = generateDefines( defines );

		//

		program = _gl.createProgram();

		var prefix_vertex = [

			"precision " + _precision + " float;",
			"precision " + _precision + " int;",

			customDefines,

			_supportsVertexTextures ? "#define VERTEX_TEXTURES" : "",

			_this.gammaInput ? "#define GAMMA_INPUT" : "",
			_this.gammaOutput ? "#define GAMMA_OUTPUT" : "",

			"#define MAX_DIR_LIGHTS " + parameters.maxDirLights,
			"#define MAX_POINT_LIGHTS " + parameters.maxPointLights,
			"#define MAX_SPOT_LIGHTS " + parameters.maxSpotLights,
			"#define MAX_HEMI_LIGHTS " + parameters.maxHemiLights,

			"#define MAX_SHADOWS " + parameters.maxShadows,

			"#define MAX_BONES " + parameters.maxBones,

			parameters.map ? "#define USE_MAP" : "",
			parameters.envMap ? "#define USE_ENVMAP" : "",
			parameters.lightMap ? "#define USE_LIGHTMAP" : "",
			parameters.bumpMap ? "#define USE_BUMPMAP" : "",
			parameters.normalMap ? "#define USE_NORMALMAP" : "",
			parameters.specularMap ? "#define USE_SPECULARMAP" : "",
			parameters.vertexColors ? "#define USE_COLOR" : "",

			parameters.skinning ? "#define USE_SKINNING" : "",
			parameters.useVertexTexture ? "#define BONE_TEXTURE" : "",

			parameters.morphTargets ? "#define USE_MORPHTARGETS" : "",
			parameters.morphNormals ? "#define USE_MORPHNORMALS" : "",
			parameters.wrapAround ? "#define WRAP_AROUND" : "",
			parameters.doubleSided ? "#define DOUBLE_SIDED" : "",
			parameters.flipSided ? "#define FLIP_SIDED" : "",

			parameters.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
			parameters.shadowMapEnabled ? "#define " + shadowMapTypeDefine : "",
			parameters.shadowMapDebug ? "#define SHADOWMAP_DEBUG" : "",
			parameters.shadowMapCascade ? "#define SHADOWMAP_CASCADE" : "",

			parameters.sizeAttenuation ? "#define USE_SIZEATTENUATION" : "",

			"uniform mat4 modelMatrix;",
			"uniform mat4 modelViewMatrix;",
			"uniform mat4 projectionMatrix;",
			"uniform mat4 viewMatrix;",
			"uniform mat3 normalMatrix;",
			"uniform vec3 cameraPosition;",

			"attribute vec3 position;",
			"attribute vec3 normal;",
			"attribute vec2 uv;",
			"attribute vec2 uv2;",

			"#ifdef USE_COLOR",

				"attribute vec3 color;",

			"#endif",

			"#ifdef USE_MORPHTARGETS",

				"attribute vec3 morphTarget0;",
				"attribute vec3 morphTarget1;",
				"attribute vec3 morphTarget2;",
				"attribute vec3 morphTarget3;",

				"#ifdef USE_MORPHNORMALS",

					"attribute vec3 morphNormal0;",
					"attribute vec3 morphNormal1;",
					"attribute vec3 morphNormal2;",
					"attribute vec3 morphNormal3;",

				"#else",

					"attribute vec3 morphTarget4;",
					"attribute vec3 morphTarget5;",
					"attribute vec3 morphTarget6;",
					"attribute vec3 morphTarget7;",

				"#endif",

			"#endif",

			"#ifdef USE_SKINNING",

				"attribute vec4 skinIndex;",
				"attribute vec4 skinWeight;",

			"#endif",

			""

		].join("\n");

		var prefix_fragment = [

			"precision " + _precision + " float;",
			"precision " + _precision + " int;",

			( parameters.bumpMap || parameters.normalMap ) ? "#extension GL_OES_standard_derivatives : enable" : "",

			customDefines,

			"#define MAX_DIR_LIGHTS " + parameters.maxDirLights,
			"#define MAX_POINT_LIGHTS " + parameters.maxPointLights,
			"#define MAX_SPOT_LIGHTS " + parameters.maxSpotLights,
			"#define MAX_HEMI_LIGHTS " + parameters.maxHemiLights,

			"#define MAX_SHADOWS " + parameters.maxShadows,

			parameters.alphaTest ? "#define ALPHATEST " + parameters.alphaTest: "",

			_this.gammaInput ? "#define GAMMA_INPUT" : "",
			_this.gammaOutput ? "#define GAMMA_OUTPUT" : "",

			( parameters.useFog && parameters.fog ) ? "#define USE_FOG" : "",
			( parameters.useFog && parameters.fogExp ) ? "#define FOG_EXP2" : "",

			parameters.map ? "#define USE_MAP" : "",
			parameters.envMap ? "#define USE_ENVMAP" : "",
			parameters.lightMap ? "#define USE_LIGHTMAP" : "",
			parameters.bumpMap ? "#define USE_BUMPMAP" : "",
			parameters.normalMap ? "#define USE_NORMALMAP" : "",
			parameters.specularMap ? "#define USE_SPECULARMAP" : "",
			parameters.vertexColors ? "#define USE_COLOR" : "",

			parameters.metal ? "#define METAL" : "",
			parameters.wrapAround ? "#define WRAP_AROUND" : "",
			parameters.doubleSided ? "#define DOUBLE_SIDED" : "",
			parameters.flipSided ? "#define FLIP_SIDED" : "",

			parameters.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
			parameters.shadowMapEnabled ? "#define " + shadowMapTypeDefine : "",
			parameters.shadowMapDebug ? "#define SHADOWMAP_DEBUG" : "",
			parameters.shadowMapCascade ? "#define SHADOWMAP_CASCADE" : "",

			"uniform mat4 viewMatrix;",
			"uniform vec3 cameraPosition;",
			""

		].join("\n");

		var glVertexShader = getShader( "vertex", prefix_vertex + vertexShader );
		var glFragmentShader = getShader( "fragment", prefix_fragment + fragmentShader );

		_gl.attachShader( program, glVertexShader );
		_gl.attachShader( program, glFragmentShader );

		// Force a particular attribute to index 0.
		// because potentially expensive emulation is done by browser if attribute 0 is disabled.
		// And, color, for example is often automatically bound to index 0 so disabling it
		if ( index0AttributeName !== undefined )
			_gl.bindAttribLocation( program, 0, index0AttributeName );

		else
			_gl.bindAttribLocation( program, 0, 'position' );

		_gl.linkProgram( program );

		if ( !_gl.getProgramParameter( program, _gl.LINK_STATUS ) ) {
			console.error( "Could not initialise shader\n" + "VALIDATE_STATUS: " + _gl.getProgramParameter( program, _gl.VALIDATE_STATUS ) + ", gl error [" + _gl.getError() + "]" );
			console.error( "Program Info Log: " + _gl.getProgramInfoLog( program ) );
		}

		// clean up
		_gl.deleteShader( glFragmentShader );
		_gl.deleteShader( glVertexShader );

		// console.log( prefix_fragment + fragmentShader );
		// console.log( prefix_vertex + vertexShader );
		program.uniforms = {};
		program.attributes = {};

		var identifiers, u, a, i;

		// cache uniform locations

		identifiers = [
			'viewMatrix', 'modelViewMatrix', 'projectionMatrix', 'normalMatrix', 'modelMatrix', 'cameraPosition',
			'morphTargetInfluences'
		];

		if ( parameters.useVertexTexture ) {
			identifiers.push( 'boneTexture' );
			identifiers.push( 'boneTextureWidth' );
			identifiers.push( 'boneTextureHeight' );

		} else
			identifiers.push( 'boneGlobalMatrices' );

		for ( u in uniforms )
			identifiers.push( u );

		cacheUniformLocations( program, identifiers );

		// cache attributes locations
		identifiers = [
			"position", "normal", "uv", "uv2", "tangent", "color",
			"skinIndex", "skinWeight", "lineDistance"
		];

		for ( i = 0; i < parameters.maxMorphTargets; i ++ )
			identifiers.push( "morphTarget" + i );

		for ( i = 0; i < parameters.maxMorphNormals; i ++ )
			identifiers.push( "morphNormal" + i );

		for ( a in attributes )
			identifiers.push( a );

		cacheAttributeLocations( program, identifiers );

		program.id = _programs_counter ++;

		_programs.push( { program: program, code: code, usedTimes: 1 } );

		_this.info.memory.programs = _programs.length;

		return program;

	};

	// Shader parameters cache

	function cacheUniformLocations ( program, identifiers ) {
		var i, l, id;

		for( i = 0, l = identifiers.length; i < l; i ++ ) {
			id = identifiers[ i ];
			program.uniforms[ id ] = _gl.getUniformLocation( program, id );
		}
	};

	function cacheAttributeLocations ( program, identifiers ) {
		var i, l, id;

		for( i = 0, l = identifiers.length; i < l; i ++ ) {
			id = identifiers[ i ];
			program.attributes[ id ] = _gl.getAttribLocation( program, id );
		}
	};

	function addLineNumbers ( string ) {
		var chunks = string.split( "\n" );

		for ( var i = 0, il = chunks.length; i < il; i ++ ) {
			// Chrome reports shader errors on lines
			// starting counting from 1
			chunks[ i ] = ( i + 1 ) + ": " + chunks[ i ];
		}

		return chunks.join( "\n" );
	};

	function getShader ( type, string ) {
		var shader;

		if ( type === "fragment" )
			shader = _gl.createShader( _gl.FRAGMENT_SHADER );

		else if ( type === "vertex" )
			shader = _gl.createShader( _gl.VERTEX_SHADER );

		_gl.shaderSource( shader, string );
		_gl.compileShader( shader );

		if ( !_gl.getShaderParameter( shader, _gl.COMPILE_STATUS ) ) {
			console.error( _gl.getShaderInfoLog( shader ) );
			console.error( addLineNumbers( string ) );
			return null;
		}

		return shader;
	};

	function clampToMaxSize ( image, maxSize ) {

		if ( image.width <= maxSize && image.height <= maxSize ) {

			return image;

		}

		// Warning: Scaling through the canvas will only work with images that use
		// premultiplied alpha.

		var maxDimension = Math.max( image.width, image.height );
		var newWidth = Math.floor( image.width * maxSize / maxDimension );
		var newHeight = Math.floor( image.height * maxSize / maxDimension );

		var canvas = document.createElement( 'canvas' );
		canvas.width = newWidth;
		canvas.height = newHeight;

		var ctx = canvas.getContext( "2d" );
		ctx.drawImage( image, 0, 0, image.width, image.height, 0, 0, newWidth, newHeight );

		return canvas;

	}


	function setCubeTextureDynamic ( texture, slot ) {

		_gl.activeTexture( _gl.TEXTURE0 + slot );
		_gl.bindTexture( _gl.TEXTURE_CUBE_MAP, texture.__webglTexture );

	};

	// Render targets

	function setupFrameBuffer ( framebuffer, renderTarget, textureTarget ) {

		_gl.bindFramebuffer( _gl.FRAMEBUFFER, framebuffer );
		_gl.framebufferTexture2D( _gl.FRAMEBUFFER, _gl.COLOR_ATTACHMENT0, textureTarget, renderTarget.__webglTexture, 0 );

	};

	function setupRenderBuffer ( renderbuffer, renderTarget  ) {

		_gl.bindRenderbuffer( _gl.RENDERBUFFER, renderbuffer );

		if ( renderTarget.depthBuffer && ! renderTarget.stencilBuffer ) {

			_gl.renderbufferStorage( _gl.RENDERBUFFER, _gl.DEPTH_COMPONENT16, renderTarget.width, renderTarget.height );
			_gl.framebufferRenderbuffer( _gl.FRAMEBUFFER, _gl.DEPTH_ATTACHMENT, _gl.RENDERBUFFER, renderbuffer );

		} else if ( renderTarget.depthBuffer && renderTarget.stencilBuffer ) {

			_gl.renderbufferStorage( _gl.RENDERBUFFER, _gl.DEPTH_STENCIL, renderTarget.width, renderTarget.height );
			_gl.framebufferRenderbuffer( _gl.FRAMEBUFFER, _gl.DEPTH_STENCIL_ATTACHMENT, _gl.RENDERBUFFER, renderbuffer );

		} else {

			_gl.renderbufferStorage( _gl.RENDERBUFFER, _gl.RGBA4, renderTarget.width, renderTarget.height );

		}
	};

	this.setRenderTarget = function ( renderTarget ) {
		var framebuffer = null,
			width = _viewportWidth,
			height = _viewportHeight,
			vx = _viewportX,
			vy = _viewportY;

		if ( framebuffer !== _currentFramebuffer ) {
			_gl.bindFramebuffer( _gl.FRAMEBUFFER, framebuffer );
			_gl.viewport( vx, vy, width, height );

			_currentFramebuffer = framebuffer;
		}

		_currentWidth = width;
		_currentHeight = height;
	};

	// Map three.js constants to WebGL constants
	function paramThreeToGL ( p ) {
		if ( p === THREE.RepeatWrapping ) return _gl.REPEAT;
		if ( p === THREE.ClampToEdgeWrapping ) return _gl.CLAMP_TO_EDGE;
		if ( p === THREE.MirroredRepeatWrapping ) return _gl.MIRRORED_REPEAT;

		if ( p === THREE.NearestFilter ) return _gl.NEAREST;
		if ( p === THREE.NearestMipMapNearestFilter ) return _gl.NEAREST_MIPMAP_NEAREST;
		if ( p === THREE.NearestMipMapLinearFilter ) return _gl.NEAREST_MIPMAP_LINEAR;

		if ( p === THREE.LinearFilter ) return _gl.LINEAR;
		if ( p === THREE.LinearMipMapNearestFilter ) return _gl.LINEAR_MIPMAP_NEAREST;
		if ( p === THREE.LinearMipMapLinearFilter ) return _gl.LINEAR_MIPMAP_LINEAR;

		if ( p === THREE.UnsignedByteType ) return _gl.UNSIGNED_BYTE;
		if ( p === THREE.UnsignedShort4444Type ) return _gl.UNSIGNED_SHORT_4_4_4_4;
		if ( p === THREE.UnsignedShort5551Type ) return _gl.UNSIGNED_SHORT_5_5_5_1;
		if ( p === THREE.UnsignedShort565Type ) return _gl.UNSIGNED_SHORT_5_6_5;

		if ( p === THREE.ByteType ) return _gl.BYTE;
		if ( p === THREE.ShortType ) return _gl.SHORT;
		if ( p === THREE.UnsignedShortType ) return _gl.UNSIGNED_SHORT;
		if ( p === THREE.IntType ) return _gl.INT;
		if ( p === THREE.UnsignedIntType ) return _gl.UNSIGNED_INT;
		if ( p === THREE.FloatType ) return _gl.FLOAT;

		if ( p === THREE.AlphaFormat ) return _gl.ALPHA;
		if ( p === THREE.RGBFormat ) return _gl.RGB;
		if ( p === THREE.RGBAFormat ) return _gl.RGBA;
		if ( p === THREE.LuminanceFormat ) return _gl.LUMINANCE;
		if ( p === THREE.LuminanceAlphaFormat ) return _gl.LUMINANCE_ALPHA;

		if ( p === THREE.AddEquation ) return _gl.FUNC_ADD;
		if ( p === THREE.SubtractEquation ) return _gl.FUNC_SUBTRACT;
		if ( p === THREE.ReverseSubtractEquation ) return _gl.FUNC_REVERSE_SUBTRACT;

		if ( p === THREE.ZeroFactor ) return _gl.ZERO;
		if ( p === THREE.OneFactor ) return _gl.ONE;
		if ( p === THREE.SrcColorFactor ) return _gl.SRC_COLOR;
		if ( p === THREE.OneMinusSrcColorFactor ) return _gl.ONE_MINUS_SRC_COLOR;
		if ( p === THREE.SrcAlphaFactor ) return _gl.SRC_ALPHA;
		if ( p === THREE.OneMinusSrcAlphaFactor ) return _gl.ONE_MINUS_SRC_ALPHA;
		if ( p === THREE.DstAlphaFactor ) return _gl.DST_ALPHA;
		if ( p === THREE.OneMinusDstAlphaFactor ) return _gl.ONE_MINUS_DST_ALPHA;

		if ( p === THREE.DstColorFactor ) return _gl.DST_COLOR;
		if ( p === THREE.OneMinusDstColorFactor ) return _gl.ONE_MINUS_DST_COLOR;
		if ( p === THREE.SrcAlphaSaturateFactor ) return _gl.SRC_ALPHA_SATURATE;

		if ( _glExtensionCompressedTextureS3TC !== undefined ) {
			if ( p === THREE.RGB_S3TC_DXT1_Format ) return _glExtensionCompressedTextureS3TC.COMPRESSED_RGB_S3TC_DXT1_EXT;
			if ( p === THREE.RGBA_S3TC_DXT1_Format ) return _glExtensionCompressedTextureS3TC.COMPRESSED_RGBA_S3TC_DXT1_EXT;
			if ( p === THREE.RGBA_S3TC_DXT3_Format ) return _glExtensionCompressedTextureS3TC.COMPRESSED_RGBA_S3TC_DXT3_EXT;
			if ( p === THREE.RGBA_S3TC_DXT5_Format ) return _glExtensionCompressedTextureS3TC.COMPRESSED_RGBA_S3TC_DXT5_EXT;
		}

		return 0;
	};

	// Allocations
	function allocateBones ( object ) {
		if ( _supportsBoneTextures && object && object.useVertexTexture )
			return 1024;

		else {
			var nVertexUniforms = _gl.getParameter( _gl.MAX_VERTEX_UNIFORM_VECTORS );
			var nVertexMatrices = Math.floor( ( nVertexUniforms - 20 ) / 4 );

			return nVertexMatrices;
		}
	};

	function allocateLights( lights ) {
		return {'directional' : 0, 'point' : 0, 'spot': 0, 'hemi': 0 };
	};

	function allocateShadows( lights ) {
		return 0;
	};

	// Initialization

	function initGL() {
		try {
			var attributes = {
				alpha: _alpha,
				premultipliedAlpha: _premultipliedAlpha,
				antialias: _antialias,
				stencil: _stencil,
				preserveDrawingBuffer: _preserveDrawingBuffer
			};

			_gl = _context || _canvas.getContext( 'webgl', attributes ) || _canvas.getContext( 'experimental-webgl', attributes );

			if ( _gl === null )
				throw 'Error creating WebGL context.';

		} catch ( error ){
			console.error( error );
		}

		_glExtensionTextureFloat = _gl.getExtension( 'OES_texture_float' );
		_glExtensionTextureFloatLinear = _gl.getExtension( 'OES_texture_float_linear' );
		_glExtensionStandardDerivatives = _gl.getExtension( 'OES_standard_derivatives' );

		_glExtensionTextureFilterAnisotropic = _gl.getExtension( 'EXT_texture_filter_anisotropic' ) || _gl.getExtension( 'MOZ_EXT_texture_filter_anisotropic' ) || _gl.getExtension( 'WEBKIT_EXT_texture_filter_anisotropic' );

		_glExtensionCompressedTextureS3TC = _gl.getExtension( 'WEBGL_compressed_texture_s3tc' ) || _gl.getExtension( 'MOZ_WEBGL_compressed_texture_s3tc' ) || _gl.getExtension( 'WEBKIT_WEBGL_compressed_texture_s3tc' );

		if ( ! _glExtensionTextureFloat )
			console.log( 'THREE.WebGLRenderer: Float textures not supported.' );

		if ( ! _glExtensionStandardDerivatives )
			console.log( 'THREE.WebGLRenderer: Standard derivatives not supported.' );

		if ( ! _glExtensionTextureFilterAnisotropic )
			console.log( 'THREE.WebGLRenderer: Anisotropic texture filtering not supported.' );

		if ( ! _glExtensionCompressedTextureS3TC )
			console.log( 'THREE.WebGLRenderer: S3TC compressed textures not supported.' );

		if ( _gl.getShaderPrecisionFormat === undefined ) {
			_gl.getShaderPrecisionFormat = function() {
				return {
					"rangeMin"  : 1,
					"rangeMax"  : 1,
					"precision" : 1
				};
			}
		}
	};

	function setDefaultGLState () {
		_gl.clearColor( 0, 0, 0, 1 );
		_gl.clearDepth( 1 );
		_gl.clearStencil( 0 );

		_gl.enable( _gl.DEPTH_TEST );
		_gl.depthFunc( _gl.LEQUAL );

		_gl.frontFace( _gl.CCW );
		_gl.cullFace( _gl.BACK );
		_gl.enable( _gl.CULL_FACE );

		_gl.enable( _gl.BLEND );
		_gl.blendEquation( _gl.FUNC_ADD );
		_gl.blendFunc( _gl.SRC_ALPHA, _gl.ONE_MINUS_SRC_ALPHA );

		_gl.viewport( _viewportX, _viewportY, _viewportWidth, _viewportHeight );
		
		_gl.clearColor( _clearColor.r, _clearColor.g, _clearColor.b, _clearAlpha );
	};
};

//-SCENE
THREE.Scene = function () {
	THREE.Object3D.call( this );

	this.fog = null;
	this.overrideMaterial = null;

	this.autoUpdate = true; // checked by the renderer
	this.matrixAutoUpdate = false;

	this.__lights = [];

	this.__objectsAdded = [];
	this.__objectsRemoved = [];
};

THREE.Scene.prototype = Object.create( THREE.Object3D.prototype );

THREE.Scene.prototype.__addObject = function ( object ) {
	 if ( !( object instanceof THREE.Camera) ) {
		this.__objectsAdded.push( object );

		// check if previously removed
		var i = this.__objectsRemoved.indexOf( object );

		if ( i !== -1 )
			this.__objectsRemoved.splice( i, 1 );
	}

	this.dispatchEvent( { type: 'objectAdded', object: object } );
	object.dispatchEvent( { type: 'addedToScene', scene: this } );

	for ( var c = 0; c < object.children.length; c ++ )
		this.__addObject( object.children[ c ] );
};

//-WEBGLRENDERTARGET
THREE.WebGLRenderTarget = function ( width, height, options ) {
	this.width = width;
	this.height = height;

	options = options || {};

	this.wrapS = options.wrapS !== undefined ? options.wrapS : THREE.ClampToEdgeWrapping;
	this.wrapT = options.wrapT !== undefined ? options.wrapT : THREE.ClampToEdgeWrapping;

	this.magFilter = options.magFilter !== undefined ? options.magFilter : THREE.LinearFilter;
	this.minFilter = options.minFilter !== undefined ? options.minFilter : THREE.LinearMipMapLinearFilter;

	this.anisotropy = options.anisotropy !== undefined ? options.anisotropy : 1;

	this.offset = new THREE.Vector2( 0, 0 );
	this.repeat = new THREE.Vector2( 1, 1 );

	this.format = options.format !== undefined ? options.format : THREE.RGBAFormat;
	this.type = options.type !== undefined ? options.type : THREE.UnsignedByteType;

	this.depthBuffer = options.depthBuffer !== undefined ? options.depthBuffer : true;
	this.stencilBuffer = options.stencilBuffer !== undefined ? options.stencilBuffer : true;

	this.generateMipmaps = true;

	this.shareDepthFrom = null;
};

THREE.WebGLRenderTarget.prototype = {
	constructor: THREE.WebGLRenderTarget,

	clone: function () {
		var tmp = new THREE.WebGLRenderTarget( this.width, this.height );

		tmp.wrapS = this.wrapS;
		tmp.wrapT = this.wrapT;

		tmp.magFilter = this.magFilter;
		tmp.minFilter = this.minFilter;

		tmp.anisotropy = this.anisotropy;

		tmp.offset.copy( this.offset );
		tmp.repeat.copy( this.repeat );

		tmp.format = this.format;
		tmp.type = this.type;

		tmp.depthBuffer = this.depthBuffer;
		tmp.stencilBuffer = this.stencilBuffer;

		tmp.generateMipmaps = this.generateMipmaps;

		tmp.shareDepthFrom = this.shareDepthFrom;

		return tmp;
	},

	dispose: function () {
		this.dispatchEvent( { type: 'dispose' } );
	}
};

THREE.EventDispatcher.prototype.apply( THREE.WebGLRenderTarget.prototype );

THREE.WebGLRenderTargetCube = function ( width, height, options ) {
	THREE.WebGLRenderTarget.call( this, width, height, options );
	this.activeCubeFace = 0; // PX 0, NX 1, PY 2, NY 3, PZ 4, NZ 5
};

THREE.WebGLRenderTargetCube.prototype = Object.create( THREE.WebGLRenderTarget.prototype );
THREE.Scene.prototype.__removeObject = function ( object ) {
	if ( !( object instanceof THREE.Camera ) ) {
		this.__objectsRemoved.push( object );

		// check if previously added
		var i = this.__objectsAdded.indexOf( object );

		if ( i !== -1 )
			this.__objectsAdded.splice( i, 1 );
	}

	this.dispatchEvent( { type: 'objectRemoved', object: object } );
	object.dispatchEvent( { type: 'removedFromScene', scene: this } );

	for ( var c = 0; c < object.children.length; c ++ )
		this.__removeObject( object.children[ c ] );
};

THREE.Scene.prototype.clone = function ( object ) {
	if ( object === undefined ) 
		object = new THREE.Scene();

	THREE.Object3D.prototype.clone.call(this, object);

	if ( this.fog !== null ) 
		object.fog = this.fog.clone();

	if ( this.overrideMaterial !== null ) 
		object.overrideMaterial = this.overrideMaterial.clone();

	object.autoUpdate = this.autoUpdate;
	object.matrixAutoUpdate = this.matrixAutoUpdate;

	return object;
};

//-EULER
THREE.Euler = function ( x, y, z, order ) {
	this._x = x || 0;
	this._y = y || 0;
	this._z = z || 0;
	this._order = order || THREE.Euler.DefaultOrder;
};

THREE.Euler.RotationOrders = [ 'XYZ', 'YZX', 'ZXY', 'XZY', 'YXZ', 'ZYX' ];

THREE.Euler.DefaultOrder = 'XYZ';

THREE.Euler.prototype = {
	constructor: THREE.Euler,

	_x: 0, _y: 0, _z: 0, _order: THREE.Euler.DefaultOrder,

	_quaternion: undefined,

	_updateQuaternion: function () {
		if ( this._quaternion !== undefined )
			this._quaternion.setFromEuler( this, false );
	},

	get x () {
		return this._x;
	},

	set x ( value ) {
		this._x = value;
		this._updateQuaternion();
	},

	get y () {
		return this._y;
	},

	set y ( value ) {
		this._y = value;
		this._updateQuaternion();
	},

	get z () {
		return this._z;
	},

	set z ( value ) {
		this._z = value;
		this._updateQuaternion();
	},

	get order () {
		return this._order;
	},

	set order ( value ) {
		this._order = value;
		this._updateQuaternion();
	},

	set: function ( x, y, z, order ) {

		this._x = x;
		this._y = y;
		this._z = z;
		this._order = order || this._order;

		this._updateQuaternion();

		return this;

	},

	setFromQuaternion: function ( q, order, update ) {
		function clamp( x ) {
			return Math.min( Math.max( x, -1 ), 1 );
		}
		// http://www.mathworks.com/matlabcentral/fileexchange/20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/content/SpinCalc.m

		var sqx = q.x * q.x;
		var sqy = q.y * q.y;
		var sqz = q.z * q.z;
		var sqw = q.w * q.w;

		order = order || this._order;

		switch(order){
			case 'XYZ':
					this._x = Math.atan2( 2 * ( q.x * q.w - q.y * q.z ), ( sqw - sqx - sqy + sqz ) );
					this._y = Math.asin(  clamp( 2 * ( q.x * q.z + q.y * q.w ) ) );
					this._z = Math.atan2( 2 * ( q.z * q.w - q.x * q.y ), ( sqw + sqx - sqy - sqz ) );
				break;
			case 'YXZ':
					this._x = Math.asin(  clamp( 2 * ( q.x * q.w - q.y * q.z ) ) );
					this._y = Math.atan2( 2 * ( q.x * q.z + q.y * q.w ), ( sqw - sqx - sqy + sqz ) );
					this._z = Math.atan2( 2 * ( q.x * q.y + q.z * q.w ), ( sqw - sqx + sqy - sqz ) );
				break;
			case 'ZXY':
					this._x = Math.asin(  clamp( 2 * ( q.x * q.w + q.y * q.z ) ) );
					this._y = Math.atan2( 2 * ( q.y * q.w - q.z * q.x ), ( sqw - sqx - sqy + sqz ) );
					this._z = Math.atan2( 2 * ( q.z * q.w - q.x * q.y ), ( sqw - sqx + sqy - sqz ) );
				break;
			case 'ZYX':
					this._x = Math.atan2( 2 * ( q.x * q.w + q.z * q.y ), ( sqw - sqx - sqy + sqz ) );
					this._y = Math.asin(  clamp( 2 * ( q.y * q.w - q.x * q.z ) ) );
					this._z = Math.atan2( 2 * ( q.x * q.y + q.z * q.w ), ( sqw + sqx - sqy - sqz ) );
				break;
			case 'YZX':
					this._x = Math.atan2( 2 * ( q.x * q.w - q.z * q.y ), ( sqw - sqx + sqy - sqz ) );
					this._y = Math.atan2( 2 * ( q.y * q.w - q.x * q.z ), ( sqw + sqx - sqy - sqz ) );
					this._z = Math.asin(  clamp( 2 * ( q.x * q.y + q.z * q.w ) ) );
				break;
			case 'XZY':
					this._x = Math.atan2( 2 * ( q.x * q.w + q.y * q.z ), ( sqw - sqx + sqy - sqz ) );
					this._y = Math.atan2( 2 * ( q.x * q.z + q.y * q.w ), ( sqw + sqx - sqy - sqz ) );
					this._z = Math.asin(  clamp( 2 * ( q.z * q.w - q.x * q.y ) ) );
				break;
			default:
				console.warn( 'WARNING: Euler.setFromQuaternion() given unsupported order: ' + order );
		}

		this._order = order;

		if ( update !== false )
			this._updateQuaternion();

		return this;
	},

	reorder: function () {
		var q = new THREE.Quaternion();

		return function ( newOrder ) {
			q.setFromEuler( this );
			this.setFromQuaternion( q, newOrder );
		};
	}(),

	clone: function () {
		return new THREE.Euler( this._x, this._y, this._z, this._order );
	}
};

//-MATERIAL
THREE.Material = function () {
	this.id = THREE.MaterialIdCount ++;
	this.uuid = THREE.Math.generateUUID();

	this.name = '';

	this.side = THREE.FrontSide;

	this.opacity = 1;
	this.transparent = false;

	this.blending = THREE.NormalBlending;

	this.blendSrc = THREE.SrcAlphaFactor;
	this.blendDst = THREE.OneMinusSrcAlphaFactor;
	this.blendEquation = THREE.AddEquation;

	this.depthTest = true;
	this.depthWrite = true;

	this.polygonOffset = false;
	this.polygonOffsetFactor = 0;
	this.polygonOffsetUnits = 0;

	this.alphaTest = 0;

	this.overdraw = 0; // Overdrawn pixels (typically between 0 and 1) for fixing antialiasing gaps in CanvasRenderer

	this.visible = true;

	this.needsUpdate = true;
};

THREE.Material.prototype = {
	constructor: THREE.Material,

	setValues: function ( values ) {
		if ( values === undefined ) return;

		for ( var key in values ) {
			var newValue = values[ key ];

			if ( newValue === undefined ) {
				console.warn( 'THREE.Material: \'' + key + '\' parameter is undefined.' );
				continue;
			}

			if ( key in this ) {
				var currentValue = this[ key ];

				if ( currentValue instanceof THREE.Color )
					currentValue.set( newValue );

				else if ( currentValue instanceof THREE.Vector3 && newValue instanceof THREE.Vector3 )
					currentValue.copy( newValue );

				else if ( key == 'overdraw')
					// ensure overdraw is backwards-compatable with legacy boolean type
					this[ key ] = Number(newValue);

				else
					this[ key ] = newValue;

			}

		}

	},

	clone: function ( material ) {

		if ( material === undefined ) material = new THREE.Material();

		material.name = this.name;

		material.side = this.side;

		material.opacity = this.opacity;
		material.transparent = this.transparent;

		material.blending = this.blending;

		material.blendSrc = this.blendSrc;
		material.blendDst = this.blendDst;
		material.blendEquation = this.blendEquation;

		material.depthTest = this.depthTest;
		material.depthWrite = this.depthWrite;

		material.polygonOffset = this.polygonOffset;
		material.polygonOffsetFactor = this.polygonOffsetFactor;
		material.polygonOffsetUnits = this.polygonOffsetUnits;

		material.alphaTest = this.alphaTest;

		material.overdraw = this.overdraw;

		material.visible = this.visible;

		return material;
	},

	dispose: function () {
		this.dispatchEvent( { type: 'dispose' } );
	}
};

THREE.EventDispatcher.prototype.apply( THREE.Material.prototype );
THREE.MaterialIdCount = 0;

//-SHADERMATERIAL
/**
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  fragmentShader: <string>,
 *  vertexShader: <string>,
 *
 *  uniforms: { "parameter1": { type: "f", value: 1.0 }, "parameter2": { type: "i" value2: 2 } },
 *
 *  defines: { "label" : "value" },
 *
 *  shading: THREE.SmoothShading,
 *  blending: THREE.NormalBlending,
 *  depthTest: <bool>,
 *  depthWrite: <bool>,
 *
 *  wireframe: <boolean>,
 *  wireframeLinewidth: <float>,
 *
 *  lights: <bool>,
 *
 *  vertexColors: THREE.NoColors / THREE.VertexColors / THREE.FaceColors,
 *
 *  skinning: <bool>,
 *  morphTargets: <bool>,
 *  morphNormals: <bool>,
 *
 *	fog: <bool>
 * }
 */
THREE.ShaderMaterial = function ( parameters ) {

	THREE.Material.call( this );

	this.fragmentShader = "void main() {}";
	this.vertexShader = "void main() {}";
	this.uniforms = {};
	this.defines = {};
	this.attributes = null;

	this.shading = THREE.SmoothShading;

	this.linewidth = 1;

	this.wireframe = false;
	this.wireframeLinewidth = 1;

	this.fog = false; // set to use scene fog

	this.lights = false; // set to use scene lights

	this.vertexColors = THREE.NoColors; // set to use "color" attribute stream

	this.skinning = false; // set to use skinning attribute streams

	this.morphTargets = false; // set to use morph targets
	this.morphNormals = false; // set to use morph normals

	// When rendered geometry doesn't include these attributes but the material does,
	// use these default values in WebGL. This avoids errors when buffer data is missing.
	this.defaultAttributeValues = {
		"color" : [ 1, 1, 1],
		"uv" : [ 0, 0 ],
		"uv2" : [ 0, 0 ]
	};

	// By default, bind position to attribute index 0. In WebGL, attribute 0
	// should always be used to avoid potentially expensive emulation.
	this.index0AttributeName = "position";
	this.setValues( parameters );
};

THREE.ShaderMaterial.prototype = Object.create( THREE.Material.prototype );

THREE.ShaderMaterial.prototype.clone = function () {

	var material = new THREE.ShaderMaterial();

	THREE.Material.prototype.clone.call( this, material );

	material.fragmentShader = this.fragmentShader;
	material.vertexShader = this.vertexShader;

	material.uniforms = THREE.UniformsUtils.clone( this.uniforms );

	material.attributes = this.attributes;
	material.defines = this.defines;

	material.shading = this.shading;

	material.wireframe = this.wireframe;
	material.wireframeLinewidth = this.wireframeLinewidth;

	material.fog = this.fog;

	material.lights = this.lights;

	material.vertexColors = this.vertexColors;

	material.skinning = this.skinning;

	material.morphTargets = this.morphTargets;
	material.morphNormals = this.morphNormals;

	return material;
};

//-GEOMETRY
THREE.Geometry = function () {
	this.id = THREE.GeometryIdCount ++;
	this.uuid = THREE.Math.generateUUID();

	this.name = '';

	this.vertices = [];
	this.colors = [];  // one-to-one vertex colors, used in ParticleSystem and Line

	this.faces = [];

	this.faceVertexUvs = [[]];

	this.morphTargets = [];
	this.morphColors = [];
	this.morphNormals = [];

	this.skinWeights = [];
	this.skinIndices = [];

	this.lineDistances = [];

	this.boundingBox = null;
	this.boundingSphere = null;

	this.hasTangents = false;

	this.dynamic = true; // the intermediate typed arrays will be deleted when set to false

	// update flags

	this.verticesNeedUpdate = false;
	this.elementsNeedUpdate = false;
	this.uvsNeedUpdate = false;
	this.normalsNeedUpdate = false;
	this.tangentsNeedUpdate = false;
	this.colorsNeedUpdate = false;
	this.lineDistancesNeedUpdate = false;

	this.buffersNeedUpdate = false;
};

THREE.Geometry.prototype = {
	constructor: THREE.Geometry,

	applyMatrix: function ( matrix ) {
		var normalMatrix = new THREE.Matrix3().getNormalMatrix( matrix );

		for ( var i = 0, il = this.vertices.length; i < il; i ++ ) {
			var vertex = this.vertices[ i ];
			vertex.applyMatrix4( matrix );
		}

		for ( var i = 0, il = this.faces.length; i < il; i ++ ) {
			var face = this.faces[ i ];
			face.normal.applyMatrix3( normalMatrix ).normalize();

			for ( var j = 0, jl = face.vertexNormals.length; j < jl; j ++ )
				face.vertexNormals[ j ].applyMatrix3( normalMatrix ).normalize();

			face.centroid.applyMatrix4( matrix );
		}

		if ( this.boundingBox instanceof THREE.Box3 )
			this.computeBoundingBox();

		if ( this.boundingSphere instanceof THREE.Sphere )
			this.computeBoundingSphere();
	},

	// Geometry splitting
	makeGroups: ( function () {

		var geometryGroupCounter = 0;
		
		return function ( usesFaceMaterial ) {

			var f, fl, face, materialIndex,
				groupHash, hash_map = {};

			var numMorphTargets = this.morphTargets.length;
			var numMorphNormals = this.morphNormals.length;

			this.geometryGroups = {};

			for ( f = 0, fl = this.faces.length; f < fl; f ++ ) {
				face = this.faces[ f ];
				materialIndex = usesFaceMaterial ? face.materialIndex : 0;

				if ( ! ( materialIndex in hash_map ) )
					hash_map[ materialIndex ] = { 'hash': materialIndex, 'counter': 0 };

				groupHash = hash_map[ materialIndex ].hash + '_' + hash_map[ materialIndex ].counter;

				if ( ! ( groupHash in this.geometryGroups ) )
					this.geometryGroups[ groupHash ] = { 'faces3': [], 'materialIndex': materialIndex, 'vertices': 0, 'numMorphTargets': numMorphTargets, 'numMorphNormals': numMorphNormals };

				if ( this.geometryGroups[ groupHash ].vertices + 3 > 65535 ) {
					hash_map[ materialIndex ].counter += 1;
					groupHash = hash_map[ materialIndex ].hash + '_' + hash_map[ materialIndex ].counter;

					if ( ! ( groupHash in this.geometryGroups ) )
						this.geometryGroups[ groupHash ] = { 'faces3': [], 'materialIndex': materialIndex, 'vertices': 0, 'numMorphTargets': numMorphTargets, 'numMorphNormals': numMorphNormals };
				}

				this.geometryGroups[ groupHash ].faces3.push( f );
				this.geometryGroups[ groupHash ].vertices += 3;
			}

			this.geometryGroupsList = [];

			for ( var g in this.geometryGroups ) {
				this.geometryGroups[ g ].id = geometryGroupCounter ++;
				this.geometryGroupsList.push( this.geometryGroups[ g ] );
			}
		};
	} )(),

	clone: function () {
		var geometry = new THREE.Geometry();
		var vertices = this.vertices;

		for ( var i = 0, il = vertices.length; i < il; i ++ )
			geometry.vertices.push( vertices[ i ].clone() );

		var faces = this.faces;

		for ( var i = 0, il = faces.length; i < il; i ++ )
			geometry.faces.push( faces[ i ].clone() );

		var uvs = this.faceVertexUvs[ 0 ];

		for ( var i = 0, il = uvs.length; i < il; i ++ ) {
			var uv = uvs[ i ], uvCopy = [];

			for ( var j = 0, jl = uv.length; j < jl; j ++ )
				uvCopy.push( new THREE.Vector2( uv[ j ].x, uv[ j ].y ) );

			geometry.faceVertexUvs[ 0 ].push( uvCopy );
		}

		return geometry;
	},

	dispose: function () {
		this.dispatchEvent( { type: 'dispose' } );
	}
};

THREE.EventDispatcher.prototype.apply( THREE.Geometry.prototype );

THREE.GeometryIdCount = 0;

//-MESH
THREE.Mesh = function ( geometry, material ) {
	THREE.Object3D.call( this );

	this.geometry = geometry !== undefined ? geometry : new THREE.Geometry();
	this.material = material !== undefined ? material : new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff } );

	this.updateMorphTargets();
};

THREE.Mesh.prototype = Object.create( THREE.Object3D.prototype );

THREE.Mesh.prototype.updateMorphTargets = function () {
	if ( this.geometry.morphTargets !== undefined && this.geometry.morphTargets.length > 0 ) {
		this.morphTargetBase = -1;
		this.morphTargetForcedOrder = [];
		this.morphTargetInfluences = [];
		this.morphTargetDictionary = {};

		for ( var m = 0, ml = this.geometry.morphTargets.length; m < ml; m ++ ) {
			this.morphTargetInfluences.push( 0 );
			this.morphTargetDictionary[ this.geometry.morphTargets[ m ].name ] = m;
		}
	}
};

THREE.Mesh.prototype.getMorphTargetIndexByName = function ( name ) {
	if ( this.morphTargetDictionary[ name ] !== undefined )
		return this.morphTargetDictionary[ name ];

	console.log( "THREE.Mesh.getMorphTargetIndexByName: morph target " + name + " does not exist. Returning 0." );
	return 0;
};

THREE.Mesh.prototype.clone = function ( object ) {
	if ( object === undefined ) 
		object = new THREE.Mesh( this.geometry, this.material );

	THREE.Object3D.prototype.clone.call( this, object );
	return object;
};

//-GEOMETRYUTILS
THREE.GeometryUtils = {
	// Merge two geometries or geometry and geometry from object (using object's transform)
	merge: function ( geometry1, object2 /* mesh | geometry */, materialIndexOffset ) {
		var matrix, normalMatrix,
		vertexOffset = geometry1.vertices.length,
		uvPosition = geometry1.faceVertexUvs[ 0 ].length,
		geometry2 = object2 instanceof THREE.Mesh ? object2.geometry : object2,
		vertices1 = geometry1.vertices,
		vertices2 = geometry2.vertices,
		faces1 = geometry1.faces,
		faces2 = geometry2.faces,
		uvs1 = geometry1.faceVertexUvs[ 0 ],
		uvs2 = geometry2.faceVertexUvs[ 0 ];

		if ( materialIndexOffset === undefined ) 
			materialIndexOffset = 0;

		if ( object2 instanceof THREE.Mesh ) {
			object2.matrixAutoUpdate && object2.updateMatrix();

			matrix = object2.matrix;

			normalMatrix = new THREE.Matrix3().getNormalMatrix( matrix );
		}

		// vertices

		for ( var i = 0, il = vertices2.length; i < il; i ++ ) {
			var vertex = vertices2[ i ];
			var vertexCopy = vertex.clone();

			if ( matrix ) 
				vertexCopy.applyMatrix4( matrix );

			vertices1.push( vertexCopy );
		}

		// faces

		for ( i = 0, il = faces2.length; i < il; i ++ ) {
			var face = faces2[ i ], faceCopy, normal, color,
			faceVertexNormals = face.vertexNormals,
			faceVertexColors = face.vertexColors;

			faceCopy = new THREE.Face3( face.a + vertexOffset, face.b + vertexOffset, face.c + vertexOffset );
			faceCopy.normal.copy( face.normal );

			if ( normalMatrix )
				faceCopy.normal.applyMatrix3( normalMatrix ).normalize();


			for ( var j = 0, jl = faceVertexNormals.length; j < jl; j ++ ) {
				normal = faceVertexNormals[ j ].clone();

				if ( normalMatrix )
					normal.applyMatrix3( normalMatrix ).normalize();

				faceCopy.vertexNormals.push( normal );
			}

			faceCopy.color.copy( face.color );

			for ( var j = 0, jl = faceVertexColors.length; j < jl; j ++ ) {
				color = faceVertexColors[ j ];
				faceCopy.vertexColors.push( color.clone() );
			}

			faceCopy.materialIndex = face.materialIndex + materialIndexOffset;
			faceCopy.centroid.copy( face.centroid );

			if ( matrix )
				faceCopy.centroid.applyMatrix4( matrix );

			faces1.push( faceCopy );
		}

		// uvs

		for ( i = 0, il = uvs2.length; i < il; i ++ ) {
			var uv = uvs2[ i ], uvCopy = [];

			for ( var j = 0, jl = uv.length; j < jl; j ++ )
				uvCopy.push( new THREE.Vector2( uv[ j ].x, uv[ j ].y ) );

			uvs1.push( uvCopy );
		}
	},

	// Get random point in triangle (via barycentric coordinates)
	// 	(uniform distribution)
	// 	http://www.cgafaq.info/wiki/Random_Point_In_Triangle

	randomPointInTriangle: function () {
		var vector = new THREE.Vector3();

		return function ( vectorA, vectorB, vectorC ) {
			var point = new THREE.Vector3();

			var a = THREE.Math.random16();
			var b = THREE.Math.random16();

			if ( ( a + b ) > 1 ) {
				a = 1 - a;
				b = 1 - b;
			}

			var c = 1 - a - b;

			point.copy( vectorA );
			point.multiplyScalar( a );

			vector.copy( vectorB );
			vector.multiplyScalar( b );

			point.add( vector );

			vector.copy( vectorC );
			vector.multiplyScalar( c );

			point.add( vector );

			return point;
		};
	}(),

	// Get uniformly distributed random points in mesh
	// 	- create array with cumulative sums of face areas
	//  - pick random number from 0 to total area
	//  - find corresponding place in area array by binary search
	//	- get random point in face

	// Get triangle area (half of parallelogram)
	//	http://mathworld.wolfram.com/TriangleArea.html
	triangleArea: function () {
		var vector1 = new THREE.Vector3();
		var vector2 = new THREE.Vector3();

		return function ( vectorA, vectorB, vectorC ) {
			vector1.subVectors( vectorB, vectorA );
			vector2.subVectors( vectorC, vectorA );
			vector1.cross( vector2 );

			return 0.5 * vector1.length();
		};
	}()
};

//THREE
self.console = self.console || {
	info: function () {},
	log: function () {},
	debug: function () {},
	warn: function () {},
	error: function () {}
};

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel
// using 'self' instead of 'window' for compatibility with both NodeJS and IE10.
( function () {
	var lastTime = 0;
	var vendors = [ 'ms', 'moz', 'webkit', 'o' ];

	for ( var x = 0; x < vendors.length && !self.requestAnimationFrame; ++ x ) {
		self.requestAnimationFrame = self[ vendors[ x ] + 'RequestAnimationFrame' ];
		self.cancelAnimationFrame = self[ vendors[ x ] + 'CancelAnimationFrame' ] || self[ vendors[ x ] + 'CancelRequestAnimationFrame' ];
	}

	if ( self.requestAnimationFrame === undefined && self['setTimeout'] !== undefined )
		self.requestAnimationFrame = function ( callback ) {

			var currTime = Date.now(), timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) );
			var id = self.setTimeout( function() { callback( currTime + timeToCall ); }, timeToCall );
			lastTime = currTime + timeToCall;
			return id;

		};

	if( self.cancelAnimationFrame === undefined && self['clearTimeout'] !== undefined )
		self.cancelAnimationFrame = function ( id ) { self.clearTimeout( id ) };
}() );

// GL STATE CONSTANTS
THREE.CullFaceNone = 0;
THREE.CullFaceBack = 1;
THREE.CullFaceFront = 2;
THREE.CullFaceFrontBack = 3;

THREE.FrontFaceDirectionCW = 0;
THREE.FrontFaceDirectionCCW = 1;

// SHADOWING TYPES
THREE.BasicShadowMap = 0;
THREE.PCFShadowMap = 1;
THREE.PCFSoftShadowMap = 2;

// MATERIAL CONSTANTS
// side
THREE.FrontSide = 0;
THREE.BackSide = 1;
THREE.DoubleSide = 2;

// shading
THREE.NoShading = 0;
THREE.FlatShading = 1;
THREE.SmoothShading = 2;

// colors
THREE.NoColors = 0;
THREE.FaceColors = 1;
THREE.VertexColors = 2;

// blending modes
THREE.NoBlending = 0;
THREE.NormalBlending = 1;
THREE.AdditiveBlending = 2;
THREE.SubtractiveBlending = 3;
THREE.MultiplyBlending = 4;
THREE.CustomBlending = 5;

// custom blending equations
// (numbers start from 100 not to clash with other
//  mappings to OpenGL constants defined in Texture.js)
THREE.AddEquation = 100;
THREE.SubtractEquation = 101;
THREE.ReverseSubtractEquation = 102;

// custom blending destination factors
THREE.ZeroFactor = 200;
THREE.OneFactor = 201;
THREE.SrcColorFactor = 202;
THREE.OneMinusSrcColorFactor = 203;
THREE.SrcAlphaFactor = 204;
THREE.OneMinusSrcAlphaFactor = 205;
THREE.DstAlphaFactor = 206;
THREE.OneMinusDstAlphaFactor = 207;

// custom blending source factors
THREE.DstColorFactor = 208;
THREE.OneMinusDstColorFactor = 209;
THREE.SrcAlphaSaturateFactor = 210;


// TEXTURE CONSTANTS
THREE.MultiplyOperation = 0;
THREE.MixOperation = 1;
THREE.AddOperation = 2;

// Mapping modes
THREE.UVMapping = function () {};

THREE.CubeReflectionMapping = function () {};
THREE.CubeRefractionMapping = function () {};

THREE.SphericalReflectionMapping = function () {};
THREE.SphericalRefractionMapping = function () {};

// Wrapping modes
THREE.RepeatWrapping = 1000;
THREE.ClampToEdgeWrapping = 1001;
THREE.MirroredRepeatWrapping = 1002;

// Filters
THREE.NearestFilter = 1003;
THREE.NearestMipMapNearestFilter = 1004;
THREE.NearestMipMapLinearFilter = 1005;
THREE.LinearFilter = 1006;
THREE.LinearMipMapNearestFilter = 1007;
THREE.LinearMipMapLinearFilter = 1008;

// Data types
THREE.UnsignedByteType = 1009;
THREE.ByteType = 1010;
THREE.ShortType = 1011;
THREE.UnsignedShortType = 1012;
THREE.IntType = 1013;
THREE.UnsignedIntType = 1014;
THREE.FloatType = 1015;

// Pixel types
//THREE.UnsignedByteType = 1009;
THREE.UnsignedShort4444Type = 1016;
THREE.UnsignedShort5551Type = 1017;
THREE.UnsignedShort565Type = 1018;

// Pixel formats
THREE.AlphaFormat = 1019;
THREE.RGBFormat = 1020;
THREE.RGBAFormat = 1021;
THREE.LuminanceFormat = 1022;
THREE.LuminanceAlphaFormat = 1023;

// Compressed texture formats
THREE.RGB_S3TC_DXT1_Format = 2001;
THREE.RGBA_S3TC_DXT1_Format = 2002;
THREE.RGBA_S3TC_DXT3_Format = 2003;
THREE.RGBA_S3TC_DXT5_Format = 2004;
get x(){return this._x;},set x(v){this._x=v;this._updateEuler();},get y(){return this._y;},set y(v){this._y=v;this._updateEuler();},get z(){return this._z;},set z(v){this._z=v;this._updateEuler();},get w(){return this._w;},set w(v){this._w = value;this._updateEuler();},