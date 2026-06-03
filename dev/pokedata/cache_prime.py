"""Prime the local PokeAPI JSON cache without regenerating export files.

Usage:
    python -m dev.pokedata.cache_prime [--range 1-649] [--clear-cache] [--verbose]
"""

import argparse
import os
import shutil
import sys

from .api import PokeApiClient
from .evolution import extract_species_id_from_url


def parse_args():
    parser = argparse.ArgumentParser(
        description="Warm local PokeAPI cache data for the requested Pokemon range"
    )
    parser.add_argument(
        "--range", default="1-649", dest="poke_range",
        help="Pokemon ID range, e.g. 1-649 (default: 1-649)"
    )
    parser.add_argument(
        "--cache-dir", default=None,
        help="Cache directory (default: dev/.cache/pokeapi)"
    )
    parser.add_argument(
        "--clear-cache", action="store_true",
        help="Clear cache before starting"
    )
    parser.add_argument(
        "--verbose", action="store_true",
        help="Print each fetched resource id"
    )
    return parser.parse_args()


def parse_range(range_str):
    parts = range_str.split("-")
    if len(parts) == 2:
        return int(parts[0]), int(parts[1])
    raise ValueError(f"Invalid range: {range_str}. Use format: start-end")


def progress(current, total, label=""):
    pct = current / total * 100
    bar_len = 30
    filled = int(bar_len * current / total)
    bar = "█" * filled + "░" * (bar_len - filled)
    sys.stdout.write(f"\r  [{bar}] {current}/{total} ({pct:.0f}%) {label}   ")
    if current == total:
        sys.stdout.write("\n")
    sys.stdout.flush()


def main():
    args = parse_args()
    start_id, end_id = parse_range(args.poke_range)
    total = end_id - start_id + 1
    client = PokeApiClient(cache_dir=args.cache_dir)

    if args.clear_cache and os.path.exists(client.cache_dir):
        shutil.rmtree(client.cache_dir)
        print("Cache cleared.")

    print(f"Priming cache for Pokemon #{start_id}-#{end_id} ({total} species)")
    print(f"Cache: {client.cache_dir}")
    print()

    species_map = {}
    print("Phase 1/4: Fetching species data...")
    for offset, pid in enumerate(range(start_id, end_id + 1), start=1):
        progress(offset, total, f"species #{pid}")
        data = client.get_species(pid)
        if data:
            species_map[pid] = data
            if args.verbose:
                print(f"  species #{pid}")
    print()

    print("Phase 2/4: Fetching encounter data...")
    for offset, pid in enumerate(sorted(species_map.keys()), start=1):
        progress(offset, len(species_map), f"encounters #{pid}")
        client.get_encounters(pid)
        if args.verbose:
            print(f"  encounters #{pid}")
    print()

    print("Phase 3/4: Fetching pokemon data...")
    for offset, pid in enumerate(sorted(species_map.keys()), start=1):
        progress(offset, len(species_map), f"pokemon #{pid}")
        client.get_pokemon(pid)
        if args.verbose:
            print(f"  pokemon #{pid}")
    print()

    chain_ids = set()
    for species in species_map.values():
        chain_url = species.get("evolution_chain", {}).get("url", "")
        chain_id = extract_species_id_from_url(chain_url)
        if chain_id:
            chain_ids.add(chain_id)

    print("Phase 4/4: Fetching evolution chains...")
    sorted_chain_ids = sorted(chain_ids)
    for offset, chain_id in enumerate(sorted_chain_ids, start=1):
        progress(offset, len(sorted_chain_ids), f"chain #{chain_id}")
        client.get_evolution_chain(chain_id)
        if args.verbose:
            print(f"  chain #{chain_id}")
    print()

    print("Done!")
    print(f"  Species cached: {len(species_map)}")
    print(f"  Evolution chains cached: {len(sorted_chain_ids)}")


if __name__ == "__main__":
    main()
