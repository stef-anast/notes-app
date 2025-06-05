<template>
  <header
    class="page-header fixed top-0 left-0 w-full z-50"
    :class="{ scrolled: isScrolled }"
  >
    <NuxtLink to="/" class="no-underline">
      <div class="project-tag font-lexend">Test project</div>
    </NuxtLink>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const isScrolled = ref(false);

const handleScroll = () => {
  isScrolled.value = window.scrollY > 0;
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<style scoped>
.page-header {
  padding: 1rem 1.5rem;
  background-color: #f8f8f8;
  transition: box-shadow 0.3s ease-in-out;
}

.page-header.scrolled {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}

.no-underline {
  text-decoration: none;
}

.project-tag {
  display: inline-block;
  color: #0a0c11;
  padding: 0.25rem 0.75rem;
  border-radius: 0.75rem;
  letter-spacing: 1px;
  border: 2.5px solid #0a0c11;
  font-size: 22px;
  font-weight: 900;
}
</style>
