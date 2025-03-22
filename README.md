# Task_4
Chrome Extension: Website Time Tracker

"COMPANY": CODTECH IT SOLUTIONS

"NAME": MUZAMIL AHMED

"INTERN ID": CT04WU30

"DOMAIN": FULL STACK WEB DEVELOPMENT

"DURATION": 4 WEEKS

"MENTOR": NEELA SANTOSH

Task description:
The Website Time Tracker is a Chrome extension designed to monitor and analyze the time users spend on various websites. It records time spent on each domain daily, weekly, and monthly, providing insightful statistics to help users better manage their browsing habits.

How It Works:
Time Tracking:
The background.js script listens for tab activation and updates, tracking the active time spent on each website.
Time data is aggregated into daily, weekly, and monthly periods and stored using Chrome's chrome.storage.local API.
Popup Interface:
The popup.js script fetches and displays the accumulated time data.
It allows users to view current active site information and switch between daily, weekly, and monthly views.
The popup.html file provides the structure, while popup.css handles the styling for a clean and user-friendly interface.
Manifest File:
The manifest.json file defines the extension's metadata, permissions, and resources, specifying the use of background service workers and the popup UI.

Features:
Real-time tracking of active website usage.
Aggregated statistics for daily, weekly, and monthly periods.
A visually appealing and responsive user interface.
Persistent data storage using Chrome's local storage.

Installation Instructions:
Download the Extension Files:
Ensure you have all the required files: manifest.json, background.js, popup.js, popup.html, and popup.css.
Load the Extension in Chrome:
Open Google Chrome and navigate to chrome://extensions/.
Enable Developer Mode (toggle in the top-right corner).
Click Load Unpacked and select the project folder.
Activate the Extension:
Once loaded, the extension icon will appear next to the address bar.

Usage:
Start Tracking:
The extension starts tracking website time automatically once installed.
View Statistics:
Click the extension icon to open the popup.
Toggle between daily, weekly, and monthly stats.
Analyze Data:
Use the provided statistics to monitor and improve productivity.

output:
