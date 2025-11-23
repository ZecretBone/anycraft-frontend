// import { requestJSON } from './http';
// import type {
//   BaseElementsResponse,
//   ChallengesRequest,
//   ChallengesResponse,
//   CombineRequest,
//   CombineResponse,
//   Element,
// } from '@/types/compose';

// const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';
// const GAME = process.env.NEXT_PUBLIC_GAME_CODE || 'brainrot';

// function url(path: string) {
//   // path should start with /api/...
//   return `${BASE}${path}`;
// }

// export async function apiGetBaseElements(gameCode = GAME) {
//   const u = url(`/api/v1/compose/base-elements?game_code=${encodeURIComponent(gameCode)}`);
//   return requestJSON<BaseElementsResponse>(u, { method: 'GET', timeoutMs: 7000 });
// }

// export async function apiCombine(parentAId: number, parentBId: number, gameCode = GAME) {
//   const body: CombineRequest = { game_code: gameCode, parent_a_id: parentAId, parent_b_id: parentBId };
//   return requestJSON<CombineResponse>(url('/api/v1/compose/combine'), {
//     method: 'POST',
//     body,
//     timeoutMs: 7000,
//   });
// }

// export async function apiGetChallenges(discoveredCharacterIds: number[], gameCode = GAME) {
//   const body: ChallengesRequest = { game_code: gameCode, discovered_character_ids: discoveredCharacterIds };
//   return requestJSON<ChallengesResponse>(url('/api/v1/compose/challenges'), {
//     method: 'POST',
//     body,
//     timeoutMs: 7000,
//   });
// }

// /** Optional: tiny helpers */
// export function isCharacter(el?: Element) {
//   return !!el?.is_character;
// }

// export function isBase(el?: Element) {
//   return !!el?.is_base_element;
// }


// import { requestJSON } from "./http";
// import type {
//   BaseElementsResponse,
//   ChallengesRequest,
//   ChallengesResponse,
//   CombineRequest,
//   CombineResponse,
// } from "@/types/compose";

// const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
// const GAME = process.env.NEXT_PUBLIC_GAME_CODE || "brainrot";

// function url(path: string) {
//   return `${BASE}${path}`;
// }

// export async function apiGetBaseElements(gameCode = GAME) {
//   const u = url(`/api/v1/compose/base-elements?game_code=${encodeURIComponent(gameCode)}`);
//   return requestJSON<BaseElementsResponse>(u, { method: "GET", timeoutMs: 7000 });
// }

// export async function apiCombine(parentAId: number, parentBId: number, gameCode = GAME) {
//   const body: CombineRequest = { game_code: gameCode, parent_a_id: parentAId, parent_b_id: parentBId };
//   console.log('combining')
//   return requestJSON<CombineResponse>(url("/api/v1/compose/combine"), {
//     method: "POST",
//     body,
//     timeoutMs: 7000,
//   });
// }

// export async function apiGetChallenges(discoveredCharacterIds: number[], gameCode = GAME) {
//   const body: ChallengesRequest = { game_code: gameCode, discovered_character_ids: discoveredCharacterIds };
//   return requestJSON<ChallengesResponse>(url("/api/v1/compose/challenges"), {
//     method: "POST",
//     body,
//     timeoutMs: 7000,
//   });
// }


// Centralized API helpers for the compose backend

// Centralized API helpers for the compose backend

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";
const GAME_CODE = process.env.NEXT_PUBLIC_GAME_CODE ?? "brainrot";

type FetchJsonOpts = {
  method?: "GET" | "POST";
  body?: any;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

async function fetchJson<T>(path: string, opts: FetchJsonOpts = {}): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const res = await fetch(url, {
    method: opts.method ?? (opts.body ? "POST" : "GET"),
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers ?? {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} → ${text}`);
  }
  return (await res.json()) as T;
}

/** GET base elements (requires game_code) */
export async function apiGetBaseElements(gameCode: string = GAME_CODE): Promise<{ items: any[] }> {
  const qs = new URLSearchParams({ game_code: gameCode }).toString();
  return fetchJson(`/api/v1/compose/base-elements?${qs}`, { method: "GET" });
}

/** POST discovered character IDs → get challenges (requires game_code) */
export async function apiGetChallenges(
  foundCharacterIds: number[],
  gameCode: string = GAME_CODE
): Promise<{ items: any[] }> {
  return fetchJson("/api/v1/compose/challenges", {
    method: "POST",
    body: { game_code: gameCode, discovered_character_ids: foundCharacterIds },
  });
}

/** POST element IDs → details (recommend sending game_code for namespacing) */
export async function apiGetElementsByIds(
  ids: number[],
  gameCode: string = GAME_CODE
): Promise<{ items: any[] }> {
  return fetchJson("/api/v1/compose/elements/by-ids", {
    method: "POST",
    body: { game_code: gameCode, ids },
  });
}

/** Combine (requires game_code) */
export async function apiCombine(
  parentAId: number,
  parentBId: number,
  gameCode: string = GAME_CODE
): Promise<{ result?: any; recipe_id?: number }> {
  return fetchJson("/api/v1/compose/combine", {
    method: "POST",
    body: { game_code: gameCode, parent_a_id: parentAId, parent_b_id: parentBId },
  });
}

