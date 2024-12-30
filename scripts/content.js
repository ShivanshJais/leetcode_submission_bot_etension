console.log("Extension Loaded");

/* ******** CONSTANTS ******** */

const SELECTORS = {
    SUBMISSION_STATUS: '[data-e2e-locator="submission-result"]',
    COMPILE_ERROR: '[data-e2e-locator="console-result"]',
    SUBMIT_BUTTON: '[data-e2e-locator="console-submit-button"]',
    RUNTIME_CONTAINER: '.rounded-sd.group.flex.min-w-\\[275px\\].flex-1.cursor-pointer.bg-sd-accent',
    MEMORY_CONTAINER: '.rounded-sd.group.flex.min-w-\\[275px\\].flex-1.cursor-pointer.opacity-40',
    CODE_TYPE: 'code[class^="language-"]',
};

/* ******** UTILS ******** */

const waitForElement = (selector, timeout = 30000) =>
    new Promise((resolve, reject) => {
        const start = Date.now();
        const checkElement = () => {
            const element = document.querySelector(selector);
            if (element) resolve(element);
            else if (Date.now() - start > timeout) reject(new Error(`Timeout waiting for selector: ${selector}`));
            else requestAnimationFrame(checkElement);
        };
        checkElement();
    });

const extractBaseUrl = () => {
    const urlParts = window.location.pathname.split("/");
    return `/${urlParts[1]}/${urlParts[2]}`;
};

/* ******** GLOBAL VARIABLES ******** */
let currentBaseUrl = extractBaseUrl();
let isInitialized = false;

/* ******** HANDLERS ******** */

const handleSubmitButtonClick = async () => {
    console.log("Submit button clicked, monitoring submission result...");
    await monitorSubmissionResult();
};

const monitorSubmissionResult = async () => {
    try {
        const result = await Promise.race([
            waitForElement(SELECTORS.COMPILE_ERROR, 30000).then((el) => ({
                type: "compileError",
                element: el,
            })),
            waitForElement(SELECTORS.SUBMISSION_STATUS, 30000).then((el) => ({
                type: "submissionStatus",
                element: el,
            })),
        ]);

        if (result.type === "compileError") {
            console.error("Compile Error:", result.element.textContent);
        } else if (result.type === "submissionStatus") {
            const statusText = result.element.textContent;
            console.log("Submission Status:", statusText);

            if (statusText.includes("Accepted")) {
                console.log("Solution Accepted. Collecting submission data...");
                await collectSubmissionData();
            }
        }
    } catch (error) {
        console.error("Error monitoring submission:", error.message);
    } finally {
        reinitialize();
    }
};

const collectSubmissionData = async () => {
    try {
        const runtimeData = await extractPerformanceData(SELECTORS.RUNTIME_CONTAINER);
        const memoryData = await extractPerformanceData(SELECTORS.MEMORY_CONTAINER);
        const { codeType, codeContent } = await extractCodeData();

        const submissionData = {
            Runtime: runtimeData,
            Memory: memoryData,
            "Code Type": codeType,
            Code: codeContent,
        };

        console.log("Submission Data Collected:", submissionData);
    } catch (error) {
        console.error("Error collecting submission data:", error.message);
    }
};

const extractPerformanceData = async (containerSelector) => {
    const container = await waitForElement(containerSelector, 30000);
    if (!container) return { Value: "", Beats: "" };

    const value = container.querySelector("span.text-lg.font-semibold")?.innerText || "";
    const unit = container.querySelector("span.text-sd-muted-foreground.text-sm")?.innerText || "";
    const beats = container.querySelectorAll("span.text-lg.font-semibold")[1]?.innerText || "";

    return {
        Value: value && unit ? `${value} ${unit}` : "",
        Beats: beats,
    };
};

const extractCodeData = async () => {
    const codeElement = await waitForElement(SELECTORS.CODE_TYPE, 30000);
    if (!codeElement) return { codeType: "", codeContent: "" };

    const codeType = codeElement.className.split(" ").find((cls) => cls.startsWith("language-"))?.replace("language-", "") || "";
    const codeContent = codeElement.innerText.trim();

    return { codeType, codeContent };
};

/* ******** INITIALIZATION ******** */

const init = async () => {
    if (isInitialized) return;
    isInitialized = true;
    console.log(`Initializing script for URL: ${currentBaseUrl}`);

    try {
        const submitButton = await waitForElement(SELECTORS.SUBMIT_BUTTON, 30000);
        if (submitButton) {
            console.log("Submit button detected, attaching click handler...");
            submitButton.addEventListener("click", handleSubmitButtonClick, { once: true });
        }
    } catch (error) {
        console.error("Error initializing script:", error.message);
    }
};

const reinitialize = () => {
    console.log("Reinitializing script...");
    isInitialized = false;
    init();
};

/* ******** MUTATION OBSERVER ******** */

new MutationObserver(() => {
    const newBaseUrl = extractBaseUrl();
    if (newBaseUrl !== currentBaseUrl) {
        console.log("URL changed. Reinitializing script...");
        currentBaseUrl = newBaseUrl;
        if (currentBaseUrl.includes("/problems/")) reinitialize();
    }
}).observe(document.body, { childList: true, subtree: false });

/* ******** SCRIPT START ******** */

init();