<template>
  <BaseModal
    v-model="isModalOpen"
    :title="title"
    :hide-header-border="true"
    :hide-footer-border="true"
  >
    <template #body>
      <div class="space-y-4">
        <BaseSelect
          v-model="selectedType"
          :options="noteTypeOptions"
          label="Select type of card"
        />

        <BaseTextField
          v-model.trim="noteTitle"
          label="Header"
          placeholder="Enter a title"
        />

        <BaseFileUpload
          v-if="selectedType === NoteType.Image"
          v-model="imageFile"
          acceptedFileTypesText="SVG, PNG, JPG or GIF"
        />

        <BaseTextarea
          v-model.trim="noteDescription"
          label="Description"
          placeholder="Enter a description"
        />

        <div v-if="selectedType === NoteType.Checkbox" class="space-y-4">
          <label class="block font-medium text-gray-900">Add option</label>
          <div
            v-for="(option, index) in checkboxOptions"
            :key="index"
            class="flex items-center gap-1"
          >
            <BaseTextField
              v-model.trim="option.label"
              placeholder="Text Placeholder"
              :label="'Option ' + (index + 1)"
              class="flex-grow"
            />
            <BaseButton
              v-if="checkboxOptions.length > 1"
              @click="removeCheckboxOption(index)"
              icon
              icon-name="minus"
              variant="ghost"
              color="secondary"
              size="icon"
            />
          </div>
          <BaseButton
            @click="addCheckboxOption"
            text="Add option"
            size="large"
            class="w-full"
            icon
            icon-name="plus"
            color="success"
          />
        </div>
      </div>
    </template>
    <template #footer>
      <div class="w-full">
        <hr class="border-1 border-dashed border-gray-200" />
        <slot
          name="footer"
          :is-disabled="isActionDisabled"
          :get-form-data="getFormData"
        ></slot>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import type { Note } from "~/composables/useNotes";
import { NoteType } from "~/composables/useNotes";

const props = defineProps<{
  title: string;
  initialNote?: Note;
}>();

const isModalOpen = ref(false);
const selectedType = ref<NoteType | "">(
  props.initialNote?.type ?? ""
);
const noteTitle = ref(props.initialNote?.title ?? "");
const noteDescription = ref(props.initialNote?.description ?? "");
const imageFile = ref<File | null>(null);
const checkboxOptions = ref<{ id?: string | number; label: string }[]>(
  props.initialNote?.checkboxItems?.map((item) => ({ ...item })) ?? [
    { label: "" },
  ]
);

watch(isModalOpen, (newValue) => {
  if (!newValue) {
    resetForm();
  }
});

const noteTypeOptions = [
  { value: NoteType.Default, label: "Default Card Style" },
  { value: NoteType.Image, label: "Image Card Style" },
  { value: NoteType.Checkbox, label: "Checkbox Card Style" },
];

const addCheckboxOption = () => {
  checkboxOptions.value.push({ label: "" });
};

const removeCheckboxOption = (index: number) => {
  checkboxOptions.value.splice(index, 1);
};

const isDirty = computed(() => {
  if (!props.initialNote) {
    return true;
  }

  if (noteTitle.value !== props.initialNote.title) return true;
  if (noteDescription.value !== (props.initialNote.description || ""))
    return true;
  if (selectedType.value !== props.initialNote.type) return true;
  if (selectedType.value === NoteType.Image && imageFile.value !== null)
    return true;
  if (selectedType.value === NoteType.Checkbox) {
    const initialOptions = JSON.stringify(
      props.initialNote.checkboxItems?.map((i) => i.label) || []
    );
    const currentOptions = JSON.stringify(
      checkboxOptions.value.map((i) => i.label)
    );
    if (initialOptions !== currentOptions) return true;
  }

  return false;
});

const isActionDisabled = computed(() => {
  if (selectedType.value === "" || !noteTitle.value || !noteDescription.value) {
    return true;
  }
  if (
    selectedType.value === NoteType.Image &&
    !imageFile.value &&
    !props.initialNote?.imageUrl
  ) {
    return true;
  }
  if (selectedType.value === NoteType.Checkbox) {
    if (
      checkboxOptions.value.length === 0 ||
      checkboxOptions.value.some((opt) => !opt.label)
    ) {
      return true;
    }
  }

  if (props.initialNote) {
    return !isDirty.value;
  }

  return false;
});

const resetForm = () => {
  selectedType.value = props.initialNote?.type ?? "";
  noteTitle.value = props.initialNote?.title ?? "";
  noteDescription.value = props.initialNote?.description ?? "";
  imageFile.value = null;
  checkboxOptions.value = props.initialNote?.checkboxItems?.map((item) => ({
    ...item,
  })) ?? [{ label: "" }];
};

const getFormData = () => {
  const formData: Partial<Note> = {
    id: props.initialNote?.id,
    title: noteTitle.value,
    description: noteDescription.value,
    type: selectedType.value as NoteType,
  };

  if (formData.type === NoteType.Image) {
    if (imageFile.value) {
      formData.imageUrl = URL.createObjectURL(imageFile.value);
      formData.imageAlt = noteTitle.value;
    } else {
      formData.imageUrl = props.initialNote?.imageUrl;
      formData.imageAlt = props.initialNote?.imageAlt;
    }
  }

  if (formData.type === NoteType.Checkbox) {
    formData.checkboxItems = checkboxOptions.value
      .filter((opt) => opt.label)
      .map((opt, index) => ({
        id: opt.id || `new-opt-${Date.now()}-${index}`,
        label: opt.label,
      }));
    formData.selectedItems = props.initialNote?.selectedItems ?? [];
  }

  return formData as Note;
};

const openModal = () => {
  resetForm();
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

defineExpose({ openModal, closeModal });
</script>
