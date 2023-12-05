import { renderCountries,allCountries } from "../main.js";
import { searchByNameAndRegion } from "./search.js";
/**
 * Filters countries based on the selected region.
 * @param {string} selectedRegion - The selected region filter.
 */

export const filterByRegion = (selectedRegion) => {
    console.log('Selected Region:', selectedRegion);

    const dropdownButton = document.getElementById('dropdownMenuButton');
    dropdownButton.textContent = selectedRegion === 'Favorites' ? 'Favorites' : `Filter by`;

    let filteredCountries = [];

    if (selectedRegion === 'All') {
        filteredCountries = allCountries;
    } else if (selectedRegion === 'Favorites') {
        filteredCountries = getFavoriteCountries();
    } else {
        filteredCountries = allCountries.filter(country => country.region === selectedRegion);
    }

    const searchQuery = document.getElementById('searchInput').value;
    searchByNameAndRegion(searchQuery, selectedRegion);

    if (filteredCountries.length === 0) {
        const countriesContainer = document.getElementById('countriesContainer');
        const noresult = document.createElement('p');
        noresult.textContent = 'No results found';
        countriesContainer.appendChild(noresult);
    }

    //Render the filtered countries
    renderCountries(filteredCountries);
    dropdownButton.textContent = `${selectedRegion}`;
};


/**
 * Retrieves favorite countries from local storage.
 * @returns {Array} An array of favorite countries.
 */
export function getFavoriteCountries() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const favoriteCountries = allCountries.filter(country => favorites.includes(getCountryCode(country)));
    return favoriteCountries;
}

/**
 * Retrieves a unique identifier for the country.
 * @param {Object} country - The country object.
 * @returns {string} The country code.
 */

export function getCountryCode(country) {
    return country.name.common;
}