<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="menu" size="xs">{{ junction.label }} <ChevronDown :size="12" /></Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem
        v-for="item in typesArray"
        :key="item.key"
        @click.prevent="setJunction(item.key)"
      >
        {{ item.label }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { JunctionEnum } from "../../enum/JunctionEnum";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "@lucide/vue";

const props = defineProps({
  junction: {
    type: Object,
    required: true,
    validator: (m: unknown) => JunctionEnum.checkInstanceOf(m),
  },
});

const emit = defineEmits(["setJunction"]);
const typesArray = ref(JunctionEnum.enumToValueList());

function setJunction(enumKey: string) {
  emit("setJunction", JunctionEnum.getType(enumKey));
}
</script>
