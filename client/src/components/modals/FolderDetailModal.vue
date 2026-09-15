<script setup>
import { computed } from "vue";
import { useProjectsStore } from "../../stores/projects";
import { useTasksStore } from "../../stores/tasks";
import BaseModal from "./BaseModal.vue";
import { Rocket, ArrowRight } from "@lucide/vue";

const props = defineProps({
  show: { type: Boolean, required: true },
  folder: { type: Object, default: null },
});

const emit = defineEmits(["close", "open-project"]);

const projectsStore = useProjectsStore();
const tasksStore = useTasksStore();

const folderProjects = computed(() =>
  props.folder ? projectsStore.items.filter((p) => p.folderId === props.folder.id) : [],
);

function openTasksCount(projectId) {
  return tasksStore.items.filter((t) => t.projectId === projectId && !t.done).length;
}
</script>

<template>
  <BaseModal :show="show" :title="folder?.name || 'Katalog'" max-width="640px" @close="emit('close')">
    <div v-if="folder?.desc" class="folder-desc">{{ folder.desc }}</div>

    <div v-if="!folderProjects.length" class="empty-state">
      <p>Brak projektów w tym katalogu.</p>
    </div>
    <div v-else class="folder-projects-grid">
      <div
        v-for="project in folderProjects"
        :key="project.id"
        class="folder-project-item"
        @click="emit('open-project', project.id)"
      >
        <div class="fp-logo">
          <img v-if="project.logo" :src="project.logo" alt="" />
          <Rocket v-else :size="18" />
        </div>
        <div class="fp-info">
          <div class="fp-title">{{ project.name }}</div>
          <div v-if="project.domain" class="fp-domain">{{ project.domain }}</div>
        </div>
        <div v-if="openTasksCount(project.id)" class="fp-badge">{{ openTasksCount(project.id) }} zadań</div>
        <ArrowRight class="fp-arrow" :size="14" />
      </div>
    </div>
  </BaseModal>
</template>

<style scoped>
.folder-desc {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 14px;
}
.folder-projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
}
.folder-project-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  background: var(--bg-card2);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: border-color 0.2s;
}
.folder-project-item:hover {
  border-color: var(--accent);
}
.fp-logo {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 8px;
  background: var(--bg-hover);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.fp-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.fp-info {
  flex: 1;
  min-width: 0;
}
.fp-title {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.fp-domain {
  font-size: 0.63rem;
  color: var(--accent2);
  font-family: monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.fp-badge {
  font-size: 0.6rem;
  color: var(--text-muted);
  flex-shrink: 0;
}
.fp-arrow {
  color: var(--text-muted);
  flex-shrink: 0;
}
</style>
