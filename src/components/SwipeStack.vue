<script setup lang="ts">
import { computed, ref } from "vue";
import ToyCard from "@/components/ToyCard.vue";
import type { Toy } from "@/types/toy";
import { useSound } from "@vueuse/sound";
import want from "@/assets/want.mp3";
import dontWant from "@/assets/dontWant.mp3";

const SWIPE_THRESHOLD = 80;

const props = defineProps<{
  toys: Toy[];
}>();

const emit = defineEmits<{
  like: [toy: Toy];
  dislike: [toy: Toy];
}>();

const startX = ref<number>(0);
const isDragging = ref<boolean>(false);
const translateX = ref<number>(0);
const leavingDirection = ref<"left" | "right" | null>(null);
const wantSound = useSound(want, { volume: 1 });
const dontWantSound = useSound(dontWant, { volume: 1 });

const visibleCards = computed(() => props.toys.slice(0, 3));
const topCard = computed(() => visibleCards.value[0] ?? null);

// Progress 0→1 based on how far the top card has been dragged
const swipeProgress = computed(() => {
  if (leavingDirection.value) return 1;
  return Math.min(Math.abs(translateX.value) / SWIPE_THRESHOLD, 1);
});

const cardStyle = computed(() => {
  const rotation = translateX.value / 16;
  const transition = isDragging.value ? "none" : "transform 240ms ease";
  let xValue = `${translateX.value}px`;

  if (leavingDirection.value === "right") {
    xValue = "150%";
  }

  if (leavingDirection.value === "left") {
    xValue = "-150%";
  }

  return {
    transform: `translateX(${xValue}) rotate(${rotation}deg)`,
    transition,
  };
});

const backgroundCardStyle = (index: number) => {
  const progress = swipeProgress.value;
  // Interpolate from stacked position toward the position one step closer
  const fromY = index * 10;
  const toY = (index - 1) * 10;
  const fromScale = 1 - index * 0.04;
  const toScale = 1 - (index - 1) * 0.04;

  const y = fromY + (toY - fromY) * progress;
  const scale = fromScale + (toScale - fromScale) * progress;

  const transition =
    isDragging.value && !leavingDirection.value
      ? "none"
      : leavingDirection.value
        ? "transform 230ms ease"
        : "transform 240ms ease";

  return {
    transform: `translateY(${y}px) scale(${scale})`,
    transition,
  };
};

const likeOpacity = computed(() =>
  translateX.value > 0 ? Math.min(translateX.value / 120, 1) : 0,
);
const dislikeOpacity = computed(() =>
  translateX.value < 0 ? Math.min(Math.abs(translateX.value) / 120, 1) : 0,
);

const triggerAction = (direction: "left" | "right"): void => {
  const toy = topCard.value;
  if (!toy) {
    return;
  }

  leavingDirection.value = direction;
  window.setTimeout(() => {
    if (direction === "right") {
      emit("like", toy);
      wantSound.play();
    } else {
      emit("dislike", toy);
      dontWantSound.play();
    }
    leavingDirection.value = null;
    translateX.value = 0;
  }, 300);
};

const onPointerDown = (event: PointerEvent): void => {
  if (!topCard.value) {
    return;
  }
  isDragging.value = true;
  startX.value = event.clientX;
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
};

const onPointerMove = (event: PointerEvent): void => {
  if (!isDragging.value || leavingDirection.value) {
    return;
  }
  translateX.value = event.clientX - startX.value;
};

const onPointerUp = (): void => {
  if (!isDragging.value || leavingDirection.value) {
    return;
  }
  isDragging.value = false;

  if (translateX.value >= SWIPE_THRESHOLD) {
    triggerAction("right");
    return;
  }

  if (translateX.value <= -SWIPE_THRESHOLD) {
    triggerAction("left");
    return;
  }

  translateX.value = 0;
};

const likeWithButton = (): void => {
  if (!topCard.value || leavingDirection.value) {
    return;
  }
  triggerAction("right");
};

const dislikeWithButton = (): void => {
  if (!topCard.value || leavingDirection.value) {
    return;
  }
  triggerAction("left");
};
</script>

<template>
  <div class="w-full">
    <div class="relative mx-auto h-[360px] w-full max-w-[320px]">
      <div
        v-for="(toy, index) in visibleCards"
        :key="toy.id"
        class="absolute inset-0 select-none rounded-3xl overflow-hidden"
        :class="index === 0 ? 'z-30 touch-none' : index === 1 ? 'z-20' : 'z-10'"
        :style="index === 0 ? cardStyle : backgroundCardStyle(index)"
        @pointerdown="(e) => index === 0 && onPointerDown(e)"
        @pointermove="(e) => index === 0 && onPointerMove(e)"
        @pointerup="() => index === 0 && onPointerUp()"
        @pointercancel="() => index === 0 && onPointerUp()"
      >
        <ToyCard :toy="toy" />

        <div
          v-if="index === 0"
          class="pointer-events-none absolute left-4 top-5 rounded-full bg-red-500 px-4 py-2 text-2xl font-bold text-white"
          :style="{ opacity: dislikeOpacity }"
        >
          ☹️
        </div>
        <div
          v-if="index === 0"
          class="pointer-events-none absolute right-4 top-5 rounded-full bg-emerald-500 px-4 py-2 text-2xl font-bold text-white"
          :style="{ opacity: likeOpacity }"
        >
          ❤️
        </div>
      </div>
    </div>

    <div
      class="mx-auto mt-6 flex max-w-[320px] items-center justify-center gap-16"
    >
      <button
        type="button"
        class="btn-plastic-red rounded-full bg-red-500 text-5xl text-white transition active:scale-95 active:translate-y-1"
        style="width: 100px; height: 100px"
        @click="dislikeWithButton"
      >
        ☹️
      </button>
      <button
        type="button"
        class="btn-plastic-green rounded-full bg-emerald-500 text-5xl text-white transition active:scale-95 active:translate-y-1"
        style="width: 100px; height: 100px"
        @click="likeWithButton"
      >
        ❤️
      </button>
    </div>
  </div>
</template>

<style scoped>
.btn-plastic-green {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  background-color: #10b981;
  color: white;
  box-shadow:
    0 6px 0 #065f46,
    0 7px 10px rgba(0, 0, 0, 0.25),
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
    0 2px 0 #065f46,
    0 3px 5px rgba(0, 0, 0, 0.15),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
}

.btn-plastic-red {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  background-color: #ef4444;
  color: white;
  box-shadow:
    0 6px 0 #991b1b,
    0 7px 10px rgba(0, 0, 0, 0.25),
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
    0 2px 0 #991b1b,
    0 3px 5px rgba(0, 0, 0, 0.15),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
}
</style>
