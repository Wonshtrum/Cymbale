//VERTEX SHADER
let vertCode = `#version 300 es

in vec3 a_position;
in vec4 a_color;
in vec2 a_texCoord;
in float a_texIndex;
out vec4 v_color;
out vec2 v_texCoord;
out float v_texIndex;

uniform vec2 u_screen;
uniform vec4 u_transform;

void main(void) {
	//float px = a_position.x * u_transform.z + u_transform.x;
	//float py = a_position.y * u_transform.w + u_transform.y;
	gl_Position = vec4(a_position.x/u_screen.x, a_position.y/u_screen.y, 1, 1);
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

in vec4 v_color;
in vec2 v_texCoord;
in float v_texIndex;
out vec4 fragColor;

uniform sampler2D u_textures[32];

void main(void) {
	int index = int(v_texIndex);
	//fragColor = vec4(v_texCoord, 0, 1);
	fragColor = texture(u_textures[index], v_texCoord)*v_color;
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

gl.uniform2f(uScreen, width/2, height/2);
gl.uniform1iv(uTextures, new Uint8Array(32).map((e, i) => i));
