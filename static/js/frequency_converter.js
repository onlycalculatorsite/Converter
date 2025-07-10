// This file contains JavaScript logic specifically for the Frequency converter.
// It relies on common functions and variables defined in script.js (which must be loaded first).

document.addEventListener('DOMContentLoaded', () => {
    // Get elements relevant to Frequency converter from the DOM.
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
    const { getConverterInfoFromUrl, performConversion, units } = window;

    // List of existing specific frequency conversion pages (filenames without .html)
    const existingSpecificFrequencyPages = [
        'hz_to_khz', 'khz_to_hz',
        'hz_to_mhz', 'mhz_to_hz',
        'hz_to_ghz', 'ghz_to_hz',
        'hz_to_rpm', 'rpm_to_hz',
        'rpm_to_rad_per_s', 'rad_per_s_to_rpm',
        'ghz_to_thz', 'thz_to_ghz',
        'khz_to_mhz', 'mhz_to_khz'
    ];

    // Initialize FAQ Accordion if the function exists
    if (typeof window.initializeFaqAccordion === 'function') {
        window.initializeFaqAccordion();
    } else {
        console.warn("initializeFaqAccordion function not found. FAQ accordion might not work.");
    }

    // Populates 'From' and 'To' unit dropdowns for the frequency converter.
    function populateFrequencyUnitDropdowns(fixedFromUnit = null, fixedToUnit = null) {
        if (!fromUnitSelect || !toUnitSelect) {
            return;
        }

        fromUnitSelect.innerHTML = '';
        toUnitSelect.innerHTML = '';

        if (fixedFromUnit && fixedToUnit) {
            // For specific conversion pages, dropdowns are hidden but populated for logic.
            fromUnitSelect.style.display = 'none';
            toUnitSelect.style.display = 'none';
            
            const option1 = document.createElement('option');
            option1.value = fixedFromUnit;
            option1.textContent = fixedFromUnit;
            fromUnitSelect.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = fixedToUnit;
            option2.textContent = fixedToUnit;
            toUnitSelect.appendChild(option2);

        } else {
            // For the main frequency converter page, show and populate dropdowns.
            fromUnitSelect.style.display = '';
            toUnitSelect.style.display = '';

            const frequencyUnits = units.frequency || [];
            frequencyUnits.forEach(unit => {
                const option1 = document.createElement('option');
                option1.value = unit;
                option1.textContent = unit;
                fromUnitSelect.appendChild(option1);

                const option2 = document.createElement('option');
                option2.value = unit;
                option2.textContent = unit;
                toUnitSelect.appendChild(option2);
            });

            // Set initial default values for the main page
            if (frequencyUnits.length > 0) {
                fromUnitSelect.value = 'Hertz'; 
                if (frequencyUnits.includes('Kilohertz')) {
                    toUnitSelect.value = 'Kilohertz';
                } else if (frequencyUnits.length > 1) {
                    toUnitSelect.value = frequencyUnits[1];
                } else {
                    toUnitSelect.value = frequencyUnits[0];
                }
            }
        }
        
        // Perform initial conversion once dropdowns are set
        if (typeof performConversion === 'function') {
            performConversion();
        } else {
            console.error("performConversion function is not available. Ensure script.js is loaded first.");
        }
    }

    // Initial page setup for Frequency converter
    function initializeFrequencyConverterPage() {
        const { converterType, fromUnit, toUnit } = getConverterInfoFromUrl();

        if (converterType !== 'frequency') {
            return; // Exit if not on a frequency converter page
        }

        if (mainConverterSection) {
            const heading = mainConverterSection.querySelector('.section-heading');
            const description = mainConverterSection.querySelector('p[style*="text-align: center"]');
            
            if (fromUnit && toUnit) {
                const displayFrom = fromUnit.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                const displayTo = toUnit.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                if (heading) heading.textContent = `${displayFrom} to ${displayTo} Converter`;
                if (description) description.textContent = `Convert values from ${displayFrom} to ${displayTo} with ease and precision.`;
                
                const searchSection = document.querySelector('.search-units-section');
                if (searchSection) searchSection.style.display = 'none';

                if (unitInput && unitInput.value === '') {
                    unitInput.value = 1;
                }
            } else {
                if (heading) {
                    heading.textContent = 'Frequency Converter';
                }
                if (description) {
                    description.textContent = 'Convert between various frequency units like Hertz, Kilohertz, Megahertz, and Gigahertz.';
                }
            }
        }
        
        populateFrequencyUnitDropdowns(fromUnit, toUnit);
    }

    // Event listeners for real-time conversion
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
                const { fromUnit, toUnit } = getConverterInfoFromUrl();
                if (!fromUnit && !toUnit) {
                    populateFrequencyUnitDropdowns(); 
                }
                performConversion(); 
            }
        });
    }

    // Search Units Logic for Frequency
    if (searchUnitsButton && searchFromUnitInput && searchToUnitInput) {
        searchUnitsButton.addEventListener('click', () => {
            let fromSearchText = searchFromUnitInput.value.trim();
            let toSearchText = searchToUnitInput.value.trim();

            searchUnitsResultMessage.classList.remove('error-message');
            searchUnitsResultMessage.textContent = ''; 

            if (!fromSearchText || !toSearchText) {
                searchUnitsResultMessage.textContent = "Please enter both 'From Unit' and 'To Unit'.";
                searchUnitsResultMessage.classList.add('error-message');
                return;
            }

            const frequencyUnits = units.frequency || [];

            const findBestMatch = (searchText, unitList) => {
                const lowerSearchText = searchText.toLowerCase();
                let exactMatch = unitList.find(unit => unit.toLowerCase() === lowerSearchText);
                if (exactMatch) return exactMatch;
                let partialMatch = unitList.find(unit => unit.toLowerCase().includes(lowerSearchText));
                if (partialMatch) return partialMatch;
                return null;
            };

            const matchedFromUnit = findBestMatch(fromSearchText, frequencyUnits);
            const matchedToUnit = findBestMatch(toSearchText, frequencyUnits);

            if (matchedFromUnit && matchedToUnit) {
                const fromUrlPart = matchedFromUnit.toLowerCase().replace(/ /g, '_').replace(/\//g, '_per_');
                const toUrlPart = matchedToUnit.toLowerCase().replace(/ /g, '_').replace(/\//g, '_per_');
                
                const potentialPageName = `${fromUrlPart}_to_${toUrlPart}`;

                if (existingSpecificFrequencyPages.includes(potentialPageName)) {
                    window.location.href = `/frequency/${potentialPageName}.html`;
                } else {
                    if (fromUnitSelect && toUnitSelect) {
                        fromUnitSelect.value = matchedFromUnit;
                        toUnitSelect.value = matchedToUnit;
                        performConversion();
                        searchUnitsResultMessage.textContent = ''; 
                        if (mainConverterSection) {
                            mainConverterSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    } else {
                        searchUnitsResultMessage.textContent = "Cannot set units on this page. Please use the main converter on the Frequency Home page.";
                        searchUnitsResultMessage.classList.add('error-message');
                    }
                }
            } else {
                let errorMessage = "Could not find ";
                if (!matchedFromUnit && !matchedToUnit) {
                    errorMessage += `'${fromSearchText}' and '${toSearchText}'`;
                } else if (!matchedFromUnit) {
                    errorMessage += `'${fromSearchText}'`;
                } else { 
                    errorMessage += `'${toSearchText}'`;
                }
                errorMessage += ` in Frequency units. Please try full unit names (e.g., Hertz, RPM).`;
                searchUnitsResultMessage.textContent = errorMessage;
                searchUnitsResultMessage.classList.add('error-message');
            }
        });
    }

    // Initialize Frequency converter functionality when the DOM is fully loaded
    initializeFrequencyConverterPage();
});