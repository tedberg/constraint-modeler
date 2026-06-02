<template>
  <b-nav-item-dropdown :text="queryFunctionDisplay">
    <h6 class="dropdown-header">Aggregates</h6>

    <b-dropdown-item
      v-for="item in aggregateArray"
      :key="item.key"
      @click.prevent="setQueryFunction(item.key)"
      >{{ item.label }}</b-dropdown-item
    >

    <div class="dropdown-divider"></div>
    <h6 class="dropdown-header">Functions</h6>

    <b-dropdown-item
      v-for="item in queryFunctionArray"
      :key="item.key"
      @click.prevent="setQueryFunction(item.key)"
      >{{ item.label }}</b-dropdown-item
    >
  </b-nav-item-dropdown>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { QueryFunctionEnum } from "../../enum/QueryFunctionEnum";
import { DataTypeEnum } from "../../enum/DataTypeEnum";
import { GeneralEnum } from "../../enum/Enum";
import Property from "../../Property";

const props = defineProps({
  templatePrefix: { type: String, required: true },
  property: { type: Object },
  queryFunction: { type: Object },
});

const emit = defineEmits(["setQueryFunction"]);

const queryFunctionArray = ref<any[]>([]);
const aggregateArray = ref<any[]>([]);

// replaces created()
if (props.property) {
  const p = props.property as any;
  if (p.multiProperty) {
    queryFunctionArray.value = QueryFunctionEnum.getQueryFunctionValueListForInputType(
      DataTypeEnum.COLLECTION,
    );
    aggregateArray.value = [];
  } else {
    const inputType = DataTypeEnum.getTypeFromAlias(p.simpleDataType);
    queryFunctionArray.value = QueryFunctionEnum.getQueryFunctionValueListForInputType(inputType);
    aggregateArray.value = QueryFunctionEnum.getAggregateFunctionValueListForInputType(inputType);
  }
} else {
  queryFunctionArray.value = QueryFunctionEnum.getQueryFunctionValueList();
  aggregateArray.value = QueryFunctionEnum.getAggregateFunctionValueList();
}
aggregateArray.value.unshift((GeneralEnum as any).NONE);

const queryFunctionDisplay = computed(() =>
  props.queryFunction ? (props.queryFunction as any).label : "None",
);

function setQueryFunction(enumKey: string) {
  emit("setQueryFunction", enumKey);
}
</script>

<style scoped></style>
