import * as dat from "dat.gui";
import { mat4, vec3 } from "gl-matrix";

// Vertex shader source
const vertexShaderSource = `#version 300 es
precision mediump float;

      in vec3 aCoordinates;
      uniform mat4 uModelMatrix;
      uniform mat4 uViewMatrix;
      in vec3 aVertexNormals;
      // posición de la luz, ya en espacio de cámara
      uniform vec3 uLightPos;

      out vec3 vNormal; 
      out vec3 vEyeVector; 
      out vec3 vLightDirection; 

      void main(void) { 
        // saving vertex after transformations BEFORE PERSPECTIVE 
        vec4 vertex = uModelMatrix * vec4(aCoordinates, 1.0); 
        gl_Position = uViewMatrix * vertex; 
        // compute normal vector 
        vNormal = vec3(uModelMatrix * vec4(aVertexNormals, 0.0)); 
        // compute vector from vertex to viewer 
        vEyeVector = -vertex.xyz; 
        // compute vector from vertex to light 
        // la luz ahora llega como uniform
        vLightDirection = uLightPos - vertex.xyz; 
      }  
`;

// Fragment shader source
const fragmentShaderSource = `#version 300 es
precision mediump float;

out vec4 fragColor;
uniform vec4 uColor;

// colores y brillo controlados desde la GUI
uniform vec3 uLightColor;
uniform vec3 uDifColor;
uniform vec3 uSpecColor;
uniform vec3 uAmbColor;
uniform float uShininess;

in vec3 vNormal; 
in vec3 vEyeVector; 
in vec3 vLightDirection;

void main(void) { 
  // computing diffuse component 
  vec3 N = normalize(vNormal); 
  vec3 L = normalize(vLightDirection); 
  // material difuso y color de luz vienen de uniforms
  float diffuse = max(dot(N, L), 0.0); 
  vec4 Idif = vec4(diffuse*uDifColor*uLightColor,1); 
  // compute specular component 
  float NL = dot(N,L); 
  vec4 Ispec = vec4(0,0,0,1); 
  if (NL>0.0) { 
  vec3 R = 2.0*N*NL-L;   
  // shininess y material especular vienen de uniforms
  vec3 V = normalize(vEyeVector); 
  float specular = pow(max(dot(R, V), 0.0), uShininess); 
  Ispec = vec4(specular * uSpecColor * uLightColor, 1); 
  } 
  // computing ambient component 
  // color ambiente desde uniform
  vec4 Iamb = vec4(uAmbColor,1); 
  // calculamos color final 
  fragColor = Iamb + Idif + Ispec;  
  fragColor = min(fragColor, vec4(1,1,1,1)); 
  } 
`;

var canvas, gl;
var colorLocation;
var vertex_buffer;
var modelMatrixLoc;
var modelMatrix;
var index_buffer;
var rotateX = 0,
  rotateY = 0;
var mouseX, mouseY;
var zoomFactor = 1;
var viewMatrixLoc;

var normalsLoc;
var normal_buffer;

var prevTouchX, prevTouchY;

// locations de los uniforms de iluminación
var lightPosLoc,
  lightColorLoc,
  difColorLoc,
  specColorLoc,
  ambColorLoc,
  shininessLoc;

// parámetros controlados por la GUI
const controls = {
  lightX: 10,
  lightY: 10,
  lightZ: 10,
  lightAttached: true, // true: la luz sigue las rotaciones del ratón; false: fija
  lightColor: "#ffffff",
  difColor: "#00ff00",
  specColor: "#ff0000",
  ambColor: "#000033",
  shininess: 10,
};

