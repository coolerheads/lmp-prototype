# Fanball LMP prototype (fanball branch)

React + Vite rebuild of the Fanball league manager prototype, using the "Restrained" design system.

- `npm install`, `npm run dev`, `npm run build`
- Passcode gate: `empire2027`. Demo settings: the Demo button, bottom right.
- Routes (hash): `#/home`, `#/scores`, `#/franchise`; other tabs are placeholders until they are rebuilt.

## How the UI is produced

The designs live as Claude Design board files in `design/boards/`. `tools/gen.py` converts them into React
components in `src/boards/` (JSX + scoped CSS). Re-run `python3 tools/gen.py` after updating a board.
App wiring (routing, demo settings, gate) is hand-written in `src/`.

Design spec: `design/handoff/HANDOFF.md`.
