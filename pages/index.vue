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
    />
  </NuxtLink>
</template>

<script setup lang="ts">
import { useNotes } from "~/composables/useNotes";

const { notes } = useNotes();

useHead({
  title: "Test project",
});
</script>

<style scoped>
.no-underline {
  text-decoration: none;
}
</style>
