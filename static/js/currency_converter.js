// This file contains JavaScript logic specifically for the Currency converter.
// It relies on common functions and variables defined in script.js (which must be loaded first).

document.addEventListener('DOMContentLoaded', () => {
    // Get elements relevant to Currency converter from the DOM.
    const unitInput = document.getElementById('fromUnitInput');
    const fromUnitSelect = document.getElementById('fromUnitSelect');
    const toUnitSelect = document.getElementById('toUnitSelect');
    const resultDisplay = document.getElementById('conversionResult');
    const searchFromUnitInput = document.getElementById('searchFromUnit');
    const searchToUnitInput = document.getElementById('searchToUnit');
    const searchUnitsButton = document.getElementById('searchUnitsButton');
    const searchUnitsResultMessage = document.getElementById('searchUnitsResultMessage');
    const mainConverterSection = document.getElementById('main-converter-section');
    const resetButton = document.getElementById('resetInputButton');

    // Access global functions and objects exposed from script.js
    const { getConverterInfoFromUrl, performConversion, units, currencyCountryMap, countryCurrencyMap } = window;

    // List of existing specific currency conversion pages (filenames without .html)
    // Please ENSURE these files exist in your 'templates/currency/' folder.
    // Specially make sure 'yes_to_gbp.html' is renamed to 'yen_to_gbp.html' if it's meant to be that.
    const existingSpecificCurrencyPages = [
        'usd_to_pkr', 'pkr_to_usd',
        'euro_to_usd', 'usd_to_euro',
        'gbp_to_yen', 'yen_to_gbp',
        'usd_to_jpy', 'jpy_to_usd',
        'gbp_to_usd', 'usd_to_gbp',
        'aud_to_usd', 'usd_to_aud',
        'usd_to_cad', 'cad_to_usd',
        'usd_to_chf', 'chf_to_usd'
    ];


        // FAQ Accordion Functionality ko ab ek function mein wrap kar diya gaya hai
    // aur usay window object par expose kiya gaya hai.
    window.initializeFaqAccordion = function() {
        const faqQuestions = document.querySelectorAll('.faq-question');

        faqQuestions.forEach(question => {
            question.removeEventListener('click', handleFaqClick); // Remove existing listener to prevent duplicates
            question.addEventListener('click', handleFaqClick); // Add the new listener
        });

        function handleFaqClick() {
            const answer = this.nextElementSibling; // 'this' refers to the clicked question
            faqQuestions.forEach(otherQuestion => {
                if (otherQuestion !== this && otherQuestion.classList.contains('active')) {
                    otherQuestion.classList.remove('active');
                    const otherAnswer = otherQuestion.nextElementSibling;
                    otherAnswer.style.maxHeight = null;
                    otherAnswer.classList.remove('active');
                }
            });

            this.classList.toggle('active'); // 'this' refers to the clicked question
            if (answer.style.maxHeight) {
                answer.style.maxHeight = null;
                answer.classList.remove('active');
            } else {
                answer.style.maxHeight = answer.scrollHeight + "px";
                answer.classList.add('active');
            }
        }
    };

    // Initial call for FAQ on script.js load
    window.initializeFaqAccordion(); // Initial call to set up FAQs on all pages

    // Populates 'From' and 'To' currency dropdowns.
    function populateCurrencyDropdowns(fixedFromUnit = null, fixedToUnit = null) {
        if (!fromUnitSelect || !toUnitSelect) {
            return;
        }

        fromUnitSelect.innerHTML = '';
        toUnitSelect.innerHTML = '';

        const currencyUnits = units.currency || [];

        if (fixedFromUnit && fixedToUnit) {
            // For specific conversion pages (e.g., USD to PKR), dropdowns are hidden.
            // We just set the values based on URL params.
            fromUnitSelect.style.display = 'none';
            toUnitSelect.style.display = 'none';

            // Ensure the value set is the currency code (e.g., 'USD', 'PKR')
            // fixedFromUnit and fixedToUnit might come as 'usd', 'pkr' from URL, convert to uppercase code.
            const fromCode = (countryCurrencyMap[fixedFromUnit.toLowerCase()] || fixedFromUnit).toUpperCase();
            const toCode = (countryCurrencyMap[fixedToUnit.toLowerCase()] || fixedToUnit).toUpperCase();

            const option1 = document.createElement('option');
            option1.value = fromCode;
            option1.textContent = `${fromCode} - ${currencyCountryMap[fromCode] || 'Unknown Currency'}`;
            fromUnitSelect.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = toCode;
            option2.textContent = `${toCode} - ${currencyCountryMap[toCode] || 'Unknown Currency'}`;
            toUnitSelect.appendChild(option2);

        } else {
            // For the main currency converter page, show populated dropdowns.
            fromUnitSelect.style.display = '';
            toUnitSelect.style.display = '';

            currencyUnits.forEach(code => {
                const countryName = currencyCountryMap[code] || 'Unknown Currency';
                
                const option1 = document.createElement('option');
                option1.value = code;
                option1.textContent = `${code} - ${countryName}`;
                fromUnitSelect.appendChild(option1);

                const option2 = document.createElement('option');
                option2.value = code;
                option2.textContent = `${code} - ${countryName}`;
                toUnitSelect.appendChild(option2);
            });

            // Set initial default values if available
            if (currencyUnits.length > 0) {
                fromUnitSelect.value = 'USD'; // Default From to USD
                toUnitSelect.value = 'PKR';   // Default To to PKR
            }
        }

        // Perform initial conversion once dropdowns are populated/set
        if (typeof performConversion === 'function') {
            performConversion();
        } else {
            console.error("performConversion function is not available. Make sure script.js is loaded first and it exposes performConversion globally.");
        }
    }

    // Initial page setup for Currency converter
    function initializeCurrencyConverterPage() {
        const { converterType, fromUnit, toUnit } = getConverterInfoFromUrl();

        if (converterType !== 'currency') {
            return;
        }

        if (mainConverterSection) {
            const heading = mainConverterSection.querySelector('.section-heading');
            const description = mainConverterSection.querySelector('p[style*="text-align: center"]');
            
            if (fromUnit && toUnit) {
                // Display names for specific pages should come from URL units (e.g., 'usd' becomes 'USD')
                // For currency, it's better to show the full name alongside code if available.
                const fromCode = (countryCurrencyMap[fromUnit.toLowerCase()] || fromUnit).toUpperCase();
                const toCode = (countryCurrencyMap[toUnit.toLowerCase()] || toUnit).toUpperCase();

                const displayFromText = `${fromCode} - ${currencyCountryMap[fromCode] || fromCode}`;
                const displayToText = `${toCode} - ${currencyCountryMap[toCode] || toCode}`;

                if (heading) heading.textContent = `${displayFromText} to ${displayToText} Converter`;
                if (description) description.textContent = `Convert values from ${displayFromText} to ${displayToText} with ease and precision.`;
                
                // For specific pages, hide the search section as it's not needed.
                const searchSection = document.querySelector('.search-units-section');
                if (searchSection) searchSection.style.display = 'none';

                // Set a default value in the input if it's empty on a specific conversion page
                if (unitInput && unitInput.value === '') {
                    unitInput.value = 1;
                }

            } else {
                // Main currency index page
                if (heading) {
                    heading.textContent = 'Currency Converter';
                }
                if (description) {
                    description.textContent = 'Convert between global currencies with live exchange rates.';
                }
            }
        }
        
        populateCurrencyDropdowns(fromUnit, toUnit);
    }

    // Event listeners for real-time unit conversion
    if (unitInput) unitInput.addEventListener('input', performConversion);
    if (fromUnitSelect) fromUnitSelect.addEventListener('change', performConversion);
    if (toUnitSelect) toUnitSelect.addEventListener('change', performConversion);

    // Reset Button functionality
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            if (unitInput) unitInput.value = '';
            if (resultDisplay) {
                resultDisplay.textContent = '0.00';
                resultDisplay.classList.remove('error-message');
            }
            if (typeof performConversion === 'function') {
                // If on a specific page, just reset input and result.
                // If on index page, reset dropdowns to default too.
                const { fromUnit, toUnit } = getConverterInfoFromUrl();
                if (!fromUnit && !toUnit) { // Only reset dropdowns if it's the main index page
                    populateCurrencyDropdowns(); // Re-populate to reset to defaults
                }
                performConversion(); 
            }
        });
    }

    // Search Units Logic for Currency (Updated to handle existing pages vs. dropdown update)
    if (searchUnitsButton && searchFromUnitInput && searchToUnitInput) {
        searchUnitsButton.addEventListener('click', () => {
            let fromSearchText = searchFromUnitInput.value.trim();
            let toSearchText = searchToUnitInput.value.trim();

            searchUnitsResultMessage.classList.remove('error-message');
            searchUnitsResultMessage.textContent = ''; 

            if (!fromSearchText || !toSearchText) {
                searchUnitsResultMessage.textContent = "Please enter both 'From Currency' and 'To Currency'.";
                searchUnitsResultMessage.classList.add('error-message');
                return;
            }

            // Function to find the best match for currency.
            const findBestCurrencyMatch = (searchText) => {
                const lowerSearchText = searchText.toLowerCase();
                // 1. Try exact match by code
                let exactCodeMatch = units.currency.find(code => code.toLowerCase() === lowerSearchText);
                if (exactCodeMatch) return exactCodeMatch;

                // 2. Try exact match by country name
                let exactCountryNameMatch = Object.keys(countryCurrencyMap).find(name => name.toLowerCase() === lowerSearchText);
                if (exactCountryNameMatch) return countryCurrencyMap[exactCountryNameMatch];

                // 3. Try partial match by code
                let partialCodeMatch = units.currency.find(code => code.toLowerCase().includes(lowerSearchText));
                if (partialCodeMatch) return partialCodeMatch;

                // 4. Try partial match by country name
                let partialCountryNameMatch = Object.keys(currencyCountryMap).find(name => currencyCountryMap[name].toLowerCase().includes(lowerSearchText));
                if (partialCountryNameMatch) return partialCountryNameMatch; // Return the code, not the full name

                return null;
            };

            const matchedFromCurrency = findBestCurrencyMatch(fromSearchText);
            const matchedToCurrency = findBestCurrencyMatch(toSearchText);

            if (matchedFromCurrency && matchedToCurrency) {
                // Ensure currency codes are in the correct case for URL/lookup
                const fromUrlPart = matchedFromCurrency.toLowerCase();
                const toUrlPart = matchedToCurrency.toLowerCase();
                
                const potentialPageName = `${fromUrlPart}_to_${toUrlPart}`;

                if (existingSpecificCurrencyPages.includes(potentialPageName)) {
                    // If a specific page exists, redirect to it.
                    window.location.href = `/currency/${potentialPageName}.html`;
                } else {
                    // If no specific page, update the main converter dropdowns.
                    if (fromUnitSelect && toUnitSelect) {
                        // Ensure the main converter is visible and populated.
                        fromUnitSelect.style.display = '';
                        toUnitSelect.style.display = '';

                        fromUnitSelect.value = matchedFromCurrency;
                        toUnitSelect.value = matchedToCurrency;
                        performConversion();
                        searchUnitsResultMessage.textContent = ''; // Clear search message
                        
                        // Scroll to the main converter section for better UX
                        if (mainConverterSection) {
                            mainConverterSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    } else {
                        searchUnitsResultMessage.textContent = "Cannot set units on this page. Please use the main converter section on the Currency Home page.";
                        searchUnitsResultMessage.classList.add('error-message');
                    }
                }
            } else {
                let errorMessage = "Could not find ";
                if (!matchedFromCurrency && !matchedToCurrency) {
                    errorMessage += `'${fromSearchText}' and '${toSearchText}'`;
                } else if (!matchedFromCurrency) {
                    errorMessage += `'${fromSearchText}'`;
                } else { 
                    errorMessage += `'${toSearchText}'`;
                }
                errorMessage += ` in available currencies. Please try full currency codes (e.g., USD, JPY) or full names.`;
                searchUnitsResultMessage.textContent = errorMessage;
                searchUnitsResultMessage.classList.add('error-message');
            }
        });
    }

    // Initialize Currency converter functionality when DOM is ready
    initializeCurrencyConverterPage();
});