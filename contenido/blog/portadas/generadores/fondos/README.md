# Fotos de fondo de las portadas

Deja aquí un archivo por post, con el **slug exacto** como nombre:
`why-dues-collection-breaks-down.jpg`, etc. Valen `.jpg`, `.png` y `.webp`.

Luego:

```bash
node contenido/blog/portadas/generadores/tarjetas-tipograficas.js
```

Cada post que tenga foto la usa; el que no, sigue con su esquema. El script
dice al final cuántas encontró y cuáles faltan.

Los prompts para generarlas y el criterio de aceptación están en
`../../../textos/PROMPTS-PORTADAS.md`. El requisito que más se incumple: **el 55% izquierdo
de la foto tiene que quedar oscuro y sin detalle**, porque ahí va el titular.
