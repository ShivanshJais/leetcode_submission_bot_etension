// (() => {
//     console.log("Extension Loaded");

//     /* ******** GLOBAL ******** */

//     const SUBMISSION_STATUS_SELECTOR = '[data-e2e-locator="submission-result"]';
//     const COMPILE_ERROR_SELECTOR = '[data-e2e-locator="console-result"]';
//     const SUBMIT_BUTTON_SELECTOR = '[data-e2e-locator="console-submit-button"]';

//     let currentUrl = document.location.href; // Track the current URL
//     let isInitialized = false; // Flag to ensure the script is initialized only once

//     /* ******** UTILS ******** */

//     // Utility function to wait for an element to appear
//     async function waitForElement(selector, timeout = 30000) {
//         return new Promise((resolve, reject) => {
//             const startTime = Date.now();

//             const checkForElement = () => {
//                 const element = document.querySelector(selector);
//                 if (element) {
//                     resolve(element);
//                 } else if (Date.now() - startTime > timeout) {
//                     reject(new Error(`Timeout waiting for selector: ${selector}`));
//                 } else {
//                     requestAnimationFrame(checkForElement);
//                 }
//             };
//             checkForElement();
//         });
//     }

//     /* ******** HELPERS ******** */

//     // Monitors submission result for accepted or compile error
//     async function monitorSubmissionResult() {
//         console.log("Monitoring for submission result");

//         try {
//             const compileErrorPromise = waitForElement(COMPILE_ERROR_SELECTOR, 30000)
//                 .then((element) => {
//                     if (element.textContent.includes("Compile Error")) {
//                         console.log("Compile Error Detected:", element.textContent);
//                         return { type: "compileError", element };
//                     }
//                 });

//             const submissionStatusPromise = waitForElement(SUBMISSION_STATUS_SELECTOR, 30000)
//                 .then((element) => {
//                     console.log("Submission status detected:", element.textContent);
//                     return { type: "submissionStatus", element };
//                 });

//             // Wait for the first result
//             const result = await Promise.race([compileErrorPromise, submissionStatusPromise]);

//             if (result?.type === "compileError") {
//                 console.log("Compile Error Handling Complete");
//             } else if (result?.type === "submissionStatus") {
//                 const submissionStatus = result.element;
//                 if (submissionStatus.textContent.includes("Accepted")) {
//                     console.log("Solution Accepted");
//                 } else {
//                     console.log("Submission result:", submissionStatus.textContent);
//                 }
//             }
//         } catch (error) {
//             console.error("Error during submission monitoring:", error.message);
//         }
//     }

//     // Script Initialization
//     const init = async () => {
//         if (isInitialized) {
//             console.log("Script already initialized. Skipping...");
//             return; // Prevent reinitialization
//         }

//         isInitialized = true; // Mark script as initialized
//         console.log("Initializing script");

//         try {
//             const submitButton = await waitForElement(SUBMIT_BUTTON_SELECTOR, 30000);
//             console.log("Checking for submit button");
//             if (submitButton) {
//                 console.log("Submit button detected");

//                 // Remove existing listeners before adding a new one
//                 submitButton.removeEventListener("click", handleSubmitButtonClick);

//                 // Add a click event listener for the "Submit" button
//                 submitButton.addEventListener("click", handleSubmitButtonClick, { once: true });
//             }
//         } catch (error) {
//             console.error(error.message);
//         }
//     };

//     // Handle the Submit button click
//     const handleSubmitButtonClick = async () => {
//         console.log("Submit button clicked!");
//         console.log("Waiting for result...");

//         // Monitor for submission results
//         await monitorSubmissionResult();

//         console.log("Submission result handled.");
//         isInitialized = false; // Allow reinitialization after handling the submission
//     };

//     /* ******** MUTATION OBSERVER ******** */

//     const observer = new MutationObserver(() => {
//         if (document.location.href !== currentUrl) {
//             currentUrl = document.location.href;
//             console.log("URL changed to:", currentUrl);

//             // Reinitialize the content script when the URL changes
//             if (currentUrl.includes("leetcode.com")) {
//                 console.log("Reinitializing script due to URL change...");
//                 isInitialized = false; // Allow reinitialization for the new URL
//                 init();
//             }
//         }
//     });

//     // Start observing DOM changes for URL updates
//     observer.observe(document, { subtree: true, childList: true });

