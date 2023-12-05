/**
 * Asynchronously fetches countries data from the API.
 * @returns {Promise} A promise that resolves to the fetched countries data.
 */
import { loadingIndicator } from "../main.js";
async function fetchCountries() {
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const response = await fetch('https://restcountries.com/v3.1/all');
        if (!response.ok) {
            throw new Error(`Error fetching countries: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error.message);
        const errorMessageElement = document.getElementById('errorMessage');
        if (errorMessageElement) {
            errorMessageElement.textContent = 'Error fetching countries. Please try again later.';
        }
        loadingIndicator.style.display = 'none';
        throw error;
    }
};

export { fetchCountries }