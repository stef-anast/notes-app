<template>
  <div class="relative">
    <label v-if="label" :for="inputId" :class="labelClasses">
      {{ label }}
    </label>

    <div
      :id="containerId"
      ref="triggerContainerRef"
      style="
        transition: border-color 0.2s ease-in-out,
          background-color 0.2s ease-in-out;
      "
      @click="handleTriggerClick"
      :tabindex="tabIndex"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
      :class="[
        'relative w-full h-auto min-h-[3.5rem] rounded-2xl border outline-none text-base',
        'flex',
        label ? 'pt-6 pb-1 px-3' : 'p-3',
        frameClasses,
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
      ]"
      role="combobox"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      :aria-labelledby="ariaLabelledBy"
      :aria-controls="ariaControls"
    >
      <div class="flex flex-wrap items-center gap-x-1.5 gap-y-1 w-full">
        <slot
          name="content"
          :input-id="inputId"
          :input-placeholder="inputPlaceholder"
        />

        <input
          v-if="showSearchInput"
          ref="searchInputRef"
          :id="inputId"
          type="text"
          :value="searchText"
          @input="handleSearchInput"
          @focus="handleSearchFocus"
          @blur="handleSearchBlur"
          @keydown="handleKeydown"
          :disabled="disabled"
          :placeholder="inputPlaceholder"
          class="flex-grow min-w-[60px] bg-transparent border-none outline-none p-0 m-0 text-sm text-gray-900 placeholder-gray-500 leading-normal"
          style="box-shadow: none"
          :aria-label="label || placeholder"
          autocomplete="off"
        />

        <slot v-if="!showSearchInput" name="trigger-display" />
      </div>

      <span
        v-if="!disabled"
        @click.stop="toggleDropdown"
        class="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
        aria-hidden="true"
      >
        <component
          :is="getIconComponent(isOpen ? 'chevron-up' : 'chevron-down')"
          class="w-5 h-5 text-gray-700"
        />
      </span>
    </div>

    <span v-if="label" :id="labelId" class="sr-only">
      {{ label }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useIcons } from "~/composables/useIcons";

const { getIconComponent } = useIcons();

interface Props {
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  isOpen?: boolean;
  isFocused?: boolean;
  hasValue?: boolean;
  showSearchInput?: boolean;
  searchText?: string;
  inputId?: string;
  containerId?: string;
  labelId?: string;
  ariaLabelledBy?: string;
  ariaControls?: string;
  activeLabelTranslateXClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  isOpen: false,
  isFocused: false,
  hasValue: false,
  showSearchInput: false,
  searchText: "",
  activeLabelTranslateXClass: "-translate-x-3",
});

const emit = defineEmits([
  "trigger-click",
  "focus",
  "blur",
  "keydown",
  "search-input",
  "search-focus",
  "search-blur",
  "toggle-dropdown",
]);

const triggerContainerRef = ref<HTMLElement | null>(null);
const searchInputRef = ref<HTMLInputElement | null>(null);

const isLabelActive = computed(() => {
  return (
    props.isFocused ||
    props.hasValue ||
    (props.showSearchInput &&
      props.searchText &&
      props.searchText.length > 0) ||
    props.disabled ||
    !props.placeholder
  );
});

const labelClasses = computed(() => {
  if (!props.label) return ["sr-only"];

  const baseStyles = [
    "absolute z-10 font-semibold left-3 pointer-events-none",
    "transform-origin-top-left transition-all duration-200 ease-in-out",
  ];

  let colorClass = "";
  if (isLabelActive.value) {
    if (props.disabled) colorClass = "text-gray-400";
    else if (props.isFocused) colorClass = "text-blue-600";
    else colorClass = "text-gray-900";
  } else {
    if (props.disabled) colorClass = "text-gray-400";
    else colorClass = "text-gray-900 font-semibold";
  }

  const sizeAndPositionClasses = isLabelActive.value
    ? `text-xs scale-75 top-1.5 ${props.activeLabelTranslateXClass}`
    : "top-3.5 text-base";

  return [...baseStyles, colorClass, sizeAndPositionClasses];
});

const inputPlaceholder = computed(() => {
  if (props.showSearchInput && isLabelActive.value) {
    return props.placeholder;
  }
  return "";
});

const frameClasses = computed(() => {
  if (props.disabled) {
    return "bg-gray-100 border-gray-300 !ring-0";
  }
  if (props.isFocused) {
    return "border-blue-600 ring-1 ring-blue-600 bg-white";
  }
  return "bg-gray-200 border-gray-50 hover:bg-gray-100 hover:border-gray-100 focus-within:border-blue-600";
});

const tabIndex = computed(() => {
  return props.disabled || props.showSearchInput ? -1 : 0;
});

const handleTriggerClick = () => {
  emit("trigger-click");
};

const handleFocus = (event: FocusEvent) => {
  emit("focus", event);
};

const handleBlur = (event: FocusEvent) => {
  emit("blur", event);
};

const handleKeydown = (event: KeyboardEvent) => {
  emit("keydown", event);
};

const handleSearchInput = (event: Event) => {
  emit("search-input", event);
};

const handleSearchFocus = (event: FocusEvent) => {
  emit("search-focus", event);
};

const handleSearchBlur = (event: FocusEvent) => {
  emit("search-blur", event);
};

const toggleDropdown = () => {
  emit("toggle-dropdown");
};

const focusInput = () => {
  if (searchInputRef.value) {
    searchInputRef.value.focus();
  }
};

defineExpose({
  focusInput,
  triggerContainerRef,
  searchInputRef,
});
</script>
