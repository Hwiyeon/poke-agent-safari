"""PokeAPI Pokemon Habitat & Rarity Tier Generator.

Usage:
    python -m dev.pokedata.main [--range 1-649] [--output data/pokemon_data.json] [--clear-cache] [--verbose]
"""

import argparse
import json
import os
import shutil
import sys
from collections import Counter
from datetime import datetime, timezone

from .api import PokeApiClient
from .evolution import (
    apply_evolution_constraint,
    extract_species_id_from_url,
    find_special_evolutions,
    inherit_base_habitats,
)
from .habitat import determine_habitat, event_fixed_location_refs
from .mappings import HABITAT_EMOJI, STARTER_IDS, TIER_EMOJI, TIER_LABELS
from .paths import GENERATED_DATA_DIR, GEN5_ANIMATED_DIR, PROJECT_ROOT
from .rarity import assign_tiers_by_percentile, calculate_rarity, tier_label


def parse_args():
    parser = argparse.ArgumentParser(
        description="Generate Pokemon habitat and rarity data from PokeAPI"
    )
    parser.add_argument(
        "--range", default="1-649", dest="poke_range",
        help="Pokemon ID range, e.g. 1-649 (default: 1-649)"
    )
    parser.add_argument(
        "--output", default=None,
        help="Output JSON path (default: dev/data/generated/pokemon_data.json)"
    )
    parser.add_argument(
        "--table-output", default=None,
        help="Output Markdown table path (default: dev/data/generated/pokemon_table.md)"
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
        help="Print per-Pokemon debug info"
    )
    return parser.parse_args()


def parse_range(range_str):
    """Parse '1-649' into (1, 649)."""
    parts = range_str.split("-")
    if len(parts) == 2:
        return int(parts[0]), int(parts[1])
    raise ValueError(f"Invalid range: {range_str}. Use format: start-end")


def get_project_root():
    """Get the project root (two levels up from this file)."""
    return PROJECT_ROOT


