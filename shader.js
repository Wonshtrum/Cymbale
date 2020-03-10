//VERTEX SHADER
let vertCode = `#version 300 es

in vec3 a_position;
in vec4 a_color;
in vec2 a_texCoord;
in float a_texIndex;
out vec2 v_position;
out vec4 v_color;
out vec2 v_texCoord;
out float v_texIndex;

uniform vec2 u_screen;
uniform vec4 u_transform;

void main(void) {
	gl_Position = vec4(a_position.x/u_screen.x, a_position.y/u_screen.y, 1, 1);
	v_position = a_position.xy;
	v_color = a_color;
	v_texCoord = a_texCoord;
	v_texIndex = a_texIndex;
}`;

//COMPILATION
let vertShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertShader, vertCode);
gl.compileShader(vertShader);

//FRAGMENT SHADER
let fragCode = `#version 300 es
precision mediump float;

in vec2 v_position;
in vec4 v_color;
in vec2 v_texCoord;
in float v_texIndex;
out vec4 fragColor;

uniform sampler2D u_textures[32];
uniform vec3 u_lights[1024];
uniform vec3 u_colors[1024];
uniform int u_nbLights;
uniform int u_world[256];

#define WALL3D
#define SHARP 1.0
#define WALLH 0.3

bool wall(int x, int y, bool rev) {
	return rev ? u_world[y+16*x] == 1 : u_world[x+16*y] == 1;
}

float _line(float x0, float y0, float xl, float yl, bool rev) {
	int dx = xl < x0 ? 1 : -1;
	int dy = yl < y0 ? 1 : -1;
	float a = float(dx)*(y0-yl)/(x0-xl);
	float J = dx > 0 ? yl-fract(xl)*a : yl-(1.0-fract(xl))*a;
	int j;
	bool first = true;
	float l = 1.0;
	for (int i = int(xl) ; i != int(x0)+dx ; i += dx) {
		j = int(J);
		if ((!first || j == int(yl)) && wall(i,j,rev)) {
#ifdef SHARP
			if (j == int(J+a) || wall(i,j+dy,rev) || wall(i-dx,j+dy,rev)) return 0.0;
			l *= 1.0-SHARP*(1.0-abs((J+a-float(j+(dy+1)/2))/a));
#else
			return 0.0;
#endif
		}
		if (j != int(J+a) && dy*int(J+a) <= dy*int(y0) && wall(i,j+dy,rev)) {
#ifdef SHARP
			if (wall(i+dx,j,rev) || wall(i+dx,j+dy,rev)) return 0.0;
			l *= 1.0-SHARP*abs((J+a-float(j+(dy+1)/2))/a);
#else
			return 0.0;
#endif
		}
		J += a;
		first = false;
		if (l < 0.0) return 0.0;
	}
	if (l > 1.0) return 1.0;
	return l*l;
}

float line(float x0, float y0, float xl, float yl) {
	float c = 1.0;
#ifdef WALL3D
	if (wall(int(x0),int(y0-WALLH),false)) return 0.0;
	if (wall(int(xl),int(yl),false)) {
		yl = float(int(yl))-0.001;
	}
	if (wall(int(x0),int(y0),false)) {
		if (float(int(y0)) < yl) return 0.0;
		y0 = float(int(y0))-0.001;
		c = 0.9;
	}
#else
	if (wall(int(x0),int(y0),false) || wall(int(xl),int(yl),false)) return 0.0;
#endif
	if (abs(yl-y0) > abs(xl-x0)) {
		return c*_line(y0,x0,yl,xl,true);
	}
	return c*_line(x0,y0,xl,yl,false);
}

void main(void) {
	vec3 A;
	int index = int(v_texIndex);
	vec3 power = vec3(0.0);
	float x = 16.0*(0.5+v_position.x/500.0);
	float y = 16.0*(0.5+v_position.y/500.0);
	float xl;
	float yl;
#ifndef WALL3D
	if (!wall(int(x),int(y),false)) {
#else
	if (!wall(int(x),int(y-WALLH),false)) {
#endif
		float l;
		float d;
		float a;
		for (int i = 0 ; i < u_nbLights ; i++) {
			xl = 16.0*(0.5+u_lights[i].x/500.0);
			yl = 16.0*(0.5+u_lights[i].y/500.0);
			l = line(x, y, xl, yl);
			if (l > 0.0) {
				d = length(u_lights[i].xy-v_position)/250.0;
				a = u_lights[i].z;
				A = vec3(0.5,2.0*a,3.0*a*a);
				a = 1.0/(A.x+A.y*d+A.z*d*d);
				power += a*u_colors[i]*l;
			}
		}
	} else {
		power = vec3(1.0);
	}
	fragColor = texture(u_textures[index], v_texCoord)*v_color*vec4(power,1);
}`;

//COMPILATION
let fragShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragShader, fragCode);
gl.compileShader(fragShader);


//SHADER PROGRAM
let shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertShader);
gl.attachShader(shaderProgram, fragShader);
gl.linkProgram(shaderProgram);
gl.useProgram(shaderProgram);


//UNIFORM LOCATION
const uScreen = gl.getUniformLocation(shaderProgram, 'u_screen');
const uTransform = gl.getUniformLocation(shaderProgram, 'u_transform');
const uTextures = gl.getUniformLocation(shaderProgram, 'u_textures');

const uLights = gl.getUniformLocation(shaderProgram, 'u_lights');
const uColors = gl.getUniformLocation(shaderProgram, 'u_colors');
const uNbLights = gl.getUniformLocation(shaderProgram, 'u_nbLights');

const uWorld = gl.getUniformLocation(shaderProgram, 'u_world');

gl.uniform2f(uScreen, width/2, height/2);
gl.uniform1iv(uTextures, [...Array(10).keys()]);

let lights = [[70,70,1.5],[-30,-20,4],[100,140,2]];
let colors = [[1,1,1],[0.8,0.4,0],[0,1,1]];
let test = true;
if (test) {
	let n = 3;
	lights = Array.from({length:n*n}, (e,i) => [1+width*((i%n)/n-0.5),1+height*((i-i%n)/(n*n)-0.5),lights[i%3][2]]);
	colors = Array.from({length:n*n}, (e,i) => colors[i%3]);
	//lights[0][2] = 0.8;
}
let world = Array.from({length:256}, (e,i) => Math.sin(i*984651)*Math.cos(i*43)>0.5)
if (!test) {
	world.fill(0);
	world[137] = 1;
	world[122] = 1;
}
gl.uniform1i(uNbLights, lights.length);
gl.uniform3fv(uLights, lights.flat());
gl.uniform3fv(uColors, colors.flat());
gl.uniform1iv(uWorld, world);
