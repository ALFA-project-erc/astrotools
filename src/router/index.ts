import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue"),
  },
  {
    path: "/horoscope",
    name: "Horoscope",
    component: () => import("../views/Horoscope.vue"),
  },
  {
    path: "/ephemerides",
    name: "Ephemerides",
    component: () => import("../views/Ephemerides.vue"),
  },
  {
    path: "/calculator",
    name: "Calculator",
    component: () => import("../views/Calculator.vue"),
  },
  {
    path: "/calendar",
    name: "Calendar",
    component: () => import("../views/Calendar.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
