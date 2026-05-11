import { createApp } from 'vue';
import App from './demo/App.vue';
import router from './demo/router';
import { createBootstrap } from 'bootstrap-vue-next';
import { vBTooltip } from 'bootstrap-vue-next';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css';

const app = createApp(App);

app.use(router);
app.use(createBootstrap());
app.directive('b-tooltip', vBTooltip);

app.mount('#app');
