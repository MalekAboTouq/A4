import { fetchCountries } from "./modules/apifetch.js";
import { toggleDarkMode, initializeDarkMode } from './modules/darkTheme.js';
import { filterByRegion,getCountryCode} from './modules/filter.js';
import { searchByNameAndRegion } from "./modules/search.js";
export const loadingIndicator = document.getElementById('loadingIndicator');
const faviconsContainer = document.querySelector('.favicons');
export let allCountries = [];


// Add event listeners for dropdown items
document.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', function () {
        const selectedRegion = this.dataset.region;
        filterByRegion(selectedRegion);
    });
});


/**
 * Renders countries based on the provided data.
 * @param {Array} countries - An array of country data.
 */
export const renderCountries = (countries) => {
    const countriesContainer = document.getElementById('countriesContainer');
    const isSmallScreen = window.innerWidth < 576;

    countriesContainer.innerHTML = '';

    if (countries.length === 0) {
        const noresult = document.createElement('p');
        noresult.textContent = 'No results found';
        countriesContainer.appendChild(noresult);
    } else {
        countries.forEach(country => {
            const { name, flags, population, region, capital } = country;
            const UrlFlag = flags.svg;
            const card = document.createElement('div');
            card.classList.add('col-lg-3', 'country-card');
            card.dataset.countryName = name.common;
            const countryCode = getCountryCode(country);
            card.dataset.countryCode = countryCode;
            card.draggable = true; // card draggable

            // Check if the country is in favorites
            const isFavorite = isCountryInFavorites(countryCode);
            const starClass = isFavorite && isSmallScreen ? 'filled' : '';

            // Check if the country should be hidden when filtering by favorites
            const isHidden = document.getElementById('dropdownMenuButton').textContent === 'Favorites' && !isFavorite;

            card.innerHTML = `
                <div class="card" style="display: ${isHidden ? 'none' : 'block'};">
                    <img src="${UrlFlag}" class="card-img-top" style="height: 50%; object-fit: cover;" alt="..." type="button">
                    <div class="card-body" style="padding-bottom: 0px;">
                        <h2 class="card-title text-truncate" type="button">${name.common}</h2>
                        <p class="card-text text-truncate"><span class="bold">Population:</span> ${population}</p>
                        <p class="card-text text-truncate"><span class="bold">Region:</span> ${region}</p>
                        <p class="card-text text-truncate"><span class="bold">Capital:</span> ${capital}</p>
                        
                        
                        <div class="starRight">
                            <button class="favorite-star ${starClass}" data-countryCode="${countryCode}">
                                &#9733;
                            </button>
                        </div>
                    </div>
                    
                </div>
            `;
            countriesContainer.appendChild(card);
        });

        addCountryCardClickListeners();
        addCountryCardDragListeners();
        loadFavoritesFromLocalStorage();
    }
};

/**
 * Updates the favorites list in local storage based on the star click.
 * @param {string} countryCode - The country code.
 */
function updateFavoritesInLocalStorage(countryCode) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    const index = favorites.indexOf(countryCode);
    if (index !== -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(countryCode);
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
}

// Add a click event listener to each star
document.querySelectorAll('.favorite-star').forEach(star => {
    star.addEventListener('click', function () {
        const countryCode = this.dataset.countryCode;
        // Toggle the 'filled' class when the star is clicked
        this.classList.toggle('filled');
        // Update the favorites in local storage based on the star click
        updateFavoritesInLocalStorage(countryCode);
    });
});

// Function to check if the country is in favorites
function isCountryInFavorites(countryCode) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    return favorites.includes(countryCode);
}

function toggleFavorite(star) {
    const countryCard = star.closest('.country-card');
    
    if (!countryCard) {
        console.error('Country card not found');
        return;
    }

    const countryCode = countryCard.dataset.countryCode;
    const isFavorite = star.classList.toggle('filled');

    if (isFavorite) {
        addToFavorites(countryCard);
    } else {
        removeFromFavorites(countryCode);
    }
}
// Add event listener for country card clicks
document.addEventListener('click', function (event) {
    const target = event.target;

    // Check if the clicked element is a favorite star
    if (target.classList.contains('favorite-star')) {
        const countryCode = target.dataset.countryCode;
        toggleFavorite(target, countryCode);
    }
});


