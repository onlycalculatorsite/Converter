// This file contains JavaScript logic specifically for the Weight converter.
// It relies on common functions and variables defined in script.js (which must be loaded first).

document.addEventListener('DOMContentLoaded', () => {
    // Get elements relevant to Weight converter from the DOM.
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

    // List of existing specific weight conversion pages (filenames without .html)
    // Please ENSURE these files exist in your 'templates/weight/' folder.
    const existingSpecificWeightPages = [
        'kg_to_lbs', 'grams_to_ounces', 'pounds_to_ounces', 'grams_to_pounds',
        'g_to_kg', 'grams_to_milligrams', 'oz_to_kg', 'lbs_to_stone',
        'ton_to_lbs', 'lbs_to_kg', 'ounces_to_grams', 'ounces_to_pounds',
        'pounds_to_grams', 'kg_to_g', 'milligrams_to_grams', 'kg_to_oz',
        'stone_to_lbs', 'lbs_to_ton'
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

    // Populates 'From' and 'To' unit dropdowns based on converter type.
    function populateWeightUnitDropdowns(fixedFromUnit = null, fixedToUnit = null) {
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
            // For the main weight converter page, show populated dropdowns.
            fromUnitSelect.style.display = '';
            toUnitSelect.style.display = '';

            const weightUnits = units.weight || [];
            weightUnits.forEach(unit => {
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
            if (weightUnits.length > 0) {
                fromUnitSelect.value = 'Kilogram'; // Default From to Kilogram
                if (weightUnits.includes('Pound')) {
                    toUnitSelect.value = 'Pound';   // Default To to Pound
                } else if (weightUnits.length > 1) {
                    toUnitSelect.value = weightUnits[1]; // Or any other available unit
                } else {
                    toUnitSelect.value = weightUnits[0]; // If only one unit, select itself
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

    // Initial page setup for Weight converter
    function initializeWeightConverterPage() {
        const { converterType, fromUnit, toUnit } = getConverterInfoFromUrl();

        if (converterType !== 'weight') {
            return;
        }

        if (mainConverterSection) {
            const heading = mainConverterSection.querySelector('.section-heading');
            const description = mainConverterSection.querySelector('p[style*="text-align: center"]');
            
            if (fromUnit && toUnit) {
                // For specific conversion pages (e.g., kg to lbs), update heading and description
                if (heading) heading.textContent = `${fromUnit.charAt(0).toUpperCase() + fromUnit.slice(1).replace(/_/g, ' ')} to ${toUnit.charAt(0).toUpperCase() + toUnit.slice(1).replace(/_/g, ' ')} Converter`;
                if (description) description.textContent = `Convert values from ${fromUnit.replace(/_/g, ' ')} to ${toUnit.replace(/_/g, ' ')} with ease and precision.`;
                
                // For specific pages, hide the search section as it's not needed.
                const searchSection = document.querySelector('.search-units-section');
                if (searchSection) searchSection.style.display = 'none';

                // Set a default value in the input if it's empty on a specific conversion page
                if (unitInput && unitInput.value === '') {
                    unitInput.value = 1;
                }

            } else {
                // Main weight index page
                if (heading) {
                    heading.textContent = 'Weight Converter';
                }
                if (description) {
                    description.textContent = 'Convert various weight units like kilograms, pounds, and ounces.';
                }
            }
        }
        
        populateWeightUnitDropdowns(fromUnit, toUnit);
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
                    populateWeightUnitDropdowns(); // Re-populate to reset to defaults
                }
                performConversion(); 
            }
        });
    }

    // Search Units Logic for Weight (Directs to specific weight pages or updates dropdowns)
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

            const weightUnits = units.weight || [];

            const findBestMatch = (searchText, unitList) => {
                const lowerSearchText = searchText.toLowerCase();
                // 1. Try exact match by full unit name
                let exactMatch = unitList.find(unit => unit.toLowerCase() === lowerSearchText);
                if (exactMatch) return exactMatch;

                // 2. Try exact match by common abbreviations/aliases
                const unitAliases = {
                    'kg': 'Kilogram', 'g': 'Gram', 'mg': 'Milligram',
                    'lbs': 'Pound', 'oz': 'Ounce', 'ton': 'Short Ton',
                    'long ton': 'Long Ton', 'metric ton': 'Metric Ton'
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

            const matchedFromUnit = findBestMatch(fromSearchText, weightUnits);
            const matchedToUnit = findBestMatch(toSearchText, weightUnits);

            if (matchedFromUnit && matchedToUnit) {
                // Convert units to URL-friendly format (lowercase, replace spaces with underscores)
                // Also handle special cases like 'Short Ton' becoming 'ton' in URL, 'Pound' becoming 'lbs'
                const normalizeUnitForUrl = (unitName) => {
                    const lowerUnit = unitName.toLowerCase();
                    if (lowerUnit === 'kilogram') return 'kg';
                    if (lowerUnit === 'pound') return 'lbs';
                    if (lowerUnit === 'ounce') return 'oz';
                    if (lowerUnit === 'gram') return 'g';
                    if (lowerUnit === 'milligram') return 'milligrams';
                    if (lowerUnit === 'short ton') return 'ton'; // Assuming 'ton' in URL means short ton
                    return lowerUnit.replace(/ /g, '_').replace(/-/g, '_');
                };

                const fromUrlPart = normalizeUnitForUrl(matchedFromUnit);
                const toUrlPart = normalizeUnitForUrl(matchedToUnit);
                
                const potentialPageName = `${fromUrlPart}_to_${toUrlPart}`;

                if (existingSpecificWeightPages.includes(potentialPageName)) {
                    // If a specific page exists, redirect to it.
                    window.location.href = `/weight/${potentialPageName}.html`;
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
                        searchUnitsResultMessage.textContent = "Cannot set units on this page. Please use the main converter section on the Weight Home page.";
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
                errorMessage += ` in Weight units. Please try full unit names (e.g., Kilogram, Pound) or common abbreviations.`;
                searchUnitsResultMessage.textContent = errorMessage;
                searchUnitsResultMessage.classList.add('error-message');
            }
        });
    }

    // Initialize Weight converter functionality when DOM is ready
    initializeWeightConverterPage();
});