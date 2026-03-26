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
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="flex shrink-0 items-center gap-1 rounded-full bg-fuchsia-500 px-3 py-2 text-sm font-bold text-white shadow hover:bg-fuchsia-600"
            @click="goBackHome"
          >
            ← Accueil
          </button>
          <template v-if="toyStore.myToy">
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <img
                :src="toyStore.myToy.photoUrl"
                :alt="toyStore.myToy.name"
                class="h-10 w-10 shrink-0 rounded-xl object-cover"
              />
              <p class="truncate text-sm font-bold text-slate-900">
                {{ toyStore.myToy.name }}
              </p>
            </div>
            <div class="shrink-0 text-right">
              <p class="text-xs font-bold text-slate-500">Restants</p>
              <p class="text-xl font-bold text-slate-900">{{ remainingToys.length }}</p>
            </div>
          </template>
        </div>
        <p class="mt-2 text-center text-xs font-bold text-slate-500">
          ❤️ {{ toyStore.likedToys.length }} mis de côté
        </p>
      </header>

      <section
        v-if="remainingToys.length === 0"
        class="mt-8 rounded-3xl bg-white/90 p-8 text-center shadow-xl"
      >
        <p class="text-4xl">😢</p>
        <p class="mt-3 text-2xl font-bold text-slate-900">
          Tu as tout parcouru !
        </p>

        <template v-if="toyStore.dislikedToyIds.length > 0">
          <p class="mt-2 text-base text-slate-500">
            Tu as refusé {{ toyStore.dislikedToyIds.length }} jouet{{ toyStore.dislikedToyIds.length > 1 ? 's' : '' }}. Tu veux les revoir ?
          </p>
          <button
            type="button"
            class="mt-6 min-h-11 rounded-full bg-emerald-400 px-8 py-4 text-xl font-bold text-slate-900 shadow-lg transition hover:scale-[1.02]"
            @click="toyStore.resetDisliked()"
          >
            🔄 Revoir les refusés
          </button>
          <button
            type="button"
            class="mt-3 min-h-11 rounded-full bg-fuchsia-500 px-8 py-4 text-xl font-bold text-white shadow-lg"
            @click="goBackHome"
          >
            Retour à l'accueil
          </button>
        </template>

        <template v-else>
          <p class="mt-2 text-base text-slate-500">
            Reviens plus tard pour de nouveaux jouets !
          </p>
          <button
            type="button"
            class="mt-6 min-h-11 rounded-full bg-fuchsia-500 px-8 py-4 text-xl font-bold text-white shadow-lg"
            @click="goBackHome"
          >
            Retour à l'accueil
          </button>
        </template>
      </section>

      <section v-else class="mt-6">
        <SwipeStack :toys="remainingToys" @like="onLike" @dislike="onDislike" />
      </section>
    </section>
  </main>
</template>
