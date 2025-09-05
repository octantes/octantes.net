<script setup>
import { ref, watch } from 'vue'
import Shader from '../recursos/shader.vue'

const props = defineProps({
    route: String,
})

const noteContent = ref('')

watch(
    () => props.route,
    async (route) => {
        if (!route) return
        try {
            const res = await fetch(import.meta.env.BASE_URL + route)
            if (!res.ok) throw new Error(`HTTP error ${res.status}`)
            noteContent.value = await res.text()
        } catch (e) {
            noteContent.value = `<p>Error cargando la nota</p>`
            console.error(`Error fetching route "${route}":`, e)
        }
    },
    { immediate: true }
)
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