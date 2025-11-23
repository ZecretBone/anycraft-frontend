// "use client";
// import { useState } from "react";
// import Header from "@/components/Header";
// import CraftingScene from "@/components/CraftingScene";
// import SidePanel from "@/components/SidePanel";
// import FooterAd from "@/components/FooterAd";

// export default function BrainrotPage() {
//   const [spawnId, setSpawnId] = useState<number>();
//   return (
//     <>
//       <Header />
//       <CraftingScene spawnFromPanel={spawnId} />
//       <SidePanel onSpawn={(id)=>setSpawnId(id)} />
//       <div className="h-24" />
//       <FooterAd />
//     </>
//   );
// }


"use client";
import { useState } from "react";
import Header from "@/components/Header";
import CraftingScene from "@/components/CraftingScene";
import SidePanel from "@/components/SidePanel";
import FooterAd from "@/components/FooterAd";
import Squares from "./Squares";
import PixelBlast from './PixelBlast';

import Image from "next/image";

type SpawnRequest = { id: number; token: string };

export default function BrainrotPage() {
  // const [spawnId, setSpawnId] = useState<number>();
  const [spawnReq, setSpawnReq] = useState<SpawnRequest | undefined>();

  return (
    <div className="relative min-h-screen bg-black text-white pb-[80px]">

  {/* Squares fixed background */}
  {/* <div className="fixed inset-0 pointer-events-none z-0">
    <Squares
      speed={0.1}
      squareSize={80}
      direction="diagonal"
      borderColor="#ffffff33"
      hoverFillColor="#f70909ff"
    />
  </div> */}

  <div className="fixed inset-0 pointer-events-none z-0">
  <PixelBlast
          variant="circle"
          pixelSize={10}
          color="#B19EEF"
          patternScale={2}
          patternDensity={0.2}
          pixelSizeJitter={1.8}
          enableRipples={false}
          rippleSpeed={0.4}
          rippleThickness={0.12}
          rippleIntensityScale={1.5}
          liquid={false}
          liquidStrength={0.12}
          liquidRadius={1.2}
          liquidWobbleSpeed={5}
          speed={0.2}
          edgeFade={0.3}
          transparent className={undefined} style={undefined}  />
</div>

  {/* Foreground */}
  <div className="relative z-10">
    <Header />
    <CraftingScene spawnRequest={spawnReq} />
         <SidePanel
          onSpawn={(id) =>
            
            setSpawnReq({ id, token: crypto.randomUUID() }) // ✅ unique per click
            
           }
         />
         <Image
        src="/img/tung-tung-tung-sahur.png"
        alt="Tung"
        width={300} // adjust size as needed
        height={300}
        className="fixed bottom-28 left-6 z-20 select-none pointer-events-none"
      />
      <Image
  src="/img/flyer.png"
  alt="Flying plane"
  width={140}
  height={140}
  className="fly-across"
/>

    <FooterAd />
  </div>
</div>

  );
}


// "use client";
// import { useState } from "react";
// import Header from "@/components/Header";
// import CraftingScene from "@/components/CraftingScene";
// import SidePanel from "@/components/SidePanel";
// import FooterAd from "@/components/FooterAd";
// import Image from "next/image";

// type SpawnRequest = { id: number; token: string };

// export default function BrainrotPage() {
//   const [spawnReq, setSpawnReq] = useState<SpawnRequest | undefined>();

//   return (
//     <div
//       className="relative min-h-screen bg-cover bg-center bg-no-repeat text-white"
//       style={{ backgroundImage: "url('/img/bg.png')" }}
//     >
//       <Header />
//       <CraftingScene spawnRequest={spawnReq} />
//       <SidePanel
//         onSpawn={(id) =>
//           setSpawnReq({ id, token: crypto.randomUUID() })
//         }
//       />

//       {/* foreground decorations */}
//       <Image
//         src="/img/tung-tung-sahur.png"
//         alt="Tung"
//         width={300}
//         height={300}
//         className="fixed bottom-28 left-6 z-20 select-none pointer-events-none"
//       />
//       <Image
//         src="/img/bombardino-crocodilo.png"
//         alt="Flying plane"
//         width={140}
//         height={140}
//         className="fly-across"
//       />

//       <FooterAd />
//     </div>
//   );
// }
