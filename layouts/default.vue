<template>
  <div class="default-layout">
    <AppHeader />
    <main class="main-content">
      <section class="content-header">
        <h2 class="font-semibold font-inter">Notes</h2>
        <div class="actions">
          <FilterChips
            v-if="showFiltersInHeader"
            :filters="selectedFilters"
            :filterOptions="filterOptions"
            @removeFilter="removeFilter"
          />
          <FilterDropdown
            :modelValue="selectedFilters"
            :options="filterOptions"
            @update:modelValue="selectedFilters = $event"
            :disabled="notesStore.notes.length === 0"
          />
          <BaseButton
            class="add-new-button"
            :text="isSmallScreenSize ? undefined : 'Add New'"
            :icon="true"
            iconPosition="left"
            :size="isSmallScreenSize ? 'icon' : 'medium'"
            @click="openCreateNoteModal"
          />
        </div>
      </section>
      <div
        v-if="showFiltersBelow"
        class="actions flex justify-end mb-4 flex-wrap"
      >
        <FilterChips
          :filters="selectedFilters"
          :filterOptions="filterOptions"
          @removeFilter="removeFilter"
        />
      </div>
      <section
        :class="
          notesStore.filteredNotes.length > 0
            ? 'card-grid'
            : 'flex-grow flex flex-col'
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
import FilterChips from "~/components/FilterChips.vue";
import { useNotesStore } from "~/store/notes";
import { NoteType } from "~/types";
import { useIcons } from "~/composables/useIcons";
import { useViewport } from "~/composables/useViewport";

const { isSmallScreenSize, isMediumScreenSize } = useViewport();

const notesStore = useNotesStore();
const createNoteModal = ref<InstanceType<typeof CreateNoteModal> | null>(null);

const openCreateNoteModal = () => {
  createNoteModal.value?.openModal();
};

const selectedFilters = computed({
  get: () => Array.from(notesStore.selectedFilters),
  set: (value: NoteType[]) => notesStore.setFilters(value),
});

const filterOptions = ref([
  { value: NoteType.Default, label: "Default" },
  { value: NoteType.Image, label: "Image" },
  { value: NoteType.Checkbox, label: "Checkbox" },
]);

const removeFilter = (filterToRemove: NoteType) => {
  notesStore.removeFilter(filterToRemove);
};

const showFiltersInHeader = computed(() => {
  return (
    selectedFilters.value.length > 0 &&
    !(isSmallScreenSize.value || isMediumScreenSize.value)
  );
});

const showFiltersBelow = computed(() => {
  return (
    selectedFilters.value.length > 0 &&
    (isSmallScreenSize.value || isMediumScreenSize.value)
  );
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
