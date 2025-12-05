# V20RandomGen

Static web app for generating random Vampire: the Masquerade 20th Anniversary (V20) characters in the browser. Character logic lives in `app.js`; `generator.py` mirrors the same rules for CLI/debug output. All rule and content data is stored as JSON under `data/`.

## Requirements
- Python 3 (only used for a simple local web server)
- A modern web browser

## Quick Start (Linux, recommended)
1) Open `run_v20_server.sh` and set `TARGET_DIR` to the folder where this project lives.  
2) Make the script executable once: `chmod +x run_v20_server.sh`.  
3) Launch the app: `./run_v20_server.sh` (this runs `python -m http.server 8000`).  
4) In your browser, visit `http://localhost:8000`.

## Manual Launch
1) In a terminal, `cd` into the project folder.  
2) Start the server: `python -m http.server 8000`.  
3) Browse to `http://localhost:8000`.

## Using the App
- Pick a clan (or leave the default), click **Generate**, then use **Download TXT** to save the stat block.
- Data files under `data/` control attributes, abilities, disciplines, virtues, and pools; edit them to tweak rules or add clans.

## Project Structure
- `index.html` / `style.css` — static UI for the generator
- `app.js` — browser-side character generation logic
- `generator.py` — CLI/debug variant of the same rules
- `data/` — JSON rule/content files (attributes, abilities, clans, virtues, rules)
- `run_v20_server.sh` — helper script to start a local dev server

— TraydMarkk (Dec 5, 2025 04:03 CST)

