/**
 * LinkedIn Message Tracker - Background Script
 * Manages storage and cross-tab communication
 */

interface MessageStats {
  date: string;
  linkedin: number;
  salesNav: number;
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('LinkedIn Pulse: Extension installed');
  
  // Initialize storage if empty
  chrome.storage.local.get(['stats'], (result) => {
    if (!result.stats) {
      chrome.storage.local.set({ stats: [] });
    }
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'MESSAGE_SENT') {
    updateCount(message.platform, message.date);
    sendResponse({ status: 'received' });
  }
});

async function updateCount(platform: 'linkedin' | 'salesNav', date: string) {
  const result = await chrome.storage.local.get(['stats']);
  let stats: MessageStats[] = result.stats || [];
  
  const todayIndex = stats.findIndex(s => s.date === date);
  
  if (todayIndex > -1) {
    stats[todayIndex][platform]++;
  } else {
    stats.push({
      date: date,
      linkedin: platform === 'linkedin' ? 1 : 0,
      salesNav: platform === 'salesNav' ? 1 : 0
    });
  }
  
  // Keep only last 90 days
  if (stats.length > 90) {
    stats = stats.slice(-90);
  }
  
  await chrome.storage.local.set({ stats });
  console.log('LinkedIn Pulse: Stats updated', stats);
}
