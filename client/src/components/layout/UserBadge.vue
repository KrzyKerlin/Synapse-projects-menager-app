<script setup>
import { computed } from "vue";
import { useAuthStore } from "../../stores/auth";

const auth = useAuthStore();

const initials = computed(() => (auth.user?.username || "?").slice(0, 2).toUpperCase());
</script>

<template>
  <div class="user-badge">
    <div class="user-avatar">{{ initials }}</div>
    <span class="uname">{{ auth.user?.username }}</span>
  </div>
</template>

<style scoped>
.user-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px 4px 4px;
  flex-shrink: 0;
}
.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--refactor));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}
.uname {
  font-size: 0.76rem;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
}
@media (max-width: 480px) {
  .uname {
    display: none;
  }
}
</style>
