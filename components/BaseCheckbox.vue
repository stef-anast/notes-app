<template>
  <div
    :class="['flex items-start', { 'opacity-50 cursor-not-allowed': disabled }]"
    @click.stop
  >
    <input
      :id="checkboxId"
      type="checkbox"
      :checked="isChecked"
      :value="value"
      :disabled="disabled"
      :indeterminate="indeterminate"
      @change="handleChange"
      class="sr-only peer"
      ref="inputRef"
    />
    <label
      :for="checkboxId"
      :class="[
        'relative w-5 h-5 rounded border flex-shrink-0 peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white dark:peer-focus-visible:ring-offset-gray-800',
        checkboxVisualClasses,
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
      ]"
      @click.prevent="handleLabelClick"
    >
      <IconCheck
        v-if="isChecked && !indeterminate"
        class="w-[18px] h-[18px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-white"
      />
      <IconMinus
        v-if="indeterminate"
        class="w-[18px] h-[18px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-white"
      />
    </label>
    <div
      v-if="label || description"
      class="ml-2.5 select-none"
      @click.prevent="handleLabelClick"
    >
      <label
        v-if="label"
        :for="checkboxId"
        :class="[
          'block text-sm font-medium text-gray-800 dark:text-gray-200',
          disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        ]"
      >
        {{ label }}
      </label>
      <p
        v-if="description"
        :class="[
          'text-xs text-gray-500 dark:text-gray-400',
          disabled ? 'cursor-not-allowed' : '',
        ]"
      >
        {{ description }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  ref,
  watch,
  defineAsyncComponent,
  onMounted,
  useId,
} from "vue";

const IconCheck = defineAsyncComponent(() => import("./icons/IconCheck.vue"));
const IconMinus = defineAsyncComponent(() => import("./icons/IconMinus.vue"));

interface Props {
  modelValue?: boolean | string | number | any[]; // for array v-model with multiple checkboxes
  value?: any; // value for single checkbox when modelValue is an array
  indeterminate?: boolean;
  disabled?: boolean;
  label?: string;
  description?: string;
  id?: string;
  trueValue?: boolean | string | number;
  falseValue?: boolean | string | number;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  value: undefined,
  indeterminate: false,
  disabled: false,
  label: "",
  description: "",
  id: undefined,
  trueValue: true,
  falseValue: false,
});

const emit = defineEmits(["update:modelValue"]);

const inputRef = ref<HTMLInputElement | null>(null);

const internalId = useId();
const checkboxId = computed(() => props.id || `checkbox-${internalId}`);

const isChecked = computed(() => {
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.includes(props.value);
  }
  return props.modelValue === props.trueValue;
});

const checkboxVisualClasses = computed(() => {
  if (props.disabled) {
    return isChecked.value || props.indeterminate
      ? "bg-gray-300 border-gray-300 dark:bg-gray-600 dark:border-gray-600"
      : "bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600";
  }
  if (isChecked.value || props.indeterminate) {
    return "bg-blue-600 border-blue-600 hover:bg-blue-700 peer-focus-visible:ring-blue-500 dark:peer-focus-visible:ring-blue-500";
  }
  // Unchecked
  return "bg-white border-gray-400 hover:border-blue-600 peer-focus-visible:ring-blue-500 dark:bg-gray-700 dark:border-gray-500 dark:hover:border-blue-500";
});

watch(
  () => props.indeterminate,
  (newVal) => {
    if (inputRef.value) {
      inputRef.value.indeterminate = newVal;
    }
  }
);

onMounted(() => {
  if (inputRef.value && props.indeterminate) {
    inputRef.value.indeterminate = true;
  }
});

const handleChange = (event: Event) => {
  if (props.disabled) return;
  const target = event.target as HTMLInputElement;
  let newValue;
  if (Array.isArray(props.modelValue)) {
    const currentValues = [...props.modelValue];
    if (target.checked) {
      currentValues.push(props.value);
    } else {
      currentValues.splice(currentValues.indexOf(props.value), 1);
    }
    newValue = currentValues;
  } else {
    newValue = target.checked ? props.trueValue : props.falseValue;
  }
  emit("update:modelValue", newValue);
};

// Allows clicking on the label or visual checkbox to toggle state
const handleLabelClick = () => {
  if (!props.disabled && inputRef.value) {
    const currentlyChecked = isChecked.value;
    let newValue;

    if (Array.isArray(props.modelValue)) {
      const currentValues = [...props.modelValue];
      if (!currentlyChecked) {
        // if it's about to be checked
        if (!currentValues.includes(props.value)) {
          currentValues.push(props.value);
        }
      } else {
        // if it's about to be unchecked
        const index = currentValues.indexOf(props.value);
        if (index > -1) {
          currentValues.splice(index, 1);
        }
      }
      newValue = currentValues;
    } else {
      newValue = !currentlyChecked ? props.trueValue : props.falseValue;
    }
    emit("update:modelValue", newValue);
  }
};
</script>
