#!/bin/sh
echo "🔄 Updating local APP_VERSION based on commit message..."

# Retrieve the latest tag version (fallback to v1.0.0)
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "v1.0.0")
echo "Last tag: $LAST_TAG"

# Get the latest commit message
LAST_COMMIT_MSG=$(git log -1 --pretty=%B)
echo "Last commit message: $LAST_COMMIT_MSG"

# Extract MAJOR, MINOR, and PATCH values from the last tag (assumes format vMAJOR.MINOR.PATCH)
MAJOR=$(echo $LAST_TAG | cut -d. -f1 | tr -d 'v')
MINOR=$(echo $LAST_TAG | cut -d. -f2)
PATCH=$(echo $LAST_TAG | cut -d. -f3)

# Determine the new version based on commit message
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

# Optionally, create a new Git tag (if desired)
git tag $NEW_VERSION
echo "Created new Git tag: $NEW_VERSION"

# Update .env.local with the new version (for both server and client)
cat > .env.local <<EOF
APP_VERSION=$NEW_VERSION
NEXT_PUBLIC_APP_VERSION=$NEW_VERSION
EOF

echo "✅ .env.local updated with APP_VERSION=$NEW_VERSION"
