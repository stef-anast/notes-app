<template>
  <BaseNoteForm ref="baseNoteForm" title="Create New Card">
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
import type { Note } from "~/composables/useNotes";
import { useNotes } from "~/composables/useNotes";

const { addNote } = useNotes();
const baseNoteForm = ref();

const openModal = () => {
  baseNoteForm.value?.openModal();
};

const handleCreate = (formData: Omit<Note, "id">) => {
  addNote(formData);
  baseNoteForm.value?.closeModal();
};

defineExpose({ openModal });
</script>
