// "use client";

// import { useEffect, useMemo, useState, useRef } from "react";
// import { apiGetChallenges } from "@/lib/composeApi";
// import { getFoundIds, PROGRESS_EVT, removeChallengeId } from "@/lib/storage";
// import { obfuscateName } from "@/lib/text";

// import {
//   initBaseIfNeededLocal,
//   getBaseElementsLocal,
//   getElementLocal,
//   COMPOSE_CACHE_UPDATED,
// } from "@/lib/composeCache";

// type ElementDto = {
//   id: number;
//   slug: string;
//   name: string;
//   emoji?: string | null;
//   is_character: boolean;
//   is_base_element: boolean;
//   image_url?: string | null;
//   rarity?: string | null;
//   difficulty?: number | null;
// };

// type ChallengeItem = {
//   id: number;
//   name: string;
//   emoji?: string | null;
//   image_url?: string | null;
//   is_character: true;
//   rarity?: string;
//   difficulty?: number;
// };

// type Tab = "inventory" | "collections";

// export default function SidePanel({ onSpawn }: { onSpawn: (id: number) => void }) {
//   const [open, setOpen] = useState(true);
//   const [tab, setTab] = useState<Tab>("inventory");

//   const [foundSet, setFoundSet] = useState<Set<number> | null>(null);
//   const [baseElements, setBaseElements] = useState<ElementDto[]>([]);
//   const [basesLoading, setBasesLoading] = useState(false);

//   const [foundDetails, setFoundDetails] = useState<ElementDto[]>([]);
//   const [foundDetailsLoading, setFoundDetailsLoading] = useState(false);

//   const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
//   const [challengeLoading, setChallengeLoading] = useState(false);

//   // track previous character count so we know when a *new character* is discovered
//   const prevCharCountRef = useRef(0);

//   // prime cache + load bases + load found
//   useEffect(() => {
//     let alive = true;

//     const refreshBase = () => {
//       if (!alive) return;
//       setBaseElements(getBaseElementsLocal());
//     };

//     const loadFound = () => {
//       if (!alive) return;
//       setFoundSet(new Set(getFoundIds()));
//     };

//     const prime = async () => {
//       setBasesLoading(true);
//       try {
//         await initBaseIfNeededLocal(); // only pulls once
//         refreshBase();
//         loadFound();
//       } finally {
//         if (alive) setBasesLoading(false);
//       }
//     };

//     prime();

//     window.addEventListener(PROGRESS_EVT, loadFound);
//     window.addEventListener(COMPOSE_CACHE_UPDATED, refreshBase);

//     return () => {
//       alive = false;
//       window.removeEventListener(PROGRESS_EVT, loadFound);
//       window.removeEventListener(COMPOSE_CACHE_UPDATED, refreshBase);
//     };
//   }, []);

//   // resolve foundDetails from LOCAL cache whenever foundSet or cache updates
//   useEffect(() => {
//     if (!foundSet) return;
//     let cancelled = false;
//     setFoundDetailsLoading(true);

//     const fn = () => {
//       if (cancelled) return;
//       const details: ElementDto[] = [];
//       for (const id of foundSet) {
//         const el = getElementLocal(id);
//         if (el) details.push(el);
//       }
//       setFoundDetails(details);
//       setFoundDetailsLoading(false);
//     };

//     // small microtask lets any upserts settle
//     queueMicrotask(fn);

//     const onCache = fn;
//     window.addEventListener(COMPOSE_CACHE_UPDATED, onCache);
//     return () => {
//       cancelled = true;
//       window.removeEventListener(COMPOSE_CACHE_UPDATED, onCache);
//     };
//   }, [foundSet]);

//   async function refreshChallenges(fs: Set<number>) {
//     setChallengeLoading(true);
//     try {
//       const foundChars = foundDetails.filter((e) => e.is_character).map((e) => e.id);
//       const res = await apiGetChallenges(foundChars);
//       const items = (res.items ?? []).map((c: any) => ({
//         ...c,
//         id: Number(c.id),
//         is_character: true,
//       })) as ChallengeItem[];
//       setChallenges(items);
//     } catch (err) {
//       console.error("[CHALLENGES] failed:", err);
//       setChallenges([]);
//     } finally {
//       setChallengeLoading(false);
//     }
//   }

