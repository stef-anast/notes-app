<template>
  <div :class="wrapperClasses">
    <label :for="textareaId" :class="labelClasses">
      {{ label }}
    </label>
    <textarea
      :id="textareaId"
      :value="modelValue"
      @input="
        $emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)
      "
      @focus="isFocused = true"
      @blur="isFocused = false"
      :placeholder="isFocused ? placeholder : ''"
      :rows="rows"
      :disabled="disabled"
      :class="textareaFinalClasses"
    ></textarea>
    <p
      v-if="supportingText || (error && errorMessage)"
      :class="supportingTextClasses"
    >
      {{ error && errorMessage ? errorMessage : supportingText }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, useAttrs } from "vue";
import { useId } from "#app";

interface Props {
  modelValue: string;
  label: string;
  placeholder?: string;
  supportingText?: string;
  errorMessage?: string;
  error?: boolean;
  disabled?: boolean;
  rows?: number;
  id?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "",
  supportingText: "",
  errorMessage: "",
  error: false,
  disabled: false,
  rows: 4,
  id: undefined,
});

const emit = defineEmits(["update:modelValue"]);
const attrs = useAttrs();
const isFocused = ref(false);

const providedId = computed(() => props.id || (attrs.id as string | undefined));
const internalId = useId();
const textareaId = computed(() => providedId.value || internalId);

const wrapperClasses = computed(() => [
  "relative group",
  {
    "is-filled": !!props.modelValue,
    "is-focused": isFocused.value,
    "has-error": props.error,
    "is-disabled": props.disabled,
  },
]);

const labelClasses = computed(() => [
  "absolute left-3 top-1.5 text-xs transition-colors duration-200 ease-in-out pointer-events-none",
  // Priority: Disabled > Error > Focused > Filled > Default
  props.disabled
    ? "text-gray-400"
    : props.error
    ? "text-red-600"
    : isFocused.value
    ? "text-blue-600"
    : props.modelValue
    ? "text-gray-700" // Filled, unfocused
    : "text-gray-500 group-hover:text-gray-600", // Empty, unfocused (default)
]);

const textareaFinalClasses = computed(() => {
  const baseClasses = [
    "w-full p-3 pt-6 text-base rounded-2xl border outline-none resize-y",
    "placeholder-gray-400",
    "text-gray-900",
  ];

  let stateSpecificClasses = [];

  if (props.disabled) {
    stateSpecificClasses = [
      "bg-gray-100",
      "text-gray-500",
      "cursor-not-allowed",
      "border-gray-300",
      "!ring-0", // Ensure no active rings from error state if disabled
    ];
  } else if (props.error) {
    stateSpecificClasses = [
      "bg-white",
      "border-red-500",
      "ring-1",
      "ring-red-500",
    ];
  } else if (isFocused.value) {
    stateSpecificClasses = [
      "bg-white",
      "border-blue-500",
      "ring-1",
      "ring-blue-500",
    ];
  } else {
    stateSpecificClasses = [
      "bg-gray-50",
      "border-gray-300",
      "hover:border-gray-400",
      "hover:bg-gray-100", // Subtle bg change on hover for unfocused
    ];
  }
  return [...baseClasses, ...stateSpecificClasses];
});

const supportingTextClasses = computed(() => [
  "mt-1.5 text-xs",
  // Priority: Disabled > Error > Default
  props.disabled
    ? "text-gray-400"
    : props.error
    ? "text-red-600"
    : "text-gray-500",
]);
</script>

<style scoped>
textarea {
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out,
    background-color 0.2s ease-in-out;
  box-sizing: border-box;
}
textarea::placeholder {
  color: #9ca3af; /* Tailwind gray-400 */
}
textarea::-webkit-resizer {
}
</style>
