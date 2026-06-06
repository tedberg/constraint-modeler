<script setup lang="ts">
import type { DropdownMenuCheckboxItemEmits, DropdownMenuCheckboxItemProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { reactiveOmit } from "@vueuse/core";
import { Check } from "@lucide/vue";
import { DropdownMenuCheckboxItem, DropdownMenuItemIndicator, useForwardPropsEmits } from "reka-ui";
import { cn } from "@/lib/utils";

const props = defineProps<DropdownMenuCheckboxItemProps & { class?: HTMLAttributes["class"] }>();
const emits = defineEmits<DropdownMenuCheckboxItemEmits>();

const delegatedProps = reactiveOmit(props, "class");

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <DropdownMenuCheckboxItem
    v-bind="forwarded"
    :class="
      cn(
        'cm:relative cm:flex cm:cursor-default cm:select-none cm:items-center cm:rounded-sm cm:py-1.5 cm:pl-8 cm:pr-2 cm:text-sm cm:outline-none cm:transition-colors cm:focus:bg-accent cm:focus:text-accent-foreground cm:data-[disabled]:pointer-events-none cm:data-[disabled]:opacity-50',
        props.class,
      )
    "
  >
    <span class="cm:absolute cm:left-2 cm:flex cm:h-3.5 cm:w-3.5 cm:items-center cm:justify-center">
      <DropdownMenuItemIndicator>
        <Check class="cm:w-4 cm:h-4" />
      </DropdownMenuItemIndicator>
    </span>
    <slot />
  </DropdownMenuCheckboxItem>
</template>
