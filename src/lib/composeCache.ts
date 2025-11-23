// // // src/lib/composeCache.ts
// // "use client";

// // import type { Element as ElementDto } from "@/types/compose";
// // import { apiGetBaseElements } from "@/lib/composeApi";

// // const LS_KEY = "compose_cache_v1";
// // const SCHEMA_VERSION = 1;

// // type CacheShape = {
// //   version: number;
// //   elements: Record<number, ElementDto>;
// //   baseIds: number[];
// //   characters: number[];           // element ids where is_character = true
// //   discoveredOrder: number[];      // optional: order we encountered
// //   lastUpdated: number;
// // };

// // function now() { return Date.now(); }

// // function emptyCache(): CacheShape {
// //   return {
// //     version: SCHEMA_VERSION,
// //     elements: {},
// //     baseIds: [],
// //     characters: [],
// //     discoveredOrder: [],
// //     lastUpdated: now(),
// //   };
// // }

// // function load(): CacheShape {
// //   if (typeof window === "undefined") return emptyCache();
// //   try {
// //     const raw = localStorage.getItem(LS_KEY);
// //     if (!raw) return emptyCache();
// //     const parsed = JSON.parse(raw) as CacheShape;
// //     if (parsed.version !== SCHEMA_VERSION) return emptyCache();
// //     return parsed;
// //   } catch {
// //     return emptyCache();
// //   }
// // }

// // function save(s: CacheShape) {
// //   if (typeof window === "undefined") return;
// //   localStorage.setItem(LS_KEY, JSON.stringify({ ...s, lastUpdated: now() }));
// // }

// // let state: CacheShape = load();

// // // ---------- Public API ----------
// // export function resetComposeCache() {
// //   state = emptyCache();
// //   save(state);
// // }

// // export function getElementLocal(id: number): ElementDto | undefined {
// //   return state.elements[id];
// // }

// // export function hasElementLocal(id: number): boolean {
// //   return !!state.elements[id];
// // }

// // export function getAllElementsLocal(): ElementDto[] {
// //   return Object.values(state.elements);
// // }

// // export function getBaseElementsLocal(): ElementDto[] {
// //   return state.baseIds.map((id) => state.elements[id]).filter(Boolean);
// // }

// // export function getCharactersLocal(): ElementDto[] {
// //   return state.characters.map((id) => state.elements[id]).filter(Boolean);
// // }

// // export function listDiscoveredLocal(): ElementDto[] {
// //   return state.discoveredOrder.map((id) => state.elements[id]).filter(Boolean);
// // }

// // export function upsertElementLocal(el: ElementDto, markDiscovered = true) {
// //   const existed = !!state.elements[el.id];
// //   state.elements[el.id] = el;

// //   if (el.is_character) {
// //     if (!state.characters.includes(el.id)) state.characters.push(el.id);
// //   }
// //   if (markDiscovered && !existed) {
// //     state.discoveredOrder.push(el.id);
// //   }
// //   save(state);
// // }

// // export function setBaseElementsLocal(base: ElementDto[]) {
// //   state.baseIds = base.map((b) => b.id);
// //   for (const b of base) {
// //     state.elements[b.id] = b;
// //     if (b.is_character && !state.characters.includes(b.id)) {
// //       state.characters.push(b.id);
// //     }
// //     if (!state.discoveredOrder.includes(b.id)) {
// //       state.discoveredOrder.push(b.id);
// //     }
// //   }
// //   save(state);
// // }

// // /**
// //  * First-time initializer: fetch base elements ONLY IF cache has no base.
// //  * No network on subsequent runs.
// //  */
// // export async function initBaseIfNeededLocal(): Promise<void> {
// //   if (state.baseIds.length > 0) return;

// //   const baseRes = await apiGetBaseElements();
// //   const base = (baseRes.items ?? []) as ElementDto[];

// //   setBaseElementsLocal(base);
// // }

// // /** Clear all local cache and run the 'very first time' again. */
// // export async function clearAndReinitLocal(): Promise<void> {
// //   resetComposeCache();
// //   await initBaseIfNeededLocal();
// // }


// // src/lib/composeCache.ts
// "use client";

// import type { Element as ElementDto } from "@/types/compose";
// import { apiGetBaseElements } from "@/lib/composeApi";

// const LS_KEY = "compose_cache_v1";
// const SCHEMA_VERSION = 1;
// export const COMPOSE_CACHE_UPDATED = "COMPOSE_CACHE_UPDATED";

// type CacheShape = {
//   version: number;
//   elements: Record<number, ElementDto>;
//   baseIds: number[];
//   discoveredOrder: number[];
//   characters: number[];
//   lastUpdated: number;
// };

// function now() { return Date.now(); }

// function emptyCache(): CacheShape {
//   return {
//     version: SCHEMA_VERSION,
//     elements: {},
//     baseIds: [],
//     discoveredOrder: [],
//     characters: [],
//     lastUpdated: now(),
//   };
// }

// function load(): CacheShape {
//   if (typeof window === "undefined") return emptyCache();
//   try {
//     const raw = localStorage.getItem(LS_KEY);
//     if (!raw) return emptyCache();
//     const parsed = JSON.parse(raw) as CacheShape;
//     if (parsed.version !== SCHEMA_VERSION) return emptyCache();
//     return parsed;
//   } catch {
//     return emptyCache();
//   }
// }

// function save(s: CacheShape) {
//   if (typeof window === "undefined") return;
//   localStorage.setItem(LS_KEY, JSON.stringify({ ...s, lastUpdated: now() }));
// }

// function notify() {
//   if (typeof window !== "undefined") {
//     window.dispatchEvent(new Event(COMPOSE_CACHE_UPDATED));
//   }
// }

