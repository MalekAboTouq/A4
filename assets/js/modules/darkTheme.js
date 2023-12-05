/**
 * Toggles between dark and light mode.
 */
export function toggleDarkMode() {
    /**
     * Toggles between dark and light mode.
     * Updates the display text and saves the mode to local storage.
     */
    const body = document.body;
    const isDarkMode = body.classList.toggle('dark-mode');
    const modeText = isDarkMode ? 'Light mode' : 'Dark mode';
    localStorage.setItem('darkMode', isDarkMode);
    setModeText(modeText);
}

/**
 * Sets the display text for the dark/light mode.
 * @param {string} text - The text to set.
 */
export function setModeText(text) {
    /**
     * Sets the display text for the dark/light mode.
     * @param {string} text - The text to set.
     */
    const modeTextElement = document.getElementById('modeText');
    if (modeTextElement) {
        modeTextElement.textContent = text;
    }
}


/**
 * Checks if dark mode is enabled and sets it accordingly.
 */
export function initializeDarkMode() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
        setModeText('Light mode');
    } else {
        setModeText('Dark mode');
    }
}
