<script setup>
// credits: https://speckyboy.com/css-javascript-ascii-artwork-snippets/

import { ref, onMounted, onBeforeUnmount } from 'vue'

const gridRef = ref(null)
const containerRef = ref(null)

let animationId
let cols = 0
let rows = 0
let fontSize = 8

const charRangeStart = 33
const charRangeEnd = 126
const charRangeMax = charRangeEnd - charRangeStart

function updateSize() {
  if (!containerRef.value) return
  const { clientWidth, clientHeight } = containerRef.value

  cols = Math.floor(clientWidth / fontSize)
  rows = Math.floor(clientHeight / fontSize)
}

function generateGrid(tick) {
  let content = ''
  const cx = Math.floor(cols / 2)
  const cy = Math.floor(rows / 2)

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const t = 100 + tick * 0.001
      const v = ((Math.cos((x - cx) / 8) + Math.sin((y - cy) / 8) + t) * 16)
      const val = Math.floor(v) % charRangeMax
      content += String.fromCharCode(charRangeStart + val)
    }
    content += '\n'
  }
  return content
}

function animate(tick = 0) {
  if (gridRef.value) {
    gridRef.value.textContent = generateGrid(tick)
  }
  animationId = requestAnimationFrame((ts) => animate(ts))
}

onMounted(() => {
  updateSize()
  window.addEventListener('resize', updateSize)
  animate()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', updateSize)
})
</script>

<template>
  <div ref="containerRef" class="grid-container">
    <pre ref="gridRef" class="grid"></pre>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.grid-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.grid {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  line-height: 1;
  color: #1b1c1c;
  white-space: pre;
  margin: 0;
}
</style>