def main():
    args = parse_args()
    start_id, end_id = parse_range(args.poke_range)
    total = end_id - start_id + 1
    project_root = get_project_root()

    output_path = args.output or os.path.join(GENERATED_DATA_DIR, "pokemon_data.json")
    table_path = args.table_output or os.path.join(GENERATED_DATA_DIR, "pokemon_table.md")

    # Initialize API client
    client = PokeApiClient(cache_dir=args.cache_dir)

    if args.clear_cache and os.path.exists(client.cache_dir):
        shutil.rmtree(client.cache_dir)
        print("Cache cleared.")

    print(f"Processing Pokemon #{start_id}-#{end_id} ({total} species)")
    print(f"Cache: {client.cache_dir}")
    print()

    # -- Phase 1: Fetch species data --
    print("Phase 1/8: Fetching species data...")
    species_map = {}
    skipped = []
    for pid in range(start_id, end_id + 1):
        _progress(pid - start_id + 1, total, f"species #{pid}")
        data = client.get_species(pid)
        if data:
            species_map[pid] = data
        else:
            skipped.append(pid)
    print()

    # -- Phase 2: Fetch encounter data --
    print("Phase 2/8: Fetching encounter data...")
    encounters_map = {}
    for i, pid in enumerate(species_map.keys()):
        _progress(i + 1, len(species_map), f"encounters #{pid}")
        data = client.get_encounters(pid)
        encounters_map[pid] = data if data is not None else []
    print()

    # -- Phase 3: Fetch type data for habitat-null Pokemon --
    print("Phase 3/8: Fetching type data...")
    types_map = {}
    bst_map = {}
    need_types = set()
    for pid, sp in species_map.items():
        # Always fetch types for fallback and output
        need_types.add(pid)
    for i, pid in enumerate(need_types):
        _progress(i + 1, len(need_types), f"types #{pid}")
        poke_data = client.get_pokemon(pid)
        if poke_data and "types" in poke_data:
            types_map[pid] = [
                t["type"]["name"] for t in
                sorted(poke_data["types"], key=lambda t: t["slot"])
            ]
            bst_map[pid] = sum(s["base_stat"] for s in poke_data.get("stats", []))
        else:
            types_map[pid] = []
            bst_map[pid] = 0
    print()

    # -- Phase 4: Fetch evolution chains --
    print("Phase 4/8: Fetching evolution chains...")
    chain_ids = set()
    pid_to_chain_id = {}
    for pid, sp in species_map.items():
        chain_url = sp.get("evolution_chain", {}).get("url", "")
        chain_id = extract_species_id_from_url(chain_url)
        if chain_id:
            chain_ids.add(chain_id)
            pid_to_chain_id[pid] = chain_id

    chains = {}
    for i, cid in enumerate(sorted(chain_ids)):
        _progress(i + 1, len(chain_ids), f"chain #{cid}")
        data = client.get_evolution_chain(cid)
        if data:
            chains[cid] = data
    print()

    # -- Phase 4.5: Fetch event/fixed encounter location metadata --
    print("Phase 4.5/8: Fetching event/fixed location metadata...")
    event_location_refs_map = {}
    unique_area_refs = {}
    for pid, encounters in encounters_map.items():
        refs = event_fixed_location_refs(encounters)
        if not refs:
            continue
        event_location_refs_map[pid] = refs
        for ref in refs:
            key = ref.get("name") or ref.get("url")
            if key and key not in unique_area_refs:
                unique_area_refs[key] = ref

    event_location_detail_by_area = {}
    unique_refs = list(unique_area_refs.values())
    if unique_refs:
        for i, ref in enumerate(unique_refs):
            _progress(i + 1, len(unique_refs), f"location-area {ref.get('name')}")
            area_data = client.get_location_area(ref)
            location_data = None
            if area_data and area_data.get("location"):
                location_data = client.get_location(area_data["location"])
            area_name = ref.get("name") or (area_data or {}).get("name")
            if area_name:
                event_location_detail_by_area[area_name] = {
                    "area": area_data or {},
                    "location": location_data or {},
                }
    print()

    event_location_details_map = {}
    for pid, refs in event_location_refs_map.items():
        event_location_details_map[pid] = {
            ref["name"]: event_location_detail_by_area.get(ref["name"], {})
            for ref in refs
            if ref.get("name")
        }

    # -- Phase 5: Determine habitats --
    print("Phase 5/8: Determining habitats...")
    pokemon_results = {}
    for pid, sp in species_map.items():
        pokemon_types = types_map.get(pid, [])
        habitat, source, habitat_detail = determine_habitat(
            sp,
            encounters_map.get(pid, []),
            pokemon_types,
            location_details=event_location_details_map.get(pid, {}),
            return_details=True,
        )

        pokemon_results[sp["name"]] = {
            "pokemon_id": pid,
            "name": sp["name"],
            "habitat": habitat,
            "habitat_source": source,
            "direct_habitat": habitat,
            "direct_habitat_source": source,
            "habitat_detail": habitat_detail,
            "capture_rate": sp.get("capture_rate", 128),
            "base_stat_total": bst_map.get(pid, 0),
            "primary_type": pokemon_types[0] if pokemon_types else "normal",
            "types": pokemon_types,
            "is_legendary": sp.get("is_legendary", False),
            "is_mythical": sp.get("is_mythical", False),
        }

        if args.verbose:
            print(f"  #{pid} {sp['name']}: habitat={habitat} (via {source})")

    habitat_changes = inherit_base_habitats(pokemon_results, list(chains.values()))
    if args.verbose and habitat_changes:
        print(f"  Evolution habitat inheritance changed {len(habitat_changes)} Pokemon")
        for change in habitat_changes:
            print(
                f"    {change['name']}: {change['old_habitat']} -> "
                f"{change['new_habitat']} (base {change['base_name']})"
            )

    # -- Phase 5.5: Identify special evolution conditions --
    special_evo_bonus = find_special_evolutions(list(chains.values()))
    if args.verbose and special_evo_bonus:
        print(f"  Special evolutions found: {len(special_evo_bonus)}")
        for name, bonus in sorted(special_evo_bonus.items()):
            print(f"    {name}: +{bonus}")

    # -- Phase 6: Calculate raw rarity scores --
    # First pass: compute standalone scores for all Pokemon
    print("Phase 6/8: Calculating rarity scores...")
    from .evolution import flatten_chain
    for name, poke in pokemon_results.items():
        pid = poke["pokemon_id"]
        sp = species_map[pid]
        enc = encounters_map.get(pid, [])
        evo_bonus = special_evo_bonus.get(name, 0)
        rarity = calculate_rarity(sp, enc, poke["base_stat_total"], evo_bonus)

        poke["raw_score"] = rarity["raw_score"]
        poke["initial_tier"] = rarity["initial_tier"]
        poke["final_tier"] = rarity["initial_tier"]
        poke["encounter_count"] = rarity["encounter_count"]
        poke["is_aquatic_only"] = rarity["is_aquatic_only"]
        poke["is_version_exclusive"] = rarity["is_version_exclusive"]

    # 1.5 pass: wild availability discount for non-evolved Pokemon.
    # Pokemon obtainable in the wild should be less rare than evolve-only ones.
    # Identify which Pokemon are base forms / standalone (not an evolution).
    evolved_names = set()
    for chain_data in list(chains.values()):
        stages = flatten_chain(chain_data)
        for stage_idx in range(1, len(stages)):
            for evo_name in stages[stage_idx]:
                evolved_names.add(evo_name)

    for name, poke in pokemon_results.items():
        if poke.get("is_legendary") or poke.get("is_mythical"):
            continue
        if name in evolved_names:
            continue  # evolved Pokemon are handled in second pass
        pid = poke["pokemon_id"]
        enc = encounters_map.get(pid, [])
        locs = len(enc) if enc else 0
        if locs >= 3:
            # Wild-available base/standalone Pokemon: discount score
            # Being catchable in the wild makes you less rare than evolve-only.
            # 3 locs -> -8, 10 locs -> -11, 20 locs -> -14, 40+ locs -> -16
            import math
            discount = min(16, 8 + (math.log(max(1, locs) / 3) / math.log(5)) * 8)
            poke["raw_score"] = round(max(0, poke["raw_score"] - discount), 2)

    # Second pass: re-score evolved Pokemon based on pre-evolution score.
    # Only for "easy" evolutions (level-up, stone, happiness).
    # Hard evolutions (trade, trade+item: evo_bonus >= 7) keep standalone score.
    print("  Adjusting evolved Pokemon scores based on pre-evolution...")
    for chain_data in list(chains.values()):
        stages = flatten_chain(chain_data)
        if len(stages) <= 1:
            continue
        for stage_idx in range(1, len(stages)):
            prev_scores = []
            prev_bsts = []
            for prev_name in stages[stage_idx - 1]:
                if prev_name in pokemon_results:
                    prev_scores.append(pokemon_results[prev_name]["raw_score"])
                    prev_bsts.append(pokemon_results[prev_name]["base_stat_total"])
            if not prev_scores:
                continue
            prev_score = max(prev_scores)
            prev_bst = max(prev_bsts)

            for evo_name in stages[stage_idx]:
                if evo_name not in pokemon_results:
                    continue
                poke = pokemon_results[evo_name]
                if poke.get("is_legendary") or poke.get("is_mythical"):
                    continue

                evo_b = special_evo_bonus.get(evo_name, 0)

                # Evolution stage bonus: higher stage = inherently rarer
                stage_bonus = min(stage_idx, 2) * 3  # stage2: +3, stage3: +6

                # Evolve-only bonus: no wild encounters = harder to obtain
                pid = poke["pokemon_id"]
                enc = encounters_map.get(pid, [])
                evolve_only_bonus = 8 if (not enc or len(enc) == 0) else 0

                # Hard evolutions (trade+held-item): keep standalone score + bonuses
                if evo_b >= 8:
                    poke["raw_score"] = round(
                        min(100, poke["raw_score"] + stage_bonus + evolve_only_bonus), 2
                    )
                    continue

                # Easy evolutions: anchor to pre-evo score + delta
                bst_delta = _bst_bonus(poke["base_stat_total"]) - _bst_bonus(prev_bst)
                method_b = 0
                if poke.get("is_aquatic_only"):
                    method_b += 3
                if poke.get("is_version_exclusive"):
                    method_b += 2

                adjusted = prev_score + bst_delta + evo_b + method_b + stage_bonus + evolve_only_bonus
                # Floor: adjusted score never drops below 50% of standalone score.
                standalone = poke["raw_score"]
                adjusted = max(adjusted, standalone * 0.5)
                adjusted = max(0, min(100, adjusted))
                poke["raw_score"] = round(adjusted, 2)

    if args.verbose:
        for name, poke in sorted(pokemon_results.items(), key=lambda x: x[1]["pokemon_id"]):
            print(f"  #{poke['pokemon_id']} {name}: score={poke['raw_score']}")

    # -- Phase 6.5: Assign tiers by percentile (pyramid distribution) --
    print("Phase 6.5/8: Assigning tiers by percentile...")
    all_pokemon = list(pokemon_results.values())
    assign_tiers_by_percentile(all_pokemon)

    # -- Phase 7: Apply evolution chain constraints --
    print("Phase 7/8: Applying evolution constraints...")
    chain_list = list(chains.values())
    # Only trade+held-item evolutions (bonus >= 8) are exempt from cap
    hard_evo_names = {name for name, bonus in special_evo_bonus.items() if bonus >= 8}
    apply_evolution_constraint(pokemon_results, chain_list, hard_evo_names)

    # -- Phase 7.5a: Plain trade evolutions -> floor at Rare --
    PLAIN_TRADE_BONUS = 5
    for name, bonus in special_evo_bonus.items():
        if bonus == PLAIN_TRADE_BONUS and name in pokemon_results:
            poke = pokemon_results[name]
            if poke["final_tier"] < 3:
                poke["final_tier"] = 3

    # -- Phase 7.5: Override starter tiers --
    # Starters follow fixed pattern: base=Uncommon, stage2=Uncommon, stage3=Rare
    from .evolution import flatten_chain
    starter_names = set()
    for chain_data in chain_list:
        stages = flatten_chain(chain_data)
        if not stages:
            continue
        # Check if any base form is a starter
        base_is_starter = False
        for name in stages[0]:
            if name in pokemon_results:
                if pokemon_results[name]["pokemon_id"] in STARTER_IDS:
                    base_is_starter = True
                    break
        if not base_is_starter:
            continue
        tier_by_stage = {0: 2, 1: 2, 2: 3}  # Uncommon, Uncommon, Rare
        for stage_idx, stage_names in enumerate(stages):
            forced_tier = tier_by_stage.get(stage_idx, 3)
            for name in stage_names:
                if name in pokemon_results:
                    pokemon_results[name]["final_tier"] = forced_tier
                    starter_names.add(name)

    # -- Phase 7.6: Override Eevee evolutions -> all Rare --
    EEVEE_ID = 133
    for chain_data in chain_list:
        stages = flatten_chain(chain_data)
        if not stages:
            continue
        is_eevee = any(
            name in pokemon_results and pokemon_results[name]["pokemon_id"] == EEVEE_ID
            for name in stages[0]
        )
        if not is_eevee:
            continue
        # Eevee itself stays as-is; all evolutions -> Rare
        for stage_idx in range(1, len(stages)):
            for name in stages[stage_idx]:
                if name in pokemon_results:
                    pokemon_results[name]["final_tier"] = 3

    # Add tier labels
    for poke in pokemon_results.values():
        poke["tier_label"] = tier_label(poke["final_tier"])

    # -- Phase 8: Write output --
    print("Phase 8/8: Writing output...")

    # Sort by Pokemon ID
    sorted_pokemon = sorted(pokemon_results.values(), key=lambda p: p["pokemon_id"])

    # Calculate tier distribution
    tier_dist = Counter(p["final_tier"] for p in sorted_pokemon)

    # Build output JSON (clean fields for export)
    output_pokemon = []
    for p in sorted_pokemon:
        output_pokemon.append({
            "pokemon_id": p["pokemon_id"],
            "name": p["name"],
            "habitat": p["habitat"],
            "capture_rate": p["capture_rate"],
            "base_stat_total": p["base_stat_total"],
            "primary_type": p["primary_type"],
            "final_tier": p["final_tier"],
            "tier_label": p["tier_label"],
        })

    output = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "range": f"{start_id}-{end_id}",
        "total": len(sorted_pokemon),
        "skipped": skipped,
        "tier_distribution": {str(k): v for k, v in sorted(tier_dist.items())},
        "pokemon": output_pokemon,
    }

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print(f"  JSON: {output_path}")

    # Generate Markdown table
    md = _generate_markdown_table(sorted_pokemon, tier_dist, start_id, end_id, os.path.dirname(table_path))
    os.makedirs(os.path.dirname(table_path), exist_ok=True)
    with open(table_path, "w", encoding="utf-8") as f:
        f.write(md)
    print(f"  Table: {table_path}")

    audit_path = os.path.join(GENERATED_DATA_DIR, "event_fixed_habitat_audit.json")
    _write_event_fixed_audit(audit_path, sorted_pokemon)
    print(f"  Event/fixed audit: {audit_path}")

    print()
    print("Done!")
    print(f"  Total: {len(sorted_pokemon)} Pokemon")
    print(f"  Skipped: {len(skipped)}")
    for tier in sorted(tier_dist.keys()):
        print(f"  Tier {tier} ({TIER_LABELS[tier]}): {tier_dist[tier]}")


