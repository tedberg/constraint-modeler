<template>
  <div
    class="cm:flex cm:items-center cm:gap-1 cm:bg-cm-bar cm:text-cm-bar-foreground cm:rounded-md cm:mb-1 cm:px-2 cm:py-1 cm:ml-4 constraint-bar"
    :id="constraintId"
    data-test="constraint"
  >
    <div class="cm:flex cm:items-center cm:gap-1">
      <div :id="aggregateId" data-test="query-function-menu">
        <query-function-menu
          :query-function="queryFunctionEnum"
          :template-prefix="templatePrefix"
          @setQueryFunction="setQueryFunctionEnum"
        />
      </div>
      <div :id="propertyId" data-test="property-menu">
        <property-menu
          :property="property"
          :property-list="propertyList"
          :multi-property-list="multiPropertyList"
          :template-prefix="templatePrefix"
          @setProperty="setProperty"
        />
      </div>
      <div :id="comparisonId" data-test="comparison-menu">
        <comparison-menu
          :comparison-type="comparisonType"
          :data-type="dataType"
          :query-function="queryFunctionEnum"
          :property="property"
          :template-prefix="templatePrefix"
          @setComparator="setComparator"
        />
      </div>
    </div>

    <div :id="valueEntriesId" data-test="value-input" data-testid="value-input">
      <value-input
        :property="property"
        :comparison-type="comparisonType"
        :value-array="valueArray"
        :template-prefix="templatePrefix"
        :object-id="objectId"
        @updateValueArray="updateValueArray"
      />
    </div>

    <div class="cm:ml-auto cm:flex cm:items-center cm:gap-1">
      <div class="validity">
        <div v-if="isValid == null"></div>
        <div v-else-if="isValid" class="validity-icon validity-icon--valid">
          <CheckCircle2 :size="16" />
        </div>
        <div v-else class="validity-icon validity-icon--invalid" :title="invalidReason">
          <XCircle :size="16" />
        </div>
      </div>
      <Button
        variant="secondary"
        size="icon-xs"
        aria-label="Remove constraint"
        title="Remove constraint"
        @click.prevent="removeConstraint"
      >
        <X :size="16" />
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from "vue";
import { toRaw } from "vue";
import ComparisonMenu from "./ComparisonMenu.vue";
import QueryFunctionMenu from "../shared/QueryFunctionMenu.vue";
import ValueInput from "./ValueInput.vue";
import PropertyMenu from "../shared/PropertyMenu.vue";
import ConstraintModel from "../../model/ConstraintModel";
import { emitterKey } from "../../keys";
import { Button } from "@/components/ui/button";
import { CheckCircle2, X, XCircle } from "@lucide/vue";

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
  emit("removeConstraint", props.constraintModel);
}
</script>

<style scoped>
.constraint-bar {
  max-width: 800px;
}

.validity-icon {
  display: flex;
  align-items: center;
}

.validity-icon--valid {
  color: var(--cm-success);
}

.validity-icon--invalid {
  color: var(--cm-destructive);
}
</style>
