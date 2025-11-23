// // src/lib/sfx.ts
// "use client";

// export type SfxName = "normalsfx" | "failsfx" | "charsfx";

// const SOURCES: Record<SfxName, string> = {
//   normalsfx: "/sfx/normalsfx.mp3",
//   failsfx: "/sfx/failsfx.mp3",
//   charsfx: "/sfx/charsfx.mp3",
// };

// const cache = new Map<SfxName, HTMLAudioElement>();

// /** Preload all known SFX into <audio> elements (cached). */
// export function preloadSfx() {
//   (Object.keys(SOURCES) as SfxName[]).forEach((key) => {
//     if (!cache.has(key)) {
//       const a = new Audio(SOURCES[key]);
//       a.preload = "auto";
//       a.volume = 1.0; // default volume (0.0–1.0)
//       cache.set(key, a);
//     }
//   });
// }

// /** Optional: set global SFX volume (0.0–1.0). */
// export function setSfxVolume(volume: number) {
//   const v = Math.max(0, Math.min(1, volume));
//   cache.forEach((a) => (a.volume = v));
// }

// /** Play a sound effect by name. Safe if not loaded yet. */
// export function playSfx(name: SfxName) {
//   let a = cache.get(name);
//   if (!a) {
//     a = new Audio(SOURCES[name]);
//     a.preload = "auto";
//     cache.set(name, a);
//   }
//   try {
//     a.currentTime = 0;
//     // Browsers require a user gesture first; pointer events in your scene qualify.
//     void a.play();
//   } catch {
//     // ignore playback errors
//   }
// }

// src/lib/sfx.ts
"use client";

export type SfxName = "normalsfx" | "failsfx" | "charsfx";

const SOURCES: Record<SfxName, string> = {
  normalsfx: "/sfx/normalsfx.mp3",
  failsfx: "/sfx/failsfx.mp3",
  charsfx: "/sfx/charsfx.mp3",
};

const cache = new Map<SfxName, HTMLAudioElement>();

const LS_MUTE_KEY = "sfx_muted_v1";
export const SFX_MUTE_CHANGED = "SFX_MUTE_CHANGED";

let muted = false;
try {
  if (typeof window !== "undefined") {
    const raw = window.localStorage.getItem(LS_MUTE_KEY);
    muted = raw === "1";
  }
} catch {
  muted = false;
}

/** Preload all known SFX into <audio> elements (cached). */
export function preloadSfx() {
  (Object.keys(SOURCES) as SfxName[]).forEach((key) => {
    if (!cache.has(key)) {
      const a = new Audio(SOURCES[key]);
      a.preload = "auto";
      a.volume = 1.0; // base volume; mute handled separately
      cache.set(key, a);
    }
  });
}

/** Optional: set global SFX volume (0.0–1.0) when not muted. */
export function setSfxVolume(volume: number) {
  const v = Math.max(0, Math.min(1, volume));
  cache.forEach((a) => (a.volume = v));
}

/** Returns current mute state. */
export function isSfxMuted(): boolean {
  return muted;
}

/** Toggle/set mute state and broadcast change. */
export function setSfxMuted(next: boolean) {
  muted = !!next;
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LS_MUTE_KEY, muted ? "1" : "0");
      window.dispatchEvent(new Event(SFX_MUTE_CHANGED));
    }
  } catch {
    // ignore storage errors
  }
}

/** Play a sound effect by name (honors mute). */
export function playSfx(name: SfxName) {
  if (muted) return;
  let a = cache.get(name);
  if (!a) {
    a = new Audio(SOURCES[name]);
    a.preload = "auto";
    cache.set(name, a);
  }
  try {
    a.currentTime = 0;
    void a.play();
  } catch {
    // ignore playback errors (autoplay restrictions, etc.)
  }
}
