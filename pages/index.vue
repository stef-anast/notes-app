<template>
  <template v-if="notes.length > 0">
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
  <div
    v-else
    class="flex text-center justify-center flex-grow items-center font-inter pb-24"
  >
    <div>
      <p class="text-lg text-gray-400 font-light">
        You don't have any notes yet.
      </p>
      <p class="mt-4 text-xl text-gray-500 font-light">
        Click "Add New" to get started!
      </p>
    </div>
  </div>
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
