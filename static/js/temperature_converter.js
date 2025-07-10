// This file contains JavaScript logic specifically for the Temperature converter.
// It relies on common functions and variables defined in script.js (which must be loaded first).

document.addEventListener('DOMContentLoaded', () => {
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

    const { getConverterInfoFromUrl, performConversion, units } = window;

    function populateTemperatureUnitDropdowns(fixedFromUnit = null, fixedToUnit = null) {
        if (!fromUnitSelect || !toUnitSelect) return;

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

            const temperatureUnits = units.temperature || [];
            temperatureUnits.forEach(unit => {
                const option1 = document.createElement('option');
                option1.value = unit;
                option1.textContent = unit;
                fromUnitSelect.appendChild(option1);

                const option2 = document.createElement('option');
                option2.value = unit;
                option2.textContent = unit;
                toUnitSelect.appendChild(option2);
            });

            if (temperatureUnits.length > 0) {
                fromUnitSelect.value = temperatureUnits[0];
                if (temperatureUnits.length > 1) {
                    toUnitSelect.value = temperatureUnits[1];
                } else {
                    toUnitSelect.value = temperatureUnits[0];
                }
            }
        }
        if (typeof performConversion === 'function') {
            performConversion();
        } else {
            console.error("performConversion function is not available. Make sure script.js is loaded first.");
        }
    }

    function initializeTemperatureConverterPage() {
        const { converterType, fromUnit, toUnit } = getConverterInfoFromUrl();

        if (converterType !== 'temperature') return;

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
                    heading.textContent = 'Temperature Converter';
                }
                if (description) {
                    description.textContent = 'Convert between Celsius, Fahrenheit, and Kelvin.';
                }
            }
        }
        
        populateTemperatureUnitDropdowns(fromUnit, toUnit);
    }

    if (unitInput) unitInput.addEventListener('input', performConversion);
    if (fromUnitSelect) fromUnitSelect.addEventListener('change', performConversion);
    if (toUnitSelect) toUnitSelect.addEventListener('change', performConversion);

    if (resetButton) {
        resetButton.addEventListener('click', () => {
            if (unitInput) unitInput.value = '';
            if (resultDisplay) {
                resultDisplay.textContent = '0.00';
                resultDisplay.classList.remove('error-message');
            }
            if (typeof performConversion === 'function') {
                performConversion();
            }
        });
    }

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

            const temperatureUnits = units.temperature || [];

            const findBestMatch = (searchText, unitList) => {
                const lowerSearchText = searchText.toLowerCase();
                let exactMatch = unitList.find(unit => unit.toLowerCase() === lowerSearchText);
                if (exactMatch) return exactMatch;
                let partialMatch = unitList.find(unit => unit.toLowerCase().includes(lowerSearchText));
                if (partialMatch) return partialMatch;
                return null;
            };

            const matchedFromUnit = findBestMatch(fromSearchText, temperatureUnits);
            const matchedToUnit = findBestMatch(toSearchText, temperatureUnits);

            if (matchedFromUnit && matchedToUnit) {
                const fromUrlPart = matchedFromUnit.toLowerCase().replace(/ /g, '_').replace(/-/g, '_');
                const toUrlPart = matchedToUnit.toLowerCase().replace(/ /g, '_').replace(/-/g, '_');
                
                // This would redirect to a specific temperature conversion page, if one exists
                // For example: window.location.href = `/temperature/${fromUrlPart}_to_${toUrlPart}.html`;
                // For now, if no specific page, set dropdowns.
                if (fromUnitSelect && toUnitSelect) {
                    fromUnitSelect.value = matchedFromUnit;
                    toUnitSelect.value = matchedToUnit;
                    performConversion();
                    searchUnitsResultMessage.textContent = ''; 
                    if (mainConverterSection) {
                        mainConverterSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                } else {
                    searchUnitsResultMessage.textContent = "Cannot set units on this page. Please use the main converter section on the Temperature Home page.";
                    searchUnitsResultMessage.classList.add('error-message');
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
                errorMessage += ` in Temperature units.`;
                searchUnitsResultMessage.textContent = errorMessage;
                searchUnitsResultMessage.classList.add('error-message');
            }
        });
    }

    initializeTemperatureConverterPage();

    // FAQ Accordion Functionality
    window.initializeFaqAccordion = function() {
        const faqQuestions = document.querySelectorAll('.faq-question');

        faqQuestions.forEach(question => {
            question.removeEventListener('click', handleFaqClick); 
            question.addEventListener('click', handleFaqClick); 
        });

        function handleFaqClick() {
            const answer = this.nextElementSibling; 
            faqQuestions.forEach(otherQuestion => {
                if (otherQuestion !== this && otherQuestion.classList.contains('active')) {
                    otherQuestion.classList.remove('active');
                    const otherAnswer = otherQuestion.nextElementSibling;
                    otherAnswer.style.maxHeight = null;
                    otherAnswer.classList.remove('active');
                }
            });

            this.classList.toggle('active'); 
            if (answer.style.maxHeight) {
                answer.style.maxHeight = null;
                answer.classList.remove('active');
            } else {
                answer.style.maxHeight = answer.scrollHeight + "px";
                answer.classList.add('active');
            }
        }
    };

    window.initializeFaqAccordion();
});