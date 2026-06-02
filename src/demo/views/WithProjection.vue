<template>
  <div>
    <constraint-modeler
      title="Projection Constraint Modeler"
      :objectName="objectName"
      :expose-projection-modeler="true"
      v-on:applyConstraintsToData="applyDataGrid"
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

const objectName = "Projection";
const result = ref<any>({});
const constraintModelerResource = new StubConstraintModelerResource();

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

const queryResultData = computed(() => result.value.data);

function applyDataGrid(res: any) {
  result.value = res;
}
</script>
