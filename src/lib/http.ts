// // http.ts — strictly type-safe wrapper around fetch with timeout + retries

// export class HttpError extends Error {
//   status: number;
//   body?: unknown;
//   constructor(message: string, status: number, body?: unknown) {
//     super(message);
//     this.status = status;
//     this.body = body;
//   }
// }

// // NOTE: We allow plain-object bodies here, but we will convert them
// // to BodyInit *before* calling fetch (so no type conflict reaches fetch).
// export type HttpInit = Omit<RequestInit, "body" | "signal"> & {
//   body?: unknown;        // can be object; we'll JSON.stringify it
//   timeoutMs?: number;
//   retries?: number;
// };

// const DEFAULT_TIMEOUT = 8000;

// function toJsonBody(body: unknown): BodyInit | undefined {
//   if (body == null) return undefined;
//   if (
//     typeof body === "string" ||
//     body instanceof Blob ||
//     body instanceof FormData ||
//     body instanceof URLSearchParams ||
//     // @ts-ignore (ReadableStream isn't always in lib.dom.d.ts)
//     body instanceof ReadableStream
//   ) {
//     return body as BodyInit;
//   }
//   // assume plain object
//   return JSON.stringify(body);
// }

// async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number) {
//   const controller = new AbortController();
//   const id = setTimeout(() => controller.abort(), timeoutMs);
//   try {
//     return await fetch(url, { ...init, signal: controller.signal });
//   } finally {
//     clearTimeout(id);
//   }
// }

// export async function requestJSON<T>(url: string, init: HttpInit = {}): Promise<T> {
//   const {
//     timeoutMs = DEFAULT_TIMEOUT,
//     retries = 0,
//     headers,
//     body,           // strip body out so it doesn't get forwarded as unknown
//     ...rest         // everything else that's compatible with RequestInit
//   } = init;

//   // Prepare headers and serialize body if needed
//   const hdr = new Headers(headers);
//   const preparedBody = toJsonBody(body);
//   if (preparedBody !== undefined && !hdr.has("Content-Type")) {
//     hdr.set("Content-Type", "application/json");
//   }

//   // Build a clean RequestInit with a correctly-typed body
//   const reqInit: RequestInit = {
//     ...rest,
//     headers: hdr,
//     body: preparedBody,
//   };

//   let lastErr: unknown;
//   for (let attempt = 0; attempt <= retries; attempt++) {
//     try {
//       const res = await fetchWithTimeout(url, reqInit, timeoutMs);
//       const ct = res.headers.get("content-type") || "";
//       const isJson = ct.includes("application/json");
//       const data = isJson ? await res.json() : undefined;

//       if (!res.ok) throw new HttpError(`HTTP ${res.status}`, res.status, data);
//       return data as T;
//     } catch (e) {
//       lastErr = e;
//       if (attempt < retries) continue;
//     }
//   }
//   if (lastErr instanceof Error) throw lastErr;
//   throw new Error(String(lastErr));
// }

// Strict, type-safe wrapper for fetch with timeout + retries.
// Accepts plain objects in `body` and JSON-stringifies them before calling fetch.

export class HttpError extends Error {
  status: number;
  body?: unknown;
  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

// We override RequestInit.body so callers can pass plain objects.
// We also keep our own timeout/retries controls.
export type HttpInit = Omit<RequestInit, "body" | "signal"> & {
  body?: unknown;       // allow objects; we’ll JSON.stringify
  timeoutMs?: number;
  retries?: number;
};

const DEFAULT_TIMEOUT = 8000;

function toJsonBody(body: unknown): BodyInit | undefined {
  if (body == null) return undefined;
  if (
    typeof body === "string" ||
    body instanceof Blob ||
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    // @ts-ignore: ReadableStream presence varies by env
    body instanceof ReadableStream
  ) {
    return body as BodyInit;
  }
  return JSON.stringify(body);
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

export async function requestJSON<T>(url: string, init: HttpInit = {}): Promise<T> {
  const {
    timeoutMs = DEFAULT_TIMEOUT,
    retries = 0,
    headers,
    body,
    ...rest
  } = init;

  // prepare headers + body
  const hdr = new Headers(headers);
  const preparedBody = toJsonBody(body);
  if (preparedBody !== undefined && !hdr.has("Content-Type")) {
    hdr.set("Content-Type", "application/json");
  }

  const reqInit: RequestInit = {
    ...rest,
    headers: hdr,
    body: preparedBody,
  };

  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetchWithTimeout(url, reqInit, timeoutMs);
      const ct = res.headers.get("content-type") || "";
      const isJson = ct.includes("application/json");
      const data = isJson ? await res.json() : undefined;

      if (!res.ok) throw new HttpError(`HTTP ${res.status}`, res.status, data);
      return data as T;
    } catch (e) {
      lastErr = e;
      if (attempt < retries) continue;
    }
  }

  if (lastErr instanceof Error) throw lastErr;
  throw new Error(String(lastErr));
}
