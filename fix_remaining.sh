#!/bin/bash
find src -name "*.tsx" -type f -exec sed -i \
  -e 's/text-gray-300/text-gray-700/g' \
  -e 's/text-gray-400/text-gray-600/g' \
  -e 's/hover:border-white\/20/hover:border-green-900\/20/g' \
  {} +
