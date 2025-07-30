# Installation Guide

## Quick Start (5 minutes)

### Step 1: Download Files
Copy these files to your Shopify theme:

```
assets/payment-method-selector.js
snippets/cart-summary.liquid  
snippets/cart-products.liquid
```

### Step 2: Upload to Theme
1. Go to **Online Store > Themes** in Shopify Admin
2. Click **Actions > Edit code** on your active theme
3. Upload files to their respective directories

### Step 3: Test
1. Add products to cart
2. Go to cart page
3. See payment method selector above checkout button ✅

## Detailed Installation

### File Structure
```
your-theme/
├── assets/
│   └── payment-method-selector.js    # Main component logic
├── snippets/
│   ├── cart-summary.liquid           # Payment selector UI
│   └── cart-products.liquid          # Hidden form field
└── sections/
    └── main-cart.liquid              # Includes cart-summary
```

### Theme Requirements
- Shopify Dawn theme (recommended) or compatible theme
- Modern browser support for Custom Elements
- Standard Shopify cart implementation

### Verification Steps
1. **Cart Page**: Selector appears above checkout button
2. **Validation**: Try submitting without selection
3. **Charge Code**: Input appears when "Charge Code" selected
4. **Cart Note**: Check cart.note contains charge code
5. **Mobile**: Test responsive design

### Troubleshooting
**Component not appearing?**
- Check cart has items
- Verify JavaScript file uploaded correctly
- Check browser console for errors

**Validation not working?**
- Ensure form has `id="cart-form"`
- Check checkout button has `form="cart-form"`
- Verify radio buttons have correct names

## Advanced Configuration

### Custom Styling
Add custom CSS to `assets/base.css` or your theme's main CSS file:

```css
.payment-method-selector {
  /* Your custom styles */
}
```

### Analytics Setup
The component automatically sends events to:
- Google Analytics 4 (if gtag available)
- Google Tag Manager (if dataLayer available)

### HidePay Integration
No additional setup required! The component:
- Stores charge codes in `cart.note`
- Tracks payment method in `cart.attributes`
- Follows HidePay data format conventions