// Add a click event listener to each star
document.querySelectorAll('.favorite-star').forEach(star => {
    star.addEventListener('click', function () {
        const countryCode = this.dataset.countryCode;
        //Toggle the 'filled' class when the star is clicked
        this.classList.toggle('filled');
        //Update the favorites in local storage based on the star click
        updateFavoritesInLocalStorage(countryCode);
    });
});


/**
 * Handles the click event for country cards.
 * Navigates to the country page unless the click is on a favorite star.
 * @param {string} countryName - The name of the clicked country.
 * @param {Event} event - The click event.
 */
function handleCountryCardClick(countryName, event) {
    if (event.target.classList.contains('favorite-star')) {
        return;
    }

    window.location.href = `country.html?country=${encodeURIComponent(countryName)}`;
}

/**
 * Adds click event listeners to all country cards.
 */
function addCountryCardClickListeners() {
    const countryCards = document.querySelectorAll('.country-card');
    countryCards.forEach((card) => {
        card.addEventListener('click', function (event) {
            const countryName = this.dataset.countryName;
            handleCountryCardClick(countryName, event);
        });
    });
}


/**
 * Adds drag start event listeners to all country cards.
 */function addCountryCardDragListeners() {
    const countryCards = document.querySelectorAll('.country-card');
    countryCards.forEach((card) => {
        card.addEventListener('dragstart', function (event) {
            event.dataTransfer.setData('text/plain', this.dataset.countryCode);
        });
    });
}


/**
 * Handles the drop event for the favicons container.
 * Adds the dragged country card to favorites.
 * @param {Event} event - The drop event.
 */
faviconsContainer.addEventListener('drop', function (event) {
    event.preventDefault();
    const countryCode = event.dataTransfer.getData('text/plain');
    const draggedCard = document.querySelector(`[data-country-code="${countryCode}"]`);

    addToFavorites(draggedCard);
    event.dataTransfer.clearData();
});


/**
 * Handles the dragover event for the favicons container.
 * Displays a dashed border to indicate drop zone.
 * @param {Event} event - The dragover event.
 */
faviconsContainer.addEventListener('dragover', function (event) {
    event.preventDefault();
    this.style.border = '2px dashed #27ae60';
});

/**
 * Handles the dragleave event for the favicons container.
 * Removes the dashed border on drag leave.
 */
faviconsContainer.addEventListener('dragleave', function () {
    this.style.border = 'none';
});

/**
 * Handles the drop event for the favicons container.
 * Removes the dashed border and adds the dragged country card to favorites.
 * @param {Event} event - The drop event.
 */
faviconsContainer.addEventListener('drop', function (event) {
    event.preventDefault();
    this.style.border = 'none';

    const countryCode = event.dataTransfer.getData('text/plain');
    const draggedCard = document.querySelector(`[data-country-code="${countryCode}"]`);

    addToFavorites(draggedCard);
    event.dataTransfer.clearData();
});

/**
 * Adds a country card to the favorites container.
 * @param {HTMLElement} draggedCard - The dragged country card.
 */
