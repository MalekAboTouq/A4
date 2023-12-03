const fetchCountryData = async (countryName) => {
    try {
        const response = await fetch(`https://restcountries.com/v3.1/name/${countryName}`);
        const [countryData] = await response.json();

        if (!countryData) {
            console.error(`Country data not found for ${countryName}`);
            return;
        }

        showCountryDetails(countryData);
    } catch (error) {
        console.error('Error fetching country data:', error);
    }
};

// Function to populate country details on the page
const showCountryDetails = (countryData) => {
    const countryFlag = document.getElementById('countryFlag');
    const countryNameElement = document.getElementById('countryName');
    const nativeNameElement = document.getElementById('nativeName');
    const populationElement = document.getElementById('population');
    const regionElement = document.getElementById('Region');
    const subregionElement = document.getElementById('SubRegion');
    const capitalElement = document.getElementById('Capital');
    const toplevelElement = document.getElementById('topLevelDomain');
    const currencyElement = document.getElementById('currencies');
    const languagesElement = document.getElementById('Languages');
    const borderCountriesElement = document.getElementById('borderCountries');


    countryFlag.src = countryData.flags.svg;
    countryNameElement.textContent = countryData.name.common;
    nativeNameElement.textContent = countryData.name.common || 'N/A';
    populationElement.textContent = countryData.population;
    regionElement.textContent = countryData.region;
    subregionElement.textContent =countryData.subregion;
    capitalElement.textContent = countryData.capital;
    toplevelElement.textContent = countryData.tld;
    const currencies = countryData.currencies;


    //Check if currencies exist before setting the content
    if (currencies) {
    const currencyNames = Object.values(currencies).map(currency => currency.name).join(', ');
    currencyElement.textContent = currencyNames;
    } else {
    //Handle the case where currencies are not available
    currencyElement.textContent = 'Not Available';
    }

    const languages = countryData.languages;

    if (languages) {
    const languageNames = Object.values(languages).join(', ');
    languagesElement.textContent = languageNames;
    } else {
    languagesElement.textContent = 'Not Available';
    }

    //Limit to three bordering countries
    const borderCountries = countryData.borders || [];
    const limitedBorderCountries = borderCountries.slice(0, 3);

    if (limitedBorderCountries.length > 0) {
        limitedBorderCountries.forEach(border => {
            const borderBox = document.createElement('span');
            // borderBox.classList.add('border-countries');
            borderBox.classList.add('border-box');
            borderBox.textContent = border;
            borderCountriesElement.appendChild(borderBox);
        });
    } else {
        borderCountriesElement.textContent = 'No bordering countries';
    }
};

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

const urlParams = new URLSearchParams(window.location.search);
const countryName = urlParams.get('country');


fetchCountryData(countryName);