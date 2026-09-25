import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.NODE_ENV === 'production' ? '/a2z-sheet/' : '/',
  build: {
    modulePreload: {
      resolveDependencies: (filename, deps) => {
        // Hub entry should not preload sheet or mermaid chunks.
        if (filename.includes('index') && !filename.includes('dsa') && !filename.includes('lld')) {
          return deps.filter(
            (dep) =>
              dep.includes('react-router') ||
              (dep.includes('index-') && dep.endsWith('.css'))
          );
        }
        return deps;
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-router')) return 'react-router';
          if (id.includes('node_modules/mermaid') || id.includes('node_modules/katex')) {
            return 'mermaid';
          }
          if (id.includes('/sheets/lld/')) return 'lld';
          if (id.includes('/sheets/dsa/content/companies/by-slug/')) return undefined;
          if (id.includes('/sheets/dsa/content/blogs/')) return undefined;
          if (id.includes('/sheets/dsa/')) return 'dsa';
        },
      },
    },
  },
});
