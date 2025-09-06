---
tags:
id:
  - llave
cerradura:
  - "[[°web]]"
---
en versiones previas de la pagina, la **estética** era un problema importante a consolidar
la idea de *contener universos estéticos amplios* chocaba con la definición de un estilo
para resolver esto, tome como referencia la expresión mínima de una interfaz: las CLI
la estética final contiene un meme defensivo, que filtra usuarios realmente interesados

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

- el fondo es un tiling canvas oscuro con scroll lateral sobre el que carga el resto
- los visores implementan alpha mínimo con blur, emulando un TWM con picom
___
tengo que diseñar un sistema para hacer el **deploy** que sea sostenible en el tiempo
para eso el host debe ser gratuito, permitir un mínimo seo y usar un dominio custom
lo mas simple para arrancar va a ser hostear en github pages y diseñar la escalabilidad
pensando un sistema estructural que sea fácilmente adaptable a nuevas necesidades

- otra prioridad es que el workflow para sumar notas sea solo droppear el markdown

la pagina esta diseñada como una SPA estática, por lo que el **seo** va a ser un problema
para solucionarlo, usar una github action que haga pre-render a html cuando pusheo
yo mantengo el workflow que busco, pero al sumar un md github lo integra como html
también debe generar un index que puedo usar para generar dinamicamente la tabla

1. subo el md a un directorio de mi branch principal
2. corro la acción de github que buildea y genera el html
3. la spa toma el html y lo inserta en el panel correspondiente
4. la spa toma el index json y lo usa para generar la tabla de navegacion

lo importante es definir como la spa consume el contenido html que genera github
para eso debo definir una estructura de archivos escalable y final, eso es prioritario
por otro lado, para construir la acción puedo usar un script de node local accion.js
necesito testear bien la integración de imágenes al html desde links relativos en md