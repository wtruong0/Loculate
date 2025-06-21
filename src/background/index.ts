/// <reference types="chrome"/>

import type { OnClickData, Tab } from 'chrome';
import { TravelInfo } from '../types';

const WORKER_URL = 'https://loculate-proxy.willtruong0.workers.dev';

// Register context menu item when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  console.log('Background: Extension installed/updated');
  chrome.contextMenus.create({
    id: 'calculateTravelTime',
    title: 'Calculate travel time with Loculate',
    contexts: ['selection']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'calculateTravelTime' && info.selectionText) {
    // Store the selected text
    chrome.storage.local.set({ selectedText: info.selectionText });
    
    // Open the popup
    if (tab?.id) {
      chrome.action.openPopup();
    }
  }
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_TRAVEL_TIME') {
    console.log('Background: Processing travel time request');
    
    const { origin, destination } = request;
    
    // Call the Cloudflare Worker
    fetch(`${WORKER_URL}?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`)
      .then(response => response.json())
      .then(data => {
        console.log('Background: Worker response received successfully');
        
        if (data.error) {
          console.log('Background: Worker returned error');
          sendResponse({ success: false, error: data.error });
        } else {
          console.log('Background: Sending travel info to popup');
          sendResponse({ 
            success: true, 
            data: {
              duration: data.duration,
              distance: data.distance
            }
          });
        }
      })
      .catch(error => {
        console.error('Background: Worker request failed');
        sendResponse({ success: false, error: error.message });
      });
    
    return true; // Keep the message channel open for async response
  }
});

// Handle startup
chrome.runtime.onStartup.addListener(() => {
  console.log('Background: Extension started');
}); 