//   // ✅ Only refresh challenges when *character count* changes
//   useEffect(() => {
//     if (!foundSet) return;
//     if (foundDetailsLoading) return;

//     const chars = foundDetails.filter((d) => d.is_character && foundSet.has(d.id));
//     const currentCount = chars.length;

//     if (currentCount !== prevCharCountRef.current) {
//       prevCharCountRef.current = currentCount;
//       refreshChallenges(foundSet);
//     }
//   }, [foundSet, foundDetailsLoading, foundDetails]);

//   // ✅ Instant prune (handles dup finds without reload)
//   useEffect(() => {
//     if (!foundSet) return;
//     setChallenges((prev) => prev.filter((c) => !foundSet.has(c.id)));
//   }, [foundSet]);

//   // ✅ Optional server-side prune (no re-fetch here → no extra refresh)
//   useEffect(() => {
//     if (!foundSet || challenges.length === 0) return;
//     const newlyFound = challenges.filter((c) => foundSet.has(c.id));
//     if (newlyFound.length > 0) {
//       newlyFound.forEach((c) => removeChallengeId(c.id));
//     }
//   }, [foundSet, challenges]);

//   // derived views
//   const collections = useMemo(() => {
//     if (!foundSet) return [];
//     return foundDetails.filter((d) => d.is_character && foundSet.has(d.id));
//   }, [foundSet, foundDetails]);

//   const inventory = useMemo(() => {
//     const bases = baseElements;
//     if (!foundSet) return bases;

//     const discoveredNonChars = foundDetails.filter(
//       (d) => !d.is_character && !d.is_base_element && foundSet.has(d.id)
//     );
//     const merged = new Map<number, ElementDto>();
//     bases.forEach((b) => merged.set(b.id, b));
//     discoveredNonChars.forEach((d) => merged.set(d.id, d));
//     return [...merged.values()];
//   }, [baseElements, foundSet, foundDetails]);

//   return (
//     <aside
//       className={`fixed top-12 right-0 bottom-24 z-40 h-[calc(100vh-3rem)] w-[320px] bg-black/40 backdrop-blur border-l border-white/10 transition-transform ${
//         open ? "translate-x-0" : "translate-x-full"
//       }`}
//     >
//       {/* Toggle handle */}
//       <button
//         className="absolute -left-9 top-4 bg-black/60 px-2 py-1 rounded-l"
//         onClick={() => setOpen(!open)}
//       >
//         {open ? ">" : "<"}
//       </button>

//       <div className="h-full flex flex-col min-h-0">
//         {/* Tabs */}
//         <div className="flex">
//           <button
//             className={`flex-1 py-2 font-semibold border-b ${
//               tab === "collections" ? "border-white" : "border-white/10 opacity-60"
//             }`}
//             onClick={() => setTab("collections")}
//           >
//             Collections
//           </button>
//           <button
//             className={`flex-1 py-2 font-semibold border-b ${
//               tab === "inventory" ? "border-white" : "border-white/10 opacity-60"
//             }`}
//             onClick={() => setTab("inventory")}
//           >
//             Inventory
//           </button>
//         </div>

//         {/* Scroll area */}
//         <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-2">
//           {tab === "collections" ? (
//             <>
//               <div className="mb-2 text-xs uppercase tracking-wide opacity-70">
//                 Current&apos;s Challenge!
//               </div>

//               {challengeLoading ? (
//                 <div className="mb-4 text-sm opacity-70">Loading challenges…</div>
//               ) : challenges.length > 0 ? (
//                 <div className="grid gap-2 mb-4">
//                   {challenges.map((c) => (
//                     <div
//                       key={c.id}
//                       className="flex items-center gap-2 bg-white/50 p-2 rounded border border-white/10"
//                       title="Discover this character to complete the challenge!"
//                     >
//                       {c.image_url ? (
//                         <img
//                           src={c.image_url}
//                           alt={c.name}
//                           className="w-10 h-10 rounded silhouette"
//                         />
//                       ) : (
//                         <div className="w-10 h-10 rounded grid place-items-center bg-white/10 silhouette">
//                           <span className="text-xl">{c.emoji ?? "🧩"}</span>
//                         </div>
//                       )}
//                       <div className="text-sm">
//                         <div className="font-semibold">{obfuscateName(c.name)}</div>
//                         <div className="text-[11px] opacity-70">Find me!</div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="mb-4 text-sm opacity-80">All Found !! 🎊🎊</div>
//               )}

