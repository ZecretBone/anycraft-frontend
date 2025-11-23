import { combineLocal } from "./combine";
import type { Element } from "./types";

// When backend exists, switch to real fetch:
// export async function combineRemote(gameId:number, a:number, b:number): Promise<Element|null> {
//   const res = await fetch(`${process.env.NEXT_PUBLIC_API}/api/combine`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ game_id: gameId, parenta_id: a, parentb_id: b })
//   });
//   const json = await res.json();
//   return json.ok ? json.result as Element : null;
// }

export async function combine(gameId:number, a:number, b:number): Promise<Element|null> {
  // MVP: local mock. Later swap to combineRemote.
  return Promise.resolve(combineLocal(a,b));
}
