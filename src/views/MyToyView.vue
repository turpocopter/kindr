<script setup lang="ts">
import { onMounted } from "vue";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useToyStore } from "@/stores/useToyStore";

const router = useRouter();
const toyStore = useToyStore();

const selectedFile = ref<File | null>(null);
const photoPreview = ref<string>("");
const photoConfirmed = ref<boolean>(false);
const isSaving = ref<boolean>(false);
const fileInput = ref<HTMLInputElement | null>(null);

onMounted(async () => {
  if (!toyStore.isAuthenticated) {
    await toyStore.initialize();
  }

  if (!toyStore.isAuthenticated) {
    await router.replace({ name: "home" });
  }
});

const onFileChange = (event: Event): void => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0] ?? null;
  selectedFile.value = file;
  photoConfirmed.value = false;
  if (!file) {
    photoPreview.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === "string") {
      photoPreview.value = reader.result;
    }
  };
  reader.readAsDataURL(file);
};

const confirmPhoto = (): void => {
  photoConfirmed.value = true;
};

const retakePhoto = (): void => {
  selectedFile.value = null;
  photoPreview.value = "";
  photoConfirmed.value = false;
  if (fileInput.value) {
    fileInput.value.value = "";
    fileInput.value.click();
  }
};

const saveToy = async (): Promise<void> => {
  if (!selectedFile.value || !photoPreview.value) {
    return;
  }

  isSaving.value = true;
  toyStore.clearError();
  try {
    await toyStore.createMyToy(selectedFile.value);
    await router.push({ name: "browse" });
  } catch {
    // Error message is already exposed by the store for the UI.
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <main
    class="min-h-screen bg-gradient-to-b from-orange-400 via-amber-300 to-yellow-200 px-5 py-8"
  >
    <section
      class="mx-auto w-full max-w-md rounded-3xl bg-[#FFEA00] p-6 shadow-2xl"
    >
      <h1 class="text-center text-4xl font-bold text-slate-900">Ton jouet</h1>

      <label
        v-if="!photoPreview"
        for="toy-photo"
        class="toy-btn-plastic mt-8 flex min-h-11 w-full cursor-pointer flex-col items-center justify-center rounded-xl bg-yellow-400 px-8 py-10 text-center text-3xl font-bold text-white"
      >
        <span class="text-5xl">📷</span>
      </label>
      <input
        id="toy-photo"
        ref="fileInput"
        type="file"
        accept="image/*"
        capture="environment"
        class="hidden"
        @change="onFileChange"
      />

      <img
        v-if="photoPreview"
        :src="photoPreview"
        alt="Preview du jouet"
        class="mt-6 h-64 w-full rounded-3xl object-cover shadow-md"
      />

      <div
        v-if="photoPreview && !photoConfirmed"
        class="mt-4 flex gap-3"
      >
        <button
          type="button"
          class="btn-plastic-red min-h-16 flex-1 rounded-xl bg-red-500 px-6 py-5 text-3xl font-bold text-white transition active:scale-95 active:translate-y-1"
          @click="retakePhoto"
        >
          🔄
        </button>
        <button
          type="button"
          class="btn-plastic-green min-h-16 flex-1 rounded-xl bg-green-500 px-6 py-5 text-3xl font-bold text-white transition active:scale-95 active:translate-y-1"
          @click="confirmPhoto"
        >
          ✅
        </button>
      </div>

      <template v-if="photoConfirmed">
        <p v-if="toyStore.errorMessage" class="mt-4 text-sm font-bold text-red-600">
          {{ toyStore.errorMessage }}
        </p>

        <button
          type="button"
          class="btn-plastic-green mt-7 min-h-11 w-full rounded-xl bg-green-500 px-8 py-4 text-2xl font-bold text-white transition active:scale-95 active:translate-y-1 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isSaving"
          @click="saveToy"
        >
          🚀
        </button>
      </template>
    </section>
  </main>
</template>

<style scoped>
.toy-btn-plastic {
  position: relative;
  overflow: hidden;
  color: white;
  box-shadow:
    0 4px 0 #ca8a04,
    0 5px 7px rgba(0, 0, 0, 0.2),
    inset 0 -2px 0 rgba(0, 0, 0, 0.15);
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.4);
  background-image: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.45) 0%,
    rgba(255, 255, 255, 0) 55%
  );
}

.toy-btn-plastic:active {
  box-shadow:
    0 1px 0 #ca8a04,
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
</style>
