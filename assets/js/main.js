const loadingIndicator = document.getElementById('loadingIndicator');
const faviconsContainer = document.querySelector('.favicons');
let allCountries = [];

const fetchCountries = async () => {
    try {
        loadingIndicator.style.display = 'block';
        await new Promise(resolve => setTimeout(resolve, 2000));

        const response = await fetch('https://restcountries.com/v3.1/all');
        if (!response.ok) {
            throw new Error(`Error fetching countries: ${response.statusText}`);
        }

        const data = await response.json();
        loadingIndicator.style.display = 'none';
        return data;
    } catch (error) {
        console.error(error.message);
        const errorMessageElement = document.getElementById('errorMessage');
        if (errorMessageElement) {
            errorMessageElement.textContent = 'Error fetching countries. Please try again later.';
        }
        loadingIndicator.style.display = 'none';
    }
};


const filterByRegion = (selectedRegion) => {
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
function getFavoriteCountries() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const favoriteCountries = allCountries.filter(country => favorites.includes(getCountryCode(country)));
    return favoriteCountries;
}



//countries by name
const searchCountriesByName = async (name) => {
    try {
        const response = await fetch(`https://restcountries.com/v3.1/name/${name}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error searching countries by name:', error);
        throw error;
    }
};


const searchByNameAndRegion = async (query, selectedRegion) => {
    try {
        let searchedCountries = [];

        if (query.trim() !== '') {
            //search by country name
            searchedCountries = await searchCountriesByName(query);

            searchedCountries = searchedCountries.filter(country => {
                const countryregion = selectedRegion === 'All' || country.region === selectedRegion;
                return countryregion;
            });
        } else {
            //if the search query is empty use all countries
            searchedCountries = allCountries;

            //filter by selected region
            searchedCountries = searchedCountries.filter(country => {
                const countryregion = selectedRegion === 'All' || country.region === selectedRegion;
                return countryregion;
            });
        }

        renderCountries(searchedCountries);

        localStorage.setItem('lastSearchQuery', query);
    } catch (error) {
        console.error('Error in searchByNameAndRegion:', error);
    }
};

const renderCountries = (countries) => {
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
            card.draggable = true; //card draggable

            const isFavorite = isCountryInFavorites(countryCode);
            const starClass = isFavorite && isSmallScreen ? 'filled' : '';

            card.innerHTML = `
                <div class="card">
                    <img src="${UrlFlag}" class="card-img-top" style="height: 50%; object-fit: cover;" alt="..." type="button">
                    <div class="card-body">
                        <h2 class="card-title text-truncate" type="button">${name.common}</h2>
                        <p class="card-text text-truncate"><span class="bold">Population:</span> ${population}</p>
                        <p class="card-text text-truncate"><span class="bold">Region:</span> ${region}</p>
                        <p class="card-text text-truncate"><span class="bold">Capital:</span> ${capital}</p>
                        <button class="favorite-star ${starClass}" onclick="toggleFavorite(this, '${countryCode}')">
                            &#9733;
                        </button>
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

// Function to check if a country is in favorites
function isCountryInFavorites(countryCode) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    return favorites.includes(countryCode);
}




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

//load favorites from local storage
function loadFavoritesFromLocalStorage() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    favorites.forEach(countryCode => {
        const star = document.querySelector(`.favorite-star[data-country-code="${countryCode}"]`);
        if (star) {
            star.classList.add('filled');
        }
    });
}



function handleCountryCardClick(countryName, event) {
    if (event.target.classList.contains('favorite-star')) {
        return;
    }

    window.location.href = `country.html?country=${encodeURIComponent(countryName)}`;
}

function addCountryCardClickListeners() {
    const countryCards = document.querySelectorAll('.country-card');
    countryCards.forEach((card) => {
        card.addEventListener('click', function (event) {
            const countryName = this.dataset.countryName;
            handleCountryCardClick(countryName, event);
        });
    });
}


// Event listener for country card drag start
function addCountryCardDragListeners() {
    const countryCards = document.querySelectorAll('.country-card');
    countryCards.forEach((card) => {
        card.addEventListener('dragstart', function (event) {
            event.dataTransfer.setData('text/plain', this.dataset.countryCode);
        });
    });
}


//drop event to handle dropping
faviconsContainer.addEventListener('drop', function (event) {
    event.preventDefault();
    const countryCode = event.dataTransfer.getData('text/plain');
    const draggedCard = document.querySelector(`[data-country-code="${countryCode}"]`);

    addToFavorites(draggedCard);
    event.dataTransfer.clearData();
});

//dragover event to allow dropping
faviconsContainer.addEventListener('dragover', function (event) {
    event.preventDefault();
    this.style.border = '2px dashed #27ae60';
});

faviconsContainer.addEventListener('dragleave', function () {
    this.style.border = 'none';
});


faviconsContainer.addEventListener('drop', function (event) {
    event.preventDefault();
    this.style.border = 'none';

    const countryCode = event.dataTransfer.getData('text/plain');
    const draggedCard = document.querySelector(`[data-country-code="${countryCode}"]`);

    addToFavorites(draggedCard);
    event.dataTransfer.clearData();
});



function addToFavorites(draggedCard) {
    const countryCode = draggedCard.dataset.countryCode;
    const countryName = draggedCard.dataset.countryName;


    //Check if the country is already in favorites
    if (faviconsContainer.querySelector(`[data-country-code="${countryCode}"]`)) {
        return;
    }

    const favoriteCard = document.createElement('div');
    favoriteCard.classList.add('favorite-card', 'd-flex', 'align-items-center', 'justify-content-between');
    favoriteCard.dataset.countryCode = countryCode;

    //small image
    const img = document.createElement('img');
    img.src = draggedCard.querySelector('img').src;
    img.alt = countryCode;
    img.style.width = '30px';
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => handleCountryCardClick(countryCode));

    //span for country name
    const countryNameSpan = document.createElement('span');
    countryNameSpan.textContent = draggedCard.querySelector('.card-title').textContent;
    countryNameSpan.classList.add('text-truncate');
    countryNameSpan.style.marginRight = '10px';
    countryNameSpan.style.cursor = 'pointer';
    countryNameSpan.addEventListener('click', () => window.location.href = `country.html?country=${encodeURIComponent(countryName)}`);
    favoriteCard.appendChild(img);
    favoriteCard.appendChild(countryNameSpan);

    // Create a button to remove from favorites
    const removeButton = document.createElement('button');
    removeButton.innerHTML = '&times;';
    removeButton.classList.add('btn', 'btn-link', 'rounded-circle', 'remove-button'); // Add remove-button class
    removeButton.style.border = 'none'; // Remove border to make it a circle
    removeButton.addEventListener('click', () => removeFromFavorites(countryCode));
    favoriteCard.appendChild(removeButton);


    faviconsContainer.appendChild(favoriteCard);

    saveFavoritesToLocalStorage();
}



