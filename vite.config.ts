import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from 'vite-plugin-chrome-extension';

export default defineConfig({
  plugins: [
    react(),
    crx({
      manifest: {
        manifest_version: 3,
        name: 'Loculate',
        version: '1.0.0',
        description: 'Calculate travel times from selected addresses',
        permissions: [
          'contextMenus',
          'storage',
          'scripting',
          'activeTab'
        ],
        host_permissions: [
          '<all_urls>'
        ],
        action: {
          default_popup: 'src/popup/index.html'
        },
        background: {
          service_worker: 'src/background/index.ts',
          type: 'module'
        },
        content_scripts: [
          {
            matches: ['<all_urls>'],
            js: ['src/content/index.ts']
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      input: {
        popup: 'src/popup/index.html',
        background: 'src/background/index.ts',
        content: 'src/content/index.ts'
      }
    }
  }
}); 