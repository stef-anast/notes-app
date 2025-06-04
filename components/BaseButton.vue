<template>
  <button :class="buttonClasses" @click="$emit('click', $event)">
    <template v-if="props.size === 'icon'">
      <component
        v-if="iconComponent"
        :is="iconComponent"
        :class="iconClasses"
      />
    </template>
    <template v-else>
      <component
        v-if="props.icon && props.iconPosition === 'left' && iconComponent"
        :is="iconComponent"
        :class="iconClasses"
      />
      <span v-if="text">{{ text }}</span>
      <component
        v-if="
          props.icon && props.iconPosition === 'right' && text && iconComponent
        "
        :is="iconComponent"
        :class="iconClasses"
      />
    </template>
  </button>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";

const IconPlus = defineAsyncComponent(() => import("./icons/IconPlus.vue"));
const IconClose = defineAsyncComponent(() => import("./icons/IconClose.vue"));

interface Props {
  text?: string;
  variant?: "solid" | "outline" | "ghost";
  color?: "primary" | "secondary" | "danger";
  size?: "small" | "medium" | "large" | "icon";
  icon?: boolean;
  iconPosition?: "left" | "right";
  iconName?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "solid",
  color: "primary",
  size: "medium",
  icon: false,
  iconPosition: "left",
  iconName: "plus",
});

const emit = defineEmits(["click"]);

const iconComponent = computed(() => {
  if (props.iconName === "close") {
    return IconClose;
  }
  if (props.iconName === "plus") {
    return IconPlus;
  }

  return null;
});

const baseClasses =
  "rounded-full font-medium inline-flex items-center justify-center gap-x-2 transition-colors duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer";

const buttonClasses = computed(() => {
  const classes = [baseClasses];

  // Size classes
  if (props.size === "icon") {
    classes.push("w-10 h-10 p-0");
  } else {
    switch (props.size) {
      case "small":
        classes.push("px-4 py-1.5 text-sm");
        break;
      case "large":
        classes.push("px-6 py-3 text-base");
        break;
      case "medium":
      default:
        classes.push("px-5 py-2 text-base");
        break;
    }
  }

  // Variant and Color classes
  if (props.variant === "solid") {
    if (props.color === "primary")
      classes.push(
        "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600"
      );
    else if (props.color === "secondary")
      classes.push(
        "bg-gray-500 text-white hover:bg-gray-600 focus-visible:ring-gray-500"
      );
    else if (props.color === "danger")
      classes.push(
        "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500"
      );
  } else if (props.variant === "outline") {
    if (props.color === "primary")
      classes.push(
        "bg-transparent text-blue-600 border border-blue-600 hover:bg-blue-50 focus-visible:ring-blue-600"
      );
    else if (props.color === "secondary")
      classes.push(
        "bg-transparent text-gray-700 border border-gray-400 hover:bg-gray-50 focus-visible:ring-gray-400"
      );
    else if (props.color === "danger")
      classes.push(
        "bg-transparent text-red-600 border border-red-600 hover:bg-red-50 focus-visible:ring-red-500"
      );
  } else if (props.variant === "ghost") {
    // Ghost buttons are transparent until hovered/focused, no border initially
    classes.push(
      "bg-transparent border-transparent focus-visible:ring-offset-0"
    );
    if (props.color === "primary")
      classes.push(
        "text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 focus-visible:ring-blue-600"
      );
    else if (props.color === "secondary")
      classes.push(
        "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 focus-visible:ring-gray-500"
      );
    else if (props.color === "danger")
      classes.push(
        "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 focus-visible:ring-red-500"
      );
    if (props.size === "icon") classes.push("focus-visible:ring-offset-0");
  }

  return classes.join(" ");
});

const iconClasses = computed(() => {
  let sizeClass = "w-5 h-5"; // Default for text buttons
  if (props.size === "icon") {
    sizeClass = "w-6 h-6"; // Larger icon for dedicated icon buttons
  }
  return [sizeClass].join(" ");
});
</script>

<style scoped>
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
