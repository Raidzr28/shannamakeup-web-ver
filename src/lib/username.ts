/** Username rules, shared by the server actions and the profile form.
 *
 * Deliberately free of any Prisma or server-only import: the client form
 * validates with the exact same rules the action enforces, so a rejected handle
 * never costs a round trip. */

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;
const SHAPE = /^[a-z0-9._]+$/;

/** Handles that would collide with a route or impersonate the app itself. */
const RESERVED = new Set([
  "account",
  "admin",
  "api",
  "book",
  "chat",
  "login",
  "looks",
  "manage",
  "orders",
  "register",
  "shana",
  "studio",
  "support",
]);

/** Lowercases and drops a leading @, so "@Shana.MUA" and "shana.mua" are one
 * handle. Uniqueness is a plain unique index, so normalising on the way in is
 * what actually makes it case-insensitive. */
export function normalizeUsername(raw: string) {
  return raw.trim().replace(/^@+/, "").toLowerCase();
}

/** Forces any string into the allowed shape — used to derive a starting handle
 * from a name or email at registration. */
export function slugifyUsername(base: string) {
  const slug = normalizeUsername(base)
    .replace(/[^a-z0-9._]/g, "")
    .replace(/^[._]+/, "")
    .slice(0, USERNAME_MAX);
  return slug.length >= USERNAME_MIN ? slug : `${slug}user`.slice(0, USERNAME_MAX);
}

/** Returns an error message, or null when the handle is acceptable. */
export function validateUsername(username: string): string | null {
  if (username.length < USERNAME_MIN)
    return `Username needs at least ${USERNAME_MIN} characters.`;
  if (username.length > USERNAME_MAX)
    return `Username can be at most ${USERNAME_MAX} characters.`;
  if (!SHAPE.test(username))
    return "Username can only use lowercase letters, numbers, dots and underscores.";
  if (/^[._]/.test(username) || /[._]$/.test(username))
    return "Username cannot start or end with a dot or underscore.";
  if (RESERVED.has(username)) return "That username is reserved.";
  return null;
}
