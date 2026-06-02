import type ConstraintGroupModel from "./model/ConstraintGroupModel";
import type ConstraintModel from "./model/ConstraintModel";
import type ProjectionModel from "./model/ProjectionModel";
import type Property from "./Property";

export type Events = {
  apply: void;
  setJunction: [ConstraintGroupModel, unknown];
  addConstraint: ConstraintGroupModel;
  addConstraintGroup: ConstraintGroupModel;
  removeConstraintGroup: ConstraintGroupModel;
  setQueryFunctionEnum: [ConstraintModel, string];
  setProperty: [ConstraintModel, Property];
  setComparator: [ConstraintModel, unknown];
  updateValueArray: [ConstraintModel, unknown[]];
  removeConstraint: [ConstraintGroupModel, ConstraintModel];
  setProjectionQueryFunctionEnum: [ProjectionModel, string];
  setProjectionProperty: [ProjectionModel, Property];
};
