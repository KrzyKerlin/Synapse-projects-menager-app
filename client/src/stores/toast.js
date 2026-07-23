import { defineStore } from "pinia";

let nextId = 1;

export const useToastStore = defineStore("toast", {
  state: () => ({
    toasts: [],
  }),

  actions: {
    show(message, type = "info") {
      const id = nextId++;
      this.toasts.push({ id, message, type });
      setTimeout(() => this.remove(id), 3000);
    },

    remove(id) {
      this.toasts = this.toasts.filter((t) => t.id !== id);
    },
  },
});
