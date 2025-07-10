// This file contains JavaScript logic specifically for the Age converter.
// It relies on common functions and variables defined in script.js (which must be loaded first).

document.addEventListener('DOMContentLoaded', () => {
    // Get elements relevant to Age converter from the DOM.
    const dobInput = document.getElementById('dobInput');
    const ageResultDisplay = document.getElementById('ageResult');

    // Access global functions and objects exposed from script.js
    // window.performConversion (not directly used here but good to know it's available)
    // window.getConverterInfoFromUrl (not directly used here as it's a specific age page)

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


    // Age Converter Logic
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