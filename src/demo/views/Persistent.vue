<template>
  <div>
    <constraint-modeler
      title="Persistent Constraint Modeler"
      :objectName="objectName"
      :initial-model-json-object="initialModel"
      v-on:applyConstraintsToData="applyDataGrid"
      :saveFunction="uiSaveFunction"
      :constraintModelerResource="constraintModelerResource"
    />

    <list-grid :objectName="objectName" :fields="fields" :items="queryResultData" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import ConstraintModeler from "@/components/constraint-modeler/ui/ConstraintModeler.vue";
import StubConstraintModelerResource from "@/components/constraint-modeler/StubConstraintModelerResource";
import ListGrid from "./ListGrid.vue";
import ModelPersistence from "@/components/constraint-modeler/model/ModelPersistence";

const objectName = "Persistent";
const result = ref<any>({});
const constraintModelerResource = new StubConstraintModelerResource();
const modelPersistence = new ModelPersistence();
const uiSaveFunction = modelPersistence.save.bind(modelPersistence);

const fields = [
  { key: "id", sortable: true },
  { key: "name", sortable: true },
  { key: "age", sortable: true },
  {
    key: "status",
    sortable: false,
    formatter: (value: string) => (value === "ENABLED" ? "Yep" : "Nope"),
  },
];

const initialModel = {
  constraintGroup: {
    constraint: {
      value: "status:eq:ENABLED;age:gt:50",
      sub1: { junction: "or", value: "age:lte:35;upper(name):like:*Y" },
    },
  },
};

const queryResultData = computed(() => result.value.data);

function applyDataGrid(res: any) {
  result.value = res;
}
</script>
