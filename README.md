<p align="left"><strong>English</strong> | <a href="./README.ko.md">한국어</a></p>

# PokéAgent-Safari

## v0.2.0 - Collection & Sticker Release

![PokéAgent-Safari v0.2.0 dashboard](imgs/v0.2.0-dashboard.png)

`poke-agent-safari` is a local activity dashboard for Claude Code and Codex. It watches transcript activity, turns each live agent into a Pokemon, and shows context, token usage, status, project, and session history as a small RPG-style safari.

v0.2.0 turns the dashboard into a collection loop. You can recruit Pokemon into `My Pokemon`, train them with real project token usage, collect evolution items, evolve them with generated Gen 1-5 rules, and keep an always-on-top Electron sticker open while you work.

## Release Highlights

- **Claude + Codex together:** `--source all` is now the default, with `--source claude` and `--source codex` still available.
- **Installable CLI:** `npm install` registers the `poke-as` command for your user account, and `poke-as` opens the Electron sticker by default.
- **My Pokemon:** recruit encountered or discovered Pokemon, manage a 6-slot party, box owned Pokemon, rename them, release them, and assign them to projects.
- **Training:** owned Pokemon gain EXP from actual token usage. Pokemon assigned to a matching project receive higher training weight.
- **Evolution items:** token usage earns item points, random draws produce evolution items, target tickets can claim a chosen item, and item evolutions consume the required item.
- **Gen 1-5 Pokedex:** generated Pokemon metadata now covers `#1-#649`, including habitat, rarity, evolution paths, Korean names, and evolution rules.
- **Area-aware island:** habitat-weighted spawns, area filters, detailed map assets, and an outside-area rail make the island more readable.
- **Electron sticker:** compact desktop monitor for budgets, party Pokemon, active agents, and status counts.
- **Promo Studio:** mock mode can compose custom scenes and export PNGs for screenshots or release images.
- **VS Code extension refresh:** watch Claude, Codex, all providers, or mock mode from the same shared UI.
- **Unified persistence:** live state is stored under `data/runtime/all` with Claude/Codex compatibility mirrors.

## Product Tour

### Live Dashboard

The main dashboard shows active agents on a habitat-aware island, live provider budgets, Pokedex progress, My Pokemon, and the Safari Log.

![Dashboard overview](imgs/v0.2.0-dashboard.png)

### My Pokemon And Evolution Items

Owned Pokemon have party slots, levels, EXP bars, project assignments, evolution state, and box controls. The inventory panel tracks item points, random draws, target tickets, item sprites, selling, and target claims.

![My Pokemon and evolution items](imgs/v0.2.0-my-pokemon.png)

### Pokedex

Every discovered Pokemon is registered with first-discovery metadata. The current Pokedex range is `#1-#649`.

![Safari Pokedex](imgs/v0.2.0-pokedex.png)

### Promo Studio

Mock mode unlocks Promo Studio: build a custom scene, pick Pokemon, tune level/EXP/HP/status, add subagents, box/unbox custom roots, and download the scene as a PNG.

![Promo Studio](imgs/v0.2.0-promo-studio.png)

### Electron Sticker

The sticker is a compact always-on-top view for day-to-day monitoring. It uses the same runtime and snapshot payload as the full dashboard.

![Electron sticker compact view](imgs/v0.2.0-sticker.png)

## Installation

Requirements:

- Node.js `>=18`
- npm
- git

Clone and install:

```bash
git clone git@github.com:Hwiyeon/poke-agent-safari.git
cd poke-agent-safari
npm install
npm run setup
```

`npm install` runs a best-effort CLI registration automatically. `npm run setup` repairs local Claude/Codex runtime path permissions, refreshes that `poke-as` command, creates or updates a sparse PokeAPI sprite checkout under `public/vendor/pokeapi-sprites`, copies required item sprites into `public/item-sprites`, and validates required map assets under `data/map_assets`.

If shell permissions prevented command registration during install, rerun:

```bash
npm run setup:cli
```

To rerun only the Claude/Codex runtime permission repair:

```bash
npm run setup:permissions
```

On Ubuntu 22.04, Electron may also need the standard desktop runtime libraries:

```bash
sudo apt update
sudo apt install -y libnss3 libatk-bridge2.0-0 libgtk-3-0 libxss1 libasound2 libgbm1
```

## Quick Start

Open the Electron sticker:

```bash
poke-as
```

Use the `+` button in the sticker to expand into the full dashboard.

Provider-specific sticker modes:

```bash
poke-as --source all
poke-as --source claude
poke-as --source codex
```

Mock sticker:

```bash
poke-as --mock
```

Web dashboard:

```bash
poke-as web
```

Then open:

```text
http://127.0.0.1:8123
```

Web mock mode:

```bash
poke-as web --mock
```

Remote Electron viewer over SSH:

```bash
# Remote server
poke-as web --host 127.0.0.1 --port 8123 --source all
```

```bash
# Local machine
ssh -N -L 8123:127.0.0.1:8123 user@server
poke-as viewer --url http://127.0.0.1:8123
```

