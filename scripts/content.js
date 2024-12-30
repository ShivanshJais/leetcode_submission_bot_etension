(() => {
    console.log("Extension Loaded");

    // Utility function to wait for an element to appear
    async function waitForElement(selector, timeout = 30000) {
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

    // Function to monitor submission results
    async function monitorSubmissionResult() {
        console.log("Monitoring for submission results...");

        try {
            // Create promises for compile error and submission status
            const compileErrorPromise = waitForElement('[data-e2e-locator="console-result"]', 30000)
                .then((element) => {
                    if (element.textContent.includes("Compile Error")) {
                        console.log("Compile Error Detected:", element.textContent);
                        alert("Compile Error Detected!");
                        return { type: "compileError", element };
                    }
                });

            const submissionStatusPromise = waitForElement('[data-e2e-locator="submission-result"]', 30000)
                .then((element) => {
                    console.log("Submission status element found:", element);
                    return { type: "submissionResult", element };
                });

            // Wait for the first result
            const result = await Promise.race([compileErrorPromise, submissionStatusPromise]);

            if (result?.type === "compileError") {
                console.log("Compile Error Handling Completed.");
            } else if (result?.type === "submissionResult") {
                const submissionStatus = result.element;
                if (submissionStatus.textContent.includes("Accepted")) {
                    console.log("Solution Accepted");
                    alert("Your solution was Accepted! 🎉");
                } else {
                    console.log("Submission result:", submissionStatus.textContent);
                    alert(`Submission result: ${submissionStatus.textContent}`);
                }
            }
        } catch (error) {
            console.error("Error during submission monitoring:", error.message);
        }
    }

    // Function to reinitialize the script after a submission is handled
    async function reinitializeIfOnLeetCode() {
        // Verify we are still on the LeetCode page
        if (window.location.hostname.includes("leetcode.com")) {
            console.log("Reinitializing script for next submission...");
            await init(); // Call the initialization function again
        } else {
            console.log("Not on LeetCode page. Stopping script.");
        }
    }

    // Initialize the script and attach listeners
    async function init() {
        try {
            console.log("Initializing script...");

            // Wait for the submit button to appear
            const submitButton = await waitForElement('[data-e2e-locator="console-submit-button"]');
            console.log("Submit button detected:", submitButton);

            // Add a click event listener to monitor submissions
            submitButton.addEventListener(
                "click",
                async () => {
                    console.log("Submit button clicked!");

                    // Monitor for submission results
                    await monitorSubmissionResult();

                    // Reinitialize after handling the submission
                    await reinitializeIfOnLeetCode();
                },
                { once: true } // Ensure the listener is added only once
            );
        } catch (error) {
            console.error("Error initializing script:", error.message);
        }
    }

    // Handle tab visibility changes and refresh the script
    function handleTabVisibility() {
        if (!document.hidden && window.location.hostname.includes("leetcode.com")) {
            console.log("Tab is active. Reinitializing script...");
            init(); // Reinitialize the script when the tab becomes active
        }
    }

    // Attach a visibility change listener
    document.addEventListener("visibilitychange", handleTabVisibility);

    // Call the initialization function on script load
    init();
})();


// import { waitForElement } from './utils.js';
// import { monitorSubmissionResult } from './submissionStatusListener.js';

// console.log('Content JSON');

// (() => {
//     console.log("Extension Loaded");

//     async function init() {
//         try {
//             console.log("Initializing script...");

//             const submitButton = await waitForElement('[data-e2e-locator="console-submit-button"]');
//             console.log("Submit button detected:", submitButton);

//             submitButton.addEventListener(
//                 "click",
//                 async () => {
//                     console.log("Submit button clicked!");
//                     await monitorSubmissionResult();
//                     await reinitializeIfOnLeetCode();
//                 },
//                 { once: true }
//             );
//         } catch (error) {
//             console.error("Error initializing script:", error.message);
//         }
//     }

//     async function reinitializeIfOnLeetCode() {
//         if (window.location.hostname.includes("leetcode.com")) {
//             console.log("Reinitializing script for next submission...");
//             await init();
//         } else {
//             console.log("Not on LeetCode page. Stopping script.");
//         }
//     }

//     function handleTabVisibility() {
//         if (!document.hidden && window.location.hostname.includes("leetcode.com")) {
//             console.log("Tab is active. Reinitializing script...");
//             init();
//         }
//     }

//     document.addEventListener("visibilitychange", handleTabVisibility);
//     init();
// })();