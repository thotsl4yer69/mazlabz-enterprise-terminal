#!/bin/bash

# MAZLABZ Stripe Integration Deployment Script
# This script sets up environment variables in Google Cloud Run

echo "🚀 MAZLABZ Stripe Integration Deployment"
echo "========================================"

# Set Google Cloud Project (replace with your project ID)
PROJECT_ID="your-gcp-project-id"
SERVICE_NAME="mazlabz-terminal"
REGION="us-central1"

echo "Setting up Stripe environment variables in Google Cloud Run..."

# Set environment variables for the Cloud Run service
gcloud run services update $SERVICE_NAME \
  --region=$REGION \
  --set-env-vars="VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51RjF0vH64eFgP6GiO3i7WZfpbqg1RQSLVoLgp0BX9fBswuiIBtRvRmlE5U9pszkrclciG8nRmNNt5cVqSpzWvRax00JiDDArjW" \
  --set-env-vars="VITE_STRIPE_STRATEGIC_PRICE=price_1RjyW4H64eFgP6GinxGYuo7A" \
  --set-env-vars="VITE_STRIPE_ENTERPRISE_PRICE=price_1RjyWPH64eFgP6GiYfaIvlHW" \
  --set-env-vars="VITE_STRIPE_TRANSFORMATION_PRICE=price_1RjyWjH64eFgP6Gi7HKO69xx" \
  --set-env-vars="VITE_STRIPE_FORTUNE500_PRICE=price_1RjyX6H64eFgP6GiaSHMnEx6"

echo "✅ Environment variables set successfully!"
echo "🚀 Your MAZLABZ terminal now processes REAL payments!"
echo ""
echo "Next steps:"
echo "1. Test payment flow with the 'pay' command"
echo "2. Monitor payments in Stripe Dashboard"
echo "3. Share with Fortune 500 prospects!"
echo ""
echo "💳 Stripe Dashboard: https://dashboard.stripe.com/payments"
echo "📧 Support: mazlabz.ai@gmail.com"