//               <div className="mb-2 text-sm opacity-70">Brainrot Collections</div>
//               {!foundSet ? (
//                 <div className="opacity-60 text-sm">Loading…</div>
//               ) : collections.length === 0 ? (
//                 <div className="opacity-70 text-sm">None yet.</div>
//               ) : (
//                 <div className="grid gap-2">
//                   {collections.map((b) => (
//                     <div key={b.id} className="flex items-center gap-2 bg-white/5 p-2 rounded">
//                       {b.image_url ? (
//                         <img src={b.image_url} alt={b.name} className="w-10 h-10 rounded" />
//                       ) : (
//                         <span>{b.emoji}</span>
//                       )}
//                       <div className="text-sm">
//                         <div className="font-semibold">{b.name}</div>
//                         <div className="text-xs opacity-70">
//                           ~{b.difficulty}% players discovered
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </>
//           ) : (
//             <>
//               <div className="mb-2 text-sm opacity-70">Element Inventory</div>
//               {basesLoading && baseElements.length === 0 ? (
//                 <div className="opacity-70 text-sm">Loading…</div>
//               ) : (
//                 <div className="grid grid-cols-2 gap-2">
//                   {inventory.map((e) => {
//                     const idNum = Number(e.id);
//                     return (
//                       <button
//                         key={idNum}
//                         onClick={() => onSpawn(idNum)}
//                         className="bg-white/5 p-2 rounded text-left hover:bg-white/10"
//                       >
//                         <div className="text-2xl leading-none">{e.emoji ?? "🧩"}</div>
//                         <div className="text-xs mt-1">{e.name}</div>
//                       </button>
//                     );
//                   })}
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </div>
//     </aside>
//   );
// }


// 

// "use client";

// import { useEffect, useMemo, useState, useRef } from "react";
// import { apiGetChallenges } from "@/lib/composeApi";
// import { getFoundIds, PROGRESS_EVT, removeChallengeId } from "@/lib/storage";
// import { obfuscateName } from "@/lib/text";

// import {
//   initBaseIfNeededLocal,
//   getBaseElementsLocal,
//   getElementLocal,
//   COMPOSE_CACHE_UPDATED,
// } from "@/lib/composeCache";

// type ElementDto = {
//   id: number;
//   slug: string;
//   name: string;
//   emoji?: string | null;
//   is_character: boolean;
//   is_base_element: boolean;
//   image_url?: string | null;
//   rarity?: string | null;
//   difficulty?: number | null;
// };

// type ChallengeItem = {
//   id: number;
//   name: string;
//   emoji?: string | null;
//   image_url?: string | null;
//   is_character: true;
//   rarity?: string;
//   difficulty?: number;
// };

// type Tab = "inventory" | "collections";

// export default function SidePanel({ onSpawn }: { onSpawn: (id: number) => void }) {
//   const [open, setOpen] = useState(true);
//   const [tab, setTab] = useState<Tab>("inventory");

//   const [foundSet, setFoundSet] = useState<Set<number> | null>(null);
//   const [baseElements, setBaseElements] = useState<ElementDto[]>([]);
//   const [basesLoading, setBasesLoading] = useState(false);

//   const [foundDetails, setFoundDetails] = useState<ElementDto[]>([]);
//   const [foundDetailsLoading, setFoundDetailsLoading] = useState(false);

//   const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
//   const [challengeLoading, setChallengeLoading] = useState(false);

//   // track previous character count so we know when a *new character* is discovered
//   const prevCharCountRef = useRef(0);

//   // prime cache + load bases + load found
//   useEffect(() => {
//     let alive = true;

//     const refreshBase = () => {
//       if (!alive) return;
//       setBaseElements(getBaseElementsLocal());
//     };

//     const loadFound = () => {
//       if (!alive) return;
//       setFoundSet(new Set(getFoundIds()));
//     };

//     const prime = async () => {
//       setBasesLoading(true);
//       try {
//         await initBaseIfNeededLocal(); // only pulls once
//         refreshBase();
//         loadFound();
//       } finally {
//         if (alive) setBasesLoading(false);
//       }
//     };

//     prime();

//     window.addEventListener(PROGRESS_EVT, loadFound);
//     window.addEventListener(COMPOSE_CACHE_UPDATED, refreshBase);

