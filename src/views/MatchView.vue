<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import type { Ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import confetti from "canvas-confetti";
import { useToyStore } from "@/stores/useToyStore";

type WhereOption = "ecole" | "nounou" | "parc";
type WhenOption = "matin" | "midi" | "soir";

type WhereCard = {
  key: WhereOption;
  label: string;
  image: string;
};

type WhenCard = {
  key: WhenOption;
  label: string;
  image: string;
};

const route = useRoute();
const router = useRouter();
const toyStore = useToyStore();

const whereOptions: readonly WhereCard[] = [
  { key: "ecole", label: "École", image: "/where/ecole.png" },
  { key: "nounou", label: "Nounou", image: "/where/nounou.png" },
  { key: "parc", label: "Parc", image: "/where/parc.png" },
];

const whenOptions: readonly WhenCard[] = [
  { key: "matin", label: "Matin", image: "/when/matin.png" },
  { key: "midi", label: "Midi", image: "/when/midi.png" },
  { key: "soir", label: "Soir", image: "/when/soir.png" },
];

const selectedWhere = ref<WhereOption | null>(null);
const selectedWhen = ref<WhenOption | null>(null);
const confettiCanvas: Ref<HTMLCanvasElement | null> = ref(null);

const selectWhere = (option: WhereOption): void => {
  selectedWhere.value = option;
};

const selectWhen = (option: WhenOption): void => {
  selectedWhen.value = option;
};

onMounted(async () => {
  try {
    if (!toyStore.isAuthenticated) {
      await toyStore.initialize();
    }

    if (!toyStore.isAuthenticated) {
      const homeRoute = { name: "home" };
      await router.replace(homeRoute);
    }
  } catch (error) {
    console.error("Failed to initialize match page", error);
  } finally {
    // Intentionally empty: explicit lifecycle finalization.
  }
});

const matchToy = computed(() => {
  const toyId = String(route.params.toyId);
  return toyStore.matches.find((toy) => toy.id === toyId) ?? null;
});

const continueBrowsing = async (): Promise<void> => {
  try {
    const browseRoute = { name: "browse" };
    await router.push(browseRoute);
  } catch (error) {
    console.error("Failed to continue browsing", error);
  } finally {
    // Intentionally empty: explicit action finalization.
  }
};

onMounted(() => {
  if (!confettiCanvas.value) {
    return;
  }

  const canvas = confettiCanvas.value;
  const myConfetti = confetti.create(canvas, {
    resize: true,
    useWorker: false,
  });
  const end = Date.now() + 2500;

  const frame = (): void => {
    myConfetti({
      particleCount: 6,
      angle: 60,
      spread: 70,
      origin: { x: 0, y: 0.6 },
      colors: ["#f0abfc", "#fbbf24", "#34d399", "#60a5fa", "#f87171"],
    });
    myConfetti({
      particleCount: 6,
      angle: 120,
      spread: 70,
      origin: { x: 1, y: 0.6 },
      colors: ["#f0abfc", "#fbbf24", "#34d399", "#60a5fa", "#f87171"],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
});
</script>

<template>
  <main
    class="relative min-h-screen w-full touch-pan-y overflow-hidden bg-blue-500 px-4 py-8"
  >
    <section
      class="relative mx-auto w-full max-w-3xl rounded-3xl bg-slate-50 p-6 text-center shadow-2xl ring-4 ring-yellow-400"
    >
      <h1 class="animate-bounce text-5xl font-bold text-red-500">
        🎉 C'est un match !
      </h1>

      <div
        v-if="toyStore.myToy && matchToy"
        class="mt-8 grid grid-cols-2 gap-4"
      >
        <article class="rounded-3xl bg-yellow-100 p-3 shadow-lg">
          <p class="text-sm font-bold text-slate-700">Ton jouet</p>
          <img
            :src="toyStore.myToy.photoUrl"
            alt="Mon jouet"
            class="mt-2 h-40 w-full rounded-2xl object-cover"
          />
        </article>

        <article class="rounded-3xl bg-blue-100 p-3 shadow-lg">
          <p class="text-sm font-bold text-slate-700">Jouet matché</p>
          <img
            :src="matchToy.photoUrl"
            alt="Jouet matché"
            class="mt-2 h-40 w-full rounded-2xl object-cover"
          />
        </article>
      </div>

      <p v-else class="mt-8 text-2xl font-bold text-slate-900">
        Impossible d'afficher le match pour l'instant.
      </p>

      <section
        class="mt-8 rounded-3xl bg-slate-50 p-5 text-left ring-2 ring-blue-200"
      >
        <h2 class="text-center text-2xl font-extrabold text-blue-700">
          📦 Récupérer le jouet
        </h2>

        <div class="mt-5">
          <p
            class="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700 text-center"
          >
            Où ?
          </p>
          <div class="grid grid-cols-3 gap-3">
            <button
              v-for="option in whereOptions"
              :key="option.key"
              type="button"
              class="flex transform flex-col items-center rounded-2xl p-3 text-center ring-2 transition duration-200"
              :class="
                selectedWhere === option.key
                  ? 'ring-blue-500 bg-blue-50 shadow-lg'
                  : 'ring-transparent bg-slate-100'
              "
              @click="selectWhere(option.key)"
            >
              <img
                :src="option.image"
                :alt="option.label"
                class="h-20 w-full rounded-xl object-cover"
              />
              <span class="mt-2 text-sm font-bold text-slate-700">{{
                option.label
              }}</span>
            </button>
          </div>
        </div>

        <div class="mt-5">
          <p
            class="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700 text-center"
          >
            Quand ?
          </p>
          <div class="grid grid-cols-3 gap-3">
            <button
              v-for="option in whenOptions"
              :key="option.key"
              type="button"
              class="flex transform flex-col items-center rounded-2xl p-3 text-center ring-2 transition duration-200"
              :class="
                selectedWhen === option.key
                  ? 'ring-blue-500 bg-blue-50 shadow-lg'
                  : 'ring-transparent bg-slate-100'
              "
              @click="selectWhen(option.key)"
            >
              <img
                :src="option.image"
                :alt="option.label"
                class="h-20 w-full rounded-xl object-cover"
              />
              <span class="mt-2 text-sm font-bold text-slate-700">{{
                option.label
              }}</span>
            </button>
          </div>
        </div>
      </section>

      <button
        type="button"
        class="mt-8 min-h-11 rounded-full bg-green-500 px-8 py-4 text-2xl font-bold text-white shadow-lg"
        @click="continueBrowsing"
      >
        Continuer à parcourir
      </button>
    </section>
    <canvas
      ref="confettiCanvas"
      class="pointer-events-none absolute inset-0 z-50 h-full w-full"
    />
  </main>
</template>
