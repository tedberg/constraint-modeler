<template>
  <div class="constraint-modeler cm:bg-card cm:text-card-foreground">
    <div v-if="title">
      <div class="title cm:bg-muted cm:text-muted-foreground">{{ title }}</div>
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
        <Alert v-if="syntaxDisplay !== ''" variant="default" class="cm:mb-2">
          <AlertDescription>
            <span class="syntaxDisplay">{{ syntaxDisplay }}</span>
            <Button variant="ghost" size="sm" class="cm:ml-2" @click="syntaxDisplay = ''">x</Button>
          </AlertDescription>
        </Alert>

        <Alert v-if="successDisplay !== ''" class="cm:mb-2 cm:border-green-600 cm:text-green-400">
          <AlertDescription>
            {{ successDisplay }}
            <Button variant="ghost" size="sm" class="cm:ml-2" @click="successDisplay = ''"
              >x</Button
            >
          </AlertDescription>
        </Alert>

        <Alert v-if="errorDisplay !== ''" variant="destructive" class="cm:mb-2">
          <AlertDescription>
            {{ errorDisplay }}
            <Button variant="ghost" size="sm" class="cm:ml-2" @click="errorDisplay = ''">x</Button>
          </AlertDescription>
        </Alert>
      </div>

      <div class="buttons">
        <Button
          variant="default"
          size="sm"
          class="cm:mt-2 cm:me-2"
          @click.prevent="validateAndApply()"
          >Apply</Button
        >
        <Button variant="default" size="sm" class="cm:mt-2 cm:me-2" @click.prevent="renderSyntax()"
          >Render Syntax</Button
        >
        <Button
          v-if="isSaveSupported"
          variant="default"
          size="sm"
          class="cm:mt-2 cm:me-2"
          @click.prevent="save()"
          >Save</Button
        >
      </div>
    </div>
    <!-- Portal target lives at body level so fixed-position dropdowns compute
         coordinates correctly regardless of any CSS transform on the host. -->
    <Teleport to="body">
      <div class="constraint-modeler-portal" ref="dropdownPortalRef" />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, provide, onMounted, reactive, useTemplateRef } from "vue";
import type { PropType } from "vue";
import mitt from "mitt";
import ConstraintGroup from "./constraint/ConstraintGroup.vue";
import ProjectionGroup from "./projection/ProjectionGroup.vue";
import Model from "../model/Model";
import ConstraintModelerResource from "../ConstraintModelerResource";
import AbstractConstraintModelerResource from "../AbstractConstraintModelerResource";
import { emitterKey, resourceKey, dropdownPortalKey } from "../keys";
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
    type: Object as PropType<AbstractConstraintModelerResource>,
    default: () => new ConstraintModelerResource(),
    validator: (m: unknown) => AbstractConstraintModelerResource.isValidImplementation(m),
  },
  saveFunction: { type: Function, default: null },
});

const emit = defineEmits(["applyConstraintsToData"]);

const emitter = mitt<Events>();
const model = reactive(new Model(props.objectName, props.constraintModelerResource));
const dropdownPortalRef = useTemplateRef<HTMLElement>("dropdownPortalRef");

provide(emitterKey, emitter);
provide(resourceKey, props.constraintModelerResource);
provide(dropdownPortalKey, dropdownPortalRef);

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

:deep(.constraint-group-bar button),
:deep(.constraint-bar button),
:deep(.projection-bar button),
:deep(.projection-group-bar button) {
  background-color: color-mix(in oklch, var(--cm-bar-foreground) 18%, transparent);
  color: var(--cm-bar-foreground);
  border: none;
}

:deep(.constraint-group-bar button:hover),
:deep(.constraint-bar button:hover),
:deep(.projection-bar button:hover),
:deep(.projection-group-bar button:hover) {
  background-color: color-mix(in oklch, var(--cm-bar-foreground) 28%, transparent);
}

div.constraint-modeler {
  all: revert-layer;
  box-sizing: border-box;
  font-family: system-ui, sans-serif;
  border-radius: 7px;
  font-size: 0.9em;
  padding: 10px;
  margin: 0 0 15px;
  width: max-content;
  max-width: 100%;
  height: fit-content;
  min-width: 400px;

  & :deep(.buttons) {
    text-align: center;
  }

  & :deep(.title) {
    border-radius: 7px;
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
