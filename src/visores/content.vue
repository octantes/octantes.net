<script setup>
import Markdown from '../recursos/markdown.vue'
import Shader from '../recursos/shader.vue';

const props = defineProps({
    route: String,
})
</script>

<template>
    <div class="post">
        <Shader v-if="!route" />
        <Markdown v-else :route="route"/>
    </div>
</template>

<style>
.post {
    background-color: #986C98;
    border: 1px, solid, #AAABAC;
    width: 100%;
}
</style>