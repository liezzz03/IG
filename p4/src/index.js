import * as dat from "dat.gui";
import { mat4 } from "gl-matrix";

// Vertex shader source
const vertexShaderSource = `#version 300 es
precision highp float;

      in vec3 aCoordinates;
      uniform mat4 uModelMatrix;
      uniform mat4 uViewMatrix; 

      void main(void) {
        gl_Position = uViewMatrix * uModelMatrix * vec4(aCoordinates, 1.0);
        gl_PointSize = 10.0;
        //gl_Position.z *= -1.0;
      }
`;

// Fragment shader source
const fragmentShaderSource = `#version 300 es
precision mediump float;

out vec4 fragColor;
uniform vec4 uColor;

void main(void) {
  fragColor = uColor;
}
`;

// mapa '#' = pared, '.' = vacío. cada celda mide 1x1 y el mapa está centrado en el origen
const MAP_STR = [
  "###############",
  "#.............#",
  "#.###.....###.#",
  "#.#.........#.#",
  "#.#..##.##..#.#",
  "#....#...#....#",
  "#.##.#...#.##.#",
  "#.............#",
  "#.##.#...#.##.#",
  "#....#...#....#",
  "#.#..##.##..#.#",
  "#.#.........#.#",
  "#.###.....###.#",
  "#.............#",
  "###############",
];
const MAP = MAP_STR.map((row) => [...row].map((c) => (c === "#" ? 1 : 0)));
const ROWS = MAP.length;
const COLS = MAP[0].length;
const WALL_H = 1;

// centro (x,z) de la celda (fila i, columna j)
function cellCenter(i, j) {
  return { x: j - COLS / 2 + 0.5, z: i - ROWS / 2 + 0.5 };
}

// ¿hay pared en el punto (x,z)? Fuera del mapa cuenta como pared.
function isWall(x, z) {
  const j = Math.floor(x + COLS / 2);
  const i = Math.floor(z + ROWS / 2);
  if (i < 0 || i >= ROWS || j < 0 || j >= COLS) return true;
  return MAP[i][j] === 1;
}

// colisión de un cuadrado de radio r centrado en (x,z) con las paredes
function hitsWall(x, z, r) {
  return (
    isWall(x - r, z - r) ||
    isWall(x + r, z - r) ||
    isWall(x - r, z + r) ||
    isWall(x + r, z + r)
  );
}

// parametros de juego
const START = cellCenter(13, 7);
const PLAYER_R = 0.2;
const ACCEL = 10; // aceleración al pulsar adelante/atrás
const MAX_SPEED = 6;
const FRICTION = 1.5; // más bajo = más derrape
const TURN_SPEED = 2.0; // rad/s
const FALL_SPEED = 4;
const ENEMY_SPEED = 1.2;
const ENEMY_R = 0.25;
const BULLET_SPEED = 14;
const FIRE_DELAY = 0.2;

const SPAWNS = [
  [1, 1],
  [1, 13],
  [7, 1],
  [7, 13],
  [13, 1],
  [13, 13],
].map(([i, j]) => cellCenter(i, j));

// estado
var canvas, gl;
var colorLocation;
var vertex_buffer;
var modelMatrixLoc;
var modelMatrix;
var index_buffer;
var mouseX, mouseY;
var viewMatrixLoc;
var hud;
var player = {
  x: START.x, y: 0.5, z: START.z,
  vx: 0, vy: 0, vz: 0,
  yaw: 0, pitch: 0,
  flying: false,
  cooldown: 0,
};
var lives = 3;
var score = 0;
var time = 0;
var bullets = [];
var enemies = [];

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
  hud = document.getElementById("hud");

  resize();
  window.addEventListener("resize", resize);

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
  viewMatrixLoc = gl.getUniformLocation(shaderProgram,  "uViewMatrix"); 
  
  gl.enable(gl.DEPTH_TEST); 

  enemies = Array.from({ length: 4 }, () => spawnEnemy());
}

