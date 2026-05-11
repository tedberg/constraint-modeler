import ConstraintModeler from './constraint-modeler/ui/ConstraintModeler.vue';

const plugin = {
  install (app) {
    app.component('ConstraintModeler', ConstraintModeler);
  }
};

export { ConstraintModeler };
export default plugin;
