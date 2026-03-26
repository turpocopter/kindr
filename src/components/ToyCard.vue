<script setup lang="ts">
import type { Toy } from "@/types/toy";

defineProps<{
  toy: Toy;
}>();
</script>

<template>
  <article
    class="relative h-full w-full overflow-hidden rounded-3xl shadow-2xl"
  >
    <img
      :src="toy.photoUrl"
      :alt="toy.name"
      class="h-full w-full object-cover pointer-events-none"
      draggable="false"
    />
  </article>
</template>
