# MAZLABZ Enterprise Terminal

Professional terminal interface with real Stripe payment processing for Fortune 500 AI solutions.

## 🚀 Live Demo
- **Production URL**: https://mazlabz-terminal-894383524313.us-central1.run.app/
- **Commands**: `help`, `pay`, `quote`, `roi`, `about`, `contact`, `upload`, `files`, `metadata`

## 💳 Payment Integration

This application processes **REAL payments** through Stripe. The payment system includes:

- ✅ **Stripe Checkout** - Secure, hosted payment pages
- ✅ **Live Payment Processing** - Real money transactions  
- ✅ **4 Enterprise Packages** - $5K to $100K
- ✅ **Automatic Receipts** - Email confirmations
- ✅ **Mobile Optimized** - Works on all devices

## 🔐 Environment Variables

Required for deployment:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51RjF0vH64eFgP6Gi...
VITE_STRIPE_STRATEGIC_PRICE=price_1RjyW4H64eFgP6Gi...
VITE_STRIPE_ENTERPRISE_PRICE=price_1RjyWPH64eFgP6Gi...
VITE_STRIPE_TRANSFORMATION_PRICE=price_1RjyWjH64eFgP6Gi...
VITE_STRIPE_FORTUNE500_PRICE=price_1RjyX6H64eFgP6Gi...
VITE_LEAD_ENDPOINT=https://your-api.example.com/leads
```

## 📦 Enterprise Packages

1. **Strategic Implementation** - $5,000 AUD
2. **Enterprise Platform** - $15,000 AUD  
3. **Digital Transformation** - $30,000 AUD
4. **Fortune 500 Program** - $100,000 AUD

## 📄 File Upload & Metadata

Use the `upload` command or the **Select Files for Analysis** button to submit PDFs or images for metadata extraction. The system extracts EXIF data from images and PDF metadata for research analysis. View your uploaded files with the `files` command and display extracted data with `metadata`.

## 🛠️ Development

```bash
npm install
npm run dev
```

## 🚀 Deployment

Deploys automatically via GitHub Actions to Google Cloud Run.

**Environment variables are configured in Google Cloud Run console.**

## 📧 Contact

- **Email**: mazlabz.ai@gmail.com
- **Phone**: (+61) 493 719 523
- **Emergency**: 24/7 enterprise support

---

**⚠️ IMPORTANT**: This processes real payments. Test thoroughly before sharing with prospects.
