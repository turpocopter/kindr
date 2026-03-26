import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Session } from "@supabase/supabase-js";
import type { Toy } from "@/types/toy";
import { supabase } from "@/lib/supabase";

const BYPASS_AUTH = import.meta.env.VITE_AUTH_BYPASS === 'true';

const MOCK_TOYS_BYPASS: Toy[] = [
  { id: 'mock-1', ownerId: 'bypass-other', photoUrl: 'https://picsum.photos/300/400?random=10', createdAt: '' },
  { id: 'mock-2', ownerId: 'bypass-other', photoUrl: 'https://picsum.photos/300/400?random=20', createdAt: '' },
  { id: 'mock-3', ownerId: 'bypass-other', photoUrl: 'https://picsum.photos/300/400?random=30', createdAt: '' },
  { id: 'mock-4', ownerId: 'bypass-other', photoUrl: 'https://picsum.photos/300/400?random=40', createdAt: '' },
  { id: 'mock-5', ownerId: 'bypass-other', photoUrl: 'https://picsum.photos/300/400?random=50', createdAt: '' },
  { id: 'mock-6', ownerId: 'bypass-other', photoUrl: 'https://picsum.photos/300/400?random=60', createdAt: '' },
];

type ProductRow = {
  id: string;
  owner_id: string;
  photo_url: string;
  created_at: string;
};

type ReactionType = "like" | "dislike";

const toToy = (row: ProductRow): Toy => ({
  id: row.id,
  ownerId: row.owner_id,
  photoUrl: row.photo_url,
  createdAt: row.created_at,
});

export const useToyStore = defineStore("toy", () => {
  const session = ref<Session | null>(null);
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
          id: 'bypass-user-id',
          email: 'dev@bypass.local',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: '',
        },
      } as unknown as Session;
      availableToys.value = MOCK_TOYS_BYPASS;
      isLoading.value = false;
      return;
    }

    isLoading.value = true;
    errorMessage.value = "";

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

      await loadMyToy();
      await loadAvailableToys();
      await loadReactions();
    } catch (error) {
      setError(error);
    } finally {
      isLoading.value = false;
    }
  };

  const signUp = async (email: string, password: string): Promise<void> => {
    await runAction(async () => {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        throw error;
      }
    });
  };

  const signIn = async (email: string, password: string): Promise<void> => {
    await runAction(async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        throw error;
      }

      session.value = data.session;
      await loadMyToy();
      await loadAvailableToys();
      await loadReactions();
    });
  };

  const signOut = async (): Promise<void> => {
    await runAction(async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }

      session.value = null;
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
    const objectPath = `${currentUser.value.id}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("toy-photos")
      .upload(objectPath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from("toy-photos").getPublicUrl(objectPath);
    return data.publicUrl;
  };

  const createMyToy = async (file: File): Promise<void> => {
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
      dislikedToyIds.value = dislikedToyIds.value.filter((id) => id !== targetToyId);
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
      const matchedToy = availableToys.value.find((toy) => toy.id === targetToyId);
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
    return runAction(async () => recordReaction(toy.id, "like"));
  };

  const resetDisliked = (): void => {
    dislikedToyIds.value = [];
  };

  const dislikeToy = async (id: string): Promise<void> => {
    if (BYPASS_AUTH) {
      if (!dislikedToyIds.value.includes(id)) {
        dislikedToyIds.value.push(id);
      }
      return;
    }
    await runAction(async () => {
      await recordReaction(id, "dislike");
    });
  };

  const clearError = (): void => {
    errorMessage.value = "";
  };

  supabase.auth.onAuthStateChange((_event, nextSession) => {
    session.value = nextSession;
    if (!nextSession) {
      clearLocalState();
    }
  });

  return {
    session,
    currentUser,
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
    signUp,
    signIn,
    signOut,
    loadMyToy,
    loadAvailableToys,
    loadReactions,
    createMyToy,
    likeToy,
    dislikeToy,
    resetDisliked,
    clearError,
  };
});
