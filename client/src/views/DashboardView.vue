<script setup>
import { computed, onMounted, ref } from "vue";
import { useToastStore } from "../stores/toast";
import { useProjectsStore } from "../stores/projects";
import { useFoldersStore } from "../stores/folders";
import { useTasksStore } from "../stores/tasks";
import { useCommitsStore } from "../stores/commits";
import TheTaskbar from "../components/layout/TheTaskbar.vue";
import ProjectCard from "../components/desktop/ProjectCard.vue";
import FolderCard from "../components/desktop/FolderCard.vue";
import NewFolderModal from "../components/modals/NewFolderModal.vue";
import NewTaskModal from "../components/modals/NewTaskModal.vue";
import AllTasksModal from "../components/modals/AllTasksModal.vue";
import NewProjectModal from "../components/modals/NewProjectModal.vue";
import FolderDetailModal from "../components/modals/FolderDetailModal.vue";
import ProjectDetailModal from "../components/project/ProjectDetailModal.vue";
import CalendarWidget from "../components/widgets/CalendarWidget.vue";
import EditTaskModal from "../components/modals/EditTaskModal.vue";
import ChatWidget from "../components/widgets/ChatWidget.vue";
import ContextMenu from "../components/common/ContextMenu.vue";

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

function moveProject(id, x, y) {
  projectsStore.update(id, { x, y }).catch((err) => toast.show(err.message, "error"));
}

function moveFolder(id, x, y) {
  foldersStore.update(id, { x, y }).catch((err) => toast.show(err.message, "error"));
}

const showNewFolderModal = ref(false);
const showNewTaskModal = ref(false);
const showAllTasksModal = ref(false);
const showNewProjectModal = ref(false);
const openProjectId = ref(null);
const openFolderId = ref(null);

// Projects filed into a folder only show inside that folder's window, not
// as a duplicate card on the desktop.
const unfiledProjects = computed(() => projectsStore.items.filter((p) => !p.folderId));
const openFolderData = computed(() => foldersStore.items.find((f) => f.id === openFolderId.value) || null);

function openProject(id) {
  openProjectId.value = id;
}

function openProjectFromFolder(id) {
  openFolderId.value = null;
  openProjectId.value = id;
}

function openFolder(id) {
  openFolderId.value = id;
}

const showCalendar = ref(false);
const editingTask = ref(null);

// Due-today / overdue reminder shown once after login.
const showReminder = ref(true);
const todayStr = new Date().toISOString().slice(0, 10);
const overdueTasks = computed(() =>
  tasksStore.items.filter((t) => !t.done && t.due && t.due < todayStr),
);
const dueTodayTasks = computed(() =>
  tasksStore.items.filter((t) => !t.done && t.due === todayStr),
);
const hasReminders = computed(() => overdueTasks.value.length > 0 || dueTodayTasks.value.length > 0);

// Scroll-to-top for the mobile project list, which stacks cards vertically
// and can get long once there are many projects.
const desktopAreaEl = ref(null);
const showScrollTop = ref(false);
function onDesktopScroll() {
  showScrollTop.value = !!desktopAreaEl.value && desktopAreaEl.value.scrollTop > 300;
}
function scrollToTop() {
  desktopAreaEl.value?.scrollTo({ top: 0, behavior: "smooth" });
}

const contextMenu = ref({ show: false, x: 0, y: 0, items: [] });

async function deleteProject(id) {
  if (!confirm("Usunąć projekt? Zadania i commity projektu też zostaną usunięte.")) return;
  try {
    await projectsStore.remove(id);
    toast.show("Projekt usunięty", "info");
  } catch (err) {
    toast.show(err.message, "error");
  }
}

async function deleteFolder(id) {
  if (!confirm("Usunąć katalog? Projekty w nim nie zostaną usunięte.")) return;
  try {
    await foldersStore.remove(id);
    toast.show("Katalog usunięty", "info");
  } catch (err) {
    toast.show(err.message, "error");
  }
}

function onProjectContextMenu(event, id) {
  contextMenu.value = {
    show: true,
    x: event.clientX,
    y: event.clientY,
    items: [
      { label: "Otwórz", action: () => openProject(id) },
      { label: "Usuń", danger: true, action: () => deleteProject(id) },
    ],
  };
}

function onFolderContextMenu(event, id) {
  contextMenu.value = {
    show: true,
    x: event.clientX,
    y: event.clientY,
    items: [
      { label: "Otwórz", action: () => openFolder(id) },
      { label: "Usuń", danger: true, action: () => deleteFolder(id) },
    ],
  };
}
</script>

