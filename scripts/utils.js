// (async () => {
//     // Dynamically inject the external scripts into the current page
//     const scriptUrls = ['./utils.js', './submissionStatusListener.js'];
//     for (const url of scriptUrls) {
//         const script = document.createElement('script');
//         script.src = chrome.runtime.getURL(url);
//         script.type = 'module';
//         document.head.appendChild(script);
//         console.log(`Injected ${url}`);
//     }
// })();

// Utility function to wait for an element to appear
export async function waitForElement(selector, timeout = 30000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();

        const checkForElement = () => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
            } else if (Date.now() - startTime > timeout) {
                reject(new Error(`Timeout waiting for selector: ${selector}`));
            } else {
                requestAnimationFrame(checkForElement);
            }
        };
        checkForElement();
    });
}