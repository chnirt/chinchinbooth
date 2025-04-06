#!/bin/sh

echo "🔄 Updating version based on commit message..."

# Fetch all tags from remote
git fetch --tags

# Get the latest tag from all available tags (sort in reverse version order)
LAST_TAG=$(git tag -l | sort -V | tail -n 1)

# If no tag exists, fallback to v1.0.0
if [ -z "$LAST_TAG" ]; then
  LAST_TAG="v1.0.0"
fi

# Get the current commit message from .git/COMMIT_EDITMSG
CURRENT_COMMIT_MSG=$(cat .git/COMMIT_EDITMSG | tr -d '\n' | xargs)
echo "Current commit message: '$CURRENT_COMMIT_MSG'"

# Extract MAJOR, MINOR, and PATCH from the last tag (assumes format vMAJOR.MINOR.PATCH)
MAJOR=$(echo "$LAST_TAG" | cut -d. -f1 | tr -d 'v')
MINOR=$(echo "$LAST_TAG" | cut -d. -f2)
PATCH=$(echo "$LAST_TAG" | cut -d. -f3)

# Determine the new version based on commit message
if echo " $CURRENT_COMMIT_MSG " | grep -Eiq " #[mM]ajor "; then
  MAJOR=$((MAJOR + 1))
  MINOR=0
  PATCH=0
  echo "🛠 Major update detected."
elif echo " $CURRENT_COMMIT_MSG " | grep -Eiq " #[mM]inor "; then
  MINOR=$((MINOR + 1))
  PATCH=0
  echo "🛠 Minor update detected."
else
  PATCH=$((PATCH + 1))
  echo "🛠 Patch update detected."
fi

NEW_VERSION="v$MAJOR.$MINOR.$PATCH"

# Ensure the new tag does not already exist before creating it
if git tag --list "$NEW_VERSION" | grep -q "$NEW_VERSION"; then
  echo "⚠️ Tag $NEW_VERSION already exists. Skipping tag creation."
else
  # Create and push the new Git tag if it doesn't exist
  echo "🚀 Creating new tag: $NEW_VERSION"
  git tag "$NEW_VERSION"
  git push origin "$NEW_VERSION"
  echo "✅ Created and pushed tag: $NEW_VERSION"
fi

# Sync version with Vercel

echo "🔄 Syncing NEXT_PUBLIC_APP_VERSION to Vercel environment..."

# Update .env.local with the new version
update_or_append() {
  KEY=$1
  VALUE=$2
  FILE=".env.local"

  if [ -f "$FILE" ] && grep -q "^$KEY=" "$FILE"; then
    sed -i.bak "s/^$KEY=.*/$KEY=$VALUE/" "$FILE"
  else
    [ -s "$FILE" ] && [ "$(tail -c1 "$FILE")" != "" ] && echo "" >> "$FILE"
    echo "$KEY=$VALUE" >> "$FILE"
  fi
}

# Update .env.local directly
update_or_append "NEXT_PUBLIC_APP_VERSION" "$NEW_VERSION"

# Remove the old NEXT_PUBLIC_APP_VERSION variable from Vercel production (if it exists)
echo "Removing old NEXT_PUBLIC_APP_VERSION from Vercel..."
vercel env rm NEXT_PUBLIC_APP_VERSION production -y || echo "No existing NEXT_PUBLIC_APP_VERSION variable found, proceeding..."

# Add the new NEXT_PUBLIC_APP_VERSION variable to Vercel production
echo "Adding new NEXT_PUBLIC_APP_VERSION to Vercel..."
echo "$NEW_VERSION" | vercel env add NEXT_PUBLIC_APP_VERSION production

echo "✅ Vercel environment updated with NEXT_PUBLIC_APP_VERSION=$NEW_VERSION"
