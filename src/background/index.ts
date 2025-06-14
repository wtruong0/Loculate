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
    // Store the selected text in storage
    chrome.storage.local.set({ destination: info.selectionText }, () => {
      // Open the popup
      chrome.action.openPopup();
    });
  }
}); 