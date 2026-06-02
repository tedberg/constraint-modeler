<template>
  <div
    class="navbar navbar-expand-lg navbar-dark bg-dark projection-bar mb-1 px-2"
    :id="projectionId"
    data-test="projection"
    data-testid="projection"
  >
    <div class="collapse navbar-collapse">
      <ul class="navbar-nav">
        <li class="nav-item dropdown" :id="aggregateId">
          <query-function-menu
            :query-function="queryFunctionEnum"
            :template-prefix="templatePrefix"
            v-on:setQueryFunction="setQueryFunctionEnum"
          />
        </li>

        <li
          class="nav-item active dropdown"
          :id="propertyId"
          data-testid="projection-property-menu"
        >
          <property-menu
            :property="property"
            :property-list="propertyList"
            :multi-property-list="multiPropertyList"
            :template-prefix="templatePrefix"
            v-on:setProperty="setProperty"
          />
        </li>
      </ul>

      <ul class="navbar-nav ms-auto">
        <li>
          <div class="validity"></div>
        </li>

        <form class="form-inline">
          <button class="btn btn-sm btn-secondary" @click.prevent="removeProjection">X</button>
        </form>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from "vue";
import QueryFunctionMenu from "../shared/QueryFunctionMenu.vue";
import PropertyMenu from "../shared/PropertyMenu.vue";
import ProjectionModel from "../../model/ProjectionModel";
import { emitterKey } from "../../keys";

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
div.navbar {
  margin-left: 15px;
}

.projection-bar {
  width: 400px;
}
</style>
