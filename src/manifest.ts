import { defineManifest } from 'vite-plugin-chrome-extension';

export default defineManifest({
  manifest_version: 3,
  name: 'LocuLate',
  version: '1.0.0',
  description: 'Calculate travel times toselected addresses, all in your local window.',
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