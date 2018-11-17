import Vue from 'vue';
import App from './demo/App.vue';
import router from './demo/router';
import BootstrapVue from 'bootstrap-vue';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
// import '@/assets/css/style.scss';

Vue.use(BootstrapVue);

Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App),
  data: () => {
    return {
    };
  }
}).$mount('#app');
