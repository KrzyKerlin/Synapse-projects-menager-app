<script setup>
import { useToastStore } from "../../stores/toast";

const toastStore = useToastStore();

const icons = {
  success: "✓",
  error: "!",
  info: "i",
};
</script>

<template>
  <div id="toast-container">
    <div v-for="t in toastStore.toasts" :key="t.id" class="toast" :class="t.type">
      <span class="toast-icon" :class="t.type">{{ icons[t.type] }}</span>
      <span>{{ t.message }}</span>
    </div>
  </div>
</template>

<style scoped>
.toast-icon {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 700;
  flex-shrink: 0;
}
.toast-icon.success {
  background: var(--feat-bg);
  color: var(--feat);
}
.toast-icon.error {
  background: var(--fix-bg);
  color: var(--fix);
}
.toast-icon.info {
  background: rgba(59, 130, 246, 0.15);
  color: var(--accent2);
}
</style>
