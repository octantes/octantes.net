<script setup>
import { ref, watch, onMounted } from 'vue'
import Shader from '../recursos/shader.vue'

const props = defineProps({ route: String })
const noteContent = ref('')

async function loadNote(route) {
    if (!route) return
    try {
        const res = await fetch(`${import.meta.env.BASE_URL.replace(/\/$/, '')}/${route.replace(/^\/+/, '')}`)
        if (!res.ok) throw new Error(`HTTP error ${res.status}`)
        noteContent.value = await res.text()
    } catch (e) {
        noteContent.value = `<p>Error cargando la nota</p>`
        console.error(`Error fetching route "${route}":`, e)
    }
}

// inicializar ruta desde URL si existe
onMounted(() => {
    const path = window.location.pathname.replace(import.meta.env.BASE_URL.replace(/\/$/, ''), '')
    if (path && path !== '/') {
        loadNote(path)
    }
})

// actualizar contenido cuando cambia props.route
watch(
    () => props.route,
    (route) => {
        if (!route) return
        loadNote(route)
        // actualizar URL sin recargar la página
        history.pushState(
            { route },
            '',
            `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${route.replace(/^\/+/, '')}`
        )
    },
    { immediate: false }
)

// escuchar back/forward
window.addEventListener('popstate', (e) => {
    const route = e.state?.route || ''
    loadNote(route)
})
</script>

<template>
    <div class="post">
        <Shader v-if="!route" />
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
