import { renderCountries,allCountries } from "../main.js";

/**
 * Asynchronously searches for countries by name using the API.
 * @param {string} name - The name of the country to search for.
 * @returns {Promise} A promise that resolves to the search results.
 */
export const searchCountriesByName = async (name) => {
    try {
        const response = await fetch(`https://restcountries.com/v3.1/name/${name}`);

        if (!response.ok) {
            // If the response status is not okay, check for a 404 error
            if (response.status === 404) {
                // Display "No results found" message
                const noresult = document.createElement('p');
                noresult.textContent = 'No results found';
                countriesContainer.innerHTML = ''; // Clear previous results
                countriesContainer.appendChild(noresult);
            } else {
                // Handle other errors if needed
                throw new Error(`Error: ${response.statusText}`);
            }
        } else {
            const data = await response.json();
            // renderCountries(response);
            return data;
        }
    } catch (error) {
        // Handle general errors and log them to the console
        console.error('Error searching countries by name:', error);
        // Throw the error again to propagate it if needed
        throw error;
    }
};


/**
 * Searches and filters countries by name and region.
 * @param {string} query - The search query.
 * @param {string} selectedRegion - The selected region filter.
 */
export const searchByNameAndRegion = async (query, selectedRegion) => {
    try {
        let searchedCountries = [];

        if (query.trim() !== '') {
            // Search by country name
            searchedCountries = await searchCountriesByName(query);

            // Filter by selected region only if it's not "Favorites"
            if (selectedRegion !== 'Favorites') {
                searchedCountries = searchedCountries.filter(country => {
                    const countryregion = selectedRegion === 'All' || country.region === selectedRegion;
                    return countryregion;
                });
            }
        } else {
            // If the search query is empty, use all countries
            searchedCountries = allCountries;

            // Filter by selected region only if it's not "Favorites"
            if (selectedRegion !== 'Favorites') {
                searchedCountries = searchedCountries.filter(country => {
                    const countryregion = selectedRegion === 'All' || country.region === selectedRegion;
                    return countryregion;
                });
            }
        }

        renderCountries(searchedCountries);

        // Clear previous error message
        clearErrorMessage();

        localStorage.setItem('lastSearchQuery', query);
    } catch (error) {
        console.error('Error in searchByNameAndRegion:', error);
    }
};

/**
 * Clears the error message element.
 */
export function clearErrorMessage() {
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage) {
        errorMessage.textContent = '';
    }
}

