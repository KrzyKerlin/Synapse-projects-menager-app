import { defineStore } from "pinia";
import { apiFetch } from "../api/client";

export const useFoldersStore = defineStore("folders", {
  state: () => ({
    items: [],
    loaded: false,
  }),

  actions: {
    async fetchAll() {
      this.items = await apiFetch("/folders");
      this.loaded = true;
    },

    async create(payload) {
      const folder = await apiFetch("/folders", { method: "POST", body: payload });
      this.items.push(folder);
      return folder;
    },

    async update(id, payload) {
      const updated = await apiFetch(`/folders/${id}`, { method: "PUT", body: payload });
      const idx = this.items.findIndex((f) => f.id === id);
      if (idx !== -1) this.items[idx] = updated;
      return updated;
    },

    async remove(id) {
      await apiFetch(`/folders/${id}`, { method: "DELETE" });
      this.items = this.items.filter((f) => f.id !== id);
    },
  },
});
