<template>
  <ul v-if="hasNestedList" class="list-none py-1">
    <li v-for="nestedProperty in nestedPropertyList" :key="nestedProperty.path">
      <a
        class="block px-2 py-1 text-xs hover:bg-white/10 cursor-pointer"
        @click.prevent="setProperty"
        >{{ propertyDisplay(nestedProperty) }}</a
      >
    </li>

    <li v-if="nestedMultiPropertyList" class="border-t border-zinc-600 my-1"></li>
    <li v-if="nestedMultiPropertyList" class="px-2 py-1 text-xs font-semibold text-zinc-400">
      Multi Properties
    </li>
    <li v-for="nestedProperty in nestedMultiPropertyList" :key="nestedProperty.path">
      <a
        class="block px-2 py-1 text-xs hover:bg-white/10 cursor-pointer"
        @click.prevent="setMultiProperty"
        >{{ propertyDisplay(nestedProperty) }}</a
      >
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
