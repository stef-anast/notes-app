<template>
  <div class="relative" ref="selectWrapper">
    <!-- Visually hidden label for accessibility -->
    <span v-if="label" :id="componentId + '-label'" class="sr-only">
      {{ label }}
    </span>

    <button
      :id="componentId"
      type="button"
      @click="toggleDropdown"
      @focus="onFocus"
      @blur="onBlur"
      :disabled="disabled"
      :class="[
        'relative w-full h-14 pl-3 pr-10 text-left rounded-2xl border outline-none text-base',
        'focus:ring-1 focus:z-10',
        'flex items-center',
        'py-2',
        inputVisualClasses,
      ]"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      :aria-labelledby="label ? componentId + '-label' : undefined"
      :aria-label="!label && placeholder ? placeholder : undefined"
    >
      <span
        :class="[
          'block truncate',
          hasSelection
            ? 'text-gray-900 dark:text-white'
            : 'text-gray-500 dark:text-gray-400',
        ]"
      >
        {{ displayValue }}
      </span>
      <span
        class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"
      >
        <component
          :is="isOpen ? IconChevronUp : IconChevronDown"
          class="w-5 h-5 text-gray-400 dark:text-gray-500"
          aria-hidden="true"
        />
      </span>
    </button>

    <transition
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <ul
        v-if="isOpen"
        ref="optionsList"
        class="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl shadow-lg max-h-60 overflow-auto focus:outline-none text-base py-1"
        tabindex="-1"
        role="listbox"
        :aria-multiselectable="multiple"
        :aria-labelledby="label ? componentId + '-label' : undefined"
      >
        <li
          v-for="(option, index) in options"
          :key="option.value?.toString() || index"
          @click="selectOption(option)"
          @mouseenter="highlightedIndex = index"
          :class="[
            'relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 dark:text-white flex items-center gap-x-2',
            highlightedIndex === index ? 'bg-blue-50 dark:bg-blue-900/50' : '',
          ]"
          role="option"
          :id="componentId + '-option-' + index"
          :aria-selected="isSelected(option)"
        >
          <template v-if="multiple">
            <span
              :class="[
                'w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center',
                isSelected(option)
                  ? 'bg-blue-600 border-blue-600'
                  : 'bg-white dark:bg-gray-700 border-gray-400 dark:border-gray-500',
              ]"
            >
              <IconCheck v-if="isSelected(option)" class="w-4 h-4 text-white" />
            </span>
          </template>
          <span
            :class="[
              'block truncate',
              isSelected(option) && !multiple ? 'font-semibold' : 'font-normal',
            ]"
          >
            {{ option.label }}
          </span>
          <span
            v-if="isSelected(option) && !multiple"
            :class="[
              'absolute inset-y-0 right-0 flex items-center pr-4',
              'text-blue-600 dark:text-blue-400',
            ]"
          >
            <IconCheck class="w-5 h-5" aria-hidden="true" />
          </span>
        </li>
        <li
          v-if="!options || options.length === 0"
          class="relative cursor-default select-none py-2 px-3 text-gray-500 dark:text-gray-400"
        >
          No options available
        </li>
      </ul>
    </transition>
    <p
      v-if="(error && errorMessage) || supportingText"
      :class="supportingTextClasses"
    >
      {{ error && errorMessage ? errorMessage : supportingText }}
    </p>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  defineAsyncComponent,
} from "vue";
import { useId } from "#app";

const IconChevronDown = defineAsyncComponent(
  () => import("./icons/IconChevronDown.vue")
);
const IconChevronUp = defineAsyncComponent(
  () => import("./icons/IconChevronUp.vue")
);
const IconCheck = defineAsyncComponent(() => import("./icons/IconCheck.vue"));

export interface SelectOption {
  value: string | number | boolean | null | undefined;
  label: string;
  disabled?: boolean;
}

interface Props {
  modelValue: string | number | boolean | null | undefined | any[];
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  error?: boolean;
  errorMessage?: string;
  supportingText?: string;
  multiple?: boolean;
  multipleDisplayLimit?: number;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Select an option",
  disabled: false,
  id: undefined,
  error: false,
  errorMessage: "",
  supportingText: "",
  multiple: false,
  multipleDisplayLimit: 2,
});

const emit = defineEmits(["update:modelValue"]);

const isOpen = ref(false);
const isFocused = ref(false);
const selectWrapper = ref<HTMLElement | null>(null);
const optionsList = ref<HTMLElement | null>(null);
const highlightedIndex = ref(-1);

const internalId = useId();
const componentId = computed(() => props.id || `select-${internalId}`);

const hasSelection = computed(() => {
  if (props.multiple && Array.isArray(props.modelValue)) {
    return props.modelValue.length > 0;
  }
  return (
    props.modelValue !== undefined &&
    props.modelValue !== null &&
    props.modelValue !== ""
  );
});

const displayValue = computed(() => {
  if (props.multiple && Array.isArray(props.modelValue)) {
    if (props.modelValue.length === 0) {
      return props.placeholder;
    }
    const selectedLabels = props.options
      .filter((opt) => props.modelValue.includes(opt.value))
      .map((opt) => opt.label);

    if (selectedLabels.length > props.multipleDisplayLimit) {
      return `${selectedLabels.length} items selected`;
    }
    return selectedLabels.join(", ");
  }
  const selectedOpt = props.options.find(
    (option) => option.value === props.modelValue
  );
  return selectedOpt ? selectedOpt.label : props.placeholder;
});

