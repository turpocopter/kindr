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
  <main class="min-h-screen bg-blue-500 px-5 py-8">
    <section
      class="mx-auto w-full max-w-md rounded-3xl bg-slate-50 p-6 shadow-2xl"
    >
      <h1 class="text-center text-4xl font-bold text-slate-900">Ton jouet</h1>

      <label
        v-if="!photoPreview"
        for="toy-photo"
        class="mt-8 flex min-h-11 w-full cursor-pointer flex-col items-center justify-center rounded-full bg-yellow-400 px-8 py-10 text-center text-3xl font-bold text-slate-900 shadow-lg"
      >
        <span class="text-5xl">📷</span>
        <span class="mt-2 text-2xl">Prends une photo</span>
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

      <div v-if="photoPreview && !photoConfirmed" class="mt-4 flex gap-3">
        <button
          type="button"
          class="min-h-11 flex-1 rounded-full bg-red-500 px-6 py-4 text-xl font-bold text-white shadow transition hover:scale-[1.02]"
          @click="retakePhoto"
        >
          🔄 Reprendre
        </button>
        <button
          type="button"
          class="min-h-11 flex-1 rounded-full bg-green-500 px-6 py-4 text-xl font-bold text-white shadow-lg transition hover:scale-[1.02]"
          @click="confirmPhoto"
        >
          ✅ Confirmer
        </button>
      </div>

      <template v-if="photoConfirmed">
        <p
          v-if="toyStore.errorMessage"
          class="mt-4 text-sm font-bold text-red-600"
        >
          {{ toyStore.errorMessage }}
        </p>

        <button
          type="button"
          class="mt-7 min-h-11 w-full rounded-full bg-green-500 px-8 py-4 text-2xl font-bold text-white shadow-lg transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isSaving"
          @click="saveToy"
        >
          C'est parti ! 🚀
        </button>
      </template>
    </section>
  </main>
</template>
