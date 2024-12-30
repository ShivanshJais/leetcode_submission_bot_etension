import { waitForElement } from './utils.js';

export async function monitorSubmissionResult() {
    console.log("Monitoring for submission results...");

    try {
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