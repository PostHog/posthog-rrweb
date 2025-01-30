#!/usr/bin/env bash

if [[ -z "$BUMP_TYPE" ]]; then
  echo "Error: BUMP_TYPE is not set"
  exit 1
fi

npm add --global semver
SEMVER_BIN=$(which semver || echo "$(npm root --global)/.bin/semver")
echo "semver bin: $SEMVER_BIN"

# Define the package paths
# assumes this is run with cwd as the root of the repo
  PACKAGES=(
    "./packages/record"
    "./packages/plugins/rrweb-plugin-console-record"
    "./packages/types"
    "./packages/rrweb"
  )

  # Loop through each package and update the package.json
  for PACKAGE in "${PACKAGES[@]}"; do
    PACKAGE_JSON="$PACKAGE/package.json"

    echo "Updating version in $PACKAGE_JSON"
    OLD_VERSION=$(jq ".version" "$PACKAGE_JSON" -r)
    echo "Old Version: $OLD_VERSION"

    NEW_VERSION=$($SEMVER_BIN "$OLD_VERSION" -i ""$BUMP_TYPE"")
    echo "New Version: $NEW_VERSION"

    if [ -f "$PACKAGE_JSON" ]; then
      echo "Updating version in $PACKAGE_JSON"
      mv "$PACKAGE_JSON" "$PACKAGE_JSON.old" || { echo "Failed to rename $PACKAGE_JSON"; exit 1; }
      jq --indent 4 '.version = "'$NEW_VERSION'"' "$PACKAGE_JSON.old" > "$PACKAGE_JSON" || { echo "Failed to update version in $PACKAGE_JSON"; exit 1; }
      rm "$PACKAGE_JSON.old" || { echo "Failed to remove backup file $PACKAGE_JSON.old"; exit 1; }
    else
      echo "Error: $PACKAGE_JSON does not exist"
      exit 1
    fi
  done
