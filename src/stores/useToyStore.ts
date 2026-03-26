import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Session } from "@supabase/supabase-js";
import type { Toy } from "@/types/toy";
import { supabase } from "@/lib/supabase";

const BYPASS_AUTH = import.meta.env.VITE_AUTH_BYPASS === "true";

const MOCK_TOYS_BYPASS: Toy[] = [
  {
    id: "mock-1",
    ownerId: "bypass-other",
    photoUrl: "https://picsum.photos/300/400?random=10",
    createdAt: "",
  },
  {
    id: "mock-2",
    ownerId: "bypass-other",
    photoUrl: "https://picsum.photos/300/400?random=20",
    createdAt: "",
  },
  {
    id: "mock-3",
    ownerId: "bypass-other",
    photoUrl: "https://picsum.photos/300/400?random=30",
    createdAt: "",
  },
  {
    id: "mock-4",
    ownerId: "bypass-other",
    photoUrl: "https://picsum.photos/300/400?random=40",
    createdAt: "",
  },
  {
    id: "mock-5",
    ownerId: "bypass-other",
    photoUrl: "https://picsum.photos/300/400?random=50",
    createdAt: "",
  },
  {
    id: "mock-6",
    ownerId: "bypass-other",
    photoUrl: "https://picsum.photos/300/400?random=60",
    createdAt: "",
  },
];

type ProductRow = {
  id: string;
  owner_id: string;
  photo_url: string;
  created_at: string;
};

type ReactionType = "like" | "dislike";

export type StoredProfile = {
  userId: string;
  prenom: string;
  avatar: string;
  accessToken: string;
  refreshToken: string;
};

const PROFILES_KEY = "kindr_profiles";

const loadStoredProfiles = (): StoredProfile[] => {
  try {
    return JSON.parse(
      localStorage.getItem(PROFILES_KEY) ?? "[]",
    ) as StoredProfile[];
  } catch {
    return [];
  }
};

const saveStoredProfiles = (profiles: StoredProfile[]): void => {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
};

const toToy = (row: ProductRow): Toy => ({
  id: row.id,
  ownerId: row.owner_id,
  photoUrl: row.photo_url,
  createdAt: row.created_at,
});

