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
uniform vec3 u_lights[10];
uniform vec3 u_colors[10];
uniform int u_nbLights;
uniform int u_world[256];

bool wall(int x, int y) {
	return u_world[x+16*y]==1;
}

bool line(float x0, float y0, float xl, float yl) {
	//if (xl>=x0 || yl>y0) return false;
	float a = (y0-yl)/(x0-xl);
	//if (a > 1.0) return false;
	float J = yl-fract(xl)*a;
	int j;
	for (int i = int(xl) ; i <= int(x0) ; i++) {
		j = int(J);
		if (wall(i,j)) return false;
		if (j < int(J+a) && (j+1)<=int(y0) && wall(i,j+1)) return false;
		//if (J+a == float(int(J+a)) && wall(i+1,j+1)) return false;
		J += a;
	}
	return true;
}

void main(void) {
	vec3 A;
	int index = int(v_texIndex);
	vec3 power = vec3(0.5);
	float d;
	float a;
	float x = 16.0*(0.5+v_position.x/500.0);
	float y = 16.0*(0.5+v_position.y/500.0);
	float xl;
	float yl;
	for (int i = 0 ; i < u_nbLights ; i++) {
		xl = 16.0*(0.5+u_lights[i].x/500.0);
		yl = 16.0*(0.5+u_lights[i].y/500.0);
		if (line(x, y, xl, yl)) {
			d = length(u_lights[i].xy - v_position)/250.0;
			a = u_lights[i].z;
			A = vec3(0.5,2.0*a,3.0*a*a);
			a = 1.0/(A.x+A.y*d+A.z*d*d);
			power += a*u_colors[i];
		}
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

let lights = [[70,70,2],[-30,-20,4],[100,140,2]];
let colors = [[0.8,0.8,0.8],[0.8,0.4,0],[0,1,1]];
let world = Array.from({length:256}, (e,i)=>Math.sin(i*984651)*Math.cos(i*43)>0.5)
world.fill(0);
world[137] = 1;
world[122] = 1;
gl.uniform1i(uNbLights, 3);
gl.uniform3fv(uLights, lights.flat());
gl.uniform3fv(uColors, colors.flat());
gl.uniform1iv(uWorld, world);
