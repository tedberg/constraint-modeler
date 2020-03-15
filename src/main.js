import Vue from 'vue';
import App from './demo/App.vue';
import router from './demo/router';

import { AlertPlugin, ButtonPlugin, DropdownPlugin, NavbarPlugin, TablePlugin, TooltipPlugin } from 'bootstrap-vue';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
// import '@/assets/css/style.scss';

Vue.use(AlertPlugin);
Vue.use(ButtonPlugin);
Vue.use(DropdownPlugin);
Vue.use(NavbarPlugin);
Vue.use(TablePlugin);
Vue.use(TooltipPlugin);

Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App),
  data: () => {
    return {
    };
  }
}).$mount('#app');