function render() {
  //========= STEP 4: Create the geometry and draw ===============

  // Clear the canvas
  gl.clearColor(0.8, 1.0, 0.5, 1.0);

  // Clear the color buffer bit
  gl.clear(gl.COLOR_BUFFER_BIT | 
    gl.DEPTH_BUFFER_BIT);

  // Set the view port
  gl.viewport(0, 0, canvas.width, canvas.height);
  
  // perspective 
  const viewMatrix = mat4.create();  
  mat4.perspective(viewMatrix,  
    Math.PI/4, // vertical opening angle 
    canvas.width / canvas.height, // ratio width-height 
    0.1, // z-near 
    40 // z-far 
  ); 
  gl.uniformMatrix4fv(viewMatrixLoc, false, 
  viewMatrix);

  // Set the model Matrix. 
  modelMatrix = mat4.create();
  mat4.identity(modelMatrix);

  // cámara en primera persona
  const d = getDir();
  const eye = [player.x, player.y, player.z]; 
  const target = [eye[0] + d[0], eye[1] + d[1], eye[2] + d[2]];
  mat4.lookAt(modelMatrix, eye, target, 
  [0,1,0]); 

  // Bind appropriate array buffer to it
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

  // draw geometry
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer); 

  // drawGround 
  renderGround(COLS, COLS + 1);

  // paredes
  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      if (MAP[i][j] === 1) {
        const c = cellCenter(i, j);
        renderCube(c.x, WALL_H / 2, c.z, 1, WALL_H, 1, [0.3, 0.5, 1, 1]);
      }
    }
  }

  // cubo central que gira y "flota"
  renderCube(0, 0.5 + 0.1 * Math.sin(time * 2), 0, 0.6, 0.6, 0.6, [0.2, 0.8, 0.3, 1], time);

  // objeto con movimiento prefijado (patrulla de lado a lado)
  renderCube(3.5 * Math.sin(time * 0.8), 0.25, 4, 0.4, 0.4, 0.4, [1, 0.6, 0.1, 1], -time);

  // enemigos
  for (const e of enemies) {
    renderCube(e.x, 0.35, e.z, 0.6, 0.6, 0.6, [0.9, 0.15, 0.15, 1], time);
  }

  // balas
  for (const b of bullets) {
    renderCube(b.x, b.y, b.z, 0.1, 0.1, 0.1, [1, 0.9, 0.1, 1]);
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  // Unbind the buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  const speed = Math.hypot(player.vx, player.vy, player.vz);
  hud.textContent =
    "Vidas: " + lives + "  Puntos: " + score +
    "  Modo: " + (player.flying ? "vuelo" : "suelo") +
    "  Velocidad: " + speed.toFixed(1);
}

// dibuja un cubo de tamaño (sx,sy,sz) centrado en (cx,cy,cz), girado angleY
function renderCube(cx, cy, cz, sx, sy, sz, color, angleY = 0) { 
  glPushMatrix(); 
  mat4.translate(modelMatrix, modelMatrix, [cx, cy, cz]); 
  mat4.rotateY(modelMatrix, modelMatrix, angleY); 
  mat4.scale(modelMatrix, modelMatrix, [sx, sy, sz]); 
  mat4.translate(modelMatrix, modelMatrix, [-0.5, -0.5, -0.5]); 
  gl.uniformMatrix4fv(modelMatrixLoc, false, modelMatrix); 
  // create vertices 
  const arrayV = new Float32Array([0,0,0, 1,0,0, 1,1,0, 0,1,0, 
  0,0,1, 1,0,1, 1,1,1, 0,1,1]); 
  gl.bufferData(gl.ARRAY_BUFFER, arrayV, gl.STATIC_DRAW); 
  // create faces 
  const arrayF = new Uint16Array([1,0,3,    
    1,3,2,  // cara trasera 
    4,5,6,    4,6,7,  // cara delantera 
    7,6,2,    7,2,3,  // cara superior 
    0,1,5,    0,5,4,  // cara inferior 
    5,1,2,    
    5,2,6,  // cara derecha 
    0,4,7,    
    0,7,3  // cara izquierda 
  ]); 
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,   
  arrayF, gl.STATIC_DRAW); 
  // draw solid cube (con polygonOffset para que las aristas no parpadeen encima)
  gl.enable(gl.POLYGON_OFFSET_FILL);
  gl.polygonOffset(1, 1);
  gl.uniform4fv(colorLocation, color); 
  gl.drawElements(gl.TRIANGLES, 36, 
  gl.UNSIGNED_SHORT, 0); 
  gl.disable(gl.POLYGON_OFFSET_FILL);
  // create edges 
  const arrayI = new Uint16Array([0,1,1,2,2,3,3,0, 
  4,5,5,6,6,7,7,4, 
  0,4,1,5,2,6,3,7]); 
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, arrayI, 
  gl.STATIC_DRAW); 
  // draw wireframe cube 
  gl.uniform4fv(colorLocation, [0,0,0,1]); 
  gl.drawElements(gl.LINES, 24, gl.UNSIGNED_SHORT, 0); 

  glPopMatrix(); 
} 

