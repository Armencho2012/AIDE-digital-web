// MCP tool handlers run in the emitted Supabase Edge Function (Deno) where
// `process.env` is polyfilled. This declaration keeps the browser-oriented
// tsconfig from erroring while the source is import-safe (no runtime env read).
declare const process: { env: Record<string, string | undefined> };
