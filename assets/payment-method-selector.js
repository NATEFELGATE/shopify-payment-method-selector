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
    
    // ✅ Debug: Check cart items visibility before payment method change
    const cartItems = document.querySelector('.cart-items, .cart__items, cart-items-component');
    if (cartItems) {
      console.log('[PaymentMethodSelector] Cart items visibility before change:', {
        display: getComputedStyle(cartItems).display,
        visibility: getComputedStyle(cartItems).visibility,
        opacity: getComputedStyle(cartItems).opacity
      });
    } else {
      console.warn('[PaymentMethodSelector] Cart items container not found in DOM');
    }
    
    // ✅ Store payment method in cart attributes only (no cart note)
    this.updateCartAttributes({ payment_method: selectedMethod });
    
    if (selectedMethod === 'charge_code') {
      this.showChargeCodeSection();
      // Store any existing charge code in attributes
      const currentChargeCode = this.chargeCodeInput instanceof HTMLInputElement ? 
        this.sanitizeChargeCode(this.chargeCodeInput.value) : '';
      if (currentChargeCode) {
        this.updateCartAttributes({ charge_code: currentChargeCode });
      }
    } else if (selectedMethod === 'credit_card') {
      this.hideChargeCodeSection();
      this.clearChargeCode();
    }
    
    // ✅ Debug: Check cart items visibility after payment method change
    setTimeout(() => {
      const cartItemsAfter = document.querySelector('.cart-items, .cart__items, cart-items-component');
      if (cartItemsAfter) {
        const afterStyles = getComputedStyle(cartItemsAfter);
        console.log('[PaymentMethodSelector] Cart items visibility after change:', {
          display: afterStyles.display,
          visibility: afterStyles.visibility,
          opacity: afterStyles.opacity
        });
        
        if (afterStyles.display === 'none' || afterStyles.visibility === 'hidden') {
          console.error('[PaymentMethodSelector] ⚠️ Cart items disappeared after payment method change!');
          this.logEvent('cart_items_disappeared', { 
            method: selectedMethod,
            display: afterStyles.display,
            visibility: afterStyles.visibility
          });
          // Try to restore visibility
          if (cartItemsAfter instanceof HTMLElement) {
            cartItemsAfter.style.display = '';
            cartItemsAfter.style.visibility = '';
            console.log('[PaymentMethodSelector] Attempted to restore cart items visibility');
          }
        }
      }
    }, 100);
    
    this.hideError();
  }

  /**
   * Shows the charge code section
   */
  showChargeCodeSection() {
    const section = this.chargeCodeSection || document.querySelector('.charge-code-section');
    
    if (section instanceof HTMLElement) {
      section.style.display = 'block';
      
      // ✅ Log debug events if the element is missing or fails to render
      console.log('[PaymentMethodSelector] Charge code section displayed successfully');
      this.logEvent('charge_code_section_shown', { 
        sectionFound: true,
        display: section.style.display 
      });
      
      const input = this.chargeCodeInput || section.querySelector('#charge_code_input');
      if (input instanceof HTMLInputElement) {
        input.setAttribute('required', 'required');
        // Focus after a brief delay to ensure DOM is ready
        setTimeout(() => input.focus(), 100);
        console.log('[PaymentMethodSelector] Charge code input made required and focused');
      } else {
        console.error('[PaymentMethodSelector] Charge code input not found!');
        this.logEvent('charge_code_input_missing', { inputFound: false });
      }

      // ✅ Make terms checkbox required when charge code is selected
      const termsCheckbox = document.querySelector('#charge_code_terms');
      if (termsCheckbox instanceof HTMLInputElement) {
        termsCheckbox.setAttribute('required', 'required');
        console.log('[PaymentMethodSelector] Terms checkbox made required');
      }
    } else {
      console.error('[PaymentMethodSelector] Charge code section not found in DOM!');
      this.logEvent('charge_code_section_missing', { sectionFound: false });
    }
  }

  /**
   * Hides the charge code section
   */
  hideChargeCodeSection() {
    const section = this.chargeCodeSection || document.querySelector('.charge-code-section');
    
    if (section instanceof HTMLElement) {
      section.style.display = 'none';
      
      const input = this.chargeCodeInput || section.querySelector('#charge_code_input');
      if (input instanceof HTMLInputElement) {
        input.removeAttribute('required');
        input.value = ''; // Clear the input when hiding
        console.log('[PaymentMethodSelector] Charge code input cleared and made optional');
      }

      // ✅ Make terms checkbox optional when not using charge code
      const termsCheckbox = document.querySelector('#charge_code_terms');
      if (termsCheckbox instanceof HTMLInputElement) {
        termsCheckbox.removeAttribute('required');
        termsCheckbox.checked = false;
        console.log('[PaymentMethodSelector] Terms checkbox made optional and unchecked');
      }
    }
  }

  /**
   * Clears the charge code input and removes it from cart attributes
   */
  clearChargeCode() {
    if (this.chargeCodeInput instanceof HTMLInputElement) {
      this.chargeCodeInput.value = '';
      // ✅ Clear charge code from cart attributes (no cart note logic)
      this.updateCartAttributes({ charge_code: '' });
      console.log('[PaymentMethodSelector] Cleared charge code from cart attributes');
    }
  }

  /**
   * Gets the current cart note value (legacy - no longer used)
   * @returns {string} - The current cart note content
   * @deprecated Cart notes are no longer used for charge codes
   */
  getCurrentCartNote() {
    const cartFormNote = document.querySelector('#charge-code-cart-note');
    if (cartFormNote instanceof HTMLInputElement) {
      return cartFormNote.value || '';
    }
    
    const cartNoteTextarea = document.querySelector('#cart-note');
    if (cartNoteTextarea instanceof HTMLTextAreaElement) {
      return cartNoteTextarea.value || '';
    }
    
    return '';
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
    
    // ✅ Store charge code in cart attributes only (no cart note)
    await this.updateCartAttributes({ 
      payment_method: 'charge_code',
      charge_code: sanitizedChargeCode 
    });
    
    console.log('[PaymentMethodSelector] Charge code updated in cart attributes:', sanitizedChargeCode);
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
      
      // ✅ Check charge code
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

      // ✅ Check terms checkbox
      const termsCheckbox = document.querySelector('#charge_code_terms');
      if (termsCheckbox instanceof HTMLInputElement && !termsCheckbox.checked) {
        event.preventDefault();
        this.logEvent('checkout_blocked', { reason: 'terms_not_accepted' });
        this.showError('Please accept the Terms and Conditions to proceed with charge code payment.');
        return false;
      }

      this.logEvent('checkout_attempted', { method: 'charge_code', code_length: chargeCode.length, terms_accepted: true });
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
