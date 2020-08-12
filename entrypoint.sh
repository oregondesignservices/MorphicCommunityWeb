#!/bin/sh

set -x
set -e

# To be provided by environment
BUNDLE_VERSION="${BUNDLE_VERSION}"

if [ "${BUNDLE_VERSION}" == "" ] ; then
  echo "BUNDLE_VERSION must be provided in the environment"
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