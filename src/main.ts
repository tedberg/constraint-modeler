import { createApp } from "vue";
import App from "./demo/App.vue";
import router from "./demo/router";
import "@/assets/css/tailwind.css";

const app = createApp(App);
app.use(router);
app.mount("#app");
