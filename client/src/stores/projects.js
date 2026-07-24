import { defineStore } from "pinia";
import { apiFetch } from "../api/client";

export const useProjectsStore = defineStore("projects", {
  state: () => ({
    items: [],
    loaded: false,
  }),

  actions: {
    async fetchAll() {
      this.items = await apiFetch("/projects");
      this.loaded = true;
    },

    async create(payload) {
      const project = await apiFetch("/projects", { method: "POST", body: payload });
      this.items.push(project);
      return project;
    },

    async update(id, payload) {
      const updated = await apiFetch(`/projects/${id}`, { method: "PUT", body: payload });
      const idx = this.items.findIndex((p) => p.id === id);
      if (idx !== -1) this.items[idx] = updated;
      return updated;
    },

    async remove(id) {
      await apiFetch(`/projects/${id}`, { method: "DELETE" });
      this.items = this.items.filter((p) => p.id !== id);
    },
  },
});
