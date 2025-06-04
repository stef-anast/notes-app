<template>
  <div :class="wrapperClasses">
    <label v-if="props.label" :for="inputId" :class="labelClasses">
      {{ props.label }}
    </label>
    <div class="relative flex items-center">
      <div
        v-if="leadingIconName"
        :class="[
          'absolute inset-y-0 flex items-center pointer-events-none',
          leadingIconName ? 'left-3' : '',
        ]"
      >
        <component
          :is="getIconComponent(leadingIconName)"
          :class="iconClasses('leading')"
          aria-hidden="true"
        />
      </div>
      <input
        :id="inputId"
        :type="inputType"
        :value="modelValue"
        @input="
          $emit('update:modelValue', ($event.target as HTMLInputElement).value)
        "
        @focus="onFocus"
        @blur="onBlur"
        :placeholder="inputPlaceholder"
        :disabled="disabled"
        :class="inputFinalClasses"
        :aria-labelledby="props.label ? inputId + '-label-sr' : undefined"
        v-bind="$attrs"
      />
      <div
        v-if="effectiveTrailingIconName"
        :class="[
          'absolute inset-y-0 flex items-center',
          effectiveTrailingIconName ? 'right-3' : '',
        ]"
      >
        <button
          type="button"
          @click.stop="handleTrailingIconClick"
          :disabled="disabled"
          :class="[
            'focus:outline-none',
            {
              'cursor-pointer':
                (props.type === 'password' &&
                  props.autoTogglePasswordVisibility) ||
                !!props.onTrailingIconClick,
              'cursor-default':
                !(
                  props.type === 'password' &&
                  props.autoTogglePasswordVisibility
                ) && !props.onTrailingIconClick,
            },
          ]"
          :aria-label="
            props.trailingIconAriaLabel ||
            (props.type === 'password' && props.autoTogglePasswordVisibility
              ? isPasswordVisible
                ? 'Hide password'
                : 'Show password'
              : 'Field action icon')
          "
        >
          <component
            :is="
              getIconComponent(
                effectiveTrailingIconName,
                props.error,
                props.disabled
              )
            "
            :class="iconClasses('trailing')"
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
    <p v-if="supportingTextResolved" :class="supportingTextClasses">
      {{ supportingTextResolved }}
    </p>
    <span v-if="props.label" :id="inputId + '-label-sr'" class="sr-only">{{
      props.label
    }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent, useAttrs } from "vue";
import { useId } from "#app";

const IconEye = defineAsyncComponent(() => import("./icons/IconEye.vue"));
const IconEyeOff = defineAsyncComponent(() => import("./icons/IconEyeOff.vue"));
const IconEyeDisabled = defineAsyncComponent(
  () => import("./icons/IconEyeDisabled.vue")
);
const IconClock = defineAsyncComponent(() => import("./icons/IconClock.vue"));
const IconChevronDown = defineAsyncComponent(
  () => import("./icons/IconChevronDown.vue")
);
const IconError = defineAsyncComponent(() => import("./icons/IconError.vue"));

const iconComponents = {
  eye: IconEye,
  "eye-off": IconEyeOff,
  "eye-disabled": IconEyeDisabled,
  clock: IconClock,
  "chevron-down": IconChevronDown,
  error: IconError,
} as const;

export type IconName = keyof typeof iconComponents;

interface Props {
  modelValue: string | number;
  label?: string;
  type?: "text" | "password" | "email" | "number" | "tel" | "url";
  placeholder?: string;
  supportingText?: string;
  errorMessage?: string;
  error?: boolean;
  disabled?: boolean;
  leadingIconName?: IconName;
  trailingIconName?: IconName;
  trailingIconAriaLabel?: string;
  id?: string;
  onTrailingIconClick?: () => void;
  autoTogglePasswordVisibility?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  type: "text",
  placeholder: "",
  supportingText: "",
  errorMessage: "",
  error: false,
  disabled: false,
  leadingIconName: undefined,
  trailingIconName: undefined,
  trailingIconAriaLabel: "Field action icon",
  id: undefined,
  onTrailingIconClick: undefined,
  autoTogglePasswordVisibility: true,
});

const emit = defineEmits(["update:modelValue", "focus", "blur"]);
const attrs = useAttrs();

const providedId = computed(() => props.id || (attrs.id as string | undefined));
const generatedInternalId = useId();
const inputId = computed(
  () => providedId.value || `textfield-${generatedInternalId}`
);

const isFocused = ref(false);
const isPasswordVisible = ref(false);

const hasValue = computed(() => {
  return (
    props.modelValue !== null &&
    props.modelValue !== undefined &&
    props.modelValue !== ""
  );
});

const inputType = computed(() => {
  if (props.type === "password" && isPasswordVisible.value) {
    return "text";
  }
  return props.type;
});

