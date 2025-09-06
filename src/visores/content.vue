<script setup>
import { ref, watch, onMounted } from 'vue'
import Shader from '../recursos/shader.vue'

const props = defineProps({ route: String })
const noteContent = ref('')
const noteHtmlCache = ref({}) // cache local de notas cargadas

async function loadNote(route) {
    if (!route) return

    // si ya tenemos la nota en cache
    if (noteHtmlCache.value[route]) {
        noteContent.value = noteHtmlCache.value[route]
        return
    }

    try {
        // limpiar ruta y apuntar al index.html pre-renderizado
        const cleanRoute = route.replace(/index\.html$/, '').replace(/\/$/, '')
        const url = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${cleanRoute}/index.html`
        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP error ${res.status}`)
        const html = await res.text()

        // extraer solo el body para inyectar
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
        const content = bodyMatch ? bodyMatch[1] : html
        noteHtmlCache.value[route] = content
        noteContent.value = content

        // actualizar meta tags dinámicamente
        const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i)
        if (headMatch) {
            const headHtml = headMatch[1]
            const temp = document.createElement('div')
            temp.innerHTML = headHtml
            Array.from(temp.children).forEach(el => {
                if (el.tagName === 'TITLE') document.title = el.textContent
                else if (el.tagName === 'META') {
                    const name = el.getAttribute('name')
                    const prop = el.getAttribute('property')
                    if (name) document.querySelector(`meta[name="${name}"]`)?.remove()
                    if (prop) document.querySelector(`meta[property="${prop}"]`)?.remove()
                    document.head.appendChild(el)
                }
            })
        }

    } catch (e) {
        noteContent.value = `<p>Error cargando la nota</p>`
        console.error(`Error fetching route "${route}":`, e)
    }
}

// cargar nota inicial desde URL si existe
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
        <Shader v-if="!props.route" />
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