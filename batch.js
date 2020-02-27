//BATCH SETTINGS
const maxQuadCount = 5000;
const maxVertexCount = maxQuadCount*4;
const maxIndexCount = maxQuadCount *6;
const maxTextureCount = 16;

let dataIndex;
let quadIndex;
let texIndex;

//CPU SIDE DATA
const floatSize = 4;
const vertData = 3+4+2+1;
const quadBuffer = new Float32Array(maxVertexCount*vertData);
const textureArray = Array(maxTextureCount).fill(0)
const indexBuffer = new Uint16Array(maxIndexCount);
let offset = 0;
for (let i = 0 ; i < maxIndexCount ;  i+=6) {
	indexBuffer[i + 0] = offset + 0;
	indexBuffer[i + 1] = offset + 1;
	indexBuffer[i + 2] = offset + 2;

	indexBuffer[i + 3] = offset + 0;
	indexBuffer[i + 4] = offset + 2;
	indexBuffer[i + 5] = offset + 3;

	offset += 4;
}


//VERTEX ARRAY
let quadVA = gl.createVertexArray();
gl.bindVertexArray(quadVA);

//VERTEX BUFFER
let quadVB = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, quadVB);
gl.bufferData(gl.ARRAY_BUFFER, quadBuffer, gl.DYNAMIC_DRAW);

const totalSize = vertData*floatSize;
gl.bindAttribLocation(shaderProgram, 0, 'a_position');
gl.enableVertexAttribArray(0);
gl.vertexAttribPointer(0, 3, gl.FLOAT, false, totalSize, 0);
gl.bindAttribLocation(shaderProgram, 1, 'a_color');
gl.enableVertexAttribArray(1);
gl.vertexAttribPointer(1, 4, gl.FLOAT, false, totalSize, 3*floatSize);
gl.bindAttribLocation(shaderProgram, 2, 'a_texCoord');
gl.enableVertexAttribArray(2);
gl.vertexAttribPointer(2, 2, gl.FLOAT, false, totalSize, (3+4)*floatSize);
gl.bindAttribLocation(shaderProgram, 3, 'a_texIndex');
gl.enableVertexAttribArray(3);
gl.vertexAttribPointer(3, 1, gl.FLOAT, false, totalSize, (3+4+2)*floatSize);

//INDEX BUFFER
let quadIB = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quadIB);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexBuffer, gl.STATIC_DRAW);

//DUMMY TEXTURE
let whiteTexture = defaultTex();
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, whiteTexture);

//TEXTURE ARRAY
textureArray[0] = whiteTexture;

let beginBatch = function() {
	dataIndex = 0;
	quadIndex = 0;
	texIndex = 1;
};

let flushBatch = function() {
	gl.bindBuffer(gl.ARRAY_BUFFER, quadVB);
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, quadBuffer, 0, dataIndex);
	for (let i = 0 ; i < texIndex ; i++) {
		gl.activeTexture(gl.TEXTURE0 + i);
		gl.bindTexture(gl.TEXTURE_2D, textureArray[i]);
	}
	gl.drawElements(gl.TRIANGLES, quadIndex*6, gl.UNSIGNED_SHORT, 0);
};

let drawQuad = function(x, y, w, h, r, g, b, a, tex) {
	if (quadIndex >= maxQuadCount || texIndex >= maxTextureCount) {
		flushBatch();
		beginBatch();
	}

	let slot = 0;
	if (tex) {
		tex = textures[tex];
		for (let i = 1 ; i < texIndex ; i++) {
			if (textureArray[i] === tex) {
				slot = i;
				break;
			}
		}
		if (slot === 0) {
			slot = texIndex++;
			textureArray[slot] = tex;
		}
	}

	quadBuffer[dataIndex + 0] = x;
	quadBuffer[dataIndex + 1] = y;
	quadBuffer[dataIndex + 2] = 0;
	quadBuffer[dataIndex + 3] = r;
	quadBuffer[dataIndex + 4] = g;
	quadBuffer[dataIndex + 5] = b;
	quadBuffer[dataIndex + 6] = a;
	quadBuffer[dataIndex + 7] = 0;
	quadBuffer[dataIndex + 8] = 1;
	quadBuffer[dataIndex + 9] = slot;
	dataIndex += vertData;

	quadBuffer[dataIndex + 0] = x+w;
	quadBuffer[dataIndex + 1] = y;
	quadBuffer[dataIndex + 2] = 0;
	quadBuffer[dataIndex + 3] = r;
	quadBuffer[dataIndex + 4] = g;
	quadBuffer[dataIndex + 5] = b;
	quadBuffer[dataIndex + 6] = a;
	quadBuffer[dataIndex + 7] = 1;
	quadBuffer[dataIndex + 8] = 1;
	quadBuffer[dataIndex + 9] = slot;
	dataIndex += vertData;

	quadBuffer[dataIndex + 0] = x+w;
	quadBuffer[dataIndex + 1] = y+h;
	quadBuffer[dataIndex + 2] = 0.0;
	quadBuffer[dataIndex + 3] = r;
	quadBuffer[dataIndex + 4] = g;
	quadBuffer[dataIndex + 5] = b;
	quadBuffer[dataIndex + 6] = a;
	quadBuffer[dataIndex + 7] = 1;
	quadBuffer[dataIndex + 8] = 0;
	quadBuffer[dataIndex + 9] = slot;
	dataIndex += vertData;

	quadBuffer[dataIndex + 0] = x;
	quadBuffer[dataIndex + 1] = y+h;
	quadBuffer[dataIndex + 2] = 0;
	quadBuffer[dataIndex + 3] = r;
	quadBuffer[dataIndex + 4] = g;
	quadBuffer[dataIndex + 5] = b;
	quadBuffer[dataIndex + 6] = a;
	quadBuffer[dataIndex + 7] = 0;
	quadBuffer[dataIndex + 8] = 0;
	quadBuffer[dataIndex + 9] = slot;
	dataIndex += vertData;
	quadIndex ++;
};



const render = function() {
	beginBatch();
	for (let x = -200 ; x  < 200 ; x+=5) {
		for (let y = -200 ; y < 200 ; y+=5) {
			drawQuad(x, y, 1, 1, (x+400)/800, (y+400)/800, 0.5, 1);
		}
	}
	drawQuad(0,0,80,80,1,1,1,1,"img");
	drawQuad(80,10,80,80,0,1,1,1,"img");
	flushBatch();
}

setInterval(render, 30);
