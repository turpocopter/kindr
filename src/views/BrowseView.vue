<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import SwipeStack from "@/components/SwipeStack.vue";
import { useToyStore } from "@/stores/useToyStore";
import type { Toy } from "@/types/toy";

const route = useRoute();
const router = useRouter();
const toyStore = useToyStore();
const reactionLoading = ref<boolean>(false);
const isDeletingToy = ref<boolean>(false);

onMounted(async () => {
  if (!toyStore.isAuthenticated) {
    await toyStore.initialize();
  }

  if (!toyStore.isAuthenticated || !toyStore.myToy) {
    await router.replace({ name: "home" });
  }
});

const remainingToys = computed(() => {
  const featuredId = route.query.featuredToyId as string | undefined;

  const toys = toyStore.availableToys.filter(
    (toy) =>
      !toyStore.likedToyIds.includes(toy.id) &&
      !toyStore.dislikedToyIds.includes(toy.id),
  );

  if (!featuredId) {
    return toys;
  }

  const featured = toys.find((toy) => toy.id === featuredId);
  if (!featured) {
    return toys;
  }

  return [featured, ...toys.filter((toy) => toy.id !== featuredId)];
});

const goBackHome = (): void => {
  router.push({ name: "home" });
};

const deleteCurrentToy = async (): Promise<void> => {
  if (isDeletingToy.value) {
    return;
  }

  isDeletingToy.value = true;
  try {
    await toyStore.deleteMyToy();
    await router.push({ name: "myToy" });
  } catch {
    // Store state keeps the latest error message.
  } finally {
    isDeletingToy.value = false;
  }
};

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
    reactionLoading.value = false;
  }
};
</script>

<template>
  <main class="min-h-screen bg-blue-500 px-4 py-6">
    <section class="mx-auto w-full max-w-md">
      <header class="rounded-3xl bg-slate-50 p-4 shadow-lg">
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="flex shrink-0 items-center gap-1 rounded-full bg-red-500 px-3 py-2 text-m font-bold text-white shadow"
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
              <span
                class="w-1/5"
                v-for="index in remainingToys.length"
                :key="index"
                >●</span
              >
            </div>
          </template>
        </div>
        <p class="mt-2 text-center text-xs font-bold text-slate-500">
          ❤️ {{ toyStore.likedToys.length }} mis de côté
        </p>
        <button
          v-if="toyStore.myToy && toyStore.matches.length === 0"
          type="button"
          class="mt-3 w-full rounded-full bg-red-400 px-4 py-2 text-sm font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isDeletingToy"
          @click="deleteCurrentToy"
        >
          🗑 Supprimer mon jouet et en choisir un autre
        </button>
        <p
          v-if="toyStore.errorMessage"
          class="mt-2 text-center text-xs font-bold text-red-600"
        >
          {{ toyStore.errorMessage }}
        </p>
      </header>

      <section
        v-if="remainingToys.length === 0"
        class="mt-8 rounded-3xl bg-slate-50 p-8 text-center shadow-xl"
      >
        <p class="text-4xl">😢</p>
        <p class="mt-3 text-2xl font-bold text-slate-900">
          🏁 Tu as tout parcouru !
        </p>

        <template v-if="toyStore.dislikedToyIds.length > 0">
          <p class="mt-2 text-base text-slate-500">
            🙅🏻‍♀️ Tu as refusé {{ toyStore.dislikedToyIds.length }} jouet{{
              toyStore.dislikedToyIds.length > 1 ? "s" : ""
            }}. Tu veux les revoir ?
          </p>
          <button
            type="button"
            class="mt-6 min-h-11 rounded-full bg-green-500 px-8 py-4 text-xl font-bold text-slate-900 shadow-lg transition hover:scale-[1.02]"
            @click="toyStore.resetDisliked()"
          >
            🔄 Revoir les refusés
          </button>
          <button
            type="button"
            class="mt-3 min-h-11 rounded-full bg-red-500 px-8 py-4 text-xl font-bold text-white shadow-lg"
            @click="goBackHome"
          >
            ← 🏠
          </button>
        </template>

        <template v-else>
          <p class="mt-2 text-base text-slate-500">
            ⏳ Reviens plus tard pour de nouveaux jouets !
          </p>
          <button
            type="button"
            class="mt-6 min-h-11 rounded-full bg-red-500 px-8 py-4 text-xl font-bold text-white shadow-lg"
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
