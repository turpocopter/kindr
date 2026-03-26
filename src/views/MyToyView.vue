<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useToyStore } from "@/stores/useToyStore";
import type { Toy } from "@/types/toy";

const router = useRouter();
const toyStore = useToyStore();

const toyName = ref<string>("");
const selectedFile = ref<File | null>(null);
const photoPreview = ref<string>("");
const isSaving = ref<boolean>(false);

const onFileChange = (event: Event): void => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0] ?? null;
  selectedFile.value = file;
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

const saveToy = async (): Promise<void> => {
  if (!photoPreview.value || !toyName.value.trim()) {
    return;
  }

  isSaving.value = true;
  const toy: Toy = {
    id: `my-toy-${Date.now()}`,
    name: toyName.value.trim(),
    photoUrl: photoPreview.value,
    ownerId: "me",
  };

  toyStore.setMyToy(toy);
  await router.push({ name: "browse" });
  isSaving.value = false;
};
</script>

<template>
  <main
    class="min-h-screen bg-gradient-to-b from-orange-400 via-amber-300 to-yellow-200 px-5 py-8"
  >
    <section
      class="mx-auto w-full max-w-md rounded-3xl bg-white/85 p-6 shadow-2xl"
    >
      <h1 class="text-center text-4xl font-bold text-slate-900">Ton jouet</h1>

      <label
        for="toy-photo"
        class="mt-8 flex min-h-11 w-full cursor-pointer flex-col items-center justify-center rounded-full bg-fuchsia-400 px-8 py-10 text-center text-3xl font-bold text-white shadow-lg"
      >
        <span class="text-5xl">📷</span>
        <span class="mt-2 text-2xl">Prends une photo</span>
      </label>
      <input
        id="toy-photo"
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

      <input
        v-model="toyName"
        type="text"
        placeholder="Le nom de ton jouet..."
        class="mt-6 min-h-11 w-full rounded-2xl border-4 border-orange-300 px-5 py-4 text-2xl font-bold text-slate-900 outline-none focus:border-orange-500"
      />

      <button
        type="button"
        class="mt-7 min-h-11 w-full rounded-full bg-emerald-400 px-8 py-4 text-2xl font-bold text-white shadow-lg transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="!photoPreview || !toyName.trim() || isSaving"
        @click="saveToy"
      >
        C'est parti ! 🚀
      </button>
    </section>
  </main>
</template>
