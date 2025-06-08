<template>
  <div
    v-if="filters.length"
    class="flex items-center flex-wrap font-geist text-sm"
  >
    <div
      v-for="filter in sortedFilters"
      :key="filter"
      class="flex items-center gap-x-1.5 text-gray-800 font-semibold px-3"
    >
      {{ getFilterLabel(filter) }}
      <button @click="$emit('removeFilter', filter)" class="focus:outline-none">
        <component
          :is="getIconComponent('close')"
          class="w-5 h-5 pt-0.25 text-gray-600 cursor-pointer hover:text-gray-800"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { NoteType } from "~/types";
import { useIcons } from "~/composables/useIcons";

interface Props {
  filters: NoteType[];
  filterOptions: Array<{ value: NoteType; label: string }>;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  removeFilter: [filter: NoteType];
}>();

const { getIconComponent } = useIcons();

const sortedFilters = computed(() => {
  return [...props.filters].sort();
});

const getFilterLabel = (value: NoteType) => {
  const option = props.filterOptions.find((opt) => opt.value === value);
  return option ? option.label : "";
};
</script>