function getDir() {
  const cp = Math.cos(player.pitch);
  return [cp * Math.sin(player.yaw), Math.sin(player.pitch), -cp * Math.cos(player.yaw)];
}

// add mouse handlers 
document.onmousedown = onMouseDown; 
document.onmousemove = onMouseMove; 
document.onkeydown = onKeyDown;
document.onkeyup = onKeyUp;

function onMouseDown(e) { 
  if (e.buttons==1 && e.srcElement==canvas) { 
  mouseX = e.pageX; 
  mouseY = e.pageY;           
  } 
  } 
function onMouseMove(e) { 
  if (e.buttons==1 && e.srcElement==canvas) { 
    player.yaw += (e.pageX - mouseX) * 0.005;
    player.pitch = clamp(player.pitch - (e.pageY - mouseY) * 0.005, -1.4, 1.4);
  mouseX = e.pageX; 
  mouseY = e.pageY; 
  //console.log("move = ("+mouseX+","+mouseY+")");            
  } 
} 

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

// teclas pulsadas (se guardan para usarlas en update)
const keys = {};
function onKeyDown(key) { 
  keys[key.code] = true;
  if (key.code === "KeyF" && !key.repeat) player.flying = !player.flying;
  if (key.code.startsWith("Arrow") || key.code === "Space") key.preventDefault();
}  
function onKeyUp(key) {
  keys[key.code] = false;
}

// el buffer de dibujo se ajusta al tamaño real del canvas en pantalla.
// render() ya usa canvas.width/height para el viewport y el aspect ratio.
function resize() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(canvas.clientWidth * dpr);
  canvas.height = Math.floor(canvas.clientHeight * dpr);
}

// draw squared floor 
function renderGround(size, n) { 
  glPushMatrix(); 
  mat4.scale(modelMatrix, modelMatrix, [size, size, size]); 
  mat4.translate(modelMatrix, modelMatrix, [-0.5, 0, -0.5]); 
  gl.uniformMatrix4fv(modelMatrixLoc, false, modelMatrix); 
  // creamos vector vértices 
  var k = 0; 
  var i;
  const arrayV = new Float32Array(12*n); 
  for (i = 0; i < n; i++) { 
  arrayV[k++] = i/(n-1); 
  arrayV[k++] = 0; 
  arrayV[k++] = 0; 
  arrayV[k++] = i/(n-1); 
  arrayV[k++] = 0; 
  arrayV[k++] = 1; 
  } 
  for (i = 0; i < n; i++) { 
  arrayV[k++] = 0; 
  arrayV[k++] = 0; 
  arrayV[k++] = i/(n-1); 
  arrayV[k++] = 1; 
  arrayV[k++] = 0; 
  arrayV[k++] = i/(n-1); 
  } 
  gl.bufferData(gl.ARRAY_BUFFER, arrayV, gl.STATIC_DRAW); 
  gl.uniform4fv(colorLocation, [0, 0, 0, 1]); 
  gl.drawArrays(gl.LINES, 0, 4*n); 
  glPopMatrix(); 
  }

function spawnEnemy() {
  const far = SPAWNS.filter((s) => Math.hypot(s.x - player.x, s.z - player.z) > 5);
  const s = far[Math.floor(Math.random() * far.length)] || SPAWNS[0];
  return { x: s.x, z: s.z };
}

function shoot() {
  const d = getDir();
  bullets.push({
    x: player.x + d[0] * 0.3,
    y: player.y - 0.1 + d[1] * 0.3,
    z: player.z + d[2] * 0.3,
    dx: d[0] * BULLET_SPEED,
    dy: d[1] * BULLET_SPEED,
    dz: d[2] * BULLET_SPEED,
    life: 3,
  });
}

function hurtPlayer() {
  lives--;
  if (lives <= 0) {
    lives = 3;
    score = 0;
  }
  Object.assign(player, {
    x: START.x, y: 0.5, z: START.z,
    vx: 0, vy: 0, vz: 0,
    yaw: 0, pitch: 0, flying: false,
  });
  bullets = [];
  enemies = enemies.map(() => spawnEnemy());
}

