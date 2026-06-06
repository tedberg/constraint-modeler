<template>
  <div
    class="cm:flex cm:items-center cm:gap-1 cm:bg-cm-bar cm:text-cm-bar-foreground cm:rounded-md cm:mb-1 cm:px-2 cm:py-1 cm:ml-4 projection-bar"
    :id="projectionId"
    data-test="projection"
    data-testid="projection"
  >
    <div class="cm:flex cm:items-center cm:gap-1">
      <div :id="aggregateId">
        <query-function-menu
          :query-function="queryFunctionEnum"
          :template-prefix="templatePrefix"
          @setQueryFunction="setQueryFunctionEnum"
        />
      </div>
      <div :id="propertyId" data-testid="projection-property-menu">
        <property-menu
          :property="property"
          :property-list="propertyList"
          :multi-property-list="multiPropertyList"
          :template-prefix="templatePrefix"
          @setProperty="setProperty"
        />
      </div>
    </div>
    <div class="cm:ml-auto">
      <Button variant="secondary" size="xs" @click.prevent="removeProjection">X</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from "vue";
import QueryFunctionMenu from "../shared/QueryFunctionMenu.vue";
import PropertyMenu from "../shared/PropertyMenu.vue";
import ProjectionModel from "../../model/ProjectionModel";
import { emitterKey } from "../../keys";
import { Button } from "@/components/ui/button";

const props = defineProps({
  templatePrefix: { type: String, default: "" },
  projectionModel: {
    type: Object,
    required: true,
    validator: (m: unknown) => m instanceof ProjectionModel,
  },
  propertyList: { type: Array },
  multiPropertyList: { type: Array },
  pathToPropertyMap: { type: Object },
});

const emit = defineEmits(["removeSelf"]);

const emitter = inject(emitterKey)!;

const property = computed(() => props.projectionModel.getProperty() || null);
const objectId = computed(() => props.projectionModel.getObjectId());
const queryFunctionEnum = computed(() => props.projectionModel.getQueryFunction());
const projectionId = computed(() => `${props.templatePrefix}_projection-bar-${objectId.value}`);
const aggregateId = computed(() => `${props.templatePrefix}_aggregate-menu-${objectId.value}`);
const propertyId = computed(() => `${props.templatePrefix}_property-menu-${objectId.value}`);

function setQueryFunctionEnum(enumKey: string) {
  emitter.emit("setProjectionQueryFunctionEnum", [
    props.projectionModel as ProjectionModel,
    enumKey,
  ]);
}
function setProperty(property: any) {
  emitter.emit("setProjectionProperty", [props.projectionModel as ProjectionModel, property]);
}
function removeProjection() {
  emit("removeSelf");
}
</script>

<style scoped>
.projection-bar {
  width: 400px;
}
</style>
