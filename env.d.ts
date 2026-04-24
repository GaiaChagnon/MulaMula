declare namespace NodeJS {
  interface ProcessEnv {
    /** Site URL for OpenRouter `HTTP-Referer` and links (optional). */
    NEXT_PUBLIC_APP_URL?: string;
    OPENROUTER_API_KEY?: string;
    OPENROUTER_MODEL?: string;
    OPENROUTER_HTTP_REFERER?: string;
    OPENROUTER_APP_TITLE?: string;
  }
}
