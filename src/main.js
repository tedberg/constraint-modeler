import { createApp } from 'vue';
import App from './demo/App.vue';
import router from './demo/router';
import {
  createBootstrap,
  vBTooltip,
  BAlert,
  BCollapse,
  BNavbar,
  BNavbarBrand,
  BNavbarToggle,
  BNavbarNav,
  BNavItem,
  BNavItemDropdown,
  BDropdownItem,
  BTable,
} from 'bootstrap-vue-next';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css';

const app = createApp(App);

app.use(router);
app.use(createBootstrap());
app.directive('b-tooltip', vBTooltip);

// Register BVN components globally (BVN 0.45+ does not auto-register via createBootstrap)
app.component('BAlert', BAlert);
app.component('BCollapse', BCollapse);
app.component('BNavbar', BNavbar);
app.component('BNavbarBrand', BNavbarBrand);
app.component('BNavbarToggle', BNavbarToggle);
app.component('BNavbarNav', BNavbarNav);
app.component('BNavItem', BNavItem);
app.component('BNavItemDropdown', BNavItemDropdown);
app.component('BDropdownItem', BDropdownItem);
app.component('BTable', BTable);

app.mount('#app');
