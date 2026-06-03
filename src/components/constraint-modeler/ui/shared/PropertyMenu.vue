<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="menu" size="xs">{{ propertyDisplay }} <ChevronDown :size="12" /></Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem
        v-for="prop in propertyList"
        :key="prop.path"
        @click.prevent="setProperty(prop)"
      >
        {{ prop.displayName }} {{ typeof prop.simpleDataType === "object" ? "»" : "" }}
      </DropdownMenuItem>
      <template v-if="multiPropertyList">
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Multi Properties</DropdownMenuLabel>
        <DropdownMenuItem
          v-for="prop in multiPropertyList"
          :key="prop.path"
          @click.prevent="setProperty(prop)"
        >
          {{ prop.displayName }} {{ prop.isObjectType() ? "»" : "" }}
          <PropertyMenuPartial :property="prop" :template-prefix="templatePrefix" />
        </DropdownMenuItem>
      </template>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
import { computed } from "vue";
import PropertyMenuPartial from "./PropertyMenuPartial.vue";
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
  propertyList: { type: Array },
  multiPropertyList: { type: Array },
  property: { type: Object },
});

const emit = defineEmits(["setProperty"]);

const propertyDisplay = computed(() => (props.property as any)?.displayName ?? "Chosen Value");

function setProperty(property: any) {
  emit("setProperty", property);
}
</script>
