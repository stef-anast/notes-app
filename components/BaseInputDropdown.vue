<template>
  <div class="relative" ref="dropdownWrapperRef">
    <label
      v-if="props.label"
      :for="
        props.searchable && props.showSearchInTrigger
          ? componentId + '-input'
          : componentId + '-trigger-container'
      "
      :class="labelClasses"
    >
      {{ props.label }}
    </label>

    <div
      :id="componentId + '-trigger-container'"
      ref="triggerContainerRef"
      @click="handleTriggerContainerClick"
      :tabindex="
        props.disabled || (props.searchable && props.showSearchInTrigger)
          ? -1
          : 0
      "
      @focus="
        !(props.searchable && props.showSearchInTrigger)
          ? onFocus($event, 'container')
          : undefined
      "
      @blur="
        !(props.searchable && props.showSearchInTrigger)
          ? onBlur($event, 'container')
          : undefined
      "
      @keydown="
        !(props.searchable && props.showSearchInTrigger)
          ? handleDropdownKeydown($event)
          : undefined
      "
      :class="[
        'relative w-full h-auto min-h-[3.5rem] rounded-2xl border outline-none text-base',
        'flex',
        props.label ? 'pt-6 pb-1 px-3' : 'p-3',
        frameVisualClasses,
        props.disabled ? 'cursor-not-allowed' : 'cursor-pointer',
      ]"
      role="combobox"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      :aria-labelledby="ariaLabelledByIds"
      :aria-controls="isOpen ? componentId + '-options' : undefined"
    >
      <div class="flex flex-wrap items-center gap-x-1.5 gap-y-1 w-full">
        <slot
          name="trigger-content"
          :is-open="isOpen"
          :has-selection="hasValue"
          :input-id="componentId + '-input'"
          :input-placeholder-text="internalSearchInputPlaceholder"
          :focus-input="focusInput"
          :toggle-dropdown="toggleDropdown"
          :is-label-active="isLabelActive.value"
        ></slot>

        <input
          v-if="props.searchable && props.showSearchInTrigger"
          ref="searchInputRef"
          :id="componentId + '-input'"
          type="text"
          :value="props.searchText"
          @input="handleSearchInput"
          @focus="onFocus($event, 'input')"
          @blur="onBlur($event, 'input')"
          @keydown="handleDropdownKeydown"
          :disabled="props.disabled"
          :placeholder="internalSearchInputPlaceholder"
          class="flex-grow min-w-[60px] bg-transparent border-none outline-none p-0 m-0 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 leading-normal"
          style="box-shadow: none"
          :aria-label="props.label || props.placeholder"
          autocomplete="off"
        />

        <slot
          v-if="!(props.searchable && props.showSearchInTrigger)"
          name="trigger"
          :is-open="isOpen"
          :has-selection="hasValue"
          :is-label-active="isLabelActive.value"
        ></slot>
      </div>

      <span
        v-if="!props.disabled"
        @click.stop="toggleDropdown"
        class="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
        aria-hidden="true"
      >
        <component
          :is="isOpen ? IconChevronUp : IconChevronDown"
          class="w-5 h-5 text-gray-400 dark:text-gray-500"
        />
      </span>
    </div>

    <span
      v-if="props.label"
      :id="componentId + '-actual-label'"
      class="sr-only"
    >
      {{ props.label }}
    </span>

    <transition
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <ul
        v-if="isOpen"
        :id="componentId + '-options'"
        ref="optionsListRef"
        class="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl shadow-lg max-h-60 overflow-auto focus:outline-none text-base py-0.5"
        tabindex="-1"
        role="listbox"
        :aria-activedescendant="
          highlightedIndex >= 0 && filteredOptions[highlightedIndex]
            ? componentId + '-option-' + highlightedIndex
            : undefined
        "
        :aria-multiselectable="props.multiple"
        :aria-labelledby="
          props.label ? componentId + '-actual-label' : undefined
        "
      >
        <slot
          name="options-list"
          :options="filteredOptions"
          :highlighted-index="highlightedIndex"
          :component-id="componentId"
          :select-option-from-base="handleOptionClickedFromSlot"
          :set-highlighted-index-from-base="
            (index) => (highlightedIndex = index)
          "
          :search-text="props.searchText"
        >
          <li
            v-if="!filteredOptions || filteredOptions.length === 0"
            class="relative cursor-default select-none py-2 px-3 text-gray-500 dark:text-gray-400 mt-0.5 mb-0.5"
            role="option"
          >
            {{ props.searchText ? "No results found" : "No options available" }}
          </li>
          <li
            v-for="(option, index) in filteredOptions"
            :key="option.value?.toString() ?? index + '-fallback'"
            @click="
              !option.disabled ? handleOptionClickedFromSlot(option) : undefined
            "
            @mouseenter="
              !option.disabled ? (highlightedIndex = index) : undefined
            "
            :class="[
              'relative select-none py-2 px-3 text-gray-900 dark:text-white flex items-center gap-x-2 mb-0.5',
              highlightedIndex === index && !option.disabled
                ? 'bg-blue-50 dark:bg-blue-900/50'
                : option.isSelectedInMulti && !option.disabled
                ? 'bg-blue-100 dark:bg-blue-700'
                : '',
              option.disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer',
              'first:mt-0.5 last:mb-0.5',
            ]"
            role="option"
            :id="componentId + '-option-' + index"
            :aria-selected="
              option.isSelectedInMulti ||
              (!props.multiple && props.modelValue === option.value)
            "
            :aria-disabled="option.disabled"
          >
            <span class="block truncate">{{ option.label }}</span>
          </li>
        </slot>
      </ul>
    </transition>

    <p v-if="supportingTextResolved" :class="supportingTextClasses">
      {{ supportingTextResolved }}
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
  nextTick,
} from "vue";
import { useId } from "#app";

