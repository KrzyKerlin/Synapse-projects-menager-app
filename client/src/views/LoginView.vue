<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
const router = useRouter();

const username = ref("");
const password = ref("");
const error = ref("");
const showPassword = ref(false);

// Locks page scroll only while this screen is mounted — mobile browsers'
// elastic overscroll otherwise let the whole auth card be dragged around.
// Scoped to just this view (not global) since the same trick on html/body
// fought with the dashboard's own fixed-position modals on real devices.
onMounted(() => {
  document.body.style.overflow = "hidden";
  document.body.style.overscrollBehavior = "none";
});
onUnmounted(() => {
  document.body.style.overflow = "";
  document.body.style.overscrollBehavior = "";
});

async function handleSubmit() {
  error.value = "";
  if (!username.value || !password.value) {
    error.value = "Podaj nazwę użytkownika i hasło.";
    return;
  }
  try {
    await auth.login(username.value, password.value);
    router.push({ name: "dashboard" });
  } catch (err) {
    error.value = err.message;
  }
}
</script>

<template>
  <div class="auth-screen">
    <form class="auth-card" @submit.prevent="handleSubmit">
      <img class="auth-logo" src="/logo.png" alt="Synapse" />
      <h1 class="auth-title">Synapse app</h1>
      <p class="auth-subtitle">Zaloguj się do swojego konta</p>

      <p v-if="error" class="auth-error">{{ error }}</p>

      <div class="form-group">
        <label class="form-label">Nazwa użytkownika</label>
        <input class="form-input" v-model="username" autocomplete="off" />
      </div>
      <div class="form-group">
        <label class="form-label">Hasło</label>
        <div class="password-field">
          <input
            class="form-input"
            :type="showPassword ? 'text' : 'password'"
            v-model="password"
            autocomplete="off"
          />
          <button
            type="button"
            class="password-toggle"
            :title="showPassword ? 'Ukryj hasło' : 'Pokaż hasło'"
            @click="showPassword = !showPassword"
          >
            <svg v-if="showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.6 21.6 0 0 1 5.06-6.06M9.9 4.24A10.4 10.4 0 0 1 12 4c7 0 11 8 11 8a21.6 21.6 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" /><circle cx="12" cy="12" r="3" /></svg>
          </button>
        </div>
      </div>

      <button class="btn btn-primary auth-submit" type="submit" :disabled="auth.loading">
        Zaloguj się
      </button>

      <p class="auth-switch">
        Nie masz konta? <router-link to="/register">Zarejestruj się</router-link>
      </p>
    </form>
  </div>
</template>

<style scoped>
.auth-screen {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
.auth-card {
  width: 100%;
  max-width: 380px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  box-shadow: var(--shadow);
  padding: 28px 26px;
}
.auth-logo {
  display: block;
  width: 56px;
  height: 56px;
  object-fit: contain;
  margin: 0 auto 12px;
}
.auth-title {
  font-size: 1.15rem;
  font-weight: 800;
  text-align: center;
  color: #7d34cc;
}
.auth-subtitle {
  font-size: 0.78rem;
  color: var(--text-muted);
  text-align: center;
  margin: 6px 0 20px;
}
.auth-card .form-label {
  color: #7d34cc;
}
.auth-error {
  font-size: 0.72rem;
  color: var(--fix);
  background: var(--fix-bg);
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 8px 10px;
  border-radius: 8px;
  margin-bottom: 12px;
}
.auth-submit {
  width: 100%;
  justify-content: center;
  margin-top: 4px;
  background: #7d34cc;
  border-color: #7d34cc;
}
.auth-submit:hover {
  background: #9450e0;
  border-color: #9450e0;
}
.auth-switch {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-align: center;
  margin-top: 16px;
}
.auth-switch a {
  color: var(--accent2);
}
</style>
