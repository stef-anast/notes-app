<template>
  <div class="relative" ref="selectWrapper">
    <label v-if="label" :for="componentId + '-input'" :class="labelClasses">
      {{ label }}
    </label>

    <div
      :id="componentId"
      @click="focusInputAndOpenDropdown"
      :tabindex="disabled ? -1 : 0"
      @focus="onFocusContainer"
      @blur="onBlurContainer"
      :class="[
        'relative w-full min-h-[3.5rem] h-auto p-3 pr-10 pt-6 rounded-2xl border outline-none text-base',
        'flex flex-wrap items-center gap-1.5',
        inputVisualClasses,
      ]"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      :aria-labelledby="label ? componentId + '-label-sr' : undefined"
      role="combobox"
    >
      <span v-if="label" :id="componentId + '-label-sr'" class="sr-only">{{
        label
      }}</span>

      <!-- Selected Pills -->
      <span
        v-for="option in selectedOptions.slice(0, maxVisiblePillsComputed)"
        :key="option.value?.toString() + '-pill'"
        class="inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-gray-700 dark:bg-blue-700 dark:text-gray-200"
      >
        {{ option.label }}
        <button
          type="button"
          @click.stop="deselectOption(option)"
          class="ml-1.5 -mr-0.5 flex-shrink-0 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 focus:outline-none"
          :aria-label="`Remove ${option.label}`"
        >
          <IconClose class="w-3 h-3" />
        </button>
      </span>

      <span
        v-if="selectedOptions.length > maxVisiblePillsComputed"
        class="text-xs font-medium text-gray-500 dark:text-gray-400"
      >
        +{{ selectedOptions.length - maxVisiblePillsComputed }}
      </span>

      <input
        :id="componentId + '-input'"
        ref="inputEl"
        type="text"
        v-model="searchText"
        @focus="onFocusInput"
        @blur="onBlurInput"
        @input="onInput"
        @keydown="handleKeydownInput"
        :disabled="disabled"
        :placeholder="inputPlaceholderText"
        class="flex-grow min-w-[60px] bg-transparent border-none outline-none p-0 m-0 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        style="box-shadow: none"
      />

      <span class="absolute inset-y-0 right-0 flex items-center pr-3">
        <component
          :is="isOpen ? IconChevronUp : IconChevronDown"
          @click.stop="toggleDropdown"
          class="w-5 h-5 text-gray-400 dark:text-gray-500 cursor-pointer"
          aria-hidden="true"
        />
      </span>
    </div>

    <transition
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <ul
        v-if="isOpen"
        ref="optionsListEl"
        class="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl shadow-lg max-h-60 overflow-auto focus:outline-none text-base py-1"
        tabindex="-1"
        role="listbox"
        :aria-labelledby="label ? componentId + '-label-sr' : undefined"
      >
        <li
          v-for="(option, index) in filteredOptions"
          :key="option.value?.toString() + '-option'"
          @click="selectOption(option)"
          @mouseenter="highlightedIndex = index"
          :class="[
            'relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 dark:text-white flex items-center gap-x-3',
            highlightedIndex === index ? 'bg-blue-50 dark:bg-blue-900/50' : '',
            option.disabled ? 'opacity-50 cursor-not-allowed' : '',
          ]"
          role="option"
          :id="componentId + '-option-' + index"
          :aria-selected="isSelected(option)"
        >
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
          <span class="block truncate">{{ option.label }}</span>
        </li>
        <li
          v-if="filteredOptions.length === 0"
          class="relative cursor-default select-none py-2 px-3 text-gray-500 dark:text-gray-400"
        >
          {{ searchText ? "No results found" : "No options available" }}
        </li>
      </ul>
    </transition>

    <p
      v-if="(error && errorMessage) || supportingText"
      :class="['mt-1.5 ml-3 text-xs', supportingTextClasses]"
    >
      {{ error && errorMessage ? errorMessage : supportingText }}
    </p>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
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
const IconClose = defineAsyncComponent(() => import("./icons/IconClose.vue"));

export interface SelectOption {
  value: string | number | boolean | null | undefined;
  label: string;
  disabled?: boolean;
}

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
  allowNew?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  placeholder: "Select options",
  disabled: false,
  id: undefined,
  error: false,
  errorMessage: "",
  supportingText: "",
  maxVisiblePills: 3,
  allowNew: false,
});

const emit = defineEmits(["update:modelValue", "search-text-change"]);

const internalId = useId();
const componentId = computed(
  () => props.id || `multiselect-pills-${internalId}`
);

const selectWrapper = ref<HTMLElement | null>(null);
const inputEl = ref<HTMLInputElement | null>(null);
const optionsListEl = ref<HTMLElement | null>(null);

const isOpen = ref(false);
const isFocusedContainer = ref(false);
const isFocusedInput = ref(false);
const searchText = ref("");
const highlightedIndex = ref(-1);

const hasValue = computed(
  () => props.modelValue && props.modelValue.length > 0
);

const selectedOptions = computed(() => {
  return props.options.filter((opt) => props.modelValue.includes(opt.value));
});

const maxVisiblePillsComputed = computed(() => {
  return Math.max(1, props.maxVisiblePills);
});

