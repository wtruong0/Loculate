/// <reference types="chrome"/>

import type { OnClickData, Tab } from 'chrome';
import { TravelInfo } from '../types';

// Register context menu item when extension is installed
chrome.runtime.onInstalled.addListener(() => {
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
    const { origin, destination } = request;
    
    // Construct the URL for our Cloudflare Worker
    const url = new URL('https://loculate-proxy.willtruong0.workers.dev');
    url.searchParams.append('origin', origin);
    url.searchParams.append('destination', destination);

    // Make the API request
    fetch(url.toString())
      .then(response => response.json())
      .then(data => {
        console.log('Background: Received data from worker:', data);
        
        // Check if the response has an error
        if (data.error) {
          throw new Error(data.error);
        }

        // If we have duration and distance directly, use them
        if (data.duration && data.distance) {
          const travelInfo: TravelInfo = {
            duration: data.duration,
            distance: data.distance,
            origin,
            destination
          };
          console.log('Background: Sending travel info to popup:', travelInfo);
          sendResponse({ success: true, data: travelInfo });
          return;
        }

        // Otherwise, check for Google Maps API response format
        if (data.status !== 'OK') {
          throw new Error(`API Error: ${data.error_message || data.status}`);
        }

        const element = data.rows[0].elements[0];
        if (element.status !== 'OK') {
          throw new Error(`Route Error: ${element.status}`);
        }

        const travelInfo: TravelInfo = {
          duration: element.duration.text,
          distance: element.distance.text,
          origin,
          destination
        };
        console.log('Background: Sending travel info to popup:', travelInfo);

        sendResponse({ success: true, data: travelInfo });
      })
      .catch(error => {
        console.error('Error fetching travel time:', error);
        sendResponse({ success: false, error: error.message });
      });

    // Return true to indicate we will send a response asynchronously
    return true;
  }
}); 