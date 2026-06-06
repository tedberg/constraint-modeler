<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <h5 :class="cn('cm:mb-1 cm:font-medium cm:leading-none cm:tracking-tight', props.class)">
    <slot />
  </h5>
</template>
