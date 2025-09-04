<script setup>
import { ref, onMounted } from 'vue'

const notes = ref([])

onMounted(async () => {
  const res = await fetch('/index.json')
  notes.value = await res.json()
})
</script>

<template>
    <div class="navigation">
        <h1>navegacion</h1>
          <table>
            <thead>
              <tr>
                <th>Título</th><th>Fecha</th><th>Tags</th><th>Link</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="note in notes" :key="note.url">
                <td>{{ note.title }}</td>
                <td>{{ note.date }}</td>
                <td>{{ note.tags.join(', ') }}</td>
                <td><a :href="note.url">Ver</a></td>
              </tr>
            </tbody>
          </table>
    </div>
</template>

<style>
.navigation {
  display: flex;
  flex-direction: column;
  background-color: #1B1C1C;
  color: #D8DADE;
  padding: 1rem;
  border: 1px, solid, #AAABAC;

}
</style>