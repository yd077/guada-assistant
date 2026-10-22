// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  vite: {
    define: {
      'import.meta.env.VITE_PROJECT_BACKEND_URL': JSON.stringify(process.env['PROJECT_SUPABASE_URL']),
      'import.meta.env.VITE_PROJECT_BACKEND_PUBLIC_KEY': JSON.stringify(process.env['PROJECT_SUPABASE_PUBLISHABLE_KEY']),
    },
    resolve: {
      alias: ['client.server', 'client', 'auth-middleware', 'auth-attacher'].map((name) => ({
        find: new RegExp(`^@/integrations/supabase/${name.replace('.', '\\.')}$`),
        replacement: fileURLToPath(new URL(`./src/integrations/project-backend/${name}.ts`, import.meta.url)),
      })),
    },
  },
});
