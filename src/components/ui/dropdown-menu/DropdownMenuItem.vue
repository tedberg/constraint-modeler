<script setup lang="ts">
import type { DropdownMenuItemProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { reactiveOmit } from "@vueuse/core";
import { DropdownMenuItem, useForwardProps } from "reka-ui";
import { cn } from "@/lib/utils";

const props = defineProps<
  DropdownMenuItemProps & { class?: HTMLAttributes["class"]; inset?: boolean }
>();

const delegatedProps = reactiveOmit(props, "class");

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <DropdownMenuItem
    v-bind="forwardedProps"
    :class="
      cn(
        'cm:relative cm:flex cm:cursor-default cm:select-none cm:items-center cm:rounded-sm cm:gap-2 cm:px-2 cm:py-1.5 cm:text-sm cm:outline-none cm:transition-colors cm:focus:bg-accent cm:focus:text-accent-foreground cm:data-[disabled]:pointer-events-none cm:data-[disabled]:opacity-50 cm:[&>svg]:size-4 cm:[&>svg]:shrink-0',
        inset && 'cm:pl-8',
        props.class,
      )
    "
  >
    <slot />
  </DropdownMenuItem>
</template>
