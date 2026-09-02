#!/bin/bash
find src -name "*.tsx" -type f -exec sed -i \
  -e 's/text-white/text-gray-900/g' \
  -e 's/text-\[#E0E6ED\]/text-gray-800/g' \
  -e 's/text-\[#D1FAE5\]/text-green-800/g' \
  -e 's/border-white\/5/border-green-900\/10/g' \
  -e 's/border-white\/10/border-green-900\/20/g' \
  -e 's/bg-white\/5/bg-green-900\/5/g' \
  -e 's/bg-white\/10/bg-green-900\/10/g' \
  -e 's/bg-black\/20/bg-white\/80/g' \
  -e 's/bg-black\/30/bg-white\/90/g' \
  -e 's/bg-\[#112240\]/bg-green-50/g' \
  -e 's/bg-\[#0A192F\]/bg-white/g' \
  -e 's/text-\[#00FF9D\]/text-green-600/g' \
  -e 's/border-\[#00FF9D\]\/20/border-green-600\/20/g' \
  -e 's/bg-\[#00FF9D\]/bg-green-600/g' \
  -e 's/text-\[#0A192F\]/text-white/g' \
  -e 's/hover:bg-\[#4ADE80\]/hover:bg-green-700/g' \
  -e 's/shadow-\[0_0_15px_rgba(0,255,157,0.3)\]/shadow-lg shadow-green-600\/30/g' \
  {} +
