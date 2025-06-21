import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest({
  manifest_version: 3,
  name: 'Loculate',
  version: '1.3.6',
  description: 'Select a location in text and get travel info, simply with your mouse! Powered by Google Maps Distance Matrix API.',
  permissions: [
    'storage',
    'contextMenus',
    'activeTab'
  ],
  host_permissions: [
    'https://loculate-proxy.willtruong0.workers.dev/*'
  ],
  action: {
    default_popup: 'src/popup/index.html',
    default_icon: {
      '16': 'public/icons/icon16.png',
      '48': 'public/icons/icon48.png',
      '128': 'public/icons/icon128.png'
    }
  },
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module'
  },
  icons: {
    '16': 'public/icons/icon16.png',
    '48': 'public/icons/icon48.png',
    '128': 'public/icons/icon128.png'
  },
  web_accessible_resources: [{
    resources: ['src/popup/index.html'],
    matches: ['<all_urls>']
  }]
}); 