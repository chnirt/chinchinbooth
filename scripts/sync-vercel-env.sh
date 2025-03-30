#!/bin/sh
echo "🔄 Updating APP_VERSION..."

# Retrieve the current version from Git (fallback to v1.0.0 if no tag exists)
APP_VERSION=$(git describe --tags --always 2>/dev/null || echo "v1.0.0")
echo "Current APP_VERSION: $APP_VERSION"

# Remove the old APP_VERSION variable from the production environment (if it exists)
echo "Removing old APP_VERSION from Vercel..."
vercel env rm APP_VERSION production || echo "No existing APP_VERSION variable found, proceeding..."

# Add the new APP_VERSION variable to the production environment.
# Use --confirm instead of --yes (or remove the flag if not supported)
echo "Adding new APP_VERSION to Vercel..."
echo "$APP_VERSION" | vercel env add APP_VERSION production

echo "✅ Vercel environment updated with APP_VERSION=$APP_VERSION"
