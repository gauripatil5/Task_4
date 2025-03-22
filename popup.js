// popup.js
let activeTabDomain = null;
let activeTabTitle = null;
let activeTabStartTime = null;
let currentView = 'daily';
let timerInterval = null;
let statsUpdateInterval = null;

// Format seconds to HH:MM:SS
function formatTime(seconds) {
  if (seconds < 0) seconds = 0;
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Get today's date string
function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

// Get current week start date string
function getCurrentWeekString() {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
  return weekStart.toISOString().split('T')[0];
}

// Get current month string
function getCurrentMonthString() {
  return new Date().toISOString().split('T')[0].substring(0, 7);
}

// Update current site timer display
function updateCurrentTimer() {
  const currentTimerElement = document.getElementById('current-timer');
  
  if (activeTabDomain && activeTabStartTime) {
    chrome.storage.local.get(['timeData'], function(result) {
      const timeData = result.timeData || {};
      const today = getTodayString();
      let accumulatedTime = 0;
      
      if (timeData[activeTabDomain] && timeData[activeTabDomain].days[today]) {
        accumulatedTime = timeData[activeTabDomain].days[today];
      }
      
      currentTimerElement.textContent = formatTime(accumulatedTime);
    });
  } else {
    currentTimerElement.textContent = '00:00:00';
  }
}

// Update time statistics display
function updateStatsDisplay(view) {
  currentView = view;
  const container = document.getElementById('stats-container');
  const periodEl = document.getElementById('current-period');
  container.innerHTML = '<div class="loader">Loading...</div>';
  
  // Update period display text
  if (view === 'daily') {
    periodEl.textContent = 'Today';
  } else if (view === 'weekly') {
    periodEl.textContent = 'This Week';
  } else if (view === 'monthly') {
    periodEl.textContent = 'This Month';
  }
  
  // Fetch data from storage
  chrome.storage.local.get(['timeData'], function(result) {
    const timeData = result.timeData || {};
    
    // Clear container
    container.innerHTML = '';
    
    const currentPeriod = view === 'daily' ? getTodayString() : 
                          view === 'weekly' ? getCurrentWeekString() : 
                          getCurrentMonthString();
    
    // Process and sort data
    const processedData = [];
    
    for (const domain in timeData) {
      let periodTime = 0;
      
      if (view === 'daily' && timeData[domain].days[currentPeriod]) {
        periodTime = timeData[domain].days[currentPeriod];
      } else if (view === 'weekly' && timeData[domain].weeks[currentPeriod]) {
        periodTime = timeData[domain].weeks[currentPeriod];
      } else if (view === 'monthly' && timeData[domain].months[currentPeriod]) {
        periodTime = timeData[domain].months[currentPeriod];
      }
      
      if (periodTime > 0) {
        processedData.push({
          domain: domain,
          title: timeData[domain].title || domain,
          favicon: timeData[domain].favicon,
          time: periodTime
        });
      }
    }
    
    // Sort by time spent (descending)
    processedData.sort((a, b) => b.time - a.time);
    
    // Add to container
    if (processedData.length === 0) {
      container.innerHTML = '<div class="no-data">No data available for this period</div>';
    } else {
      processedData.forEach(item => {
        const siteElement = document.createElement('div');
        siteElement.className = 'site-stat';
        
        siteElement.innerHTML = `
          <img class="favicon" src="${item.favicon}" alt="">
          <div class="site-info">
            <span class="site-name" title="${item.title}">${item.domain}</span>
            <span class="site-title">${item.title}</span>
          </div>
          <span class="site-time">${formatTime(item.time)}</span>
        `;
        
        container.appendChild(siteElement);
      });
    }
  });
}

// Initialize the popup
function initPopup() {
  console.log("Initializing popup...");
  
  // Get current active tab info
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (tabs.length > 0) {
      const url = tabs[0].url;
      const domain = extractDomain(url);
      
      if (domain) {
        activeTabDomain = domain;
        activeTabTitle = tabs[0].title;
        const domainEl = document.getElementById('current-domain');
        const faviconEl = document.getElementById('current-favicon');
        
        if (domainEl) {
          domainEl.textContent = activeTabTitle || domain;
          domainEl.title = activeTabTitle;
        }
        if (faviconEl) faviconEl.src = `https://www.google.com/s2/favicons?domain=${domain}`;
        
        // Start timer updates
        if (timerInterval) clearInterval(timerInterval);
        if (statsUpdateInterval) clearInterval(statsUpdateInterval);
        
        activeTabStartTime = Date.now();
        timerInterval = setInterval(updateCurrentTimer, 1000);
        statsUpdateInterval = setInterval(() => {
          if (currentView === 'daily') {
            updateStatsDisplay('daily');
          }
        }, 1000);
        
        updateCurrentTimer();
      }
    }
  });
  
  // Default to daily view
  updateStatsDisplay('daily');
}

// Helper function to extract domain from URL
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    return null;
  }
}

// Set active tab style
function setActiveTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.getElementById(tabId).classList.add('active');
}

// Set up tab buttons
function setupTabButtons() {
  const dailyTabEl = document.getElementById('dailyTab');
  const weeklyTabEl = document.getElementById('weeklyTab');
  const monthlyTabEl = document.getElementById('monthlyTab');
  
  if (dailyTabEl) {
    dailyTabEl.addEventListener('click', function() {
      setActiveTab('dailyTab');
      updateStatsDisplay('daily');
    });
  }
  
  if (weeklyTabEl) {
    weeklyTabEl.addEventListener('click', function() {
      setActiveTab('weeklyTab');
      updateStatsDisplay('weekly');
    });
  }
  
  if (monthlyTabEl) {
    monthlyTabEl.addEventListener('click', function() {
      setActiveTab('monthlyTab');
      updateStatsDisplay('monthly');
    });
  }
}

// Make sure DOM is fully loaded before accessing elements
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM fully loaded");
  setupTabButtons();
  initPopup();
});

// Cleanup when popup closes
window.addEventListener('unload', function() {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  if (statsUpdateInterval) {
    clearInterval(statsUpdateInterval);
  }
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'updateTimer') {
    activeTabStartTime = request.startTime;
    if (request.url) {
      const domain = extractDomain(request.url);
      if (domain) {
        activeTabDomain = domain;
      }
    }
    if (request.title) {
      activeTabTitle = request.title;
      const domainEl = document.getElementById('current-domain');
      if (domainEl) {
        domainEl.textContent = activeTabTitle;
        domainEl.title = activeTabTitle;
      }
    }
    updateCurrentTimer();
  }
});
