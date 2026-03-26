<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import SwipeStack from "@/components/SwipeStack.vue";
import { useToyStore } from "@/stores/useToyStore";
import type { Toy } from "@/types/toy";
import { useSound } from '@vueuse/sound'
import notAnymore from '@/assets/notAnymore.mp3'
import again from '@/assets/again.mp3'


const router = useRouter();
const toyStore = useToyStore();
const reactionLoading = ref<boolean>(false);
const notAnymoreSound = useSound(notAnymore, { volume: 1 });
const againSound = useSound(again, { volume: 1 });

onMounted(async () => {
  if (!toyStore.isAuthenticated) {
    await toyStore.initialize();
  }

  if (!toyStore.isAuthenticated || !toyStore.myToy) {
    await router.replace({ name: "home" });
  }
});

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

const resetDisliked = (): void => {
  againSound.play();
  toyStore.resetDisliked();
}

const playNotAnymoreSound = async () => {
  console.log("playing sound");
  await setTimeout(() => notAnymoreSound.play(), 1000);
}

const onDislike = async (toy: Toy): Promise<void> => {
  if (reactionLoading.value) {
    return;
  }

  reactionLoading.value = true;
  try {
    await toyStore.dislikeToy(toy.id);
  } catch {
    // Store state keeps the latest error message.
  } finally {
    if (remainingToys.value.length == 0) {
      playNotAnymoreSound();
    }
    reactionLoading.value = false;
  }
};

const onLike = async (toy: Toy): Promise<void> => {
  if (reactionLoading.value) {
    return;
  }

  reactionLoading.value = true;
  try {
    const isMatch = await toyStore.likeToy(toy);
    if (isMatch) {
      router.push({ name: "match", params: { toyId: toy.id } });
    }
  } catch {
    // Store state keeps the latest error message.
  } finally {
    if (remainingToys.value.length == 0) {
      playNotAnymoreSound();
    }
    reactionLoading.value = false;
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
            class="flex shrink-0 items-center gap-1 rounded-full bg-fuchsia-500 px-3 py-2 text-m font-bold text-white shadow hover:bg-fuchsia-600"
            @click="goBackHome"
          >
            ← 🏠
          </button>
          <template v-if="toyStore.myToy">
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <img
                :src="toyStore.myToy.photoUrl"
                alt="Mon jouet"
                class="h-10 w-10 shrink-0 rounded-xl object-cover"
              />
            </div>
            <div class="shrink-0 text-right">
              <h3 class="text-m font-bold text-slate-500">🧺</h3>
              <span class="w-1/5 text-sm" v-for="index in toyStore.likedToys.length" :key="index">❤️</span>
              <span class="w-1/5 text-sm" v-for="index in toyStore.dislikedToyIds.length" :key="index">😢</span>
              <span class="w-1/5" v-for="index in remainingToys.length" :key="index">●</span>
            </div>
          </template>
        </div>
        <p v-if="toyStore.errorMessage" class="mt-2 text-center text-xs font-bold text-red-600">
          {{ toyStore.errorMessage }}
        </p>
      </header>

      <section
        v-if="remainingToys.length === 0"
        class="mt-8 rounded-3xl bg-white/90 p-8 text-center shadow-xl"
      >
        <p class="mt-3 text-5xl font-bold text-slate-900">
           🏁
        </p>

        <template v-if="toyStore.dislikedToyIds.length > 0">
          <button
            type="button"
            class="mt-6 min-h-11 rounded-full bg-emerald-400 px-8 py-4 text-xl font-bold text-slate-900 shadow-lg transition hover:scale-[1.02]"
            @click="resetDisliked()"
          >
            🔄
          </button>
          <button
            type="button"
            class="mt-3 min-h-11 rounded-full bg-fuchsia-500 px-8 py-4 text-xl font-bold text-white shadow-lg"
            @click="goBackHome"
          >
            ← 🏠
          </button>
        </template>

        <template v-else>
          <p class="mt-2 text-base text-slate-500">
            ⏳
          </p>
          <button
            type="button"
            class="mt-6 min-h-11 rounded-full bg-fuchsia-500 px-8 py-4 text-xl font-bold text-white shadow-lg"
            @click="goBackHome"
          >
            ← 🏠
          </button>
        </template>
      </section>

      <section v-else class="mt-6">
        <SwipeStack :toys="remainingToys" @like="onLike" @dislike="onDislike" />
      </section>
    </section>
  </main>
</template>
