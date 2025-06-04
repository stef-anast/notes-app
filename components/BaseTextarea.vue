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
    "absolute z-10 left-3 pointer-events-none",
    "transform-origin-top-left transition-all duration-200 ease-in-out",
  ];

  // Determine if the label should be in its "active" (small, top) state for positioning
  const isPositionActive = isFocused.value || hasValue.value || props.disabled;

  let finalClasses = [...baseStyles];
  let colorClass = "";

  // Determine color first based on priority
  if (props.disabled) {
    colorClass = "text-gray-400 dark:text-gray-500";
  } else if (props.error) {
    colorClass = "text-red-600 dark:text-red-500";
  } else if (isFocused.value) {
    colorClass = "text-blue-600 dark:text-blue-500";
  } else if (hasValue.value) {
    colorClass = "text-gray-700 dark:text-gray-300";
  } else {
    // Default color for placeholder-like label when not disabled, error, focused, or filled
    colorClass =
      "text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300";
  }
  finalClasses.push(colorClass);

  // Determine position and size
  if (isPositionActive) {
    // Active state: small, top-left
    finalClasses.push("text-xs scale-75 top-1.5");
  } else {
    // Default, non-active state (placeholder-like)
    finalClasses.push("top-3.5 text-base");
  }

  return finalClasses;
});

const textareaFinalClasses = computed(() => {
  const baseClasses = [
    "w-full p-3 pt-6 text-base rounded-2xl border outline-none resize-y",
    "text-gray-900 dark:text-white",
    props.disabled
      ? "placeholder-gray-400 dark:placeholder-gray-600"
      : "placeholder-gray-500 dark:placeholder-gray-400",
  ];

  let stateSpecificClasses = [];

  if (props.disabled) {
    stateSpecificClasses = [
      "bg-gray-100 dark:bg-gray-800",
      "text-gray-500 dark:text-gray-400",
      "cursor-not-allowed",
      "border-gray-300 dark:border-gray-600",
      "!ring-0",
    ];
  } else if (props.error) {
    stateSpecificClasses = [
      "bg-white dark:bg-gray-900",
      "border-red-500 dark:border-red-500",
      "ring-1 ring-red-500 dark:ring-red-500",
      "focus:border-red-500 dark:focus:border-red-500",
    ];
  } else if (isFocused.value) {
    stateSpecificClasses = [
      "bg-white dark:bg-gray-900",
      "border-blue-500 dark:border-blue-500",
      "ring-1 ring-blue-500 dark:ring-blue-500",
    ];
  } else {
    // Default and Filled (unfocused, not error, not disabled)
    stateSpecificClasses = [
      "bg-gray-50 dark:bg-gray-700/50",
      "border-gray-300 dark:border-gray-600",
      "hover:border-gray-400 dark:hover:border-gray-500",
      "hover:bg-gray-100 dark:hover:bg-gray-700",
    ];
  }
  return [...baseClasses, ...stateSpecificClasses];
});

const supportingTextClasses = computed(() => [
  "mt-1.5 ml-3 text-xs",
  props.disabled
    ? "text-gray-400 dark:text-gray-500"
    : props.error
    ? "text-red-600 dark:text-red-500"
    : "text-gray-500 dark:text-gray-400",
]);
</script>

<style scoped>
textarea {
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out,
    background-color 0.2s ease-in-out;
  box-sizing: border-box;
}

textarea::placeholder {
  color: currentColor; /* Make placeholder inherit text color for easier state control */
  opacity: 0.6;
}

/* Ensure dark mode placeholder is visible if needed */
.dark textarea::placeholder {
  /* color: #9ca3af; /* Tailwind gray-400 if specific color needed */
}

textarea::-webkit-resizer {
  /* Custom styling for resizer if needed */
}
</style>
