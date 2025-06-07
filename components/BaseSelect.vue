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
    :multiple="props.multiple"
    :close-on-select="!props.multiple"
    @option-click="handleOptionClickFromBase"
  >
    <template #trigger="{ hasSelection, isLabelActive }">
      <span
        :class="[
          'block truncate w-full pb-1',
          hasSelection
            ? 'text-gray-900'
            : isLabelActive
            ? 'text-gray-900'
            : 'text-transparent',
        ]"
      >
        {{
          hasSelection ? displayValue : isLabelActive ? props.placeholder : ""
        }}
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
        class="relative cursor-default select-none py-2 px-3 text-gray-900 mt-0.5 mb-0.5"
        role="option"
      >
        No options available
      </li>
      <li
        v-for="(option, index) in slotOptions"
        :key="option.value?.toString() ?? index"
        @click="!option.disabled ? selectOptionFromBase(option) : undefined"
        @mouseenter="
          !option.disabled ? setHighlightedIndexFromBase(index) : undefined
        "
        :class="[
          'relative select-none py-2 text-gray-900 flex items-center gap-x-2 mb-0.5',
          multiple ? 'pl-3 pr-4' : 'px-3',
          slotHighlightedIndex === index && !option.disabled
            ? 'bg-blue-50'
            : isSelected(option) && !option.disabled
            ? 'bg-blue-100'
            : '',
          option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
          'first:mt-0.5 last:mb-0.5',
        ]"
        role="option"
        :id="slotComponentId + '-option-' + index"
        :aria-selected="isSelected(option)"
        :aria-disabled="option.disabled"
      >
        <template v-if="multiple">
          <span
            :class="[
              'w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center',
              isSelected(option) && !option.disabled
                ? 'bg-blue-600 border-blue-600'
                : 'bg-white border-gray-400',
              option.disabled
                ? 'border-gray-300 bg-gray-100'
                : '',
            ]"
            aria-hidden="true"
          >
            <IconCheck
              v-if="isSelected(option) && !option.disabled"
              class="w-4 h-4 text-white"
            />
          </span>
        </template>
        <span
          :class="[
            'block truncate',
            option.disabled ? 'text-gray-400' : '',
          ]"
        >
          {{ option.label }}
        </span>
      </li>
    </template>
  </BaseInputDropdown>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from "vue";
import BaseInputDropdown, {
  type DropdownOption,
} from "./BaseInputDropdown.vue";

export type SelectOption = DropdownOption;

const IconCheck = defineAsyncComponent(() => import("./icons/IconCheck.vue"));

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

const baseDropdownRef = ref<InstanceType<typeof BaseInputDropdown> | null>(
  null
);

const isSelected = (option: SelectOption): boolean => {
  if (props.multiple && Array.isArray(props.modelValue)) {
    return props.modelValue.includes(option.value);
  }
  return props.modelValue === option.value;
};

const displayValue = computed(() => {
  if (props.multiple && Array.isArray(props.modelValue)) {
    if (props.modelValue.length === 0) {
      return props.placeholder;
    }
    const selectedValues = props.modelValue;
    const selectedLabels = props.options
      .filter((opt) => selectedValues.includes(opt.value))
      .map((opt) => opt.label);

    if (
      props.multipleDisplayLimit > 0 &&
      selectedLabels.length > props.multipleDisplayLimit
    ) {
      return `${selectedLabels.length} items selected`;
    }
    if (selectedLabels.length === 0) return props.placeholder;
    return selectedLabels.join(", ");
  }
  const selectedOpt = props.options.find(
    (option) => option.value === props.modelValue
  );
  return selectedOpt ? selectedOpt.label : props.placeholder;
});

const handleOptionClickFromBase = (option: SelectOption) => {
  if (option.disabled) return;

  if (props.multiple) {
    const currentValue = Array.isArray(props.modelValue)
      ? [...props.modelValue]
      : [];
    const index = currentValue.indexOf(option.value);
    if (index > -1) {
      currentValue.splice(index, 1);
    } else {
      currentValue.push(option.value);
    }
    emit("update:modelValue", currentValue);
  } else {
    emit("update:modelValue", option.value);
  }
};

const open = () => baseDropdownRef.value?.open();
const close = () => baseDropdownRef.value?.close();
const toggle = () => baseDropdownRef.value?.toggle();
const focus = () => baseDropdownRef.value?.focus();
const blur = () => baseDropdownRef.value?.blur();

defineExpose({
  open,
  close,
  toggle,
  focus,
  blur,
});
</script>
