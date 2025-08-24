<script setup>
import Content from './visores/content.vue'
import Navigation from './visores/navigation.vue'
</script>

<template>
    <div class="layout">
        <Navigation class="navigation"/>
        <Content class="content" notePath="/octantes/octantes.net.md"/>
    </div>
</template>

<style scoped>
.layout {
    display: grid;
    grid-template-columns: 5fr 3fr;
    height: 100%;
}
.navigation {
    background-color: #2B2C2C;
}
.content {
    background-color: #986c98;
}
</style>