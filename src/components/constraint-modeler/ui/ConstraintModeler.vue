<template>
  <div class="constraint-modeler">
    <div v-if="title">
      <div class="title">{{ title }}</div>
    </div>

    <div v-if="componentReady">
      <!-- else loading animation? -->

      <constraint-group
        :constraint-group-model="rootConstraintGroup"
        :templatePrefix="templatePrefix"
        :propertyList="propertyList"
        :multiPropertyList="multiPropertyList"
        :pathToPropertyMap="pathToPropertyMap"
      />

      <projection-group
        v-if="exposeProjectionModeler"
        :projection-group-model="model.getProjectionGroup()"
        :templatePrefix="templatePrefix"
        :propertyList="propertyList"
        :multiPropertyList="multiPropertyList"
        :pathToPropertyMap="pathToPropertyMap"
        v-on:addProjection="addProjection"
        v-on:removeProjection="removeProjection"
      />

      <div v-if="showDebug" style="width: 250px" class="debug-panel">
        <div class="header" id="toggle-constraintModelerDebug">Debug Options</div>
        <ul class="constraintModelerDebug">
          <li><a @click.prevent="renderQueryString()">Render Query String</a></li>
          <li><a @click.prevent="renderSimpleJSON()">Render JSON</a></li>
          <li><a @click.prevent="renderFlattenedObjectList()">Render Flattened Object List</a></li>
          <li>
            <a @click.prevent="renderStructuredObjectList()">Render Structured Object List</a>
          </li>
        </ul>
      </div>

      <div class="alerts">
        <b-alert
          variant="dark"
          dismissible
          :model-value="syntaxDisplay !== ''"
          @closed="syntaxDisplay = ''"
        >
          <span class="syntaxDisplay">{{ syntaxDisplay }}</span>
        </b-alert>

        <b-alert
          variant="success"
          dismissible
          :model-value="successDisplay !== ''"
          @closed="successDisplay = ''"
        >
          {{ successDisplay }}
        </b-alert>

        <b-alert
          variant="danger"
          dismissible
          :model-value="errorDisplay !== ''"
          @closed="errorDisplay = ''"
        >
          {{ errorDisplay }}
        </b-alert>
      </div>

      <div class="buttons">
        <button
          class="btn btn-dark btn-sm mt-2 me-2"
          type="button"
          @click.prevent="validateAndApply()"
        >
          Apply
        </button>
        <button class="btn btn-dark btn-sm mt-2 me-2" type="button" @click.prevent="renderSyntax()">
          Render Syntax
        </button>
        <button
          class="btn btn-dark btn-sm mt-2 me-2"
          type="button"
          v-if="isSaveSupported"
          @click.prevent="save()"
        >
          Save
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, provide, onMounted, reactive } from "vue";
import mitt from "mitt";
import ConstraintGroup from "./constraint/ConstraintGroup.vue";
import ProjectionGroup from "./projection/ProjectionGroup.vue";
import Model from "../model/Model";
import ConstraintModelerResource from "../ConstraintModelerResource";
import AbstractConstraintModelerResource from "../AbstractConstraintModelerResource";
import { emitterKey, resourceKey } from "../keys";
import type { Events } from "../events";

const props = defineProps({
  title: { type: String, default: null },
  objectName: { type: String, required: true },
  showDebug: { type: Boolean, default: false },
  exposeProjectionModeler: { type: Boolean, default: false },
  initialModelJsonObject: { type: Object, default: () => null },
  constraintModelerResource: {
    type: Object,
    default: () => new ConstraintModelerResource(),
    validator: (m: unknown) => AbstractConstraintModelerResource.isValidImplementation(m),
  },
  saveFunction: { type: Function, default: null },
});

const emit = defineEmits(["applyConstraintsToData"]);

const emitter = mitt<Events>();
const model = reactive(new Model(props.objectName, props.constraintModelerResource));

provide(emitterKey, emitter);
provide(resourceKey, props.constraintModelerResource);

const componentReady = ref(false);
const syntaxDisplay = ref("");
const successDisplay = ref("");
const errorDisplay = ref("");
const templatePrefix = ref("test");

// replaces created()
model.loadProperties().then(() => {
  model.buildModelFromJson(props.initialModelJsonObject);
  if (props.exposeProjectionModeler) {
    model.addProjectionGroup();
  }
  console.log("Finished Model...", model);
  componentReady.value = true;
});

