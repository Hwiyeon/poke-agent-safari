"""Static mapping tables for habitat and rarity calculation."""

# 9 canonical PokeAPI habitats
HABITATS = [
    "cave", "forest", "grassland", "mountain", "rare",
    "rough-terrain", "sea", "urban", "waters-edge",
]

# Location area name keywords -> habitat mapping
# Order matters: first match wins per keyword
LOCATION_KEYWORDS_TO_HABITAT = {
    # Cave
    "cave": "cave", "tunnel": "cave", "cavern": "cave", "mine": "cave",
    "rock-tunnel": "cave", "ice-path": "cave", "dark-cave": "cave",
    "mt-moon": "cave", "mt-mortar": "cave", "whirl-islands": "cave",
    "union-cave": "cave", "slowpoke-well": "cave", "digletts-cave": "cave",
    "cerulean-cave": "cave", "seafoam-islands": "cave", "victory-road": "cave",
    "silver-cave": "cave", "cliff-cave": "cave",
    # Forest
    "forest": "forest", "woods": "forest", "grove": "forest",
    "viridian-forest": "forest", "ilex-forest": "forest",
    "national-park": "forest",
    # Grassland
    "grass": "grassland", "plain": "grassland", "meadow": "grassland",
    "field": "grassland", "ranch": "grassland", "route": "grassland",
    "safari-zone": "grassland",
    # Mountain
    "mountain": "mountain", "mt-": "mountain", "volcano": "mountain",
    "mt-silver": "mountain", "tin-tower": "mountain",
    # Rare
    "trophy": "rare", "pal-park": "rare",
    # Rough terrain
    "terrain": "rough-terrain", "canyon": "rough-terrain",
    "desert": "rough-terrain", "wasteland": "rough-terrain",
    "ruins": "rough-terrain", "burned-tower": "rough-terrain",
    # Sea
    "sea": "sea", "ocean": "sea", "underwater": "sea",
    "marine": "sea", "dive": "sea",
    # Urban
    "city": "urban", "town": "urban", "building": "urban",
    "mansion": "urban", "house": "urban", "gym": "urban",
    "power-plant": "urban", "celadon": "urban", "goldenrod": "urban",
    "pokemon-tower": "urban", "radio-tower": "urban",
    "department": "urban", "game-corner": "urban",
    # Waters-edge
    "lake": "waters-edge", "pond": "waters-edge", "river": "waters-edge",
    "stream": "waters-edge", "marsh": "waters-edge", "swamp": "waters-edge",
    "beach": "waters-edge", "shore": "waters-edge", "bay": "waters-edge",
    "falls": "waters-edge", "spring": "waters-edge", "fishing": "waters-edge",
}

# Encounter methods that represent fixed, event, gift, or special one-off
# encounters. These are audited separately from ordinary wild encounters.
EVENT_FIXED_METHODS = {
    "only-one",
    "roaming-grass", "roaming-water", "roaming",
    "overworld-special", "overworld-flying-special", "overworld-water-special",
    "devon-scope", "pokeflute", "squirt-bottle", "wailmer-pail",
    "gift", "gift-egg", "npc-trade",
    "pokemon-ranger",
    "colosseum-bonus-disc-jpn", "colosseum-bonus-disc-us",
    "pokemon-channel-pal",
    "snag", "snag-rematch",
}

VERSION_TO_GENERATION = {
    "red": 1, "blue": 1, "yellow": 1,
    "gold": 2, "silver": 2, "crystal": 2,
    "ruby": 3, "sapphire": 3, "emerald": 3,
    "firered": 3, "leafgreen": 3,
    "colosseum": 3, "xd": 3,
    "diamond": 4, "pearl": 4, "platinum": 4,
    "heartgold": 4, "soulsilver": 4,
    "black": 5, "white": 5, "black-2": 5, "white-2": 5,
    "x": 6, "y": 6, "omega-ruby": 6, "alpha-sapphire": 6,
    "sun": 7, "moon": 7, "ultra-sun": 7, "ultra-moon": 7,
    "lets-go-pikachu": 7, "lets-go-eevee": 7,
    "sword": 8, "shield": 8,
    "brilliant-diamond": 8, "shining-pearl": 8,
    "legends-arceus": 8,
    "scarlet": 9, "violet": 9,
}

# These fixed methods describe where the Pokemon is actually found or triggered.
# Gift/trade/shadow distribution locations are audited, but only trusted for
# habitat override when a special-place keyword matches.
LOCATION_TRUSTED_EVENT_FIXED_METHODS = {
    "only-one",
    "roaming-grass", "roaming-water", "roaming",
    "overworld-special", "overworld-flying-special", "overworld-water-special",
    "devon-scope", "pokeflute", "squirt-bottle", "wailmer-pail",
}

