<template>
  <div :class="['constraint-group', { root: isRoot }]" data-test="constraint-group">
    <div
      class="cm:flex cm:items-center cm:gap-1 cm:bg-cm-bar cm:text-cm-bar-foreground cm:rounded-md cm:mb-1 cm:px-2 cm:py-1 constraint-group-bar"
      :id="constraintGroupId"
    >
      <div class="cm:flex cm:items-center cm:gap-1">
        <junction-menu :junction="junction" @setJunction="setJunction" />
        <Button
          variant="secondary"
          size="xs"
          data-test="add-constraint"
          @click.prevent="addConstraint"
          >+ C</Button
        >
        <Button
          variant="secondary"
          size="xs"
          data-test="add-constraint-group"
          @click.prevent="addConstraintGroup"
          >+ CG</Button
        >
      </div>
      <div class="cm:ml-auto">
        <Button v-if="isRoot" variant="secondary" size="xs" data-test="apply" @click.prevent="apply"
          >Apply</Button
        >
        <Button
          v-else
          variant="secondary"
          size="icon-xs"
          data-test="remove-constraint"
          aria-label="Remove constraint group"
          title="Remove constraint group"
          @click.prevent="removeSelf"
        >
          <X :size="16" />
        </Button>
      </div>
    </div>

    <constraint
      v-for="constraint in constraintList"
      :key="constraint.getObjectId()"
      :constraint-model="constraint"
      :template-prefix="templatePrefix"
      :propertyList="propertyList"
      :multiPropertyList="multiPropertyList"
      :pathToPropertyMap="pathToPropertyMap"
      @removeConstraint="removeConstraint"
    />

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
import { Button } from "@/components/ui/button";
import { X } from "@lucide/vue";

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
  width: 100%;
  min-width: 225px;
}
</style>
