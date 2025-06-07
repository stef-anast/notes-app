<template>
  <div
    :class="[
      'base-card-wrapper bg-white rounded-xl p-6 space-y-4 font-inter h-full',
      { 'is-hoverable': hoverable },
    ]"
  >
    <h3 v-if="title" class="text-xl font-semibold text-gray-900">
      {{ title }}
    </h3>

    <template v-if="type === NoteType.Image">
      <img
        v-if="imageUrl"
        :src="imageUrl"
        :alt="imageAlt"
        class="w-full h-auto object-cover rounded-2xl my-4"
      />
      <div
        v-else
        class="w-full aspect-video bg-gray-200 rounded-lg flex items-center justify-center my-4"
      >
        <span class="text-gray-400">Image placeholder</span>
      </div>
    </template>

    <p
      v-if="description"
      class="text-gray-600 leading-relaxed"
      :class="{
        'truncate-3-lines': type === NoteType.Image && truncateDescription,
      }"
    >
      {{ description }}
    </p>

    <template
      v-if="
        type === NoteType.Checkbox && checkboxItems && checkboxItems.length > 0
      "
    >
      <div class="space-y-3 pt-2">
        <BaseCheckbox
          v-for="item in checkboxItems"
          :key="item.id"
          :modelValue="selectedItemsSet.has(item.id)"
          @update:modelValue="toggleCheckboxItem(item.id)"
          :label="item.label"
          :value="item.id"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { NoteType } from "~/composables/useNotes";

export interface CheckboxItem {
  id: string | number;
  label: string;
  disabled?: boolean;
}

interface Props {
  title: string;
  description?: string;
  type?: NoteType;
  imageUrl?: string;
  imageAlt?: string;
  checkboxItems?: CheckboxItem[];
  modelValue?: (string | number)[];
  truncateDescription?: boolean;
  hoverable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: NoteType.Default,
  imageAlt: "Card image",
  checkboxItems: () => [],
  modelValue: () => [],
  truncateDescription: true,
  hoverable: true,
});

const emit = defineEmits(["update:modelValue"]);

const selectedItemsSet = computed(() => {
  return new Set(props.modelValue);
});

const toggleCheckboxItem = (itemId: string | number) => {
  if (props.type !== NoteType.Checkbox) return;
  const newSelectedItems = new Set(props.modelValue);
  if (newSelectedItems.has(itemId)) {
    newSelectedItems.delete(itemId);
  } else {
    newSelectedItems.add(itemId);
  }
  emit("update:modelValue", Array.from(newSelectedItems));
};
</script>

<style scoped>
.base-card-wrapper {
  transition-duration: 0.2s;
  transition-timing-function: ease-in-out;
}

.is-hoverable {
  cursor: pointer;
}

.is-hoverable:hover {
  transform: translateY(-2px) scale(1.01);
}

.truncate-3-lines {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
