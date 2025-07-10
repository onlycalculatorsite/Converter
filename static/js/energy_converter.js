// This file contains JavaScript logic specifically for the Energy converter.
// It relies on common functions and variables defined in script.js (which must be loaded first).

document.addEventListener('DOMContentLoaded', () => {
    // Get elements relevant to Energy converter from the DOM.
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

    // List of existing specific energy conversion pages (filenames without .html)
    const existingSpecificEnergyPages = [
        'kj_to_kcal', 'kcal_to_kj',
        'kcal_to_cal', 'cal_to_kcal',
        'j_to_kj', 'kj_to_j',
        'cal_to_j', 'j_to_cal',
        'ft_lb_to_nm', 'nm_to_ft_lb'
    ];

    // Initialize FAQ Accordion if the function exists
    if (typeof window.initializeFaqAccordion === 'function') {
        window.initializeFaqAccordion();
    } else {
        console.warn("initializeFaqAccordion function not found. FAQ accordion might not work.");
    }

    // Populates 'From' and 'To' unit dropdowns for the energy converter.
    function populateEnergyUnitDropdowns(fixedFromUnit = null, fixedToUnit = null) {
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
            // For the main energy converter page, show and populate dropdowns.
            fromUnitSelect.style.display = '';
            toUnitSelect.style.display = '';

            const energyUnits = units.energy || [];
            energyUnits.forEach(unit => {
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
            if (energyUnits.length > 0) {
                fromUnitSelect.value = 'Joule'; 
                if (energyUnits.includes('Kilocalorie')) {
                    toUnitSelect.value = 'Kilocalorie';
                } else if (energyUnits.length > 1) {
                    toUnitSelect.value = energyUnits[1];
                } else {
                    toUnitSelect.value = energyUnits[0];
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

    // Initial page setup for Energy converter
    function initializeEnergyConverterPage() {
        const { converterType, fromUnit, toUnit } = getConverterInfoFromUrl();

        if (converterType !== 'energy') {
            return; // Exit if not on an energy converter page
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
                    heading.textContent = 'Energy Converter';
                }
                if (description) {
                    description.textContent = 'Convert various energy units like Joules, Calories, kWh, and Electron Volts.';
                }
            }
        }
        
        populateEnergyUnitDropdowns(fromUnit, toUnit);
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
                    populateEnergyUnitDropdowns(); 
                }
                performConversion(); 
            }
        });
    }

    // Search Units Logic for Energy
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

            const energyUnits = units.energy || [];

            const findBestMatch = (searchText, unitList) => {
                const lowerSearchText = searchText.toLowerCase();
                let exactMatch = unitList.find(unit => unit.toLowerCase() === lowerSearchText);
                if (exactMatch) return exactMatch;
                let partialMatch = unitList.find(unit => unit.toLowerCase().includes(lowerSearchText));
                if (partialMatch) return partialMatch;
                return null;
            };

            const matchedFromUnit = findBestMatch(fromSearchText, energyUnits);
            const matchedToUnit = findBestMatch(toSearchText, energyUnits);

            if (matchedFromUnit && matchedToUnit) {
                const fromUrlPart = matchedFromUnit.toLowerCase().replace(/ /g, '_').replace(/-/g, '_').replace(/\(/g, '').replace(/\)/g, '');
                const toUrlPart = matchedToUnit.toLowerCase().replace(/ /g, '_').replace(/-/g, '_').replace(/\(/g, '').replace(/\)/g, '');
                
                const potentialPageName = `${fromUrlPart}_to_${toUrlPart}`;

                if (existingSpecificEnergyPages.includes(potentialPageName)) {
                    window.location.href = `/energy/${potentialPageName}.html`;
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
                        searchUnitsResultMessage.textContent = "Cannot set units on this page. Please use the main converter on the Energy Home page.";
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
                errorMessage += ` in Energy units. Please try full unit names (e.g., Joule, Calorie).`;
                searchUnitsResultMessage.textContent = errorMessage;
                searchUnitsResultMessage.classList.add('error-message');
            }
        });
    }

    // Initialize Energy converter functionality when the DOM is fully loaded
    initializeEnergyConverterPage();
});