//     return () => {
//       alive = false;
//       window.removeEventListener(PROGRESS_EVT, loadFound);
//       window.removeEventListener(COMPOSE_CACHE_UPDATED, refreshBase);
//     };
//   }, []);

//   // resolve foundDetails from LOCAL cache whenever foundSet or cache updates
//   useEffect(() => {
//     if (!foundSet) return;
//     let cancelled = false;
//     setFoundDetailsLoading(true);

//     const fn = () => {
//       if (cancelled) return;
//       const details: ElementDto[] = [];
//       for (const id of foundSet) {
//         const el = getElementLocal(id);
//         if (el) details.push(el);
//       }
//       setFoundDetails(details);
//       setFoundDetailsLoading(false);
//     };

//     // small microtask lets any upserts settle
//     queueMicrotask(fn);

//     const onCache = fn;
//     window.addEventListener(COMPOSE_CACHE_UPDATED, onCache);
//     return () => {
//       cancelled = true;
//       window.removeEventListener(COMPOSE_CACHE_UPDATED, onCache);
//     };
//   }, [foundSet]);

//   async function refreshChallenges(fs: Set<number>) {
//     setChallengeLoading(true);
//     try {
//       const foundChars = foundDetails.filter((e) => e.is_character).map((e) => e.id);
//       const res = await apiGetChallenges(foundChars);
//       const items = (res.items ?? []).map((c: any) => ({
//         ...c,
//         id: Number(c.id),
//         is_character: true,
//       })) as ChallengeItem[];
//       setChallenges(items);
//     } catch (err) {
//       console.error("[CHALLENGES] failed:", err);
//       setChallenges([]);
//     } finally {
//       setChallengeLoading(false);
//     }
//   }

//   // ✅ Only refresh challenges when *character count* changes
//   useEffect(() => {
//     if (!foundSet) return;
//     if (foundDetailsLoading) return;

//     const chars = foundDetails.filter((d) => d.is_character && foundSet.has(d.id));
//     const currentCount = chars.length;

//     if (currentCount !== prevCharCountRef.current) {
//       prevCharCountRef.current = currentCount;
//       refreshChallenges(foundSet);
//     }
//   }, [foundSet, foundDetailsLoading, foundDetails]);

//   // ✅ Instant prune (handles dup finds without reload)
//   useEffect(() => {
//     if (!foundSet) return;
//     setChallenges((prev) => prev.filter((c) => !foundSet.has(c.id)));
//   }, [foundSet]);

//   // ✅ Optional server-side prune (no re-fetch here → no extra refresh)
//   useEffect(() => {
//     if (!foundSet || challenges.length === 0) return;
//     const newlyFound = challenges.filter((c) => foundSet.has(c.id));
//     if (newlyFound.length > 0) {
//       newlyFound.forEach((c) => removeChallengeId(c.id));
//     }
//   }, [foundSet, challenges]);

//   // derived views
//   const collections = useMemo(() => {
//     if (!foundSet) return [];
//     return foundDetails.filter((d) => d.is_character && foundSet.has(d.id));
//   }, [foundSet, foundDetails]);

//   const inventory = useMemo(() => {
//     const bases = baseElements;
//     if (!foundSet) return bases;

//     const discoveredNonChars = foundDetails.filter(
//       (d) => !d.is_character && !d.is_base_element && foundSet.has(d.id)
//     );
//     const merged = new Map<number, ElementDto>();
//     bases.forEach((b) => merged.set(b.id, b));
//     discoveredNonChars.forEach((d) => merged.set(d.id, d));
//     return [...merged.values()];
//   }, [baseElements, foundSet, foundDetails]);

//   return (
//     <aside
//       className={`fixed top-12 right-0 bottom-24 z-40 h-[calc(100vh-3rem)] w-[320px] bg-black/40 backdrop-blur border-l border-white/10 transition-transform ${
//         open ? "translate-x-0" : "translate-x-full"
//       }`}
//     >
//       {/* Toggle handle */}
//       <button
//         className="absolute -left-9 top-4 bg-black/60 px-2 py-1 rounded-l"
//         onClick={() => setOpen(!open)}
//       >
//         {open ? ">" : "<"}
//       </button>

