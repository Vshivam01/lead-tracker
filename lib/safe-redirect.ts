/**
 * Returns the path if it's a safe same-origin redirect target, otherwise null.
 *
 * Defends against open-redirect attacks via crafted `?next=` params:
 *   - "//evil.com/x"  protocol-relative, would navigate off-site
 *   - "/\\evil.com"    backslash variant, some parsers normalize to "//"
 *   - "https://..."   absolute URL
 *
 * Only paths that start with "/" and have a path segment as the second char
 * are considered safe.
 */
export function safeNextPath(next: string | null | undefined): string | null {
  if (typeof next !== "string" || next.length === 0) return null;
  if (!next.startsWith("/")) return null;
  if (next.startsWith("//") || next.startsWith("/\\")) return null;
  return next;
}
