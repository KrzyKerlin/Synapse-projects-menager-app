import { defineStore } from "pinia";
import { apiFetch, getToken, setToken } from "../api/client";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: getToken(),
    loading: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    async register(username, password) {
      this.loading = true;
      try {
        const data = await apiFetch("/auth/register", {
          method: "POST",
          body: { username, password },
        });
        this.token = data.token;
        this.user = data.user;
        setToken(data.token);
      } finally {
        this.loading = false;
      }
    },

    async login(username, password) {
      this.loading = true;
      try {
        const data = await apiFetch("/auth/login", {
          method: "POST",
          body: { username, password },
        });
        this.token = data.token;
        this.user = data.user;
        setToken(data.token);
      } finally {
        this.loading = false;
      }
    },

    async fetchMe() {
      if (!this.token) return;
      try {
        const data = await apiFetch("/auth/me");
        this.user = data.user;
      } catch (err) {
        // Token is invalid or expired — treat as logged out.
        this.logout();
      }
    },

    logout() {
      this.token = null;
      this.user = null;
      setToken(null);
    },
  },
});
