import "@/assets/css/lib.css";
import ConstraintModeler from "./constraint-modeler/ui/ConstraintModeler.vue";
import AbstractConstraintModelerResource from "./constraint-modeler/AbstractConstraintModelerResource";
import ConstraintModelerResource from "./constraint-modeler/ConstraintModelerResource";
import type { App } from "vue";
import type { Events } from "./constraint-modeler/events";

const plugin = {
  install(app: App) {
    app.component("ConstraintModeler", ConstraintModeler);
  },
};

export { AbstractConstraintModelerResource, ConstraintModeler, ConstraintModelerResource };
export type { Events as ConstraintModelerEvents };
export default plugin;
