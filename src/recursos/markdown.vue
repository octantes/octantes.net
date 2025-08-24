<script setup>
import { ref, watch } from 'vue'
import { parseMarkdown } from './parse.js'

const props = defineProps({
    notePath: String
})

const htmlContent = ref('')
const metadataRef = ref({})

watch(() => props.notePath, async (path) => {
  if (!path) return
  const { metadata, html } = await parseMarkdown(path)
  metadataRef.value = metadata
  htmlContent.value = html
}, { immediate: true })
</script>

<template>
    <div v-html="htmlContent"></div>
</template>

<style>
</style>