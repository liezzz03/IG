// Vertex shader source
const vertexShaderSource = `#version 300 es
      precision mediump float;

      in vec2 aCoordinates;

      void main(void) {
        gl_Position = vec4(aCoordinates, 0, 1);
        gl_PointSize = 45.0;
      }
`;

// Fragment shader source
const fragmentShaderSource = `#version 300 es
        precision mediump float;

        uniform vec4 uColor;

        out vec4 fragColor;

        void main(void) {
          fragColor = uColor;
      }
`;

var gl;
var colorLocation;
var canvas;
var vertex_buffer;

// línea que gira sobre su propio centro
const lineCenter = { x: 0, y: 0 };
const lineHalfLength = 0.35;
const ROTATION_SPEED = 0.015; // radianes por frame
let lineAngle = 0;
let currentLineP1, currentLineP2; // extremos de la línea en el frame actual (para dibujar y para colisiones)

function getLineEndpoints() {
  const dx = Math.cos(lineAngle) * lineHalfLength;
  const dy = Math.sin(lineAngle) * lineHalfLength;
  return {
    p1: { x: lineCenter.x - dx, y: lineCenter.y - dy },
    p2: { x: lineCenter.x + dx, y: lineCenter.y + dy },
  };
}

// punto más cercano de un segmento [a,b] a un punto p
function closestPointOnSegment(p, a, b) {
  const abx = b.x - a.x, aby = b.y - a.y;
  const apx = p.x - a.x, apy = p.y - a.y;
  const abLenSq = abx * abx + aby * aby;
  let t = abLenSq === 0 ? 0 : (apx * abx + apy * aby) / abLenSq;
  t = Math.max(0, Math.min(1, t));
  return { x: a.x + t * abx, y: a.y + t * aby };
}

// los rectangulos
function randomColor() {
  return [Math.random(), Math.random(), Math.random(), 1];
}

function makeBox(x, y, width, height, vx, vy, color) {
  // radio de colisión aproximado (trataarlas como un círculo para simplificar el rebote contra la línea inclinada)
  const radius = Math.hypot(width, height) / 2;
  return { x, y, width, height, vx, vy, color, radius };
}

var boxes = [
  makeBox(-0.5, 0.2, 0.25, 0.2, 0.008, 0.006, [0, 0, 1, 1]),  // caja azul
  makeBox(0.2, -0.4, 0.25, 0.2, -0.007, 0.009, [1, 0, 0, 1]), // caja roja
];

function init() {
  // ============ STEP 1: Creating a canvas=================
  canvas = document.getElementById("my_Canvas");
  gl = canvas.getContext("webgl2");

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

  // Bind vertex buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

  // Get the attribute location
  const coordLocation = gl.getAttribLocation(shaderProgram, "aCoordinates");

  // Point an attribute to the currently bound VBO
  gl.vertexAttribPointer(coordLocation, 2, gl.FLOAT, false, 0, 0);

  // Enable the attribute
  gl.enableVertexAttribArray(coordLocation);

  // Unbind the buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // look up uniform locations
  colorLocation = gl.getUniformLocation(shaderProgram, "uColor");
  // Set a random color.
  gl.uniform4f(colorLocation, 1, 0, 1, 1);

  render();
}

function render() {
  //========= STEP 4: Create the geometry and draw ===============

  // Clear the canvas
  gl.clearColor(0.8, 1.0, 0.5, 0.8);

  // Clear the color buffer bit
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Set the view port
  gl.viewport(0, 0, canvas.width, canvas.height);

  // Bind appropriate array buffer to it
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

  // girar la línea sobre su propio centro y guardar sus extremos actuales para usarlos tanto al dibujar como al comprobar colisiones
  lineAngle += ROTATION_SPEED;
  const endpoints = getLineEndpoints();
  currentLineP1 = endpoints.p1;
  currentLineP2 = endpoints.p2;
  drawLine(currentLineP1, currentLineP2, [0, 0, 0, 1]);
  // mover cada caja y comprobar rebotes contra bordes y contra la línea
  for (const box of boxes) {
    updateBox(box);
  }
  // comprobar colisiones entre cajas
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      resolveBoxCollision(boxes[i], boxes[j]);
    }
  }
  // dibujar cada caja
  for (const box of boxes) {
    drawRectangle(box.x, box.y, box.width, box.height, box.color);
  }

  // Unbind the buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // start animation loop
  window.requestAnimationFrame(render);
}

function updateBox(box) {
  box.x += box.vx;
  box.y += box.vy;
  // rebote contra el borde izquierdo/derecho de la pantalla (clip space: -1 a 1)
  if (box.x <= -1) {
    box.x = -1;
    box.vx = -box.vx;
    box.color = randomColor();
  } else if (box.x + box.width >= 1) {
    box.x = 1 - box.width;
    box.vx = -box.vx;
    box.color = randomColor();
  }
  // rebote contra el borde superior/inferior de la pantalla
  if (box.y <= -1) {
    box.y = -1;
    box.vy = -box.vy;
    box.color = randomColor();
  } else if (box.y + box.height >= 1) {
    box.y = 1 - box.height;
    box.vy = -box.vy;
    box.color = randomColor();
  }

  // rebote contra la línea, teniendo en cuenta el ángulo que tiene la línea en este instante y por qué lado la toca la caja
  const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  const closest = closestPointOnSegment(center, currentLineP1, currentLineP2);
  const dx = center.x - closest.x;
  const dy = center.y - closest.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > 0 && dist < box.radius) {
    // normal en el punto de contacto (apunta desde la línea hacia el centro de la caja, es decir, hacia el lado por el que la toca)
    const nx = dx / dist;
    const ny = dy / dist;

    // reflejar la velocidad respecto a esa normal: v' = v - 2*(v·n)*n
    const dot = box.vx * nx + box.vy * ny;
    box.vx -= 2 * dot * nx;
    box.vy -= 2 * dot * ny;

    // separar la caja de la línea para que no se quede pegada/atravesándola
    const overlap = box.radius - dist;
    box.x += nx * overlap;
    box.y += ny * overlap;

    box.color = randomColor();
  }
}

// colisión entre las cajas
function resolveBoxCollision(a, b) {
  const overlapX = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
  const overlapY = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
  // si no hay solape en ambos ejes, no están tocándose
  if (overlapX <= 0 || overlapY <= 0) return;
  if (overlapX < overlapY) {
    // se tocan por un lado izquierdo/derecho: separar en X e intercambiar la velocidad horizontal
    const sign = a.x < b.x ? -1 : 1;
    a.x += sign * (overlapX / 2);
    b.x -= sign * (overlapX / 2);
    const tempVx = a.vx;
    a.vx = b.vx;
    b.vx = tempVx;
  } else {
    // se tocan por arriba/abajo: separar en Y e intercambiar la velocidad vertical
    const sign = a.y < b.y ? -1 : 1;
    a.y += sign * (overlapY / 2);
    b.y -= sign * (overlapY / 2);
    const tempVy = a.vy;
    a.vy = b.vy;
    b.vy = tempVy;
  }
  a.color = randomColor();
  b.color = randomColor();
}

function drawRectangle(x, y, width, height, color) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]),
    gl.STATIC_DRAW
  );
  gl.uniform4fv(colorLocation, color);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function drawLine(p1, p2, color) {
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([p1.x, p1.y, p2.x, p2.y]),
    gl.STATIC_DRAW
  );
  gl.uniform4fv(colorLocation, color);
  gl.lineWidth(3);
  gl.drawArrays(gl.LINES, 0, 2);
}

init();
