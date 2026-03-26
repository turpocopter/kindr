<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useToyStore } from "@/stores/useToyStore";

const router = useRouter();
const toyStore = useToyStore();

const AVATARS = [
  "🦊",
  "🐻",
  "🐼",
  "🐨",
  "🐯",
  "🦁",
  "🐸",
  "🐧",
  "🦄",
  "🐲",
  "🦋",
  "🌈",
  "⭐",
  "🎈",
  "🚀",
  "🎵",
  "🌺",
  "🍦",
  "🎮",
  "🏆",
];

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

const goToLikedToy = async (toyId: string): Promise<void> => {
  try {
    await toyStore.unlikeToy(toyId);
    router.push({ name: "browse", query: { featuredToyId: toyId } });
  } catch {
    router.push({ name: "browse" });
  }
};
</script>

<template>
  <main class="min-h-screen bg-blue-500 px-5 py-10 text-white">
    <section
      class="mx-auto flex w-full max-w-md flex-col items-center rounded-3xl bg-[#FFEA00] p-6 shadow-xl"
    >
      <img
        src="/logo.png"
        alt="Logo"
        class="h-36 w-auto object-contain drop-shadow-lg"
      />

      <!-- Écran de sélection de profil -->
      <section
        v-if="!toyStore.isAuthenticated"
        class="mt-6 w-full rounded-3xl bg-transparent p-5 text-slate-900"
      >
        <h2 class="text-center text-2xl font-bold text-red-500">
          🔑 Connexion
        </h2>

        <p
          v-if="authError || toyStore.errorMessage"
          class="mt-3 text-sm font-bold text-red-600 text-center"
        >
          {{ authError || toyStore.errorMessage }}
        </p>

        <!-- Profils existants -->
        <div
          v-if="toyStore.storedProfiles.length > 0 && !showNewProfileForm"
          class="mt-4 flex flex-wrap justify-center gap-4"
        >
          <button
            v-for="profile in toyStore.storedProfiles"
            :key="profile.userId"
            type="button"
            class="flex flex-col items-center gap-2 transition active:scale-95"
            @click="loginWithProfile(profile.userId)"
          >
            <div
              class="flex flex-col items-center justify-center gap-1 rounded-full bg-red-500 text-white shadow-lg"
              style="width: 150px; height: 150px"
            >
              <span class="text-6xl leading-none">{{ profile.avatar }}</span>
              <span
                class="text-xs font-bold text-white truncate w-full text-center px-2"
                >{{ profile.prenom }}</span
              >
            </div>
          </button>
        </div>

        <!-- Formulaire nouveau profil -->
        <div v-if="showNewProfileForm" class="mt-4">
          <input
            v-model="newPrenom"
            type="text"
            placeholder="Ton prénom..."
            maxlength="20"
            class="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-2xl font-bold text-center outline-none focus:border-blue-500"
          />

          <div class="mt-4 max-h-48 overflow-y-auto">
            <div class="grid grid-cols-3 gap-x-1 gap-y-3 justify-items-center">
              <button
                v-for="emoji in AVATARS"
                :key="emoji"
                type="button"
                class="flex items-center justify-center rounded-full transition active:scale-95"
                style="width: 70px; height: 70px; font-size: 40px"
                :class="
                  newAvatar === emoji
                    ? 'bg-red-500 ring-2 ring-red-700 scale-110'
                    : 'bg-white shadow'
                "
                @click="selectAvatar(emoji)"
              >
                {{ emoji }}
              </button>
            </div>
          </div>

          <div class="mt-6 flex flex-col gap-3">
            <button
              type="button"
              class="btn-plastic-green w-full min-h-14 py-4 rounded-xl bg-green-500 text-2xl font-bold text-white transition active:scale-95 active:translate-y-1 disabled:opacity-60"
              :disabled="authLoading || !newPrenom.trim() || !newAvatar"
              @click="createProfile"
            >
              {{ authLoading ? "..." : "C'est parti ! 🎉" }}
            </button>
            <button
              type="button"
              class="btn-plastic-red w-full min-h-14 py-4 rounded-xl bg-red-500 text-2xl font-bold text-white transition active:scale-95 active:translate-y-1"
              @click="
                showNewProfileForm = false;
                newPrenom = '';
                newAvatar = '';
              "
            >
              Annuler
            </button>
          </div>
        </div>

        <!-- Bouton nouveau profil -->
        <button
          v-if="!showNewProfileForm"
          type="button"
          class="btn-plastic-green mt-10 w-full min-h-14 py-4 rounded-xl bg-green-500 text-2xl font-bold text-white transition active:scale-95 active:translate-y-1"
          @click="showNewProfileForm = true"
        >
          <span class="relative z-10">✚ Nouveau profil</span>
        </button>
      </section>

      <!-- Connecté -->
      <section v-else class="mt-6 w-full">
        <div
          class="rounded-full bg-red-500 text-white shadow flex flex-col items-center justify-center gap-3 mx-auto"
          style="width: 260px; height: 260px"
        >
          <div
            class="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-inner text-6xl"
          >
            {{ toyStore.currentProfile?.avatar }}
          </div>
          <p class="text-3xl font-bold text-white">
            {{ toyStore.currentProfile?.prenom }}
          </p>
          <button
            type="button"
            class="mt-2 rounded-full bg-white px-6 py-2 text-sm font-bold text-red-500 disabled:opacity-60"
            :disabled="authLoading"
            @click="signOut"
          >
            🚪 Déconnexion
          </button>
        </div>
      </section>

      <div
        v-if="toyStore.isAuthenticated && toyStore.myToy"
        class="mt-8 w-full rounded-3xl bg-slate-50 p-4 text-slate-900 shadow-xl"
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
        class="toy-btn-plastic mt-20 min-h-11 rounded-xl bg-yellow-400 px-8 py-4 text-2xl font-bold text-slate-900 transition active:scale-95 active:translate-y-1"
        @click="goToMyToy"
      >
        ✚ Ajouter mon jouet
      </button>

      <section
        v-if="toyStore.matches.length > 0"
        class="mt-8 w-full rounded-3xl bg-slate-50 p-5 text-slate-900 shadow-xl ring-2 ring-yellow-400"
      >
        <h2 class="mb-4 text-xl font-bold text-blue-700">
          🎉 Tes matches ({{ toyStore.matches.length }})
        </h2>
        <ul class="flex flex-col gap-3">
          <li
            v-for="toy in toyStore.matches"
            :key="toy.id"
            class="flex cursor-pointer items-center gap-4 rounded-2xl bg-blue-100 p-3 shadow transition hover:scale-[1.01]"
            @click="router.push({ name: 'match', params: { toyId: toy.id } })"
          >
            <img
              :src="toy.photoUrl"
              alt="Jouet matche"
              class="h-16 w-16 rounded-2xl object-cover"
            />
            <div>
              <p class="text-sm text-blue-700 font-semibold">
                Voir le match ✨
              </p>
            </div>
          </li>
        </ul>
      </section>

      <section
        v-if="toyStore.likedToys.length > 0"
        class="mt-8 w-full rounded-3xl bg-slate-50 p-5 text-slate-900 shadow-xl"
      >
        <h2 class="mb-4 text-xl font-bold text-blue-700">
          ❤️ Jouets mis de côté ({{ toyStore.likedToys.length }})
        </h2>
        <ul class="grid grid-cols-3 gap-3">
          <li
            v-for="toy in toyStore.likedToys"
            :key="toy.id"
            class="cursor-pointer rounded-2xl bg-yellow-100 p-2 shadow transition hover:scale-[1.02]"
            @click="goToLikedToy(toy.id)"
          >
            <img
              :src="toy.photoUrl"
              alt="Jouet aimé"
              class="h-20 w-full rounded-xl object-cover"
            />
          </li>
        </ul>
      </section>

      <button
        v-if="toyStore.isAuthenticated && toyStore.myToy"
        type="button"
        class="mt-8 min-h-11 rounded-full bg-green-500 px-8 py-4 text-2xl font-bold text-white shadow-lg transition hover:scale-[1.02]"
        @click="goToBrowse"
      >
        🔎
      </button>
    </section>
  </main>
</template>

<style scoped>
.toy-btn-plastic {
  position: relative;
  overflow: hidden;
  background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 55%);
  box-shadow:
    0 4px 0 #ca8a04,
    0 5px 7px rgba(0, 0, 0, 0.2),
    inset 0 -2px 0 rgba(0, 0, 0, 0.15);
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.4);
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
  background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 55%);
  color: white;
  box-shadow:
    0 4px 0 #15803d,
    0 5px 7px rgba(0, 0, 0, 0.2),
    inset 0 -2px 0 rgba(0, 0, 0, 0.15);
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.3);
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
  background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 55%);
  color: white;
  box-shadow:
    0 4px 0 #991b1b,
    0 5px 7px rgba(0, 0, 0, 0.2),
    inset 0 -2px 0 rgba(0, 0, 0, 0.15);
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.3);
}

.btn-plastic-red:active {
  box-shadow:
    0 1px 0 #991b1b,
    0 2px 4px rgba(0, 0, 0, 0.15),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
}
</style>