// convierte "#rrggbb" a [r, g, b] entre 0 y 1
function hexToRgb(hex) {
  // elimina el signo "#" si está presente
  hex = hex.replace(/^#/, "");
  return [
    parseInt(hex.substring(0, 2), 16) / 255,
    parseInt(hex.substring(2, 4), 16) / 255,
    parseInt(hex.substring(4, 6), 16) / 255,
  ];
}

/*var settings = {
  translateX: 0.0,
  translateY: 0.0,
  rotateZ: 0.0,
};*/

var matrixStack = [];
function glPushMatrix() {
  const matrix = mat4.create();
  mat4.copy(matrix, modelMatrix);
  matrixStack.push(matrix);
}

function glPopMatrix() {
  modelMatrix = matrixStack.pop();
}

function init() {
  // ============ STEP 1: Creating a canvas=================
  canvas = document.getElementById("my_Canvas");
  gl = canvas.getContext("webgl2");

  gl.enable(gl.DEPTH_TEST);

  /*// create GUI
  var gui = new dat.GUI();
  gui.add(settings, "translateX", -1.0, 1.0, 0.01);
  gui.add(settings, "translateY", -1.0, 1.0, 0.01);
  gui.add(settings, "rotateZ", -180, 180);

  // Posicionar el GUI debajo del canvas
  const canvasRect = canvas.getBoundingClientRect();
  gui.domElement.style.position = "absolute";
  gui.domElement.style.top = canvasRect.bottom + window.scrollY + 20 + "px";
  gui.domElement.style.left =
    canvasRect.left +
    window.scrollX +
    (canvasRect.width - gui.domElement.offsetWidth) / 2 +
    "px";
    */

  //========== STEP 2: Create and compile shaders ==========

  // Create a vertex shader object
  const vertShader = gl.createShader(gl.VERTEX_SHADER);

  // Attach vertex shader source code
  gl.shaderSource(vertShader, vertexShaderSource);

  // Compile the vertex shader
  gl.compileShader(vertShader);
  if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
    console.log("vertShader: " + gl.getShaderInfoLog(vertShader));
  }

  // Create fragment shader object
  const fragShader = gl.createShader(gl.FRAGMENT_SHADER);

  // Attach fragment shader source code
  gl.shaderSource(fragShader, fragmentShaderSource);

  // Compile the fragmentt shader
  gl.compileShader(fragShader);
  if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
    console.log("fragShader: " + gl.getShaderInfoLog(fragShader));
  }

  // Create a shader program object to store
  // the combined shader program
  const shaderProgram = gl.createProgram();

  // Attach a vertex shader
  gl.attachShader(shaderProgram, vertShader);

  // Attach a fragment shader
  gl.attachShader(shaderProgram, fragShader);

  // Link both programs
  gl.linkProgram(shaderProgram);

  // Use the combined shader program object
  gl.useProgram(shaderProgram);

  //======== STEP 3: Create buffer objects and associate shaders ========

  // Create an empty buffer object to store the vertex buffer
  vertex_buffer = gl.createBuffer();

  // create index buffer
  index_buffer = gl.createBuffer();

  normal_buffer = gl.createBuffer();

  // Bind vertex buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

  // Get the attribute location
  const coordLocation = gl.getAttribLocation(shaderProgram, "aCoordinates");

  // Point an attribute to the currently bound VBO
  gl.vertexAttribPointer(coordLocation, 3, gl.FLOAT, false, 0, 0);

  // Enable the attribute
  gl.enableVertexAttribArray(coordLocation);

  // Unbind the buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // look up uniform locations
  colorLocation = gl.getUniformLocation(shaderProgram, "uColor");

  modelMatrixLoc = gl.getUniformLocation(shaderProgram, "uModelMatrix");
  viewMatrixLoc = gl.getUniformLocation(shaderProgram, "uViewMatrix");
  normalsLoc = gl.getAttribLocation(shaderProgram, "aVertexNormals");

  gl.bindBuffer(gl.ARRAY_BUFFER, normal_buffer);
  gl.vertexAttribPointer(normalsLoc, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(normalsLoc);

  // locations de los uniforms de iluminación
  lightPosLoc = gl.getUniformLocation(shaderProgram, "uLightPos");
  lightColorLoc = gl.getUniformLocation(shaderProgram, "uLightColor");
  difColorLoc = gl.getUniformLocation(shaderProgram, "uDifColor");
  specColorLoc = gl.getUniformLocation(shaderProgram, "uSpecColor");
  ambColorLoc = gl.getUniformLocation(shaderProgram, "uAmbColor");
  shininessLoc = gl.getUniformLocation(shaderProgram, "uShininess");

  // GUI de dat.gui
  const gui = new dat.GUI();
  const fLight = gui.addFolder("Luz");
  fLight.add(controls, "lightX", -20, 20, 0.1);
  fLight.add(controls, "lightY", -20, 20, 0.1);
  fLight.add(controls, "lightZ", -20, 20, 0.1);
  fLight.add(controls, "lightAttached").name("anclada al objeto");
  fLight.addColor(controls, "lightColor");
  const fMat = gui.addFolder("Material");
  fMat.addColor(controls, "difColor");
  fMat.addColor(controls, "specColor");
  fMat.addColor(controls, "ambColor");
  fMat.add(controls, "shininess", 1, 200, 1);
}

