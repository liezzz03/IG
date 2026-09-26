import * as dat from "dat.gui";
import { mat4 } from "gl-matrix";

const vertexShaderSource = `#version 300 es
precision mediump float;
in vec2 aCoordinates;
uniform mat4 uModelMatrix;
uniform float uPointSize;
void main(void) {
  gl_Position = uModelMatrix * vec4(aCoordinates, 0.0, 1.0);
  gl_PointSize = uPointSize;
}`;

const fragmentShaderSource = `#version 300 es
precision mediump float;
out vec4 fragColor;
uniform vec4 uColor;
void main(void) {
  vec2 coord = gl_PointCoord - vec2(0.5);
  if (length(coord) > 0.5) {
    discard;
  }
  fragColor = uColor;
}`;

var canvas, gl;
var colorLocation, modelMatrixLoc, pointSizeLoc;
var vertex_buffer;
var modelMatrix;
var matrixStack = [];

var settings = {
  translateX: 0.0,
  translateY: 0.0,
  rotateZ: 0.0,
  zoom: 1.0
};

// sol
var sun = {
  size: 26,
  color: [1, 0.85, 0, 1]
};

// radio de orbita del planeta, su tamaño, color, angulo inicial, velocidad orbital y lunas (no todas)
var planets = [
  {
    name: "Mercurio",
    orbitRadius: 0.18,
    size: 4,
    color: [0.6, 0.6, 0.6, 1],
    angle: 0,
    speed: 0.040,
    moons: []
  },
  {
    name: "Venus",
    orbitRadius: 0.28,
    size: 6,
    color: [0.9, 0.7, 0.4, 1],
    angle: 1.0,
    speed: 0.030,
    moons: []
  },
  {
    name: "Tierra",
    orbitRadius: 0.40,
    size: 6.5,
    color: [0.2, 0.4, 1.0, 1],
    angle: 2.0,
    speed: 0.022,
    moons: [
      { orbitRadius: 0.06, size: 2.5, color: [1, 1, 1, 1], angle: 0, speed: 0.09 }
    ]
  },
  {
    name: "Marte",
    orbitRadius: 0.52,
    size: 5,
    color: [1.0, 0.35, 0.2, 1],
    angle: 3.5,
    speed: 0.018,
    moons: [
      { orbitRadius: 0.035, size: 1.5, color: [0.8, 0.8, 0.8, 1], angle: 0, speed: 0.12 },
      { orbitRadius: 0.05, size: 1.5, color: [0.8, 0.8, 0.8, 1], angle: 2, speed: 0.10 }
    ]
  },
  {
    name: "Jupiter",
    orbitRadius: 0.68,
    size: 14,
    color: [0.9, 0.7, 0.5, 1],
    angle: 0.7,
    speed: 0.010,
    moons: [
      { orbitRadius: 0.09, size: 2, color: [0.9, 0.9, 0.9, 1], angle: 0, speed: 0.11 },
      { orbitRadius: 0.11, size: 2, color: [0.9, 0.9, 0.9, 1], angle: 1.5, speed: 0.09 }
    ]
  },
  {
    name: "Saturno",
    orbitRadius: 0.82,
    size: 12,
    color: [0.9, 0.8, 0.6, 1],
    angle: 4.2,
    speed: 0.008,
    moons: [
      { orbitRadius: 0.08, size: 2, color: [0.8, 0.8, 0.7, 1], angle: 0, speed: 0.10 }
    ]
  },
  {
    name: "Urano",
    orbitRadius: 0.94,
    size: 9,
    color: [0.6, 0.9, 0.9, 1],
    angle: 2.8,
    speed: 0.006,
    moons: []
  },
  {
    name: "Neptuno",
    orbitRadius: 1.05,
    size: 9,
    color: [0.3, 0.4, 0.9, 1],
    angle: 5.5,
    speed: 0.005,
    moons: []
  }
];

function glPushMatrix() {
  const matrix = mat4.create();
  mat4.copy(matrix, modelMatrix);
  matrixStack.push(matrix);
}

function glPopMatrix() {
  modelMatrix = matrixStack.pop();
}

function drawPoint() {
  const v = new Float32Array([0.0, 0.0]);
  gl.bufferData(gl.ARRAY_BUFFER, v, gl.STATIC_DRAW);
  gl.drawArrays(gl.POINTS, 0, 1);
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
  pointSizeLoc = gl.getUniformLocation(shaderProgram, "uPointSize");

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

function drawBody(size, color) {
  gl.uniformMatrix4fv(modelMatrixLoc, false, modelMatrix);
  gl.uniform4fv(colorLocation, color);
  gl.uniform1f(pointSizeLoc, size * settings.zoom);
  drawPoint();
}

function render() {
  gl.clearColor(0.05, 0.05, 0.08, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

  modelMatrix = mat4.create();
  mat4.identity(modelMatrix);

  mat4.translate(modelMatrix, modelMatrix, [settings.translateX, settings.translateY, 0]);
  mat4.scale(modelMatrix, modelMatrix, [settings.zoom, settings.zoom, 1]);
  mat4.rotateZ(modelMatrix, modelMatrix, (settings.rotateZ / 180) * Math.PI);

  // sol esta fijo en el centro
  glPushMatrix();
  drawBody(sun.size, sun.color);
  glPopMatrix();

  // planetas y sus lunas
  planets.forEach((planet) => {
    glPushMatrix();
    planet.angle += planet.speed * 0.05;
    mat4.rotateZ(modelMatrix, modelMatrix, planet.angle);
    mat4.translate(modelMatrix, modelMatrix, [planet.orbitRadius, 0, 0]);

    glPushMatrix();
    drawBody(planet.size, planet.color);
    glPopMatrix();

    planet.moons.forEach((moon) => {
      glPushMatrix();
      moon.angle += moon.speed;
      mat4.rotateZ(modelMatrix, modelMatrix, moon.angle);
      mat4.translate(modelMatrix, modelMatrix, [moon.orbitRadius, 0, 0]);
      drawBody(moon.size, moon.color);
      glPopMatrix();
    });

    glPopMatrix();
  });

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  window.requestAnimationFrame(render);
}

init();