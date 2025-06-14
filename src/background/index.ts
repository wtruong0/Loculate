/// <reference types="chrome"/>

import type { OnClickData, Tab } from 'chrome';

// Register context menu item when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'calculateTravelTime',
    title: 'Calculate travel time with LocuLate',
    contexts: ['selection']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'calculateTravelTime' && info.selectionText) {
    // Send message to popup with selected text
    chrome.runtime.sendMessage({
      type: 'ADDRESS_SELECTED',
      payload: {
        destination: info.selectionText
      }
    });
  }
}); 