onMounted(() => {
  emitter.on("apply", () => {
    validateAndApply();
  });
  emitter.on("setJunction", ([constraintGroupModel, junctionEnum]) => {
    constraintGroupModel.setJunction(junctionEnum);
  });
  emitter.on("addConstraint", (constraintGroupModel) => {
    constraintGroupModel.addConstraint();
  });
  emitter.on("addConstraintGroup", (constraintGroupModel) => {
    constraintGroupModel.addConstraintGroup();
  });
  emitter.on("removeConstraintGroup", (constraintGroupModel) => {
    rootConstraintGroup.value.removeConstraintGroupRecursively(constraintGroupModel.getObjectId());
  });
  emitter.on("setQueryFunctionEnum", ([constraintModel, enumKey]) => {
    constraintModel.setQueryFunction(enumKey);
  });
  emitter.on("setProperty", ([constraintModel, property]) => {
    constraintModel.setProperty(property);
  });
  emitter.on("setComparator", ([constraintModel, comparisonType]) => {
    constraintModel.setComparisonType(comparisonType);
  });
  emitter.on("updateValueArray", ([constraintModel, valueArray]) => {
    constraintModel.setValueArray(valueArray);
  });
  emitter.on("removeConstraint", ([constraintGroupModel, constraintModel]) => {
    constraintGroupModel.removeConstraint(constraintModel.getObjectId());
  });
  emitter.on("setProjectionQueryFunctionEnum", ([projectionModel, enumKey]) => {
    projectionModel.setQueryFunction(enumKey);
  });
  emitter.on("setProjectionProperty", ([projectionModel, property]) => {
    projectionModel.setProperty(property);
  });
});

const rootConstraintGroup = computed(() => model.getRootConstraintGroup());
const propertyList = computed(() => model.getPropertyList());
const multiPropertyList = computed(() => model.getMultiPropertyList());
const pathToPropertyMap = computed(() => model.getPathToPropertyMap());
const isSaveSupported = computed(() => typeof props.saveFunction === "function");

function validateAndApply() {
  console.log("validateAndApply");
  return model.validate().then((result: any) => {
    if (result?.success) {
      return model.apply().then((applyResult: any) => {
        emit("applyConstraintsToData", applyResult);
      });
    }
  });
}

function addProjection() {
  model.getProjectionGroup().addProjection();
}

function removeProjection(projection: any) {
  model.getProjectionGroup().removeProjection(projection.getObjectId());
}

function save() {
  if (isSaveSupported.value) {
    return model.validate().then((result: any) => {
      if (result?.success) {
        return props.saveFunction(model, true).then(() => {
          successDisplay.value = "This constraint model was saved.";
        });
      } else {
        errorDisplay.value = "This filter has failed validation.";
      }
    });
  } else {
    errorDisplay.value = "Save functionality is not supported.";
  }
}

function renderSyntax() {
  syntaxDisplay.value = model.renderSyntax();
  return syntaxDisplay.value;
}
function renderQueryString() {
  syntaxDisplay.value = model.renderQueryString();
  return syntaxDisplay.value;
}
function renderSimpleJSON() {
  syntaxDisplay.value = model.renderSimpleJSON();
  return syntaxDisplay.value;
}
function renderFlattenedObjectList() {
  syntaxDisplay.value = model.renderFlattenedObjectList();
  return syntaxDisplay.value;
}
function renderStructuredObjectList() {
  syntaxDisplay.value = model.renderStructuredObjectList();
  return syntaxDisplay.value;
}
</script>

<style scoped>
:deep(div.nest) {
  margin-left: 25px;
}

div.constraint-modeler {
  & :deep(.navbar .btn),
  & :deep(.navbar .btn-group .btn) {
    padding: 1px 4px;
  }
  & :deep(.nav-link) {
    padding-top: 0;
    padding-bottom: 0;
  }
  & :deep(div.navbar) {
    border-radius: 7px;
  }
  & :deep(input[type="text"]) {
    width: 100px;
  }
  & :deep(.buttons) {
    text-align: center;
  }
}

ul.constraintModelerDebug {
  & a {
    text-decoration: #0000cc;
    text-decoration-line: underline;
    cursor: pointer;
  }
}
</style>
