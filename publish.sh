#!/bin/bash
# Usage: bash publish.sh --build-only --emit

set -e # -x
dir=$(pwd)
bash_args="$@"
prefix="@block-kit/"
packages=(delta utils core react plugin)
# npm version patch --no-git-tag-version
version=$(echo "console.log(require(\"./package.json\").version)" | node)
export BUILD_VERSION=$version

function check_argument {
  local value=$1
  for arg in $bash_args; do
    if [ "$arg" == "$value" ]; then
      return 0 # success
    fi
  done
  return 1 # failure
}

function echo_notice {
  local value=$1
  echo -e "\033[32m$value\033[0m"
}

echo_notice "Version: $version"

if ! check_argument "--emit" || check_argument "--build-only"; then
  echo_notice "Notice: Current Version Will Not Publish To NPM"
fi

for item in "${packages[@]}"; do
  cd $dir
  path="./packages/$item"
  cd $path
  rm -rf dist
  npm run lint:ts
  npm run test
  npm run build
done

if check_argument "--build-only"; then
  exit 0
fi

for item in "${packages[@]}"; do
  cd $dir
  path="./packages/$item"
  cd $path
  echo "const fs = require('fs');
      const json = require('./package.json');
      json.version = '$version';
      const dep = json.dependencies || {};
      for(const [key, value] of Object.entries(dep)) {
        if(key.startsWith('$prefix')) dep[key] = '$version';
      }
      fs.writeFileSync('./package.json', JSON.stringify(json, null, 2));
    " | node
  set +e
  if check_argument "--emit"; then
    npm publish --registry=https://registry.npmjs.org/ --access public
  else
    npm publish --registry=https://registry.npmjs.org/ --dry-run
  fi
  set -e
  echo "const fs = require('fs');
      const json = require('./package.json');
      json.version = '1.0.0';
      const dep = json.dependencies || {};
      for(const [key, value] of Object.entries(dep)) {
        if(key.startsWith('$prefix')) dep[key] = 'workspace: *';
      }
      fs.writeFileSync('./package.json', JSON.stringify(json, null, 2));
    " | node
done
