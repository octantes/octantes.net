<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
    route: String,
})

const noteContent = ref('')

watch(
    () => props.route, // react to route change
    async (route) => {
        if (!route) return
        const res = await fetch(props.route)
        noteContent.value = await res.text()
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