//       <div className="h-full flex flex-col min-h-0">
//         {/* Tabs */}
//         <div className="flex">
//           <button
//             className={`flex-1 py-2 font-semibold border-b ${
//               tab === "collections" ? "border-white" : "border-white/10 opacity-60"
//             }`}
//             onClick={() => setTab("collections")}
//           >
//             Collections
//           </button>
//           <button
//             className={`flex-1 py-2 font-semibold border-b ${
//               tab === "inventory" ? "border-white" : "border-white/10 opacity-60"
//             }`}
//             onClick={() => setTab("inventory")}
//           >
//             Inventory
//           </button>
//         </div>

//         {/* Scroll area */}
//         <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-2">
//           {tab === "collections" ? (
//             <>
//               <div className="mb-2 text-xs uppercase tracking-wide opacity-70">
//                 Current&apos;s Challenge!
//               </div>

//               {challengeLoading ? (
//                 <div className="mb-4 text-sm opacity-70">Loading challenges…</div>
//               ) : challenges.length > 0 ? (
//                 <div className="grid gap-2 mb-4">
//                   {challenges.map((c) => (
//                     <div
//                       key={c.id}
//                       className="flex items-center gap-2 bg-white/50 p-2 rounded border border-white/10"
//                       title="Discover this character to complete the challenge!"
//                     >
//                       {c.image_url ? (
//                         <img
//                           src={c.image_url}
//                           alt={c.name}
//                           className="w-10 h-10 rounded silhouette"
//                         />
//                       ) : (
//                         <div className="w-10 h-10 rounded grid place-items-center bg-white/10 silhouette">
//                           <span className="text-xl">{c.emoji ?? "🧩"}</span>
//                         </div>
//                       )}
//                       <div className="text-sm">
//                         <div className="font-semibold">{obfuscateName(c.name)}</div>
//                         <div className="text-[11px] opacity-70">Find me!</div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="mb-4 text-sm opacity-80">All Found !! 🎊🎊</div>
//               )}

//               <div className="mb-2 text-sm opacity-70">Brainrot Collections</div>
//               {!foundSet ? (
//                 <div className="opacity-60 text-sm">Loading…</div>
//               ) : collections.length === 0 ? (
//                 <div className="opacity-70 text-sm">None yet.</div>
//               ) : (
//                 <div className="grid gap-2">
//                   {collections.map((b) => (
//                     <div key={b.id} className="flex items-center gap-2 bg-white/5 p-2 rounded">
//                       {b.image_url ? (
//                         <img src={b.image_url} alt={b.name} className="w-10 h-10 rounded" />
//                       ) : (
//                         <span>{b.emoji}</span>
//                       )}
//                       <div className="text-sm">
//                         <div className="font-semibold">{b.name}</div>
//                         <div className="text-xs opacity-70">
//                           ~{b.difficulty}% players discovered
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </>
//           ) : (
//             <>
//               <div className="mb-2 text-sm opacity-70">Element Inventory</div>
//               {basesLoading && baseElements.length === 0 ? (
//                 <div className="opacity-70 text-sm">Loading…</div>
//               ) : (
//                 <div className="grid grid-cols-2 gap-2">
//                   {inventory.map((e) => {
//                     const idNum = Number(e.id);
//                     return (
//                       <button
//                         key={idNum}
//                         onClick={() => onSpawn(idNum)}
//                         className="bg-white/5 p-2 rounded text-left hover:bg-white/10"
//                       >
//                         <div className="text-2xl leading-none">{e.emoji ?? "🧩"}</div>
//                         <div className="text-xs mt-1">{e.name}</div>
//                       </button>
//                     );
//                   })}
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </div>
//     </aside>
//   );
// }


"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { apiGetChallenges } from "@/lib/composeApi";
import { getFoundIds, PROGRESS_EVT, removeChallengeId } from "@/lib/storage";
import { obfuscateName } from "@/lib/text";

import {
  initBaseIfNeededLocal,
  getBaseElementsLocal,
  getElementLocal,
  COMPOSE_CACHE_UPDATED,
} from "@/lib/composeCache";

type ElementDto = {
  id: number;
  slug: string;
  name: string;
  emoji?: string | null;
  is_character: boolean;
  is_base_element: boolean;
  image_url?: string | null;
  rarity?: string | null;
  difficulty?: number | null;
};

