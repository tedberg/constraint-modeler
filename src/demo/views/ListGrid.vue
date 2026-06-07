<template>
  <div class="cm:overflow-x-auto">
    <table class="cm:w-full cm:text-sm cm:border-collapse cm:border cm:border-zinc-300">
      <thead>
        <tr class="cm:bg-zinc-100">
          <th
            v-for="field in normalizedFields"
            :key="field.key"
            class="cm:border cm:border-zinc-300 cm:px-3 cm:py-2 cm:text-left cm:font-medium cm:text-zinc-700"
            :class="{ 'cm:cursor-pointer cm:select-none': field.sortable }"
            @click="field.sortable ? toggleSort(field.key) : undefined"
          >
            {{ field.label ?? field.key }}
            <span v-if="sortKey === field.key">{{ sortDir === "asc" ? " ↑" : " ↓" }}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, i) in sortedItems"
          :key="i"
          class="cm:odd:bg-white cm:even:bg-zinc-50 cm:hover:bg-zinc-100"
        >
          <td
            v-for="field in normalizedFields"
            :key="field.key"
            class="cm:border cm:border-zinc-300 cm:px-3 cm:py-2 cm:text-zinc-800"
          >
            {{ field.formatter ? field.formatter(row[field.key]) : row[field.key] }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

type FieldDef = {
  key: string;
  label?: string;
  sortable?: boolean;
  formatter?: (value: unknown) => string;
};

const props = withDefaults(
  defineProps<{
    objectName: string;
    maxRowsPerPage?: number;
    name?: string;
    fields: (string | FieldDef)[];
    items?: Record<string, unknown>[];
  }>(),
  {
    items: () => [],
  },
);

const normalizedFields = computed<FieldDef[]>(() =>
  props.fields.map((f) => (typeof f === "string" ? { key: f } : f)),
);

const sortKey = ref<string | null>(null);
const sortDir = ref<"asc" | "desc">("asc");

function toggleSort(key: string) {
  if (sortKey.value === key) {
    if (sortDir.value === "asc") {
      sortDir.value = "desc";
    } else {
      sortKey.value = null;
    }
  } else {
    sortKey.value = key;
    sortDir.value = "asc";
  }
}

const sortedItems = computed(() => {
  if (!sortKey.value) return props.items;
  const key = sortKey.value;
  const dir = sortDir.value === "asc" ? 1 : -1;
  return [...props.items].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (av == null) return 1;
    if (bv == null) return -1;
    return av < bv ? -dir : av > bv ? dir : 0;
  });
});
</script>
