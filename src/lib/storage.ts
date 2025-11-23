// const FOUND_KEY = "br_found_ids";
// const DEVICE_ID_KEY = "br_device_id";

// export function getDeviceId(): string {
//   if (typeof window === "undefined") return "server";
//   let id = localStorage.getItem(DEVICE_ID_KEY);
//   if (!id) {
//     id = crypto.randomUUID();
//     localStorage.setItem(DEVICE_ID_KEY, id);
//   }
//   return id;
// }

// export function getFoundIds(): number[] {
//   if (typeof window === "undefined") return [];
//   const raw = localStorage.getItem(FOUND_KEY);
//   return raw ? JSON.parse(raw) : [];
// }

// export function addFoundId(id: number) {
//   if (typeof window === "undefined") return;
//   const set = new Set(getFoundIds());
//   set.add(id);
//   localStorage.setItem(FOUND_KEY, JSON.stringify([...set]));
// }


const FOUND_KEY = "br_found_ids";
const DEVICE_ID_KEY = "br_device_id";
const PROGRESS_EVT = "anycraft:progress-changed";

function announceProgressChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(PROGRESS_EVT));
  }
}

export function getDeviceId(): string {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function getFoundIds(): number[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(FOUND_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function addFoundId(id: number) {
  if (typeof window === "undefined") return;
  const set = new Set(getFoundIds());
  if (!set.has(id)) {
    set.add(id);
    localStorage.setItem(FOUND_KEY, JSON.stringify([...set]));
    announceProgressChange(); // 🔔 notify UI
  }
}

/** Wipe discovered elements/collections (keep device id) */
export function clearFoundProgress() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(FOUND_KEY);
  announceProgressChange(); // 🔔 notify UI
}

export function clearFoundProgressX() {
  // localStorage.removeItem("brainrot_found_ids");
  // localStorage.removeItem("brainrot_found_elements");
  // localStorage.removeItem("brainrot_found_characters");
  // localStorage.removeItem("brainrot_base_elements");
  // localStorage.removeItem("brainrot_sfx_muted");
  // localStorage.removeItem("brainrot_last_challenges");
  localStorage.clear();
}

const CHALLENGE_KEY = "br_challenge_ids";
// export const PROGRESS_EVT = "anycraft:progress-changed"; // (keep if you already have it)

// function announceProgressChange() {
//   if (typeof window !== "undefined") window.dispatchEvent(new Event(PROGRESS_EVT));
// }

export function getChallengeIds(): number[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(CHALLENGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function setChallengeIds(ids: number[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CHALLENGE_KEY, JSON.stringify(ids.slice(0, 2)));
}

/** Fill up to `max` challenge slots with random undiscovered character IDs. */
export function ensureChallenges(
  max: number,
  allElements: Array<{ id: number; is_character: boolean }>,
  foundSet: Set<number>
): number[] {
  // current active
  const active = new Set(getChallengeIds().filter((id) => !foundSet.has(id)));
  // pool: undiscovered characters not already active
  const pool = allElements
    .filter((e) => e.is_character && !foundSet.has(e.id) && !active.has(e.id))
    .map((e) => e.id);

  // shuffle pool (Fisher-Yates)
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // add until max
  for (const id of pool) {
    if (active.size >= max) break;
    active.add(id);
  }

  const out = Array.from(active).slice(0, max);
  setChallengeIds(out);
  return out;
}

/** Remove a challenge id if present and persist. */
export function removeChallengeId(id: number) {
  const next = getChallengeIds().filter((x) => x !== id);
  setChallengeIds(next);
}


/** (optional) full reset including device id */
// export function clearAllProgress() {
//   if (typeof window === "undefined") return;
//   localStorage.removeItem(FOUND_KEY);
//   localStorage.removeItem(DEVICE_ID_KEY);
//   announceProgressChange();
// }

export { PROGRESS_EVT };


