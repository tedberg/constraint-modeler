<template>
  <div>
    <template v-for="(_, i) in numberOfObjects" :key="i">
      <span v-if="i === 1 && numberOfObjects === 2" class="cm:text-foreground cm:text-xs">AND</span>
      <select
        v-if="useSelectField"
        :id="getIdAttribute(i)"
        :name="getNameAttribute(i)"
        :class="inputClass"
        v-model="localValues[i]"
        @change="updateValueArray"
      >
        <option value=""></option>
        <option
          v-for="opt in selectableValueList"
          :key="findChoiceId(opt)"
          :value="findChoiceId(opt)"
        >
          {{ findChoiceLabel(opt) }}
        </option>
      </select>
      <input
        v-else-if="isNumber"
        type="number"
        :id="getIdAttribute(i)"
        :name="getNameAttribute(i)"
        :class="inputClass"
        v-model="localValues[i]"
        @input="updateValueArray"
      />
      <input
        v-else-if="isDate"
        type="date"
        :id="getIdAttribute(i)"
        :name="getNameAttribute(i)"
        :class="inputClass"
        v-model="localValues[i]"
        @input="updateValueArray"
      />
      <input
        v-else-if="isUrl"
        type="url"
        :id="getIdAttribute(i)"
        :name="getNameAttribute(i)"
        :class="inputClass"
        v-model="localValues[i]"
        @input="updateValueArray"
      />
      <input
        v-else
        type="text"
        :id="getIdAttribute(i)"
        :name="getNameAttribute(i)"
        :class="inputClass"
        v-model="localValues[i]"
        @input="updateValueArray"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, watch } from "vue";
import { ComparisonTypeEnum } from "../../enum/ComparisonTypeEnum";
import { DataTypeEnum } from "../../enum/DataTypeEnum";
import Property from "../../Property";
import { resourceKey } from "../../keys";

const AUTOCOMPLETE_DATAMAGNITUDE_THRESHOLD = 25;

const props = defineProps({
  objectId: { type: Number, required: true },
  templatePrefix: { type: String, default: "" },
  comparisonType: {
    type: Object,
    required: true,
    validator: (m: unknown) => ComparisonTypeEnum.checkInstanceOf(m),
  },
  property: {
    type: Object,
    required: false,
    validator: (m: unknown) => m instanceof Property,
  },
  queryFunction: { type: Function },
  valueCustomObject: { type: Object },
  valueArray: { type: Array, required: true, default: () => [] },
});

const emit = defineEmits(["updateValueArray"]);

const constraintModelerResource = inject(resourceKey)!;
const selectableValueList = ref<any[]>([]);
const localValues = ref<any[]>([...(props.valueArray || [])]);

watch(
  () => props.valueArray,
  (v) => {
    localValues.value = [...(v || [])];
  },
  { deep: true },
);

const numberOfObjects = computed(() =>
  props.comparisonType ? (props.comparisonType as any).expectedNumberOfObjectValues : 0,
);
const dataType = computed(() =>
  props.property ? (props.property as any).getSimpleDataTypeEnum() : null,
);
const serverDataType = computed(() =>
  props.property ? (props.property as any).getServerDataType() : null,
);

const useSelectField = computed(() => {
  let dt = dataType.value;
  if (props.queryFunction) dt = (props.queryFunction as any).getOutputDataType();
  if (dt === DataTypeEnum.ENUM || dt === DataTypeEnum.BOOLEAN) return true;
  if (dt === DataTypeEnum.OBJECT) {
    return !(
      props.property &&
      (props.property as any).expectedDataMagnitude > AUTOCOMPLETE_DATAMAGNITUDE_THRESHOLD &&
      (props.property as any).keyDisplayPropertyPath
    );
  }
  return false;
});

const isNumber = computed(() => dataType.value?.alias === DataTypeEnum.NUMBER.alias);
const isDate = computed(() => dataType.value?.alias === DataTypeEnum.DATE.alias);
const isUrl = computed(() => dataType.value?.alias === DataTypeEnum.URL.alias);

const inputClass = computed(() => {
  let cls = dataType.value ? dataType.value.alias : "";
  if (numberOfObjects.value > 2) cls += " in_clause_value";
  return cls;
});

function updateValueArray() {
  emit("updateValueArray", localValues.value);
}

function loadValueList() {
  if (serverDataType.value === "boolean") {
    selectableValueList.value = [
      { identifyingValue: "true", displayValue: "True" },
      { identifyingValue: "false", displayValue: "False" },
    ];
    return Promise.resolve();
  }
  return (constraintModelerResource as any)
    .loadValueList(serverDataType.value)
    .then((response: any) => {
      selectableValueList.value = response.data;
    });
}

function findChoiceId(choice: any): string | null {
  if (choice.identifyingValue !== undefined) return choice.identifyingValue;
  if (choice.id !== undefined) return choice.id !== null ? choice.id.toString() : null;
  return choice;
}

function findChoiceLabel(choice: any): string {
  if (choice.displayValue !== undefined) return choice.displayValue;
  if (choice.name !== undefined) return choice.name;
  return choice;
}

function getIdAttribute(fieldIndex: string | number) {
  return `${props.templatePrefix}_valueEntry-${Number(fieldIndex)}-${props.objectId}`;
}

function getNameAttribute(fieldIndex: string | number) {
  return `valueEntry-${Number(fieldIndex)}-${props.objectId}`;
}

// replaces created()
if (useSelectField.value) {
  loadValueList();
}

watch(serverDataType, () => {
  if (useSelectField.value) loadValueList();
});
</script>

<style scoped>
input,
select {
  background-color: var(--cm-background);
  color: var(--cm-foreground);
  border: 1px solid var(--cm-border);
  border-radius: calc(var(--cm-radius) - 4px);
  min-height: 1.5rem;
  padding: 1px 0.25rem;
  font: inherit;
  line-height: 1.25;
  max-width: 100%;
  flex-shrink: 0;
}

input {
  width: min(15.625rem, 100%);
}

input.number {
  width: min(7.8125rem, 100%);
}

input.date {
  width: min(7.5rem, 100%);
}

div.in_clause {
  width: min(32.1875rem, 100%);
  margin-bottom: 0.3125rem;
}

input.in_clause_value {
  width: min(6rem, 100%);
}

input.in_clause_value.date {
  width: min(5rem, 100%);
}
</style>
