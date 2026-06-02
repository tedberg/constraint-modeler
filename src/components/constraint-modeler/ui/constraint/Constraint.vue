<template>
  <div
    class="navbar navbar-expand-lg navbar-dark bg-dark constraint-bar mb-1 px-2"
    :id="constraintId"
    data-test="constraint"
  >
    <div class="collapse navbar-collapse">
      <ul class="navbar-nav">
        <li class="nav-item dropdown" :id="aggregateId" data-test="query-function-menu">
          <query-function-menu
            :query-function="queryFunctionEnum"
            :template-prefix="templatePrefix"
            v-on:setQueryFunction="setQueryFunctionEnum"
          />
        </li>

        <li class="nav-item active dropdown" :id="propertyId" data-test="property-menu">
          <property-menu
            :property="property"
            :property-list="propertyList"
            :multi-property-list="multiPropertyList"
            :template-prefix="templatePrefix"
            v-on:setProperty="setProperty"
          />
        </li>

        <li class="nav-item dropdown" :id="comparisonId" data-test="comparison-menu">
          <comparison-menu
            :comparison-type="comparisonType"
            :data-type="dataType"
            :query-function="queryFunctionEnum"
            :property="property"
            :template-prefix="templatePrefix"
            v-on:setComparator="setComparator"
          />
        </li>
      </ul>

      <form
        class="form-inline navbar-search pull-left"
        :id="valueEntriesId"
        data-test="value-input"
        data-testid="value-input"
      >
        <value-input
          :property="property"
          :comparison-type="comparisonType"
          :value-array="valueArray"
          :template-prefix="templatePrefix"
          :object-id="objectId"
          v-on:updateValueArray="updateValueArray"
        />
      </form>

      <ul class="navbar-nav ms-auto">
        <li>
          <div class="validity">
            <div v-if="isValid == null"></div>
            <div v-else-if="isValid" class="valid"><img :src="acceptIcon" alt="valid" /></div>
            <div v-else class="invalid">
              <img :src="errorIcon" alt="invalid" :title="invalidReason" />
            </div>
          </div>
        </li>
        <form class="form-inline ms-2">
          <button class="btn btn-sm btn-secondary" @click.prevent="removeConstraint">X</button>
        </form>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from "vue";
import { toRaw } from "vue";
import acceptIcon from "@/assets/images/icons/accept.png";
import errorIcon from "@/assets/images/icons/error.png";
import ComparisonMenu from "./ComparisonMenu.vue";
import QueryFunctionMenu from "../shared/QueryFunctionMenu.vue";
import ValueInput from "./ValueInput.vue";
import PropertyMenu from "../shared/PropertyMenu.vue";
import ConstraintModel from "../../model/ConstraintModel";
import { emitterKey } from "../../keys";

const props = defineProps({
  templatePrefix: { type: String, default: "" },
  constraintModel: {
    type: Object,
    required: true,
    validator: (m: unknown) => m instanceof ConstraintModel,
  },
  propertyList: { type: Array },
  multiPropertyList: { type: Array },
  pathToPropertyMap: { type: Object },
});

const emit = defineEmits(["removeConstraint"]);

const emitter = inject(emitterKey)!;

const valueArray = computed(() => props.constraintModel.getValueArray());
const comparisonType = computed(() => props.constraintModel.getComparisonType());
const property = computed(() => props.constraintModel.getProperty() || null);
const dataType = computed(() => toRaw(props.constraintModel.getDataType()));
const objectId = computed(() => props.constraintModel.getObjectId());
const queryFunctionEnum = computed(() => props.constraintModel.getQueryFunction());
const isValid = computed(() => {
  if (props.constraintModel.verifiedValidity === null) return null;
  return props.constraintModel.verifiedValidity.valid;
});
const invalidReason = computed(() => {
  if (props.constraintModel.verifiedValidity === null) return null;
  return props.constraintModel.verifiedValidity.reason;
});
const constraintId = computed(() => `${props.templatePrefix}_constraint-bar-${objectId.value}`);
const aggregateId = computed(() => `${props.templatePrefix}_aggregate-menu-${objectId.value}`);
const propertyId = computed(() => `${props.templatePrefix}_property-menu-${objectId.value}`);
const comparisonId = computed(() => `${props.templatePrefix}_comparison-menu-${objectId.value}`);
const valueEntriesId = computed(
  () => `${props.templatePrefix}_valueEntries-menu-${objectId.value}`,
);

function setComparator(ct: any) {
  emitter.emit("setComparator", [props.constraintModel as ConstraintModel, ct]);
}
function setQueryFunctionEnum(enumKey: string) {
  emitter.emit("setQueryFunctionEnum", [props.constraintModel as ConstraintModel, enumKey]);
}
function setProperty(property: any) {
  emitter.emit("setProperty", [props.constraintModel as ConstraintModel, property]);
}
function updateValueArray(va: unknown[]) {
  emitter.emit("updateValueArray", [props.constraintModel as ConstraintModel, va]);
}
function removeConstraint() {
  console.log("removeConstraint");
  emit("removeConstraint", props.constraintModel);
}
</script>

<style scoped>
div.navbar {
  margin-left: 15px;
}

.constraint-bar {
  max-width: 800px;
}
</style>
