#!/bin/sh
echo "🔄 Syncing APP_VERSION to Vercel environment..."

# Read the version from .env.local (updated by the pre-commit hook)
APP_VERSION=$(grep '^APP_VERSION=' .env.local | cut -d '=' -f2)
echo "Current APP_VERSION from .env.local: $APP_VERSION"

# Remove the old APP_VERSION variable from Vercel production (if it exists)
echo "Removing old APP_VERSION from Vercel..."
vercel env rm APP_VERSION production || echo "No existing APP_VERSION variable found, proceeding..."

# Add the new APP_VERSION variable to Vercel production
echo "Adding new APP_VERSION to Vercel..."
echo "$APP_VERSION" | vercel env add APP_VERSION production

echo "✅ Vercel environment updated with APP_VERSION=$APP_VERSION"
