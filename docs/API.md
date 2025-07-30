# API Documentation

## PaymentMethodSelector Custom Element

### Overview
The `PaymentMethodSelector` is a custom HTML element that provides payment method selection with charge code support.

### HTML Structure
```html
<payment-method-selector>
  <!-- Radio buttons for payment methods -->
  <!-- Conditional charge code input -->
  <!-- Error messaging -->
</payment-method-selector>
```

### JavaScript API

#### Methods

##### `connectedCallback()`
- **Description**: Initializes the component when added to DOM
- **Parameters**: None
- **Returns**: void
- **Usage**: Automatically called by browser

##### `handlePaymentMethodChange(event)`
- **Description**: Handles payment method radio button changes
- **Parameters**: 
  - `event` (Event): The change event from radio button
- **Returns**: void
- **Usage**: Internal event handler

##### `sanitizeChargeCode(code)`
- **Description**: Sanitizes charge code input for security
- **Parameters**:
  - `code` (string): Raw charge code input
- **Returns**: string (sanitized code)
- **Usage**: 
```javascript
const clean = selector.sanitizeChargeCode("ABC-123!@#");
// Returns: "ABC-123"
```

##### `updateCartNote(chargeCode)`
- **Description**: Updates Shopify cart note via AJAX
- **Parameters**:
  - `chargeCode` (string): The sanitized charge code
- **Returns**: Promise\<void\>
- **Usage**: Internal method for cart synchronization

##### `showError(message)`
- **Description**: Displays error message to user
- **Parameters**:
  - `message` (string): Error message to display
- **Returns**: void

##### `hideError()`
- **Description**: Hides current error message
- **Parameters**: None
- **Returns**: void

#### Events

##### `payment_method_selected`
```javascript
// Event payload
{
  detail: {
    method: "credit_card" | "charge_code",
    chargeCode?: string,
    timestamp: number
  }
}

// Usage
selector.addEventListener('payment_method_selected', (event) => {
  console.log('Selected:', event.detail.method);
});
```

##### `charge_code_sanitized`
```javascript
// Event payload
{
  detail: {
    original: string,
    sanitized: string,
    removedChars: string[]
  }
}
```

##### `checkout_attempted`
```javascript
// Event payload
{
  detail: {
    method: string,
    success: boolean,
    reason?: string
  }
}
```

### CSS Classes

#### Component Structure
```css
.payment-method-selector {
  /* Main container */
}

.payment-method-selector__title {
  /* Section heading */
}

.payment-method-selector__options {
  /* Radio button container */
}

.payment-method-selector__option {
  /* Individual radio button wrapper */
}

.payment-method-selector__charge-code {
  /* Charge code input section */
}

.payment-method-selector__error {
  /* Error message container */
}
```

#### State Classes
```css
.payment-method-selector__charge-code--hidden {
  /* Hidden charge code input */
}

.payment-method-selector__error--visible {
  /* Visible error state */
}
```

### Form Integration

#### Hidden Fields
The component creates and manages hidden form fields:

```html
<!-- Payment method tracking -->
<input type="hidden" name="attributes[payment_method]" value="charge_code">

<!-- Cart note backup -->
<input type="hidden" name="note" id="charge-code-cart-note" value="Charge Code: ABC123">
```

#### Form Validation
The component integrates with form submission:

```javascript
// Form submit handler
document.getElementById('cart-form').addEventListener('submit', (event) => {
  // Component automatically validates before submission
});
```

### Configuration Options

#### Validation Patterns
Modify charge code validation in `cart-summary.liquid`:

```html
<input 
  pattern="[A-Za-z0-9\-_]{1,50}"
  maxlength="50"
  title="Enter a valid charge code (letters, numbers, hyphens, underscores only)"
>
```

#### Error Messages
Customize error messages:

```javascript
// In payment-method-selector.js
const ERROR_MESSAGES = {
  NO_PAYMENT_METHOD: 'Please select a payment method',
  NO_CHARGE_CODE: 'Please enter a charge code',
  INVALID_CHARGE_CODE: 'Invalid charge code format',
  NETWORK_ERROR: 'Unable to update cart. Please try again.'
};
```

### Analytics Integration

#### Google Analytics 4
```javascript
// Automatic event tracking
gtag('event', 'payment_method_selected', {
  'method': 'charge_code',
  'custom_parameter_1': 'value'
});
```

#### Google Tag Manager
```javascript
// DataLayer push
window.dataLayer.push({
  'event': 'payment_method_selected',
  'payment_method': 'charge_code',
  'charge_code_length': 6
});
```

### Error Handling

#### Network Errors
```javascript
try {
  await this.updateCartNote(chargeCode);
} catch (error) {
  this.showError('Unable to save charge code. Please try again.');
  console.error('[PaymentMethodSelector] Network error:', error);
}
```

#### Validation Errors
```javascript
if (!this.isValidChargeCode(code)) {
  this.showError('Please enter a valid charge code');
  return false;
}
```

### Browser Compatibility

#### Minimum Requirements
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

#### Feature Detection
```javascript
if ('customElements' in window) {
  // Component supported
} else {
  // Fallback handling
}
```

### Performance Considerations

#### Debounced Updates
Cart updates are debounced to prevent excessive API calls:

```javascript
// 300ms debounce on input changes
const debouncedUpdate = debounce(this.updateCartNote.bind(this), 300);
```

#### Memory Management
Component properly cleans up event listeners:

```javascript
disconnectedCallback() {
  // Cleanup handled automatically
}
```
