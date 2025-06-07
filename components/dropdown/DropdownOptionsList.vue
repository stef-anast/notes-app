<template>
  <transition
    leave-active-class="transition ease-in duration-100"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen"
      :id="optionsId"
      ref="optionsListRef"
      :class="[
        customOptionsClass ||
          'absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-2xl shadow-lg max-h-60 overflow-auto focus:outline-none text-base py-0.5',
      ]"
      tabindex="-1"
      role="listbox"
      :aria-activedescendant="
        highlightedIndex >= 0 && options[highlightedIndex]
          ? `${optionsId}-option-${highlightedIndex}`
          : undefined
      "
      :aria-multiselectable="multiple"
      :aria-labelledby="ariaLabelledBy"
    >
      <slot name="options-header"></slot>

      <ul v-if="!showCheckboxes">
        <slot
          name="custom-options"
          :options="options"
          :highlighted-index="highlightedIndex"
          :options-id="optionsId"
          :handle-option-click="handleOptionClick"
          :set-highlighted-index="setHighlightedIndex"
          :search-text="searchText"
        >
          <li
            v-if="!options || options.length === 0"
            class="relative cursor-default select-none py-2 px-3 text-gray-500 mt-0.5 mb-0.5"
            role="option"
          >
            {{ searchText ? "No results found" : "No options available" }}
          </li>
          <li
            v-for="(option, index) in options"
            :key="option.value?.toString() ?? `${index}-fallback`"
            @click="!option.disabled ? handleOptionClick(option) : undefined"
            @mouseenter="
              !option.disabled ? setHighlightedIndex(index) : undefined
            "
            :class="[
              'relative select-none py-2 px-3 text-gray-900 flex items-center gap-x-2 mb-0.5',
              highlightedIndex === index && !option.disabled
                ? 'bg-blue-50'
                : option.isSelectedInMulti && !option.disabled
                ? 'bg-blue-100'
                : '',
              option.disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer',
              'first:mt-0.5 last:mb-0.5',
            ]"
            role="option"
            :id="`${optionsId}-option-${index}`"
            :aria-selected="
              option.isSelectedInMulti ||
              (!multiple && modelValue === option.value)
            "
            :aria-disabled="option.disabled"
          >
            <span class="block truncate">{{ option.label }}</span>
          </li>
        </slot>
      </ul>

      <!-- Checkbox mode for filter dropdown -->
      <ul v-else>
        <!-- Select All Option -->
        <li
          v-if="showSelectAll && options && options.length > 0"
          @click.stop="handleSelectAllClick"
          :class="[
            'relative rounded-t-xl select-none py-2.5 px-4 text-sm text-gray-900 flex items-center gap-x-3 mb-0.5',
            isAllSelected || isIndeterminate ? 'bg-blue-100' : '',
            'cursor-pointer hover:bg-blue-50',
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
          v-for="(option, index) in options"
          :key="option.value?.toString() ?? `${index}-fallback`"
          @click.stop="handleOptionClick(option)"
          :class="[
            'relative select-none py-2.5 px-4 text-sm text-gray-900 flex items-center gap-x-3',
            isSelected(option) && !option.disabled ? 'bg-blue-100' : '',
            option.disabled
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer hover:bg-blue-50',
            index === options.length - 1 ? 'rounded-b-xl' : 'mb-0.5',
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
          v-if="!options || options.length === 0"
          class="relative cursor-default select-none py-2.5 px-4 text-sm text-gray-500 mb-0.5"
          role="option"
        >
          No options available
        </li>
      </ul>

      <slot name="options-footer"></slot>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { DropdownOption } from "~/types";

interface Props {
  isOpen?: boolean;
  options?: DropdownOption[];
  highlightedIndex?: number;
  modelValue?: any;
  multiple?: boolean;
  searchText?: string;
  optionsId?: string;
  ariaLabelledBy?: string;
  showCheckboxes?: boolean;
  showSelectAll?: boolean;
  customOptionsClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  options: () => [],
  highlightedIndex: -1,
  multiple: false,
  searchText: "",
  showCheckboxes: false,
  showSelectAll: false,
  customOptionsClass: "",
});

const emit = defineEmits([
  "option-click",
  "set-highlighted-index",
  "select-all-click",
]);

const optionsListRef = ref<HTMLElement | null>(null);

const toggleableOptions = computed(() => {
  return props.options?.filter((opt) => !opt.disabled) || [];
});

const isAllSelected = computed(() => {
  if (!toggleableOptions.value.length || !Array.isArray(props.modelValue))
    return false;
  return toggleableOptions.value.every((opt) =>
    props.modelValue.includes(opt.value)
  );
});

const isIndeterminate = computed(() => {
  if (!toggleableOptions.value.length || !Array.isArray(props.modelValue))
    return false;
  const selectedCount = toggleableOptions.value.filter((opt) =>
    props.modelValue.includes(opt.value)
  ).length;
  return selectedCount > 0 && selectedCount < toggleableOptions.value.length;
});

const isSelected = (option: DropdownOption): boolean => {
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.includes(option.value);
  }
  return props.modelValue === option.value;
};

const handleOptionClick = (option: DropdownOption) => {
  emit("option-click", option);
};

const setHighlightedIndex = (index: number) => {
  emit("set-highlighted-index", index);
};

const handleSelectAllClick = () => {
  emit("select-all-click", {
    isAllSelected: isAllSelected.value,
    toggleableOptions: toggleableOptions.value,
  });
};

const scrollToHighlightedOption = () => {
  if (
    props.highlightedIndex >= 0 &&
    props.options &&
    props.highlightedIndex < props.options.length &&
    optionsListRef.value
  ) {
    const highlightedElement = optionsListRef.value.children[
      props.highlightedIndex
    ] as HTMLElement;
    if (highlightedElement) {
      highlightedElement.scrollIntoView({
        block: "nearest",
      });
    }
  }
};

defineExpose({
  optionsListRef,
  scrollToHighlightedOption,
});
</script>