function addToFavorites(draggedCard) {
    const countryCode = draggedCard.dataset.countryCode;
    const countryName = draggedCard.dataset.countryName;

    //Check if the country is already in favorites
    if (faviconsContainer.querySelector(`[data-country-code="${countryCode}"]`)) {
        return;
    }

    //full country name
    const fullCountryName = draggedCard.querySelector('.card-title').textContent;

    const favoriteCard = document.createElement('div');
    favoriteCard.classList.add('favorite-card', 'd-flex', 'align-items-center', 'justify-content-between');
    favoriteCard.dataset.countryCode = countryCode;

    //div for content
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('d-flex', 'align-items-center');
    contentDiv.style.width = '154px'; // Set the desired width

    const img = document.createElement('img');
    img.src = draggedCard.querySelector('img').src;
    img.alt = countryCode;
    img.style.width = '35px';
    img.style.height = '20px';
    img.style.cursor = 'pointer';
    img.style.borderRadius = '0.3rem';
    img.addEventListener('click', () => window.location.href = `country.html?country=${encodeURIComponent(countryName)}`);

    // Span for country name
    const countryNameSpan = document.createElement('span');
    countryNameSpan.textContent = countryName;
    countryNameSpan.classList.add('text-truncate');
    countryNameSpan.style.overflow = 'hidden';
    countryNameSpan.style.whiteSpace = 'nowrap';
    countryNameSpan.style.textOverflow = 'ellipsis'; // Add ellipsis for visual indication
    countryNameSpan.style.fontWeight = 600;
    countryNameSpan.style.paddingLeft = "10px";
    countryNameSpan.style.fontSize = "16px";
    countryNameSpan.style.cursor = 'pointer';
    countryNameSpan.setAttribute('title', fullCountryName); // Store the full name as a tooltip
    countryNameSpan.addEventListener('click', () => window.location.href = `country.html?country=${encodeURIComponent(countryName)}`);

    // Append image and country name to contentDiv
    contentDiv.appendChild(img);
    contentDiv.appendChild(countryNameSpan);

    // Create a div for the remove button
    const buttonDiv = document.createElement('div');

    // Create a button to remove from favorites
    const removeButton = document.createElement('button');
    removeButton.innerHTML = '&times;';
    removeButton.classList.add('btn', 'btn-link', 'remove-button'); // Add remove-button class
    removeButton.style.border = 'none'; // Remove border to make it a circle
    removeButton.addEventListener('click', () => removeFromFavorites(countryCode));

    // Append removeButton to buttonDiv
    buttonDiv.appendChild(removeButton);

    // Append contentDiv and buttonDiv to favoriteCard
    favoriteCard.appendChild(contentDiv);
    favoriteCard.appendChild(buttonDiv);


    faviconsContainer.appendChild(favoriteCard);
    saveFavoritesToLocalStorage();
}


/**
 * Saves the current favorites to local storage.
 */
function saveFavoritesToLocalStorage() {
    const favorites = Array.from(faviconsContainer.children).map(card => card.dataset.countryCode);
    localStorage.setItem('favorites', JSON.stringify(favorites));
}


/**
 * Removes a country from the favorites container and updates local storage.
 * @param {string} countryCode - The country code to remove.
 */
function removeFromFavorites(countryCode) {
    const favoriteCard = faviconsContainer.querySelector(`[data-country-code="${countryCode}"]`);
    if (favoriteCard) {
        faviconsContainer.removeChild(favoriteCard);
        saveFavoritesToLocalStorage();

        // Retrieve the current selected region
        const selectedRegion = document.getElementById('dropdownMenuButton').textContent;
        
        // If the current region is 'Favorites', re-render the countries to hide the removed country
        if (selectedRegion === 'Favorites') {
            filterByRegion('Favorites');
        }
    }
}

function loadFavoritesFromLocalStorage() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites.forEach(countryCode => {
        const countryCard = document.querySelector(`[data-country-code="${countryCode}"]`);
        if (countryCard) {
            addToFavorites(countryCard);
        }
    });
}

/**
 * Event listener for the search input.
 * Executes a search based on user input and selected region.
 */
document.getElementById('searchInput').addEventListener('keyup', function () {
    /**
     * Handles the keyup event for the search input.
     * @param {KeyboardEvent} event - The keyup event.
     */
    const handleSearchInput = (event) => {
        const searchQuery = this.value;
        const selectedRegion = document.getElementById('dropdownMenuButton').dataset.selectedRegion || 'All';
        searchByNameAndRegion(searchQuery, selectedRegion);
    };

    // Execute the handleSearchInput function on keyup
    handleSearchInput(event);
});

// Event listener for the dark mode toggle button
document.getElementById('darkModeToggle').addEventListener('click', function (event) {
    const toggleAction = event.currentTarget.dataset.toggleAction;
    if (toggleAction === 'toggleDarkMode') {
        toggleDarkMode();
    }
});

// ... (existing code)

// Checks if dark mode is enabled and sets it accordingly.
initializeDarkMode();


const overlayContainer = document.getElementById('overlayContainer');

const showOverlay = () => {
    overlayContainer.style.display = 'flex';
    overlayContainer.style.flexDirection = 'column';
    overlayContainer.style.justifyContent = 'center';
};

const hideOverlay = () => {
    overlayContainer.style.display = 'none';
};

// Show overlay before fetching data
showOverlay();

// Fetch countries and render them
fetchCountries()
    .then(countries => {
        allCountries = countries;
        renderCountries(countries);
        hideOverlay(); // Hide overlay on successful data fetch
    })
    .catch(error => {
        console.error('Error fetching countries:', error);
        hideOverlay(); // Hide overlay on error
    });