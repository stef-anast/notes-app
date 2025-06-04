<template>
  <BaseInputDropdown
    ref="baseDropdownRef"
    :model-value="props.modelValue"
    :options="props.options"
    :label="props.label"
    :placeholder="props.placeholder"
    :disabled="props.disabled"
    :id="props.id"
    :error="props.error"
    :error-message="props.errorMessage"
    :supporting-text="props.supportingText"
    :multiple="true"
    :close-on-select="false"
    :searchable="true"
    :show-search-in-trigger="true"
    :active-label-translate-x-class="'-translate-x-1'"
    v-model:search-text="searchText"
    @option-click="handleOptionClickFromBase"
  >
    <template
      #trigger-content="{
        inputId,
        inputPlaceholderText,
        focusInput,
        toggleDropdown,
      }"
    >
      <!-- Selected Pills -->
      <span
        v-for="option in selectedOptions.slice(0, maxVisiblePillsComputed)"
        :key="option.value?.toString() + '-pill'"
        class="inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-gray-700 dark:bg-blue-700 dark:text-gray-200 shrink-0"
      >
        {{ option.label }}
        <button
          type="button"
          @click.stop="deselectOption(option)"
          class="ml-1.5 -mr-0.5 flex-shrink-0 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 focus:outline-none cursor-pointer"
          :aria-label="`Remove ${option.label}`"
          :disabled="props.disabled"
        >
          <IconClose class="w-3 h-3" />
        </button>
      </span>

      <span
        v-if="selectedOptions.length > maxVisiblePillsComputed"
        class="text-xs font-medium text-gray-500 dark:text-gray-400 shrink-0"
      >
        +{{ selectedOptions.length - maxVisiblePillsComputed }}
      </span>
    </template>

    <template
      #options-list="{
        options: slotOptions,
        highlightedIndex: slotHighlightedIndex,
        componentId: slotComponentId,
        selectOptionFromBase,
        setHighlightedIndexFromBase,
      }"
    >
      <li
        v-if="!slotOptions || slotOptions.length === 0"
        class="relative cursor-default select-none py-2 px-3 text-gray-500 dark:text-gray-400 mt-0.5 mb-0.5"
        role="option"
      >
        {{ searchText ? "No results found" : "No options available" }}
      </li>
      <li
        v-for="(option, index) in slotOptions"
        :key="option.value?.toString() ?? index"
        @click="!option.disabled ? selectOptionFromBase(option) : undefined"
        @mouseenter="
          !option.disabled ? setHighlightedIndexFromBase(index) : undefined
        "
        :class="[
          'relative select-none py-2 pl-3 pr-4 text-gray-900 dark:text-white flex items-center gap-x-2 mb-0.5',
          slotHighlightedIndex === index && !option.disabled
            ? 'bg-blue-50 dark:bg-blue-900/50'
            : isSelected(option) && !option.disabled
            ? 'bg-blue-100 dark:bg-blue-700'
            : '',
          option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
          'first:mt-0.5 last:mb-0.5',
        ]"
        role="option"
        :id="slotComponentId + '-option-' + index"
        :aria-selected="isSelected(option)"
        :aria-disabled="option.disabled"
      >
        <span
          :class="[
            'w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center',
            isSelected(option) && !option.disabled
              ? 'bg-blue-600 border-blue-600'
              : 'bg-white dark:bg-gray-700 border-gray-400 dark:border-gray-500',
            option.disabled
              ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700'
              : '',
          ]"
          aria-hidden="true"
        >
          <IconCheck
            v-if="isSelected(option) && !option.disabled"
            class="w-4 h-4 text-white"
          />
        </span>
        <span
          :class="[
            'block truncate',
            option.disabled ? 'text-gray-400 dark:text-gray-600' : '',
          ]"
        >
          {{ option.label }}
        </span>
      </li>
    </template>
  </BaseInputDropdown>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent, watch } from "vue";
import BaseInputDropdown, {
  type DropdownOption,
} from "./BaseInputDropdown.vue";

export type SelectOption = DropdownOption;

const IconCheck = defineAsyncComponent(() => import("./icons/IconCheck.vue"));
const IconClose = defineAsyncComponent(() => import("./icons/IconClose.vue"));

interface Props {
  modelValue: any[];
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  error?: boolean;
  errorMessage?: string;
  supportingText?: string;
  maxVisiblePills?: number;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Search or select options",
  disabled: false,
  id: undefined,
  error: false,
  errorMessage: "",
  supportingText: "",
  maxVisiblePills: 3,
});

const emit = defineEmits(["update:modelValue", "search-text-change"]);

const baseDropdownRef = ref<InstanceType<typeof BaseInputDropdown> | null>(
  null
);
const searchText = ref("");

const selectedOptions = computed(() => {
  return props.options.filter((opt) => props.modelValue.includes(opt.value));
});

const maxVisiblePillsComputed = computed(() => {
  if (selectedOptions.value.length > 0) {
    return Math.max(0, props.maxVisiblePills);
  }
  return props.maxVisiblePills;
});

const isSelected = (option: SelectOption): boolean => {
  return props.modelValue.includes(option.value);
};

const deselectOption = (optionToDeselect: SelectOption) => {
  if (props.disabled) return;
  const newValue = props.modelValue.filter(
    (value) => value !== optionToDeselect.value
  );
  emit("update:modelValue", newValue);
  baseDropdownRef.value?.focusInput();
};

const handleOptionClickFromBase = (option: SelectOption) => {
  if (option.disabled) return;

  const currentValue = [...props.modelValue];
  const index = currentValue.indexOf(option.value);
  if (index > -1) {
    currentValue.splice(index, 1);
  } else {
    currentValue.push(option.value);
  }
  emit("update:modelValue", currentValue);
  searchText.value = "";
};

watch(searchText, (newVal) => {
  emit("search-text-change", newVal);
});

const open = () => baseDropdownRef.value?.open();
const close = () => baseDropdownRef.value?.close();
const toggle = () => baseDropdownRef.value?.toggle();
const focus = () => baseDropdownRef.value?.focusInput();
const blur = () => baseDropdownRef.value?.blurInput();

defineExpose({
  open,
  close,
  toggle,
  focus,
  blur,
  deselectOption,
});
</script>
