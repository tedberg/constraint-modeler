import "@/assets/css/tailwind.css";
import ConstraintModeler from "./constraint-modeler/ui/ConstraintModeler.vue";
import type { App } from "vue";

const plugin = {
  install(app: App) {
    app.component("ConstraintModeler", ConstraintModeler);
  },
};

export { ConstraintModeler };
export default plugin;
