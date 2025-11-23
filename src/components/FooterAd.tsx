// import GoogleAd from "./GoogleAd";

// export default function FooterAd() {
//   return (
//     <footer className="fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur border-t border-white/10">
//       <div className="max-w-5xl mx-auto px-3 py-2">
//         <GoogleAd slot="1234567890" />
//       </div>
//     </footer>
//   );
// }

import GoogleAd from "./GoogleAd";

export default function FooterAd() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur border-t border-white/10">
      <div className="max-w-5xl mx-auto px-3 py-2">
        <GoogleAd slot="1234567890" />
      </div>
    </footer>
  );
}
