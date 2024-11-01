import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("@/views/MainView.vue"),
    },
    {
      path: "/:stage",
      name: "StagePage",
      component: () => import("@/views/MainView.vue"),
      props: true,
    },
  ],
});

export default router;
