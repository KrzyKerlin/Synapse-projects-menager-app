<script setup>
import { ref, computed } from "vue";
import { useTasksStore } from "../../stores/tasks";
import { useProjectsStore } from "../../stores/projects";
import BaseModal from "../modals/BaseModal.vue";

defineProps({
  show: { type: Boolean, required: true },
});

const emit = defineEmits(["close", "edit-task"]);

const tasksStore = useTasksStore();
const projectsStore = useProjectsStore();

const MONTHS = [
  "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
  "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień",
];
const DAY_NAMES = ["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"];

const viewDate = ref(new Date());
const selectedDay = ref(null);

function pad(n) {
  return String(n).padStart(2, "0");
}
function dateKey(y, m, d) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

const monthLabel = computed(() => `${MONTHS[viewDate.value.getMonth()]} ${viewDate.value.getFullYear()}`);

const taskDaySet = computed(() => {
  const y = viewDate.value.getFullYear();
  const m = viewDate.value.getMonth();
  const set = new Set();
  tasksStore.items.forEach((t) => {
    if (!t.due) return;
    const d = new Date(t.due);
    if (d.getFullYear() === y && d.getMonth() === m) set.add(d.getDate());
  });
  return set;
});

const cells = computed(() => {
  const y = viewDate.value.getFullYear();
  const m = viewDate.value.getMonth();
  const firstDay = new Date(y, m, 1);
  let startDow = firstDay.getDay();
  startDow = startDow === 0 ? 6 : startDow - 1;
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const prevLastDay = new Date(y, m, 0).getDate();
  const today = new Date();

  const result = [];
  for (let i = startDow - 1; i >= 0; i--) {
    result.push({ day: prevLastDay - i, otherMonth: true });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const key = dateKey(y, m, day);
    result.push({
      day,
      key,
      otherMonth: false,
      isToday: day === today.getDate() && m === today.getMonth() && y === today.getFullYear(),
      hasTask: taskDaySet.value.has(day),
    });
  }
  while (result.length < 42) {
    result.push({ day: result.length - (startDow + daysInMonth) + 1, otherMonth: true });
  }
  return result;
});

const dayTasks = computed(() => {
  if (!selectedDay.value) return [];
  return tasksStore.items.filter((t) => t.due === selectedDay.value);
});

const selectedDayLabel = computed(() => {
  if (!selectedDay.value) return "";
  const [y, m, d] = selectedDay.value.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("pl-PL", { day: "2-digit", month: "long", year: "numeric" });
});

function prevMonth() {
  viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() - 1, 1);
  selectedDay.value = null;
}
function nextMonth() {
  viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + 1, 1);
  selectedDay.value = null;
}
function selectDay(cell) {
  if (cell.otherMonth) return;
  selectedDay.value = cell.key;
}
function projectName(task) {
  if (!task.projectId) return null;
  return projectsStore.items.find((p) => p.id === task.projectId)?.name;
}
</script>

<template>
  <BaseModal :show="show" title="Kalendarz" max-width="360px" @close="emit('close')">
    <div class="cal-header">
      <button class="cal-nav" @click="prevMonth">‹</button>
      <h4>{{ monthLabel }}</h4>
      <button class="cal-nav" @click="nextMonth">›</button>
    </div>
    <div class="cal-grid">
      <div v-for="n in DAY_NAMES" :key="n" class="cal-day-name">{{ n }}</div>
      <div
        v-for="(cell, i) in cells"
        :key="i"
        class="cal-day"
        :class="{
          'other-month': cell.otherMonth,
          today: cell.isToday,
          'has-task': cell.hasTask,
          selected: cell.key === selectedDay,
        }"
        @click="selectDay(cell)"
      >
        {{ cell.day }}
      </div>
    </div>
    <div v-if="selectedDay" class="cal-day-tasks">
      <div class="cdt-title">{{ selectedDayLabel }} — {{ dayTasks.length }} zadań</div>
      <div v-if="!dayTasks.length" class="cdt-empty">Brak zadań z terminem tego dnia.</div>
      <div v-for="t in dayTasks" :key="t.id" class="cal-task-mini" @click="emit('edit-task', t)">
        <span class="cdt-dot" :style="{ background: `var(--${t.type}, var(--text-muted))` }"></span>
        <span class="cdt-name">{{ t.title }}<template v-if="projectName(t)"> · {{ projectName(t) }}</template></span>
      </div>
    </div>
    <div v-else class="cal-legend">Kliknij dzień, by zobaczyć listę zadań</div>
  </BaseModal>
</template>

<style scoped>
.cal-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 10px;
}
.cal-header h4 {
  flex: 1;
  text-align: center;
  font-size: 0.82rem;
  font-weight: 700;
}
.cal-nav {
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  border-radius: 6px;
  background: var(--bg-hover);
  border: 1px solid var(--border);
  color: var(--text-muted);
  cursor: pointer;
}
.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}
.cal-day-name {
  text-align: center;
  font-size: 0.6rem;
  font-weight: 700;
  color: var(--text-muted);
  padding: 4px 0;
}
.cal-day {
  text-align: center;
  font-size: 0.72rem;
  padding: 5px 2px;
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-muted);
  position: relative;
}
.cal-day:hover {
  background: var(--bg-hover);
  color: var(--text);
}
.cal-day.today {
  background: var(--accent);
  color: #fff;
  font-weight: 700;
}
.cal-day.selected {
  outline: 2px solid var(--accent2);
  outline-offset: -2px;
}
.cal-day.has-task::after {
  content: "";
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--feat);
}
.cal-day.other-month {
  opacity: 0.3;
}
.cal-day-tasks {
  border-top: 1px solid var(--border);
  padding: 10px;
  max-height: 180px;
  overflow-y: auto;
}
.cdt-title {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  margin-bottom: 8px;
}
.cdt-empty {
  font-size: 0.7rem;
  color: var(--text-muted);
}
.cal-task-mini {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 6px 8px;
  border-radius: 7px;
  background: var(--bg-card2);
  border: 1px solid var(--border);
  margin-bottom: 5px;
  cursor: pointer;
  font-size: 0.72rem;
}
.cdt-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  background: var(--text-muted);
}
.cdt-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cal-legend {
  padding-top: 10px;
  font-size: 0.65rem;
  color: var(--text-muted);
  text-align: center;
}
</style>
