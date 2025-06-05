<template>
  <div class="note-detail-container">
    <BaseButton
      variant="ghost"
      color="secondary"
      :icon="true"
      iconName="back"
      text="Back to all notes"
      @click="handleBack"
      class="back-button"
    />
    <BaseCard
      v-if="note"
      :title="note.title"
      :description="note.description"
      :type="note.type"
      :imageUrl="note.imageUrl"
      :checkboxItems="note.checkboxItems"
      :modelValue="note.selectedItems"
      :truncateDescription="false"
      :hoverable="false"
    />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { useNotes } from "~/composables/useNotes";

definePageMeta({
  layout: "note",
});

const route = useRoute();
const { findNote } = useNotes();
const noteIdParam = route.params.id;
const noteId = Array.isArray(noteIdParam) ? noteIdParam[0] : noteIdParam;
const note = findNote(noteId);

if (!note) {
  await navigateTo("/", { replace: true });
}

// Set the browser tab title to the note's title
if (note) {
  useHead({
    title: note.title,
  });
}

const handleBack = () => {
  navigateTo("/");
};
</script>

<style scoped>
.note-detail-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}

.back-button {
  margin-bottom: 2rem;
}
</style>
