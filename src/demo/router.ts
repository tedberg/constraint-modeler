import { createRouter, createWebHistory } from "vue-router";
import Home from "./views/Home.vue";
import Simple from "./views/Simple.vue";
import Debug from "./views/Debug.vue";
import WithProjection from "./views/WithProjection.vue";
import Persistent from "./views/Persistent.vue";
import Everything from "./views/Everything.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "home", component: Home, meta: { title: "Home" } },
    { path: "/simple", name: "simple", component: Simple, meta: { title: "Simple" } },
    { path: "/debug", name: "debug", component: Debug, meta: { title: "Debug" } },
    {
      path: "/projection",
      name: "projection",
      component: WithProjection,
      meta: { title: "Projection" },
    },
    {
      path: "/persistent",
      name: "persistent",
      component: Persistent,
      meta: { title: "Persistent" },
    },
    {
      path: "/everything",
      name: "everything",
      component: Everything,
      meta: { title: "Everything" },
    },
    { path: "/:pathMatch(.*)*", redirect: "/simple" },
  ],
});

router.beforeEach((to) => {
  document.title = (to.meta.title as string) || "Constraint Modeler";
});

export default router;
