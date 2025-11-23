

// src/components/ElementCard.tsx
"use client";
import { Element } from "@/lib/types";
export default function ElementCard({ el, onPointerDown, className }: {
  el: Element; onPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void; className?: string;
}) {
  return (
    <div
      onPointerDown={onPointerDown}
      className={"select-none cursor-grab active:cursor-grabbing rounded-lg bg-white/10 px-3 py-2 shadow " + (className ?? "")}
      data-element-id={el.id}
    >
      <div className="flex items-center gap-2">
        <div className="text-2xl leading-none">
          {el.is_character && el.image_url ? (
            <img src={el.image_url} alt={el.name} className="w-8 h-8 rounded" />
          ) : (el.emoji ?? "🧩")}
        </div>
        <div className="text-sm">{el.name}</div>
      </div>
    </div>
  );
}
