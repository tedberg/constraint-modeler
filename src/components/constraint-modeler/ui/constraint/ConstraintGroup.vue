<template>
  <div :class="['constraint-group', { root: isRoot }]" data-test="constraint-group">
    <div
      class="navbar navbar-expand-lg navbar-dark bg-dark constraint-group-bar mb-1 px-2"
      :id="constraintGroupId"
    >
      <div class="collapse navbar-collapse">
        <ul class="navbar-nav">
          <li class="nav-item active dropdown" :id="junctionMenuId">
            <junction-menu :junction="junction" v-on:setJunction="setJunction" />
          </li>

          <li class="nav-item btn-group btn-group-sm">
            <button
              class="btn btn-sm btn-secondary"
              data-test="add-constraint"
              @click.prevent="addConstraint"
            >
              + C
            </button>
            <button
              class="btn btn-sm btn-secondary"
              data-test="add-constraint-group"
              @click.prevent="addConstraintGroup"
            >
              + CG
            </button>
          </li>
        </ul>

        <ul class="navbar-nav ms-auto">
          <form class="form-inline">
            <button
              v-if="isRoot"
              class="btn btn-sm btn-secondary"
              data-test="apply"
              @click.prevent="apply"
            >
              Apply
            </button>
            <button
              v-else
              class="btn btn-sm btn-secondary"
              data-test="remove-constraint"
              @click.prevent="removeSelf"
            >
              X
            </button>
          </form>
        </ul>
      </div>
    </div>
    <!-- Must close the nav bar-->

    <!-- This is a list of many new nav bars -->
    <constraint
      v-for="constraint in constraintList"
      :key="constraint.getObjectId()"
      :constraint-model="constraint"
      :template-prefix="templatePrefix"
      :propertyList="propertyList"
      :multiPropertyList="multiPropertyList"
      :pathToPropertyMap="pathToPropertyMap"
      v-on:removeConstraint="removeConstraint"
    />

    <!-- This is a list of many new nav bars -->
    <constraint-group
      v-for="constraintGroup in constraintGroupList"
      :key="constraintGroup.getObjectId()"
      :constraint-group-model="constraintGroup"
      :template-prefix="templatePrefix"
      :propertyList="propertyList"
      :multiPropertyList="multiPropertyList"
      :pathToPropertyMap="pathToPropertyMap"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from "vue";
import JunctionMenu from "./JunctionMenu.vue";
import Constraint from "./Constraint.vue";
import ConstraintGroupModel from "../../model/ConstraintGroupModel";
import { emitterKey } from "../../keys";

const props = defineProps({
  templatePrefix: { type: String, default: "" },
  constraintGroupModel: {
    type: Object,
    required: true,
    validator: (m: unknown) => m instanceof ConstraintGroupModel,
  },
  propertyList: { type: Array },
  multiPropertyList: { type: Array },
  pathToPropertyMap: { type: Object },
});

const emitter = inject(emitterKey)!;

const junction = computed(() => props.constraintGroupModel.getJunction());
const constraintList = computed(() => props.constraintGroupModel.getConstraintList());
const constraintGroupList = computed(() => props.constraintGroupModel.getConstraintGroupList());
const objectId = computed(() => props.constraintGroupModel.getObjectId());
const isRoot = computed(() => props.constraintGroupModel.isRoot());
const constraintGroupId = computed(
  () => `${props.templatePrefix}_constraint-group-bar-${objectId.value}`,
);
const junctionMenuId = computed(() => `${props.templatePrefix}_junction-menu-${objectId.value}`);

function setJunction(junctionEnum: any) {
  emitter.emit("setJunction", [props.constraintGroupModel as ConstraintGroupModel, junctionEnum]);
}
function addConstraint() {
  emitter.emit("addConstraint", props.constraintGroupModel as ConstraintGroupModel);
}
function removeConstraint(constraintModel: any) {
  emitter.emit("removeConstraint", [
    props.constraintGroupModel as ConstraintGroupModel,
    constraintModel,
  ]);
}
function addConstraintGroup() {
  emitter.emit("addConstraintGroup", props.constraintGroupModel as ConstraintGroupModel);
}
function apply() {
  emitter.emit("apply", undefined);
}
function removeSelf() {
  emitter.emit("removeConstraintGroup", props.constraintGroupModel as ConstraintGroupModel);
}
</script>

<style scoped>
div.constraint-group:not(.root) {
  margin-left: 15px;
}

.constraint-group-bar {
  width: 225px;
}
</style>
