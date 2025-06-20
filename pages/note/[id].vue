<template>
  <div class="note-detail-container">
    <div class="flex justify-end button-section">
      <BaseButton
        variant="ghost"
        color="dark"
        :icon="true"
        iconName="edit"
        text="Edit"
        size="small"
        @click="openEditModal"
      />
    </div>
    <BaseCard
      v-if="note"
      :title="note.title"
      :description="note.description"
      :type="note.type"
      :imageUrl="note.imageUrl"
      :checkboxItems="note.checkboxItems"
      :modelValue="note.selectedItems"
      @update:modelValue="onCheckboxChange"
      :truncateDescription="false"
      :hoverable="false"
    />
    <div class="flex justify-center items-center mt-6 pb-6">
      <BaseButton
        variant="ghost"
        color="secondary"
        text="Back to all notes"
        @click="handleBack"
        size="small"
        class="back-button"
      />
    </div>
    <EditNoteModal v-if="note" ref="editNoteModal" />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { useNotesStore } from "~/store/notes";
import type { Note } from "~/types";
import EditNoteModal from "~/components/EditNoteModal.vue";
import { ref, computed, watch } from "vue";

definePageMeta({
  layout: "note",
});

const route = useRoute();
const notesStore = useNotesStore();
const noteIdParam = route.params.id;
const noteId = Array.isArray(noteIdParam) ? noteIdParam[0] : noteIdParam;

const note = computed(() => notesStore.findNote(noteId));
const editNoteModal = ref();

watch(
  note,
  (newNote) => {
    if (!newNote) {
      navigateTo("/", { replace: true });
    }
  },
  { immediate: true }
);

useHead(() => ({
  title: note.value?.title || "Note",
}));

const handleBack = () => {
  navigateTo("/");
};

const openEditModal = () => {
  if (note.value) {
    editNoteModal.value?.openModal(note.value);
  }
};

const onCheckboxChange = (newSelectedItems: string[]) => {
  if (note.value) {
    const updatedNote = { ...note.value, selectedItems: newSelectedItems };
    notesStore.updateNote(updatedNote);
  }
};
</script>

<style scoped>
.note-detail-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}

.button-section {
  margin-bottom: 1rem;
}
</style>
