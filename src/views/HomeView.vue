<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useToyStore } from "@/stores/useToyStore";
import trokindrLogo from '../assets/trokindr-logo.png'

const router = useRouter();
const toyStore = useToyStore();

const AVATARS = ["🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐸", "🐧", "🦄", "🐲", "🦋", "🌈", "⭐", "🎈", "🚀", "🎵", "🌺", "🍦", "🎮", "🏆"];

const showNewProfileForm = ref<boolean>(false);
const newPrenom = ref<string>("");
const newAvatar = ref<string>("");
const authLoading = ref<boolean>(false);
const authError = ref<string>("");

onMounted(async () => {
  if (!toyStore.session) {
    await toyStore.initialize();
  }
});

const selectAvatar = (avatar: string): void => {
  newAvatar.value = avatar;
};

const createProfile = async (): Promise<void> => {
  authLoading.value = true;
  authError.value = "";
  toyStore.clearError();
  try {
    await toyStore.createProfile(newPrenom.value.trim(), newAvatar.value);
    showNewProfileForm.value = false;
    newPrenom.value = "";
    newAvatar.value = "";
  } catch (error) {
    authError.value = error instanceof Error ? error.message : "Erreur";
  } finally {
    authLoading.value = false;
  }
};

const loginWithProfile = async (userId: string): Promise<void> => {
  authLoading.value = true;
  authError.value = "";
  toyStore.clearError();
  try {
    await toyStore.loginWithProfile(userId);
  } catch (error) {
    authError.value = error instanceof Error ? error.message : "Erreur";
  } finally {
    authLoading.value = false;
  }
};

