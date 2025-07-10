// This file contains JavaScript logic specifically for the Digital Storage converter.
// It relies on common functions and variables defined in script.js (which must be loaded first).

document.addEventListener('DOMContentLoaded', () => {
    // Get elements relevant to Digital Storage converter from the DOM.
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

    // Override the units.digital_storage array with a simplified and clean list
    units.digital_storage = [
        "Bit",
        "Byte",
        "Kilobit",
        "Kilobyte",
        "Megabit",
        "Megabyte",
        "Gigabit",
        "Gigabyte",
        "Terabit",
        "Terabyte",
        "Petabit",
        "Petabyte",
        "Exabit",
        "Exabyte"
    ];

    // List of existing specific digital storage conversion pages (filenames without .html)
    const existingSpecificDigitalStoragePages = [
        'mb_to_gb', 'gb_to_mb',
        'kb_to_mb', 'mb_to_kb',
        'kb_to_gb', 'gb_to_kb'
        // Add more specific pages here as you create them
    ];

    // FAQ Accordion Functionality.
    if (typeof window.initializeFaqAccordion === 'function') {
        window.initializeFaqAccordion();
    } else {
        console.warn("initializeFaqAccordion function not found. FAQ accordion might not work.");
    }

    // Populates 'From' and 'To' unit dropdowns.
    function populateDigitalStorageUnitDropdowns(fixedFromUnit = null, fixedToUnit = null) {
        if (!fromUnitSelect || !toUnitSelect) {
            return;
        }

        fromUnitSelect.innerHTML = '';
        toUnitSelect.innerHTML = '';

        if (fixedFromUnit && fixedToUnit) {
            // For specific conversion pages, dropdowns are hidden.
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
            // For the main digital storage converter page, show populated dropdowns.
            fromUnitSelect.style.display = '';
            toUnitSelect.style.display = '';

            const digitalStorageUnits = units.digital_storage || [];
            digitalStorageUnits.forEach(unit => {
                const option1 = document.createElement('option');
                option1.value = unit;
                option1.textContent = unit;
                fromUnitSelect.appendChild(option1);

                const option2 = document.createElement('option');
                option2.value = unit;
                option2.textContent = unit;
                toUnitSelect.appendChild(option2);
            });

            // Set initial default values
            fromUnitSelect.value = 'Gigabyte'; 
            toUnitSelect.value = 'Megabyte';
        }
        
        if (typeof performConversion === 'function') {
            performConversion();
        } else {
            console.error("performConversion function is not available.");
        }
    }

    // Initial page setup for Digital Storage converter
    function initializeDigitalStorageConverterPage() {
        const { converterType, fromUnit, toUnit } = getConverterInfoFromUrl();

        if (converterType !== 'digital_storage') {
            return;
        }

        if (mainConverterSection) {
            const heading = mainConverterSection.querySelector('.section-heading');
            const description = mainConverterSection.querySelector('p[style*="text-align: center"]');
            
            if (fromUnit && toUnit) {
                // For specific conversion pages
                const displayFrom = fromUnit.replace(/_/g, ' ').toUpperCase();
                const displayTo = toUnit.replace(/_/g, ' ').toUpperCase();

                if (heading) heading.textContent = `${displayFrom} to ${displayTo} Converter`;
                if (description) description.textContent = `Convert values from ${displayFrom} to ${displayTo} with ease and precision.`;
                
                const searchSection = document.querySelector('.search-units-section');
                if (searchSection) searchSection.style.display = 'none';

                if (unitInput && unitInput.value === '') {
                    unitInput.value = 1;
                }
            } else {
                // Main digital storage index page
                if (heading) heading.textContent = 'Digital Storage Converter';
                if (description) description.textContent = 'Convert various digital storage units like bits, bytes, kilobytes, and gigabytes.';
            }
        }
        
        populateDigitalStorageUnitDropdowns(fromUnit, toUnit);
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
            const { fromUnit, toUnit } = getConverterInfoFromUrl();
            if (!fromUnit && !toUnit) {
                populateDigitalStorageUnitDropdowns(); 
            }
            performConversion(); 
        });
    }

    // Search Units Logic for Digital Storage
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

            const digitalStorageUnits = units.digital_storage || [];

            const findBestMatch = (searchText, unitList) => {
                const lowerSearchText = searchText.toLowerCase();
                let exactMatch = unitList.find(unit => unit.toLowerCase() === lowerSearchText);
                if (exactMatch) return exactMatch;
                let partialMatch = unitList.find(unit => unit.toLowerCase().includes(lowerSearchText));
                if (partialMatch) return partialMatch;
                return null;
            };

            const matchedFromUnit = findBestMatch(fromSearchText, digitalStorageUnits);
            const matchedToUnit = findBestMatch(toSearchText, digitalStorageUnits);

            if (matchedFromUnit && matchedToUnit) {
                const fromUrlPart = matchedFromUnit.toLowerCase().match(/([a-z]+)/)[0];
                const toUrlPart = matchedToUnit.toLowerCase().match(/([a-z]+)/)[0];
                
                const potentialPageName = `${fromUrlPart}_to_${toUrlPart}`;

                if (existingSpecificDigitalStoragePages.includes(potentialPageName)) {
                    window.location.href = `/digital_storage/${potentialPageName}.html`;
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
                        searchUnitsResultMessage.textContent = "Cannot set units on this page. Please use the main converter on the Digital Storage Home page.";
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
                errorMessage += ` in Digital Storage units. Please try full unit names.`;
                searchUnitsResultMessage.textContent = errorMessage;
                searchUnitsResultMessage.classList.add('error-message');
            }
        });
    }

    initializeDigitalStorageConverterPage();
});