def _write_event_fixed_audit(path, pokemon_list):
    """Write detailed event/fixed habitat decisions for review."""
    rows = []
    for p in pokemon_list:
        detail = (p.get("habitat_detail") or {}).get("event_fixed") or {}
        if not detail.get("candidate"):
            continue
        rows.append({
            "pokemon_id": p["pokemon_id"],
            "name": p["name"],
            "direct_habitat": p.get("direct_habitat"),
            "direct_habitat_source": p.get("direct_habitat_source"),
            "final_habitat": p.get("habitat"),
            "final_habitat_source": p.get("habitat_source"),
            "selected_event_fixed_habitat": detail.get("selected_habitat"),
            "event_fixed_decision": detail.get("decision"),
            "habitat_counts": detail.get("habitat_counts", {}),
            "locations": detail.get("locations", []),
        })

    audit = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "algorithm": "event/fixed encounter location metadata before normal habitat fallback",
        "candidate_count": len(rows),
        "applied_count": sum(1 for row in rows if row["direct_habitat_source"] == "event-fixed"),
        "rows": rows,
    }
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(audit, f, ensure_ascii=False, indent=2)


def _generate_markdown_table(pokemon_list, tier_dist, start_id, end_id, table_dir):
    """Generate a Markdown file with summary and habitat-grouped tables."""
    lines = []
    lines.append(f"# Pokemon Habitat & Rarity Table (#{start_id}-#{end_id})")
    lines.append("")
    lines.append("## Summary")
    lines.append("")
    lines.append("| Tier | Label | Count |")
    lines.append("|------|-------|-------|")
    for tier in sorted(tier_dist.keys()):
        emoji = TIER_EMOJI.get(tier, "")
        lines.append(f"| {emoji} {tier} | {TIER_LABELS[tier]} | {tier_dist[tier]} |")
    lines.append("")

    # Group by habitat
    habitat_groups = {}
    for p in pokemon_list:
        h = p["habitat"]
        habitat_groups.setdefault(h, []).append(p)

    sprite_base = os.path.relpath(GEN5_ANIMATED_DIR, table_dir).replace(os.sep, "/")

    # Sort habitats alphabetically
    for habitat in sorted(habitat_groups.keys()):
        group = habitat_groups[habitat]
        emoji = HABITAT_EMOJI.get(habitat, "")
        lines.append(f"## {emoji} {habitat.replace('-', ' ').title()}")
        lines.append("")
        lines.append("| # | Sprite | Name | Type | Capture Rate | Tier |")
        lines.append("|---|--------|------|------|-------------|------|")
        for p in sorted(group, key=lambda x: x["pokemon_id"]):
            pid = p["pokemon_id"]
            sprite = f"![{p['name']}]({sprite_base}/{pid}.gif)"
            type_str = "/".join(p.get("types", [p["primary_type"]]))
            tier_emoji = TIER_EMOJI.get(p["final_tier"], "")
            lines.append(
                f"| {pid} | {sprite} | {p['name'].title()} "
                f"| {type_str} | {p['capture_rate']} "
                f"| {tier_emoji} {p['tier_label']} |"
            )
        lines.append("")

    # Full list sorted by tier (descending) then ID
    lines.append("## Full List (by Tier)")
    lines.append("")
    lines.append("| # | Sprite | Name | Habitat | Type | Capture Rate | Tier |")
    lines.append("|---|--------|------|---------|------|-------------|------|")
    for p in sorted(pokemon_list, key=lambda x: x["pokemon_id"]):
        pid = p["pokemon_id"]
        sprite = f"![{p['name']}]({sprite_base}/{pid}.gif)"
        type_str = "/".join(p.get("types", [p["primary_type"]]))
        tier_emoji = TIER_EMOJI.get(p["final_tier"], "")
        hab_emoji = HABITAT_EMOJI.get(p["habitat"], "")
        lines.append(
            f"| {pid} | {sprite} | {p['name'].title()} "
            f"| {hab_emoji} {p['habitat']} | {type_str} "
            f"| {p['capture_rate']} | {tier_emoji} {p['tier_label']} |"
        )
    lines.append("")

    return "\n".join(lines)


def _bst_bonus(bst):
    """Calculate BST bonus component (same logic as rarity.py Step 4)."""
    if bst >= 570:
        return min(15, (bst - 400) / 20 + 5)
    elif bst >= 400:
        return (bst - 400) / 20
    elif bst > 0:
        return max(-5, (bst - 400) / 40)
    return 0.0


def _progress(current, total, label=""):
    """Print progress on same line."""
    pct = current / total * 100
    bar_len = 30
    filled = int(bar_len * current / total)
    bar = "█" * filled + "░" * (bar_len - filled)
    sys.stdout.write(f"\r  [{bar}] {current}/{total} ({pct:.0f}%) {label}   ")
    if current == total:
        sys.stdout.write("\n")
    sys.stdout.flush()


if __name__ == "__main__":
    main()