function saveFavoritesToLocalStorage() {
    const favorites = Array.from(faviconsContainer.children).map(card => card.dataset.countryCode);
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function removeFromFavorites(countryCode) {
    const favoriteCard = faviconsContainer.querySelector(`[data-country-code="${countryCode}"]`);
    if (favoriteCard) {
        faviconsContainer.removeChild(favoriteCard);
        saveFavoritesToLocalStorage();
    }
}

//Load favorites from local storage
function loadFavoritesFromLocalStorage() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites.forEach(countryCode => {
        const countryCard = document.querySelector(`[data-country-code="${countryCode}"]`);
        if (countryCard) {
            addToFavorites(countryCard);
        }
    });
}

//Function to get a unique id for the country
function getCountryCode(country) {
    return country.name.common;
}



//Event listener for search input
document.getElementById('searchInput').addEventListener('keyup', function () {
    const searchQuery = this.value;
    const selectedRegion = document.getElementById('dropdownMenuButton').dataset.selectedRegion || 'All';
    searchByNameAndRegion(searchQuery, selectedRegion);
});


// Function to toggle dark mode
function toggleDarkMode() {
    const body = document.body;
    const isDarkMode = body.classList.toggle('dark-mode');
    const modeText = isDarkMode ? 'Light mode' : 'Dark mode';
    localStorage.setItem('darkMode', isDarkMode);
    setModeText(modeText);
}


//set mode text
function setModeText(text) {
    const modeTextElement = document.getElementById('modeText');
    if (modeTextElement) {
        modeTextElement.textContent = text;
    }
}


// Check if dark mode is enabled and set it
const darkMode = localStorage.getItem('darkMode') === 'true';
if (darkMode) {
    document.body.classList.add('dark-mode');
    setModeText('Light mode');
} else {
    setModeText('Dark mode');
}



fetchCountries()
    .then(countries => {
        allCountries = countries;
        renderCountries(countries);
    })
    .catch(error => console.error('Error fetching countries:', error));