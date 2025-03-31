#!/bin/sh

echo "🔄 Updating local APP_VERSION based on commit message..."

# Retrieve the latest tag version (fallback to v1.0.0)
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "v1.0.0")

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

# Ensure the new tag does not already exist
while git tag --list "$NEW_VERSION" | grep -q "$NEW_VERSION"; do
  echo "⚠️ Tag $NEW_VERSION already exists, incrementing patch version..."
  PATCH=$((PATCH + 1))
  NEW_VERSION="v$MAJOR.$MINOR.$PATCH"
done

echo "🚀 New version: $NEW_VERSION"

# Create and push the new Git tag
git tag "$NEW_VERSION"
git push origin "$NEW_VERSION"
echo "✅ Created and pushed tag: $NEW_VERSION"

# Function: Update or append a key in .env.local without modifying other lines
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

# Update .env.local
update_or_append "NEXT_PUBLIC_APP_VERSION" "$NEW_VERSION"

echo "✅ .env.local updated with NEXT_PUBLIC_APP_VERSION=$NEW_VERSION"