<template>
  <DropdownMenuSub v-if="hasChildren">
    <DropdownMenuSubTrigger>{{ property.displayName }}</DropdownMenuSubTrigger>
    <DropdownMenuSubContent>
      <PropertyMenuItem
        v-for="child in property.nestedPropertyList"
        :key="child.path"
        :property="child"
        :template-prefix="templatePrefix"
        @setProperty="(p: any) => emit('setProperty', p)"
      />
      <template v-if="property.nestedMultiPropertyList?.length">
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Multi Properties</DropdownMenuLabel>
        <PropertyMenuItem
          v-for="child in property.nestedMultiPropertyList"
          :key="child.path"
          :property="child"
          :template-prefix="templatePrefix"
          @setProperty="(p: any) => emit('setProperty', p)"
        />
      </template>
    </DropdownMenuSubContent>
  </DropdownMenuSub>

  <DropdownMenuItem v-else @click="emit('setProperty', property)">
    {{ property.displayName }}
  </DropdownMenuItem>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

const props = defineProps<{
  property: any;
  templatePrefix: string;
}>();

const emit = defineEmits<{
  setProperty: [property: any];
}>();

const hasChildren = computed(
  () =>
    (Array.isArray(props.property.nestedPropertyList) &&
      props.property.nestedPropertyList.length > 0) ||
    (Array.isArray(props.property.nestedMultiPropertyList) &&
      props.property.nestedMultiPropertyList.length > 0),
);
</script>
