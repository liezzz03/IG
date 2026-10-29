# Sistema solar con three.js

**Autoría:** [_Paula Lijun Nuez Hernández_](https://github.com/liezzz03)

**Vídeo de captura:** [video](/p6/p6-sistemaSolar/sistema_solar.mp4)

**Demo / repositorio:**

![GIF](/p6/p6-sistemaSolar/sistema_solar.gif)

[CodeSandbox](https://codesandbox.io/p/sandbox/practica6-ig-qjhg2f)

## Descripción del trabajo realizado

Sistema planetario interactivo hecho con three.js. Incluye el Sol, **8 planetas** (Mercurio a Neptuno), **4 planetas enanos**, **lunas** (Luna, Fobos, Deimos, Ío, Europa, Ganímedes y Titán), iluminación, texturas y **dos vistas** que se pueden alternar o mostrar a la vez.

### Lo que hace

- Las lunas cuelgan del pivote del planeta, así que se mueven solidariamente con él, y los anillos y las nubes cuelgan del `tilt`.
- Las órbitas son elípticas en el plano XZ, calculadas con `cos`/`sin` y dibujadas con `EllipseCurve`.
- Para la iluminación se usa una `PointLight` en el centro del Sol (sin atenuación), una luz ambiente tenue y materiales `MeshPhongMaterial`. El Sol usa `MeshBasicMaterial` y un halo con mezcla aditiva.
- Las texturas que se han usado las imágenes de 2k en `src/textures/` para el Sol, los 8 planetas, la Luna y los planetas enanos (Ceres, Haumea, Makemake y Eris), más el fondo de la Vía Láctea. En la Tierra se combinan el mapa de día, el de normales, el especular, las luces nocturnas de las ciudades (emisivo) y una capa de nubes con mapa de transparencia. Los anillos de Saturno usan la tira de la imagen con UV radiales. Si falta un archivo, el código usa una textura generada con `canvas`, así que el proyecto nunca se queda sin ver.
- **Vista general:** cámara orbital (`OrbitControls`).
- **Vista subjetiva de la nave:** la cámara es hija de un objeto nave que se pilota con el teclado.
- **Modo mixto:** vista general con una mini-vista de la nave (`setViewport` + `setScissor`).

### Extras implementados

- **Ficha didáctica** en un recuadro (abajo a la izquierda): en la vista general y en la mini-vista aparece al pasar el ratón sobre un astro o luna; en la vista de la nave aparece automáticamente al acercarte a un astro o luna (si hay dos muy cerca, muestra ambos).
- **Punto de vista de la nave interactivo:** velocidad, campo de visión, "viajar al destino" y "acoplar" para seguir el movimiento de un astro.
- **Cámara general que sigue** al astro elegido como destino.
- Nombres sobre cada astro, HUD con el astro más cercano y control de la velocidad del tiempo.

## Controles

| Acción | Control |
|---|---|
| Orbitar, zoom, desplazar (vista general) | Ratón: arrastrar, rueda, clic derecho |
| Ficha de un astro o luna | Vista general: pasar el ratón por encima · Vista nave: acercarse |
| Cambiar de vista | `1` general · `2` nave · `3` general + mini-vista, o desplegable "Vista" |
| Avanzar/frenar, turbo | `W` / `S`, `Shift` |
| Girar, cabeceo, alabeo | `A`/`D` o `←`/`→`, `↑`/`↓`, `Q`/`E` |
| Subir/bajar | `R` / `F` |
| Pausa, órbitas, nombres | `P`, `O`, `L` |

## Estructura

- `src/index.html`: página y elementos de interfaz (etiquetas, ficha, ayuda, HUD).
- `src/sistema_solar.js`: toda la lógica. Los datos de planetas y lunas están al principio, en `PLANETAS`, y se añaden o cambian fácilmente.

## Nota sobre escalas

Radios, distancias y velocidades **no son reales**; se ajustan para que todo se vea a la vez.

## Referencias

- Documentación de three.js: <https://threejs.org/docs/>.
- Scripts de las prácticas de la asignatura (S6 y S7): estructura del grafo de escena, órbitas y lunas, luces con GUI y viewports con `scissor`.
- `lil-gui`: <https://lil-gui.georgealways.com/>
- Texturas: **Solar System Scope**, <https://www.solarsystemscope.com/textures/> (licencia CC BY 4.0). Las de los planetas enanos son las versiones "fictional" que ofrece la web, es decir, representaciones artísticas.
- Datos de las fichas (diámetros, períodos, curiosidades): NASA Solar System Exploration, <https://science.nasa.gov/solar-system/>
- Generador pseudoaleatorio con semilla `mulberry32` (algoritmo público).
- Uso de la IA para elegir el tamaño, órbita y velocidad.
