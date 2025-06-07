<template>
  <div class="note-layout">
    <AppHeader />
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.note-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f8f8;
}

.main-content {
  flex-grow: 1;
  padding: 6rem 1.5rem 1.5rem;
}
</style>
