<template>
  <b-table sm bordered striped hover :fields="fields" :items="items"> </b-table>
</template>

<script setup lang="ts">
defineProps({
  objectName: { type: String, required: true },
  maxRowsPerPage: { type: Number, default: 100 },
  name: { type: String, default: "" },
  fields: { type: Array, default: () => [] },
  items: { type: Array, required: true, default: () => [] },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