const effectiveTrailingIconName = computed<IconName | undefined>(() => {
  if (props.type === "password" && props.autoTogglePasswordVisibility) {
    if (props.disabled) return "eye-disabled";
    return isPasswordVisible.value ? "eye-off" : "eye";
  }
  if (props.error && !props.trailingIconName) {
    return "error";
  }
  return props.trailingIconName;
});

function getIconComponent(
  name?: IconName,
  isError?: boolean,
  isDisabled?: boolean
) {
  if (name === "eye" && isDisabled && !props.error)
    return iconComponents["eye-disabled"];
  if (name) return iconComponents[name];
  return null;
}

const onFocus = (event: FocusEvent) => {
  isFocused.value = true;
  emit("focus", event);
};

const onBlur = (event: FocusEvent) => {
  isFocused.value = false;
  emit("blur", event);
};

const handleTrailingIconClick = () => {
  if (props.disabled) return;
  if (props.type === "password" && props.autoTogglePasswordVisibility) {
    isPasswordVisible.value = !isPasswordVisible.value;
  }
  if (props.onTrailingIconClick) {
    props.onTrailingIconClick();
  }
};

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
  if (!props.label) return ["sr-only"];

  const baseStyles = [
    "absolute z-10 pointer-events-none",
    "transform-origin-top-left transition-all duration-200 ease-in-out",
    props.leadingIconName ? "left-10" : "left-3",
  ];

  const isPositionActive = isFocused.value || hasValue.value || props.disabled;
  let finalClasses = [...baseStyles];
  let colorClass = "";

  if (props.disabled) {
    colorClass = "text-gray-400 dark:text-gray-500";
  } else if (props.error) {
    colorClass = "text-red-600 dark:text-red-500";
  } else if (isFocused.value) {
    colorClass = "text-blue-600 dark:text-blue-500";
  } else if (hasValue.value) {
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

const inputFinalClasses = computed(() => {
  const base = [
    "w-full h-14 px-3 py-3 text-base rounded-2xl border outline-none bg-transparent",
    "text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400",
    "disabled:text-gray-500 dark:disabled:text-gray-400",
    props.label ? "pt-6" : "py-3",
    props.leadingIconName ? "!pl-10" : "",
    effectiveTrailingIconName.value ? "!pr-10" : "",
  ];

  if (props.disabled) {
    return [
      ...base,
      "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 cursor-not-allowed !ring-0",
    ];
  }
  if (props.error) {
    return [
      ...base,
      "border-red-500 dark:border-red-500 ring-1 ring-red-500 bg-white dark:bg-gray-900",
      "focus:border-red-500 dark:focus:border-red-500",
    ];
  }
  if (isFocused.value) {
    return [
      ...base,
      "border-blue-500 dark:border-blue-500 ring-1 ring-blue-500 bg-white dark:bg-gray-900",
    ];
  }
  return [
    ...base,
    "bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600",
    "hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700",
  ];
});

const inputPlaceholder = computed(() => {
  if (isFocused.value && !hasValue.value) {
    return props.placeholder;
  }
  return "";
});

const iconClasses = (type: "leading" | "trailing") => {
  let baseClasses = ["w-5 h-5"];
  if (props.disabled) {
    baseClasses.push("text-gray-400 dark:text-gray-500");
  } else if (
    props.error &&
    type === "trailing" &&
    effectiveTrailingIconName.value === "error"
  ) {
    baseClasses.push("text-red-500 dark:text-red-500");
  } else if (
    isFocused.value &&
    type === "trailing" &&
    !(props.type === "password" && props.autoTogglePasswordVisibility)
  ) {
    baseClasses.push("text-blue-500 dark:text-blue-400");
  } else {
    baseClasses.push("text-gray-500 dark:text-gray-400");
  }
  if (
    props.type === "password" &&
    props.autoTogglePasswordVisibility &&
    type === "trailing" &&
    !props.error &&
    !props.disabled
  ) {
    return [
      "w-5 h-5",
      isFocused.value
        ? "text-blue-500 dark:text-blue-400"
        : "text-gray-500 dark:text-gray-400",
    ];
  }
  return baseClasses;
};

const supportingTextResolved = computed(() => {
  if (props.disabled) return props.supportingText;
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
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 30px white inset !important;
  box-shadow: 0 0 0 30px white inset !important;
}
input:-webkit-autofill::first-line {
  font-size: 1rem;
  color: #111827;
}

html.dark input:-webkit-autofill,
html.dark input:-webkit-autofill:hover,
html.dark input:-webkit-autofill:focus,
html.dark input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 30px #111827 inset !important;
  box-shadow: 0 0 0 30px #111827 inset !important;
  -webkit-text-fill-color: #ffffff !important;
}
html.dark input:-webkit-autofill::first-line {
  color: #ffffff !important;
}
</style>
