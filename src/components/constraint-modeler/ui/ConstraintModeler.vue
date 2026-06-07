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

      <div v-if="showDebug" class="debug-panel">
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
        <Alert v-if="syntaxDisplay !== ''" variant="default" class="constraint-modeler-alert cm:mb-2">
          <AlertDescription class="constraint-modeler-alert-content">
            <span class="constraint-modeler-alert-message syntaxDisplay">{{ syntaxDisplay }}</span>
            <Button
              variant="secondary"
              size="icon-xs"
              class="constraint-modeler-alert-dismiss"
              aria-label="Dismiss syntax message"
              title="Dismiss syntax message"
              @click="syntaxDisplay = ''"
            >
              <X :size="16" />
            </Button>
          </AlertDescription>
        </Alert>

        <Alert v-if="successDisplay !== ''" class="constraint-modeler-alert success-alert cm:mb-2">
          <AlertDescription class="constraint-modeler-alert-content">
            <span class="constraint-modeler-alert-message">{{ successDisplay }}</span>
            <Button
              variant="secondary"
              size="icon-xs"
              class="constraint-modeler-alert-dismiss"
              aria-label="Dismiss success message"
              title="Dismiss success message"
              @click="successDisplay = ''"
            >
              <X :size="16" />
            </Button>
          </AlertDescription>
        </Alert>

        <Alert
          v-if="errorDisplay !== ''"
          variant="destructive"
          class="constraint-modeler-alert cm:mb-2"
        >
          <AlertDescription class="constraint-modeler-alert-content">
            <span class="constraint-modeler-alert-message">{{ errorDisplay }}</span>
            <Button
              variant="secondary"
              size="icon-xs"
              class="constraint-modeler-alert-dismiss"
              aria-label="Dismiss error message"
              title="Dismiss error message"
              @click="errorDisplay = ''"
            >
              <X :size="16" />
            </Button>
          </AlertDescription>
        </Alert>
      </div>

      <div class="constraint-modeler-actions">
        <Button variant="default" size="compact" @click.prevent="validateAndApply()">Apply</Button>
        <Button variant="default" size="compact" @click.prevent="renderSyntax()"
          >Render Syntax</Button
        >
        <Button v-if="isSaveSupported" variant="default" size="compact" @click.prevent="save()"
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
import { X } from "@lucide/vue";

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
  margin-left: 1.5625rem;
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

.success-alert {
  border-color: var(--cm-success);
  color: var(--cm-success);
}

.alerts {
  width: 100%;
  max-width: 100%;
  contain: inline-size;
}

.constraint-modeler-alert {
  padding: 0.5rem;
  width: 100%;
  max-width: 100%;
}

.constraint-modeler-alert-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.constraint-modeler-alert-message {
  flex: 1 1 0;
  min-width: 0;
  max-width: 100%;
  overflow-wrap: anywhere;
  white-space: normal;
}

.constraint-modeler-alert-dismiss {
  flex: 0 0 auto;
  margin-left: auto;
}

div.constraint-modeler {
  box-sizing: border-box;
  font-family: system-ui, sans-serif;
  color: var(--cm-card-foreground);
  background-color: var(--cm-card);
  border-radius: var(--cm-radius);
  font-size: 0.9em;
  line-height: normal;
  padding: 0.625rem;
  margin: 0 0 0.9375rem;
  width: max-content;
  height: fit-content;
  min-width: 25rem;

  & :deep(.title) {
    border-radius: var(--cm-radius);
    font-size: 1.2em;
    font-weight: bold;
    padding: 0.3125rem 0 0.375rem;
    margin: 0 0 0.3125rem;
    text-align: center;
  }
}

.constraint-modeler-actions {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  padding-top: 0.5rem;
}

.debug-panel {
  width: 15.625rem;
}

div.constraint-modeler,
div.constraint-modeler :deep(*) {
  box-sizing: border-box;
}

ul.constraintModelerDebug {
  & a {
    color: var(--cm-primary);
    text-decoration-color: currentColor;
    text-decoration-line: underline;
    cursor: pointer;
  }
}
</style>
