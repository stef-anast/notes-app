<template>
  <div class="relative font-inter" ref="dropdownWrapperRef">
    <button
      @click="toggleDropdown"
      type="button"
      :class="[
        'inline-flex items-center justify-center pl-5 pr-4 py-2 rounded-full shadow-sm text-base font-medium',
        props.disabled
          ? 'bg-gray-700 text-white cursor-not-allowed'
          : 'bg-black text-white hover:bg-gray-800 cursor-pointer',
      ]"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      :disabled="props.disabled"
    >
      Filter
      <IconFilterBars class="w-4 h-4 ml-1.5" />
    </button>
    <transition
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        ref="optionsListRef"
        class="absolute z-10 mt-2 w-32 origin-top-right rounded-xl bg-white shadow-lg focus:outline-none"
        role="listbox"
        tabindex="-1"
      >
        <slot name="options-header"></slot>
        <ul>
          <!-- All Option -->
          <li
            v-if="props.options && props.options.length > 0"
            @click.stop="handleSelectAllClick"
            :class="[
              'relative rounded-t-xl select-none py-2.5 px-4 text-sm text-gray-900 flex items-center gap-x-3 mb-0.5',
              (isAllSelected || isIndeterminate) && !props.disabled
                ? 'bg-blue-100'
                : '',
              props.disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer hover:bg-blue-50',
            ]"
            role="option"
            aria-label="Select all options"
          >
            <input
              type="checkbox"
              :checked="isAllSelected"
              :indeterminate="isIndeterminate"
              class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              tabindex="-1"
            />
            <span class="block">All</span>
          </li>

          <li
            v-for="(option, index) in props.options"
            :key="option.value?.toString() ?? index + '-fallback'"
            @click.stop="handleOptionClick(option)"
            :class="[
              'relative select-none py-2.5 px-4 text-sm text-gray-900 flex items-center gap-x-3',
              isSelected(option) && !option.disabled ? 'bg-blue-100' : '',
              option.disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer hover:bg-blue-50',
              index === props.options.length - 1 ? 'rounded-b-xl' : 'mb-0.5',
            ]"
            role="option"
            :aria-selected="isSelected(option)"
            :aria-disabled="option.disabled"
          >
            <input
              type="checkbox"
              :checked="isSelected(option)"
              :disabled="option.disabled"
              class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              tabindex="-1"
              @click.stop
              @change="() => handleOptionClick(option)"
            />
            <span class="block">{{ option.label }}</span>
          </li>
          <li
            v-if="!props.options || props.options.length === 0"
            class="relative cursor-default select-none py-2.5 px-4 text-sm text-gray-500 mb-0.5"
            role="option"
          >
            No options available
          </li>
        </ul>
        <slot name="options-footer"></slot>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  onMounted,
  onBeforeUnmount,
  defineAsyncComponent,
  computed,
} from "vue";
import IconFilterBars from "./icons/IconFilterBars.vue";

export interface FilterDropdownOption {
  value: string | number | boolean | null | undefined;
  label: string;
  disabled?: boolean;
  [key: string]: any;
}

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

const emit = defineEmits(["update:modelValue", "change"]);

const dropdownWrapperRef = ref<HTMLElement | null>(null);
const optionsListRef = ref<HTMLElement | null>(null);
const isOpen = ref(false);

const toggleDropdown = () => {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
};

const closeDropdown = () => {
  isOpen.value = false;
};

const isSelected = (option: FilterDropdownOption): boolean => {
  return props.modelValue.includes(option.value);
};

const ToggableOptions = computed(() => {
  return props.options.filter((opt) => !opt.disabled);
});

const isAllSelected = computed(() => {
  if (!ToggableOptions.value.length) return false;
  return ToggableOptions.value.every((opt) =>
    props.modelValue.includes(opt.value)
  );
});

const isIndeterminate = computed(() => {
  if (!ToggableOptions.value.length) return false;
  const selectedCount = ToggableOptions.value.filter((opt) =>
    props.modelValue.includes(opt.value)
  ).length;
  return selectedCount > 0 && selectedCount < ToggableOptions.value.length;
});

const handleSelectAllClick = () => {
  let newValue: (string | number | boolean | null | undefined)[] = [];
  if (isAllSelected.value) {
    // If all are selected, deselect all
    newValue = props.modelValue.filter((val) => {
      const option = props.options.find((o) => o.value === val);
      return option && option.disabled;
    });
  } else {
    // Otherwise, select all toggleable options
    newValue = ToggableOptions.value.map((opt) => opt.value);
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

  if (props.closeOnSelect && !isOpen.value) {
    // Check isOpen state before closing, useful if we want to keep it open for multiple selections
    closeDropdown();
  }
};

const handleClickOutside = (event: MouseEvent) => {
  if (
    dropdownWrapperRef.value &&
    !dropdownWrapperRef.value.contains(event.target as Node)
  ) {
    if (isOpen.value) {
      closeDropdown();
    }
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside, true);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside, true);
});

defineExpose({
  open: () => {
    if (!props.disabled) isOpen.value = true;
  },
  close: closeDropdown,
  toggle: toggleDropdown,
});
</script>
