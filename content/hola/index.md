---
tags: 
id:
  - cadena
llave: "[[¬navegador]]"
---
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

probablemente implementar el **visor** nav-bar usando 1fr termine demasiado ancha
para solucionarlo puedo hacer la division en dos layouts principales de 5fr y 3fr
estableciendo la barra de navegacion en una grid fina dentro del visor principal