type ChallengeItem = {
  id: number;
  name: string;
  emoji?: string | null;
  image_url?: string | null;
  is_character: true;
  rarity?: string;
  difficulty?: number;
};

type Tab = "inventory" | "collections";

export default function SidePanel({ onSpawn }: { onSpawn: (id: number) => void }) {
  const [open, setOpen] = useState(true);
  const [tab, setTab] = useState<Tab>("inventory");

  const [foundSet, setFoundSet] = useState<Set<number> | null>(null);
  const [baseElements, setBaseElements] = useState<ElementDto[]>([]);
  const [basesLoading, setBasesLoading] = useState(false);

  const [foundDetails, setFoundDetails] = useState<ElementDto[]>([]);
  const [foundDetailsLoading, setFoundDetailsLoading] = useState(false);

  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
  const [challengeLoading, setChallengeLoading] = useState(false);

  // IMPORTANT: start at -1 so first load always triggers a refresh
  const prevCharCountRef = useRef(-1);

  // prime cache + load bases + load found
  useEffect(() => {
    let alive = true;

    const refreshBase = () => {
      if (!alive) return;
      setBaseElements(getBaseElementsLocal());
    };

    const loadFound = () => {
      if (!alive) return;
      setFoundSet(new Set(getFoundIds()));
    };

    const prime = async () => {
      setBasesLoading(true);
      try {
        await initBaseIfNeededLocal(); // only pulls once
        refreshBase();
        loadFound();
      } finally {
        if (alive) setBasesLoading(false);
      }
    };

    prime();

    window.addEventListener(PROGRESS_EVT, loadFound);
    window.addEventListener(COMPOSE_CACHE_UPDATED, refreshBase);

    return () => {
      alive = false;
      window.removeEventListener(PROGRESS_EVT, loadFound);
      window.removeEventListener(COMPOSE_CACHE_UPDATED, refreshBase);
    };
  }, []);

  // resolve foundDetails from LOCAL cache whenever foundSet or cache updates
  useEffect(() => {
    if (!foundSet) return;
    let cancelled = false;
    setFoundDetailsLoading(true);

    const fn = () => {
      if (cancelled) return;
      const details: ElementDto[] = [];
      for (const id of foundSet) {
        const el = getElementLocal(id);
        if (el) details.push(el);
      }
      setFoundDetails(details);
      setFoundDetailsLoading(false);
    };

    // small microtask lets any upserts settle
    queueMicrotask(fn);

    const onCache = fn;
    window.addEventListener(COMPOSE_CACHE_UPDATED, onCache);
    return () => {
      cancelled = true;
      window.removeEventListener(COMPOSE_CACHE_UPDATED, onCache);
    };
  }, [foundSet]);

  async function refreshChallenges(fs: Set<number>) {
    setChallengeLoading(true);
    try {
      const foundChars = foundDetails.filter((e) => e.is_character).map((e) => e.id);
      const res = await apiGetChallenges(foundChars);
      const items = (res.items ?? []).map((c: any) => ({
        ...c,
        id: Number(c.id),
        is_character: true,
      })) as ChallengeItem[];
      setChallenges(items);
    } catch (err) {
      console.error("[CHALLENGES] failed:", err);
      setChallenges([]);
    } finally {
      setChallengeLoading(false);
    }
  }

  // ✅ Only refresh challenges when *character count* changes
  //    First run: prevCharCountRef = -1, currentCount = 0 → triggers.
  useEffect(() => {
    if (!foundSet) return;
    if (foundDetailsLoading) return;

    const chars = foundDetails.filter((d) => d.is_character && foundSet.has(d.id));
    const currentCount = chars.length;

    if (currentCount !== prevCharCountRef.current) {
      prevCharCountRef.current = currentCount;
      refreshChallenges(foundSet);
    }
  }, [foundSet, foundDetailsLoading, foundDetails]);

  // ✅ Instant prune (handles dup finds without reload)
  useEffect(() => {
    if (!foundSet) return;
    setChallenges((prev) => prev.filter((c) => !foundSet.has(c.id)));
  }, [foundSet]);

  // ✅ Optional server-side prune (no re-fetch here → no extra refresh)
  useEffect(() => {
    if (!foundSet || challenges.length === 0) return;
    const newlyFound = challenges.filter((c) => foundSet.has(c.id));
    if (newlyFound.length > 0) {
      newlyFound.forEach((c) => removeChallengeId(c.id));
    }
  }, [foundSet, challenges]);

  // derived views
  const collections = useMemo(() => {
    if (!foundSet) return [];
    return foundDetails.filter((d) => d.is_character && foundSet.has(d.id));
  }, [foundSet, foundDetails]);

  const inventory = useMemo(() => {
    const bases = baseElements;
    if (!foundSet) return bases;

    const discoveredNonChars = foundDetails.filter(
      (d) => !d.is_character && !d.is_base_element && foundSet.has(d.id)
    );
    const merged = new Map<number, ElementDto>();
    bases.forEach((b) => merged.set(b.id, b));
    discoveredNonChars.forEach((d) => merged.set(d.id, d));
    return [...merged.values()];
  }, [baseElements, foundSet, foundDetails]);

  return (
    <aside
      className={`fixed top-12 right-0 bottom-24 z-40 h-[calc(100vh-3rem)] w-[320px] bg-black/40 backdrop-blur border-l border-white/10 transition-transform ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Toggle handle */}
      <button
        className="absolute -left-9 top-4 bg-black/60 px-2 py-1 rounded-l"
        onClick={() => setOpen(!open)}
      >
        {open ? ">" : "<"}
      </button>

      <div className="h-full flex flex-col min-h-0">
        {/* Tabs */}
        <div className="flex">
          <button
            className={`flex-1 py-2 font-semibold border-b ${
              tab === "collections" ? "border-white" : "border-white/10 opacity-60"
            }`}
            onClick={() => setTab("collections")}
          >
            Collections
          </button>
          <button
            className={`flex-1 py-2 font-semibold border-b ${
              tab === "inventory" ? "border-white" : "border-white/10 opacity-60"
            }`}
            onClick={() => setTab("inventory")}
          >
            Inventory
          </button>
        </div>

        {/* Scroll area */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-2">
          {tab === "collections" ? (
            <>
              <div className="mb-2 text-xs uppercase tracking-wide opacity-70">
                Current&apos;s Challenge!
              </div>

              {challengeLoading ? (
                <div className="mb-4 text-sm opacity-70">Loading challenges…</div>
              ) : challenges.length > 0 ? (
                <div className="grid gap-2 mb-4">
                  {challenges.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center gap-2 bg-white/50 p-2 rounded border border-white/10"
                      title="Discover this character to complete the challenge!"
                    >
                      {c.image_url ? (
                        <img
                          src={c.image_url}
                          alt={c.name}
                          className="w-10 h-10 rounded silhouette"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded grid place-items-center bg-white/10 silhouette">
                          <span className="text-xl">{c.emoji ?? "🧩"}</span>
                        </div>
                      )}
                      <div className="text-sm">
                        <div className="font-semibold">{obfuscateName(c.name)}</div>
                        <div className="text-[11px] opacity-70">Find me!</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mb-4 text-sm opacity-80">All Found !! 🎊🎊</div>
              )}

              <div className="mb-2 text-sm opacity-70">Brainrot Collections</div>
              {!foundSet ? (
                <div className="opacity-60 text-sm">Loading…</div>
              ) : collections.length === 0 ? (
                <div className="opacity-70 text-sm">None yet.</div>
              ) : (
                <div className="grid gap-2">
                  {collections.map((b) => (
                    <div key={b.id} className="flex items-center gap-2 bg-white/5 p-2 rounded">
                      {b.image_url ? (
                        <img src={b.image_url} alt={b.name} className="w-10 h-10 rounded" />
                      ) : (
                        <span>{b.emoji}</span>
                      )}
                      <div className="text-sm">
                        <div className="font-semibold">{b.name}</div>
                        <div className="text-xs opacity-70">
                          ~{b.difficulty}% players discovered
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="mb-2 text-sm opacity-70">Element Inventory</div>
              {basesLoading && baseElements.length === 0 ? (
                <div className="opacity-70 text-sm">Loading…</div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {inventory.map((e) => {
                    const idNum = Number(e.id);
                    return (
                      <button
                        key={idNum}
                        onClick={() => onSpawn(idNum)}
                        className="bg-white/5 p-2 rounded text-left hover:bg-white/10"
                      >
                        <div className="text-2xl leading-none">{e.emoji ?? "🧩"}</div>
                        <div className="text-xs mt-1">{e.name}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
