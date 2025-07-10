// This file contains JavaScript logic specifically for the Area converter.
// It relies on common functions and variables defined in script.js (which must be loaded first).

document.addEventListener('DOMContentLoaded', () => {
    // Get elements relevant to Area converter from the DOM.
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

    // List of existing specific area conversion pages (filenames without .html)
    // Please ENSURE these files exist in your 'templates/area/' folder.
    const existingSpecificAreaPages = [
        'acres_to_square_feet', 'square_feet_to_acres',
        'hectare_to_acres', 'acres_to_hectare',
        'square_feet_to_square_meter', 'square_meter_to_square_feet',
        'acres_to_square_miles', 'square_miles_to_acres',
        'square_feet_to_square_yards', 'square_yards_to_square_feet'
    ];

    // FAQ Accordion Functionality.
    // It's already exposed globally by script.js. Call it here to initialize for this page.
    if (typeof window.initializeFaqAccordion === 'function') {
        window.initializeFaqAccordion();
    } else {
        console.warn("initializeFaqAccordion function not found. FAQ accordion might not work.");
    }

    // Populates 'From' and 'To' unit dropdowns based on converter type.
    function populateAreaUnitDropdowns(fixedFromUnit = null, fixedToUnit = null) {
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
            // For the main area converter page, show populated dropdowns.
            fromUnitSelect.style.display = '';
            toUnitSelect.style.display = '';

            const areaUnits = units.area || [];
            areaUnits.forEach(unit => {
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
            if (areaUnits.length > 0) {
                fromUnitSelect.value = 'Square Meter'; // Default From to Square Meter
                if (areaUnits.includes('Square Foot')) {
                    toUnitSelect.value = 'Square Foot';   // Default To to Square Foot
                } else if (areaUnits.length > 1) {
                    toUnitSelect.value = areaUnits[1]; // Or any other available unit
                } else {
                    toUnitSelect.value = areaUnits[0]; // If only one unit, select itself
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

    // Initial page setup for Area converter
    function initializeAreaConverterPage() {
        const { converterType, fromUnit, toUnit } = getConverterInfoFromUrl();

        if (converterType !== 'area') {
            return;
        }

        if (mainConverterSection) {
            const heading = mainConverterSection.querySelector('.section-heading');
            const description = mainConverterSection.querySelector('p[style*="text-align: center"]');
            
            if (fromUnit && toUnit) {
                // For specific conversion pages (e.g., acres to square_feet), update heading and description
                // Handle special cases for display if needed
                const displayFrom = fromUnit.replace(/_/g, ' ').replace(/\bsq\b/g, 'Square').replace(/\bmi\b/g, 'Miles').replace(/\byd\b/g, 'Yards').replace(/\bft\b/g, 'Feet');
                const displayTo = toUnit.replace(/_/g, ' ').replace(/\bsq\b/g, 'Square').replace(/\bmi\b/g, 'Miles').replace(/\byd\b/g, 'Yards').replace(/\bft\b/g, 'Feet');

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
                // Main area index page
                if (heading) {
                    heading.textContent = 'Area Converter';
                }
                if (description) {
                    description.textContent = 'Convert various area units like square meters, acres, and hectares.';
                }
            }
        }
        
        populateAreaUnitDropdowns(fromUnit, toUnit);
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
                    populateAreaUnitDropdowns(); // Re-populate to reset to defaults
                }
                performConversion(); 
            }
        });
    }

    // Search Units Logic for Area (Directs to specific area pages or updates dropdowns)
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

            const areaUnits = units.area || [];

            const findBestMatch = (searchText, unitList) => {
                const lowerSearchText = searchText.toLowerCase();
                // 1. Try exact match by full unit name
                let exactMatch = unitList.find(unit => unit.toLowerCase() === lowerSearchText);
                if (exactMatch) return exactMatch;

                // 2. Try exact match by common abbreviations/aliases
                const unitAliases = {
                    'sq m': 'Square Meter', 'sq km': 'Square Kilometer', 'sq cm': 'Square Centimeter',
                    'sq mm': 'Square Millimeter', 'sq µm': 'Square Micrometer', 'ha': 'Hectare',
                    'ac': 'Acre', 'sq mi': 'Square Mile', 'sq yd': 'Square Yard',
                    'sq ft': 'Square Foot', 'sq in': 'Square Inch', 'are': 'Are',
                    'meter^2': 'Square Meter', 'kilometer^2': 'Square Kilometer', 'centimeter^2': 'Square Centimeter',
                    'millimeter^2': 'Square Millimeter', 'micrometer^2': 'Square Micrometer',
                    'mile^2': 'Square Mile', 'yard^2': 'Square Yard', 'foot^2': 'Square Foot',
                    'inch^2': 'Square Inch'
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

            const matchedFromUnit = findBestMatch(fromSearchText, areaUnits);
            const matchedToUnit = findBestMatch(toSearchText, areaUnits);

            if (matchedFromUnit && matchedToUnit) {
                // Convert units to URL-friendly format (lowercase, replace spaces with underscores)
                const normalizeUnitForUrl = (unitName) => {
                    const lowerUnit = unitName.toLowerCase();
                    // Handle specific cases that might not be directly `_` separated
                    if (lowerUnit === 'square meter') return 'square_meter';
                    if (lowerUnit === 'square kilometer') return 'square_kilometer';
                    if (lowerUnit === 'square centimeter') return 'square_centimeter';
                    if (lowerUnit === 'square millimeter') return 'square_millimeter';
                    if (lowerUnit === 'square micrometer') return 'square_micrometer';
                    if (lowerUnit === 'square mile') return 'square_miles'; // Using plural for consistency with existing files
                    if (lowerUnit === 'square yard') return 'square_yards'; // Using plural for consistency
                    if (lowerUnit === 'square foot') return 'square_feet'; // Using plural for consistency
                    if (lowerUnit === 'square inch') return 'square_inches';
                    return lowerUnit.replace(/ /g, '_').replace(/-/g, '_');
                };

                const fromUrlPart = normalizeUnitForUrl(matchedFromUnit);
                const toUrlPart = normalizeUnitForUrl(matchedToUnit);
                
                const potentialPageName = `${fromUrlPart}_to_${toUrlPart}`;

                if (existingSpecificAreaPages.includes(potentialPageName)) {
                    // If a specific page exists, redirect to it.
                    window.location.href = `/area/${potentialPageName}.html`;
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
                        searchUnitsResultMessage.textContent = "Cannot set units on this page. Please use the main converter section on the Area Home page.";
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
                errorMessage += ` in Area units. Please try full unit names (e.g., Square Meter, Acre) or common abbreviations.`;
                searchUnitsResultMessage.textContent = errorMessage;
                searchUnitsResultMessage.classList.add('error-message');
            }
        });
    }

    // Initialize Area converter functionality when DOM is ready
    initializeAreaConverterPage();
});