const inputVisualClasses = computed(() => {
  const base = [];
  if (props.disabled) {
    return [
      ...base,
      "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 cursor-not-allowed !ring-0 text-gray-500 dark:text-gray-400",
    ];
  }
  if (props.error) {
    return [
      ...base,
      "border-red-500 dark:border-red-500 ring-red-500 dark:ring-red-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-red-500 dark:focus:border-red-500",
    ];
  }
  if (isFocused.value) {
    return [
      ...base,
      "border-blue-600 dark:border-blue-500 ring-blue-600 dark:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white",
    ];
  }
  return [
    ...base,
    "bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-900 dark:text-white",
  ];
});

const supportingTextClasses = computed(() => [
  "mt-1.5 ml-3 text-xs",
  props.disabled
    ? "text-gray-400 dark:text-gray-500"
    : props.error
    ? "text-red-600 dark:text-red-500"
    : "text-gray-500 dark:text-gray-400",
]);

const toggleDropdown = () => {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    if (
      props.multiple &&
      Array.isArray(props.modelValue) &&
      props.modelValue.length > 0
    ) {
      highlightedIndex.value = props.options.findIndex((opt) =>
        props.modelValue.includes(opt.value)
      );
      if (highlightedIndex.value === -1) highlightedIndex.value = 0;
    } else if (!props.multiple) {
      highlightedIndex.value = props.options.findIndex(
        (opt) => opt.value === props.modelValue
      );
    }
  }
};

const onFocus = () => {
  if (props.disabled) return;
  isFocused.value = true;
};

const onBlur = () => {
  setTimeout(() => {
    if (!selectWrapper.value?.contains(document.activeElement)) {
      isOpen.value = false;
    }
    if (!selectWrapper.value?.contains(document.activeElement)) {
      isFocused.value = false;
    }
  }, 100);
};

const selectOption = (option: SelectOption) => {
  if (option.disabled) return;
  if (props.multiple) {
    const currentModelValue = Array.isArray(props.modelValue)
      ? [...props.modelValue]
      : [];
    const optionIndex = currentModelValue.indexOf(option.value);
    if (optionIndex === -1) {
      currentModelValue.push(option.value);
    } else {
      currentModelValue.splice(optionIndex, 1);
    }
    emit("update:modelValue", currentModelValue);
  } else {
    emit("update:modelValue", option.value);
    isOpen.value = false;
    (selectWrapper.value?.querySelector("button") as HTMLElement)?.focus();
  }
};

const isSelected = (option: SelectOption): boolean => {
  if (props.multiple && Array.isArray(props.modelValue)) {
    return props.modelValue.includes(option.value);
  }
  return option.value === props.modelValue;
};

const handleClickOutside = (event: MouseEvent) => {
  if (
    selectWrapper.value &&
    !selectWrapper.value.contains(event.target as Node)
  ) {
    isOpen.value = false;
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return;
  if (
    !isOpen.value &&
    (event.key === "Enter" ||
      event.key === " " ||
      event.key === "ArrowDown" ||
      event.key === "ArrowUp")
  ) {
    event.preventDefault();
    isOpen.value = true;
    if (
      props.multiple &&
      Array.isArray(props.modelValue) &&
      props.modelValue.length > 0
    ) {
      highlightedIndex.value = props.options.findIndex((opt) =>
        props.modelValue.includes(opt.value)
      );
    } else {
      highlightedIndex.value = props.options.findIndex(
        (opt) => opt.value === props.modelValue
      );
    }
    if (highlightedIndex.value === -1 && props.options.length > 0)
      highlightedIndex.value = 0;
    scrollToHighlightedOption();
    return;
  }

  if (isOpen.value) {
    switch (event.key) {
      case "Escape":
        isOpen.value = false;
        (selectWrapper.value?.querySelector("button") as HTMLElement)?.focus();
        break;
      case "ArrowUp":
        event.preventDefault();
        highlightedIndex.value = Math.max(0, highlightedIndex.value - 1);
        scrollToHighlightedOption();
        break;
      case "ArrowDown":
        event.preventDefault();
        highlightedIndex.value = Math.min(
          props.options.length - 1,
          highlightedIndex.value + 1
        );
        scrollToHighlightedOption();
        break;
      case "Enter":
      // For multi-select, Enter might not close, but space always selects/deselects.
      // For now, Enter and Space will behave similarly.
      case " ":
        event.preventDefault();
        if (
          highlightedIndex.value >= 0 &&
          highlightedIndex.value < props.options.length
        ) {
          selectOption(props.options[highlightedIndex.value]);
        }
        break;
      case "Tab":
        isOpen.value = false;
        break;
    }
  }
};

const scrollToHighlightedOption = () => {
  if (optionsList.value && highlightedIndex.value >= 0) {
    const item = optionsList.value.children[
      highlightedIndex.value
    ] as HTMLLIElement;
    if (item) {
      item.scrollIntoView({ block: "nearest" });
    }
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  selectWrapper.value?.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
  selectWrapper.value?.removeEventListener("keydown", handleKeydown);
});
</script>
<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
