// import './assets/main.css'
import "@coreui/coreui/dist/css/coreui.min.css";
import "vue-multiselect/dist/vue-multiselect.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";

import { createApp } from "vue";
import { createPinia } from "pinia";
import CoreuiVue from "@coreui/vue";

import App from "@/App.vue";
import router from "@/router";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(CoreuiVue);

app.mount("#app");
