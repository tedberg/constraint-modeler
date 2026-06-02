import type { InjectionKey } from "vue";
import type { Emitter } from "mitt";
import type { Events } from "./events";
import type AbstractConstraintModelerResource from "./AbstractConstraintModelerResource";

export const emitterKey: InjectionKey<Emitter<Events>> = Symbol("emitter");
export const resourceKey: InjectionKey<AbstractConstraintModelerResource> = Symbol(
  "constraintModelerResource",
);
