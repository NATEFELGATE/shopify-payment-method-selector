import { Component } from '@theme/component';
import { debounce, fetchConfig } from '@theme/utilities';

/**
 * Payment Method Selector Component v1.1
 * 
 * A custom element that handles payment method selection and charge code functionality
 * for Shopify cart integration. Supports Credit Card and Charge Code payment methods
 * with real-time validation, cart note synchronization, and cart attributes tracking.
 * 
 * Features:
 * - Dual payment method selection (Credit Card / Charge Code)
 * - Real-time charge code sanitization and validation
 * - Cart note synchronization for HidePay integration
 * - Cart attributes tracking for backend analytics
 * - Comprehensive error handling and user feedback
 * - Full accessibility support with ARIA attributes
 * - Event logging for debugging and analytics (GA4, dataLayer)
 * 
 * Usage:
 * <payment-method-selector>
 *   <!-- Payment method radio buttons and charge code input -->
 * </payment-method-selector>
 * 
 * @author Generated via GitHub Copilot
 * @version 1.1.0
 * @since 2025-07-29
 */
class PaymentMethodSelector extends Component {
  /** @type {AbortController | null} */
  #activeFetch = null;

  constructor() {
    super();
    this.paymentMethodRadios = null;
    this.chargeCodeSection = null;
    this.chargeCodeInput = null;
    this.checkoutButton = null;
    this.errorMessage = null;
  }

  connectedCallback() {
    // Initialize elements when the component is connected to the DOM
    this.paymentMethodRadios = this.querySelectorAll('input[name="attributes[payment_method]"]');
    this.chargeCodeSection = this.querySelector('.charge-code-section');
    this.chargeCodeInput = this.querySelector('#charge_code_input');
    this.checkoutButton = document.querySelector('#checkout');
    this.errorMessage = this.querySelector('.payment-method-error');
    
    // Only initialize if we have the required elements
    if (this.paymentMethodRadios.length > 0) {
      this.init();
    }
  }

  disconnectedCallback() {
    // Clean up event listeners when component is removed
    if (this.#activeFetch) {
      this.#activeFetch.abort();
      this.#activeFetch = null;
    }
  }

  init() {
    // Add event listeners to payment method radio buttons
    if (this.paymentMethodRadios) {
      this.paymentMethodRadios.forEach(radio => {
        radio.addEventListener('change', this.handlePaymentMethodChange.bind(this));
      });
    }

    // Add event listener to charge code input
    if (this.chargeCodeInput) {
      this.chargeCodeInput.addEventListener('input', this.handleChargeCodeInput);
    }

    // Add event listener to checkout button
    if (this.checkoutButton) {
      this.checkoutButton.addEventListener('click', this.handleCheckoutClick.bind(this));
    }
  }