const IconChevronDown = defineAsyncComponent(
  () => import("./icons/IconChevronDown.vue")
);
const IconChevronUp = defineAsyncComponent(
  () => import("./icons/IconChevronUp.vue")
);

export interface DropdownOption {
  value: string | number | boolean | null | undefined;
  label: string;
  disabled?: boolean;
  isSelectedInMulti?: boolean;
  [key: string]: any;
}

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

const dropdownWrapperRef = ref<HTMLElement | null>(null);
const triggerContainerRef = ref<HTMLElement | null>(null);
const optionsListRef = ref<HTMLElement | null>(null);
const searchInputRef = ref<HTMLInputElement | null>(null);

const isOpen = ref(false);
const isFocused = ref(false);
const highlightedIndex = ref(-1);

const hasValue = computed(() => {
  if (props.multiple && Array.isArray(props.modelValue)) {
    return props.modelValue.length > 0;
  }
  if (typeof props.modelValue === "string") {
    return props.modelValue !== "";
  }
  return props.modelValue !== undefined && props.modelValue !== null;
});

const isLabelActive = computed(() => {
  return (
    isFocused.value ||
    hasValue.value ||
    (props.searchable &&
      props.showSearchInTrigger &&
      props.searchText &&
      props.searchText.length > 0) ||
    props.disabled ||
    !props.placeholder
  );
});

const labelClasses = computed(() => {
  if (!props.label) return ["sr-only"];

  const baseStyles = [
    "absolute z-10 left-3 pointer-events-none",
    "transform-origin-top-left transition-all duration-200 ease-in-out",
  ];

  let colorClass = "";
  if (isLabelActive.value) {
    if (props.disabled) colorClass = "text-gray-400 dark:text-gray-500";
    else if (props.error) colorClass = "text-red-600 dark:text-red-500";
    else if (isFocused.value) colorClass = "text-blue-600 dark:text-blue-500";
    else colorClass = "text-gray-700 dark:text-gray-300";
  } else {
    if (props.error) colorClass = "text-red-600 dark:text-red-500";
    else if (props.disabled) colorClass = "text-gray-400 dark:text-gray-500";
    else
      colorClass =
        "text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300";
  }

  const sizeAndPositionClasses = isLabelActive.value
    ? "text-xs scale-75 top-1.5"
    : "top-3.5 text-base";

  return [...baseStyles, colorClass, sizeAndPositionClasses];
});

