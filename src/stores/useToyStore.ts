import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Toy } from "@/types/toy";

const MOCK_TOYS: Toy[] = [
  {
    id: "toy-1",
    name: "LEGO City 🏙️",
    photoUrl: "https://picsum.photos/300/400?random=1",
    ownerId: "child-01",
  },
  {
    id: "toy-2",
    name: "Dinosaure Rex 🦕",
    photoUrl: "https://picsum.photos/300/400?random=2",
    ownerId: "child-02",
  },
  {
    id: "toy-3",
    name: "Poupée Emma 🪆",
    photoUrl: "https://picsum.photos/300/400?random=3",
    ownerId: "child-03",
  },
  {
    id: "toy-4",
    name: "Voiture Flash ⚡",
    photoUrl: "https://picsum.photos/300/400?random=4",
    ownerId: "child-04",
  },
  {
    id: "toy-5",
    name: "Peluche Koala 🐨",
    photoUrl: "https://picsum.photos/300/400?random=5",
    ownerId: "child-05",
  },
  {
    id: "toy-6",
    name: "Puzzle Animaux 🧩",
    photoUrl: "https://picsum.photos/300/400?random=6",
    ownerId: "child-06",
  },
  {
    id: "toy-7",
    name: "Jeu Cartes Pokémon ✨",
    photoUrl: "https://picsum.photos/300/400?random=7",
    ownerId: "child-07",
  },
  {
    id: "toy-8",
    name: "Robot Danseur 🤖",
    photoUrl: "https://picsum.photos/300/400?random=8",
    ownerId: "child-08",
  },
];

export const useToyStore = defineStore("toy", () => {
  const myToy = ref<Toy | null>(null);
  const availableToys = ref<Toy[]>(MOCK_TOYS);
  const likedToyIds = ref<string[]>([]);
  const dislikedToyIds = ref<string[]>([]);
  const matches = ref<Toy[]>([]);

  const likedToys = computed(() =>
    availableToys.value.filter((toy) => likedToyIds.value.includes(toy.id)),
  );

  const setMyToy = (toy: Toy): void => {
    myToy.value = toy;
  };

  const likeToy = (toy: Toy): boolean => {
    if (!likedToyIds.value.includes(toy.id)) {
      likedToyIds.value.push(toy.id);
    }

    const isMatch = Math.random() >= 0.5;
    if (isMatch && !matches.value.some((match) => match.id === toy.id)) {
      matches.value.push(toy);
    }

    return isMatch;
  };

  const dislikeToy = (id: string): void => {
    if (!dislikedToyIds.value.includes(id)) {
      dislikedToyIds.value.push(id);
    }
  };

  return {
    myToy,
    availableToys,
    likedToys,
    likedToyIds,
    dislikedToyIds,
    matches,
    setMyToy,
    likeToy,
    dislikeToy,
  };
});
