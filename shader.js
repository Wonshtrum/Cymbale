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
	//float px = a_position.x * u_transform.z + u_transform.x;
	//float py = a_position.y * u_transform.w + u_transform.y;
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

void main(void) {
	int index = int(v_texIndex);
	float min = 100.0;
	float d;
	for (int i = 0 ; i < u_nbLights ; i++) {
		d = distance(vec3(u_lights[i].xy,0), vec3(v_position,0));
		if (d < min) min = d;
	}
	//min *= float(nbLights);
	fragColor = texture(u_textures[index], v_texCoord)*vec4(v_color.xyz*(1.5-min/100.0),v_color.w);
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

gl.uniform2f(uScreen, width/2, height/2);
gl.uniform1iv(uTextures, [...Array(10).keys()]);

let lights = [[50,50,100],[-30,20,50]];
let colors = [[0.5,0.5,1],[0.8,02,0.5]];
gl.uniform1i(uNbLights, 2);
gl.uniform3fv(uLights, lights.flat());
gl.uniform3fv(uColors, colors.flat());