const internalSearchInputPlaceholder = computed(() => {
  if (props.searchable && props.showSearchInTrigger && isLabelActive.value) {
    if (props.multiple && hasValue.value) {
      return "";
    }
    return props.placeholder;
  }
  return "";
});

const frameVisualClasses = computed(() => {
  if (props.disabled) {
    return "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 !ring-0";
  }
  if (props.error) {
    return "border-red-500 dark:border-red-500 ring-1 ring-red-500 bg-white dark:bg-gray-900 focus-within:border-red-500 dark:focus-within:border-red-500";
  }
  if (isFocused.value) {
    return "border-blue-600 dark:border-blue-500 ring-1 ring-blue-600 bg-white dark:bg-gray-900";
  }
  return "bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 focus-within:border-blue-600 dark:focus-within:border-blue-500";
});

const supportingTextResolved = computed(() => {
  return props.error && props.errorMessage
    ? props.errorMessage
    : props.supportingText;
});

const supportingTextClasses = computed(() => [
  "mt-1.5 ml-3 text-xs",
  props.disabled
    ? "text-gray-400 dark:text-gray-500"
    : props.error
    ? "text-red-600 dark:text-red-500"
    : "text-gray-500 dark:text-gray-400",
]);

const ariaLabelledByIds = computed(() => {
  const ids = [];
  if (props.label) ids.push(componentId.value + "-actual-label");
  return ids.join(" ") || undefined;
});

const filteredOptions = computed(() => {
  if (props.searchable && props.searchText) {
    const searchTerm = props.searchText.toLowerCase();
    return props.options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm)
    );
  }
  return props.options;
});

watch(isOpen, (newValue) => {
  emit("dropdown-state-change", { isOpen: newValue });
  highlightedIndex.value = -1;
  if (newValue && props.modelValue && !props.multiple) {
    const selectedIdx = filteredOptions.value.findIndex(
      (opt) => opt.value === props.modelValue
    );
    if (selectedIdx !== -1) highlightedIndex.value = selectedIdx;
  }
  if (newValue) {
    nextTick(() => scrollToHighlightedOption());
  }
});

const toggleDropdown = () => {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
};

const openDropdown = () => {
  if (props.disabled || isOpen.value) return;
  isOpen.value = true;
};

const closeDropdown = () => {
  if (!isOpen.value) return;
  isOpen.value = false;
};

const focusInput = () => {
  if (props.searchable && props.showSearchInTrigger && searchInputRef.value) {
    searchInputRef.value.focus();
  } else if (triggerContainerRef.value) {
    triggerContainerRef.value.focus();
  }
};

const handleTriggerContainerClick = (event: MouseEvent) => {
  emit("trigger-click", event);
  if (props.disabled) return;

  if (
    (event.target as HTMLElement).closest(".absolute.inset-y-0.right-0") ||
    event.target === searchInputRef.value
  ) {
    if (!isOpen.value) toggleDropdown();
    return;
  }

  toggleDropdown();

  if (isOpen.value && props.searchable && props.showSearchInTrigger) {
    nextTick(() => {
      searchInputRef.value?.focus();
    });
  }
};

const handleSearchInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("update:searchText", target.value);
  if (!isOpen.value) {
    openDropdown();
  }
  highlightedIndex.value = -1;
};

const onFocus = (event: FocusEvent, origin: "input" | "container") => {
  if (props.disabled) return;
  isFocused.value = true;
  emit("focus", event);
};

const onBlur = (event: FocusEvent, origin: "input" | "container") => {
  setTimeout(() => {
    if (
      dropdownWrapperRef.value &&
      !dropdownWrapperRef.value.contains(document.activeElement)
    ) {
      isFocused.value = false;
      closeDropdown();
      emit("blur", event);
    }
  }, 150);
};

