---
tags:
id:
  - llave
cerradura:
  - "[[°web]]"
---
en versiones previas de la pagina, la **estética** era un problema 

- estructura de ventanas triptica de twm, con un foco particular para cada *visor*
- paleta de ocho colores basados en la commodore, con acentos magentas
- combinación de una font pixel para la consola (gohu) y una grotesk (space)
- uso frecuente de ascii art como filtro de las imágenes y vídeos incluidos

hay dos dimensiones importantes a resolver para lograr la **responsividad** del layout
tanto en mobile como en desktop, la *estructura triple debe mantenerse* siempre

1. la división del viewport en columnas con dimensiones relativas (cssgrid)
	1. usar grid-template-columns: 1fr, 4fr, 3fr para dividir la pantalla
	2. usar media queries para rearmar el layout de forma vertical
2. la definición de una grid interna para el ascii art
	1. vw / gridsize (cantidad de símbolos) = ascii font size
	2. setear ese valor en root y usar em para escalarlo
	3. testear funcionamiento onzoom y onresize



- el fondo es un tiling canvas oscuro con scroll lateral sobre el que carga el resto
- los visores implementan alpha mínimo con blur, emulando un TWM con picom
___
tengo que diseñar un sistema para hacer el **deploy** que sea sostenible en el tiempo
para eso el host debe ser gratuito, permitir un mínimo seo y usar un dominio custom
lo mas simple para arrancar va a ser hostear en github pages y diseñar la escalabilidad
pensando un sistema estructural que sea fácilmente adaptable a nuevas necesidades

