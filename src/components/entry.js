import ConstraintModeler from './constraint-modeler/ui/ConstraintModeler.vue';

// What should happen if the user installs the library as a plugin
function install (Vue) {
  if (install.installed) return;
  install.installed = true;
  Vue.component('ConstraintModeler', ConstraintModeler);
}

// Create module definition for Vue.use()
const plugin = {
  install
};

// To auto-install when vue is found
/* global window global */
let GlobalVue = null;
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue;
}
if (GlobalVue) {
  GlobalVue.use(plugin);
}

// Export components individually
export { ConstraintModeler };

// Export the library as a plugin
export default { install: install };
