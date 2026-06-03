"""Shared filesystem paths for development-only asset generators."""

import os


PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DEV_ROOT = os.path.join(PROJECT_ROOT, "dev")
PUBLIC_DIR = os.path.join(PROJECT_ROOT, "public")
DATA_DIR = os.path.join(DEV_ROOT, "data", "generated")
REFERENCE_DATA_DIR = os.path.join(DEV_ROOT, "data", "reference")
GENERATED_DATA_DIR = DATA_DIR
VENDOR_DIR = os.path.join(PUBLIC_DIR, "vendor")
POKEAPI_SPRITES_DIR = os.path.join(VENDOR_DIR, "pokeapi-sprites")
POKEAPI_CACHE_DIR = os.path.join(DEV_ROOT, ".cache", "pokeapi")
POKEAPI_POKEMON_DIR = os.path.join(POKEAPI_SPRITES_DIR, "sprites", "pokemon")
GEN5_DIR = os.path.join(POKEAPI_POKEMON_DIR, "versions", "generation-v", "black-white")
GEN5_STATIC_DIR = GEN5_DIR
GEN5_ANIMATED_DIR = os.path.join(GEN5_DIR, "animated")
