<template>
  <button
    :class="buttonClasses"
    @click="$emit('click', $event)"
    :disabled="props.disabled"
  >
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
import type { Component } from "vue";

const iconMap: { [key: string]: Component } = {
  plus: defineAsyncComponent(() => import("./icons/IconPlus.vue")),
  close: defineAsyncComponent(() => import("./icons/IconClose.vue")),
  back: defineAsyncComponent(() => import("./icons/IconBack.vue")),
  note: defineAsyncComponent(() => import("./icons/IconNote.vue")),
  minus: defineAsyncComponent(() => import("./icons/IconMinus.vue")),
  edit: defineAsyncComponent(() => import("./icons/IconEdit.vue")),
  trash: defineAsyncComponent(() => import("./icons/IconTrash.vue")),
  save: defineAsyncComponent(() => import("./icons/IconSave.vue")),
};

interface Props {
  text?: string;
  variant?: "solid" | "outline" | "ghost" | "light";
  color?: "primary" | "secondary" | "danger" | "success" | "dark";
  size?: "small" | "medium" | "large" | "icon";
  icon?: boolean;
  iconPosition?: "left" | "right";
  iconName?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "solid",
  color: "primary",
  size: "medium",
  icon: false,
  iconPosition: "left",
  iconName: "plus",
  disabled: false,
});

const emit = defineEmits(["click"]);

const iconComponent = computed(() => {
  return iconMap[props.iconName] ?? null;
});

const sizeClasses: Record<"small" | "medium" | "large", string> = {
  small: "px-4 py-1.5 text-sm",
  medium: "px-5 py-2 text-base",
  large: "px-6 py-3 text-base",
};

const colorClasses: Record<
  "solid" | "outline" | "ghost" | "light",
  Record<"primary" | "secondary" | "danger" | "success" | "dark", string>
> = {
  solid: {
    primary:
      "bg-blue-500 text-white hover:bg-blue-600 focus-visible:ring-blue-600",
    secondary:
      "bg-gray-500 text-white hover:bg-gray-600 focus-visible:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
    success:
      "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500",
    dark: "bg-gray-800 text-white hover:bg-gray-900 focus-visible:ring-gray-800",
  },
  outline: {
    primary:
      "bg-transparent text-blue-600 border border-blue-600 hover:bg-blue-50 focus-visible:ring-blue-600",
    secondary:
      "bg-transparent text-gray-700 border border-gray-400 hover:bg-gray-50 focus-visible:ring-gray-400",
    danger:
      "bg-transparent text-red-600 border border-red-600 hover:bg-red-50 focus-visible:ring-red-500",
    success:
      "bg-transparent text-green-600 border border-green-600 hover:bg-green-50 focus-visible:ring-green-600",
    dark: "bg-transparent text-gray-800 border border-gray-800 hover:bg-gray-100 focus-visible:ring-gray-800",
  },
  light: {
    primary:
      "bg-blue-100 text-blue-600 hover:bg-blue-200 focus-visible:ring-blue-600",
    secondary:
      "bg-gray-100 text-gray-700 hover:bg-gray-200 focus-visible:ring-gray-500",
    danger:
      "bg-red-100 text-red-600 hover:bg-red-200 focus-visible:ring-red-500",
    success:
      "bg-green-100 text-green-600 hover:bg-green-200 focus-visible:ring-green-600",
    dark: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus-visible:ring-gray-800",
  },
  ghost: {
    primary:
      "text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 focus-visible:ring-blue-600",
    secondary:
      "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 focus-visible:ring-gray-500",
    danger:
      "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 focus-visible:ring-red-500",
    success:
      "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 focus-visible:ring-green-600",
    dark: "text-gray-800 hover:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700/50 focus-visible:ring-gray-800",
  },
};

const baseClasses =
  "font-inter rounded-full font-medium inline-flex items-center justify-center gap-x-1 transition-colors duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer";

const buttonClasses = computed(() => {
  const classes = [baseClasses];

  if (props.size === "icon") {
    classes.push("w-10 h-10 p-0");
  } else {
    classes.push(sizeClasses[props.size]);
  }

  if (props.disabled) {
    classes.push("bg-gray-400 text-white");
  } else {
    if (props.variant === "ghost") {
      classes.push(
        "bg-transparent border-transparent focus-visible:ring-offset-0"
      );
    }
    const colorSpecificClasses = colorClasses[props.variant]?.[props.color];
    if (colorSpecificClasses) {
      classes.push(colorSpecificClasses);
    }
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
  cursor: not-allowed;
}
</style>