function updatePlayer(dt) {
  // giro
  if (keys.ArrowLeft || keys.KeyA) player.yaw -= TURN_SPEED * dt;
  if (keys.ArrowRight || keys.KeyD) player.yaw += TURN_SPEED * dt;

  // empuje: acelerar hacia delante / frenar y marcha atrás (frena más fuerte)
  let thrust = 0;
  if (keys.ArrowUp || keys.KeyW) thrust += 1;
  if (keys.ArrowDown || keys.KeyS) thrust -= 1.5;

  // en el suelo el empuje es horizontal; volando va en la dirección de la mirada
  const d = getDir();
  const fwd = player.flying ? d : [Math.sin(player.yaw), 0, -Math.cos(player.yaw)];
  player.vx += fwd[0] * thrust * ACCEL * dt;
  player.vy += fwd[1] * thrust * ACCEL * dt;
  player.vz += fwd[2] * thrust * ACCEL * dt;

  // subir / bajar al volar
  if (player.flying) {
    if (keys.KeyE) player.vy += ACCEL * dt;
    if (keys.KeyQ) player.vy -= ACCEL * dt;
  } else {
    player.vy = 0;
  }
  // al girar con inercia se produce derrape
  const f = Math.exp(-FRICTION * dt);
  player.vx *= f;
  player.vy *= f;
  player.vz *= f;

  // velocidad máxima
  const speed = Math.hypot(player.vx, player.vy, player.vz);
  if (speed > MAX_SPEED) {
    const k = MAX_SPEED / speed;
    player.vx *= k;
    player.vy *= k;
    player.vz *= k;
  }

  // movimiento horizontal con colisión por ejes (así se desliza por las paredes)
  // las paredes solo bloquean si vas por debajo de su altura.
  const blocking = player.y < WALL_H + 0.2;
  const nx = player.x + player.vx * dt;
  if (blocking && hitsWall(nx, player.z, PLAYER_R)) player.vx = 0;
  else player.x = nx;
  const nz = player.z + player.vz * dt;
  if (blocking && hitsWall(player.x, nz, PLAYER_R)) player.vz = 0;
  else player.z = nz;
  // movimiento vertical
  let ny;
  if (player.flying) ny = clamp(player.y + player.vy * dt, 0.3, 6);
  else ny = Math.max(0.5, player.y - FALL_SPEED * dt);
  // si bajas sobre una pared te quedas encima de ella
  if (ny < WALL_H + 0.2 && hitsWall(player.x, player.z, PLAYER_R)) {
    ny = WALL_H + 0.25;
    player.vy = 0;
  }
  player.y = ny;
  // disparo (mantener espacio = ráfaga)
  player.cooldown -= dt;
  if (keys.Space && player.cooldown <= 0) {
    shoot();
    player.cooldown = FIRE_DELAY;
  }
}

function updateEnemies(dt) {
  for (const e of enemies) {
    const dx = player.x - e.x;
    const dz = player.z - e.z;
    const dist = Math.hypot(dx, dz);
    if (dist > 0.01) {
      const step = ENEMY_SPEED * dt;
      const nx = e.x + (dx / dist) * step;
      if (!hitsWall(nx, e.z, ENEMY_R)) e.x = nx;
      const nz = e.z + (dz / dist) * step;
      if (!hitsWall(e.x, nz, ENEMY_R)) e.z = nz;
    }
    // te alcanzan (si vuelas alto no pueden tocarte)
    if (dist < 0.5 && player.y < 1.5) {
      hurtPlayer();
      return;
    }
  }
}

function updateBullets(dt) {
  bullets = bullets.filter((b) => {
    b.x += b.dx * dt;
    b.y += b.dy * dt;
    b.z += b.dz * dt;
    b.life -= dt;
    if (b.life <= 0 || b.y < 0) return false;
    // choca con pared
    if (b.y < WALL_H && isWall(b.x, b.z)) return false;
    // choca con enemigo
    for (let k = 0; k < enemies.length; k++) {
      const e = enemies[k];
      if (Math.hypot(b.x - e.x, b.y - 0.35, b.z - e.z) < 0.4) {
        enemies[k] = spawnEnemy();
        score++;
        return false;
      }
    }
    return true;
  });
}

function update(dt) {
  time += dt;
  updatePlayer(dt);
  updateEnemies(dt);
  updateBullets(dt);
}

var lastTime = 0;
function frame(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  update(dt);
  render();
  window.requestAnimationFrame(frame);
}
  
// CÓDIGO PRINCIPAL
init();
window.requestAnimationFrame(frame);