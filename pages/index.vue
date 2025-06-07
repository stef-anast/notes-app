<template>
  <NuxtLink
    v-for="note in notes"
    :key="note.id"
    :to="`/note/${note.id}`"
    class="no-underline"
  >
    <BaseCard
      :title="note.title"
      :description="note.description"
      :type="note.type"
      :imageUrl="note.imageUrl"
      :checkboxItems="note.checkboxItems"
      :modelValue="note.selectedItems"
      @update:modelValue="
        (newSelectedItems) => onCheckboxChange(note.id, newSelectedItems)
      "
    />
  </NuxtLink>
</template>

<script setup lang="ts">
import { useNotes } from "~/composables/useNotes";

const { notes, updateNote } = useNotes();

useHead({
  title: "Test project",
});

const onCheckboxChange = (
  noteId: string | number,
  newSelectedItems: (string | number)[]
) => {
  const noteToUpdate = notes.value.find((n) => n.id === noteId);
  if (noteToUpdate) {
    const updatedNote = { ...noteToUpdate, selectedItems: newSelectedItems };
    updateNote(updatedNote);
  }
};
</script>

<style scoped>
.no-underline {
  text-decoration: none;
}
</style>
