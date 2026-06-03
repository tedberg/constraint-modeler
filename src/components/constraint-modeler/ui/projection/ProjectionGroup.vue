<template>
  <div class="projection-group" data-test="projection-group">
    <div
      class="flex items-center gap-1 bg-neutral-900 rounded-md mb-1 px-2 py-1 projection-group-bar"
      :id="projectionGroupId"
    >
      <Button
        variant="secondary"
        size="xs"
        data-test="add-projection"
        data-testid="add-projection"
        @click.prevent="addProjection()"
        >+ P</Button
      >
    </div>

    <projection
      v-for="(projection, index) in projectionList"
      :key="projection.getObjectId()"
      :projection-model="projection"
      :template-prefix="templatePrefix"
      :propertyList="propertyList"
      :multiPropertyList="multiPropertyList"
      :pathToPropertyMap="pathToPropertyMap"
      @removeSelf="removeProjection(projection, index)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Projection from "./Projection.vue";
import ProjectionGroupModel from "../../model/ProjectionGroupModel";
import { Button } from "@/components/ui/button";

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
