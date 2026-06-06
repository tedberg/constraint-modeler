<script setup lang="ts">
import type { DropdownMenuSubTriggerProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { reactiveOmit } from "@vueuse/core";
import { ChevronRight } from "@lucide/vue";
import { DropdownMenuSubTrigger, useForwardProps } from "reka-ui";
import { cn } from "@/lib/utils";

const props = defineProps<DropdownMenuSubTriggerProps & { class?: HTMLAttributes["class"] }>();

const delegatedProps = reactiveOmit(props, "class");

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <DropdownMenuSubTrigger
    v-bind="forwardedProps"
    :class="
      cn(
        'cm:flex cm:cursor-default cm:select-none cm:items-center cm:rounded-sm cm:px-2 cm:py-1.5 cm:text-sm cm:outline-none cm:focus:bg-accent cm:data-[state=open]:bg-accent',
        props.class,
      )
    "
  >
    <slot />
    <ChevronRight class="cm:ml-auto cm:h-4 cm:w-4" />
  </DropdownMenuSubTrigger>
</template>
