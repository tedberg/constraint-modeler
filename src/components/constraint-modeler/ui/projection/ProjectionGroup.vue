<template>
  <div class="projection-group" data-test="projection-group">
    <div
      class="navbar navbar-expand-lg navbar-dark bg-dark projection-group-bar mb-1"
      :id="projectionGroupId"
    >
      <div class="collapse navbar-collapse">
        <ul class="navbar-nav">
          <form class="form-inline ms-2">
            <button
              class="btn btn-sm btn-secondary"
              data-test="add-projection"
              data-testid="add-projection"
              @click.prevent="addProjection()"
            >
              + P
            </button>
          </form>
        </ul>
      </div>
    </div>
    <!-- Must close the nav bar-->

    <!-- This is a list of many new nav bars -->
    <projection
      v-for="(projection, index) in projectionList"
      :key="projection.getObjectId()"
      :projection-model="projection"
      :template-prefix="templatePrefix"
      :propertyList="propertyList"
      :multiPropertyList="multiPropertyList"
      :pathToPropertyMap="pathToPropertyMap"
      v-on:removeSelf="removeProjection(projection, index)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Projection from "./Projection.vue";
import ProjectionGroupModel from "../../model/ProjectionGroupModel";

const props = defineProps({
  templatePrefix: { type: String, default: "" },
  projectionGroupModel: {
    type: Object,
    required: true,
    validator: (m: unknown) => m instanceof ProjectionGroupModel,
  },
  propertyList: { type: Array },
  multiPropertyList: { type: Array },
  pathToPropertyMap: { type: Object },
});

const emit = defineEmits(["addProjection", "removeProjection"]);

const projectionList = computed(() => props.projectionGroupModel.getProjectionList());
const projectionGroupId = computed(
  () => `${props.templatePrefix}_projection-group-bar-${props.projectionGroupModel.getObjectId()}`,
);

function addProjection() {
  emit("addProjection");
}
function removeProjection(projection: any, index: number) {
  emit("removeProjection", projection, index);
}
</script>

<style scoped>
.projection-group-bar {
  width: 225px;
}
</style>
