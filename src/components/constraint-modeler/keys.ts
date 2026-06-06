import type { InjectionKey, Ref } from "vue";
import type { Emitter } from "mitt";
import type { Events } from "./events";
import type AbstractConstraintModelerResource from "./AbstractConstraintModelerResource";

export const emitterKey: InjectionKey<Emitter<Events>> = Symbol("emitter");
export const resourceKey: InjectionKey<AbstractConstraintModelerResource> = Symbol(
  "constraintModelerResource",
);
// Portal container inside .constraint-modeler so dropdown panels inherit its CSS variables.
export const dropdownPortalKey: InjectionKey<Ref<HTMLElement | null>> =
  Symbol("dropdownPortal");
