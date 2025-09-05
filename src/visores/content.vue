<script setup>
import { ref, watch } from 'vue'
import Shader from '../recursos/shader.vue';

const props = defineProps({
    route: String,
})

const noteContent = ref('')

watch(
    () => props.route, // react to route change
    async (route) => {
        if (!route) return
        const res = await fetch(import.meta.env.BASE_URL + route)
        noteContent.value = await res.text()
    }, { immediate: true }
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