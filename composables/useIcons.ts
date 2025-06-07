import { defineAsyncComponent } from "vue";

const iconComponents = {
  eye: defineAsyncComponent(() => import("~/components/icons/IconEye.vue")),
  "eye-off": defineAsyncComponent(
    () => import("~/components/icons/IconEyeOff.vue")
  ),
  "eye-disabled": defineAsyncComponent(
    () => import("~/components/icons/IconEyeDisabled.vue")
  ),
  "chevron-down": defineAsyncComponent(
    () => import("~/components/icons/IconChevronDown.vue")
  ),
  "chevron-up": defineAsyncComponent(
    () => import("~/components/icons/IconChevronUp.vue")
  ),
  back: defineAsyncComponent(() => import("~/components/icons/IconBack.vue")),
  check: defineAsyncComponent(() => import("~/components/icons/IconCheck.vue")),
  close: defineAsyncComponent(() => import("~/components/icons/IconClose.vue")),
  plus: defineAsyncComponent(() => import("~/components/icons/IconPlus.vue")),
  minus: defineAsyncComponent(() => import("~/components/icons/IconMinus.vue")),
  edit: defineAsyncComponent(() => import("~/components/icons/IconEdit.vue")),
  trash: defineAsyncComponent(() => import("~/components/icons/IconTrash.vue")),
  save: defineAsyncComponent(() => import("~/components/icons/IconSave.vue")),
  clock: defineAsyncComponent(() => import("~/components/icons/IconClock.vue")),
  error: defineAsyncComponent(() => import("~/components/icons/IconError.vue")),
  note: defineAsyncComponent(() => import("~/components/icons/IconNote.vue")),
  "filter-bars": defineAsyncComponent(
    () => import("~/components/icons/IconFilterBars.vue")
  ),
  "cloud-arrow-up": defineAsyncComponent(
    () => import("~/components/icons/IconCloudArrowUp.vue")
  ),
} as const;

export type IconName = keyof typeof iconComponents;

export function useIcons() {
  const getIconComponent = (name?: IconName) => {
    if (name && name in iconComponents) {
      return iconComponents[name];
    }
    return null;
  };

  const getAvailableIcons = (): IconName[] => {
    return Object.keys(iconComponents) as IconName[];
  };

  return {
    getIconComponent,
    getAvailableIcons,
    iconComponents,
  };
}
