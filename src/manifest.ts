import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest({
  manifest_version: 3,
  name: 'Loculate',
  version: '1.0.9',
  description: 'Calculate travel times to selected addresses, all in your local window.',
  permissions: [
    'contextMenus',
    'storage',
    'activeTab',
    'scripting'
  ],
  action: {
    default_popup: 'src/popup/index.html'
  },
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module'
  },
  icons: {
    '16': 'icons/icon16.png',
    '48': 'icons/icon48.png',
    '128': 'icons/icon128.png'
  }
}); 