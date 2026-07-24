<script setup>
import { onMounted } from "vue";
import { useToastStore } from "../stores/toast";
import { useProjectsStore } from "../stores/projects";
import { useFoldersStore } from "../stores/folders";
import { useTasksStore } from "../stores/tasks";
import { useCommitsStore } from "../stores/commits";
import TheTaskbar from "../components/layout/TheTaskbar.vue";
import ProjectCard from "../components/desktop/ProjectCard.vue";

const toast = useToastStore();
const projectsStore = useProjectsStore();
const foldersStore = useFoldersStore();
const tasksStore = useTasksStore();
const commitsStore = useCommitsStore();

onMounted(async () => {
  try {
    await Promise.all([
      projectsStore.fetchAll(),
      foldersStore.fetchAll(),
      tasksStore.fetchAll(),
      commitsStore.fetchAll(),
    ]);
  } catch (err) {
    toast.show(err.message, "error");
  }
});

function notImplementedYet() {
  toast.show("Ta funkcja pojawi się w kolejnym commicie.", "info");
}
</script>

<template>
  <div class="dashboard">
    <div class="desktop-area">
      <ProjectCard
        v-for="project in projectsStore.items"
        :key="project.id"
        :project="project"
        :style="{ left: project.x + 'px', top: project.y + 'px' }"
        @open="notImplementedYet"
        @contextmenu="notImplementedYet"
      />
    </div>

    <TheTaskbar
      @new-project="notImplementedYet"
      @new-task="notImplementedYet"
      @new-folder="notImplementedYet"
      @all-tasks="notImplementedYet"
      @toggle-calendar="notImplementedYet"
      @toggle-chat="notImplementedYet"
    />
  </div>
</template>

<style scoped>
.dashboard {
  position: relative;
  height: 100vh;
}
.desktop-area {
  position: relative;
  height: calc(100vh - var(--taskbar-h));
  overflow: auto;
}
</style>
