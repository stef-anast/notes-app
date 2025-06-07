<template>
  <div class="default-layout">
    <AppHeader />
    <main class="main-content">
      <section class="content-header">
        <h2 class="font-semibold font-inter">Title</h2>
        <div class="actions">
          <div v-if="selectedFilters.length" class="flex items-center">
            <div
              v-for="filter in sortedSelectedFilters"
              :key="filter"
              class="flex items-center gap-x-1.5 text-gray-800 font-semibold px-3"
            >
              {{ getFilterLabel(filter) }}
              <button @click="removeFilter(filter)" class="focus:outline-none">
                <IconClose
                  class="w-5 h-5 pt-0.25 text-gray-600 cursor-pointer hover:text-gray-800"
                />
              </button>
            </div>
          </div>
          <FilterDropdown
            :modelValue="selectedFilters"
            :options="filterOptions"
            @update:modelValue="selectedFilters = $event"
            :disabled="notesStore.notes.length === 0"
          />
          <BaseButton
            class="add-new-button"
            text="Add New"
            :icon="true"
            iconPosition="left"
            @click="openCreateNoteModal"
          />
        </div>
      </section>
      <section
        :class="
          notesStore.notes.length > 0 ? 'card-grid' : 'flex-grow flex flex-col'
        "
      >
        <slot />
      </section>
    </main>
    <CreateNoteModal ref="createNoteModal" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import CreateNoteModal from "~/components/CreateNoteModal.vue";
import { useNotesStore } from "~/store/notes";
import IconClose from "~/components/icons/IconClose.vue";

const notesStore = useNotesStore();
const createNoteModal = ref<InstanceType<typeof CreateNoteModal> | null>(null);

const openCreateNoteModal = () => {
  createNoteModal.value?.openModal();
};

const selectedFilters = ref<(string | number)[]>([]);
const filterOptions = ref([
  { value: "type1", label: "Type 1" },
  { value: "type2", label: "Type 2" },
  { value: "type3", label: "Type 3" },
]);

const getFilterLabel = (value: string | number) => {
  const option = filterOptions.value.find((opt) => opt.value === value);
  return option ? option.label : "";
};

const removeFilter = (filterToRemove: string | number) => {
  selectedFilters.value = selectedFilters.value.filter(
    (filter) => filter !== filterToRemove
  );
};

const sortedSelectedFilters = computed(() => {
  return [...selectedFilters.value].sort();
});
</script>

<style scoped>
.sticky-header-container {
  position: sticky;
  top: 0;
  z-index: 50;
  background-color: #f8f8f8;
  padding: 0 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.default-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f8f8;
}

.main-content {
  flex-grow: 1;
  padding: 6rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
}

.content-header {
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.content-header h2 {
  margin: 0;
  font-size: 1.75rem;
}

.actions {
  display: flex;
  gap: 0.75rem;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}
</style>
