document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation Toggle
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

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


    // --- Common Converter Elements (to be used by specific converter JS files) ---
    // These elements might not be present on ALL pages (e.g., age converter might not have fromUnitSelect)
    // So, we get them here, and specific JS files will check for their existence.
    const unitInput = document.getElementById('fromUnitInput');
    const fromUnitSelect = document.getElementById('fromUnitSelect');
    const toUnitSelect = document.getElementById('toUnitSelect');
    const resultDisplay = document.getElementById('conversionResult');
    // search input fields are also common to many converters
    const searchFromUnitInput = document.getElementById('searchFromUnit');
    const searchToUnitInput = document.getElementById('searchToUnit');
    const searchUnitsButton = document.getElementById('searchUnitsButton');
    const searchUnitsResultMessage = document.getElementById('searchUnitsResultMessage');
    // mainConverterSection is generally present on most converter pages (excluding home/index.html perhaps)
    const mainConverterSection = document.getElementById('main-converter-section');
    // age and currency might have different main sections
    const ageConverterSection = document.getElementById('age-converter-section');


    // Currency to Country/Code mapping for better UX (Remains the same)
    const currencyCountryMap = {
        "USD": "United States Dollar", "EUR": "Euro", "GBP": "British Pound Sterling",
        "JPY": "Japanese Yen", "PKR": "Pakistani Rupee", "AUD": "Australian Dollar",
        "CAD": "Canadian Dollar", "CHF": "Swiss Franc", "CNY": "Chinese Yuan",
        "SEK": "Swedish Krona", "NZD": "New Zealand Dollar", "INR": "Indian Rupee",
        "BRL": "Brazilian Real", "RUB": "Russian Ruble", "ZAR": "South African Rand",
        "EGP": "Egyptian Pound", "SAR": "Saudi Riyal", "AED": "UAE Dirham",
        "MXN": "Mexican Peso", "SGD": "Singapore Dollar", "KRW": "South Korean Won",
        "TRY": "Turkish Lira", "IDR": "Indonesian Rupiah", "MYR": "Malaysian Ringgit",
        "THB": "Thai Baht", "VND": "Vietnamese Dong", "PHP": "Philippine Peso",
        "PLN": "Polish Zloty", "NOK": "Norwegian Krone", "DKK": "Danish Krone",
        "HUF": "Hungarian Forint", "CZK": "Czech Koruna", "ILS": "Israeli New Shekel",
        "CLP": "Chilean Peso", "COP": "Colombian Peso", "PEN": "Peruvian Sol",
        "ARS": "Argentine Peso", "UAH": "Ukrainian Hryvnia", "GHS": "Ghanaian Cedi",
        "NGN": "Nigerian Naira", "KES": "Kenyan Shilling", "UGX": "Ugandan Shilling",
        "TZS": "Tanzanian Shilling", "LKR": "Sri Lankan Rupee", "NPR": "Nepalese Rupee",
        "BDT": "Bangladeshi Taka", "LBP": "Lebanese Pound", "QAR": "Qatari Rial",
        "KWD": "Kuwaiti Dinar", "BHD": "Bahraini Dinar", "OMR": "Omani Rial",
        "JOD": "Jordanian Dinar", "SYP": "Syrian Pound", "IQD": "Iraqi Dinar",
        "AFN": "Afghan Afghani", "AZN": "Azerbaijani Manat", "GEL": "Georgian Lari",
        "AMD": "Armenian Dram", "MDL": "Moldovan Leu", "KZT": "Kazakhstani Tenge",
        "UZS": "Uzbekistani Som", "TJS": "Tajikistani Somoni", "KGS": "Kyrgyzstani Som",
        "TMT": "Turkmenistani Manat", "MNT": "Mongolian Tugrik", "MMK": "Myanmar Kyat",
        "LAK": "Lao Kip", "KHR": "Cambodian Riel", "BTN": "Bhutanese Ngultrum",
        "MVR": "Maldivian Rufiyaa", "PGK": "Papua New Guinean Kina", "FJD": "Fijian Dollar",
        "SBD": "Solomon Islands Dollar", "VUV": "Vanuatu Vatu", "WST": "Samoan Tala",
        "TOP": "Tongan Paʻanga", "KMF": "Comorian Franc", "SCR": "Seychellois Rupee",
        "MRO": "Mauritanian Ouguiya (old)", "MRU": "Mauritanian Ouguiya",
        "DJF": "Djiboutian Franc", "ERN": "Eritrean Nakfa", "ETB": "Ethiopian Birr",
        "SHP": "Saint Helena Pound", "SSP": "South Sudanese Pound", "SDG": "Sudanese Pound",
        "CDF": "Congolese Franc", "BIF": "Burundian Franc", "RWF": "Rwandan Franc",
        "MWK": "Malawian Kwacha", "ZMW": "Zambian Kwacha", "NAD": "Namibian Dollar",
        "BWP": "Botswana Pula", "LRD": "Liberian Dollar", "SLL": "Sierra Leonean Leone",
        "GMD": "Gambian Dalasi", "CVE": "Cape Verdean Escudo", "GNF": "Guinean Franc",
        "XOF": "West African CFA Franc", "XAF": "Central African CFA Franc",
        "XCD": "East Caribbean Dollar", "BZD": "Belize Dollar", "GTQ": "Guatemalan Quetzal",
        "HNL": "Honduran Lempira", "NIO": "Nicaraguan Córdoba", "CRC": "Costa Rican Colón",
        "DOP": "Dominican Peso", "JMD": "Jamaican Dollar", "TTD": "Trinidad and Tobago Dollar",
        "BBD": "Barbadian Dollar", "XDR": "Special Drawing Rights",
    };

    // Reverse map for country name to currency code lookup
    const countryCurrencyMap = {};
    for (const code in currencyCountryMap) {
        countryCurrencyMap[currencyCountryMap[code].toLowerCase()] = code;
    }


    // Define all units for different converter types (Updated: removed fuel_economy, torque, data_transfer_rate)
    const units = {
        length: [
            "Meter", "Kilometer", "Centimeter", "Millimeter", "Micrometer", "Nanometer",
            "Mile", "Yard", "Foot", "Inch", "Light Year", "Nautical Mile"
        ],
        temperature: [
            "Celsius", "Fahrenheit", "Kelvin", "Rankine", "Réaumur"
        ],
        area: [
            "Square Meter", "Square Kilometer", "Square Centimeter", "Square Millimeter",
            "Square Micrometer", "Hectare", "Acre", "Square Mile", "Square Yard",
            "Square Foot", "Square Inch", "Are"
        ],
        volume: [
            "Litre", "Millilitre", "Cubic Meter", "Cubic Centimeter", "Cubic Millimeter",
            "Gallon (US Liquid)", "Gallon (UK)", "Fluid Ounce (US)", "Fluid Ounce (UK)",
            "Barrel (US Liquid)", "Quart (US Liquid)", "Pint (US Liquid)", "Cup (US)",
            "Teaspoon (US)", "Tablespoon (US)", "Cubic Inch", "Cubic Foot"
        ],
        weight: [
            "Kilogram", "Gram", "Milligram", "Metric Ton", "Long Ton", "Short Ton",
            "Pound", "Ounce", "Carat", "Atomic Mass Unit", "Stone"
        ],
        time: [
            "Second", "Millisecond", "Microsecond", "Nanosecond", "Minute", "Hour",
            "Day", "Week", "Month (approx)", "Year (approx)", "Decade", "Century", "Millennium"
        ],
        speed: [
            "Meter per second", "Kilometer per hour", "Mile per hour", "Knot",
            "Foot per second", "Mach", "Speed of light"
        ],
        currency: Object.keys(currencyCountryMap).sort(), // Sorted list of currency codes
        digital_storage: [
            "Bit", "Byte", "Kilobit", "Kilobyte", "Megabit", "Megabyte",
            "Gigabit", "Gigabyte", "Terabit", "Terabyte", "Petabyte", "Exabyte"
        ],
        energy: [
            "Joule", "Kilojoule", "Calorie", "Kilocalorie", "Kilowatt-hour",
            "Electron Volt", "BTU", "Therm", "Foot-pound (energy)"
        ],
        frequency: [
            "Hertz", "Kilohertz", "Megahertz", "Gigahertz"
        ],
        pressure: [
            "Pascal", "Kilopascal", "Bar", "PSI", "Atmosphere", "Torr"
        ],
        force: [
            "Newton", "Kilonewton", "Dyne", "Pound-force", "Kilogram-force"
        ],
        power: [
            "Watt", "Kilowatt", "Megawatt", "Horsepower", "Foot-pound per minute",
            "BTU per hour"
        ],
        angle: [
            "Degree", "Radian", "Gradian", "Milliradian", "Arcminute", "Arcsecond"
        ],
        density: [
            "Kilogram per cubic meter", "Gram per cubic centimeter", "Pound per cubic foot",
            "Pound per cubic inch"
        ]
        // Removed fuel_economy, torque, data_transfer_rate as per instruction
    };

    // --- Expose Common Variables and Functions to the global `window` object ---
    // This allows specific converter JS files (like length_converter.js) to access them.
    window.unitInput = unitInput; // Exposing DOM element
    window.fromUnitSelect = fromUnitSelect; // Exposing DOM element
    window.toUnitSelect = toUnitSelect; // Exposing DOM element
    window.resultDisplay = resultDisplay; // Exposing DOM element
    window.searchFromUnitInput = searchFromUnitInput; // Exposing DOM element
    window.searchToUnitInput = searchToUnitInput; // Exposing DOM element
    window.searchUnitsButton = searchUnitsButton; // Exposing DOM element
    window.searchUnitsResultMessage = searchUnitsResultMessage; // Exposing DOM element
    window.mainConverterSection = mainConverterSection; // Exposing DOM element
    window.ageConverterSection = ageConverterSection; // Exposing DOM element
    
    window.currencyCountryMap = currencyCountryMap; // Exposing data map
    window.countryCurrencyMap = countryCurrencyMap; // Exposing data map
    window.units = units; // Exposing units object

    // Helper function to extract converter type and specific units from URL
    window.getConverterInfoFromUrl = function() {
        const pathParts = window.location.pathname.split('/').filter(part => part !== '');
        let converterType = null;
        let fromUnit = null;
        let toUnit = null;

        if (pathParts.length === 0 || pathParts[0] === 'home') {
            // Default to 'length' for the homepage, if it has a converter section
            converterType = 'home'; // Use 'home' as category for homepage
        } else {
            converterType = pathParts[0]; // e.g., 'length', 'temperature', 'currency'

            if (pathParts.length > 1) {
                const lastPart = pathParts[pathParts.length - 1];
                if (lastPart.includes('_to_') && lastPart.endsWith('.html')) {
                    // This is a specific unit conversion page (e.g., /length/meter_to_feet.html)
                    const unitPart = lastPart.replace('.html', '');
                    const unitsInUrl = unitPart.split('_to_');
                    fromUnit = unitsInUrl[0].replace(/_/g, ' ').replace(/\b(us|uk)\b/g, (match) => match.toUpperCase()); // Convert 'us'/'uk' to 'US'/'UK'
                    toUnit = unitsInUrl[1].replace(/_/g, ' ').replace(/\b(us|uk)\b/g, (match) => match.toUpperCase()); // For units like 'gallon (us liquid)'
                }
            }
        }
        return { converterType, fromUnit, toUnit };
    };

    // Performs unit conversion by sending request to backend.
    window.performConversion = async function() {
        // unitInput and resultDisplay are accessed globally via `window`
        if (!window.unitInput || !window.resultDisplay) return;

        const value = parseFloat(window.unitInput.value);
        window.resultDisplay.classList.remove('error-message');
        
        if (isNaN(value) || window.unitInput.value.trim() === '') {
            window.resultDisplay.textContent = "Please enter a valid number.";
            window.resultDisplay.classList.add('error-message');
            return;
        }

        const { converterType, fromUnit: urlFromUnit, toUnit: urlToUnit } = window.getConverterInfoFromUrl();
        
        let fromUnit, toUnit;

        if (urlFromUnit && urlToUnit) {
            // If on a specific unit conversion page, use units from URL
            fromUnit = urlFromUnit;
            toUnit = urlToUnit;
        } else if (window.fromUnitSelect && window.toUnitSelect) {
            // Otherwise, use units from dropdowns (for main category pages)
            fromUnit = window.fromUnitSelect.value;
            toUnit = window.toUnitSelect.value;
        } else {
            // Fallback if no units found (should not happen if logic is correct)
            window.resultDisplay.textContent = "Error: Units could not be determined.";
            window.resultDisplay.classList.add('error-message');
            return;
        }

        // Handle currency conversion for currency converter
        if (converterType === 'currency') {
            fromUnit = window.countryCurrencyMap[fromUnit.toLowerCase()] || fromUnit;
            toUnit = window.countryCurrencyMap[toUnit.toLowerCase()] || toUnit;
        }

        window.resultDisplay.textContent = "Converting...";

        try {
            const response = await fetch('/convert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    value: value,
                    from_unit: fromUnit,
                    to_unit: toUnit,
                    converter_type: converterType // Send determined converter type
                }),
            });

            const data = await response.json();
            if (response.ok && data.status === 'success') {
                window.resultDisplay.textContent = `${data.result}`;
            } else {
                window.resultDisplay.textContent = `${data.result}`;
                window.resultDisplay.classList.add('error-message');
            }
        } catch (error) {
            console.error('Error during conversion API call:', error);
            window.resultDisplay.textContent = "Error: Could not connect to the conversion server.";
            window.resultDisplay.classList.add('error-message');
        }
    };


    // Active Navigation Link Styling (Updated for new URL structure)
    window.setActiveNavLink = function() {
        const navLinks = document.querySelectorAll('.nav-links a'); // Main navigation links
        const converterTabs = document.querySelectorAll('.converter-tabs a.converter-tab-button'); // Top converter tabs

        const currentPath = window.location.pathname.toLowerCase();

        // Special handling for the 'Home' link which maps to '/' or '/home/'
        navLinks.forEach(link => {
            link.classList.remove('active');
            const linkHref = link.getAttribute('href').toLowerCase();

            if (linkHref === '/' && (currentPath === '/' || currentPath.startsWith('/home/'))) {
                link.classList.add('active');
            }
            // For other general nav links, check if current path starts with the link's href
            else if (linkHref !== '/' && currentPath.startsWith(linkHref.slice(0, -1))) { // Slicing to match /category/ with /category
                link.classList.add('active');
            }
        });

        // Handle converter tabs
        converterTabs.forEach(tab => {
            tab.classList.remove('active');
            const tabHref = tab.getAttribute('href').toLowerCase();
            
            // For main category tabs like /currency/, /digital_storage/, etc.
            // Check if current path matches the tab's href or starts with the base category path
            if (currentPath === tabHref || currentPath.startsWith(tabHref.slice(0, -1) + '/')) {
                 tab.classList.add('active');
            }
        });
    };

    // Initialize Active Nav Link on initial load
    window.setActiveNavLink();
    window.addEventListener('popstate', window.setActiveNavLink);


    // Age Converter Logic (on age/index.html) - This logic is specific to Age,
    // so it should ideally move to age_converter.js. For now, keep it here if it's the only one.
    // If other specific converters are made, move this into age_converter.js.
    const dobInput = document.getElementById('dobInput');
    const ageResultDisplay = document.getElementById('ageResult');

    if (dobInput && ageResultDisplay) {
        dobInput.addEventListener('change', callAgeApi);

        async function callAgeApi() {
            const dob_str = dobInput.value;
            ageResultDisplay.classList.remove('error-message');
            
            if (!dob_str) {
                ageResultDisplay.innerHTML = "Please enter a valid date of birth.";
                ageResultDisplay.classList.add('error-message');
                return;
            }

            ageResultDisplay.innerHTML = "Calculating age...";

            try {
                const response = await fetch('/calculate_age', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ dob: dob_str }),
                });

                const data = await response.json();
                if (response.ok && data.status === 'success') {
                    ageResultDisplay.innerHTML = data.result;
                } else {
                    ageResultDisplay.innerHTML = `Error: ${data.result}`;
                    ageResultDisplay.classList.add('error-message');
                }
            } catch (error) {
                console.error('Error during age calculation API call:', error);
                ageResultDisplay.innerHTML = "Error: Could not connect to the age calculation server.";
                ageResultDisplay.classList.add('error-message');
            }
        }
        // Initial call for age converter if dob is pre-filled (unlikely for a fresh load)
        if (dobInput.value) {
            callAgeApi();
        }
    }
});