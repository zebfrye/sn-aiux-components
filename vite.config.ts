import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// The real AIUXElement pulls in the whole AIUX client runtime (router, services, SSR hooks).
// Tests and the standalone demo swap it for a thin LitElement stub; inside an AIUX app the
// real module resolves normally.
const stub = fileURLToPath(new URL('./src/test-stubs/aiux-core-stub.ts', import.meta.url));

export default defineConfig({
  resolve: {
    alias: { '@servicenow/aiux/aiux-components-core': stub }
  },
  build: {
    rollupOptions: { input: fileURLToPath(new URL('./demo/index.html', import.meta.url)) }
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts']
  }
});
