/**
 * Cart Note Utilities
 * 
 * Modular utilities for managing structured cart notes in Shopify.
 * Designed for reuse across payment methods, events, custom logic, etc.
 * 
 * @author Generated via GitHub Copilot
 * @version 1.0.0
 * @since 2025-07-30
 */

/**
 * Cart note section types and their parsing patterns
 */
const CART_NOTE_SECTIONS = {
  PAYMENT_METHOD: /^Payment Method:/,
  CHARGE_CODE: /^Charge Code:/,
  EVENT_INFO: /^Event:/,
  CUSTOM_FIELD: /^Custom:/,
  // Add more section types as needed
};

/**
 * Builds a structured cart note with proper formatting and deduplication
 * @param {Object} options - Configuration options
 * @param {string} options.paymentMethod - The selected payment method
 * @param {string} options.chargeCode - The charge code (if applicable)
 * @param {string} options.existingNote - Existing cart note to preserve
 * @param {Object} options.customData - Additional custom data sections
 * @returns {string} - The formatted cart note content
 */
export function buildStructuredCartNote(options = {}) {
  const {
    paymentMethod = '',
    chargeCode = '',
    existingNote = '',
    customData = {}
  } = options;

  // Parse existing note to preserve non-payment sections
  const { nonPayment } = parseCartNoteSections(existingNote);
  
  // Build payment method sections
  const paymentSections = [];
  
  if (paymentMethod === 'charge_code' && chargeCode) {
    paymentSections.push('Payment Method: Charge Code');
    paymentSections.push(`Charge Code: ${chargeCode}`);
  } else if (paymentMethod === 'credit_card') {
    paymentSections.push('Payment Method: Credit Card');
  } else if (paymentMethod) {
    paymentSections.push(`Payment Method: ${paymentMethod}`);
  }
  
  // Add custom data sections
  const customSections = [];
  for (const [key, value] of Object.entries(customData)) {
    if (value && typeof value === 'string') {
      customSections.push(`${key}: ${value}`);
    }
  }
  
  // Combine all sections
  const allSections = [
    ...nonPayment,
    ...paymentSections,
    ...customSections
  ].filter(section => section.trim() !== '');
  
  const result = allSections.join('\n');
  
  // Debug logging
  console.log('[CartNoteUtils] Built structured note:', {
    originalLength: existingNote.length,
    newLength: result.length,
    sections: allSections.length,
    hasPaymentMethod: result.includes('Payment Method:'),
    hasChargeCode: result.includes('Charge Code:')
  });
  
  return result;
}

/**
 * Parses existing cart note to separate different section types
 * @param {string} existingNote - The existing cart note content
 * @returns {Object} - Object with categorized sections
 */
export function parseCartNoteSections(existingNote) {
  if (!existingNote || typeof existingNote !== 'string') {
    return { 
      payment: [], 
      nonPayment: [], 
      custom: [],
      all: []
    };
  }
  
  const lines = existingNote.split('\n')
    .map(line => line.trim())
    .filter(line => line !== '');
  
  const sections = {
    payment: [],
    nonPayment: [],
    custom: [],
    all: lines
  };
  
  for (const line of lines) {
    // Check if line matches known payment-related patterns
    if (CART_NOTE_SECTIONS.PAYMENT_METHOD.test(line) || 
        CART_NOTE_SECTIONS.CHARGE_CODE.test(line)) {
      sections.payment.push(line);
    }
    // Check for custom field patterns
    else if (CART_NOTE_SECTIONS.EVENT_INFO.test(line) || 
             CART_NOTE_SECTIONS.CUSTOM_FIELD.test(line)) {
      sections.custom.push(line);
    }
    // Everything else is preserved as non-payment content
    else {
      sections.nonPayment.push(line);
    }
  }
  
  return sections;
}

/**
 * Validates cart note structure and content
 * @param {string} noteContent - The cart note to validate
 * @returns {Object} - Validation results
 */
export function validateCartNote(noteContent) {
  const validation = {
    isValid: true,
    warnings: [],
    errors: [],
    structure: {}
  };
  
  if (!noteContent || typeof noteContent !== 'string') {
    validation.errors.push('Cart note is empty or invalid type');
    validation.isValid = false;
    return validation;
  }
  
  const sections = parseCartNoteSections(noteContent);
  validation.structure = {
    totalLines: sections.all.length,
    paymentLines: sections.payment.length,
    customLines: sections.custom.length,
    otherLines: sections.nonPayment.length
  };
  
  // Check for common issues
  if (noteContent.length > 1000) {
    validation.warnings.push('Cart note is very long (>1000 chars)');
  }
  
  if (sections.payment.length > 3) {
    validation.warnings.push('Multiple payment method entries detected');
  }
  
  const chargeCodeMatches = noteContent.match(/Charge Code:/g);
  if (chargeCodeMatches && chargeCodeMatches.length > 1) {
    validation.warnings.push('Duplicate charge code entries detected');
  }
  
  return validation;
}

/**
 * Sanitizes cart note content for security and consistency
 * @param {string} noteContent - The raw note content
 * @returns {string} - The sanitized content
 */
export function sanitizeCartNote(noteContent) {
  if (!noteContent || typeof noteContent !== 'string') {
    return '';
  }
  
  return noteContent
    .trim()
    .replace(/[\r\n]{3,}/g, '\n\n') // Limit consecutive line breaks
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 2000); // Enforce reasonable length limit
}

/**
 * Debug helper to log cart note structure
 * @param {string} noteContent - The cart note to analyze
 * @param {string} context - Context for the log (e.g., 'before_update', 'after_update')
 */
export function debugCartNote(noteContent, context = 'debug') {
  const sections = parseCartNoteSections(noteContent);
  const validation = validateCartNote(noteContent);
  
  console.group(`[CartNoteUtils] Debug - ${context}`);
  console.log('Content:', noteContent);
  console.log('Structure:', validation.structure);
  console.log('Sections:', sections);
  console.log('Validation:', validation.warnings.length > 0 ? validation.warnings : 'No issues');
  console.groupEnd();
}

/**
 * Creates a cart note for specific use cases
 */
export const CartNoteTemplates = {
  /**
   * Template for payment method with charge code
   */
  chargeCodePayment(chargeCode, existingNote = '') {
    return buildStructuredCartNote({
      paymentMethod: 'charge_code',
      chargeCode: chargeCode,
      existingNote: existingNote
    });
  },
  
  /**
   * Template for credit card payment
   */
  creditCardPayment(existingNote = '') {
    return buildStructuredCartNote({
      paymentMethod: 'credit_card',
      existingNote: existingNote
    });
  },
  
  /**
   * Template for event-based notes
   */
  eventNote(eventType, eventData, existingNote = '') {
    return buildStructuredCartNote({
      existingNote: existingNote,
      customData: {
        'Event': eventType,
        'Event Data': eventData
      }
    });
  }
};

// Export utilities for backward compatibility
export default {
  buildStructuredCartNote,
  parseCartNoteSections,
  validateCartNote,
  sanitizeCartNote,
  debugCartNote,
  CartNoteTemplates
};
