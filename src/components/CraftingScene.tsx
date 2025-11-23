


"use client";

import * as React from "react";
import { apiCombine } from "@/lib/composeApi";
import { addFoundId } from "@/lib/storage";
import { CLEAR_SCENE_EVT } from "@/lib/events";
import ElementCard from "./ElementCard";
import CharacterModal from "./CharacterModal";

import {
  initBaseIfNeededLocal,
  upsertElementLocal,
  getElementLocal,
} from "@/lib/composeCache";

import { preloadSfx, playSfx } from "@/lib/sfx";

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

type Spawned = {
  id: string;
  elementId: number;
  x: number;
  y: number;
  shake?: boolean;
};

type SpawnRequest = { id: number; token: string };

const HOLD_MS = 600;
const CARD_W  = 140;
const CARD_H  = 64;

function clampToStage(stage: HTMLDivElement | null, x:number, y:number) {
  if (!stage) return { x, y };
  const s = stage.getBoundingClientRect();
  const minX = 0, minY = 0;
  const maxX = Math.max(0, s.width - CARD_W);
  const maxY = Math.max(0, s.height - CARD_H);
  return {
    x: Math.min(Math.max(x, minX), maxX),
    y: Math.min(Math.max(y, minY), maxY),
  };
}

export default function CraftingScene({ spawnRequest }: { spawnRequest?: SpawnRequest }) {
  const stageRef = React.useRef<HTMLDivElement>(null);

  const [cards, setCards] = React.useState<Spawned[]>([]);
  const [modalChar, setModalChar] = React.useState<ElementDto | undefined>();
  const [holdUI, setHoldUI] = React.useState<{ x:number; y:number; pct:number } | null>(null);
  const [failBadge, setFailBadge] = React.useState<{ x:number; y:number } | null>(null);

  const isCombiningRef = React.useRef(false);
  const dragRef = React.useRef<{
    spawnId: string;
    pointerId: number;
    startX: number;
    startY: number;
    startPos: { x:number; y:number };
  } | null>(null);
  const holdRef = React.useRef<{ targetId?: string; tId?: number; startTs?: number } | null>(null);

  // Prime base and SFX once
  React.useEffect(() => {
    (async () => {
      await initBaseIfNeededLocal();
      preloadSfx();
    })();
  }, []);

  // React.useEffect(() => {
  //   if (!spawnRequest) return;
  //   const exists = getElementLocal(spawnRequest.id);
  //   if (!exists) return;
  //   setCards(prev => [
  //     ...prev,
  //     {
  //       id: crypto.randomUUID(),
  //       elementId: spawnRequest.id,
  //       x: 100 + prev.length * 18,
  //       y: 140 + prev.length * 18,
  //     },
  //   ]);
  // }, [spawnRequest?.token]);

  React.useEffect(() => {
  if (!spawnRequest) return;
  const exists = getElementLocal(spawnRequest.id);
  if (!exists) return;

  setCards(prev => {
    // index of the card we're about to add
    const idx = prev.length;

    // Wrap every 10 items vertically, then start a new column
    const row = idx % 10;                  // 0..9
    const col = Math.floor(idx / 10);      // 0,1,2,...

    // Base spacing
    const colGap = CARD_W + 24;            // column spacing
    const rowGap = 18;                     // row spacing

    // Compute desired position then clamp to stage
    const desiredX = 100 + col * colGap;
    const desiredY = 140 + row * rowGap;
    const pos = clampToStage(stageRef.current, desiredX, desiredY);

    return [
      ...prev,
      {
        id: crypto.randomUUID(),
        elementId: spawnRequest.id,
        x: pos.x,
        y: pos.y,
      },
    ];
  });
  // depend on token so clicking same element twice works
}, [spawnRequest?.token]);


  React.useEffect(() => {
    const handler = () => setCards([]);
    window.addEventListener(CLEAR_SCENE_EVT, handler);
    return () => window.removeEventListener(CLEAR_SCENE_EVT, handler);
  }, []);

  function getSpawnEl(id:string) {
    return stageRef.current?.querySelector(`[data-spawn-id="${id}"]`) as HTMLElement | null;
  }
  const rect = (el: HTMLElement | null) => el?.getBoundingClientRect();
  const center = (r: DOMRect) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
  const hit = (a: DOMRect, b: DOMRect) =>
    !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);

  function removeCards(ids: string[]) {
    setCards(prev => prev.filter(c => !ids.includes(c.id)));
  }

  function addCard(elId: number, near?: { x:number; y:number }) {
    const pos = near ? clampToStage(stageRef.current, near.x, near.y) : { x: 220, y: 180 };
    setCards(prev => [...prev, { id: crypto.randomUUID(), elementId: elId, x: pos.x, y: pos.y }]);
  }

  async function attemptCombineLocked(sourceId: string, targetId: string) {
    if (isCombiningRef.current) return;
    isCombiningRef.current = true;

    try {
      const s = cards.find(c => c.id === sourceId);
      const t = cards.find(c => c.id === targetId);
      if (!s || !t) return;

      const res = await apiCombine(s.elementId, t.elementId);
      setHoldUI(null);

      if (!res || !res.result) {
        // FAIL feedback + sound
        const se = getSpawnEl(sourceId);
        const te = getSpawnEl(targetId);
        const sr = rect(se);
        const tr = rect(te);
        if (sr && tr) {
          const mid = { x: (sr.left + tr.left)/2, y: (sr.top + tr.top)/2 };
          setFailBadge({ x: mid.x - 14, y: mid.y - 14 });
          setTimeout(() => setFailBadge(null), 700);
        }
        setCards(prev => prev.map(c => c.id === sourceId ? { ...c, shake: true } : c));
        setTimeout(() =>
          setCards(prev => prev.map(c => c.id === sourceId ? { ...c, shake: false } : c))
        , 500);

        playSfx("failsfx");
        return;
      }

      // SUCCESS → SFX varies by result type
      const result = res.result as ElementDto;

      // keep local cache + progress in sync
      upsertElementLocal(result, true);
      addFoundId(result.id);

      // play SFX
      if (result.is_character) {
        playSfx("charsfx");
      } else {
        playSfx("normalsfx");
      }

      // update stage cards
      removeCards([sourceId, targetId]);

      if (result.is_character) {
        setModalChar(result);
      } else {
        const se = getSpawnEl(sourceId);
        const te = getSpawnEl(targetId);
        const sr = rect(se);
        const tr = rect(te);
        const mid = (sr && tr) ? { x: (sr.left + tr.left)/2, y: (sr.top + tr.top)/2 } : undefined;
        if (mid) addCard(result.id, mid); else addCard(result.id);
      }
    } catch (e) {
      console.error("[combine] failed:", e);
    } finally {
      if (holdRef.current?.tId) {
        clearTimeout(holdRef.current.tId);
        holdRef.current = null;
      }
      isCombiningRef.current = false;
    }
  }

  function onPointerDown(e: React.PointerEvent, spawnId: string) {
    const draggable = e.currentTarget as HTMLElement;
    draggable.setPointerCapture(e.pointerId);

    const start = cards.find(c => c.id === spawnId)!;
    dragRef.current = {
      spawnId,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startPos: { x: start.x, y: start.y },
    };

    const onMove = (ev: PointerEvent) => {
      if (!dragRef.current || ev.pointerId !== dragRef.current.pointerId) return;

      const dx = ev.clientX - dragRef.current.startX;
      const dy = ev.clientY - dragRef.current.startY;
      const base = dragRef.current.startPos;
      const next = clampToStage(stageRef.current, base.x + dx, base.y + dy);

      setCards(prev => prev.map(c => c.id === spawnId ? { ...c, x: next.x, y: next.y } : c));

      const stage = stageRef.current!;
      const dragged = stage.querySelector(`[data-spawn-id="${spawnId}"]`) as HTMLElement | null;
      const db = rect(dragged); if (!db) return;

      const all = Array.from(stage.querySelectorAll("[data-spawn-id]")) as HTMLElement[];
      const targets = all.filter(n => n.dataset.spawnId !== spawnId);
      const centerPt = (r: DOMRect) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
      const dbCenter = centerPt(db);
      let best: { id:string; dist:number; r:DOMRect } | undefined;

      for (const t of targets) {
        const rb = (t as HTMLElement).getBoundingClientRect();
        const overlap = !(db.right < rb.left || db.left > rb.right || db.bottom < rb.top || db.top > rb.bottom);
        if (overlap) {
          const tc = centerPt(rb);
          const dist = Math.hypot(dbCenter.x - tc.x, dbCenter.y - tc.y);
          if (!best || dist < best.dist) best = { id: (t as any).dataset.spawnId!, dist, r: rb };
        }
      }

      if (best) {
        if (holdRef.current?.targetId !== best.id) {
          if (holdRef.current?.tId) clearTimeout(holdRef.current.tId);
          const startTs = Date.now();

          const ringTick = () => {
            const elapsed = Date.now() - startTs;
            const pct = Math.min(100, (elapsed / HOLD_MS) * 100);
            setHoldUI({ x: best!.r.left + best!.r.width/2 - 18, y: best!.r.top - 42, pct });
            if (pct < 100 && holdRef.current?.targetId === best!.id) {
              requestAnimationFrame(ringTick);
            }
          };
          requestAnimationFrame(ringTick);

          const tId = window.setTimeout(() => {
            setHoldUI(null);
            attemptCombineLocked(spawnId, best!.id);
          }, HOLD_MS);

          holdRef.current = { targetId: best.id, tId, startTs };
        }
      } else {
        if (holdRef.current?.tId) {
          clearTimeout(holdRef.current.tId);
          holdRef.current = null;
        }
        setHoldUI(null);
      }
    };

    const endDrag = (ev?: Event) => {
      if (ev instanceof PointerEvent) {
        if (!dragRef.current || ev.pointerId !== dragRef.current.pointerId) return;
      }
      try {
        if (dragRef.current) {
          (draggable as HTMLElement).releasePointerCapture(dragRef.current.pointerId);
        }
      } catch {}

      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", endDrag as any);
      window.removeEventListener("pointercancel", endDrag as any);
      window.removeEventListener("mouseup", endDrag as any);
      window.removeEventListener("blur", endDrag as any);
      (draggable as HTMLElement).removeEventListener("lostpointercapture", endDrag as any);

      if (holdRef.current?.tId) {
        clearTimeout(holdRef.current.tId);
        holdRef.current = null;
      }
      setHoldUI(null);

      dragRef.current = null;
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", endDrag as any);
    window.addEventListener("pointercancel", endDrag as any);
    window.addEventListener("mouseup", endDrag as any);
    window.addEventListener("blur", endDrag as any);
    (draggable as HTMLElement).addEventListener("lostpointercapture", endDrag as any);
  }

  return (
    <>
      <section className="pt-16 pr-[320px] pl-4 min-h-screen">
        <div
          ref={stageRef}
          className="relative mx-auto max-w-4xl min-h-[72vh] rounded-xl bg-black/80 border border-white/10 overflow-hidden"
        >
          {cards.map((c) => (
            <div
              key={c.id}
              data-spawn-id={c.id}
              style={{ transform: `translate(${c.x}px, ${c.y}px)` }}
              className="absolute"
            >
              <div onPointerDown={(e) => onPointerDown(e, c.id)} className={c.shake ? "shake" : ""}>
                <ElementCard el={(getElementLocal(c.elementId) ?? { id: c.elementId }) as any} />
              </div>
            </div>
          ))}

          {cards.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center opacity-60 text-white/80 text-sm">
              Open <b className="mx-1">Inventory</b>, spawn two elements, then drag and hold one over the other to craft.
            </div>
          )}

          {holdUI && (
            <div
              className="ring"
              style={{
                left: holdUI.x,
                top: holdUI.y,
                // @ts-ignore
                "--pct": `${holdUI.pct}%`,
              }}
            />
          )}

          {failBadge && (
            <div className="fail-badge" style={{ left: failBadge.x, top: failBadge.y }}>
              ✖
            </div>
          )}
        </div>
      </section>

      <CharacterModal
        open={!!modalChar}
        character={modalChar as any}
        onClose={() => setModalChar(undefined)}
      />
    </>
  );
}
