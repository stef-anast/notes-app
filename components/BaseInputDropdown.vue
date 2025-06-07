<template>
  <div class="relative font-inter" ref="dropdownWrapperRef">
    <DropdownTrigger
      ref="triggerRef"
      :label="props.label"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
      :is-open="dropdown.isOpen.value"
      :is-focused="dropdown.isFocused.value"
      :has-value="dropdown.hasValue.value"
      :show-search-input="props.searchable && props.showSearchInTrigger"
      :search-text="props.searchText"
      :input-id="`${componentId}-input`"
      :container-id="`${componentId}-trigger-container`"
      :label-id="`${componentId}-actual-label`"
      :aria-labelled-by="ariaLabelledByIds"
      :aria-controls="
        dropdown.isOpen.value ? `${componentId}-options` : undefined
      "
      :active-label-translate-x-class="props.activeLabelTranslateXClass"
      @trigger-click="handleTriggerContainerClick"
      @focus="dropdown.onFocus"
      @blur="dropdown.onBlur"
      @keydown="dropdown.handleKeydown"
      @search-input="dropdown.handleSearchInput"
      @search-focus="(e: FocusEvent) => dropdown.onFocus(e, 'input')"
      @search-blur="(e: FocusEvent) => dropdown.onBlur(e, 'input')"
      @toggle-dropdown="dropdown.toggleDropdown"
    >
      <template #content="{ inputId, inputPlaceholder }">
        <slot
          name="trigger-content"
          :is-open="dropdown.isOpen.value"
          :has-selection="dropdown.hasValue.value"
          :input-id="inputId"
          :input-placeholder-text="inputPlaceholder"
          :focus-input="focusInput"
          :toggle-dropdown="dropdown.toggleDropdown"
          :is-label-active="isLabelActive"
        />
      </template>

      <template #trigger-display>
        <slot
          v-if="!(props.searchable && props.showSearchInTrigger)"
          name="trigger"
          :is-open="dropdown.isOpen.value"
          :has-selection="dropdown.hasValue.value"
          :is-label-active="isLabelActive"
        />
      </template>
    </DropdownTrigger>

    <DropdownOptionsList
      ref="optionsListRef"
      :is-open="dropdown.isOpen.value"
      :options="dropdown.filteredOptions.value"
      :highlighted-index="dropdown.highlightedIndex.value"
      :model-value="props.modelValue"
      :multiple="props.multiple"
      :search-text="props.searchText"
      :options-id="`${componentId}-options`"
      :aria-labelled-by="
        props.label ? `${componentId}-actual-label` : undefined
      "
      @option-click="dropdown.handleOptionClick"
      @set-highlighted-index="dropdown.setHighlightedIndex"
    >
      <template
        #custom-options="{
          options,
          highlightedIndex,
          optionsId,
          handleOptionClick,
          setHighlightedIndex,
          searchText,
        }"
      >
        <slot
          name="options-list"
          :options="options"
          :highlighted-index="highlightedIndex"
          :component-id="componentId"
          :select-option-from-base="handleOptionClick"
          :set-highlighted-index-from-base="setHighlightedIndex"
          :search-text="searchText"
        />
      </template>
    </DropdownOptionsList>

    <p v-if="supportingTextResolved" :class="supportingTextClasses">
      {{ supportingTextResolved }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, useId, nextTick } from "vue";
import type { DropdownOption } from "~/types";
import { useDropdown } from "~/composables/useDropdown";
import DropdownTrigger from "./dropdown/DropdownTrigger.vue";
import DropdownOptionsList from "./dropdown/DropdownOptionsList.vue";


interface Props {
  modelValue: any;
  options: DropdownOption[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  error?: boolean;
  errorMessage?: string;
  supportingText?: string;
  multiple?: boolean;
  closeOnSelect?: boolean;
  searchable?: boolean;
  showSearchInTrigger?: boolean;
  searchText?: string;
  activeLabelTranslateXClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  placeholder: "Select an option",
  disabled: false,
  id: undefined,
  error: false,
  errorMessage: "",
  supportingText: "",
  multiple: false,
  closeOnSelect: true,
  searchable: false,
  showSearchInTrigger: false,
  searchText: "",
  activeLabelTranslateXClass: "-translate-x-3",
});

const emit = defineEmits([
  "update:modelValue",
  "focus",
  "blur",
  "dropdown-state-change",
  "option-click",
  "trigger-click",
  "update:searchText",
]);

const internalId = useId();
const componentId = computed(
  () => props.id || `base-input-dropdown-${internalId}`
);

const triggerRef = ref<InstanceType<typeof DropdownTrigger> | null>(null);
const optionsListRef = ref<InstanceType<typeof DropdownOptionsList> | null>(
  null
);

const dropdown = useDropdown(
  {
    options: props.options,
    modelValue: props.modelValue,
    multiple: props.multiple,
    closeOnSelect: props.closeOnSelect,
    searchable: props.searchable,
    searchText: props.searchText,
    disabled: props.disabled,
  },
  emit
);

const { dropdownWrapperRef } = dropdown;

const isLabelActive = computed(() => {
  return (
    dropdown.isFocused.value ||
    dropdown.hasValue.value ||
    (props.searchable &&
      props.showSearchInTrigger &&
      props.searchText &&
      props.searchText.length > 0) ||
    props.disabled ||
    !props.placeholder
  );
});

const supportingTextResolved = computed(() => {
  return props.error && props.errorMessage
    ? props.errorMessage
    : props.supportingText;
});

const supportingTextClasses = computed(() => [
  "mt-1.5 ml-3 text-xs",
  props.disabled
    ? "text-gray-400"
    : props.error
    ? "text-red-600"
    : "text-gray-500",
]);

const ariaLabelledByIds = computed(() => {
  const ids = [];
  if (props.label) ids.push(componentId.value + "-actual-label");
  return ids.join(" ") || undefined;
});

const handleTriggerContainerClick = () => {
  if (props.disabled) return;
  dropdown.toggleDropdown();
  emit("trigger-click");
};

const focusInput = () => {
  triggerRef.value?.focusInput();
};

const scrollToHighlightedOption = () => {
  nextTick(() => {
    optionsListRef.value?.scrollToHighlightedOption();
  });
};

// Watch for highlighted index changes to scroll
dropdown.highlightedIndex && nextTick(() => scrollToHighlightedOption());

defineExpose({
  open: dropdown.openDropdown,
  close: dropdown.closeDropdown,
  toggle: dropdown.toggleDropdown,
  focus: focusInput,
  blur: () => {}, // For compatibility, might need to implement if needed
  blurInput: () => {}, // For compatibility
  openDropdown: dropdown.openDropdown,
  closeDropdown: dropdown.closeDropdown,
  focusInput,
  scrollToHighlightedOption,
});
</script>
