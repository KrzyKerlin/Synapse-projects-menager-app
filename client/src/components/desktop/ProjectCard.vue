<script setup>
import { computed } from "vue";
import { useTasksStore } from "../../stores/tasks";

const props = defineProps({
  project: { type: Object, required: true },
});

const emit = defineEmits(["open", "contextmenu"]);

const tasksStore = useTasksStore();

const openTasks = computed(() =>
  tasksStore.items.filter((t) => t.projectId === props.project.id && !t.done),
);

const accentColor = computed(() => props.project.colors[0] || "#3b82f6");
</script>

<template>
  <div
    class="project-card"
    :style="{ '--accent-color': accentColor }"
    @dblclick="emit('open', project.id)"
    @contextmenu.prevent="emit('contextmenu', $event, project.id)"
  >
    <button class="open-btn" @click="emit('open', project.id)">→</button>
    <div class="logo">
      <img v-if="project.logo" :src="project.logo" alt="" />
      <span v-else>{{ project.emoji || "🚀" }}</span>
    </div>
    <div class="title">{{ project.name }}</div>
    <div v-if="project.domain" class="domain">{{ project.domain }}</div>
    <div v-if="project.colors.length" class="colors">
      <div
        v-for="c in project.colors.slice(0, 5)"
        :key="c"
        class="color-dot"
        :style="{ background: c }"
        :title="c"
      ></div>
    </div>
    <div v-if="openTasks.length" class="tasks-badge">{{ openTasks.length }} zadań</div>
  </div>
</template>

<style scoped>
.project-card {
  position: absolute;
  width: 200px;
  background: rgba(17, 24, 39, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px;
  cursor: grab;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}
.project-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--accent-color, var(--accent));
  border-radius: var(--radius) var(--radius) 0 0;
}
.project-card:hover {
  border-color: var(--accent);
  box-shadow: 0 0 24px rgba(59, 130, 246, 0.2);
}
.open-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: var(--bg-card2);
  border: 1px solid var(--border);
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.7rem;
}
.open-btn:hover {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}
.logo {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: var(--bg-card2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  margin-bottom: 10px;
  overflow: hidden;
  border: 1px solid var(--border);
}
.logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.title {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.domain {
  font-size: 0.65rem;
  color: var(--accent2);
  font-family: monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 8px;
}
.colors {
  display: flex;
  gap: 4px;
  margin-bottom: 6px;
}
.color-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.tasks-badge {
  font-size: 0.6rem;
  color: var(--text-muted);
  margin-top: 4px;
}
</style>
