import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Fuentes
//https://threejs.org/docs/#manual/en/introduction/Creating-a-scene -->
//https://r105.threejsfundamentals.org/threejs/lessons/threejs-primitives.html  -->
let scene;
let camera;
let renderer;
let objetos = [];
let grid;

init();
animationLoop();

function init() {
  //Integrando un título del script
  var info = document.createElement("div");
  info.style.position = "absolute";
  info.style.top = "30px";
  info.style.width = "100%";
  info.style.textAlign = "center";
  info.style.color = "#fff";
  info.style.fontWeight = "bold";
  info.style.backgroundColor = "transparent";
  info.style.zIndex = "1";
  info.style.fontFamily = "Monospace";
  info.innerHTML = "Script 3";
  document.body.appendChild(info);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 10);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  //Objetos
  Esfera(0, 0, 0, 1, 10, 10, 0xffff00);
  Esfera(2, 0, 0, 2, 10, 10, 0x00ffff);
  // ver cuantas esferas puedo crear sin que se trabe
  let cantidadEsferas = 7000; // Aumenta este número para probar cuándo se traba
  let rango = 20; // El área máxima en los ejes X, Y y Z
  for (let i = 0; i < cantidadEsferas; i++) {
    let px = (Math.random() - 0.5) * rango;
    let py = (Math.random() - 0.5) * rango;
    let pz = (Math.random() - 0.5) * rango;

    // radio y color también aleatorios
    let radio = Math.random() * 1.5 + 0.5;
    let color = Math.random() * 0xffffff;

    Esfera(px, py, pz, radio, 10, 10, color);
  }

  var controls = new OrbitControls(camera, renderer.domElement);

  //Rejilla de referencia indicando tamaño y divisiones
  grid = new THREE.GridHelper(25, 25);
  //Mostrarla en vertical
  grid.geometry.rotateX(Math.PI / 2);
  grid.position.set(0, 0, 0.05);
  grid.visible = true;
  scene.add(grid);
}

function Esfera(px, py, pz, radio, nx, ny, col) {
  let geometry = new THREE.SphereBufferGeometry(radio, nx, ny);
  //Material con o sin relleno
  let material = new THREE.MeshBasicMaterial({
    color: col,
    wireframe: true, //Descomenta para activar modelo de alambres
  });

  let mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(px, py, pz);
  scene.add(mesh);
  objetos.push(mesh);
}

//Bucle de animación
function animationLoop() {
  requestAnimationFrame(animationLoop);

  //Modifica rotación de todos los objetos
  for (let object of objetos) {
    object.rotation.x += 0.01;
    object.rotation.y += 0.01;
  }

  renderer.render(scene, camera);
}
