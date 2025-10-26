<script setup lang="ts">
const route = useRoute();
const roomId = route.params.id as string;
</script>

<template>
  <section class="p-6">
    <h2 class="text-xl font-semibold">Room : {{ roomId }}</h2>
    <p>Historique et messages à venir.</p>
  </section>
</template>
