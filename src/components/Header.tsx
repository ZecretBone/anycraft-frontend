// export default function Header() {
//   return (
//     <header className="fixed top-0 left-0 right-0 z-50 h-12 flex items-center px-4 bg-black/40 backdrop-blur border-b border-white/10">
//       <div className="font-bold">🧠 Brainrot Craft</div>
//     </header>
//   );
// }


// "use client";

// import { requestClearScene } from "@/lib/events";
// import { clearFoundProgress } from "@/lib/storage";
// import Shuffle from './Shuffle';
// import SplitText from "./SplitText";

// // const handleAnimationComplete = () => {
// //   console.log('All letters have animated!');
// // };



// export default function Header() {
//   function onClearScene() {
//     requestClearScene();
//   }
//   function onResetProgress() {
//     if (confirm("Reset discovered elements & collections on this device?")) {
//       clearFoundProgress();
//       requestClearScene(); // optional: also clear the scene
//     }
//   }

//   return (
//     <header className="fixed top-0 left-0 right-0 z-50 h-12 flex items-center px-4 bg-black/50 text-white backdrop-blur border-b border-white/10">


//         <SplitText
//   text="Brainrot Craft"
//   className="text-2xl font-semibold text-center"
//   delay={100}
//   duration={0.6}
//   ease="power3.out"
//   splitType="chars"
//   from={{ opacity: 0, y: 40 }}
//   to={{ opacity: 1, y: 0 }}
//   threshold={0.1}
//   rootMargin="-100px"
//   textAlign="center"
//   onLetterAnimationComplete={null}
// />

//       {/* Controls (right) */}
//       <div className="ml-auto flex items-center gap-2">
//         <button
//           onClick={onClearScene}
//           className="px-3 py-1 text-sm rounded bg-white/80 text-black hover:bg-white"
//           title="Remove all cards in crafting scene"
//         >
//           Clear Scene
//         </button>
//         <button
//           onClick={onResetProgress}
//           className="px-3 py-1 text-sm rounded bg-red-500/90 text-white hover:bg-red-500"
//           title="Reset discovered elements & collections (local)"
//         >
//           Reset Progress
//         </button>
//       </div>
//     </header>
//   );
// }


"use client";

import { requestClearScene } from "@/lib/events";
import { clearFoundProgress,clearFoundProgressX } from "@/lib/storage";
import SplitText from "./SplitText";
import { useEffect, useState } from "react";
import { isSfxMuted, setSfxMuted, SFX_MUTE_CHANGED, preloadSfx } from "@/lib/sfx";

export default function Header() {
  const [muted, setMuted] = useState<boolean>(false);

  useEffect(() => {
    // Initialize from saved state + ensure audio elements are ready
    setMuted(isSfxMuted());
    preloadSfx();

    const onChange = () => setMuted(isSfxMuted());
    window.addEventListener(SFX_MUTE_CHANGED, onChange);
    return () => window.removeEventListener(SFX_MUTE_CHANGED, onChange);
  }, []);

  function onClearScene() {
    requestClearScene();
  }

  function onResetProgress() {
    if (confirm("Reset discovered elements & collections on this device?")) {
      clearFoundProgress();
      requestClearScene(); // optional: also clear the scene
    }
  }

  function toggleMute() {
    setSfxMuted(!muted);
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-12 flex items-center px-4 bg-black/50 text-white backdrop-blur border-b border-white/10">
      <SplitText
        text="Brainrot Craft"
        className="text-2xl font-semibold text-center"
        delay={100}
        duration={0.6}
        ease="power3.out"
        splitType="chars"
        from={{ opacity: 0, y: 40 }}
        to={{ opacity: 1, y: 0 }}
        threshold={0.1}
        rootMargin="-100px"
        textAlign="center"
        onLetterAnimationComplete={null}
      />

      {/* Controls (right) */}
      <div className="ml-auto flex items-center gap-2">
        {/* 🔊 Speaker toggle */}
        <button
          onClick={toggleMute}
          className="px-2 py-1 text-sm rounded bg-white/10 hover:bg-white/20 flex items-center gap-2"
          title={muted ? "Unmute SFX" : "Mute SFX"}
          aria-label={muted ? "Unmute SFX" : "Mute SFX"}
        >
          {muted ? (
            // Speaker Off Icon (inline SVG)
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 9v6h4l5 4V5L7 9H3z" fill="currentColor" opacity=".7"/>
              <path d="M16 9l5 5m0-5l-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          ) : (
            // Speaker Icon (inline SVG)
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 9v6h4l5 4V5L7 9H3z" fill="currentColor" opacity=".9"/>
              <path d="M16 7a5 5 0 010 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M18.5 5a8 8 0 010 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".8"/>
            </svg>
          )}
          <span className="text-xs opacity-80">{muted ? "Muted" : "SFX"}</span>
        </button>

        <button
          onClick={onClearScene}
          className="px-3 py-1 text-sm rounded bg-white/80 text-black hover:bg-white"
          title="Remove all cards in crafting scene"
        >
          Clear Scene
        </button>
        <button
          onClick={onResetProgress}
          className="px-3 py-1 text-sm rounded bg-red-500/90 text-white hover:bg-red-500"
          title="Reset discovered elements & collections (local)"
        >
          Reset Progress
        </button>
      </div>
    </header>
  );
}
