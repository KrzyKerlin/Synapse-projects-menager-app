import { defineStore } from "pinia";
import { apiFetch } from "../api/client";

export const useCommitsStore = defineStore("commits", {
  state: () => ({
    items: [],
    loaded: false,
  }),

  actions: {
    async fetchAll() {
      this.items = await apiFetch("/commits");
      this.loaded = true;
    },

    async create(payload) {
      const commit = await apiFetch("/commits", { method: "POST", body: payload });
      this.items.unshift(commit);
      return commit;
    },
  },
});
