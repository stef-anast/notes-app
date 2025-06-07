import {
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick,
} from "vue";
import type { DropdownOption } from "~/types";

export interface UseDropdownOptions {
  options: DropdownOption[];
  modelValue: any;
  multiple?: boolean;
  closeOnSelect?: boolean;
  searchable?: boolean;
  searchText?: string;
  disabled?: boolean;
}

export function useDropdown(props: UseDropdownOptions, emit: any) {
  const isOpen = ref(false);
  const isFocused = ref(false);
  const highlightedIndex = ref(-1);
  const dropdownWrapperRef = ref<HTMLElement | null>(null);

  const hasValue = computed(() => {
    if (props.multiple && Array.isArray(props.modelValue)) {
      return props.modelValue.length > 0;
    }
    if (typeof props.modelValue === "string") {
      return props.modelValue !== "";
    }
    return props.modelValue !== undefined && props.modelValue !== null;
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
  });

  const toggleDropdown = () => {
    isOpen.value = !isOpen.value;
  };

  const openDropdown = () => {
    if (isOpen.value) return;
    isOpen.value = true;
  };

  const closeDropdown = () => {
    if (!isOpen.value) return;
    isOpen.value = false;
  };

  const onFocus = (event: FocusEvent, source: "container" | "input") => {
    isFocused.value = true;
    emit("focus", event, source);
  };

  const onBlur = (event: FocusEvent, source: "container" | "input") => {
    isFocused.value = false;
    emit("blur", event, source);
  };

  const handleOptionClick = (option: DropdownOption) => {
    if (option.disabled) return;

    emit("option-click", option);

    let newValue;
    if (props.multiple && Array.isArray(props.modelValue)) {
      const currentValues = [...props.modelValue];
      const optionIndex = currentValues.indexOf(option.value);

      if (optionIndex > -1) {
        currentValues.splice(optionIndex, 1);
      } else {
        currentValues.push(option.value);
      }
      newValue = currentValues;
    } else {
      newValue = option.value;
    }

    emit("update:modelValue", newValue);

    if (props.closeOnSelect && !props.multiple) {
      nextTick(() => closeDropdown());
    }
  };

  const handleKeydown = (event: KeyboardEvent) => {
    const { key } = event;
    const optionsCount = filteredOptions.value.length;

    switch (key) {
      case "Enter":
      case " ":
        event.preventDefault();
        if (!isOpen.value) {
          openDropdown();
        } else if (
          highlightedIndex.value >= 0 &&
          filteredOptions.value[highlightedIndex.value]
        ) {
          handleOptionClick(filteredOptions.value[highlightedIndex.value]);
        }
        break;
      case "Escape":
        event.preventDefault();
        closeDropdown();
        break;
      case "ArrowDown":
        event.preventDefault();
        if (!isOpen.value) {
          openDropdown();
        } else {
          highlightedIndex.value =
            highlightedIndex.value < optionsCount - 1
              ? highlightedIndex.value + 1
              : 0;
        }
        break;
      case "ArrowUp":
        event.preventDefault();
        if (!isOpen.value) {
          openDropdown();
        } else {
          highlightedIndex.value =
            highlightedIndex.value > 0
              ? highlightedIndex.value - 1
              : optionsCount - 1;
        }
        break;
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

  const handleSearchInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    emit("update:searchText", target.value);
  };

  onMounted(() => {
    document.addEventListener("click", handleClickOutside, true);
  });

  onBeforeUnmount(() => {
    document.removeEventListener("click", handleClickOutside, true);
  });

  return {
    isOpen,
    isFocused,
    highlightedIndex,
    dropdownWrapperRef,
    hasValue,
    filteredOptions,
    toggleDropdown,
    openDropdown,
    closeDropdown,
    onFocus,
    onBlur,
    handleOptionClick,
    handleKeydown,
    handleSearchInput,
    setHighlightedIndex: (index: number) => {
      highlightedIndex.value = index;
    },
  };
}
