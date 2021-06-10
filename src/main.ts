import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { Quasar } from "quasar";

import "./styles/quasar.sass";
import "@quasar/extras/material-icons/material-icons.css";

const quasarUserOptions = {
  config: {},
  plugins: {},
};

createApp(App).use(Quasar, quasarUserOptions).use(router).mount("#app");
