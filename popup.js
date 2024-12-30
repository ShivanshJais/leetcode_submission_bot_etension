// Check if the current tab is on LeetCode
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    const currentURL = activeTab.url;
  
    const statusElement = document.getElementById("status");
  
    if (currentURL.includes("leetcode.com")) {
      statusElement.textContent = "You are on a LeetCode page! 🚀";
    } else {
      statusElement.textContent = "You are NOT on a LeetCode page. 😔";
    }
  });