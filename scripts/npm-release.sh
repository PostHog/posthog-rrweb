#!/usr/bin/env bash

# we don't use all of the packages so we don't publish them all

# Define the package paths
# assumes this is run with cwd as the root of the repo
  PACKAGES=(
    "./packages/record"
    "./packages/plugins/rrweb-plugin-console-record"
    "./packages/types"
    "./packages/rrweb"
    "./packages/utils"
    "./packages/rr-dom"
  )

yarn run build:all

# first as a dry run to check they should all publish
for PACKAGE in "${PACKAGES[@]}"; do
  echo "Publishing $PACKAGE"
  npm publish  --dry-run --workspace "$PACKAGE" --access public || { echo "Failed to dry-run publish $PACKAGE"; exit 1; }
done

# then for real
for PACKAGE in "${PACKAGES[@]}"; do
  echo "Publishing $PACKAGE"
  npm publish --workspace "$PACKAGE" --access public || { echo "Failed to publish $PACKAGE"; exit 1; }
done
