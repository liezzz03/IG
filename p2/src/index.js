// Vertex shader source
const vertexShaderSource = `#version 300 es
      precision mediump float;

      in vec2 aCoordinates;

      void main(void) {
        gl_Position = vec4(aCoordinates, 0, 1);
        gl_PointSize = 25.0;
      }
`;

// Fragment shader source
const fragmentShaderSource = `#version 300 es
        precision mediump float;

        out vec4 fragColor;
        uniform vec4 uColor;
        uniform float uIsCircle; // 1.0 cuando dibujamos la pelota como punto, 0.0 para rectángulos

        void main(void) {
          //fragColor = vec4(1,0,1,1);
          if (uIsCircle > 0.5) {
            // recorta el cuadrado del punto para que quede circular
            vec2 coord = gl_PointCoord - vec2(0.5);
            if (length(coord) > 0.5) {
              discard;
            }
          }
          fragColor = uColor;
      }
`;

var canvas, gl;
var colorLocation;
var isCircleLocation;
var vertex_buffer;

var y1 = 0.4;

var ball = {
  x: -0.5,
  y: -0.3,
  width: 0.1,
  height: 0.1,
  color: [0, 0, 0, 0],
  speedX: 0.01,
  speedY: -0.01,
};

// juega con wasd
var player1 = {
  x: 0.86,
  y: -0.2,
  width: 0.04,
  height: 0.4,
  color: [1, 1, 0, 1],
  movement: 0,
};

// juega con las flechas
var player2 = {
  x: -0.9,
  y: -0.2,
  width: 0.04,
  height: 0.4,
  color: [0, 0, 1, 1],
  movement: 0,
};

var player1Score = 0;
var player2Score = 0;
const BASE_SPEED_X = 0.01;
const WINNING_SCORE = 10;
var winner = null; // null | 1 | 2

// para jugar en el móvil
var prevTouchY;
var activeTouches = {};

function init() {
  // ============ STEP 1: Creating a canvas=================
  canvas = document.getElementById("my_Canvas");
  gl = canvas.getContext("webgl2");

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("orientationchange", resizeCanvas);

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
  isCircleLocation = gl.getUniformLocation(shaderProgram, "uIsCircle");
  // Set a random color.
}

function render() {
  //========= STEP 4: Create the geometry and draw ===============

  // Clear the canvas
  gl.clearColor(0, 0, 0, 1);

  // Clear the color buffer bit
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Set the view port
  gl.viewport(0, 0, canvas.width, canvas.height);

  // Bind appropriate array buffer to it
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

  /*// Pass the vertex data to the buffer
  var vertices = [-0.5, 0.5, 0.0, 0.5, -0.25, 0.25, 0.8, 0.8];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  // Draw geometry
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);*/

  /*  y1 -= 0.01;
  drawRectangle(-0.2, y1, 0.3, 0.4, [0, 0, 1, 1]);
  drawRectangle(0.2, 0.4, 0.3, 0.4, [0, 1, 0, 1]);
*/

  if (!winner) {
    ball.x += ball.speedX;
    ball.y += ball.speedY;

    if (ball.y <= -1) ball.speedY *= -1;
    if (ball.y + ball.height >= 1) ball.speedY *= -1;

    // gol por la izquierda -> punto para el jugador de la pala izquierda (player2)
    if (ball.x <= -1) {
      player2Score++;
      resetBall(-1);
      checkWinner();
    }

    // gol por la derecha -> punto para el jugador de la pala derecha (player1)
    if (ball.x + ball.width >= 1) {
      player1Score++;
      resetBall(1);
      checkWinner();
    }

    checkPaddleCollision(ball, player1);
    checkPaddleCollision(ball, player2);

    player1.y = clamp(player1.y + player1.movement, -1, 1 - player1.height);
    player2.y = clamp(player2.y + player2.movement, -1, 1 - player2.height);
  }

  document.getElementById("score1").textContent = player1Score;
  document.getElementById("score2").textContent = player2Score;

  drawMiddleLine();
  drawBall(ball);
  drawRectangle(player1);
  drawRectangle(player2);

  // Unbind the buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // start animation loop
  window.requestAnimationFrame(render);
}

function checkWinner() {
  const leader = Math.max(player1Score, player2Score);
  const trailer = Math.min(player1Score, player2Score);
  if (leader >= WINNING_SCORE && leader - trailer >= 2) {
    winner = player1Score > player2Score ? 1 : 2;
    showWinner();
  }
}

function showWinner() {
  document.getElementById("winnerText").textContent =
    "¡Jugador " + winner + " gana!";
  document.getElementById("winner").style.display = "flex";
}

function resetGame() {
  player1Score = 0;
  player2Score = 0;
  winner = null;
  document.getElementById("winner").style.display = "none";
  resetBall(Math.random() < 0.5 ? -1 : 1);
}

