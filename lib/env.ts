/**
 * Central place for environment variable reads (documented in `.env.example`).
 * Server and client code can import `publicAppUrl`; secrets stay server-only.
 */
export function publicAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
}
