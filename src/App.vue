<script setup lang="ts">
import { onMounted } from "vue";
import { useToyStore } from "@/stores/useToyStore";

const toyStore = useToyStore();

onMounted(async () => {
  await toyStore.initialize();
});
</script>

<template>
  <RouterView />
</template>