  /**
   * Logs events for debugging and analytics
   * @param {string} eventName - The event name
   * @param {object} data - Additional event data
   */
  logEvent(eventName, data = {}) {
    // Console logging for debugging
    console.log(`[PaymentMethodSelector] ${eventName}:`, data);
    
    // Optional: Send to Google Analytics 4 if available
    if (typeof window !== 'undefined' && 'gtag' in window && typeof window.gtag === 'function') {
      window.gtag('event', eventName, {
        event_category: 'payment_method_selector',
        ...data
      });
    }
    
    // Optional: Send to other analytics platforms
    if (typeof window !== 'undefined' && 'dataLayer' in window && Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: 'payment_method_selector_event',
        eventName: eventName,
        eventData: data
      });
    }
  }

  /**
   * Handles payment method selection changes
   * @param {Event} event - The change event
   */
  handlePaymentMethodChange(event) {
    if (!(event.target instanceof HTMLInputElement)) return;
    
    const selectedMethod = event.target.value;
    this.logEvent('payment_method_selected', { method: selectedMethod });
    
    // Sync payment method selection to cart attributes for backend tracking
    this.updateCartAttributes({ payment_method: selectedMethod });
    
    if (selectedMethod === 'charge_code') {
      this.showChargeCodeSection();
    } else if (selectedMethod === 'credit_card') {
      this.hideChargeCodeSection();
      this.clearChargeCode();
    }
    
    this.hideError();
  }

  /**
   * Shows the charge code section
   */
  showChargeCodeSection() {
    if (this.chargeCodeSection instanceof HTMLElement) {
      this.chargeCodeSection.style.display = 'block';
      if (this.chargeCodeInput instanceof HTMLInputElement) {
        this.chargeCodeInput.setAttribute('required', 'required');
      }
    }
  }

  /**
   * Hides the charge code section
   */
  hideChargeCodeSection() {
    if (this.chargeCodeSection instanceof HTMLElement) {
      this.chargeCodeSection.style.display = 'none';
      if (this.chargeCodeInput instanceof HTMLInputElement) {
        this.chargeCodeInput.removeAttribute('required');
      }
    }
  }

  /**
   * Clears the charge code input and removes it from cart note
   */
  clearChargeCode() {
    if (this.chargeCodeInput instanceof HTMLInputElement) {
      this.chargeCodeInput.value = '';
      // Clear both the form field and the cart note
      this.updateCartNote('');
    }
  }

  /**
   * Sanitizes charge code input to prevent injection attacks
   * @param {string} input - The raw input string
   * @returns {string} - The sanitized string
   */
  sanitizeChargeCode(input) {
    if (!input || typeof input !== 'string') return '';
    
    // Remove any potentially dangerous characters
    // Allow only alphanumeric, hyphens, underscores, and spaces
    const sanitized = input
      .trim()
      .replace(/[^\w\s\-]/g, '') // Remove everything except word chars, spaces, hyphens
      .substring(0, 50); // Enforce max length
    
    this.logEvent('charge_code_sanitized', { 
      original_length: input.length, 
      sanitized_length: sanitized.length,
      was_modified: input !== sanitized
    });
    
    return sanitized;
  }

  /**
   * Handles charge code input changes
   * @param {InputEvent} event - The input event
   */
  handleChargeCodeInput = debounce(async (event) => {
    if (!(event.target instanceof HTMLInputElement)) return;
    
    const rawChargeCode = event.target.value;
    const sanitizedChargeCode = this.sanitizeChargeCode(rawChargeCode);
    
    // Update the input if sanitization changed the value
    if (rawChargeCode !== sanitizedChargeCode) {
      event.target.value = sanitizedChargeCode;
    }
    
    // Format the note content for consistency
    const noteContent = sanitizedChargeCode ? `Charge Code: ${sanitizedChargeCode}` : '';
    
    // Update the input value to the formatted version
    event.target.value = noteContent;
    
    // Also update the cart via AJAX for real-time sync
    await this.updateCartNote(noteContent);
  }, 300);

  /**
   * Updates cart attributes for backend tracking
   * @param {object} attributes - The attributes to update
   */
  async updateCartAttributes(attributes) {
    try {
      if (!Theme.routes.cart_update_url) {
        throw new Error('Cart update URL not defined');
      }

      const config = fetchConfig('json', {
        body: JSON.stringify({ attributes }),
      });

      const response = await fetch(Theme.routes.cart_update_url, config);

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[PaymentMethodSelector] Cart attributes update failed: ${response.status} - ${errorText}`);
        this.logEvent('cart_attributes_update_failed', { 
          status: response.status, 
          error: errorText,
          attributes
        });
        return;
      }

      this.logEvent('cart_attributes_updated', { attributes });

    } catch (error) {
      console.warn('[PaymentMethodSelector] Failed to update cart attributes:', error.message);
      this.logEvent('cart_attributes_error', { 
        error: error.message,
        attributes
      });
    }
  }

  /**
   * Updates the cart note with charge code information
   * @param {string} noteContent - The note content to set
   */
  async updateCartNote(noteContent) {
    // Guard clause: ensure cart update URL is available
    try {
      if (!Theme.routes.cart_update_url) {
        throw new Error('Cart update URL not defined');
      }
    } catch (error) {
      console.warn('[PaymentMethodSelector] Cart update URL not defined. Skipping note update.');
      this.logEvent('cart_update_failed', { reason: 'missing_cart_update_url' });
      return;
    }

    if (this.#activeFetch) {
      this.#activeFetch.abort();
    }

    const abortController = new AbortController();
    this.#activeFetch = abortController;

    try {
      const config = fetchConfig('json', {
        body: JSON.stringify({ note: noteContent }),
      });

      const response = await fetch(Theme.routes.cart_update_url, {
        ...config,
        signal: abortController.signal,
      });

      // Log response failures for debugging
      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[PaymentMethodSelector] Cart note update failed: ${response.status} - ${errorText}`);
        this.logEvent('cart_update_failed', { 
          status: response.status, 
          error: errorText,
          noteContent: noteContent.substring(0, 50) // Log first 50 chars for debugging
        });
        return;
      }

      // Also update any existing cart note textarea if present
      const cartNoteTextarea = document.querySelector('#cart-note');
      if (cartNoteTextarea instanceof HTMLTextAreaElement) {
        cartNoteTextarea.value = noteContent;
      }

      // Update the hidden note field in the cart form
      const cartFormNote = document.querySelector('#charge-code-cart-note');
      if (cartFormNote instanceof HTMLInputElement) {
        cartFormNote.value = noteContent;
      }

      this.logEvent('cart_note_updated', { 
        noteLength: noteContent.length,
        hasChargeCode: noteContent.includes('Charge Code:')
      });

    } catch (error) {
      console.error('[PaymentMethodSelector] Failed to update cart note:', error);
      this.logEvent('cart_update_error', { 
        error: error.message,
        noteContent: noteContent.substring(0, 50)
      });
    } finally {
      this.#activeFetch = null;
    }
  }

  /**
   * Handles checkout button click
   * @param {Event} event - The click event
   */
  handleCheckoutClick(event) {
    const selectedPaymentMethod = this.getSelectedPaymentMethod();
    
    if (!selectedPaymentMethod) {
      event.preventDefault();
      this.logEvent('checkout_blocked', { reason: 'no_payment_method' });
      this.showError();
      return false;
    }
    
    if (selectedPaymentMethod === 'charge_code') {
      const chargeCode = this.chargeCodeInput instanceof HTMLInputElement ? this.sanitizeChargeCode(this.chargeCodeInput.value) : '';
      if (!chargeCode) {
        event.preventDefault();
        this.logEvent('checkout_blocked', { reason: 'no_charge_code' });
        this.showError('Please enter a charge code.');
        return false;
      }
      if (chargeCode.length < 2) {
        event.preventDefault();
        this.logEvent('checkout_blocked', { reason: 'charge_code_too_short' });
        this.showError('Charge code must be at least 2 characters long.');
        return false;
      }
      this.logEvent('checkout_attempted', { method: 'charge_code', code_length: chargeCode.length });
    } else {
      this.logEvent('checkout_attempted', { method: 'credit_card' });
    }
    
    this.hideError();
    return true;
  }

  /**
   * Gets the currently selected payment method
   * @returns {string|null} The selected payment method value or null
   */
  getSelectedPaymentMethod() {
    const selectedRadio = this.querySelector('input[name="attributes[payment_method]"]:checked');
    return selectedRadio instanceof HTMLInputElement ? selectedRadio.value : null;
  }

  /**
   * Shows an error message
   * @param {string} message - Custom error message
   */
  showError(message = 'Please select a payment method before proceeding to checkout.') {
    if (this.errorMessage instanceof HTMLElement) {
      this.errorMessage.textContent = message;
      this.errorMessage.style.display = 'block';
      this.errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    // Add visual error state to radio buttons if no payment method selected
    if (message.includes('select a payment method')) {
      this.paymentMethodRadios?.forEach(input => {
        input.classList.add('error');
        input.setAttribute('aria-invalid', 'true');
      });
    }
  }

  /**
   * Hides the error message
   */
  hideError() {
    if (this.errorMessage instanceof HTMLElement) {
      this.errorMessage.style.display = 'none';
    }
    
    // Remove error state from radio buttons
    this.paymentMethodRadios?.forEach(input => {
      input.classList.remove('error');
      input.removeAttribute('aria-invalid');
    });
  }
}

if (!customElements.get('payment-method-selector')) {
  customElements.define('payment-method-selector', PaymentMethodSelector);
}
