<script setup>
import { ref, watch } from 'vue'
import Markdown from '../recursos/markdown.vue'

const props = defineProps({
    notePath: String
})
</script>

<template>
    <div class="post">
        <Markdown :notePath="notePath"/>
    </div>
</template>

<style>

</style>