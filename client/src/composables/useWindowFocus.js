import { ref } from "vue";

// Module-scoped, shared by every caller: whichever window (modal or
// floating widget) is interacted with last gets the highest z-index,
// regardless of what kind of window it is.
let sharedTopZ = 900;

export function useWindowFocus() {
  const zIndex = ref(sharedTopZ);

  function bringToFront() {
    sharedTopZ += 1;
    zIndex.value = sharedTopZ;
  }

  return { zIndex, bringToFront };
}