export const useToyStore = defineStore("toy", () => {
  const session = ref<Session | null>(null);
  const currentProfile = ref<StoredProfile | null>(null);
  const storedProfiles = ref<StoredProfile[]>(loadStoredProfiles());
  const isLoading = ref<boolean>(false);
  const errorMessage = ref<string>("");
  const myToy = ref<Toy | null>(null);
  const availableToys = ref<Toy[]>([]);
  const likedToyIds = ref<string[]>([]);
  const dislikedToyIds = ref<string[]>([]);
  const matches = ref<Toy[]>([]);

  const currentUser = computed(() => session.value?.user ?? null);
  const isAuthenticated = computed(() => currentUser.value !== null);

  const likedToys = computed(() =>
    availableToys.value.filter((toy) => likedToyIds.value.includes(toy.id)),
  );

  const setError = (error: unknown): void => {
    if (error instanceof Error) {
      errorMessage.value = error.message;
      return;
    }
    errorMessage.value = "Unexpected error";
  };

  const clearLocalState = (): void => {
    myToy.value = null;
    availableToys.value = [];
    likedToyIds.value = [];
    dislikedToyIds.value = [];
    matches.value = [];
  };

  const runAction = async <T>(action: () => Promise<T>): Promise<T> => {
    errorMessage.value = "";
    try {
      return await action();
    } catch (error) {
      setError(error);
      throw error;
    }
  };

  const initialize = async (): Promise<void> => {
    if (BYPASS_AUTH) {
      session.value = {
        user: {
          id: "bypass-user-id",
          email: "dev@bypass.local",
          app_metadata: {},
          user_metadata: {},
          aud: "authenticated",
          created_at: "",
        },
      } as unknown as Session;
      availableToys.value = MOCK_TOYS_BYPASS;
      isLoading.value = false;
      return;
    }

    isLoading.value = true;
    errorMessage.value = "";
    storedProfiles.value = loadStoredProfiles();

    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        throw error;
      }

      session.value = data.session;
      if (!session.value) {
        clearLocalState();
        return;
      }

      const userId = session.value.user.id;
      currentProfile.value =
        storedProfiles.value.find((p) => p.userId === userId) ?? null;

      await loadMyToy();
      await loadAvailableToys();
      await loadReactions();
    } catch (error) {
      setError(error);
    } finally {
      isLoading.value = false;
    }
  };

  const createProfile = async (
    prenom: string,
    avatar: string,
  ): Promise<void> => {
    await runAction(async () => {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) {
        throw error;
      }
      if (!data.session) {
        throw new Error("Pas de session retournée");
      }

      const newProfile: StoredProfile = {
        userId: data.session.user.id,
        prenom: prenom.trim(),
        avatar,
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
      };

      const profiles = loadStoredProfiles();
      profiles.push(newProfile);
      saveStoredProfiles(profiles);
      storedProfiles.value = profiles;

      session.value = data.session;
      currentProfile.value = newProfile;

      await loadMyToy();
      await loadAvailableToys();
      await loadReactions();
    });
  };

  const loginWithProfile = async (userId: string): Promise<void> => {
    await runAction(async () => {
      const profiles = loadStoredProfiles();
      const profile = profiles.find((p) => p.userId === userId);
      if (!profile) {
        throw new Error("Profil introuvable");
      }

      const { data, error } = await supabase.auth.setSession({
        access_token: profile.accessToken,
        refresh_token: profile.refreshToken,
      });

      if (error || !data.session) {
        // Token expiré — créer une nouvelle session anonyme et mettre à jour les tokens
        const { data: anonData, error: anonError } =
          await supabase.auth.signInAnonymously();
        if (anonError || !anonData.session) {
          throw new Error("Impossible de restaurer la session");
        }

        // Mettre à jour les tokens du profil existant
        profile.accessToken = anonData.session.access_token;
        profile.refreshToken = anonData.session.refresh_token;
        // Conserver le userId d'origine pour retrouver les données
        profile.userId = anonData.session.user.id;
        saveStoredProfiles(profiles);
        storedProfiles.value = profiles;

        session.value = anonData.session;
        currentProfile.value = profile;
      } else {
        // Mise à jour des tokens rafraîchis
        profile.accessToken = data.session.access_token;
        profile.refreshToken = data.session.refresh_token;
        saveStoredProfiles(profiles);
        storedProfiles.value = profiles;

        session.value = data.session;
        currentProfile.value = profile;
      }

      await loadMyToy();
      await loadAvailableToys();
      await loadReactions();
    });
  };

  const signOut = async (): Promise<void> => {
    await runAction(async () => {
      const { error } = await supabase.auth.signOut({ scope: "local" });
      if (error) {
        throw error;
      }

      session.value = null;
      currentProfile.value = null;
      clearLocalState();
    });
  };

  const loadMyToy = async (): Promise<void> => {
    if (!currentUser.value) {
      myToy.value = null;
      return;
    }

    const { data, error } = await supabase
      .from("products")
      .select("id, owner_id, photo_url, created_at")
      .eq("owner_id", currentUser.value.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    myToy.value = data ? toToy(data as ProductRow) : null;
  };

  const loadAvailableToys = async (): Promise<void> => {
    if (!currentUser.value) {
      availableToys.value = [];
      return;
    }

    const { data, error } = await supabase
      .from("products")
      .select("id, owner_id, photo_url, created_at")
      .neq("owner_id", currentUser.value.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      throw error;
    }

    availableToys.value = (data ?? []).map((row) => toToy(row as ProductRow));
  };

  const loadReactions = async (): Promise<void> => {
    likedToyIds.value = [];
    dislikedToyIds.value = [];
    matches.value = [];

    if (!myToy.value) {
      return;
    }

    const { data: myReactions, error: myReactionsError } = await supabase
      .from("product_reactions")
      .select("target_product_id, reaction")
      .eq("source_product_id", myToy.value.id);

    if (myReactionsError) {
      throw myReactionsError;
    }

    const likes = (myReactions ?? [])
      .filter((reaction) => reaction.reaction === "like")
      .map((reaction) => reaction.target_product_id as string);

    const dislikes = (myReactions ?? [])
      .filter((reaction) => reaction.reaction === "dislike")
      .map((reaction) => reaction.target_product_id as string);

    likedToyIds.value = likes;
    dislikedToyIds.value = dislikes;

    if (likes.length === 0) {
      return;
    }

    const { data: likesToMe, error: likesToMeError } = await supabase
      .from("product_reactions")
      .select("source_product_id")
      .eq("target_product_id", myToy.value.id)
      .eq("reaction", "like");

    if (likesToMeError) {
      throw likesToMeError;
    }

    const likedMeIds = new Set(
      (likesToMe ?? []).map((reaction) => reaction.source_product_id as string),
    );
    const matchedToyIds = likes.filter((toyId) => likedMeIds.has(toyId));

    if (matchedToyIds.length === 0) {
      return;
    }

    const { data: matchedRows, error: matchedRowsError } = await supabase
      .from("products")
      .select("id, owner_id, photo_url, created_at")
      .in("id", matchedToyIds);

    if (matchedRowsError) {
      throw matchedRowsError;
    }

    matches.value = (matchedRows ?? []).map((row) => toToy(row as ProductRow));
  };

  const uploadPhoto = async (file: File): Promise<string> => {
    if (!currentUser.value) {
      throw new Error("User must be logged in");
    }

    const extension = file.name.split(".").pop() ?? "jpg";
    const uuid =
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const objectPath = `${currentUser.value.id}/${uuid}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("toy-photos")
      .upload(objectPath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from("toy-photos")
      .getPublicUrl(objectPath);
    return data.publicUrl;
  };

  const createMyToy = async (file: File): Promise<void> => {
    if (BYPASS_AUTH) {
      myToy.value = {
        id: "mock-my-toy",
        ownerId: "bypass-user-id",
        photoUrl: URL.createObjectURL(file),
        createdAt: new Date().toISOString(),
      };
      return;
    }

    await runAction(async () => {
      if (!currentUser.value) {
        throw new Error("User must be logged in");
      }

      const photoUrl = await uploadPhoto(file);

      const { error } = await supabase.from("products").insert({
        owner_id: currentUser.value.id,
        photo_url: photoUrl,
      });

      if (error) {
        throw error;
      }

      await loadMyToy();
      await loadAvailableToys();
      await loadReactions();
    });
  };

  const deleteMyToy = async (): Promise<void> => {
    await runAction(async () => {
      if (!currentUser.value || !myToy.value) {
        throw new Error("No toy to delete");
      }

      await loadReactions();
      if (matches.value.length > 0) {
        throw new Error(
          "Tu ne peux pas supprimer un jouet qui a deja un match",
        );
      }

      const toyIdToDelete = myToy.value.id;
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", toyIdToDelete)
        .eq("owner_id", currentUser.value.id);

      if (error) {
        throw error;
      }

      myToy.value = null;
      likedToyIds.value = [];
      dislikedToyIds.value = [];
      matches.value = [];
      await loadAvailableToys();
    });
  };

  const recordReaction = async (
    targetToyId: string,
    reaction: ReactionType,
  ): Promise<boolean> => {
    if (!myToy.value) {
      throw new Error("Create your toy before reacting");
    }

    const { error } = await supabase.from("product_reactions").upsert(
      {
        source_product_id: myToy.value.id,
        target_product_id: targetToyId,
        reaction,
      },
      {
        onConflict: "source_product_id,target_product_id",
      },
    );

    if (error) {
      throw error;
    }

    if (reaction === "like") {
      if (!likedToyIds.value.includes(targetToyId)) {
        likedToyIds.value.push(targetToyId);
      }
      dislikedToyIds.value = dislikedToyIds.value.filter(
        (id) => id !== targetToyId,
      );
    } else {
      if (!dislikedToyIds.value.includes(targetToyId)) {
        dislikedToyIds.value.push(targetToyId);
      }
      likedToyIds.value = likedToyIds.value.filter((id) => id !== targetToyId);
      matches.value = matches.value.filter((toy) => toy.id !== targetToyId);
      return false;
    }

    const { data, error: reverseError } = await supabase
      .from("product_reactions")
      .select("id")
      .eq("source_product_id", targetToyId)
      .eq("target_product_id", myToy.value.id)
      .eq("reaction", "like")
      .maybeSingle();

    if (reverseError) {
      throw reverseError;
    }

    const isMatch = Boolean(data);
    if (isMatch) {
      const matchedToy = availableToys.value.find(
        (toy) => toy.id === targetToyId,
      );
      if (matchedToy && !matches.value.some((toy) => toy.id === targetToyId)) {
        matches.value.push(matchedToy);
      }
    }

    return isMatch;
  };

  const likeToy = async (toy: Toy): Promise<boolean> => {
    if (BYPASS_AUTH) {
      if (!likedToyIds.value.includes(toy.id)) {
        likedToyIds.value.push(toy.id);
      }
      const isMatch = Math.random() >= 0.5;
      if (isMatch && !matches.value.some((m) => m.id === toy.id)) {
        matches.value.push(toy);
      }
      return isMatch;
    }

    // Mise à jour optimiste synchrone
    if (!likedToyIds.value.includes(toy.id)) {
      likedToyIds.value.push(toy.id);
    }
    dislikedToyIds.value = dislikedToyIds.value.filter((id) => id !== toy.id);

    try {
      return await runAction(async () => recordReaction(toy.id, "like"));
    } catch (error) {
      // Rollback si erreur
      likedToyIds.value = likedToyIds.value.filter((id) => id !== toy.id);
      throw error;
    }
  };

  const resetDisliked = (): void => {
    dislikedToyIds.value = [];
  };

  const unlikeToy = async (toyId: string): Promise<void> => {
    if (BYPASS_AUTH) {
      likedToyIds.value = likedToyIds.value.filter((id) => id !== toyId);
      return;
    }

    // Mise à jour optimiste
    likedToyIds.value = likedToyIds.value.filter((id) => id !== toyId);

    try {
      await runAction(async () => {
        if (!myToy.value) {
          throw new Error("No toy found");
        }

        const { error } = await supabase
          .from("product_reactions")
          .delete()
          .eq("source_product_id", myToy.value.id)
          .eq("target_product_id", toyId);

        if (error) {
          throw error;
        }
      });
    } catch (error) {
      // Rollback
      if (!likedToyIds.value.includes(toyId)) {
        likedToyIds.value.push(toyId);
      }
      throw error;
    }
  };

  const dislikeToy = async (id: string): Promise<void> => {
    if (BYPASS_AUTH) {
      if (!dislikedToyIds.value.includes(id)) {
        dislikedToyIds.value.push(id);
      }
      return;
    }

    // Mise à jour optimiste synchrone
    if (!dislikedToyIds.value.includes(id)) {
      dislikedToyIds.value.push(id);
    }
    likedToyIds.value = likedToyIds.value.filter(
      (existingId) => existingId !== id,
    );

    try {
      await runAction(async () => {
        await recordReaction(id, "dislike");
      });
    } catch (error) {
      // Rollback si erreur
      dislikedToyIds.value = dislikedToyIds.value.filter(
        (existingId) => existingId !== id,
      );
      throw error;
    }
  };

  const clearError = (): void => {
    errorMessage.value = "";
  };

  supabase.auth.onAuthStateChange((_event, nextSession) => {
    session.value = nextSession;
    if (!nextSession) {
      currentProfile.value = null;
      clearLocalState();
    }
  });

  return {
    session,
    currentUser,
    currentProfile,
    storedProfiles,
    isAuthenticated,
    isLoading,
    errorMessage,
    myToy,
    availableToys,
    likedToys,
    likedToyIds,
    dislikedToyIds,
    matches,
    initialize,
    createProfile,
    loginWithProfile,
    signOut,
    loadMyToy,
    loadAvailableToys,
    loadReactions,
    createMyToy,
    deleteMyToy,
    likeToy,
    dislikeToy,
    resetDisliked,
    unlikeToy,
    clearError,
  };
});
