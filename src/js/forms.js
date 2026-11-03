// --- src/js/forms.js ---
import { showToast } from './utils.js';

export function initForms() {
  const contactForms = document.querySelectorAll('form[id^="contactForm"], form.nl-form');
  
  if (contactForms.length > 0) {
    contactForms.forEach(form => {
      // For newsletter forms that might have inline onsubmit, we can leave them or attach here.
      // Let's attach our robust handler if they aren't marked as simple.
      if (form.classList.contains('nl-form')) return;

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formSubmitBtn = form.querySelector('button[type="submit"]');
        const btnText = formSubmitBtn?.querySelector('.btn-text');
        const btnLoader = formSubmitBtn?.querySelector('.btn-loader');
        const formStatusMsg = form.nextElementSibling; // The toast div
        
        // 1. Offline Detection
        if (!navigator.onLine) {
          showToast(formStatusMsg, "You are currently offline. Please check your internet connection and try again.", "error");
          return;
        }

        // 2. Honeypot check
        const botField = form.querySelector('input[name="bot_field"]');
        if (botField && botField.value !== "") {
          console.warn("Bot detected.");
          return; // Silently reject
        }

        // 3. HTML5 Validation
        if (!form.checkValidity()) {
          showToast(formStatusMsg, "Please fill in all required fields correctly.", "error");
          return;
        }

                const phoneInput = form.querySelector('input[name="phone"]');
        const nameInput = form.querySelector('input[name="name"]');

        if (nameInput && nameInput.value.trim() === "") {
          showToast(formStatusMsg, "Please enter your full name.", "error");
          return;
        }

        if (phoneInput && phoneInput.value.trim() === "") {
          showToast(formStatusMsg, "Please enter your phone number.", "error");
          return;
        }

        // Phone Validation (10 digits) if phone field exists
        if (phoneInput) {
          const phoneRegex = /^[0-9]{10}$/;
          if (!phoneRegex.test(phoneInput.value.replace(/\D/g, ''))) {
            showToast(formStatusMsg, "Please enter a valid 10-digit mobile number.", "error");
            return;
          }
        }

        // Simulate Loading State
        if (formSubmitBtn && btnText && btnLoader) {
          formSubmitBtn.disabled = true;
          btnText.style.display = 'none';
          btnLoader.style.display = 'inline-block';
          formSubmitBtn.setAttribute('aria-busy', 'true');
        }

        // 4. Simulate Network Request with Timeout Logic
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

        // Since we don't have a real backend, we simulate fetch with a promise
        new Promise((resolve, reject) => {
          const simTime = Math.random() * 2000 + 1000;
          const timer = setTimeout(() => {
            // Randomly simulate a server error 5% of the time to demonstrate robust handling
            if (Math.random() < 0.05) {
              reject(new Error("Server Error"));
            } else {
              resolve();
            }
          }, simTime);

          controller.signal.addEventListener('abort', () => {
            clearTimeout(timer);
            reject(new Error("Network Timeout"));
          });
        })
        .then(() => {
          clearTimeout(timeoutId);
          const userName = nameInput ? nameInput.value.trim() : "there";
          showToast(formStatusMsg, `Thank you, ${userName}! Your consultation visit has been booked. A MITRA manager will call you within 2 hours.`, "success");
          
          // Analytics Track Event
          if (window.trackEvent) {
            window.trackEvent('generate_lead', {
              event_category: 'Form Submission',
              event_label: 'Contact Form',
              value: 1
            });
          }
          
          form.reset();
        })
        .catch((error) => {
          if (error.message === "Network Timeout") {
            showToast(formStatusMsg, "Request timed out. Please try submitting again.", "error");
          } else {
            showToast(formStatusMsg, "Submission failed due to a server error. Please try again.", "error");
          }
        })
        .finally(() => {
          // Reset Button State
          if (formSubmitBtn && btnText && btnLoader) {
            formSubmitBtn.disabled = false;
            btnText.style.display = 'inline-block';
            btnLoader.style.display = 'none';
            formSubmitBtn.setAttribute('aria-busy', 'false');
          }
        });
      });
    });
  }
}
