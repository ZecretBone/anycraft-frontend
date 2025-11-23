// "use client";
// import { Element } from "@/lib/types";

// export default function CharacterModal({
//   open,
//   character,
//   onClose
// }: {
//   open: boolean;
//   character?: Element;
//   onClose: () => void;
// }) {
//   if (!open || !character) return null;
//   return (
//     <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70">
//       <div className="w-[min(92vw,420px)] rounded-xl bg-white text-black shadow-lg overflow-hidden">
//         <div className="p-4 flex items-center gap-3">
//           {character.image_url ? (
//             <img
//               src={character.image_url}
//               alt={character.name}
//               className="w-14 h-14 rounded"
//             />
//           ) : (
//             <div className="text-4xl">{character.emoji ?? "🧩"}</div>
//           )}
//           <div>
//             <div className="font-bold">{character.name}</div>
//             <div className="text-xs opacity-70">
//               Discovered by ~— % of players
//             </div>
//           </div>
//           <button
//             onClick={onClose}
//             className="ml-auto px-3 py-1 rounded bg-black text-white"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// src/components/CharacterModal.tsx
"use client";
import ProfileCard from "./ProfileCard"; // or dynamic import from react-bits
import { Element } from "@/types/compose";

export default function CharacterModal({
  open,
  character,
  onClose
}: {
  open: boolean;
  character?: Element;
  onClose: () => void;
}) {
  if (!open || !character) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70">
      <div className="w-[min(92vw,420px)]">
        {/* <ProfileCard
                  name={character.name}
                  title="Legendary"
                  handle="anycraft"
                  status="Discovered!"
                  contactText="Close"
                  avatarUrl={character.image_url ?? "/img/placeholder.png"}
                  showUserInfo={true}
                  enableTilt={true}
                  enableMobileTilt={true}
                  onContactClick={onClose} behindGradient={undefined} innerGradient={undefined} miniAvatarUrl={undefined}        /> */}
                  <ProfileCard
                  name={character.name}
                  title={character.rarity!}
                  handle={character.name}
                  status={character.rarity!}
                  contactText="Close"
                  avatarUrl={character.image_url ?? "/img/placeholder.png"}
                  showUserInfo={true}
                  enableTilt={true}
                  enableMobileTilt={true}
                  onContactClick={onClose} behindGradient={undefined} innerGradient={undefined} miniAvatarUrl={undefined}        />
        <div className="mt-2 text-center text-xs text-white/80">
          Discovered by ~{character.difficulty}% of players
        </div>
      </div>
    </div>
  );
}
