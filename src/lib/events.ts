export const CLEAR_SCENE_EVT = "anycraft:clear-scene";

export function requestClearScene() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CLEAR_SCENE_EVT));
  }
}