<template>
  <div class="dashboard">
    <div class="desktop-area" ref="desktopAreaEl" @scroll="onDesktopScroll">
      <FolderCard
        v-for="folder in foldersStore.items"
        :key="folder.id"
        :folder="folder"
        :style="{ left: folder.x + 'px', top: folder.y + 'px' }"
        @open="openFolder"
        @contextmenu="onFolderContextMenu"
        @move="moveFolder"
      />
      <ProjectCard
        v-for="project in unfiledProjects"
        :key="project.id"
        :project="project"
        :style="{ left: project.x + 'px', top: project.y + 'px' }"
        @open="openProject"
        @contextmenu="onProjectContextMenu"
        @move="moveProject"
      />
    </div>

    <button v-if="showScrollTop" class="scroll-top-btn" title="Przewiń do góry" @click="scrollToTop">↑</button>

    <div v-if="hasReminders && showReminder" class="reminder-card">
      <div class="reminder-header">
        <span>🔔 Przypomnienie</span>
        <button class="reminder-close" @click="showReminder = false">✕</button>
      </div>
      <div v-if="overdueTasks.length" class="reminder-group">
        <div class="reminder-group-title overdue">Po terminie ({{ overdueTasks.length }})</div>
        <div v-for="t in overdueTasks" :key="t.id" class="reminder-item">{{ t.title }} — {{ t.due }}</div>
      </div>
      <div v-if="dueTodayTasks.length" class="reminder-group">
        <div class="reminder-group-title">Na dziś ({{ dueTodayTasks.length }})</div>
        <div v-for="t in dueTodayTasks" :key="t.id" class="reminder-item">{{ t.title }}</div>
      </div>
    </div>

    <TheTaskbar
      @new-project="showNewProjectModal = !showNewProjectModal"
      @new-task="showNewTaskModal = !showNewTaskModal"
      @new-folder="showNewFolderModal = !showNewFolderModal"
      @all-tasks="showAllTasksModal = !showAllTasksModal"
      @toggle-calendar="showCalendar = !showCalendar"
    />

    <NewFolderModal :show="showNewFolderModal" @close="showNewFolderModal = false" />
    <NewTaskModal :show="showNewTaskModal" @close="showNewTaskModal = false" />
    <AllTasksModal :show="showAllTasksModal" @close="showAllTasksModal = false" />
    <NewProjectModal :show="showNewProjectModal" @close="showNewProjectModal = false" />
    <ProjectDetailModal :show="!!openProjectId" :project-id="openProjectId" @close="openProjectId = null" />
    <FolderDetailModal
      :show="!!openFolderId"
      :folder="openFolderData"
      @close="openFolderId = null"
      @open-project="openProjectFromFolder"
    />
    <CalendarWidget :show="showCalendar" @close="showCalendar = false" @edit-task="editingTask = $event" />
    <EditTaskModal :show="!!editingTask" :task="editingTask" @close="editingTask = null" />
    <ChatWidget />
    <ContextMenu
      :show="contextMenu.show"
      :x="contextMenu.x"
      :y="contextMenu.y"
      :items="contextMenu.items"
      @close="contextMenu.show = false"
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
.scroll-top-btn {
  position: fixed;
  bottom: calc(var(--taskbar-h) + 70px);
  left: 10px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text);
  font-size: 1.1rem;
  cursor: pointer;
  box-shadow: var(--shadow);
  z-index: 850;
}
.reminder-card {
  position: fixed;
  top: 16px;
  right: 16px;
  width: 280px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: var(--shadow);
  padding: 12px 14px;
  z-index: 950;
}
.reminder-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.82rem;
  font-weight: 700;
  margin-bottom: 8px;
}
.reminder-close {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.75rem;
}
.reminder-close:hover {
  color: var(--fix);
}
.reminder-group {
  margin-bottom: 8px;
}
.reminder-group-title {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--js);
  margin-bottom: 4px;
}
.reminder-group-title.overdue {
  color: var(--fix);
}
.reminder-item {
  font-size: 0.75rem;
  color: var(--text-muted);
  padding: 2px 0;
}
@media (max-width: 768px) {
  .reminder-card {
    top: 10px;
    right: 10px;
    width: 200px;
    padding: 10px 12px;
  }
  .reminder-header {
    font-size: 0.75rem;
  }
  .reminder-group-title {
    font-size: 0.6rem;
  }
  .reminder-item {
    font-size: 0.68rem;
  }
}
</style>
