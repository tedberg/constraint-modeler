<script setup lang="ts">
import type { DropdownMenuSubContentEmits, DropdownMenuSubContentProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { inject } from "vue";
import { reactiveOmit } from "@vueuse/core";
import { DropdownMenuSubContent, DropdownMenuPortal, useForwardPropsEmits } from "reka-ui";
import { cn } from "@/lib/utils";
import { dropdownPortalKey } from "@/components/constraint-modeler/keys";

const props = defineProps<DropdownMenuSubContentProps & { class?: HTMLAttributes["class"] }>();
const emits = defineEmits<DropdownMenuSubContentEmits>();

const delegatedProps = reactiveOmit(props, "class");

const forwarded = useForwardPropsEmits(delegatedProps, emits);

const portalContainer = inject(dropdownPortalKey, null);
</script>

<template>
  <DropdownMenuPortal :to="portalContainer ?? undefined">
    <DropdownMenuSubContent
      v-bind="forwarded"
      :class="
        cn(
          'cm:z-50 cm:min-w-32 cm:overflow-hidden cm:rounded-md cm:border cm:bg-popover cm:p-1 cm:text-popover-foreground cm:shadow-lg cm:data-[state=open]:animate-in cm:data-[state=closed]:animate-out cm:data-[state=closed]:fade-out-0 cm:data-[state=open]:fade-in-0 cm:data-[state=closed]:zoom-out-95 cm:data-[state=open]:zoom-in-95 cm:data-[side=bottom]:slide-in-from-top-2 cm:data-[side=left]:slide-in-from-right-2 cm:data-[side=right]:slide-in-from-left-2 cm:data-[side=top]:slide-in-from-bottom-2',
          props.class,
        )
      "
    >
      <slot />
    </DropdownMenuSubContent>
  </DropdownMenuPortal>
</template>
