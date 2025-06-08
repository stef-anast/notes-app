<template>
  <div
    class="relative font-inter"
    ref="dropdownWrapperRef"
    @keydown="handleKeydown"
  >
    <BaseButton
      :text="isSmallScreenSize ? undefined : 'Filter'"
      :icon="true"
      icon-name="filter-bars"
      icon-position="right"
      variant="solid"
      color="black"
      :size="isSmallScreenSize ? 'icon' : 'medium'"
      :disabled="props.disabled"
      :aria-haspopup="'listbox'"
      :aria-expanded="dropdown.isOpen.value"
      @click="toggleDropdown"
    />

    <DropdownOptionsList
      ref="optionsListRef"
      :is-open="dropdown.isOpen.value"
      :options="props.options"
      :model-value="props.modelValue"
      :show-checkboxes="true"
      :show-select-all="true"
      :custom-options-class="`absolute z-10 mt-2 w-32 ${
        isSmallScreenSize
          ? 'right-0'
          : 'left-0'
      } rounded-xl bg-white shadow-lg focus:outline-none`"
      @option-click="handleOptionClick"
      @select-all-click="handleSelectAllClick"
    >
      <template #options-header>
        <slot name="options-header"></slot>
      </template>
      <template #options-footer>
        <slot name="options-footer"></slot>
      </template>
    </DropdownOptionsList>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useDropdown } from "~/composables/useDropdown";
import type { FilterDropdownOption } from "~/types";
import DropdownOptionsList from "./dropdown/DropdownOptionsList.vue";
import BaseButton from "./BaseButton.vue";
import { useViewport } from "~/composables/useViewport";

export type { FilterDropdownOption };

interface Props {
  modelValue: (string | number | boolean | null | undefined)[];
  options: FilterDropdownOption[];
  disabled?: boolean;
  closeOnSelect?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  closeOnSelect: false,
});

const emit = defineEmits([
  "update:modelValue",
  "change",
  "dropdown-state-change",
  "option-click",
  "focus",
  "blur",
]);

const optionsListRef = ref<InstanceType<typeof DropdownOptionsList> | null>(
  null
);

const dropdown = useDropdown(
  {
    options: props.options,
    modelValue: props.modelValue,
    multiple: true,
    closeOnSelect: props.closeOnSelect,
    searchable: false,
    searchText: "",
    disabled: props.disabled,
  },
  emit
);

const { dropdownWrapperRef } = dropdown;

const { isSmallScreenSize } = useViewport();

watch(
  () => props.disabled,
  (newDisabled, oldDisabled) => {
    if (oldDisabled && !newDisabled) {
      // Force close dropdown when component becomes enabled to ensure clean state
      dropdown.closeDropdown();
    }
  }
);

const toggleDropdown = () => {
  if (props.disabled) return;
  dropdown.toggleDropdown();
};

const handleSelectAllClick = ({
  isAllSelected,
  toggleableOptions,
}: {
  isAllSelected: boolean;
  toggleableOptions: FilterDropdownOption[];
}) => {
  let newValue: (string | number | boolean | null | undefined)[] = [];

  if (isAllSelected) {
    // If all are selected, deselect all
    newValue = props.modelValue.filter((val) => {
      const option = props.options.find((o) => o.value === val);
      return option && option.disabled;
    });
  } else {
    // Otherwise, select all toggleable options
    newValue = toggleableOptions.map((opt) => opt.value);
    // Add any pre-selected disabled options
    props.options.forEach((opt) => {
      if (
        opt.disabled &&
        props.modelValue.includes(opt.value) &&
        !newValue.includes(opt.value)
      ) {
        newValue.push(opt.value);
      }
    });
  }

  emit("update:modelValue", newValue);
  emit("change", newValue);
};

const handleOptionClick = (option: FilterDropdownOption) => {
  if (option.disabled) return;

  const newValue = [...props.modelValue];
  const optionIndex = newValue.indexOf(option.value);

  if (optionIndex > -1) {
    newValue.splice(optionIndex, 1); // Deselect
  } else {
    newValue.push(option.value); // Select
  }

  emit("update:modelValue", newValue);
  emit("change", newValue);

  if (props.closeOnSelect && !dropdown.isOpen.value) {
    // Check isOpen state before closing, useful if we want to keep it open for multiple selections
    dropdown.closeDropdown();
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return;
  dropdown.handleKeydown(event);
};

defineExpose({
  open: dropdown.openDropdown,
  close: dropdown.closeDropdown,
  toggle: toggleDropdown,
});
</script>
