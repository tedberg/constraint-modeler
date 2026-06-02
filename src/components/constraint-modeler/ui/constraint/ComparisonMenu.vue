<template>
  <b-nav-item-dropdown :text="comparisonType.label">
    <b-dropdown-item
      v-for="item in comparisonTypeArray"
      :key="item.key"
      @click.prevent="setComparator(item.key)"
      >{{ item.label }}</b-dropdown-item
    >
  </b-nav-item-dropdown>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { ComparisonTypeEnum } from "../../enum/ComparisonTypeEnum";
import { DataTypeEnum } from "../../enum/DataTypeEnum";
import { PropertyTypeEnum } from "../../enum/PropertyTypeEnum";
import Property from "../../Property";

const props = defineProps({
  templatePrefix: { type: String, required: true },
  dataType: {
    type: Object,
    required: true,
    validator: (m: unknown) => DataTypeEnum.checkInstanceOf(m),
  },
  queryFunction: { type: Object, required: false },
  property: { type: Object, required: false },
  comparisonType: {
    type: Object,
    required: true,
    validator: (m: unknown) => ComparisonTypeEnum.checkInstanceOf(m),
  },
});

const emit = defineEmits(["setComparator"]);

const comparisonTypeArray = computed(() => {
  if (!props.dataType) return ComparisonTypeEnum.enumToValueList();
  if (props.queryFunction && (props.queryFunction as any).getOutputDataType) {
    return ComparisonTypeEnum.getAllForDataType(
      (props.queryFunction as any).getOutputDataType(),
      PropertyTypeEnum.SINGLE,
    );
  }
  if (props.property) {
    return (props.property as any).multiProperty
      ? ComparisonTypeEnum.getAllForDataType(props.dataType, PropertyTypeEnum.MULTI)
      : ComparisonTypeEnum.getAllForDataType(props.dataType, PropertyTypeEnum.SINGLE);
  }
  return ComparisonTypeEnum.getAllForDataType(props.dataType, PropertyTypeEnum.ALL);
});

watch(
  () => props.dataType,
  () => {
    /* trigger recompute */
  },
);

function setComparator(enumKey: string) {
  emit("setComparator", ComparisonTypeEnum.getType(enumKey));
}
</script>

<style scoped></style>
