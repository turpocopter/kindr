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
      <header class="rounded-3xl bg-[#FFEA00] p-5 shadow-lg">
        <div class="grid grid-cols-3 items-center">
          <!-- Col 1 : bouton retour -->
          <div class="flex justify-start">
            <button
              type="button"
              class="btn-plastic-blue flex shrink-0 items-center gap-1 rounded-xl bg-blue-500 px-5 py-3 text-xl font-bold text-white transition active:scale-95 active:translate-y-1"
              @click="goBackHome"
            >
              🏠
            </button>
          </div>

          <!-- Col 2 : photo du jouet -->
          <div class="flex justify-center">
            <template v-if="toyStore.myToy">
              <img
                :src="toyStore.myToy.photoUrl"
                alt="Mon jouet"
                class="h-14 w-14 rounded-full object-cover shadow-md ring-2 ring-white"
              />
            </template>
          </div>

          <!-- Col 3 : panier + emojis -->
          <div class="grid grid-cols-2 items-center">
            <!-- panier -->
            <div class="flex justify-center">
              <template v-if="toyStore.myToy">
                <h3 class="text-2xl font-bold">🧺</h3>
              </template>
            </div>
            <!-- emojis -->
            <div class="flex flex-wrap justify-start">
              <template v-if="toyStore.myToy">
                <span
                  class="text-sm"
                  v-for="index in toyStore.likedToys.length"
                  :key="'like-' + index"
                  >❤️</span
                >
                <span
                  class="text-sm"
                  v-for="index in toyStore.dislikedToyIds.length"
                  :key="'dislike-' + index"
                  >😢</span
                >
                <span
                  v-for="index in remainingToys.length"
                  :key="'rem-' + index"
                  >●</span
                >
              </template>
            </div>
          </div>
        </div>
        <p v-if="toyStore.errorMessage" class="mt-2 text-center text-xs font-bold text-red-600">
          {{ toyStore.errorMessage }}
        </p>
      </header>

      <section
        v-if="remainingToys.length === 0"
        class="mt-8 rounded-3xl bg-[#FFEA00] p-8 text-center shadow-xl"
      >
        <p class="mt-3 text-5xl font-bold text-slate-900">
          🏁
        </p>

        <template v-if="toyStore.dislikedToyIds.length > 0">
          <div class="mt-10 flex gap-4">
            <button
              type="button"
              class="btn-plastic-green w-full min-h-14 rounded-xl bg-green-500 py-4 text-2xl font-bold text-white transition active:scale-95 active:translate-y-1"
              @click="resetDisliked()"
            >
              😢❓
            </button>
            <button
              type="button"
              class="btn-plastic-blue w-full min-h-14 rounded-xl bg-blue-500 py-4 text-2xl font-bold text-white transition active:scale-95 active:translate-y-1"
              @click="toyStore.initialize()"
            >
              🔄
            </button>
          </div>
        </template>

        <template v-else>
          <p class="mt-2 text-base text-slate-500">
            ⏳
          </p>
          <div class="mt-10">
            <button
              type="button"
              class="btn-plastic-blue w-full min-h-14 rounded-xl bg-blue-500 py-4 text-2xl font-bold text-white transition active:scale-95 active:translate-y-1"
              @click="toyStore.initialize()"
            >
              🔄
            </button>
          </div>
        </template>
      </section>

      <section v-else class="mt-6">
        <SwipeStack :toys="remainingToys" @like="onLike" @dislike="onDislike" />
      </section>
    </section>
  </main>
</template>

<style scoped>
.btn-plastic-red {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  background-color: #ef4444;
  color: white;
  box-shadow:
    0 4px 0 #991b1b,
    0 5px 7px rgba(0, 0, 0, 0.2),
    inset 0 -2px 0 rgba(0, 0, 0, 0.15);
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.3);
  background-image: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.45) 0%,
    rgba(255, 255, 255, 0) 55%
  );
}

.btn-plastic-red:active {
  box-shadow:
    0 1px 0 #991b1b,
    0 2px 4px rgba(0, 0, 0, 0.15),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
}

.btn-plastic-blue {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  background-color: #3b82f6;
  color: white;
  box-shadow:
    0 4px 0 #1d4ed8,
    0 5px 7px rgba(0, 0, 0, 0.2),
    inset 0 -2px 0 rgba(0, 0, 0, 0.15);
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.3);
  background-image: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.45) 0%,
    rgba(255, 255, 255, 0) 55%
  );
}

.btn-plastic-blue:active {
  box-shadow:
    0 1px 0 #1d4ed8,
    0 2px 4px rgba(0, 0, 0, 0.15),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
}

.btn-plastic-green {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  background-color: #22c55e;
  color: white;
  box-shadow:
    0 4px 0 #15803d,
    0 5px 7px rgba(0, 0, 0, 0.2),
    inset 0 -2px 0 rgba(0, 0, 0, 0.15);
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.3);
  background-image: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.45) 0%,
    rgba(255, 255, 255, 0) 55%
  );
}

.btn-plastic-green:active {
  box-shadow:
    0 1px 0 #15803d,
    0 2px 4px rgba(0, 0, 0, 0.15),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
}
</style>
