import { waitForElement } from './utils.js';

export async function setupCompileErrorListener() {
    try {
        const compileErrorElement = await waitForElement('[data-e2e-locator="compile-error"]', 5000);
        if (compileErrorElement) {
            console.log('Compile Error Detected:', compileErrorElement.textContent);
            alert('Compile Error Detected!');
            return true; // Indicate that a compile error was found
        }
    } catch (error) {
        console.log('No compile error detected within timeout.');
    }
    return false; // No compile error found
}