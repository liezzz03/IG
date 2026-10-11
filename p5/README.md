# Funcionalidades añadidas/implementadas

- **Iluminación Phong parametrizable**: los colores y parámetros que antes estaban fijos en el fragment shader (material difuso, especular, ambiente, brillo y color de la luz) pasan a ser uniforms (`uDifColor`, `uSpecColor`, `uAmbColor`, `uShininess`, `uLightColor`) controlados desde JavaScript.
- **Posición de la luz como uniform** (`uLightPos`): se calcula en JS, en espacio de cámara, en lugar de estar fija en el vertex shader.
- **Luz anclada al objeto o fija**: si está anclada, la luz sigue las rotaciones y el zoom del ratón junto con la esfera; si es fija, queda estática respecto a la cámara y la esfera gira bajo ella. Se consigue eligiendo con qué matriz (modelo-vista o solo cámara) se transforma la posición de la luz.
- **Panel de control con dat.gui**, organizado en dos carpetas:
  - *Luz*: posición (X, Y, Z), anclada/fija y color de la luz.
  - *Material*: color difuso, color especular, color ambiente y brillo (shininess).
- **Selector de color** (`addColor`) con conversión de hexadecimal a RGB normalizado mediante la función `hexToRgb`.

# Teclas y acciones para manejar la demo

| Acción | Efecto |
|---|---|
| Arrastrar con el botón izquierdo del ratón sobre el canvas | Rotar la esfera (ejes X e Y) |
| Rueda del ratón | Acercar / alejar (zoom) |
| Arrastrar con un dedo sobre el canvas (móvil) | Rotar la esfera |
| Panel *Luz* → `lightX`, `lightY`, `lightZ` | Mover la posición de la luz |
| Panel *Luz* → `anclada al objeto` | Alternar entre luz anclada al objeto y luz fija respecto a la cámara |
| Panel *Luz* → `lightColor` | Cambiar el color de la luz |
| Panel *Material* → `difColor` / `specColor` / `ambColor` | Cambiar el color difuso, especular y ambiente |
| Panel *Material* → `shininess` | Ajustar el brillo del reflejo especular |