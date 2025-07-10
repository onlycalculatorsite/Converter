// This file contains JavaScript logic specifically for the Length converter.
// It relies on common functions and variables defined in script.js (which must be loaded first).

document.addEventListener('DOMContentLoaded', () => {
    // Get elements relevant to Length converter from the DOM.
    const unitInput = document.getElementById('fromUnitInput');
    const fromUnitSelect = document.getElementById('fromUnitSelect');
    const toUnitSelect = document.getElementById('toUnitSelect');
    const resultDisplay = document.getElementById('conversionResult');
    const searchFromUnitInput = document.getElementById('searchFromUnit');
    const searchToUnitInput = document.getElementById('searchToUnit');
    const searchUnitsButton = document.getElementById('searchUnitsButton');
    const searchUnitsResultMessage = document.getElementById('searchUnitsResultMessage');
    const mainConverterSection = document.getElementById('main-converter-section');
    const resetButton = document.getElementById('resetInputButton'); // Get the new reset button

    // Access global functions and objects exposed from script.js
    const { getConverterInfoFromUrl, performConversion, units } = window;

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
    function populateLengthUnitDropdowns(fixedFromUnit = null, fixedToUnit = null) {
        if (!fromUnitSelect || !toUnitSelect) {
            return;
        }

        fromUnitSelect.innerHTML = '';
        toUnitSelect.innerHTML = '';

        if (fixedFromUnit && fixedToUnit) {
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
            fromUnitSelect.style.display = '';
            toUnitSelect.style.display = '';

            const lengthUnits = units.length || [];
            lengthUnits.forEach(unit => {
                const option1 = document.createElement('option');
                option1.value = unit;
                option1.textContent = unit;
                fromUnitSelect.appendChild(option1);

                const option2 = document.createElement('option');
                option2.value = unit;
                option2.textContent = unit;
                toUnitSelect.appendChild(option2);
            });

            if (lengthUnits.length > 0) {
                fromUnitSelect.value = lengthUnits[0];
                if (lengthUnits.length > 1) {
                    toUnitSelect.value = lengthUnits[1];
                } else {
                    toUnitSelect.value = lengthUnits[0];
                }
            }
        }
        if (typeof performConversion === 'function') {
            performConversion();
        } else {
            console.error("performConversion function is not available. Make sure script.js is loaded first and it exposes performConversion globally.");
        }
    }


    // Initial page setup for Length converter
    function initializeLengthConverterPage() {
        const { converterType, fromUnit, toUnit } = getConverterInfoFromUrl();

        if (converterType !== 'length' && converterType !== 'home') {
            return;
        }

        if (mainConverterSection) {
            const heading = mainConverterSection.querySelector('.section-heading');
            const description = mainConverterSection.querySelector('p[style*="text-align: center"]');
            
            if (fromUnit && toUnit) {
                if (heading) heading.textContent = `${fromUnit.charAt(0).toUpperCase() + fromUnit.slice(1)} to ${toUnit.charAt(0).toUpperCase() + toUnit.slice(1)} Converter`;
                if (description) description.textContent = `Convert values from ${fromUnit} to ${toUnit}.`;
                const searchSection = document.querySelector('.search-units-section');
                if (searchSection) searchSection.style.display = 'none';

                if (unitInput && unitInput.value === '') {
                    unitInput.value = 1; 
                }

            } else {
                if (heading) {
                    heading.textContent = 'Length Converter';
                }
                if (description) {
                    description.textContent = 'Convert various length units quickly and accurately, or select a specific conversion below.';
                }
            }
        }
        
        populateLengthUnitDropdowns(fromUnit, toUnit);
    }

    // Event listeners for real-time unit conversion
    if (unitInput) unitInput.addEventListener('input', performConversion);
    if (fromUnitSelect) fromUnitSelect.addEventListener('change', performConversion);
    if (toUnitSelect) toUnitSelect.addEventListener('change', performConversion);

    // Reset Button functionality
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            if (unitInput) unitInput.value = ''; // Input field ko khali karega
            if (resultDisplay) { // Result display ko reset karega, ya default text par set karega
                resultDisplay.textContent = '0.00';
                resultDisplay.classList.remove('error-message'); // Agar koi error message hai to usay hata dega
            }
            if (typeof performConversion === 'function') {
                performConversion(); // Optionally, recalculate with empty input
            }
        });
    }


    // Search Units Logic for Length (Directs to specific length pages)
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

            const lengthUnits = units.length || [];

            const findBestMatch = (searchText, unitList) => {
                const lowerSearchText = searchText.toLowerCase();
                let exactMatch = unitList.find(unit => unit.toLowerCase() === lowerSearchText);
                if (exactMatch) return exactMatch;
                let partialMatch = unitList.find(unit => unit.toLowerCase().includes(lowerSearchText));
                if (partialMatch) return partialMatch;
                return null;
            };

            const matchedFromUnit = findBestMatch(fromSearchText, lengthUnits);
            const matchedToUnit = findBestMatch(toSearchText, lengthUnits);

            if (matchedFromUnit && matchedToUnit) {
                const fromUrlPart = matchedFromUnit.toLowerCase().replace(/ /g, '_').replace(/-/g, '_');
                const toUrlPart = matchedToUnit.toLowerCase().replace(/ /g, '_').replace(/-/g, '_');
                
                // Redirect to the specific length conversion page
                window.location.href = `/length/${fromUrlPart}_to_${toUrlPart}.html`;
            } else {
                let errorMessage = "Could not find ";
                if (!matchedFromUnit && !matchedToUnit) {
                    errorMessage += `'${fromSearchText}' and '${toSearchText}'`;
                } else if (!matchedFromUnit) {
                    errorMessage += `'${fromSearchText}'`;
                } else { 
                    errorMessage += `'${toSearchText}'`;
                }
                errorMessage += ` in Length units.`;
                searchUnitsResultMessage.textContent = errorMessage;
                searchUnitsResultMessage.classList.add('error-message');
            }
        });
    }

    // Initialize Length converter functionality when DOM is ready
    initializeLengthConverterPage();
});