const handleOptionClickedFromSlot = (option: DropdownOption) => {
  if (option.disabled) return;
  emit("option-click", option);

  if (!props.multiple && props.closeOnSelect) {
    closeDropdown();
    if (props.searchable && props.showSearchInTrigger && searchInputRef.value) {
      searchInputRef.value.focus();
    } else if (triggerContainerRef.value) {
      triggerContainerRef.value.focus();
    }
  } else if (props.multiple && props.searchable && props.showSearchInTrigger) {
    emit("update:searchText", "");
    searchInputRef.value?.focus();
  }
};

const handleDropdownKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return;

  const openKeys = ["Enter", " ", "ArrowDown", "ArrowUp"];
  if (!isOpen.value && openKeys.includes(event.key)) {
    event.preventDefault();
    openDropdown();
    if (
      props.searchable &&
      props.showSearchInTrigger &&
      (event.key === "ArrowDown" || event.key === "ArrowUp")
    ) {
    } else if (props.searchable && props.showSearchInTrigger) {
      searchInputRef.value?.focus();
    }
    return;
  }

  if (isOpen.value) {
    switch (event.key) {
      case "Escape":
        event.preventDefault();
        closeDropdown();
        focusInput();
        break;
      case "ArrowUp":
        event.preventDefault();
        if (filteredOptions.value.length > 0) {
          highlightedIndex.value =
            (highlightedIndex.value - 1 + filteredOptions.value.length) %
            filteredOptions.value.length;
          while (filteredOptions.value[highlightedIndex.value]?.disabled) {
            highlightedIndex.value =
              (highlightedIndex.value - 1 + filteredOptions.value.length) %
              filteredOptions.value.length;
          }
        } else {
          highlightedIndex.value = -1;
        }
        scrollToHighlightedOption();
        break;
      case "ArrowDown":
        event.preventDefault();
        if (filteredOptions.value.length > 0) {
          highlightedIndex.value =
            (highlightedIndex.value + 1) % filteredOptions.value.length;
          while (filteredOptions.value[highlightedIndex.value]?.disabled) {
            highlightedIndex.value =
              (highlightedIndex.value + 1) % filteredOptions.value.length;
          }
        } else {
          highlightedIndex.value = -1;
        }
        scrollToHighlightedOption();
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (
          highlightedIndex.value >= 0 &&
          highlightedIndex.value < filteredOptions.value.length
        ) {
          const selectedOption = filteredOptions.value[highlightedIndex.value];
          if (!selectedOption.disabled) {
            handleOptionClickedFromSlot(selectedOption);
          }
        }
        break;
      case "Tab":
        closeDropdown();
        break;
      default:
        if (props.searchable && props.showSearchInTrigger) {
        } else {
        }
        break;
    }
  }
};

const scrollToHighlightedOption = () => {
  if (
    optionsListRef.value &&
    highlightedIndex.value >= 0 &&
    filteredOptions.value[highlightedIndex.value]
  ) {
    const optionElement = optionsListRef.value.querySelector(
      `#${componentId.value}-option-${highlightedIndex.value}`
    ) as HTMLLIElement;
    if (optionElement) {
      optionElement.scrollIntoView({ block: "nearest" });
    }
  }
};

const handleClickOutside = (event: MouseEvent) => {
  if (
    dropdownWrapperRef.value &&
    !dropdownWrapperRef.value.contains(event.target as Node)
  ) {
    if (isOpen.value) {
      closeDropdown();
      if (
        document.activeElement === document.body ||
        (document.activeElement &&
          !dropdownWrapperRef.value.contains(document.activeElement))
      ) {
        if (isFocused.value) {
          isFocused.value = false;
          emit("blur", new FocusEvent("blur"));
        }
      }
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
  open: openDropdown,
  close: closeDropdown,
  toggle: toggleDropdown,
  focus: focusInput,
  blur: () => {
    if (searchInputRef.value) searchInputRef.value.blur();
    else if (triggerContainerRef.value) triggerContainerRef.value.blur();
  },
  focusInput,
  blurInput: () => searchInputRef.value?.blur(),
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
