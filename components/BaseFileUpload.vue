<template>
  <div
    :id="componentId"
    class="relative group flex flex-col items-center justify-center w-full px-6 py-10 border-2 rounded-xl cursor-pointer transition-colors duration-200 ease-in-out"
    @click="triggerFileInput"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
    :class="[
      isDraggingOver
        ? 'border-blue-600 bg-blue-50'
        : 'border-blue-500 bg-gray-100 hover:bg-blue-50',
    ]"
    role="button"
    tabindex="0"
    @keydown.enter="triggerFileInput"
    @keydown.space="triggerFileInput"
    aria-label="File upload area"
  >
    <input
      ref="fileInputRef"
      type="file"
      class="hidden"
      :accept="props.accept"
      @change="handleFileChange"
    />

    <div class="flex flex-col items-center justify-center text-center">
      <div
        class="w-12 h-12 mb-4 rounded-lg bg-blue-500 flex items-center justify-center shadow-md"
      >
        <component
          :is="getIconComponent('cloud-arrow-up')"
          class="w-6 h-6 text-white"
        />
      </div>

      <p class="text-sm text-gray-900">
        <span class="font-semibold text-blue-600">Click to upload</span>
        or drag and drop
      </p>
      <p class="mt-1 text-xs text-gray-800">
        {{ acceptedFileTypesText }}
      </p>

      <div v-if="selectedFile" class="mt-4 text-sm text-center">
        <p class="font-semibold text-gray-700">
          Selected file: {{ selectedFile.name }}
        </p>
        <button
          @click.stop="clearFile"
          class="mt-2 text-xs text-red-500 hover:text-red-700 focus:outline-none cursor-pointer"
        >
          Remove file
        </button>
      </div>
      <p v-if="errorMessage" class="mt-2 text-xs text-red-500">
        {{ errorMessage }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, useId } from "vue";
import { useIcons } from "~/composables/useIcons";

const { getIconComponent } = useIcons();

interface Props {
  modelValue: File | null;
  id?: string;
  accept?: string;
  acceptedFileTypesText?: string;
  maxSize?: number;
}

const props = withDefaults(defineProps<Props>(), {
  id: undefined,
  accept: "image/*",
  acceptedFileTypesText: "Images (PNG, JPG, GIF, SVG)",
  maxSize: 5,
});

const emit = defineEmits(["update:modelValue", "file-selected", "error"]);

const componentId = computed(() => props.id || `base-file-upload-${useId()}`);
const fileInputRef = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(props.modelValue);
const errorMessage = ref<string | null>(null);
const isDraggingOver = ref(false);

const triggerFileInput = () => {
  errorMessage.value = null;
  fileInputRef.value?.click();
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    processFile(target.files[0]);
  }
};

const processFile = (file: File) => {
  errorMessage.value = null;
  let isValidType = false;

  if (props.accept) {
    const acceptedPatterns = props.accept
      .split(",")
      .map((p) => p.trim().toLowerCase());
    const fileTypeLower = file.type.toLowerCase();
    const fileNameLower = file.name.toLowerCase();

    for (const pattern of acceptedPatterns) {
      if (pattern.startsWith(".")) {
        if (fileNameLower.endsWith(pattern)) {
          isValidType = true;
          break;
        }
      } else if (pattern.endsWith("/*")) {
        const baseType = pattern.slice(0, -2);
        if (fileTypeLower.startsWith(baseType + "/")) {
          isValidType = true;
          break;
        }
      } else {
        if (fileTypeLower === pattern) {
          isValidType = true;
          break;
        }
      }
    }

    if (!isValidType) {
      errorMessage.value = `Invalid file type. Accepted types: ${
        props.acceptedFileTypesText || props.accept
      }`;
      emit("error", errorMessage.value);
      selectedFile.value = null;
      emit("update:modelValue", null);
      if (fileInputRef.value) fileInputRef.value.value = "";
      return;
    }
  }

  if (props.maxSize && file.size > props.maxSize * 1024 * 1024) {
    errorMessage.value = `File is too large. Max size: ${props.maxSize}MB`;
    emit("error", errorMessage.value);
    selectedFile.value = null;
    emit("update:modelValue", null);
    if (fileInputRef.value) fileInputRef.value.value = "";
    return;
  }

  selectedFile.value = file;
  emit("update:modelValue", file);
  emit("file-selected", file);
};

const handleDragOver = (event: DragEvent) => {
  isDraggingOver.value = true;
  event.dataTransfer!.dropEffect = "copy";
};

const handleDragLeave = () => {
  isDraggingOver.value = false;
};

const handleDrop = (event: DragEvent) => {
  isDraggingOver.value = false;
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    processFile(event.dataTransfer.files[0]);
  }
};

const clearFile = () => {
  selectedFile.value = null;
  errorMessage.value = null;
  emit("update:modelValue", null);
  if (fileInputRef.value) {
    fileInputRef.value.value = "";
  }
};

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue === null && selectedFile.value !== null) {
      clearFile();
    }
    selectedFile.value = newValue;
  }
);
</script>
