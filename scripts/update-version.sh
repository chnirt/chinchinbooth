#!/bin/sh
echo "🔄 Updating local APP_VERSION based on commit message..."

# Retrieve the latest tag version (fallback to v1.0.0)
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "v1.0.0")
echo "Last tag: $LAST_TAG"

# Get the latest commit message
LAST_COMMIT_MSG=$(git log -1 --pretty=%B)
echo "Last commit message: $LAST_COMMIT_MSG"

# Extract MAJOR, MINOR, and PATCH from the last tag (assumes format vMAJOR.MINOR.PATCH)
MAJOR=$(echo "$LAST_TAG" | cut -d. -f1 | tr -d 'v')
MINOR=$(echo "$LAST_TAG" | cut -d. -f2)
PATCH=$(echo "$LAST_TAG" | cut -d. -f3)

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

# Loop until the new tag does not exist
while git rev-parse "$NEW_VERSION" >/dev/null 2>&1; do
  echo "Tag $NEW_VERSION already exists, bumping patch..."
  PATCH=$((PATCH + 1))
  NEW_VERSION="v$MAJOR.$MINOR.$PATCH"
done

echo "New version: $NEW_VERSION"

# Create the new Git tag
git tag "$NEW_VERSION"
echo "Created new Git tag: $NEW_VERSION"

# Function: update_or_append a key in .env.local without affecting other lines
update_or_append() {
  KEY=$1
  VALUE=$2
  FILE=".env.local"

  # If the file exists, update the key if it exists
  if [ -f "$FILE" ] && grep -q "^$KEY=" "$FILE"; then
    # Replace the entire line using sed (creates a backup on macOS)
    sed -i.bak "s/^$KEY=.*/$KEY=$VALUE/" "$FILE"
  else
    # Check if the file exists and is non-empty
    if [ -s "$FILE" ]; then
      # Ensure the last line is not an empty line before appending
      if [ "$(tail -c1 "$FILE")" != "" ]; then
        echo "" >> "$FILE"
      fi
    fi
    # Append the key=value pair on a new line
    echo "$KEY=$VALUE" >> "$FILE"
  fi
}

# Update or append the keys in .env.local
update_or_append "APP_VERSION" "$NEW_VERSION"
update_or_append "NEXT_PUBLIC_APP_VERSION" "$NEW_VERSION"

echo "✅ .env.local updated with APP_VERSION=$NEW_VERSION"
