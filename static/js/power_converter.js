// This file contains JavaScript logic specifically for the Power converter.
// It relies on common functions and variables defined in script.js (which must be loaded first).

document.addEventListener('DOMContentLoaded', () => {
    // Get elements relevant to Power converter from the DOM.
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

    // List of existing specific power conversion pages (filenames without .html)
    const existingSpecificPowerPages = [
        'watt_to_kw', 'kw_to_watt',
        'kw_to_hp', 'hp_to_kw',
        'watt_to_hp', 'hp_to_watt',
        'watt_to_ton_of_refrigeration', 'ton_of_refrigeration_to_watt'
    ];

    // Initialize FAQ Accordion if the function exists
    if (typeof window.initializeFaqAccordion === 'function') {
        window.initializeFaqAccordion();
    } else {
        console.warn("initializeFaqAccordion function not found. FAQ accordion might not work.");
    }

    // Populates 'From' and 'To' unit dropdowns for the power converter.
    function populatePowerUnitDropdowns(fixedFromUnit = null, fixedToUnit = null) {
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
            // For the main power converter page, show and populate dropdowns.
            fromUnitSelect.style.display = '';
            toUnitSelect.style.display = '';

            const powerUnitsRaw = units.power || [];
            // **MODIFICATION START: Filter out 'BTU per hour' from the dropdown list**
            const powerUnits = powerUnitsRaw.filter(unit => unit.toLowerCase() !== 'btu per hour');
            // **MODIFICATION END**
            
            powerUnits.forEach(unit => {
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
            if (powerUnits.length > 0) {
                fromUnitSelect.value = 'Watt'; 
                if (powerUnits.includes('Kilowatt')) {
                    toUnitSelect.value = 'Kilowatt';
                } else if (powerUnits.length > 1) {
                    toUnitSelect.value = powerUnits[1];
                } else {
                    toUnitSelect.value = powerUnits[0];
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

    // Initial page setup for Power converter
    function initializePowerConverterPage() {
        const { converterType, fromUnit, toUnit } = getConverterInfoFromUrl();

        if (converterType !== 'power') {
            return; // Exit if not on a power converter page
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
                    heading.textContent = 'Power Converter';
                }
                if (description) {
                    description.textContent = 'Convert various power units like Watts, Horsepower, and Kilowatts.';
                }
            }
        }
        
        populatePowerUnitDropdowns(fromUnit, toUnit);
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
                    populatePowerUnitDropdowns(); 
                }
                performConversion(); 
            }
        });
    }

    // Search Units Logic for Power
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

            const powerUnits = units.power || [];

            const findBestMatch = (searchText, unitList) => {
                const lowerSearchText = searchText.toLowerCase();
                let exactMatch = unitList.find(unit => unit.toLowerCase() === lowerSearchText);
                if (exactMatch) return exactMatch;
                let partialMatch = unitList.find(unit => unit.toLowerCase().includes(lowerSearchText));
                if (partialMatch) return partialMatch;
                return null;
            };

            const matchedFromUnit = findBestMatch(fromSearchText, powerUnits);
            const matchedToUnit = findBestMatch(toSearchText, powerUnits);

            if (matchedFromUnit && matchedToUnit) {
                const fromUrlPart = matchedFromUnit.toLowerCase().replace(/ /g, '_').replace(/\//g, '_per_');
                const toUrlPart = matchedToUnit.toLowerCase().replace(/ /g, '_').replace(/\//g, '_per_');
                
                const potentialPageName = `${fromUrlPart}_to_${toUrlPart}`;

                if (existingSpecificPowerPages.includes(potentialPageName)) {
                    window.location.href = `/power/${potentialPageName}.html`;
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
                        searchUnitsResultMessage.textContent = "Cannot set units on this page. Please use the main converter on the Power Home page.";
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
                errorMessage += ` in Power units. Please try full unit names (e.g., Watt, Horsepower).`;
                searchUnitsResultMessage.textContent = errorMessage;
                searchUnitsResultMessage.classList.add('error-message');
            }
        });
    }

    // Initialize Power converter functionality when the DOM is fully loaded
    initializePowerConverterPage();
});