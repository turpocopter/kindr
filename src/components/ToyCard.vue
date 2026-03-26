<script setup lang="ts">
import type { Toy } from "@/types/toy";

defineProps<{
  toy: Toy;
}>();
</script>

<template>
  <article
    class="relative min-h-[420px] min-w-[280px] overflow-hidden rounded-3xl shadow-2xl"
  >
    <img
      :src="toy.photoUrl"
      :alt="toy.name"
      class="h-full w-full object-cover pointer-events-none"
      draggable="false"
    />
    <div
      class="absolute inset-x-0 bottom-0 bg-black/45 px-4 py-4 text-white backdrop-blur-sm"
    >
      <h3 class="text-2xl font-bold">{{ toy.name }}</h3>
    </div>
  </article>
</template>
