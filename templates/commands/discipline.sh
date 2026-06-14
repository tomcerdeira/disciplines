#!/usr/bin/env sh
set -eu

if [ "$#" -eq 0 ]; then
  echo "Usage: discipline.sh \"task text\" [--file path] [--command cmd]" >&2
  exit 1
fi

task="$1"
shift

npx disciplines use installed --task "$task" "$@"
