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
  color?: "primary" | "secondary" | "danger" | "success";
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
  "font-inter rounded-full font-medium inline-flex items-center justify-center gap-x-2 transition-colors duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer";

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
  let colorSpecificClasses = "";
  if (props.variant === "solid") {
    switch (props.color) {
      case "primary":
        colorSpecificClasses =
          "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600";
        break;
      case "secondary":
        colorSpecificClasses =
          "bg-gray-500 text-white hover:bg-gray-600 focus-visible:ring-gray-500";
        break;
      case "danger":
        colorSpecificClasses =
          "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500";
        break;
      case "success":
        colorSpecificClasses =
          "bg-green-500 text-white hover:bg-green-600 focus-visible:ring-green-500";
        break;
    }
  } else if (props.variant === "outline") {
    switch (props.color) {
      case "primary":
        colorSpecificClasses =
          "bg-transparent text-blue-600 border border-blue-600 hover:bg-blue-50 focus-visible:ring-blue-600";
        break;
      case "secondary":
        colorSpecificClasses =
          "bg-transparent text-gray-700 border border-gray-400 hover:bg-gray-50 focus-visible:ring-gray-400";
        break;
      case "danger":
        colorSpecificClasses =
          "bg-transparent text-red-600 border border-red-600 hover:bg-red-50 focus-visible:ring-red-500";
        break;
      case "success":
        colorSpecificClasses =
          "bg-transparent text-green-600 border border-green-600 hover:bg-green-50 focus-visible:ring-green-600";
        break;
    }
  } else if (props.variant === "ghost") {
    classes.push(
      "bg-transparent border-transparent focus-visible:ring-offset-0"
    ); // Common for all ghost
    switch (props.color) {
      case "primary":
        colorSpecificClasses =
          "text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 focus-visible:ring-blue-600";
        break;
      case "secondary":
        colorSpecificClasses =
          "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 focus-visible:ring-gray-500";
        break;
      case "danger":
        colorSpecificClasses =
          "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 focus-visible:ring-red-500";
        break;
      case "success":
        colorSpecificClasses =
          "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 focus-visible:ring-green-600";
        break;
    }
  }

  if (colorSpecificClasses) {
    classes.push(colorSpecificClasses);
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
