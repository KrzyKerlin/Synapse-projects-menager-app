<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import ClockWidget from "./ClockWidget.vue";
import UserBadge from "./UserBadge.vue";

const emit = defineEmits([
  "new-project",
  "new-task",
  "new-folder",
  "all-tasks",
  "toggle-calendar",
  "toggle-chat",
]);

const auth = useAuthStore();
const router = useRouter();

const showLogoutConfirm = ref(false);

function confirmLogout() {
  showLogoutConfirm.value = false;
  auth.logout();
  router.push({ name: "login" });
}
</script>

<template>
  <div class="taskbar">
    <button class="taskbar-btn" title="Nowy projekt" @click="emit('new-project')">
      <span class="icon">＋</span><span class="label">Nowy projekt</span>
    </button>
    <button class="taskbar-btn" title="Nowe zadanie" @click="emit('new-task')">
      <span class="icon">✓</span><span class="label">Zadanie</span>
    </button>
    <button class="taskbar-btn" title="Nowy katalog" @click="emit('new-folder')">
      <span class="icon">📁</span><span class="label">Katalog</span>
    </button>
    <div class="taskbar-sep"></div>
    <button class="taskbar-btn" title="Wszystkie zadania" @click="emit('all-tasks')">
      <span class="icon">☰</span><span class="label">Zadania</span>
    </button>
    <button class="taskbar-btn" title="Kalendarz" @click="emit('toggle-calendar')">
      <span class="icon">📅</span><span class="label">Kalendarz</span>
    </button>

    <div class="taskbar-right">
      <button class="taskbar-btn" title="AI Asystent" @click="emit('toggle-chat')">
        <span class="icon">🤖</span><span class="label">AI</span>
      </button>
      <div class="taskbar-sep"></div>
      <UserBadge />
      <button class="taskbar-btn" title="Wyloguj" @click="showLogoutConfirm = true">
        <span class="icon">🚪</span>
      </button>
      <div class="taskbar-sep"></div>
      <ClockWidget />
    </div>
  </div>

  <div v-if="showLogoutConfirm" class="modal-overlay logout-overlay" @click.self="showLogoutConfirm = false">
    <div class="modal logout-confirm">
      <div class="modal-body">
        <h3 class="logout-confirm-title">Wylogować się?</h3>
        <p class="logout-confirm-text">Twoje dane zostaną zapamiętane na koncie.</p>
        <div class="logout-confirm-actions">
          <button class="btn btn-ghost" @click="showLogoutConfirm = false">Anuluj</button>
          <button class="btn btn-danger" @click="confirmLogout">Wyloguj</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.taskbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--taskbar-h);
  background: rgba(13, 17, 23, 0.92);
  backdrop-filter: blur(20px);
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 12px;
  gap: 6px;
  z-index: 900;
  overflow-x: auto;
  overflow-y: hidden;
}
.taskbar-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-muted);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}
.taskbar-btn:hover {
  background: var(--bg-card2);
  border-color: var(--border);
  color: var(--text);
}
.taskbar-sep {
  width: 1px;
  height: 28px;
  background: var(--border);
  margin: 0 4px;
  flex-shrink: 0;
}
.taskbar-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
@media (max-width: 768px) {
  .label {
    display: none;
  }
}
.logout-overlay {
  z-index: 999;
}
@media (max-width: 768px) {
  .logout-overlay {
    align-items: center;
    padding: 16px;
  }
}
.logout-confirm {
  width: min(90vw, 340px);
}
.logout-confirm-title {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 6px;
}
.logout-confirm-text {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 18px;
}
.logout-confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