const labelClasses = computed(() => {
  if (!props.label) return ["sr-only"];

  const baseStyles = [
    "absolute z-10 left-3 pointer-events-none",
    "transform-origin-top-left transition-all duration-200 ease-in-out",
  ];

  const isEffectivelyFocused = isFocusedInput.value || isFocusedContainer.value;
  const isPositionActive =
    isEffectivelyFocused ||
    hasValue.value ||
    !!searchText.value ||
    props.disabled;

  let finalClasses = [...baseStyles];
  let colorClass = "";

  if (props.disabled) {
    colorClass = "text-gray-400 dark:text-gray-500";
  } else if (props.error) {
    colorClass = "text-red-600 dark:text-red-500";
  } else if (isEffectivelyFocused) {
    colorClass = "text-blue-600 dark:text-blue-500";
  } else if (hasValue.value || !!searchText.value) {
    colorClass = "text-gray-700 dark:text-gray-300";
  } else {
    colorClass =
      "text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300";
  }
  finalClasses.push(colorClass);

  if (isPositionActive) {
    finalClasses.push("text-xs scale-75 top-1.5");
  } else {
    finalClasses.push("top-3.5 text-base");
  }
  return finalClasses;
});

const inputVisualClasses = computed(() => {
  const componentIsActive = isFocusedContainer.value || isFocusedInput.value;

  if (props.disabled)
    return "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 cursor-not-allowed !ring-0";
  if (props.error)
    return "border-red-500 dark:border-red-500 ring-1 ring-red-500 bg-white dark:bg-gray-900";
  if (componentIsActive)
    return "border-blue-600 dark:border-blue-500 ring-1 ring-blue-600 bg-white dark:bg-gray-900";
  return "bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500";
});

const supportingTextClasses = computed(() => {
  if (props.disabled) return "text-gray-400 dark:text-gray-500";
  if (props.error) return "text-red-600 dark:text-red-500";
  return "text-gray-500 dark:text-gray-400";
});

const inputPlaceholderText = computed(() => {
  if (isFocusedInput.value && !hasValue.value && !searchText.value) {
    return props.placeholder;
  }
  return "";
});

const filteredOptions = computed(() => {
  if (!searchText.value) {
    return props.options;
  }
  return props.options.filter((option) =>
    option.label.toLowerCase().includes(searchText.value.toLowerCase())
  );
});

const focusInputAndOpenDropdown = async () => {
  if (props.disabled) return;
  inputEl.value?.focus();
  isOpen.value = true;
};

const toggleDropdown = () => {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    inputEl.value?.focus();
  }
};

const onFocusContainer = () => {
  if (props.disabled) return;
  isFocusedContainer.value = true;
};
const onBlurContainer = () => {
  setTimeout(() => {
    if (!selectWrapper.value?.contains(document.activeElement)) {
      isFocusedContainer.value = false;
      if (!isFocusedInput.value) isOpen.value = false;
    }
  }, 100);
};

// Focus/blur for the actual text input element
const onFocusInput = () => {
  if (props.disabled) return;
  isFocusedInput.value = true;
  isFocusedContainer.value = true;
};
const onBlurInput = () => {
  setTimeout(() => {
    if (!selectWrapper.value?.contains(document.activeElement)) {
      isFocusedInput.value = false;
      isFocusedContainer.value = false;
      isOpen.value = false;
    }
  }, 150);
};

const onInput = () => {
  isOpen.value = true;
  highlightedIndex.value = -1;
  emit("search-text-change", searchText.value);
};

const selectOption = (option: SelectOption) => {
  if (option.disabled) return;
  const currentValue = [...props.modelValue];
  const index = currentValue.findIndex((val) => val === option.value);

  if (index === -1) {
    currentValue.push(option.value);
  } else {
    currentValue.splice(index, 1);
  }
  emit("update:modelValue", currentValue);
  searchText.value = "";
  inputEl.value?.focus();
};

const deselectOption = (optionToDeselect: SelectOption) => {
  if (props.disabled) return;
  const newValue = props.modelValue.filter(
    (val) => val !== optionToDeselect.value
  );
  emit("update:modelValue", newValue);
  inputEl.value?.focus();
};

const isSelected = (option: SelectOption) => {
  return props.modelValue.includes(option.value);
};

const handleKeydownInput = (event: KeyboardEvent) => {
  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      if (!isOpen.value) isOpen.value = true;
      highlightedIndex.value = Math.min(
        filteredOptions.value.length - 1,
        highlightedIndex.value + 1
      );
      scrollToHighlightedOption();
      break;
    case "ArrowUp":
      event.preventDefault();
      if (!isOpen.value) isOpen.value = true;
      highlightedIndex.value = Math.max(0, highlightedIndex.value - 1);
      scrollToHighlightedOption();
      break;
    case "Enter":
      event.preventDefault();
      if (
        isOpen.value &&
        highlightedIndex.value >= 0 &&
        filteredOptions.value[highlightedIndex.value]
      ) {
        selectOption(filteredOptions.value[highlightedIndex.value]);
      } else if (props.allowNew && searchText.value.trim()) {
        searchText.value = "";
      }
      break;
    case "Escape":
      isOpen.value = false;
      inputEl.value?.blur();
      break;
    case "Backspace":
      if (searchText.value === "" && props.modelValue.length > 0) {
        const lastSelectedOption =
          selectedOptions.value[selectedOptions.value.length - 1];
        if (lastSelectedOption) {
          deselectOption(lastSelectedOption);
        }
      }
      break;
  }
};

const scrollToHighlightedOption = () => {
  if (optionsListEl.value && highlightedIndex.value >= 0) {
    const item = optionsListEl.value.children[
      highlightedIndex.value
    ] as HTMLLIElement;
    if (item) {
      item.scrollIntoView({ block: "nearest" });
    }
  }
};

const handleClickOutside = (event: MouseEvent) => {
  if (
    selectWrapper.value &&
    !selectWrapper.value.contains(event.target as Node)
  ) {
    isOpen.value = false;
    isFocusedInput.value = false;
    isFocusedContainer.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside, true);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside, true);
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
input[type="text"]:focus {
  outline: none;
  box-shadow: none;
  border: none;
}
</style>
