<template>
  <BaseNoteForm
    ref="baseNoteForm"
    title="Create New Note"
    :initial-note="defaultNote"
  >
    <template #footer="{ isDisabled, getFormData }">
      <BaseButton
        text="Create"
        :disabled="isDisabled"
        @click="() => handleCreate(getFormData())"
        class="w-full mt-6"
        variant="solid"
        icon
        icon-name="note"
        size="large"
      />
    </template>
  </BaseNoteForm>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { Note } from "~/types";
import { NoteType } from "~/types";
import { useNotesStore } from "~/store/notes";

const notesStore = useNotesStore();
const baseNoteForm = ref();

const defaultNote: Partial<Note> = {
  type: NoteType.Default,
  title: "",
  description: "",
};

const openModal = () => {
  baseNoteForm.value?.openModal();
};

const handleCreate = (formData: Omit<Note, "id">) => {
  notesStore.addNote(formData);
  baseNoteForm.value?.closeModal();
};

defineExpose({ openModal });
</script>
