<template>
  <div class="default-layout">
    <AppHeader />
    <main class="main-content">
      <section class="content-header">
        <h2 class="font-semibold font-inter">Title</h2>
        <div class="actions">
          <FilterDropdown
            :modelValue="selectedFilters"
            :options="filterOptions"
            @update:modelValue="selectedFilters = $event"
            :disabled="notes.length === 0"
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
        :class="notes.length > 0 ? 'card-grid' : 'flex-grow flex flex-col'"
      >
        <slot />
      </section>
    </main>
    <CreateNoteModal ref="createNoteModal" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import CreateNoteModal from "~/components/CreateNoteModal.vue";
import { useNotes } from "~/composables/useNotes";

const { notes } = useNotes();
const createNoteModal = ref<InstanceType<typeof CreateNoteModal> | null>(null);

const openCreateNoteModal = () => {
  createNoteModal.value?.openModal();
};

const selectedFilters = ref([]);
const filterOptions = ref([
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" },
]);
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

.no-underline {
  text-decoration: none;
}
</style>
