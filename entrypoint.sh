#!/bin/sh

set -x
set -e

# To be provided by environment
BUNDLE_VERSION="$(cat bundle-version.txt)"

if [ "${BUNDLE_VERSION}" == "" ] ; then
  echo "bundle-version.txt was empty or did not exist"
  exit 1
fi

# Build the final JS files
npx jskit make --bundle-version "${BUNDLE_VERSION}" MorphicCommunityWeb --no-tag --no-docker

BUILDS_DIR="$(pwd)/builds/org.raisingthefloor.MorphicCommunityWeb/latest/MorphicCommunityWeb"
LOG_DIR="${BUILDS_DIR}/logs"

# Make symlinks so logs go stdout/stderr
ln -sf /dev/stdout "${LOG_DIR}/access.log"
ln -sf /dev/stderr "${LOG_DIR}/error.log"

# "exec" passes on PID1 to nginx so it can receive signals from kubernetese
exec nginx -p "${BUILDS_DIR}" -c "conf/nginx.conf" -g 'daemon off;'