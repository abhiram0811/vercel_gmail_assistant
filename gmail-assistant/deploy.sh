#!/bin/bash

# Gmail Assistant - Vercel Deployment Script
# This script deploys your Gmail Assistant to Vercel

echo "🚀 Gmail Assistant - Vercel Deployment"
echo "========================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in gmail-assistant directory"
    echo "Run: cd /Users/abhirammulinti/Projects/gmail_wrapper_prod/gmail-assistant"
    exit 1
fi

echo "📦 Step 1: Adding environment variables to Vercel..."
echo ""
echo "Adding GOOGLE_CLIENT_ID..."
vercel env add GOOGLE_CLIENT_ID production

echo "Adding GOOGLE_CLIENT_SECRET..."
vercel env add GOOGLE_CLIENT_SECRET production

echo "Adding OPENAI_API_KEY..."
vercel env add OPENAI_API_KEY production

echo "Adding PINECONE_API_KEY..."
vercel env add PINECONE_API_KEY production

echo ""
echo "🚀 Step 2: Deploying to Vercel..."
vercel --prod

echo ""
echo "📋 Next Steps:"
echo "1. Note your deployment URL (shown above)"
echo "2. Go to Google Cloud Console: https://console.cloud.google.com/"
echo "3. Navigate to: APIs & Services → Credentials"
echo "4. Click your OAuth 2.0 Client ID"
echo "5. Add redirect URI: https://YOUR-URL.vercel.app/api/auth/callback"
echo "6. Save in Google Console"
echo "7. Run: vercel env add GOOGLE_REDIRECT_URI production"
echo "   Enter: https://YOUR-URL.vercel.app/api/auth/callback"
echo "8. Run: vercel --prod (to redeploy with new URI)"
echo ""
echo "✅ Deployment script complete!"
