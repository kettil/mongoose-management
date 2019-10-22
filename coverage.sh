#!/bin/bash

cd "$(dirname $0)"

LC_NUMERIC='en_US'

# -iname "storage.ts"

tsOutput="$(find $(pwd)/src -iname "*.ts" -not -iname "*.test.ts" -not -iname "*.d.ts" -print0 | while IFS= read -r -d '' file; do
  tsJson="\"${file}\""
  tsName="${file#$(pwd)/}"
  tsTest="${tsName%\.ts}.test.ts"

  npm run test:coverage ${tsTest} > /dev/null 2> /dev/null

  tsData=$(cat coverage/coverage-summary.json | jq ".${tsJson}.statements.pct, .${tsJson}.branches.pct, .${tsJson}.functions.pct, .${tsJson}.lines.pct" | sed -e 's/null/0/')

  printf "%s;|  %10.2f;|  %8.2f;|  %9.2f;|  %6.2f  |\n" "${tsName}" ${tsData}
done)"

echo "File;|  Statements;|  Branches;|  Functions;|   Lines  |
####;|  ##########;|  ########;|  #########;|  ######  |
$(echo "${tsOutput}" | sort)
" | column -s ';' -t
