<template>
  <template v-if="notesStore.filteredNotes.length > 0">
    <NuxtLink
      v-for="note in notesStore.filteredNotes"
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
      <p
        v-if="notesStore.notes.length === 0"
        class="text-lg text-gray-400 font-light"
      >
        You don't have any notes yet.
      </p>
      <p v-else class="text-lg text-gray-400 font-light">
        No notes match the selected filters.
      </p>
      <p
        v-if="notesStore.notes.length === 0"
        class="mt-4 text-xl text-gray-500 font-light"
      >
        Click "Add New" to get started!
      </p>
      <p v-else class="mt-4 text-xl text-gray-500 font-light">
        Try adjusting your filters or add a new note.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNotesStore } from "~/store/notes";

const notesStore = useNotesStore();

useHead({
  title: "Test project",
});

const onCheckboxChange = (noteId: number, newSelectedItems: string[]) => {
  const noteToUpdate = notesStore.notes.find((n) => n.id === noteId);
  if (noteToUpdate) {
    const updatedNote = { ...noteToUpdate, selectedItems: newSelectedItems };
    notesStore.updateNote(updatedNote);
  }
};
</script>
