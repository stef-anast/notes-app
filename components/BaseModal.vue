<template>
  <teleport to="body">
    <transition
      name="modal-fade"
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="props.modelValue"
        class="font-inter fixed inset-0 z-50 flex items-center justify-center bg-gray-500/50 backdrop-blur-xs p-4"
        @mousedown.self="closeModal"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="props.title ? componentId + '-title' : undefined"
      >
        <transition
          name="modal-slide"
          enter-active-class="transition ease-out duration-200 transform"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition ease-in duration-150 transform"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="props.modelValue"
            class="relative bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
          >
            <!-- Header -->
            <div
              class="flex items-center justify-between p-5 flex-shrink-0"
              :class="{
                'border-b border-gray-200':
                  !props.hideHeaderBorder,
              }"
            >
              <h3
                v-if="props.title"
                :id="componentId + '-title'"
                class="text-xl font-bold text-gray-900"
              >
                {{ props.title }}
              </h3>
              <span v-else>&nbsp;</span>
              <BaseButton
                v-if="!props.persistent"
                size="icon"
                iconName="close"
                @click="closeModal"
                aria-label="Close modal"
                variant="ghost"
                color="secondary"
                class="-mr-2 -mt-2"
              />
            </div>

            <!-- Body -->
            <div class="pt-1 px-5 overflow-y-auto flex-grow space-y-4">
              <slot name="body">
                <p class="text-gray-600">
                  Modal body content goes here.
                </p>
              </slot>
            </div>

            <!-- Footer -->
            <div
              v-if="hasFooterSlot"
              class="flex items-center justify-end p-5 flex-shrink-0 space-x-3"
              :class="{
                'border-t border-gray-200':
                  !props.hideFooterBorder,
              }"
            >
              <slot name="footer"></slot>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import {
  computed,
  watch,
  useSlots,
  useId,
} from "vue";

interface Props {
  modelValue: boolean;
  title?: string;
  persistent?: boolean;
  hideHeaderBorder?: boolean;
  hideFooterBorder?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: "",
  persistent: false,
  hideHeaderBorder: false,
  hideFooterBorder: false,
});

const emit = defineEmits(["update:modelValue"]);

const slots = useSlots();
const componentId = useId();

const hasFooterSlot = computed(() => !!slots.footer);

const closeModal = () => {
  if (props.persistent) return;
  emit("update:modelValue", false);
};

const handleEscapeKey = (event: KeyboardEvent) => {
  if (event.key === "Escape" && props.modelValue) {
    closeModal();
  }
};

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      document.addEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "hidden";
    } else {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "";
    }
  },
  { immediate: false }
);

import { onUnmounted } from "vue";
onUnmounted(() => {
  document.removeEventListener("keydown", handleEscapeKey);
  document.body.style.overflow = "";
});
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition-property: opacity;
}

.modal-slide-enter-active,
.modal-slide-leave-active {
  transition-property: opacity, transform;
}
</style>
