<template>
  <BaseModal
    v-model="isModalOpen"
    :title="props.title"
    hide-header-border
    hide-footer-border
    persistent
  >
    <template #body>
      <p class="text-gray-600 dark:text-gray-300">
        {{ props.message }}
      </p>
    </template>
    <template #footer>
      <BaseButton
        text="Cancel"
        variant="ghost"
        color="secondary"
        @click="handleCancel"
      />
      <BaseButton
        :text="props.confirmButtonText"
        :color="props.confirmButtonColor"
        variant="light"
        @click="handleConfirm"
      />
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { PropType } from "vue";

type ButtonColor = "primary" | "secondary" | "danger" | "success" | "dark";

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  confirmButtonText: {
    type: String,
    default: "Confirm",
  },
  confirmButtonColor: {
    type: String as PropType<ButtonColor>,
    default: "primary",
  },
});

const emit = defineEmits(["confirm", "cancel"]);

const isModalOpen = ref(false);

const openModal = () => {
  isModalOpen.value = true;
};

const handleConfirm = () => {
  emit("confirm");
  isModalOpen.value = false;
};

const handleCancel = () => {
  emit("cancel");
  isModalOpen.value = false;
};

defineExpose({
  openModal,
});
</script>