// let state: CacheShape = load();

// export function resetComposeCache() {
//   state = emptyCache();
//   save(state);
//   notify();
// }

// export async function initBaseIfNeededLocal(): Promise<void> {
//   if (state.baseIds.length > 0) return;
//   const res = await apiGetBaseElements();
//   const base = (res.items ?? []) as ElementDto[];
//   state.baseIds = base.map(b => b.id);
//   for (const b of base) {
//     state.elements[b.id] = b;
//     if (!state.discoveredOrder.includes(b.id)) state.discoveredOrder.push(b.id);
//     if (b.is_character && !state.characters.includes(b.id)) state.characters.push(b.id);
//   }
//   save(state);
//   notify();
// }

// export async function clearAndReinitLocal(): Promise<void> {
//   resetComposeCache();
//   await initBaseIfNeededLocal();
// }

// export function upsertElementLocal(el: ElementDto, markDiscovered = true) {
//   const existed = !!state.elements[el.id];
//   state.elements[el.id] = el;
//   if (el.is_character && !state.characters.includes(el.id)) state.characters.push(el.id);
//   if (markDiscovered && !existed) state.discoveredOrder.push(el.id);
//   save(state);
//   notify();
// }

// export function getElementLocal(id: number): ElementDto | undefined {
//   return state.elements[id];
// }

// export function getBaseElementsLocal(): ElementDto[] {
//   return state.baseIds.map(id => state.elements[id]).filter(Boolean);
// }

// export function listDiscoveredLocal(): ElementDto[] {
//   return state.discoveredOrder.map(id => state.elements[id]).filter(Boolean);
// }

// /** Inventory = base + discovered (deduped, keep base order first) */
// export function listInventoryLocal(): ElementDto[] {
//   const seen = new Set<number>();
//   const base = getBaseElementsLocal().filter(e => (seen.has(e.id) ? false : (seen.add(e.id), true)));
//   const disc = listDiscoveredLocal().filter(e => (seen.has(e.id) ? false : (seen.add(e.id), true)));
//   return [...base, ...disc];
// }


// src/lib/composeCache.ts
"use client";

import type { Element as ElementDto } from "@/types/compose";
import { apiGetBaseElements } from "@/lib/composeApi";

const LS_KEY = "compose_cache_v1";
const SCHEMA_VERSION = 1;

// Fire this on any cache mutation so sidepanels/scenes can react.
export const COMPOSE_CACHE_UPDATED = "COMPOSE_CACHE_UPDATED";

type CacheShape = {
  version: number;
  elements: Record<number, ElementDto>;
  baseIds: number[];
  discoveredOrder: number[];
  characters: number[];
  lastUpdated: number;
};

function now() { return Date.now(); }

function emptyCache(): CacheShape {
  return {
    version: SCHEMA_VERSION,
    elements: {},
    baseIds: [],
    discoveredOrder: [],
    characters: [],
    lastUpdated: now(),
  };
}

function load(): CacheShape {
  if (typeof window === "undefined") return emptyCache();
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return emptyCache();
    const parsed = JSON.parse(raw) as CacheShape;
    if (parsed.version !== SCHEMA_VERSION) return emptyCache();
    return parsed;
  } catch {
    return emptyCache();
  }
}

function save(s: CacheShape) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify({ ...s, lastUpdated: now() }));
}

function notify() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(COMPOSE_CACHE_UPDATED));
  }
}

let state: CacheShape = load();

// ---------- Public API ----------
export function resetComposeCache() {
  state = emptyCache();
  save(state);
  notify();
}

export async function initBaseIfNeededLocal(): Promise<void> {
  if (state.baseIds.length > 0) return;
  const res = await apiGetBaseElements();
  const base = (res.items ?? []) as ElementDto[];

  state.baseIds = base.map((b) => b.id);
  for (const b of base) {
    state.elements[b.id] = b;
    if (!state.discoveredOrder.includes(b.id)) state.discoveredOrder.push(b.id);
    if (b.is_character && !state.characters.includes(b.id)) state.characters.push(b.id);
  }
  save(state);
  notify();
}

export async function clearAndReinitLocal(): Promise<void> {
  resetComposeCache();
  await initBaseIfNeededLocal();
}

export function upsertElementLocal(el: ElementDto, markDiscovered = true) {
  const existed = !!state.elements[el.id];
  state.elements[el.id] = el;

  if (el.is_character && !state.characters.includes(el.id)) {
    state.characters.push(el.id);
  }
  if (markDiscovered && !existed) {
    state.discoveredOrder.push(el.id);
  }

  save(state);
  notify();
}

export function getElementLocal(id: number): ElementDto | undefined {
  return state.elements[id];
}

export function getBaseElementsLocal(): ElementDto[] {
  return state.baseIds.map((id) => state.elements[id]).filter(Boolean);
}

export function listDiscoveredLocal(): ElementDto[] {
  return state.discoveredOrder.map((id) => state.elements[id]).filter(Boolean);
}

/** Inventory = base + discovered (deduped, keep base order first) */
export function listInventoryLocal(): ElementDto[] {
  const seen = new Set<number>();
  const base = getBaseElementsLocal().filter(e => (seen.has(e.id) ? false : (seen.add(e.id), true)));
  const disc = listDiscoveredLocal().filter(e => (seen.has(e.id) ? false : (seen.add(e.id), true)));
  return [...base, ...disc];
}

/** Collections = characters that exist in cache */
export function getCharactersLocal(): ElementDto[] {
  return state.characters.map(id => state.elements[id]).filter(Boolean);
}
