//INITIALISATION
const canvas = document.getElementById('myCan');
let width = 500;
let height = 500;

canvas.width = width;
canvas.height = height;
const gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true, premultipliedAlpha: false });
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
