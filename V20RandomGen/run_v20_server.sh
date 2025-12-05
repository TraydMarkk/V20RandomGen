#!/usr/bin/env bash
# Launch a terminal, start the V20 web server, and keep the window open.
#
# Set TARGET_DIR to the folder containing this project (V20RandomGen).
# Command: python -m http.server 8000
#
# Prefers Konsole, then gnome-terminal, then xterm.

TARGET_DIR="/path/to/V20RandomGen"
RUN_CMD="cd \"$TARGET_DIR\" && python -m http.server 8000; echo; echo \"Server stopped. Press Enter to close.\"; read -r"

if command -v konsole >/dev/null 2>&1; then
  konsole --workdir "$TARGET_DIR" -e bash -lc "$RUN_CMD"
elif command -v gnome-terminal >/dev/null 2>&1; then
  gnome-terminal -- bash -lc "$RUN_CMD"
else
  xterm -hold -e "cd \"$TARGET_DIR\" && python -m http.server 8000"
fi

