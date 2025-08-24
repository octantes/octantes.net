<script setup>
import Content from './content.vue'
import Navigation from './navigation.vue'
</script>

<template>
    <div class="layout">
        <Navigation class="navigation"/>
        <Content class="content" route="/octantes/octantes.net.md"/>
    </div>
</template>

<style scoped>
.layout {
    display: grid;
    width: 100%;
    grid-template-columns: 5fr 3fr;
    gap: 1rem;
}
</style>