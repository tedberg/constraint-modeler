<script setup lang="ts">
import type { DropdownMenuContentEmits, DropdownMenuContentProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { inject } from "vue";
import { reactiveOmit } from "@vueuse/core";
import { DropdownMenuContent, DropdownMenuPortal, useForwardPropsEmits } from "reka-ui";
import { cn } from "@/lib/utils";
import { dropdownPortalKey } from "@/components/constraint-modeler/keys";

const props = withDefaults(
  defineProps<DropdownMenuContentProps & { class?: HTMLAttributes["class"] }>(),
  {
    sideOffset: 4,
  },
);
const emits = defineEmits<DropdownMenuContentEmits>();

const delegatedProps = reactiveOmit(props, "class");

const forwarded = useForwardPropsEmits(delegatedProps, emits);

// When inside a ConstraintModeler, portal into its container so dropdown panels
// inherit the component's CSS variables rather than :root (which the consuming
// app may override with its own theme).
const portalContainer = inject(dropdownPortalKey, null);
</script>

<template>
  <DropdownMenuPortal :to="portalContainer ?? undefined">
    <DropdownMenuContent
      v-bind="forwarded"
      :class="
        cn(
          'cm:z-50 cm:min-w-32 cm:overflow-hidden cm:rounded-md cm:border cm:bg-popover cm:p-1 cm:text-popover-foreground cm:shadow-md cm:data-[state=open]:animate-in cm:data-[state=closed]:animate-out cm:data-[state=closed]:fade-out-0 cm:data-[state=open]:fade-in-0 cm:data-[state=closed]:zoom-out-95 cm:data-[state=open]:zoom-in-95 cm:data-[side=bottom]:slide-in-from-top-2 cm:data-[side=left]:slide-in-from-right-2 cm:data-[side=right]:slide-in-from-left-2 cm:data-[side=top]:slide-in-from-bottom-2',
          props.class,
        )
      "
    >
      <slot />
    </DropdownMenuContent>
  </DropdownMenuPortal>
</template>
