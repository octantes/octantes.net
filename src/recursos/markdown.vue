<script setup>
import { ref, watch } from 'vue'
import { parseMarkdown } from './parse.js'

const props = defineProps({
    route: String,
})

const noteContent = ref('')
const noteMetadata = ref({})

watch(
    () => props.route, // react to route change
    async (route) => {
        if (!route) return
        const { path, metadata, html } = await parseMarkdown(route) // destructure response
        noteMetadata.value = metadata
        noteContent.value = html
    }, { immediate: true }
)

</script>

<template>
    <div class="text">
        <div v-html="noteContent"></div>
    </div>
</template>

<style>
.text {
    color: #1B1C1C;
    background-color: #986C98;
    padding: 1rem;
}
</style>