chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
        console.log("URL change detected");
        console.log("Changed to:\n", changeInfo.url);
    }
});