<template>
  <ul v-if="hasNestedList" class="dropdown-menu">
    <li v-for="nestedProperty in nestedPropertyList" :key="nestedProperty.path">
      <a @click.prevent="setProperty">{{ propertyDisplay(nestedProperty) }}</a>

      <!--{{#$$ ../objectId ../templatePrefix }}-->

      <!--{{! Recursive call here. Since JSON limits to 4, don't have to check level, if block above takes care of infinite loop. TODO, don't show >> if at max level.}}-->
      <!--{{> propertyMenuPartial}}-->

      <!--{{/$$}}-->
    </li>

    <li v-if="nestedMultiPropertyList" class="divider"></li>
    <li v-if="nestedMultiPropertyList" class="nav-header">Multi Properties</li>
    <li v-for="nestedProperty in nestedMultiPropertyList" :key="nestedProperty.path">
      <a @click.prevent="setMultiProperty">{{ propertyDisplay(nestedProperty) }}</a>

      <!--{{#$$ ../objectId ../templatePrefix }}-->

      <!--{{! Recursive call here. Since JSON limits to 4, don't have to check level, if block above takes care of infinite loop.}}-->
      <!--{{> propertyMenuPartial}}-->

      <!--{{/$$}}-->
    </li>
  </ul>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  templatePrefix: { type: String, required: true },
  property: { type: Object, required: true },
  nestedPropertyList: { type: Array, default: () => [] },
  nestedMultiPropertyList: { type: Array, default: () => [] },
});

const hasNestedList = computed(
  () =>
    (Array.isArray(props.nestedPropertyList) && props.nestedPropertyList.length > 0) ||
    (Array.isArray(props.nestedMultiPropertyList) && props.nestedMultiPropertyList.length > 0),
);

function propertyDisplay(property: any) {
  return property.displayName + " " + (typeof property.simpleDataType === "object" ? "»" : "");
}
</script>

<style scoped></style>
