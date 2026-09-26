import * as dat from "dat.gui";
import { mat4 } from "gl-matrix";

const vertexShaderSource = `#version 300 es
precision mediump float;
in vec2 aCoordinates;
uniform mat4 uModelMatrix;
void main(void) {
  gl_Position = uModelMatrix * vec4(aCoordinates, 0.0, 1.0);
}`;

const fragmentShaderSource = `#version 300 es
precision mediump float;
out vec4 fragColor;
uniform vec4 uColor;
void main(void) {
  fragColor = uColor;
}`;

var canvas, gl;
var colorLocation, modelMatrixLoc;
var vertex_buffer;
var modelMatrix;
var matrixStack = [];

var settings = {
  translateX: 0.0,
  translateY: 0.0,
  rotateZ: 0.0,
  zoom: 1.0
};

var sun = {
  'x':0, 'y':0,
  'width':0.2, 'height':0.2,
  'color':[1,1,0,1],
  }

var earth = {
  x: 0.6,
  y: 0,
  width: 0.1,
  height: 0.1,
  color: [0.2, 0.2, 1, 1],
  angle: 0.0
  };
  
var moon = {
  'x':0.2, 'y':0,
  'width':0.05, 'height':0.05,
  'color':[1,1,1,1],
  'angle':0
  }
 
function glPushMatrix() {
  const matrix = mat4.create();
  mat4.copy(matrix, modelMatrix);
  matrixStack.push(matrix);
}

function glPopMatrix() {
  modelMatrix = matrixStack.pop();
}

function drawSquare() {
  const v = new Float32Array([
    -0.5, 0.5,   0.5, 0.5,  -0.5, -0.5,
    -0.5, -0.5,  0.5, 0.5,   0.5, -0.5
  ]);
  gl.bufferData(gl.ARRAY_BUFFER, v, gl.STATIC_DRAW);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function init() {
  canvas = document.getElementById("my_Canvas");
  gl = canvas.getContext("webgl2");

  const vertShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertShader, vertexShaderSource);
  gl.compileShader(vertShader);

  const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragShader, fragmentShaderSource);
  gl.compileShader(fragShader);

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertShader);
  gl.attachShader(shaderProgram, fragShader);
  gl.linkProgram(shaderProgram);
  gl.useProgram(shaderProgram);

  vertex_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

  const coordLocation = gl.getAttribLocation(shaderProgram, "aCoordinates");
  gl.vertexAttribPointer(coordLocation, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(coordLocation);

  colorLocation = gl.getUniformLocation(shaderProgram, "uColor");
  modelMatrixLoc = gl.getUniformLocation(shaderProgram, "uModelMatrix");

  const gui = new dat.GUI();
  gui.add(settings, 'translateX', -1.1, 1.1, 0.01);
  gui.add(settings, 'translateY', -1.1, 1.1, 0.01);
  gui.add(settings, 'rotateZ', -180, 180);
  gui.add(settings, 'zoom', 0.1, 3.0, 0.01);

  const canvasRect = canvas.getBoundingClientRect();
  gui.domElement.style.position = "absolute";
  gui.domElement.style.top = canvasRect.bottom + window.scrollY + 20 + "px";
  gui.domElement.style.left = canvasRect.left + window.scrollX + (canvasRect.width - gui.domElement.offsetWidth) / 2 + "px";

  requestAnimationFrame(render);
}

function render() {
  gl.clearColor(0.1, 0.1, 0.15, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

  modelMatrix = mat4.create();
  mat4.identity(modelMatrix);
  
  mat4.translate(modelMatrix, modelMatrix, [settings.translateX, settings.translateY, 0]);
  mat4.scale(modelMatrix, modelMatrix, [settings.zoom, settings.zoom, 1]);
  mat4.rotateZ(modelMatrix, modelMatrix, (settings.rotateZ / 180) * Math.PI);

  glPushMatrix();
  mat4.scale(modelMatrix, modelMatrix, [sun.width, sun.height, 1]);
  gl.uniformMatrix4fv(modelMatrixLoc, false, modelMatrix);
  gl.uniform4fv(colorLocation, sun.color);
  drawSquare();
  glPopMatrix();

  glPushMatrix();
  earth.angle += 0.01;
  mat4.rotateZ(modelMatrix, modelMatrix, earth.angle);
  mat4.translate(modelMatrix, modelMatrix, [earth.x, earth.y, 0]);

  glPushMatrix();
  mat4.scale(modelMatrix, modelMatrix, [earth.width, earth.height, 1]);
  gl.uniformMatrix4fv(modelMatrixLoc, false, modelMatrix);
  gl.uniform4fv(colorLocation, earth.color);
  drawSquare();
  glPopMatrix();

  glPushMatrix();
  moon.angle += 0.01;
  mat4.rotateZ(modelMatrix, modelMatrix, moon.angle);
  mat4.translate(modelMatrix, modelMatrix, [moon.x, moon.y, 0]);
  mat4.scale(modelMatrix, modelMatrix, [moon.width, moon.height, 1]);
  gl.uniformMatrix4fv(modelMatrixLoc, false, modelMatrix);
  gl.uniform4fv(colorLocation, moon.color);
  drawSquare();
  glPopMatrix();

  glPopMatrix();

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  window.requestAnimationFrame(render);
}

init();