const signOut = async (): Promise<void> => {
  authLoading.value = true;
  authError.value = "";
  toyStore.clearError();
  try {
    await toyStore.signOut();
  } catch (error) {
    authError.value = error instanceof Error ? error.message : "Erreur";
  } finally {
    authLoading.value = false;
  }
};

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
      <img
        :src="trokindrLogo"
        alt="Logo"
        class="h-52 w-full rounded-2xl object-cover"
      />

      <!-- Écran de sélection de profil -->
      <section
        v-if="!toyStore.isAuthenticated"
        class="mt-6 w-full rounded-3xl bg-white/90 p-5 text-slate-900 shadow-xl"
      >
        <h2 class="text-center text-2xl font-bold text-fuchsia-700">C'est qui ?</h2>

        <p v-if="authError || toyStore.errorMessage" class="mt-3 text-sm font-bold text-red-600 text-center">
          {{ authError || toyStore.errorMessage }}
        </p>

        <!-- Profils existants -->
        <div
          v-if="toyStore.storedProfiles.length > 0 && !showNewProfileForm"
          class="mt-4 grid grid-cols-3 gap-3"
        >
          <button
            v-for="profile in toyStore.storedProfiles"
            :key="profile.userId"
            type="button"
            class="flex flex-col items-center gap-1 rounded-2xl bg-fuchsia-50 p-3 shadow transition hover:scale-105 active:scale-95 disabled:opacity-60"
            :disabled="authLoading"
            @click="loginWithProfile(profile.userId)"
          >
            <span class="text-5xl">{{ profile.avatar }}</span>
            <span class="text-sm font-bold text-slate-700 truncate w-full text-center">{{ profile.prenom }}</span>
          </button>
        </div>

        <!-- Formulaire nouveau profil -->
        <div v-if="showNewProfileForm" class="mt-4">
          <p class="text-center font-bold text-slate-600 mb-3">Ton prénom :</p>
          <input
            v-model="newPrenom"
            type="text"
            placeholder="Prénom..."
            maxlength="20"
            class="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-2xl font-bold text-center outline-none focus:border-fuchsia-400"
          />

          <p class="mt-4 text-center font-bold text-slate-600 mb-3">Ton avatar :</p>
          <div class="grid grid-cols-5 gap-2">
            <button
              v-for="emoji in AVATARS"
              :key="emoji"
              type="button"
              class="rounded-2xl p-2 text-3xl transition hover:scale-110 active:scale-95"
              :class="newAvatar === emoji ? 'bg-fuchsia-200 ring-2 ring-fuchsia-500 scale-110' : 'bg-slate-100'"
              @click="selectAvatar(emoji)"
            >
              {{ emoji }}
            </button>
          </div>

          <div class="mt-4 flex gap-3">
            <button
              type="button"
              class="flex-1 min-h-12 rounded-full bg-slate-200 text-base font-bold text-slate-700"
              @click="showNewProfileForm = false; newPrenom = ''; newAvatar = ''"
            >
              Annuler
            </button>
            <button
              type="button"
              class="flex-1 min-h-12 rounded-full bg-emerald-500 text-base font-bold text-white disabled:opacity-60"
              :disabled="authLoading || !newPrenom.trim() || !newAvatar"
              @click="createProfile"
            >
              {{ authLoading ? "..." : "C'est parti ! 🎉" }}
            </button>
          </div>
        </div>

        <!-- Bouton nouveau profil -->
        <button
          v-if="!showNewProfileForm"
          type="button"
          class="mt-4 w-full min-h-12 rounded-full bg-yellow-300 text-base font-bold text-slate-900 shadow transition hover:scale-[1.02]"
          @click="showNewProfileForm = true"
        >
          + Nouveau profil
        </button>
      </section>

      <!-- Connecté -->
      <section v-else class="mt-6 w-full">
        <div class="rounded-2xl bg-white/90 p-4 text-slate-900 shadow flex items-center gap-4">
          <span class="text-5xl">{{ toyStore.currentProfile?.avatar }}</span>
          <div class="flex-1">
            <p class="text-xl font-bold">{{ toyStore.currentProfile?.prenom }}</p>
          </div>
          <button
            type="button"
            class="rounded-full bg-slate-200 px-4 py-2 text-sm font-bold text-slate-700 disabled:opacity-60"
            :disabled="authLoading"
            @click="signOut"
          >
            🚪
          </button>
        </div>
      </section>

      <div
        v-if="toyStore.isAuthenticated && toyStore.myToy"
        class="mt-8 w-full rounded-3xl bg-white/90 p-4 text-slate-900 shadow-xl"
      >
        <img
          :src="toyStore.myToy.photoUrl"
          alt="Mon jouet"
          class="h-52 w-full rounded-2xl object-cover"
        />
      </div>

      <button
        v-if="toyStore.isAuthenticated && !toyStore.myToy"
        type="button"
        class="mt-10 min-h-11 rounded-full bg-yellow-300 px-8 py-4 text-2xl font-bold text-slate-900 shadow-lg transition hover:scale-[1.02]"
        @click="goToMyToy"
      >
        ✚ Ajouter mon jouet
      </button>

      <section
        v-if="toyStore.matches.length > 0"
        class="mt-8 w-full rounded-3xl bg-white/90 p-5 text-slate-900 shadow-xl ring-2 ring-yellow-300"
      >
        <h2 class="mb-4 text-xl font-bold text-fuchsia-700">
          🎉 Tes matches ({{ toyStore.matches.length }})
        </h2>
        <ul class="flex flex-col gap-3">
          <li
            v-for="toy in toyStore.matches"
            :key="toy.id"
            class="flex cursor-pointer items-center gap-4 rounded-2xl bg-fuchsia-50 p-3 shadow transition hover:scale-[1.01]"
            @click="router.push({ name: 'match', params: { toyId: toy.id } })"
          >
            <img
              :src="toy.photoUrl"
              alt="Jouet matche"
              class="h-16 w-16 rounded-2xl object-cover"
            />
            <div>
              <p class="text-sm text-fuchsia-500 font-semibold">Voir le match ✨</p>
            </div>
          </li>
        </ul>
      </section>

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
              alt="Jouet aime"
              class="h-16 w-16 rounded-2xl object-cover"
            />
          </li>
        </ul>
      </section>

      <button
        v-if="toyStore.isAuthenticated && toyStore.myToy"
        type="button"
        class="mt-8 min-h-11 rounded-full bg-emerald-300 px-8 py-4 text-2xl font-bold text-slate-900 shadow-lg transition hover:scale-[1.02]"
        @click="goToBrowse"
      >
        🔎
      </button>
    </section>
  </main>
</template>


