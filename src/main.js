import Vue from 'vue';
import App from './demo/App.vue';
import router from './demo/router';
import { Alert, Button, Dropdown, Navbar, Table, Tooltip } from 'bootstrap-vue/es/components';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
// import '@/assets/css/style.scss';

Vue.use(Alert);
Vue.use(Button);
Vue.use(Dropdown);
Vue.use(Navbar);
Vue.use(Table);
Vue.use(Tooltip);

Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App),
  data: () => {
    return {
    };
  }
}).$mount('#app');
