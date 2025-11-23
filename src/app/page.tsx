// import Image from "next/image";

// export default function Home() {
//   return (
//     <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
//       <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
//         <Image
//           className="dark:invert"
//           src="/next.svg"
//           alt="Next.js logo"
//           width={100}
//           height={20}
//           priority
//         />
//         <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
//           <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
//             To get started, edit the page.tsx file.
//           </h1>
//           <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
//             Looking for a starting point or more instructions? Head over to{" "}
//             <a
//               href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               className="font-medium text-zinc-950 dark:text-zinc-50"
//             >
//               Templates
//             </a>{" "}
//             or the{" "}
//             <a
//               href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               className="font-medium text-zinc-950 dark:text-zinc-50"
//             >
//               Learning
//             </a>{" "}
//             center.
//           </p>
//         </div>
//         <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
//           <a
//             className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className="dark:invert"
//               src="/vercel.svg"
//               alt="Vercel logomark"
//               width={16}
//               height={16}
//             />
//             Deploy Now
//           </a>
//           <a
//             className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Documentation
//           </a>
//         </div>
//       </main>
//     </div>
//   );
// }


// app/page.tsx (or wherever your Home component lives)
"use client";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-zinc-50 font-sans text-black dark:bg-black dark:text-zinc-50">
      <main className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        {/* 2-column layout on md+, stacked on mobile */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-14">
          {/* Left: Title */}
          <section className="flex flex-col justify-center">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
              ANYCRAFT
            </h1>
            <p className="mt-4 max-w-prose text-lg text-zinc-700 dark:text-zinc-400">
              {/* Suggested subtitle — change anytime */}
              Combine elements. Unlock surprises.
            </p>
          </section>

          {/* Right: List of experiences/projects */}
          <section className="flex flex-col gap-4">
            <h2 className="text-sm uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Experiences
            </h2>

            {/* Brainrot Craft card */}
            <div className="flex items-center gap-4 rounded-xl border border-black/10 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-white/15 dark:bg-zinc-900">
              <div className="relative h-16 w-16 overflow-hidden rounded-lg">
                <Image
                  src="/img/brainrot.png"
                  alt="Brainrot Craft thumbnail"
                  fill
                  sizes="64px"
                  className="object-cover"
                  priority
                />
              </div>

              <div className="flex flex-1 flex-col">
                <div className="text-base font-semibold">Brainrot Craft</div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  Mix, match, and discover brainrot characters.
                </div>
              </div>

              <Link
                href="/brainrot"
                className="inline-flex items-center justify-center rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black dark:hover:bg-white"
              >
                TRY
              </Link>
            </div>

            {/* Add future items here as more modes/projects are ready */}
          </section>
        </div>
      </main>
    </div>
  );
}

