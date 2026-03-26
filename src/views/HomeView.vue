<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useToyStore } from "@/stores/useToyStore";

const router = useRouter();
const toyStore = useToyStore();

const email = ref<string>("");
const password = ref<string>("");
const authLoading = ref<boolean>(false);
const authError = ref<string>("");

onMounted(async () => {
  if (!toyStore.session) {
    await toyStore.initialize();
  }
});

const signUp = async (): Promise<void> => {
  authLoading.value = true;
  toyStore.clearError();
  authError.value = "";
  try {
    await toyStore.signUp(email.value.trim(), password.value);
    await toyStore.signIn(email.value.trim(), password.value);
  } catch (error) {
    authError.value = error instanceof Error ? error.message : "Auth failed";
  } finally {
    authLoading.value = false;
  }
};

const signIn = async (): Promise<void> => {
  authLoading.value = true;
  toyStore.clearError();
  authError.value = "";
  try {
    await toyStore.signIn(email.value.trim(), password.value);
  } catch (error) {
    authError.value = error instanceof Error ? error.message : "Auth failed";
  } finally {
    authLoading.value = false;
  }
};

const signOut = async (): Promise<void> => {
  authLoading.value = true;
  toyStore.clearError();
  authError.value = "";
  try {
    await toyStore.signOut();
  } catch (error) {
    authError.value = error instanceof Error ? error.message : "Logout failed";
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
        src="/logo.png"
        alt="Logo"
        class="h-36 w-auto object-contain drop-shadow-lg"
      />

      <section
        v-if="!toyStore.isAuthenticated"
        class="mt-6 w-full rounded-3xl bg-white/90 p-5 text-slate-900 shadow-xl"
      >
        <h2 class="text-center text-xl font-bold text-fuchsia-700">🔑 Connexion</h2>
        <input
          v-model="email"
          type="email"
          placeholder="email"
          class="mt-4 min-h-11 w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-base font-semibold outline-none focus:border-fuchsia-400"
        />
        <input
          v-model="password"
          type="password"
          placeholder="mot de passe"
          class="mt-3 min-h-11 w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-base font-semibold outline-none focus:border-fuchsia-400"
        />
        <p v-if="authError || toyStore.errorMessage" class="mt-3 text-sm font-bold text-red-600">
          {{ authError || toyStore.errorMessage }}
        </p>
        <div class="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            class="min-h-11 rounded-full bg-fuchsia-500 px-4 py-3 text-base font-bold text-white disabled:opacity-60"
            :disabled="authLoading || !email.trim() || password.length < 6"
            @click="signIn"
          >
            🔑 Se connecter
          </button>
          <button
            type="button"
            class="min-h-11 rounded-full bg-emerald-500 px-4 py-3 text-base font-bold text-white disabled:opacity-60"
            :disabled="authLoading || !email.trim() || password.length < 6"
            @click="signUp"
          >
            ✍️ Creer compte
          </button>
        </div>
      </section>

      <section v-else class="mt-6 w-full">
        <div class="rounded-2xl bg-white/90 p-4 text-slate-900 shadow">
          <p class="text-sm font-bold text-slate-500">Connecte en tant que</p>
          <p class="truncate text-base font-bold">{{ toyStore.currentUser?.email }}</p>
          <button
            type="button"
            class="mt-3 min-h-11 rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white"
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
