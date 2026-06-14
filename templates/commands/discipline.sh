#!/usr/bin/env sh
set -eu

if [ -z "${AGENT_DISCIPLINES_HOME:-}" ]; then
  echo "AGENT_DISCIPLINES_HOME is not set. Point it at your agent-disciplines repo." >&2
  exit 1
fi

if [ "$#" -eq 0 ]; then
  echo "Usage: discipline.sh \"task text\" [--file path] [--command cmd]" >&2
  exit 1
fi

task="$1"
shift

npm --prefix "$AGENT_DISCIPLINES_HOME" run resolve -- --task "$task" "$@"
