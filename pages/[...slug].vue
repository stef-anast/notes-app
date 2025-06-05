<template>
  <div></div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: [
    function (to, from) {
      return navigateTo("/", { redirectCode: 301 });
    },
  ],
});
</script>
