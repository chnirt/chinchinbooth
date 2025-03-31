#!/bin/sh
echo "🔄 Syncing NEXT_PUBLIC_APP_VERSION to Vercel environment..."

# Read the version from .env.local (updated by the pre-commit hook)
NEXT_PUBLIC_APP_VERSION=$(grep '^NEXT_PUBLIC_APP_VERSION=' .env.local | cut -d '=' -f2)
echo "Current NEXT_PUBLIC_APP_VERSION from .env.local: $NEXT_PUBLIC_APP_VERSION"

# Remove the old NEXT_PUBLIC_APP_VERSION variable from Vercel production (if it exists)
echo "Removing old NEXT_PUBLIC_APP_VERSION from Vercel..."
vercel env rm NEXT_PUBLIC_APP_VERSION production -y || echo "No existing NEXT_PUBLIC_APP_VERSION variable found, proceeding..."

# Add the new NEXT_PUBLIC_APP_VERSION variable to Vercel production
echo "Adding new NEXT_PUBLIC_APP_VERSION to Vercel..."
echo "$NEXT_PUBLIC_APP_VERSION" | vercel env add NEXT_PUBLIC_APP_VERSION production

echo "✅ Vercel environment updated with NEXT_PUBLIC_APP_VERSION=$NEXT_PUBLIC_APP_VERSION"
