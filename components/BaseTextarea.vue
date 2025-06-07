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
      :placeholder="isFocused && !modelValue ? placeholder : ''"
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
import { ref, computed, useAttrs, useId } from "vue";

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

const hasValue = computed(() => props.modelValue !== "");

const wrapperClasses = computed(() => [
  "relative group",
  {
    "is-filled": hasValue.value,
    "is-focused": isFocused.value,
    "has-error": props.error && !props.disabled,
    "is-disabled": props.disabled,
  },
]);

const labelClasses = computed(() => {
  const baseStyles = [
    "absolute z-10 font-semibold left-3 pointer-events-none",
    "transform-origin-top-left transition-all duration-200 ease-in-out",
  ];

  // Determine if the label should be in its "active" (small, top) state for positioning
  const isPositionActive = isFocused.value || hasValue.value || props.disabled;

  let finalClasses = [...baseStyles];
  let colorClass = "";

  // Determine color first based on priority
  if (props.disabled) {
    colorClass = "text-gray-400";
  } else if (props.error) {
    colorClass = "text-red-600";
  } else if (isFocused.value) {
    colorClass = "text-blue-600";
  } else if (hasValue.value) {
    colorClass = "text-gray-900";
  } else {
    // Default color for placeholder-like label when not disabled, error, focused, or filled
    colorClass = "text-gray-900";
  }
  finalClasses.push(colorClass);

  // Determine position and size
  if (isPositionActive) {
    // Active state: small, top-left
    finalClasses.push("text-xs scale-75 top-1.5 -translate-x-2");
  } else {
    // Default, non-active state (placeholder-like)
    finalClasses.push("top-3.5 text-base");
  }

  return finalClasses;
});

const textareaFinalClasses = computed(() => {
  const baseClasses = [
    "w-full p-3 pt-6 text-base rounded-2xl border outline-none resize-y",
    "text-gray-900",
    props.disabled ? "placeholder-gray-400" : "placeholder-gray-500",
  ];

  let stateSpecificClasses = [];

  if (props.disabled) {
    stateSpecificClasses = [
      "bg-gray-100",
      "text-gray-500",
      "cursor-not-allowed",
      "border-gray-300",
      "!ring-0",
    ];
  } else if (props.error) {
    stateSpecificClasses = [
      "bg-white",
      "border-red-500",
      "ring-1 ring-red-500",
      "focus:border-red-500",
    ];
  } else if (isFocused.value) {
    stateSpecificClasses = [
      "bg-white",
      "border-blue-500",
      "ring-1 ring-blue-500",
    ];
  } else {
    // Default and Filled (unfocused, not error, not disabled)
    stateSpecificClasses = [
      "bg-gray-200",
      "border-gray-50",
      "hover:border-gray-100",
      "hover:bg-gray-100",
    ];
  }
  return [...baseClasses, ...stateSpecificClasses];
});

const supportingTextClasses = computed(() => [
  "mt-1.5 ml-3 text-xs",
  props.disabled
    ? "text-gray-400"
    : props.error
    ? "text-red-600"
    : "text-gray-500",
]);
</script>

<style scoped>
textarea {
  transition: border-color 0.2s ease-in-out, background-color 0.2s ease-in-out;
  box-sizing: border-box;
}

textarea::placeholder {
  color: currentColor;
  opacity: 0.6;
}
</style>
