# Shopify Payment Method Selector - Git Setup Script (PowerShell)
# Run this script after creating your GitHub repository

Write-Host "🚀 Setting up Git repository for Shopify Payment Method Selector..." -ForegroundColor Cyan

# Initialize git (if not already done)
if (-not (Test-Path ".git")) {
    git init
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
} else {
    Write-Host "ℹ️ Git repository already exists" -ForegroundColor Yellow
}

# Add all files
git add .
Write-Host "✅ Files staged for commit" -ForegroundColor Green

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

Write-Host "✅ Initial commit created" -ForegroundColor Green

# Instructions for GitHub setup
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Create repository on GitHub: https://github.com/new" -ForegroundColor White
Write-Host "2. Copy the repository URL" -ForegroundColor White
Write-Host "3. Run: git remote add origin YOUR_REPO_URL" -ForegroundColor Yellow
Write-Host "4. Run: git branch -M main" -ForegroundColor Yellow
Write-Host "5. Run: git push -u origin main" -ForegroundColor Yellow

Write-Host ""
Write-Host "✅ Local repository ready!" -ForegroundColor Green
Write-Host "🔗 After pushing to GitHub, your repository will include:" -ForegroundColor Cyan
Write-Host "   - Professional README with installation guide" -ForegroundColor White
Write-Host "   - Complete API documentation" -ForegroundColor White
Write-Host "   - MIT license for commercial use" -ForegroundColor White
Write-Host "   - Proper .gitignore for Shopify development" -ForegroundColor White
Write-Host "   - Package.json with metadata" -ForegroundColor White

Write-Host ""
Write-Host "🎯 Repository will be ready for:" -ForegroundColor Cyan
Write-Host "   - NPM publishing (if desired)" -ForegroundColor White
Write-Host "   - Shopify theme marketplace" -ForegroundColor White
Write-Host "   - Client project integration" -ForegroundColor White
Write-Host "   - Open source contributions" -ForegroundColor White

Write-Host ""
Write-Host "🚀 Happy coding!" -ForegroundColor Magenta
