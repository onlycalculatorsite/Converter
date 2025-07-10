// This file contains JavaScript logic specifically for the Volume converter.
// It relies on common functions and variables defined in script.js (which must be loaded first).

document.addEventListener('DOMContentLoaded', () => {
    // Get elements relevant to Volume converter from the DOM.
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

    // List of existing specific volume conversion pages (filenames without .html)
    const existingSpecificVolumePages = [
        'liters_to_gallons', 'gallons_to_liters',
        'ml_to_cups', 'cups_to_ml',
        'tablespoons_to_cups', 'cups_to_tablespoons',
        'ml_to_liters', 'liters_to_ml',
        'teaspoon_to_ml', 'ml_to_teaspoon',
        'liters_to_quarts', 'quarts_to_liters',
        'pint_to_ml', 'ml_to_pint',
        'cc_to_ml', 'ml_to_cc',
        'cc_to_oz', 'oz_to_cc',
        'cubic_feet_to_gallon', 'gallon_to_cubic_feet',
        'cubic_inches_to_gallons', 'gallons_to_cubic_inches' 
    ];


    // FAQ Accordion Functionality.
    // It's already exposed globally by script.js. Call it here to initialize for this page.
    if (typeof window.initializeFaqAccordion === 'function') {
        window.initializeFaqAccordion();
    } else {
        console.warn("initializeFaqAccordion function not found. FAQ accordion might not work.");
    }

    // Populates 'From' and 'To' unit dropdowns based on converter type.
    function populateVolumeUnitDropdowns(fixedFromUnit = null, fixedToUnit = null) {
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
            // For the main volume converter page, show populated dropdowns.
            fromUnitSelect.style.display = '';
            toUnitSelect.style.display = '';

            const volumeUnits = units.volume || [];
            volumeUnits.forEach(unit => {
                const option1 = document.createElement('option');
                option1.value = unit;
                option1.textContent = unit;
                fromUnitSelect.appendChild(option1);

                const option2 = document.createElement('option');
                option2.value = unit;
                option2.textContent = unit;
                toUnitSelect.appendChild(option2);
            });

            // Set initial default values if available
            if (volumeUnits.length > 0) {
                fromUnitSelect.value = 'Litre'; // Default From to Litre
                if (volumeUnits.includes('Gallon (US Liquid)')) {
                    toUnitSelect.value = 'Gallon (US Liquid)';   // Default To to Gallon (US Liquid)
                } else if (volumeUnits.length > 1) {
                    toUnitSelect.value = volumeUnits[1]; // Or any other available unit
                } else {
                    toUnitSelect.value = volumeUnits[0]; // If only one unit, select itself
                }
            }
        }
        // Perform initial conversion once dropdowns are populated/set
        if (typeof performConversion === 'function') {
            performConversion();
        } else {
            console.error("performConversion function is not available. Make sure script.js is loaded first and it exposes performConversion globally.");
        }
    }

    // Initial page setup for Volume converter
    function initializeVolumeConverterPage() {
        const { converterType, fromUnit, toUnit } = getConverterInfoFromUrl();

        if (converterType !== 'volume') {
            return;
        }

        if (mainConverterSection) {
            const heading = mainConverterSection.querySelector('.section-heading');
            const description = mainConverterSection.querySelector('p[style*="text-align: center"]');
            
            if (fromUnit && toUnit) {
                // For specific conversion pages (e.g., liters to gallons), update heading and description
                // Handle special cases for display if needed (e.g., 'gallon_us_liquid' -> 'Gallons (US Liquid)')
                const displayFrom = fromUnit.replace(/_/g, ' ').replace(/\b(us|uk)\b/g, (match) => match.toUpperCase()).replace(/liquid/g, 'Liquid').replace(/\bcc\b/g, 'Cubic Centimeter').replace(/\bml\b/g, 'Milliliters');
                const displayTo = toUnit.replace(/_/g, ' ').replace(/\b(us|uk)\b/g, (match) => match.toUpperCase()).replace(/liquid/g, 'Liquid').replace(/\bcc\b/g, 'Cubic Centimeter').replace(/\bml\b/g, 'Milliliters');


                if (heading) heading.textContent = `${displayFrom.charAt(0).toUpperCase() + displayFrom.slice(1)} to ${displayTo.charAt(0).toUpperCase() + displayTo.slice(1)} Converter`;
                if (description) description.textContent = `Convert values from ${displayFrom} to ${displayTo} with ease and precision.`;
                
                // For specific pages, hide the search section as it's not needed.
                const searchSection = document.querySelector('.search-units-section');
                if (searchSection) searchSection.style.display = 'none';

                // Set a default value in the input if it's empty on a specific conversion page
                if (unitInput && unitInput.value === '') {
                    unitInput.value = 1;
                }

            } else {
                // Main volume index page
                if (heading) {
                    heading.textContent = 'Volume Converter';
                }
                if (description) {
                    description.textContent = 'Convert various volume units quickly and accurately, or select a specific conversion below.';
                }
            }
        }
        
        populateVolumeUnitDropdowns(fromUnit, toUnit);
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
                    populateVolumeUnitDropdowns(); // Re-populate to reset to defaults
                }
                performConversion(); 
            }
        });
    }

    // Search Units Logic for Volume (Directs to specific volume pages or updates dropdowns)
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

            const volumeUnits = units.volume || [];

            const findBestMatch = (searchText, unitList) => {
                const lowerSearchText = searchText.toLowerCase();
                // 1. Try exact match by full unit name
                let exactMatch = unitList.find(unit => unit.toLowerCase() === lowerSearchText);
                if (exactMatch) return exactMatch;

                // 2. Try exact match by common abbreviations/aliases
                const unitAliases = {
                    'ml': 'Millilitre', 'l': 'Litre', 'cc': 'Cubic Centimeter',
                    'oz': 'Fluid Ounce (US)', 'tsp': 'Teaspoon (US)', 'tbsp': 'Tablespoon (US)',
                    'gal': 'Gallon (US Liquid)', 'qt': 'Quart (US Liquid)', 'pt': 'Pint (US Liquid)',
                    'cubic ft': 'Cubic Foot', 'cubic in': 'Cubic Inch', 'cups': 'Cup (US)'
                };
                let aliasMatch = Object.keys(unitAliases).find(alias => alias.toLowerCase() === lowerSearchText);
                if (aliasMatch) return unitAliases[aliasMatch];

                // 3. Try partial match by full unit name
                let partialMatch = unitList.find(unit => unit.toLowerCase().includes(lowerSearchText));
                if (partialMatch) return partialMatch;

                // 4. Try partial match by alias (less precise, can lead to false positives)
                let partialAliasMatch = Object.keys(unitAliases).find(alias => lowerSearchText.includes(alias.toLowerCase()));
                if (partialAliasMatch) return unitAliases[partialAliasMatch];


                return null;
            };

            const matchedFromUnit = findBestMatch(fromSearchText, volumeUnits);
            const matchedToUnit = findBestMatch(toSearchText, volumeUnits);

            if (matchedFromUnit && matchedToUnit) {
                // Convert units to URL-friendly format (lowercase, replace spaces with underscores)
                const normalizeUnitForUrl = (unitName) => {
                    const lowerUnit = unitName.toLowerCase();
                    // Handle specific cases that might not be directly `_` separated
                    if (lowerUnit.includes('gallon (us liquid)')) return 'gallons'; // Simplified to 'gallons' for common URL
                    if (lowerUnit.includes('fluid ounce (us)')) return 'oz'; // Simplified to 'oz' for common URL
                    if (lowerUnit.includes('cup (us)')) return 'cups'; // Simplified to 'cups' for common URL
                    if (lowerUnit.includes('tablespoon (us)')) return 'tablespoons'; // Simplified
                    if (lowerUnit.includes('teaspoon (us)')) return 'teaspoon'; // Simplified
                    if (lowerUnit.includes('quart (us liquid)')) return 'quarts'; // Simplified
                    if (lowerUnit.includes('pint (us liquid)')) return 'pint'; // Simplified
                    if (lowerUnit === 'millilitre') return 'ml';
                    if (lowerUnit === 'litre') return 'liters';
                    if (lowerUnit === 'cubic centimeter') return 'cc';
                    if (lowerUnit === 'cubic foot') return 'cubic_feet';
                    if (lowerUnit === 'cubic inch') return 'cubic_inches';
                    return lowerUnit.replace(/ /g, '_').replace(/-/g, '_');
                };

                const fromUrlPart = normalizeUnitForUrl(matchedFromUnit);
                const toUrlPart = normalizeUnitForUrl(matchedToUnit);
                
                const potentialPageName = `${fromUrlPart}_to_${toUrlPart}`;

                if (existingSpecificVolumePages.includes(potentialPageName)) {
                    // If a specific page exists, redirect to it.
                    window.location.href = `/volume/${potentialPageName}.html`;
                } else {
                    // If no specific page, update the main converter dropdowns.
                    if (fromUnitSelect && toUnitSelect) {
                        // Ensure the main converter is visible and populated.
                        fromUnitSelect.style.display = '';
                        toUnitSelect.style.display = '';

                        fromUnitSelect.value = matchedFromUnit;
                        toUnitSelect.value = matchedToUnit;
                        performConversion();
                        searchUnitsResultMessage.textContent = ''; // Clear search message
                        
                        // Scroll to the main converter section for better UX
                        if (mainConverterSection) {
                            mainConverterSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    } else {
                        searchUnitsResultMessage.textContent = "Cannot set units on this page. Please use the main converter section on the Volume Home page.";
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
                errorMessage += ` in Volume units. Please try full unit names (e.g., Liter, Gallon) or common abbreviations.`;
                searchUnitsResultMessage.textContent = errorMessage;
                searchUnitsResultMessage.classList.add('error-message');
            }
        });
    }

    // Initialize Volume converter functionality when DOM is ready
    initializeVolumeConverterPage();
});