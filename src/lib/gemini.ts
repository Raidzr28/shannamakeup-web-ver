import "server-only";
import { GEMINI_SECRET, readSecret } from "./secret-store";

/** Google's Generative Language REST API.
 *
 * Deliberately plain `fetch` rather than the @google/genai SDK: this is one
 * POST, and a dependency that ships its own transport would be more code to
 * keep current than the request body below.
 *
 * The model is env-driven because Google retires model ids on its own
 * schedule — a rename should be an env change, not a deploy. */
const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";
const TIMEOUT_MS = 15_000;

/** Tried in order until one answers.
 *
 * A single hardcoded id is how this broke the first time: gemini-2.5-flash
 * still appears in ListModels but returns 404 "no longer available to new
 * users", so every call failed and the assistant quietly served scripted
 * replies. Google retires ids on its own schedule, so the list leads with the
 * floating `-latest` alias and keeps pinned versions behind it.
 *
 * A retired model (404) or an overloaded one (429/503) moves to the next
 * candidate. A rejected key (401/403) or a malformed request (400) stops
 * immediately — no other model would answer differently. */
const DEFAULT_MODEL = "gemini-flash-latest";
const FALLBACK_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-3-flash-preview",
];
const RETRY_NEXT_MODEL = new Set([404, 429, 503]);

export type ChatTurn = { role: "user" | "model"; text: string };

function envKey() {
  // Either name works, so a key pulled from Vercel as GOOGLE_API_KEY needs no
  // renaming to take effect.
  return (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "").trim();
}

/** A key set in the app wins over one in the environment: it is the more
 * recent, more deliberate act, and the settings page would otherwise show a
 * key that is not the one actually being used. */
async function apiKey() {
  try {
    const stored = await readSecret(GEMINI_SECRET);
    if (stored) return stored.trim();
  } catch (error) {
    // A missing AUTH_SECRET makes the store unreadable. Fall through to the
    // environment rather than taking chat down with it.
    console.error("could not read stored gemini key", error);
  }
  return envKey();
}

export type GeminiSource = "app" | "env" | "none";

/** Lets the settings pages show whether the assistant is live, and where its
 * key came from, without ever handling the key itself. */
export async function geminiStatus(): Promise<GeminiSource> {
  try {
    if (await readSecret(GEMINI_SECRET)) return "app";
  } catch {
    // Reported by apiKey(); treated here as "not from the app".
  }
  return envKey() ? "env" : "none";
}

export async function geminiConfigured() {
  return (await apiKey()).length > 0;
}

export function geminiModel() {
  return (process.env.GEMINI_MODEL || DEFAULT_MODEL).trim();
}

/** Returns null rather than throwing on every failure path — no key, bad key,
 * timeout, quota, safety block. Chat treats null as "use the scripted reply",
 * so a missing or broken key degrades to the old behaviour instead of showing
 * a client an error. */
export async function geminiReply(
  system: string,
  turns: ChatTurn[]
): Promise<string | null> {
  const key = await apiKey();
  if (!key || turns.length === 0) return null;

  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: system }] },
    contents: turns.map((turn) => ({
      role: turn.role,
      parts: [{ text: turn.text }],
    })),
    generationConfig: { temperature: 0.6, maxOutputTokens: 500 },
  });

  // Configured model first, then the fallbacks, with duplicates dropped so an
  // explicit GEMINI_MODEL is not retried twice.
  const candidates = [...new Set([geminiModel(), ...FALLBACK_MODELS])];

  for (const model of candidates) {
    try {
      const response = await fetch(`${ENDPOINT}/${model}:generateContent`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          // Header rather than ?key=, so the secret never lands in a URL that
          // a proxy or access log might keep.
          "x-goog-api-key": key,
        },
        body,
        signal: AbortSignal.timeout(TIMEOUT_MS),
        cache: "no-store",
      });

      if (!response.ok) {
        // Body, not just status: Google puts the actual reason (retired
        // model, bad key, quota) in the payload.
        const detail = await response.text();
        console.error("gemini request failed", model, response.status, detail);
        if (RETRY_NEXT_MODEL.has(response.status)) continue;
        return null;
      }

      const data = (await response.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const text = (data.candidates?.[0]?.content?.parts ?? [])
        .map((part) => part.text ?? "")
        .join("")
        .trim();

      if (text) return text;
      // Empty usually means the answer was filtered; another model may well
      // produce the same, so this is not worth retrying.
      console.error("gemini returned no text", model);
      return null;
    } catch (error) {
      // Timeout or network fault — worth trying the next candidate.
      console.error("gemini call errored", model, error);
    }
  }

  return null;
}
