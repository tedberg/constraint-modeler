<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="menu" size="xs"
        >{{ queryFunctionDisplay }} <ChevronDown :size="12"
      /></Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuLabel>Aggregates</DropdownMenuLabel>
      <DropdownMenuItem
        v-for="item in aggregateArray"
        :key="item.key"
        @click.prevent="setQueryFunction(item.key)"
      >
        {{ item.label }}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuLabel>Functions</DropdownMenuLabel>
      <DropdownMenuItem
        v-for="item in queryFunctionArray"
        :key="item.key"
        @click.prevent="setQueryFunction(item.key)"
      >
        {{ item.label }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { QueryFunctionEnum } from "../../enum/QueryFunctionEnum";
import { DataTypeEnum } from "../../enum/DataTypeEnum";
import { GeneralEnum } from "../../enum/Enum";
import Property from "../../Property";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "@lucide/vue";

const props = defineProps({
  templatePrefix: { type: String, required: true },
  property: { type: Object },
  queryFunction: { type: Object },
});

const emit = defineEmits(["setQueryFunction"]);

const queryFunctionArray = ref<any[]>([]);
const aggregateArray = ref<any[]>([]);

// replaces created()
if (props.property) {
  const p = props.property as any;
  if (p.multiProperty) {
    queryFunctionArray.value = QueryFunctionEnum.getQueryFunctionValueListForInputType(
      DataTypeEnum.COLLECTION,
    );
    aggregateArray.value = [];
  } else {
    const inputType = DataTypeEnum.getTypeFromAlias(p.simpleDataType);
    queryFunctionArray.value = QueryFunctionEnum.getQueryFunctionValueListForInputType(inputType);
    aggregateArray.value = QueryFunctionEnum.getAggregateFunctionValueListForInputType(inputType);
  }
} else {
  queryFunctionArray.value = QueryFunctionEnum.getQueryFunctionValueList();
  aggregateArray.value = QueryFunctionEnum.getAggregateFunctionValueList();
}
aggregateArray.value.unshift((GeneralEnum as any).NONE);

const queryFunctionDisplay = computed(() =>
  props.queryFunction ? (props.queryFunction as any).label : "None",
);

function setQueryFunction(enumKey: string) {
  emit("setQueryFunction", enumKey);
}
</script>