function render() {
  //========= STEP 4: Create the geometry and draw ===============

  // Clear the canvas
  gl.clearColor(1.0, 0.5, 0.5, 1.0);

  // Clear the color buffer bit
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Set the view port
  gl.viewport(0, 0, canvas.width, canvas.height);

  // Bind appropriate array buffer to it
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

  // perspective
  const viewMatrix = mat4.create();
  mat4.perspective(
    viewMatrix,
    Math.PI / 4, // vertical opening angle
    1, // ratio width-height
    0.5, // z-near
    30 // z-far
  );
  gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);

  // Set the model Matrix.
  modelMatrix = mat4.create();
  mat4.identity(modelMatrix);

  const eye = [0, 0, 3];
  const center = [0, 0, 0];
  mat4.lookAt(modelMatrix, eye, center, [0, 1, 0]);
  // guardamos solo la cámara (sin rotación ni zoom) para la luz fija
  const cameraMatrix = mat4.clone(modelMatrix);

  // mouse transformations
  mat4.scale(modelMatrix, modelMatrix, [zoomFactor, zoomFactor, zoomFactor]);
  mat4.rotateX(modelMatrix, modelMatrix, rotateX);
  mat4.rotateY(modelMatrix, modelMatrix, rotateY);

  // luz anclada (sigue las rotaciones del ratón) o fija (solo cámara)
  const lightEye = vec3.create();
  vec3.transformMat4(
    lightEye,
    [controls.lightX, controls.lightY, controls.lightZ],
    controls.lightAttached ? modelMatrix : cameraMatrix
  );
  gl.uniform3fv(lightPosLoc, lightEye);
  gl.uniform3fv(lightColorLoc, hexToRgb(controls.lightColor));
  gl.uniform3fv(difColorLoc, hexToRgb(controls.difColor));
  gl.uniform3fv(specColorLoc, hexToRgb(controls.specColor));
  gl.uniform3fv(ambColorLoc, hexToRgb(controls.ambColor));
  gl.uniform1f(shininessLoc, controls.shininess);

  // drawGround
  //renderGround(9, 10);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
  renderSphere(20);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  // Unbind the buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  //document.getElementById("debug").textContent = "y = " + player1.y.toFixed(2);

  // start animation loop
  window.requestAnimationFrame(render);
}

function renderCube() {
  glPushMatrix();
  mat4.translate(modelMatrix, modelMatrix, [-0.5, -0.5, -0.5]);
  gl.uniformMatrix4fv(modelMatrixLoc, false, modelMatrix);
  // create vertices
  const arrayV = new Float32Array([
    0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1,
  ]);
  gl.bufferData(gl.ARRAY_BUFFER, arrayV, gl.STATIC_DRAW);

  // create edges
  /*const arrayI = new Uint16Array([
    0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7,
  ]);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, arrayI, gl.STATIC_DRAW);
  
  // draw cube
  gl.uniform4fv(colorLocation, [0, 0, 0, 1]);
  gl.drawElements(gl.LINES, 24, gl.UNSIGNED_SHORT, 0);
*/
  // create faces
  const arrayF = new Uint16Array([
    1,
    0,
    3,
    1,
    3,
    2, // cara trasera
    4,
    5,
    6,
    4,
    6,
    7, // cara delantera
    7,
    6,
    2,
    7,
    2,
    3, // cara superior
    0,
    1,
    5,
    0,
    5,
    4, // cara inferior
    5,
    1,
    2,
    5,
    2,
    6, // cara derecha
    0,
    4,
    7,
    0,
    7,
    3, // cara izquierda
  ]);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, arrayF, gl.STATIC_DRAW);
  // draw cube
  gl.uniform4fv(colorLocation, [0.3, 0.5, 1, 1]);
  gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
  glPopMatrix();
}

