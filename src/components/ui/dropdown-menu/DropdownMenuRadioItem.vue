<script setup lang="ts">
import type { DropdownMenuRadioItemEmits, DropdownMenuRadioItemProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { reactiveOmit } from "@vueuse/core";
import { Circle } from "@lucide/vue";
import { DropdownMenuItemIndicator, DropdownMenuRadioItem, useForwardPropsEmits } from "reka-ui";
import { cn } from "@/lib/utils";

const props = defineProps<DropdownMenuRadioItemProps & { class?: HTMLAttributes["class"] }>();

const emits = defineEmits<DropdownMenuRadioItemEmits>();

const delegatedProps = reactiveOmit(props, "class");

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <DropdownMenuRadioItem
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
        <Circle class="cm:h-2 cm:w-2 cm:fill-current" />
      </DropdownMenuItemIndicator>
    </span>
    <slot />
  </DropdownMenuRadioItem>
</template>
