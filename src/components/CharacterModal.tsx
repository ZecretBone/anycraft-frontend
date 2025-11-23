

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