function renderSphere(n) {
  glPushMatrix();
  mat4.scale(modelMatrix, modelMatrix, [0.7, 0.7, 0.7]);
  gl.uniformMatrix4fv(modelMatrixLoc, false, modelMatrix);
  // compute vertices
  const coords = new Float32Array(6 * n * n);
  const step = Math.PI / n;
  const R = 1;
  var k = 0;
  for (let i = 1; i < n; i++) {
    const tita = -Math.PI / 2 + i * step;
    for (let j = 0; j < 2 * n; j++) {
      const alpha = j * step;
      coords[k++] = R * Math.cos(tita) * Math.cos(alpha);
      coords[k++] = R * Math.cos(tita) * Math.sin(alpha);
      coords[k++] = R * Math.sin(tita);
    }
  }
  // compute faces
  const arrayIFaces = new Uint16Array((4 * n + 2) * n);
  var k = 0;
  for (let i = 0; i < n - 2; i++) {
    for (let j = 0; j < 2 * n; j++) {
      arrayIFaces[k++] = 2 * n * (i + 1) + j;
      arrayIFaces[k++] = 2 * n * i + j;
    }
    arrayIFaces[k++] = 2 * n * (i + 1);
    arrayIFaces[k++] = 2 * n * i;
  }
  // compute normals
  const normals = coords;
  // pass data to GPU
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, coords, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, normal_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, arrayIFaces, gl.STATIC_DRAW);
  // draw meshes
  for (let i = 0; i < n - 2; i++)
    gl.drawElements(
      gl.TRIANGLE_STRIP,
      4 * n + 2,
      gl.UNSIGNED_SHORT,
      2 * i * (4 * n + 2)
    );
  glPopMatrix();
}

// CÓDIGO PRINCIPAL
init();
render();

// add mouse handlers
document.onmousedown = onMouseDown;
document.onmousemove = onMouseMove;
document.onwheel = zoom;

// listeners for mobile events
canvas.addEventListener("touchstart", onTouchStart, { passive: false });
canvas.addEventListener("touchmove", onTouchMove, { passive: false });

function onMouseDown(e) {
  if (e.buttons == 1 && e.srcElement == canvas) {
    mouseX = e.pageX;
    mouseY = e.pageY;
  }
}

function onMouseMove(e) {
  if (e.buttons == 1 && e.srcElement == canvas) {
    rotateY = rotateY + (e.pageX - mouseX) * 0.01;
    rotateX = rotateX + (e.pageY - mouseY) * 0.01;
    mouseX = e.pageX;
    mouseY = e.pageY;
    //console.log("move = ("+mouseX+","+mouseY+")");
  }
}

function zoom(e) {
  if (e.deltaY < 0) zoomFactor *= 1.1;
  else zoomFactor *= 0.9;
}

// eventos en el móvil
function onTouchStart(e) {
  e.preventDefault();
  const touchobj = e.changedTouches[0]; // first finger
  prevTouchX = parseInt(touchobj.clientX);
  prevTouchY = parseInt(touchobj.clientY);
}

function onTouchMove(e) {
  e.preventDefault();
  const touchobj = e.changedTouches[0]; // first touch
  const touchX = parseInt(touchobj.clientX);
  const touchY = parseInt(touchobj.clientY);
  const difX = touchX - prevTouchX;
  const difY = touchY - prevTouchY;
  rotateX = rotateX + difY * 0.01;
  rotateY = rotateY + difX * 0.01;
  prevTouchX = touchX;
  prevTouchY = touchY;
}