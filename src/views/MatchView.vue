<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToyStore } from "@/stores/useToyStore";

const route = useRoute();
const router = useRouter();
const toyStore = useToyStore();

const matchToy = computed(() => {
  const toyId = String(route.params.toyId);
  return toyStore.matches.find((toy) => toy.id === toyId) ?? null;
});

const continueBrowsing = (): void => {
  router.push({ name: "browse" });
};
</script>

<template>
  <main
    class="min-h-screen overflow-hidden bg-gradient-to-br from-fuchsia-500 via-pink-400 to-yellow-300 px-4 py-8"
  >
    <div class="pointer-events-none absolute inset-0">
      <span class="absolute left-[10%] top-[15%] animate-pulse text-4xl"
        >🎊</span
      >
      <span class="absolute left-[76%] top-[20%] animate-bounce text-4xl"
        >✨</span
      >
      <span class="absolute left-[20%] top-[78%] animate-bounce text-4xl"
        >🎉</span
      >
      <span class="absolute left-[85%] top-[74%] animate-pulse text-4xl"
        >🎈</span
      >
    </div>

    <section
      class="relative mx-auto w-full max-w-3xl rounded-3xl bg-white/90 p-6 text-center shadow-2xl ring-4 ring-yellow-200"
    >
      <h1 class="animate-bounce text-5xl font-bold text-fuchsia-600">
        🎉 C'est un match !
      </h1>

      <div
        class="mt-8 grid gap-6 md:grid-cols-2"
        v-if="toyStore.myToy && matchToy"
      >
        <article class="rounded-3xl bg-amber-100 p-4 shadow-lg">
          <p class="text-xl font-bold text-slate-700">Ton jouet</p>
          <img
            :src="toyStore.myToy.photoUrl"
            :alt="toyStore.myToy.name"
            class="mt-3 h-56 w-full rounded-2xl object-cover"
          />
          <p class="mt-3 text-2xl font-bold text-slate-900">
            {{ toyStore.myToy.name }}
          </p>
        </article>

        <article class="rounded-3xl bg-emerald-100 p-4 shadow-lg">
          <p class="text-xl font-bold text-slate-700">Jouet matché</p>
          <img
            :src="matchToy.photoUrl"
            :alt="matchToy.name"
            class="mt-3 h-56 w-full rounded-2xl object-cover"
          />
          <p class="mt-3 text-2xl font-bold text-slate-900">
            {{ matchToy.name }}
          </p>
        </article>
      </div>

      <p v-else class="mt-8 text-2xl font-bold text-slate-900">
        Impossible d'afficher le match pour l'instant.
      </p>

      <button
        type="button"
        class="mt-8 min-h-11 rounded-full bg-fuchsia-500 px-8 py-4 text-2xl font-bold text-white shadow-lg"
        @click="continueBrowsing"
      >
        Continuer à parcourir
      </button>
    </section>
  </main>
</template>
