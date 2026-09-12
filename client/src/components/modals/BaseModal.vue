<script setup>
import { ref, watch } from "vue";
import { X } from "@lucide/vue";
import { useWindowFocus } from "../../composables/useWindowFocus";

const props = defineProps({
  show: { type: Boolean, required: true },
  title: { type: String, default: "" },
  maxWidth: { type: String, default: "580px" },
  resizable: { type: Boolean, default: false },
});

const emit = defineEmits(["close"]);

const modalEl = ref(null);
const customWidth = ref(null);
const isResizing = ref(false);
const { zIndex, bringToFront } = useWindowFocus();

function startResize(e) {
  e.preventDefault();
  isResizing.value = true;
  const startX = e.clientX;
  const startWidth = modalEl.value.getBoundingClientRect().width;

  function onMove(ev) {
    const next = startWidth + (ev.clientX - startX);
    const min = 420;
    const max = window.innerWidth - 40;
    customWidth.value = `${Math.min(Math.max(next, min), max)}px`;
  }
  function onUp() {
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onUp);
    // The mouse can end up over the backdrop when the drag finishes (the
    // modal doesn't fill the screen), which fires a click there right
    // after — wait a tick so handleOverlayClick still sees the flag.
    setTimeout(() => {
      isResizing.value = false;
    });
  }
  document.addEventListener("mousemove", onMove);
  document.addEventListener("mouseup", onUp);
}

function handleOverlayClick(e) {
  if (isResizing.value) return;
  if (e.target === e.currentTarget) emit("close");
}

// Opening a window should also bring it to front, not just clicking one
// that's already open — otherwise a freshly opened modal could render
// behind a widget that was focused earlier.
watch(
  () => props.show,
  (isOpen) => {
    if (isOpen) bringToFront();
  },
);
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" :style="{ zIndex }" @click="handleOverlayClick">
      <div
        ref="modalEl"
        class="modal"
        :class="{ 'modal-resizable': resizable }"
        :style="{ maxWidth: customWidth || maxWidth, width: customWidth || undefined }"
        @mousedown="bringToFront"
      >
        <div class="modal-header">
          <span class="modal-title"><slot name="title">{{ title }}</slot></span>
          <slot name="header-actions" />
          <button class="modal-close" @click="emit('close')"><X :size="15" /></button>
        </div>
        <div class="modal-body">
          <slot />
        </div>
        <div v-if="resizable" class="resize-handle" title="Przeciągnij, żeby zmienić szerokość" @mousedown="startResize"></div>
      </div>
    </div>
  </Teleport>
</template>
