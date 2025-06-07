<template>
  <BaseNoteForm ref="baseNoteForm" title="Edit Note" :initial-note="noteToEdit">
    <template #footer="{ isDisabled, getFormData }">
      <div class="flex items-center gap-3 justify-between mt-6 w-full">
        <BaseButton
          text="Delete"
          @click="requestDeleteConfirmation"
          variant="light"
          color="danger"
          icon
          icon-name="trash"
          size="large"
          class="w-full"
        />
        <BaseButton
          text="Save"
          :disabled="isDisabled"
          @click="() => handleSave(getFormData())"
          variant="solid"
          color="primary"
          icon
          icon-name="save"
          size="large"
          class="w-full"
        />
      </div>
    </template>
  </BaseNoteForm>
  <ConfirmationModal
    ref="confirmationModal"
    title="Delete Note"
    message="Are you sure you want to delete this note? This action cannot be undone."
    confirm-button-text="Delete"
    confirm-button-color="danger"
    @confirm="handleDelete"
  />
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import type { Note } from "~/store/notes";
import { useNotesStore } from "~/store/notes";
import ConfirmationModal from "./ConfirmationModal.vue";

const notesStore = useNotesStore();
const baseNoteForm = ref();
const noteToEdit = ref<Note | undefined>();
const confirmationModal = ref();

const emit = defineEmits(["update"]);

const openModal = async (note: Note) => {
  noteToEdit.value = note;
  await nextTick();
  baseNoteForm.value?.openModal();
};

const handleSave = (formData: Note) => {
  notesStore.updateNote(formData);
  emit("update", formData);
  baseNoteForm.value?.closeModal();
};

const requestDeleteConfirmation = () => {
  confirmationModal.value?.openModal();
};

const handleDelete = () => {
  if (noteToEdit.value) {
    notesStore.deleteNote(noteToEdit.value.id);
    baseNoteForm.value?.closeModal();
    navigateTo("/");
  }
};

defineExpose({ openModal });
</script>
