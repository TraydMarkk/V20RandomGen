V20RandomGen (static web app)
----------------------------
Generates random Vampire: the Masquerade 20th Anniversary characters in the browser using the JSON rule/data files in `data/`. Logic lives in `app.js`; `generator.py` mirrors the same rules for CLI/debug output.

Requirements
- Python 3 (for the simple local web server)
- A modern web browser

Linux Method (primary)
1) Open `run_v20_server.sh` and set `TARGET_DIR` to the folder where you keep this project (V20RandomGen).
2) Make the script executable once: `chmod +x run_v20_server.sh`.
3) Run it: `./run_v20_server.sh`. It opens a terminal and starts `python -m http.server 8000`.
4) In your browser, go to `http://localhost:8000`.

Backup launch (manual terminal)
1) In a terminal, `cd` into the folder where you store this project.
2) Start the server: `python -m http.server 8000`.
3) Browse to `http://localhost:8000`.

Using the app
- Pick a clan (or leave the default), click Generate, then Download TXT to save the stat block.
- Data files under `data/` control attributes, abilities, disciplines, virtues, and pools; adjust them if you need to tweak rules or add clans.

— TraydMarkk (Dec 5, 2025 04:03 CST)

