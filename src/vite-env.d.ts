
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_EDGE_FUNCTIONS: string;
  readonly VITE_SUPABASE_PROJECT_REF: string;
  readonly VITE_POSTHOG_API_KEY: string;
  readonly VITE_POSTHOG_HOST?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
