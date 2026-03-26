<script setup lang="ts">
import { onMounted } from "vue";
import { useToyStore } from "@/stores/useToyStore";

const toyStore = useToyStore();

onMounted(async () => {
  await toyStore.initialize();
});
</script>

<template>
  <div class="app-wrapper">
    <RouterView />
  </div>
</template>

<style scoped>
.app-wrapper {
  overflow-x: hidden;
  width: 100%;
  position: relative;
  touch-action: pan-y;
}
</style>
