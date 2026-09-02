#!/bin/bash
find src -name "*.tsx" -type f -exec sed -i \
  -e 's/bg-white text-bg-dark/bg-white text-gray-900/g' \
  -e 's/text-bg-dark/text-white/g' \
  {} +
