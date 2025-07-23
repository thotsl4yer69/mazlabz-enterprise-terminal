# MAZLABZ Enterprise Terminal

Professional terminal interface with real Stripe payment processing for Fortune 500 AI solutions.

## 🚀 Live Demo
- **Production URL**: https://mazlabz-terminal-894383524313.us-central1.run.app/
 - **Commands**: `help`, `pay`, `quote`, `roi`, `about`, `contact`, `upload`, `files`, `metadata`, `admin`

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
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51RjF1DQdNvblnpPjsuIGahBdZQWUiJs122VCNPDEPRfxO6COCQyVCCY72NzdpRbUUqPV4yguXoEpHEhIVfMcPkZE00zaNqtefA
VITE_STRIPE_BASIC_PRICE=price_abc123
VITE_STRIPE_STANDARD_PRICE=price_def456
VITE_STRIPE_ENTERPRISE_PRICE=price_ghi789
VITE_STRIPE_GOV_PRICE=price_xyz000
VITE_LEAD_ENDPOINT=https://your-api.example.com/leads
VITE_FILE_EMAIL_ENDPOINT=https://your-api.example.com/email/upload
SMTP_USER=mazlabz.ai@gmail.com
SMTP_PASS=<app-password>
SMTP_FROM=mazlabz.ai@gmail.com
```

## 📦 Enterprise Packages

1. **Basic Implementation** - $5,000 AUD
2. **Standard Platform** - $15,000 AUD
3. **Enterprise Transformation** - $30,000 AUD
4. **Government Program** - $100,000 AUD

## 📄 File Upload & Metadata

Use the `upload` command or the **Select Files for Analysis** button to submit PDFs or images for metadata extraction. The system extracts EXIF data from images and PDF metadata for research analysis. View your uploaded files with the `files` command and display extracted data with `metadata`.
Admin system metrics and file listings are available with the `admin` command.

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
