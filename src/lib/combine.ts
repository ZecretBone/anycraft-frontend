// import allElements from "@/data/elements.json";
// import recipes from "@/data/recipes.json";
// import type { Element, Recipes } from "./types";

// const EL = new Map<number, Element>(allElements.map(e => [e.id, e]));
// const REC = recipes as Recipes;

// export function getElement(id: number) {
//   return EL.get(id);
// }

// export function baseElements(): Element[] {
//   return allElements.filter(e => e.id <= 8);
// }

// export function combineLocal(aId: number, bId: number): Element | null {
//   const min = Math.min(aId, bId);
//   const max = Math.max(aId, bId);
//   console.log('min: ',min)
//   console.log('max: ',max)
//   const key = `${min}+${max}`;
//   console.log('key: ',key)
//   const r = REC[key];
//   console.log('re: ',r)
//   return r ? (EL.get(r.result_id) || null) : null;
// }