function drawMiddleLine() {
  gl.uniform1f(isCircleLocation, 0.0);
  gl.uniform4fv(colorLocation, [1, 1, 1, 1]);

  const dashHeight = 0.06;
  const dashWidth = 0.006;
  const gap = 0.04;
  const step = dashHeight + gap;

  for (let y = -1; y < 1; y += step) {
    const x1 = -dashWidth / 2;
    const x2 = dashWidth / 2;
    const y1 = y;
    const y2 = y + dashHeight;
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]),
      gl.STATIC_DRAW
    );
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// para cada vez que se consigue un punto se reinicia la bola
function resetBall(direction) {
  ball.x = -ball.width / 2;
  ball.y = -ball.height / 2;
  ball.speedX = direction * BASE_SPEED_X;
  ball.speedY = 0.001;
}

// comprueba si la pelota choca con la pala y, si es así, la hace rebotar
function checkPaddleCollision(ball, paddle) {
  const overlapX =
    ball.x < paddle.x + paddle.width && ball.x + ball.width > paddle.x;
  const overlapY =
    ball.y < paddle.y + paddle.height && ball.y + ball.height > paddle.y;

  if (overlapX && overlapY) {
    // invertir la velocidad horizontal por el rollo de como rebota
    ball.speedX *= -1;
    // sacar la pelota fuera de la pala para que no se quede "pegada" rebotando varias veces en el mismo frame
    if (ball.speedX > 0) {
      ball.x = paddle.x + paddle.width;
    } else {
      ball.x = paddle.x - ball.width;
    }

    // ángulo de rebote según en qué punto de la pala golpea la pelota
    const paddleCenter = paddle.y + paddle.height / 2;
    const ballCenter = ball.y + ball.height / 2;
    const offset = (ballCenter - paddleCenter) / (paddle.height / 2); // rango aprox. -1..1
    ball.speedY = offset * 0.02;
  }
}

function drawRectangle(r) {
  gl.uniform1f(isCircleLocation, 0.0); // los rectángulos no llevan máscara circular

  var x1 = r.x;
  var x2 = r.x + r.width;
  var y1 = r.y;
  var y2 = r.y + r.height;

  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]),
    gl.STATIC_DRAW
  );
  gl.uniform4fv(colorLocation, r.color);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

// dibuja la pelota como un punto (gl.POINTS) para que se vea circular y no un cuadrado
function drawBall(r) {
  const cx = r.x + r.width / 2;
  const cy = r.y + r.height / 2;

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([cx, cy]), gl.STATIC_DRAW);
  gl.uniform4fv(colorLocation, r.color);
  gl.uniform1f(isCircleLocation, 1.0);
  gl.drawArrays(gl.POINTS, 0, 1);
}

// CÓDIGO PRINCIPAL
init();
render();

// Invoke `processKey` on the `onkeydown` event
document.onkeydown = onKeyDown;
document.onkeyup = onKeyUp;
// Process key events by updating global orientation values
// recogemos las teclas
function onKeyDown(key) {
  switch (key.keyCode) {
    case 38: // up arrow
      key.preventDefault();
      player1.movement = 0.02;
      break;
    case 40: // down arrow
      key.preventDefault();
      player1.movement = -0.02;
      break;
    case 87: // w
      player2.movement = 0.02;
      break;
    case 83: // s
      player2.movement = -0.02;
      break;
    case 82: // r
      resetGame();
      break;
  }
}

function onKeyUp(key) {
  switch (key.keyCode) {
    case 38:
    case 40:
      player1.movement = 0;
      break;
    case 87:
    case 83:
      player2.movement = 0;
      break;
  }
}

// listeners for mobile events
canvas.addEventListener("touchstart", onTouchStart, { passive: false });
canvas.addEventListener("touchmove", onTouchMove, { passive: false });
canvas.addEventListener("touchend", onTouchEnd, { passive: false });
canvas.addEventListener("touchcancel", onTouchEnd, { passive: false });

// eventos en el móvil
function onTouchStart(e) {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  for (const touch of e.changedTouches) {
    const localX = touch.clientX - rect.left;
    const side = localX < rect.width / 2 ? "left" : "right";
    activeTouches[touch.identifier] = { side, prevY: touch.clientY };
  }
}

function onTouchMove(e) {
  e.preventDefault();
  for (const touch of e.changedTouches) {
    const info = activeTouches[touch.identifier];
    if (!info) continue;

    const touchY = touch.clientY;
    const difY = touchY - info.prevY;
    const movement = -difY * 0.005;

    if (info.side === "left") {
      player2.movement = movement;
    } else {
      player1.movement = movement;
    }

    info.prevY = touchY;
  }
}

function onTouchEnd(e) {
  e.preventDefault();
  for (const touch of e.changedTouches) {
    const info = activeTouches[touch.identifier];
    if (!info) continue;

    if (info.side === "left") {
      player2.movement = 0;
    } else {
      player1.movement = 0;
    }

    delete activeTouches[touch.identifier];
  }
}

document.addEventListener(
  "touchmove",
  function (e) {
    e.preventDefault();
  },
  { passive: false }
);

function resizeCanvas() {
  const wrapper = document.querySelector(".game-wrapper");
  const ratio = 900 / 500;

  let w = wrapper.clientWidth;
  let h = w / ratio;

  if (h > wrapper.clientHeight) {
    h = wrapper.clientHeight;
    w = h * ratio;
  }

  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
}
