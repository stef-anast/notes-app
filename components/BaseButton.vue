<template>
  <button :class="buttonClasses" @click="$emit('click', $event)">
    <component
      v-if="icon && (iconPosition === 'left' || !text)"
      :is="IconPlus"
      :class="iconClasses"
    />
    <span v-if="text">{{ text }}</span>
    <component
      v-if="icon && iconPosition === 'right' && text"
      :is="IconPlus"
      :class="iconClasses"
    />
  </button>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";

// Define async component for the plus icon
const IconPlus = defineAsyncComponent(() => import("./icons/IconPlus.vue"));

interface Props {
  text?: string;
  variant?: "solid" | "outline";
  color?: "primary" | "secondary";
  size?: "small" | "medium" | "large" | "icon";
  icon?: boolean;
  iconPosition?: "left" | "right";
}

const props = withDefaults(defineProps<Props>(), {
  variant: "solid",
  color: "primary",
  size: "medium",
  icon: false,
  iconPosition: "left",
});

const emit = defineEmits(["click"]);

const baseClasses =
  "rounded-full font-medium inline-flex items-center justify-center gap-x-2 transition-colors duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

const buttonClasses = computed(() => {
  const classes = [baseClasses];

  // Size classes
  switch (props.size) {
    case "small":
      classes.push("px-4 py-1.5 text-sm");
      break;
    case "large":
      classes.push("px-6 py-3 text-base");
      break;
    case "icon":
      classes.push("w-10 h-10"); // Specific for icon-only buttons
      break;
    case "medium":
    default:
      classes.push("px-5 py-2 text-base");
      break;
  }

  // Variant and Color classes
  if (props.variant === "solid") {
    if (props.color === "primary") {
      classes.push(
        "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600"
      );
    } else {
      // secondary
      classes.push(
        "bg-gray-500 text-white hover:bg-gray-600 focus-visible:ring-gray-500"
      );
    }
  } else {
    // outline
    if (props.color === "primary") {
      classes.push(
        "bg-white text-gray-800 border border-gray-700 hover:bg-gray-100 focus-visible:ring-gray-700"
      );
    } else {
      // secondary
      classes.push(
        "bg-white text-gray-500 border border-gray-400 hover:bg-gray-50 focus-visible:ring-gray-400"
      );
    }
  }

  if (props.size === "icon" && props.text) {
    console.warn(
      '[BaseButton]: Text prop should not be used with size="icon". Icon-only buttons do not display text.'
    );
  }

  return classes.join(" ");
});

const iconClasses = computed(() => {
  const classes = ["w-5 h-5"]; // Default icon size
  return classes.join(" ");
});
</script>

<style scoped>
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
