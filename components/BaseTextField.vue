<template>
  <div :class="wrapperClasses">
    <div class="relative flex items-center">
      <div
        v-if="leadingIconName"
        class="absolute left-3 inset-y-0 flex items-center pointer-events-none"
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
        :placeholder="placeholder"
        :disabled="disabled"
        :class="inputFinalClasses"
        v-bind="$attrs"
      />
      <div
        v-if="effectiveTrailingIconName"
        class="absolute right-3 inset-y-0 flex items-center"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent, useAttrs } from "vue";
import { useId } from "#app";

// Define async components for each icon
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
    "is-focused": isFocused.value,
    "has-error": props.error && !props.disabled,
    "is-disabled": props.disabled,
  },
]);

const inputFinalClasses = computed(() => {
  const base = [
    "w-full h-14 px-3 py-3 text-base rounded-2xl border outline-none bg-transparent",
    "text-gray-900 placeholder-gray-500 disabled:text-gray-500",
    props.leadingIconName ? "!pl-10" : "",
    effectiveTrailingIconName.value ? "!pr-10" : "",
  ];

  if (props.disabled) {
    return [...base, "bg-gray-100 border-gray-300 cursor-not-allowed !ring-0"];
  }
  if (props.error) {
    return [
      ...base,
      "border-red-500 ring-1 ring-red-500 bg-white focus:border-red-500",
    ];
  }
  if (isFocused.value) {
    return [...base, "border-blue-500 ring-1 ring-blue-500 bg-white"];
  }
  // Default and Filled (unfocused, not error, not disabled)
  return [
    ...base,
    "bg-gray-50 border-gray-300 hover:border-gray-400 hover:bg-gray-100",
  ];
});

const iconClasses = (type: "leading" | "trailing") => {
  let baseClasses = ["w-5 h-5"];
  if (props.disabled) {
    baseClasses.push("text-gray-400");
  } else if (
    props.error &&
    type === "trailing" &&
    effectiveTrailingIconName.value === "error"
  ) {
    baseClasses.push("text-red-500");
  } else if (
    isFocused.value &&
    type === "trailing" &&
    !(props.type === "password" && props.autoTogglePasswordVisibility)
  ) {
    baseClasses.push("text-blue-500");
  } else {
    baseClasses.push("text-gray-500");
  }
  if (
    props.type === "password" &&
    props.autoTogglePasswordVisibility &&
    type === "trailing" &&
    !props.error &&
    !props.disabled
  ) {
    return ["w-5 h-5", isFocused.value ? "text-blue-500" : "text-gray-500"];
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
    ? "text-gray-400"
    : props.error
    ? "text-red-600"
    : "text-gray-500",
]);
</script>

<style scoped>
input {
  box-sizing: border-box;
}

.group.is-focused .has-leading-icon label {
  left: 2.5rem; /* 40px */
}

input::placeholder {
  color: #9ca3af; /* Tailwind gray-500 */
}
</style>
