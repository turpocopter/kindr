import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Toy } from "@/types/toy";

const MOCK_TOYS: Toy[] = [
  {
    id: "toy-9",
    name: "voiture-bois-klaxon",
    photoUrl: "https://www.jeu-montessori.fr/7736-large_default/voiture-bois-klaxon.jpg",
    ownerId: "child-08",
  },
  {
    id: "toy-10",
    name: "jouet-dinosaure-nic-nac-tyrannosaure",
    photoUrl: "https://www.maisonludique.com/134348-large_default/jouet-dinosaure-nic-nac-tyrannosaure.jpg",
    ownerId: "child-08",
  },
  {
    id: "toy-11",
    name: "sophie-la-girafe-jouet-d-eveil-sophie-la-girafe_SLG00001_0_1",
    photoUrl: "https://www.baby-lux.com/media/catalog/product/cache/45f4f755edda6da9b7e5efa8a966a136/s/o/sophie-la-girafe-jouet-d-eveil-sophie-la-girafe_SLG00001_0_1.jpg",
    ownerId: "child-08",
  },
  {
    id: "toy-12",
    name: "jouet-robot-vintage-1_1080x",
    photoUrl: "https://planete-vintage.com/cdn/shop/products/jouet-robot-vintage-1_1080x.jpg?v=1604658679",
    ownerId: "child-08",
  },
  {
    id: "toy-13",
    name: "39536-peluche-lapin-belier-18cm-4-couleurs_1_",
    photoUrl: "https://www.lepetitsouk.fr/media/catalog/product/cache/cbbdd6815528187f8ac75af67ab835d1/3/9/39536-peluche-lapin-belier-18cm-4-couleurs_1_.jpg",
    ownerId: "child-08",
  },
  {
    id: "toy-14",
    name: "baby-walker-3-en-1-poupon-little-smoby-7600140308_00",
    photoUrl: "https://middleware.simba-dickie.com/media/shop-dickietamiya/products/7600140308/00/overview_2020/baby-walker-3-en-1-poupon-little-smoby-7600140308_00.jpeg?v=1688046698",
    ownerId: "child-08",
  },
  {
    id: "toy-15",
    name: "horse-toy",
    photoUrl: "https://shopeu.ponycycle.com/fr/collections/horse-toy?srsltid=AfmBOoqBDX-slwcVcMOjB2adFd-HX-7dbUmPM5A7ENVeqfuOClZF-ZRf",
    ownerId: "child-08",
  },
  {
    id: "toy-16",
    name: "ANd9GcRLbjHW-TNxa4MELHdTR_03I8BZA1jolmVI7w",
    photoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLbjHW-TNxa4MELHdTR_03I8BZA1jolmVI7w&s",
    ownerId: "child-08",
  },
  {
    id: "toy-17",
    name: "figurine-pegase",
    photoUrl: "https://lesminis.fr/8173-large_default/figurine-pegase.jpg",
    ownerId: "child-08",
  },
  {
    id: "toy-18",
    name: "tovdgrv1iylj",
    photoUrl: "https://i.makeup.be/t/to/tovdgrv1iylj.jpg",
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

  const resetDisliked = (): void => {
    dislikedToyIds.value = [];
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
    resetDisliked,
  };
});
