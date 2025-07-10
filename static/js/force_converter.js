// This file contains JavaScript logic specifically for the Force converter.
// It relies on common functions and variables defined in script.js (which must be loaded first).

document.addEventListener('DOMContentLoaded', () => {
    // Get elements relevant to Force converter from the DOM.
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

    // List of existing specific force conversion pages (filenames without .html)
    const existingSpecificForcePages = [
        'newton_to_kg', 'kg_to_newton',
        'newton_to_lbs', 'lbs_to_newton'
    ];

    // Initialize FAQ Accordion if the function exists
    if (typeof window.initializeFaqAccordion === 'function') {
        window.initializeFaqAccordion();
    } else {
        console.warn("initializeFaqAccordion function not found. FAQ accordion might not work.");
    }

    // Populates 'From' and 'To' unit dropdowns for the force converter.
    function populateForceUnitDropdowns(fixedFromUnit = null, fixedToUnit = null) {
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
            // For the main force converter page, show and populate dropdowns.
            fromUnitSelect.style.display = '';
            toUnitSelect.style.display = '';

            const forceUnits = units.force || [];
            forceUnits.forEach(unit => {
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
            if (forceUnits.length > 0) {
                fromUnitSelect.value = 'Newton'; 
                if (forceUnits.includes('Pound-force')) {
                    toUnitSelect.value = 'Pound-force';
                } else if (forceUnits.length > 1) {
                    toUnitSelect.value = forceUnits[1];
                } else {
                    toUnitSelect.value = forceUnits[0];
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

    // Initial page setup for Force converter
    function initializeForceConverterPage() {
        const { converterType, fromUnit, toUnit } = getConverterInfoFromUrl();

        if (converterType !== 'force') {
            return; // Exit if not on a force converter page
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
                    heading.textContent = 'Force Converter';
                }
                if (description) {
                    description.textContent = 'Convert various force units like Newtons, Dyne, and Pound-force.';
                }
            }
        }
        
        populateForceUnitDropdowns(fromUnit, toUnit);
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
                    populateForceUnitDropdowns(); 
                }
                performConversion(); 
            }
        });
    }

    // Search Units Logic for Force
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

            const forceUnits = units.force || [];

            const findBestMatch = (searchText, unitList) => {
                const lowerSearchText = searchText.toLowerCase();
                let exactMatch = unitList.find(unit => unit.toLowerCase() === lowerSearchText);
                if (exactMatch) return exactMatch;
                let partialMatch = unitList.find(unit => unit.toLowerCase().includes(lowerSearchText));
                if (partialMatch) return partialMatch;
                return null;
            };

            const matchedFromUnit = findBestMatch(fromSearchText, forceUnits);
            const matchedToUnit = findBestMatch(toSearchText, forceUnits);

            if (matchedFromUnit && matchedToUnit) {
                const fromUrlPart = matchedFromUnit.toLowerCase().replace(/ /g, '_').replace(/-/g, '_');
                const toUrlPart = matchedToUnit.toLowerCase().replace(/ /g, '_').replace(/-/g, '_');
                
                const potentialPageName = `${fromUrlPart}_to_${toUrlPart}`;

                if (existingSpecificForcePages.includes(potentialPageName)) {
                    window.location.href = `/force/${potentialPageName}.html`;
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
                        searchUnitsResultMessage.textContent = "Cannot set units on this page. Please use the main converter on the Force Home page.";
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
                errorMessage += ` in Force units. Please try full unit names (e.g., Newton, Pound-force).`;
                searchUnitsResultMessage.textContent = errorMessage;
                searchUnitsResultMessage.classList.add('error-message');
            }
        });
    }

    // Initialize Force converter functionality when the DOM is fully loaded
    initializeForceConverterPage();
});