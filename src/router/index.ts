import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import HomeView from "@/views/HomeView.vue";
import MyToyView from "@/views/MyToyView.vue";
import BrowseView from "@/views/BrowseView.vue";
import MatchView from "@/views/MatchView.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/my-toy",
    name: "myToy",
    component: MyToyView,
  },
  {
    path: "/browse",
    name: "browse",
    component: BrowseView,
  },
  {
    path: "/match/:toyId",
    name: "match",
    component: MatchView,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
