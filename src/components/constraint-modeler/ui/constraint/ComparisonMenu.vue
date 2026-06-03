<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="menu" size="xs"
        >{{ comparisonType.label }} <ChevronDown :size="12"
      /></Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem
        v-for="item in comparisonTypeArray"
        :key="item.key"
        @click.prevent="setComparator(item.key)"
      >
        {{ item.label }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { ComparisonTypeEnum } from "../../enum/ComparisonTypeEnum";
import { DataTypeEnum } from "../../enum/DataTypeEnum";
import { PropertyTypeEnum } from "../../enum/PropertyTypeEnum";
import Property from "../../Property";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "@lucide/vue";

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
