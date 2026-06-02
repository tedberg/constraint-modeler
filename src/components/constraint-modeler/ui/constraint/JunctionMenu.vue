<template>
  <b-nav-item-dropdown :text="junction.label">
    <b-dropdown-item
      v-for="item in typesArray"
      :key="item.key"
      @click.prevent="setJunction(item.key)"
      >{{ item.label }}</b-dropdown-item
    >
  </b-nav-item-dropdown>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { JunctionEnum } from "../../enum/JunctionEnum";

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

<style scoped></style>
