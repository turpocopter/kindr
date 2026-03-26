<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import SwipeStack from "@/components/SwipeStack.vue";
import { useToyStore } from "@/stores/useToyStore";
import type { Toy } from "@/types/toy";

const router = useRouter();
const toyStore = useToyStore();

const remainingToys = computed(() =>
  toyStore.availableToys.filter(
    (toy) =>
      !toyStore.likedToyIds.includes(toy.id) &&
      !toyStore.dislikedToyIds.includes(toy.id),
  ),
);

const goBackHome = (): void => {
  router.push({ name: "home" });
};

const onDislike = (toy: Toy): void => {
  toyStore.dislikeToy(toy.id);
};

const onLike = (toy: Toy): void => {
  const isMatch = toyStore.likeToy(toy);
  if (isMatch) {
    router.push({ name: "match", params: { toyId: toy.id } });
  }
};
</script>

<template>
  <main
    class="min-h-screen bg-gradient-to-b from-sky-400 via-cyan-300 to-emerald-200 px-4 py-6"
  >
    <section class="mx-auto w-full max-w-md">
      <header class="rounded-3xl bg-white/90 p-4 shadow-lg">
        <div class="flex items-center gap-3" v-if="toyStore.myToy">
          <img
            :src="toyStore.myToy.photoUrl"
            :alt="toyStore.myToy.name"
            class="h-16 w-16 rounded-2xl object-cover"
          />
          <div>
            <p class="text-sm font-bold text-slate-600">Mon jouet</p>
            <p class="text-xl font-bold text-slate-900">
              {{ toyStore.myToy.name }}
            </p>
          </div>
        </div>
        <p class="mt-3 text-lg font-bold text-slate-900">
          Jouets restants: {{ remainingToys.length }}
        </p>
      </header>

      <section
        v-if="remainingToys.length === 0"
        class="mt-8 rounded-3xl bg-white/90 p-8 text-center shadow-xl"
      >
        <p class="text-3xl font-bold text-slate-900">
          Plus de jouets pour l'instant 😢
        </p>
        <button
          type="button"
          class="mt-6 min-h-11 rounded-full bg-fuchsia-500 px-8 py-4 text-xl font-bold text-white shadow-lg"
          @click="goBackHome"
        >
          Retour
        </button>
      </section>

      <section v-else class="mt-6">
        <SwipeStack :toys="remainingToys" @like="onLike" @dislike="onDislike" />
      </section>
    </section>
  </main>
</template>