# Special locations that should be interpreted before the generic keyword map
# when the encounter is event/fixed. These are game places whose meaning is
# stronger than a broad token like "route" or "city".
EVENT_FIXED_LOCATION_KEYWORDS_TO_HABITAT = {
    # Mythical/event islands and origin places
    "hall-of-origin": "rare",
    "birth-island": "rare",
    "faraway-island": "rare",
    "navel-rock": "rare",
    "southern-island": "rare",
    "newmoon-island": "rare",
    "flower-paradise": "forest",
    "liberty-garden": "rare",

    # Legendary shrines, ruins, castles, and towers
    "spear-pillar": "rare",
    "sinjoh-ruins": "rare",
    "abundant-shrine": "rare",
    "embedded-tower": "rare",
    "bell-tower": "rare",
    "tin-tower": "rare",
    "burned-tower": "rare",
    "sky-pillar": "rare",
    "cave-of-origin": "rare",
    "sealed-chamber": "rare",
    "desert-ruins": "rare",
    "ancient-tomb": "rare",
    "relic-castle": "rare",
    "dragonspiral-tower": "rare",
    "ns-castle": "rare",
    "snowpoint-temple": "rare",
    "underground-ruins": "rare",
    "nature-sanctuary": "rare",

    # Strongly named fixed encounter areas
    "lake-acuity-cavern": "cave",
    "lake-valor-cavern": "cave",
    "lake-verity-cavern": "cave",
    "stark-mountain": "mountain",
    "reversal-mountain": "mountain",
    "twist-mountain": "mountain",
    "mistralton-cave": "cave",
    "nameless-cavern": "cave",
    "fabled-cave": "cave",
    "gnarled-den": "cave",
    "scorched-slab": "mountain",
    "giant-chasm": "cave",
    "pinwheel-forest": "forest",
    "lostlorn-forest": "forest",
    "sea-spirits-den": "sea",
    "marine-cave": "sea",
    "terra-cave": "rough-terrain",
    "pathless-plain": "grassland",
    "trackless-forest": "forest",
    "crescent-isle": "waters-edge",
}

# Primary type -> fallback habitat
TYPE_TO_HABITAT = {
    "normal": "grassland",
    "fire": "mountain",
    "water": "sea",
    "electric": "urban",
    "grass": "forest",
    "ice": "cave",
    "fighting": "urban",
    "poison": "forest",
    "ground": "rough-terrain",
    "flying": "grassland",
    "psychic": "urban",
    "bug": "forest",
    "rock": "mountain",
    "ghost": "cave",
    "dragon": "rare",
    "dark": "cave",
    "steel": "mountain",
    "fairy": "forest",
}

# Tier labels
TIER_LABELS = {
    1: "Common",
    2: "Uncommon",
    3: "Rare",
    4: "Very Rare",
    5: "Legendary",
}

# Encounter methods that count as "walkable" (land-based)
WALK_METHODS = {
    "walk", "grass", "tall-grass", "dark-grass",
    "yellow-flowers", "red-flowers", "purple-flowers",
    "rough-terrain", "headbutt",
}

# Encounter methods that count as "aquatic"
AQUATIC_METHODS = {
    "surf", "old-rod", "good-rod", "super-rod", "dive",
}

# Habitat emoji for markdown output
HABITAT_EMOJI = {
    "cave": "🕳️",
    "forest": "🌲",
    "grassland": "🌿",
    "mountain": "🏔️",
    "rare": "✨",
    "rough-terrain": "🏜️",
    "sea": "🌊",
    "urban": "🏙️",
    "waters-edge": "🏖️",
}

# Starter Pokemon IDs (base forms) per generation
# Each generation's first three Pokemon in the regional dex
STARTER_IDS = {
    1, 4, 7,        # Gen 1: Bulbasaur, Charmander, Squirtle
    152, 155, 158,   # Gen 2: Chikorita, Cyndaquil, Totodile
    252, 255, 258,   # Gen 3: Treecko, Torchic, Mudkip
    387, 390, 393,   # Gen 4: Turtwig, Chimchar, Piplup
    495, 498, 501,   # Gen 5: Snivy, Tepig, Oshawott
    650, 653, 656,   # Gen 6: Chespin, Fennekin, Froakie
    722, 725, 728,   # Gen 7: Rowlet, Litten, Popplio
    810, 813, 816,   # Gen 8: Grookey, Scorbunny, Sobble
    906, 909, 912,   # Gen 9: Sprigatito, Fuecoco, Quaxly
}

# Tier emoji for markdown output
TIER_EMOJI = {
    1: "⚪",
    2: "🟢",
    3: "🔵",
    4: "🟣",
    5: "🔴",
}
