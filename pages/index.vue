<template>
  <BaseCard
    title="Card 1"
    description="This is the first card with some default text."
  />
  <BaseCard
    title="Card 2"
    type="image"
    imageUrl="https://ikozmik.com/Content/Images/uploaded/its-free-featured.jpg"
    description="This card has an image."
  />
  <BaseCard
    title="Checklist Card"
    type="checkbox"
    :checkboxItems="cardCheckboxItems"
    v-model="selectedCardItems"
    description="This card has some checkbox items."
  />
  <BaseCard
    title="Another Card"
    description="Just another simple card in the grid."
  />
  <BaseCard
    title="Card 5"
    type="image"
    imageUrl="https://ikozmik.com/Content/Images/uploaded/its-free-featured.jpg"
    description="This card has an image."
  />
  <BaseCard
    title="And Another Card"
    description="Just another simple card in the grid."
  />
  <BaseCard
    title="And Another Card"
    description="Just another simple card in the grid."
  />
  <BaseCard
    title="The last card!"
    description="This is the first card with some default text."
  />
</template>

<script setup lang="ts">
import { ref } from "vue";

const cardCheckboxItems = ref([
  {
    id: "item1",
    label: "Check item 1. Check item 1. Check item 1. Check item 1",
  },
  { id: "item2", label: "Check item 2. Check item 1" },
  { id: "item3", label: "Check item 3" },
]);

const selectedCardItems = ref([]);

useHead({
  title: "Test project",
});
</script>
