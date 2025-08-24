<script setup>
import Display from './visores/display.vue'
import Footer from './visores/footer.vue'
</script>

<template>
    <div class="pagina">
        <div class="top">
            <Display/>
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
.top {
    display: flex;
    flex: 1 1 auto;
}
</style>