//     // Call the initialization function on script load
//     init();
// })();

(() => {
    console.log("Extension Loaded");

    /* ******** GLOBAL VARIABLES ******** */

    const SUBMISSION_STATUS_SELECTOR = '[data-e2e-locator="submission-result"]';
    const COMPILE_ERROR_SELECTOR = '[data-e2e-locator="console-result"]';
    const SUBMIT_BUTTON_SELECTOR = '[data-e2e-locator="console-submit-button"]';

    let currentBaseUrl = extractBaseUrl(); // Track the base part of the URL
    let isInitialized = false; // Ensure the script initializes only once per page

    /* ******** UTILS ******** */

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

    // Extract the base part of the URL (e.g., /problems/reverse-integer)
    function extractBaseUrl() {
        const url = new URL(window.location.href);
        const pathParts = url.pathname.split("/");
        return `/${pathParts[1]}/${pathParts[2]}`; // Returns `/problems/<problem-name>`
    }

    /* ******** HELPERS ******** */

    // Monitor submission result for "Accepted" or "Compile Error"
    async function monitorSubmissionResult() {
        console.log("Monitoring for submission result...");

        try {
            const compileErrorPromise = waitForElement(COMPILE_ERROR_SELECTOR, 30000)
                .then((element) => {
                    if (element.textContent.includes("Compile Error")) {
                        console.log("Compile Error Detected:", element.textContent);
                        // alert("Compile Error Detected!");
                        return { type: "compileError", element };
                    }
                });

            const submissionStatusPromise = waitForElement(SUBMISSION_STATUS_SELECTOR, 30000)
                .then((element) => {
                    console.log("Submission status detected:", element.textContent);
                    return { type: "submissionStatus", element };
                });

            // Wait for the first result
            const result = await Promise.race([compileErrorPromise, submissionStatusPromise]);

            if (result?.type === "compileError") {
                console.log("Compile Error Handling Complete.");
            } else if (result?.type === "submissionStatus") {
                const submissionStatus = result.element;
                if (submissionStatus.textContent.includes("Accepted")) {
                    console.log("Solution Accepted");
                    // alert("Your solution was Accepted! 🎉");
                } else {
                    console.log("Submission result:", submissionStatus.textContent);
                    // alert(`Submission result: ${submissionStatus.textContent}`);
                }
            }
        } catch (error) {
            console.error("Error during submission monitoring:", error.message);
        } finally {
            console.log("*******************");
            // Allow reinitialization after the submission is handled
            console.log("Reinitializing script after submission...");
            isInitialized = false; // Reset the flag for reinitialization
            init(); // Reinitialize for subsequent submissions
        }
    }

    // Initialize the script and attach listeners
    const init = async () => {
        if (isInitialized) {
            console.log("Script already initialized. Skipping...");
            return; // Prevent duplicate initialization
        }

        isInitialized = true; // Mark the script as initialized
        console.log(`Initializing script for URL: ${currentBaseUrl}`);

        try {
            const submitButton = await waitForElement(SUBMIT_BUTTON_SELECTOR, 30000);
            console.log("Checking for submit button");
            if (submitButton) {
                console.log("Submit button detected");

                // Remove existing listeners before adding a new one
                submitButton.removeEventListener("click", handleSubmitButtonClick);

                // Add a click event listener for the "Submit" button
                submitButton.addEventListener("click", handleSubmitButtonClick, { once: true });
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    // Handle the "Submit" button click
    const handleSubmitButtonClick = async () => {
        console.log("Submit button clicked!");
        console.log("Waiting for result...");

        // Monitor for submission results
        await monitorSubmissionResult();
    };

    /* ******** MUTATION OBSERVER ******** */

    const observer = new MutationObserver(() => {
        const newBaseUrl = extractBaseUrl();
        if (newBaseUrl !== currentBaseUrl) {
            currentBaseUrl = newBaseUrl;
            console.log("Base URL changed to:", currentBaseUrl);

            // Reinitialize the script when the base URL changes
            if (currentBaseUrl.includes("/problems/")) {
                console.log("*******************");
                console.log("Reinitializing script due to base URL change...");
                isInitialized = false; // Reset initialization flag
                init(); // Reinitialize for the new URL
            }
        }
    });

    // Start observing DOM changes for URL updates
    observer.observe(document.body, { childList: true, subtree: false });

    // Call the initialization function on script load
    init();
})();