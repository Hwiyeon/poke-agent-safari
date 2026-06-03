# Development Tools

This folder contains source tools used to generate Agent Safari runtime assets. It is not part of the VS Code extension package; runtime files are still explicitly listed in the root `package.json`.

## Pokemon Data

The PokeAPI pipeline calculates habitat and rarity tiers from public PokeAPI data.

```bash
npm run dev:pokemon-cache
npm run dev:pokemon-data:preview
npm run dev:pokemon-data
```

- `dev:pokemon-cache` warms the local JSON cache under `dev/.cache/pokeapi`.
- `dev:pokemon-data:preview` writes generated files under `dev/data/generated`.
- `dev:pokemon-data` writes `data/pokemon_data.json` and a review table under `dev/data/generated/pokemon_table.md`.

The default range is `1-649`, matching Pokemon generations 1 through 5.

## Map Assets

The map tools keep authored inputs separate from generated outputs.

```bash
npm run dev:map
npm run dev:area-mask
npm run dev:spawn-viz
npm run dev:mask-editor
```

- `dev/data/reference/area_map.png` is the authored region reference.
- `dev/data/generated/` receives generated maps, masks, debug images, and previews.
- Copy only reviewed runtime outputs from `dev/data/generated` into root `data/` when they should ship with the app.

## Public Safety

Keep generated caches, debug images, and backups out of git unless they are intentionally promoted to runtime assets. Pokemon names, metadata, and sprite paths come from PokeAPI-compatible public resources; Pokemon IP belongs to its respective owners.
