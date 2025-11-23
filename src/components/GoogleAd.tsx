// "use client";
// import { useEffect } from "react";

// export default function GoogleAd({ slot }: { slot: string }) {
//   useEffect(() => {
//     // @ts-ignore
//     (window.adsbygoogle = window.adsbygoogle || []).push({});
//   }, []);
//   return (
//     <ins
//       className="adsbygoogle"
//       style={{ display: "block", width: "100%", minHeight: 90 }}
//       data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
//       data-ad-slot={slot}
//       data-ad-format="auto"
//       data-full-width-responsive="true"
//     />
//   );
// }

// "use client";
// import { useEffect } from "react";

// const AD_CLIENT = "ca-pub-2110509679283065";

// export default function GoogleAd({ slot }: { slot: string }) {
//   useEffect(() => {
//     try {
//       // @ts-ignore
//       (window.adsbygoogle = window.adsbygoogle || []).push({});
//     } catch (e) {
//       console.warn("Adsense error:", e);
//     }
//   }, []);

//   return (
//     <ins
//       className="adsbygoogle"
//       style={{ display: "block", width: "100%", minHeight: 90 }}
//       data-ad-client={AD_CLIENT}
//       data-ad-slot={slot}
//       data-ad-format="auto"
//       data-full-width-responsive="true"
//     />
//   );
// }

"use client";
import { useEffect } from "react";

const AD_CLIENT = "ca-pub-2110509679283065";

export default function GoogleAd({ slot }: { slot: string }) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.warn("Adsense error:", e);
    }
  }, []);

  return (
    // Fixed-height container so footer doesn’t blow up
    <div className="w-full h-[90px] overflow-hidden flex items-center justify-center">
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%", height: "90px" }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

