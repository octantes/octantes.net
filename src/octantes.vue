<script setup>
import Content from './visores/content.vue'
import Navigation from './visores/navigation.vue'
import Footer from './visores/footer.vue'
</script>

<template>
    <div class="pagina">
        <div class="layout">
            <Navigation class="navigation"/>
            <Content class="content" route="/octantes/octantes.net.md"/>
        </div>
        <div class="footer">
            <Footer/>
        </div>
    </div>
</template>

<style>
.pagina {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    padding: 1rem;
    gap: 1rem;
}
.layout {
    display: grid;
    grid-template-columns: 5fr 3fr;
    width: 100%;
    gap: 1rem;
    flex: 1 1 auto;
}
@media (max-width: 1080px) {
  .layout {
    grid-template-columns: 1fr;
    grid-auto-rows: auto;
  }
}
</style>