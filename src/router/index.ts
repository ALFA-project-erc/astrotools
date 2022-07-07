import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import HomePage from "../views/HomePage.vue";
import CalendarPage from "../views/CalendarPage.vue";
import CalculatorPage from "../views/CalculatorPage.vue";
import EphemeridesPage from "../views/EphemeridesPage.vue";
import HoroscopePage from "../views/HoroscopePage.vue";
import AboutPage from "../views/AboutPage.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: HomePage,
  },
  {
    path: "/about",
    name: "About",
    component: AboutPage,
  },
  {
    path: "/horoscope",
    name: "Horoscope",
    component: HoroscopePage,
  },
  {
    path: "/ephemerides",
    name: "Ephemerides",
    component: EphemeridesPage,
  },
  {
    path: "/calculator",
    name: "Calculator",
    component: CalculatorPage,
  },
  {
    path: "/calendar",
    name: "Calendar",
    component: CalendarPage,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
