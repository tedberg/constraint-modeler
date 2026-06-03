<template>
  <div class="constraint-modeler">
    <div v-if="title">
      <div class="title">{{ title }}</div>
    </div>

    <div v-if="componentReady">
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
        @addProjection="addProjection"
        @removeProjection="removeProjection"
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
        <Alert v-if="syntaxDisplay !== ''" variant="default" class="mb-2">
          <AlertDescription>
            <span class="syntaxDisplay">{{ syntaxDisplay }}</span>
            <Button variant="ghost" size="sm" class="ml-2" @click="syntaxDisplay = ''">x</Button>
          </AlertDescription>
        </Alert>

        <Alert v-if="successDisplay !== ''" class="mb-2 border-green-600 text-green-400">
          <AlertDescription>
            {{ successDisplay }}
            <Button variant="ghost" size="sm" class="ml-2" @click="successDisplay = ''">x</Button>
          </AlertDescription>
        </Alert>

        <Alert v-if="errorDisplay !== ''" variant="destructive" class="mb-2">
          <AlertDescription>
            {{ errorDisplay }}
            <Button variant="ghost" size="sm" class="ml-2" @click="errorDisplay = ''">x</Button>
          </AlertDescription>
        </Alert>
      </div>

      <div class="buttons">
        <Button variant="default" size="sm" class="mt-2 me-2" @click.prevent="validateAndApply()"
          >Apply</Button
        >
        <Button variant="default" size="sm" class="mt-2 me-2" @click.prevent="renderSyntax()"
          >Render Syntax</Button
        >
        <Button
          v-if="isSaveSupported"
          variant="default"
          size="sm"
          class="mt-2 me-2"
          @click.prevent="save()"
          >Save</Button
        >
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
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  border-radius: 7px;
  font-size: 0.9em;
  padding: 10px;
  margin: 0 0 15px;
  background-color: #eee;
  color: #2c3e50;
  width: fit-content;
  height: fit-content;
  min-width: 400px;

  & :deep(.buttons) {
    text-align: center;
  }

  & :deep(.title) {
    color: #444;
    border-radius: 7px;
    background-color: #ccc;
    font-size: 1.2em;
    font-weight: bold;
    padding: 5px 0 6px;
    margin: 0 0 5px;
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
