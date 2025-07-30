# Shopify Payment Method Selector

Enterprise-grade payment method selector component for Shopify themes with charge code support and HidePay integration.

## 🚀 Features

- **Dual Payment Methods**: Credit Card and Charge Code selection
- **Real-time Validation**: Client-side validation with user feedback
- **Cart Integration**: Seamless integration with Shopify cart forms
- **HidePay Compatible**: Direct integration with HidePay workflows
- **Accessibility First**: WCAG AA compliant with full ARIA support
- **Analytics Ready**: Built-in Google Analytics 4 and dataLayer support
- **Mobile Responsive**: Optimized for all device sizes
- **Enterprise Security**: Input sanitization and XSS protection

## 📋 Requirements

- Shopify theme with standard cart implementation
- Modern browser support (ES6+ modules)
- Shopify Dawn theme or compatible theme structure

## 🛠️ Installation

### 1. Copy Files to Your Theme

Copy the following files to your Shopify theme:

```
assets/
├── payment-method-selector.js
snippets/
├── cart-summary.liquid
├── cart-products.liquid
```

### 2. Theme Integration

The payment method selector automatically integrates with:
- Cart page (`sections/main-cart.liquid`)
- Cart drawer (`snippets/cart-drawer.liquid`)

No additional configuration required!

## 📖 Usage

### Basic Implementation

The component automatically appears above the checkout button when there are items in the cart:

```liquid
<!-- Payment method selector is automatically included in cart-summary.liquid -->
<payment-method-selector>
  <!-- Radio buttons for Credit Card / Charge Code -->
  <!-- Conditional charge code input field -->
  <!-- Error messaging and validation -->
</payment-method-selector>
```

### JavaScript API

```javascript
// Get the payment method selector instance
const selector = document.querySelector('payment-method-selector');

// Listen for payment method changes
selector.addEventListener('payment_method_selected', (event) => {
  console.log('Payment method:', event.detail.method);
});
```

## 🔧 Configuration

### Charge Code Validation

Modify the validation pattern in `cart-summary.liquid`:

```liquid
<input 
  pattern="[A-Za-z0-9\-_]{1,50}"
  maxlength="50"
  title="Custom validation message"
>
```

### Analytics Integration

The component automatically sends events to:
- **Google Analytics 4** (if `gtag` is available)
- **Google Tag Manager** (if `dataLayer` is available)
- **Console** (always, for debugging)

Event types:
- `payment_method_selected`
- `charge_code_sanitized`
- `checkout_attempted`
- `checkout_blocked`

## 🏗️ Architecture

### Component Structure

```
PaymentMethodSelector (Custom Element)
├── Payment Method Radio Buttons
├── Conditional Charge Code Input
├── Real-time Validation
├── Cart Note Synchronization
├── Cart Attributes Tracking
└── Error Handling & User Feedback
```

### Data Flow

1. **User Selection** → Payment method radio button
2. **Conditional Display** → Charge code input (if needed)
3. **Real-time Sync** → Cart note via AJAX
4. **Form Submission** → Both cart.note and cart.attributes
5. **Backend Processing** → Available for HidePay/custom logic

## 📊 Order Data Structure

### Cart Note Format
```
Charge Code: ABC123
```

### Cart Attributes
```json
{
  "payment_method": "charge_code" | "credit_card"
}
```

## 🎯 HidePay Integration

This component is designed for seamless HidePay integration:

1. **Charge codes** are stored in `cart.note`
2. **Payment method** is tracked in `cart.attributes.payment_method`
3. **Format** follows HidePay conventions
4. **Validation** ensures data quality

## 🧪 Testing

### Manual Testing Checklist

- [ ] Payment method selection (Credit Card/Charge Code)
- [ ] Charge code input appears/disappears correctly
- [ ] Real-time validation works
- [ ] Checkout blocked without selection
- [ ] Checkout blocked without charge code
- [ ] Cart note updated correctly
- [ ] Mobile responsive design
- [ ] Screen reader accessibility

### Analytics Testing

Check browser console for event logs:
```
[PaymentMethodSelector] payment_method_selected: {method: "charge_code"}
[PaymentMethodSelector] checkout_attempted: {method: "charge_code", code_length: 6}
```

## 🔒 Security

- **Input Sanitization**: Removes potentially dangerous characters
- **XSS Protection**: All inputs are properly escaped
- **Length Limits**: Maximum 50 characters for charge codes
- **Pattern Validation**: Only alphanumeric, hyphens, and underscores allowed

## 📱 Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Custom Elements**: Native support required

## 🐛 Troubleshooting

### Common Issues

**Payment method selector not appearing:**
- Check cart is not empty
- Verify `payment-method-selector.js` is loaded
- Check console for JavaScript errors

**Charge code not saving:**
- Verify `#charge-code-cart-note` field exists
- Check `Theme.routes.cart_update_url` is available
- Review network tab for AJAX errors

**Validation not working:**
- Ensure form has `id="cart-form"`
- Check checkout button has `form="cart-form"`
- Verify radio buttons have correct `name` attribute

### Debug Mode

Enable debug logging:
```javascript
// Add to browser console
localStorage.setItem('debug-payment-selector', 'true');
```

## 🤝 Contributing

This component was generated via GitHub Copilot and follows enterprise development standards:

- **Modular Architecture**: Self-contained custom element
- **TypeScript Compatible**: Proper type checking and error handling
- **Shopify Conventions**: Follows platform best practices
- **Accessibility First**: WCAG AA compliant
- **Performance Optimized**: Debounced updates and cleanup

## 📄 License

MIT License - feel free to use in commercial and personal projects.

## 🏷️ Version

**Current Version**: 1.1.0  
**Release Date**: July 29, 2025  
**Compatibility**: Shopify Dawn theme and compatible themes

## 📞 Support

For issues, questions, or feature requests:
1. Check the troubleshooting section above
2. Review browser console for error messages
3. Verify theme compatibility and requirements

---

**Built with ❤️ using GitHub Copilot**
