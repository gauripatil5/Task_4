let activeTabId = null;
let startTime = null;
let updateInterval = null;

// Helper function to get date strings
function getDateStrings() {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  // Get week start (Sunday)
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const weekString = weekStart.toISOString().split('T')[0];
  
  // Get month string (YYYY-MM)
  const monthString = now.toISOString().split('T')[0].substring(0, 7);
  
  return { today, weekString, monthString };
}

// Helper function to update time data
function updateTimeData(domain, timeSpent, title) {
  const { today, weekString, monthString } = getDateStrings();
  
  chrome.storage.local.get(['timeData'], function(result) {
    const timeData = result.timeData || {};
    
    if (!timeData[domain]) {
      timeData[domain] = {
        favicon: `https://www.google.com/s2/favicons?domain=${domain}`,
        title: title || domain,
        days: {},
        weeks: {},
        months: {}
      };
    }

    // Update title if it exists
    if (title) {
      timeData[domain].title = title;
    }
    
    // Update daily time
    timeData[domain].days[today] = (timeData[domain].days[today] || 0) + timeSpent;
    
    // Update weekly time
    timeData[domain].weeks[weekString] = (timeData[domain].weeks[weekString] || 0) + timeSpent;
    
    // Update monthly time
    timeData[domain].months[monthString] = (timeData[domain].months[monthString] || 0) + timeSpent;
    
    chrome.storage.local.set({ timeData });
  });
}

function updateTimeSpent() {
  if (!activeTabId || !startTime) return;

  chrome.tabs.get(activeTabId, (tab) => {
    if (chrome.runtime.lastError || !tab || !tab.url) return;
    
    try {
      const domain = new URL(tab.url).hostname;
      const timeSpent = 1; // Update every second
      updateTimeData(domain, timeSpent, tab.title);
    } catch (e) {
      console.error('Error updating time spent:', e);
    }
  });
}

function startTracking(tabId) {
  // Clear any existing interval
  if (updateInterval) {
    clearInterval(updateInterval);
  }

  activeTabId = tabId;
  startTime = Date.now();

  // Start a new interval to update time every second
  updateInterval = setInterval(updateTimeSpent, 1000);

  // Get initial tab info and notify popup
  chrome.tabs.get(tabId, (tab) => {
    if (!chrome.runtime.lastError && tab && tab.url) {
      chrome.runtime.sendMessage({
        action: 'updateTimer',
        startTime: startTime,
        title: tab.title,
        url: tab.url
      });
    }
  });
}

function stopTracking() {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
  activeTabId = null;
  startTime = null;
}

chrome.tabs.onActivated.addListener(activeInfo => {
  startTracking(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === activeTabId) {
    if (changeInfo.url) {
      // Reset tracking for new URL
      startTracking(tabId);
    }
    
    // Notify popup about any changes (URL or title)
    if (changeInfo.url || changeInfo.title) {
      chrome.runtime.sendMessage({
        action: 'updateTimer',
        startTime: startTime,
        title: tab.title,
        url: tab.url
      });
    }
  }
});

chrome.tabs.onRemoved.addListener(tabId => {
  if (tabId === activeTabId) {
    stopTracking();
  }
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getTimeData") {
    chrome.storage.local.get(['timeData'], function(result) {
      sendResponse(result.timeData || {});
    });
    return true;
  }
});

// Clean up when extension is unloaded
chrome.runtime.onSuspend.addListener(() => {
  stopTracking();
});