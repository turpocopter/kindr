<script setup lang="ts">
import { useRouter } from "vue-router";
import { useToyStore } from "@/stores/useToyStore";

const router = useRouter();
const toyStore = useToyStore();

const goToMyToy = (): void => {
  router.push({ name: "myToy" });
};

const goToBrowse = (): void => {
  router.push({ name: "browse" });
};
</script>

<template>
  <main
    class="min-h-screen bg-gradient-to-b from-purple-500 via-pink-500 to-orange-400 px-5 py-10 text-white"
  >
    <section
      class="mx-auto flex w-full max-w-md flex-col items-center rounded-3xl bg-white/20 p-6 shadow-2xl backdrop-blur-sm"
    >
      <h1 class="text-center text-5xl font-bold drop-shadow-lg">
        🧸 Kindr
      </h1>
      <p class="mt-3 text-center text-xl font-bold">
        Swipe. Match. Troque. 🤝
      </p>

      <div
        v-if="toyStore.myToy"
        class="mt-8 w-full rounded-3xl bg-white/90 p-4 text-slate-900 shadow-xl"
      >
        <img
          :src="toyStore.myToy.photoUrl"
          :alt="toyStore.myToy.name"
          class="h-52 w-full rounded-2xl object-cover"
        />
        <p class="mt-3 text-center text-2xl font-bold">
          {{ toyStore.myToy.name }}
        </p>
      </div>

      <button
        v-if="!toyStore.myToy"
        type="button"
        class="mt-10 min-h-11 rounded-full bg-yellow-300 px-8 py-4 text-2xl font-bold text-slate-900 shadow-lg transition hover:scale-[1.02]"
        @click="goToMyToy"
      >
        Ajouter mon jouet
      </button>

      <button
        v-else
        type="button"
        class="mt-8 min-h-11 rounded-full bg-emerald-300 px-8 py-4 text-2xl font-bold text-slate-900 shadow-lg transition hover:scale-[1.02]"
        @click="goToBrowse"
      >
        Parcourir les jouets
      </button>

      <section
        v-if="toyStore.likedToys.length > 0"
        class="mt-8 w-full rounded-3xl bg-white/90 p-5 text-slate-900 shadow-xl"
      >
        <h2 class="mb-4 text-xl font-bold text-fuchsia-700">
          ❤️ Jouets mis de côté ({{ toyStore.likedToys.length }})
        </h2>
        <ul class="flex flex-col gap-3">
          <li
            v-for="toy in toyStore.likedToys"
            :key="toy.id"
            class="flex items-center gap-4 rounded-2xl bg-fuchsia-50 p-3 shadow"
          >
            <img
              :src="toy.photoUrl"
              :alt="toy.name"
              class="h-16 w-16 rounded-2xl object-cover"
            />
            <p class="text-lg font-bold">{{ toy.name }}</p>
          </li>
        </ul>
      </section>
    </section>
  </main>
</template>
