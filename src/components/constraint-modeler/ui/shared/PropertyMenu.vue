<template>
  <b-nav-item-dropdown :text="propertyDisplay">
    <b-dropdown-item
      v-for="prop in propertyList"
      :key="prop.path"
      @click.prevent="setProperty(prop)"
    >
      {{ prop.displayName }} {{ typeof prop.simpleDataType === "object" ? "&raquo;" : "" }}
      <!--<property-menu-partial :property="prop" :template-prefix="templatePrefix" :object-id="objectId"/>-->
    </b-dropdown-item>

    <div v-if="multiPropertyList" class="dropdown-divider"></div>
    <h6 v-if="multiPropertyList" class="dropdown-header">Multi Properties</h6>

    <b-dropdown-item
      v-for="prop in multiPropertyList"
      :key="prop.path"
      @click.prevent="setProperty(prop)"
    >
      {{ prop.displayName }} {{ prop.isObjectType() ? "&raquo;" : "" }}
      <property-menu-partial :property="prop" :template-prefix="templatePrefix" />
    </b-dropdown-item>
  </b-nav-item-dropdown>
</template>

<script setup lang="ts">
import { computed } from "vue";
import PropertyMenuPartial from "./PropertyMenuPartial.vue";
import Property from "../../Property";

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

<style scoped></style>
