import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { Quasar } from "quasar";
// Import icon libraries
import "@quasar/extras/material-icons/material-icons.css";

// Import Quasar css
import "quasar/src/css/index.sass";

const quasarUserOptions = {
  config: {},
  plugins: {},
};

createApp(App).use(Quasar, quasarUserOptions).use(router).mount("#app");
