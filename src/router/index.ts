import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";
import Calendar from "../views/Calendar.vue";
import Calculator from "../views/Calculator.vue";
import Ephemerides from "../views/Ephemerides.vue";
import Horoscope from "../views/Horoscope.vue";
import About from "../views/About.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/about",
    name: "About",
    component: About,
  },
  {
    path: "/horoscope",
    name: "Horoscope",
    component: Horoscope,
  },
  {
    path: "/ephemerides",
    name: "Ephemerides",
    component: Ephemerides,
  },
  {
    path: "/calculator",
    name: "Calculator",
    component: Calculator,
  },
  {
    path: "/calendar",
    name: "Calendar",
    component: Calendar,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
