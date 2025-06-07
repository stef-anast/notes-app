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
    <div class="flex justify-center items-center mt-5">
      <BaseButton
        variant="ghost"
        color="secondary"
        text="Back to all notes"
        @click="handleBack"
        size="small"
        class="back-button"
      />
    </div>
    <EditNoteModal v-if="note" ref="editNoteModal" @update="onNoteUpdate" />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { useNotes, type Note } from "~/composables/useNotes";
import EditNoteModal from "~/components/EditNoteModal.vue";
import { ref } from "vue";

definePageMeta({
  layout: "note",
});

const route = useRoute();
const { findNote } = useNotes();
const noteIdParam = route.params.id;
const noteId = Array.isArray(noteIdParam) ? noteIdParam[0] : noteIdParam;

const note = ref<Note | undefined>(findNote(noteId));
const editNoteModal = ref();

if (!note.value) {
  await navigateTo("/", { replace: true });
}

// Set the browser tab title to the note's title
if (note.value) {
  useHead({
    title: note.value.title,
  });
}

const handleBack = () => {
  navigateTo("/");
};

const openEditModal = () => {
  if (note.value) {
    editNoteModal.value?.openModal(note.value);
  }
};

const onNoteUpdate = (updatedNote: Note) => {
  note.value = updatedNote;
};

const onCheckboxChange = (newSelectedItems: (string | number)[]) => {
  if (note.value) {
    const updatedNote = { ...note.value, selectedItems: newSelectedItems };
    note.value = updatedNote;
    const { updateNote } = useNotes();
    updateNote(updatedNote);
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
