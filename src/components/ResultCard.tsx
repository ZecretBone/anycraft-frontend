import { Element } from "@/lib/types";

export default function ResultCard({ e }: { e: Element }) {
  return (
    <div className="mt-4 p-4 rounded bg-white/85 text-black shadow">
      <div className="flex items-center gap-3">
        {e.is_character && e.image_url ? (
          <img src={e.image_url} alt={e.name} className="w-14 h-14 rounded"/>
        ) : (
          <div className="text-4xl">{e.emoji ?? "🧩"}</div>
        )}
        <div>
          <div className="font-bold">{e.name}</div>
          {e.is_character && <div className="text-xs opacity-70">Discovered by ~{e.difficulty} %</div>}
        </div>
      </div>
    </div>
  );
}
