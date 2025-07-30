#!/bin/bash

# Shopify Payment Method Selector - Git Setup Script
# Run this script after creating your GitHub repository

echo "🚀 Setting up Git repository for Shopify Payment Method Selector..."

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "🎉 Initial commit: Enterprise payment method selector v1.1.0

Features:
- Credit Card / Charge Code payment selection
- Real-time validation and sanitization  
- Shopify cart integration with HidePay support
- WCAG AA accessibility compliance
- Google Analytics 4 and GTM integration
- Mobile responsive design
- Enterprise security standards

Files:
- assets/payment-method-selector.js (main component)
- snippets/cart-summary.liquid (UI implementation)  
- snippets/cart-products.liquid (form integration)
- Complete documentation and examples"

# Add your GitHub repository URL here
echo "📝 Next steps:"
echo "1. Create repository on GitHub: https://github.com/new"
echo "2. Copy the repository URL"
echo "3. Run: git remote add origin YOUR_REPO_URL"
echo "4. Run: git branch -M main"
echo "5. Run: git push -u origin main"

echo ""
echo "✅ Local repository ready!"
echo "🔗 After pushing to GitHub, your repository will include:"
echo "   - Professional README with installation guide"
echo "   - Complete API documentation"
echo "   - MIT license for commercial use"
echo "   - Proper .gitignore for Shopify development"
echo "   - Package.json with metadata"

echo ""
echo "🎯 Repository will be ready for:"
echo "   - NPM publishing (if desired)"
echo "   - Shopify theme marketplace"
echo "   - Client project integration"
echo "   - Open source contributions"
