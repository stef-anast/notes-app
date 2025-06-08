import { ref, computed, onMounted, onUnmounted } from "vue";

export const useViewport = () => {
  const windowWidth = ref(0);

  const updateWindowWidth = () => {
    windowWidth.value = window.innerWidth;
  };

  onMounted(() => {
    updateWindowWidth();
    window.addEventListener("resize", updateWindowWidth);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", updateWindowWidth);
  });

  const isSmallScreenSize = computed(() => {
    return windowWidth.value < 480;
  });

  const isMediumScreenSize = computed(() => {
    return windowWidth.value < 768 && windowWidth.value >= 480;
  });

  return {
    windowWidth,
    isSmallScreenSize,
    isMediumScreenSize,
  };
};
