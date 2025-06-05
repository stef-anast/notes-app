<template>
  <div class="default-layout">
    <header class="page-header">
      <div class="project-tag font-lexend">Test project</div>
    </header>
    <main class="main-content">
      <section class="content-header">
        <h2 class="font-semibold font-inter">Title</h2>
        <div class="actions">
          <FilterDropdown
            :modelValue="selectedFilters"
            :options="filterOptions"
            @update:modelValue="selectedFilters = $event"
          />
          <BaseButton
            class="add-new-button"
            text="Add New"
            :icon="true"
            iconPosition="left"
          />
        </div>
      </section>
      <section class="card-grid">
        <slot />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

// Placeholder data for FilterDropdown
const selectedFilters = ref([]);
const filterOptions = ref([
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" },
]);
</script>

<style scoped>
.default-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f8f8;
}

.page-header {
  padding: 1rem 1.5rem;
}

.project-tag {
  display: inline-block;
  color: #0A0C11;
  padding: 0.25rem 0.75rem;
  border-radius: 0.75rem;
  letter-spacing: 1px;
  border: 2.5px solid #0A0C11;
  font-size: 22px;
  font-weight: 900;
}

.main-content {
  flex-grow: 1;
  padding: 1.5rem;
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
