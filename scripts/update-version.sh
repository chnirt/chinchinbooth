#!/bin/bash

# Get the current commit message
COMMIT_MSG=$(git log -1 --pretty=%B)

# Get the last tag
LAST_TAG=$(git describe --tags --abbrev=0)
VERSION=$(echo $LAST_TAG | sed 's/^v//')  # Remove the leading 'v'
IFS='.' read -r MAJOR MINOR PATCH <<< "$VERSION"

# Determine the new version based on commit message
if echo "$COMMIT_MSG" | grep -Eiq " #[mM]ajor "; then
  MAJOR=$((MAJOR + 1))
  MINOR=0
  PATCH=0
  echo "🛠 Major update detected."
elif echo "$COMMIT_MSG" | grep -Eiq " #[mM]inor "; then
  MINOR=$((MINOR + 1))
  PATCH=0
  echo "🛠 Minor update detected."
else
  PATCH=$((PATCH + 1))
  echo "🛠 Patch update detected."
fi

# Create the new version tag
NEW_VERSION="v${MAJOR}.${MINOR}.${PATCH}"

# Create the Git tag if it doesn't exist yet
git tag $NEW_VERSION || echo "Tag $NEW_VERSION already exists."

# Push the new tag to GitHub
git push origin $NEW_VERSION
echo "✅ Pushed new tag: $NEW_VERSION"

# Update NEXT_PUBLIC_APP_VERSION in .env.local
echo "NEXT_PUBLIC_APP_VERSION=$NEW_VERSION" > .env.local
echo "✅ NEXT_PUBLIC_APP_VERSION updated in .env.local"

# Update Vercel environment variable with the new version
echo "$NEW_VERSION" | vercel env add NEXT_PUBLIC_APP_VERSION production
echo "✅ Vercel environment updated with NEXT_PUBLIC_APP_VERSION=$NEW_VERSION"