`viewer` does not watch local transcripts or start a local dashboard server. It only opens the remote dashboard in an always-on-top Electron sticker. With the tunnel above, `poke-as viewer` can omit `--url` because it defaults to `http://127.0.0.1:8123`.

Legacy web aliases still work:

```bash
poke-as watch
npm run watch
npm run mock
```

## CLI Reference

```bash
poke-as [--source claude|codex|all] [--port 8123] [--path ~/.claude/projects] [--codex-path ~/.codex/sessions] [--no-pokeapi]
poke-as --mock [--port 8123] [--no-pokeapi]
poke-as sticker [--source claude|codex|all] [--port 8123]
poke-as viewer [--url http://127.0.0.1:8123] [--host 127.0.0.1 --port 8123]
poke-as web [watch|mock] [--source claude|codex|all] [--port 8123]
poke-as watch [--source claude|codex|all] [--port 8123]
poke-as hard-reset [watch|mock] [--source claude|codex|all]
poke-as help
```

Config precedence:

```text
defaults < config.json < environment variables < CLI flags
```

Environment variables:

```text
PORT
HOST
AGENT_SAFARI_SOURCE
CLAUDE_PROJECTS_PATH
CODEX_SESSIONS_PATH
ACTIVE_TIMEOUT_SEC
STALE_TIMEOUT_SEC
ENABLE_POKEAPI_SPRITES
```

## How It Works

### Agents

- `HP` represents remaining context window.
- `EXP` and `LV` represent token usage.
- `Status` shows thinking, tool-running, outputting, waiting, or sleeping.
- Root agents render at full size.
- Subagents render nearby as smaller Pokemon in the same evolution line when possible.
- Quiet root agents become `Sleeping` after `10 minutes` in watch mode.
- Stale root agents move into the Safari Log after `8 hours`.

### My Pokemon

- Recruit from active encounters or discovered Pokedex entries.
- Manage a 6-slot party and a Pokemon Box.
- Rename, release, box, unbox, and reorder party members.
- Assign Pokemon to projects so matching project activity trains them faster.
- Hold evolution when you want to delay it.

Training rules:

- `20` agent tokens become `1` owned Pokemon EXP before allocation.
- Project-assigned Pokemon receive allocation weight `5` for matching project activity.
- Unassigned Pokemon can share general training.
- Training events are persisted and included in dashboard snapshots.

### Evolution Items

- `10,000` total tokens earn `1` item point.
- A random draw costs `250` item points.
- Draw success rate is `30%`.
- A target item receives a `2.5x` draw weight multiplier.
- If a successful targeted draw misses the target, you gain `1` target ticket.
- `20` target tickets can claim the selected target item.
- Selling an item gives `10` item points.
- Point buying is disabled.

The item pool contains Gen 1-5 evolution items plus `linking-cord` for trade-style evolutions. Evolution rules are generated into `data/evolution_rules.json`.

### Island Areas

Pokemon assignment is habitat-aware. Selecting an exploration area changes the root-agent spawn pool when area data is available.

Supported areas:

- `mountain`
- `cave`
- `forest`
- `ruin`
- `rough_terrain`
- `grassland`
- `urban`
- `waters_edge`
- `sea`

## Persistence

Live watch state uses a unified source of truth:

```text
data/runtime/all/state.json
data/runtime/all/pokedex.json
```

Compatibility mirrors are also written:

```text
data/runtime/claude/state.json
data/runtime/claude/pokedex.json
data/runtime/codex/state.json
data/runtime/codex/pokedex.json
```

Mock data uses:

```text
data/runtime/mock/state.json
data/runtime/mock/pokedex.json
```

Legacy `data/state.json` and provider runtime files are migrated into the unified store when possible.

## Hard Reset

Available from the dashboard or CLI:

```bash
poke-as hard-reset [watch|mock] [--source claude|codex|all]
```

Hard reset clears persisted state, Safari Log records, My Pokemon, evolution items, and Pokedex progress. In watch mode it also writes a reset flag so the next watcher start skips historical transcript tail replay.

## VS Code Extension

The VS Code extension reuses the same watcher, parser, state model, and public UI.

Commands:

- `Agent Safari: Open (Watch)`
- `Agent Safari: Open (Watch Codex)`
- `Agent Safari: Open (Watch All)`
- `Agent Safari: Open (Mock)`
- `Agent Safari: Hard Reset`
- `Agent Safari: Download Sprite Assets`

Sprite assets are downloaded into VS Code global storage on demand.

## Development

Useful scripts:

```bash
npm run dev:pokemon-cache
npm run dev:pokemon-data:preview
npm run dev:pokemon-data
npm run dev:evolution-rules
npm run dev:map
npm run dev:area-mask
npm run dev:spawn-viz
npm run dev:mask-editor
npm test
```

The `dev/` folder contains generation tools for Pokemon metadata, rarity calibration, evolution rules, map assets, and area masks. Runtime files that ship with the app live in `data/`, `public/`, and the explicit `package.json` `files` list.

## Notes

- Claude Code transcripts are watched under `~/.claude/projects` by default.
- Codex sessions are watched under `~/.codex/sessions` by default.
- Pokemon sprites and metadata come from PokeAPI-compatible public resources. Pokemon IP belongs to its respective owners.
