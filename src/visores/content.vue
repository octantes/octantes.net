<script setup>
import { ref, watch, onMounted } from 'vue'
import Shader from '../recursos/shader.vue'

const props = defineProps({ route: String })
const noteContent = ref('')

// fetchea directamente /posts/<slug>/ (ya devuelve el html)
async function loadNote(slug) {
    if (!slug) return
    try {
        const url = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/posts/${slug}/`
        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP error ${res.status}`)
        noteContent.value = await res.text()
    } catch (e) {
        noteContent.value = `<p>Error cargando la nota</p>`
        console.error(`Error fetching slug "${slug}":`, e)
    }
}

// extrae el slug tomando siempre el último segmento de la URL
function extractSlugFromPath(pathname) {
    const parts = pathname.replace(import.meta.env.BASE_URL.replace(/\/$/, ''), '').split('/').filter(Boolean)
    return parts.length ? parts[parts.length - 1] : ''
}

// inicializar ruta desde URL externa
onMounted(() => {
    const slug = extractSlugFromPath(window.location.pathname)
    if (slug) loadNote(slug)
})

// actualizar contenido cuando cambia props.route
watch(
    () => props.route,
    (slug) => {
        if (!slug) return
        loadNote(slug)
        history.pushState({ route: slug }, '', `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${slug}/`)
    },
    { immediate: false }
)

// escuchar back/forward
window.addEventListener('popstate', (e) => {
    const slug = e.state?.route || extractSlugFromPath(window.location.pathname)
    loadNote(slug)
})
</script>

<template>
    <div class="post">
        <Shader v-if="!noteContent" />
        <div v-else class="text" v-html="noteContent"></div>
    </div>
</template>

<style>
.post {
    background-color: #986C98;
    border: 1px solid #AAABAC;
    width: 100%;
}
.text {
    color: #1B1C1C;
    background-color: #986C98;
    padding: 1rem;
}
</style>