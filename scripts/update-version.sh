#!/bin/sh
echo "🔄 Updating local APP_VERSION based on commit message..."

# Retrieve the latest tag version (fallback to v1.0.0)
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "v1.0.0")
echo "Last tag: $LAST_TAG"

# Get the latest commit message
LAST_COMMIT_MSG=$(git log -1 --pretty=%B)
echo "Last commit message: $LAST_COMMIT_MSG"

# Extract MAJOR, MINOR, and PATCH from the last tag (assumes format vMAJOR.MINOR.PATCH)
MAJOR=$(echo $LAST_TAG | cut -d. -f1 | tr -d 'v')
MINOR=$(echo $LAST_TAG | cut -d. -f2)
PATCH=$(echo $LAST_TAG | cut -d. -f3)

# Determine new version based on commit message
if echo "$LAST_COMMIT_MSG" | grep -q "#major"; then
  MAJOR=$((MAJOR + 1))
  MINOR=0
  PATCH=0
  echo "Major update detected."
elif echo "$LAST_COMMIT_MSG" | grep -q "#minor"; then
  MINOR=$((MINOR + 1))
  PATCH=0
  echo "Minor update detected."
else
  PATCH=$((PATCH + 1))
  echo "Patch update detected."
fi

NEW_VERSION="v$MAJOR.$MINOR.$PATCH"
echo "New version: $NEW_VERSION"

# Attempt to create a new Git tag.
if git rev-parse "$NEW_VERSION" >/dev/null 2>&1; then
  echo "Warning: Tag $NEW_VERSION already exists."
else
  git tag $NEW_VERSION
  echo "Created new Git tag: $NEW_VERSION"
fi

# Update .env.local: Update the APP_VERSION and NEXT_PUBLIC_APP_VERSION keys while preserving others.
update_or_append() {
  KEY=$1
  VALUE=$2
  FILE=".env.local"
  if grep -q "^$KEY=" "$FILE"; then
    # For Linux: use sed -i; for macOS, use sed -i '' 
    sed -i.bak "s/^$KEY=.*/$KEY=$VALUE/" "$FILE"
  else
    echo "$KEY=$VALUE" >> "$FILE"
  fi
}

update_or_append "APP_VERSION" "$NEW_VERSION"
update_or_append "NEXT_PUBLIC_APP_VERSION" "$NEW_VERSION"

echo "✅ .env.local updated with APP_VERSION=$NEW_VERSION"
