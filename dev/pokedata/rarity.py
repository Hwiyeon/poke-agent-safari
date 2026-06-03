"""Rarity score calculation and tier assignment."""

from .mappings import AQUATIC_METHODS, TIER_LABELS, WALK_METHODS


def calculate_rarity(species_data, encounters, base_stat_total=0, evo_bonus=0):
    """Calculate raw rarity score and initial tier.

    Args:
        species_data: Response from /pokemon-species/{id}
        encounters: Response from /pokemon/{id}/encounters (list)
        base_stat_total: Sum of all 6 base stats (HP/Atk/Def/SpA/SpD/Spe)
        evo_bonus: Extra score for special evolution conditions (trade, item, etc.)

    Returns:
        dict with scoring results.
    """
    is_legendary = species_data.get("is_legendary", False)
    is_mythical = species_data.get("is_mythical", False)

    # Legendary/Mythical override
    if is_legendary or is_mythical:
        return {
            "raw_score": 100.0,
            "initial_tier": 5,
            "is_legendary": is_legendary,
            "is_mythical": is_mythical,
            "encounter_count": len(encounters) if encounters else 0,
            "is_aquatic_only": False,
            "is_version_exclusive": False,
        }

    capture_rate = species_data.get("capture_rate", 128)
    has_encounters = encounters and len(encounters) > 0

    # Step 1: Base score from capture_rate inverse (0-100)
    # Pokemon with no wild encounters use the lowest capture_rate in the list (3),
    # treating them as the hardest to obtain - you can't even find them in the wild.
    effective_rate = capture_rate if has_encounters else 3
    base_score = ((255 - effective_rate) / 252) * 100

    # Step 2: Encounter rarity modifier (-10 to +15)
    #   Based on avg encounter chance (lower chance = rarer)
    encounter_mod = 0.0
    if not has_encounters:
        encounter_mod = 15.0
    else:
        chances = []
        for loc in encounters:
            for vd in loc.get("version_details", []):
                mc = vd.get("max_chance", 0)
                if mc > 0:
                    chances.append(mc)
        if chances:
            avg_chance = sum(chances) / len(chances)
            encounter_mod = ((100 - avg_chance) / 100) * 15
            encounter_mod = max(-10, min(15, encounter_mod))
        else:
            encounter_mod = 15.0

    # Step 2.5: Location scarcity modifier (-8 to +8)
    #   Fewer encounter locations = rarer.
    #   0 locations handled above (+15). Scale: 1 loc -> +8, 50+ loc -> -8
    import math
    location_mod = 0.0
    location_count = len(encounters) if encounters else 0
    if location_count > 0:
        # log scale: 1->+8, ~7->+4, ~50->0, 100+->-8
        location_mod = 8 - (math.log(max(1, location_count)) / math.log(50)) * 16
        location_mod = max(-8, min(8, location_mod))

    # Step 3: Method bonus (0 to +5)
    method_bonus = 0
    is_aquatic_only = False
    is_version_exclusive = False

    if encounters:
        all_methods = set()
        all_versions = set()
        for loc in encounters:
            for vd in loc.get("version_details", []):
                ver_name = vd.get("version", {}).get("name", "")
                if ver_name:
                    all_versions.add(ver_name)
                for ed in vd.get("encounter_details", []):
                    method = ed.get("method", {}).get("name", "")
                    if method:
                        all_methods.add(method)

        has_walk = bool(all_methods & WALK_METHODS)
        has_aquatic = bool(all_methods & AQUATIC_METHODS)

        if has_aquatic and not has_walk:
            method_bonus += 3
            is_aquatic_only = True

        if 0 < len(all_versions) <= 2:
            method_bonus += 2
            is_version_exclusive = True

    # Step 4: Base stat total modifier (-5 to +15)
    # BST range: ~180 (Sunkern) to ~680 (pseudo-legendaries)
    # Midpoint ~400: above gets bonus, below gets penalty
    # BST 570+ gets extra kick (pseudo-legendaries, strong finals)
    bst_bonus = 0.0
    if base_stat_total >= 570:
        # 570 -> +8.5+5=13.5, 600 -> +10+5=15 (capped)
        bst_bonus = min(15, (base_stat_total - 400) / 20 + 5)
    elif base_stat_total >= 400:
        # 400 -> +0, 500 -> +5, 569 -> +8.45
        bst_bonus = (base_stat_total - 400) / 20
    elif base_stat_total > 0:
        # 400 -> -0, 300 -> -2.5, 200 -> -5 (capped)
        bst_bonus = max(-5, (base_stat_total - 400) / 40)

    # Step 5: Special evolution bonus (0 to +5)
    # trade/held-item trade -> +5, use-item/happiness/time -> +3

    # Step 6: Raw score
    raw_score = base_score + encounter_mod + location_mod + method_bonus + bst_bonus + evo_bonus
    raw_score = max(0, min(100, raw_score))

    # Step 7: Score -> tier
    initial_tier = _score_to_tier(raw_score)

    return {
        "raw_score": round(raw_score, 2),
        "initial_tier": initial_tier,
        "is_legendary": is_legendary,
        "is_mythical": is_mythical,
        "encounter_count": len(encounters) if encounters else 0,
        "is_aquatic_only": is_aquatic_only,
        "is_version_exclusive": is_version_exclusive,
    }


def _score_to_tier(score):
    """Preliminary tier from score. Final tier is determined by percentile in main.py."""
    if score >= 90:
        return 4
    if score >= 55:
        return 3
    if score >= 30:
        return 2
    return 1


def assign_tiers_by_percentile(pokemon_list):
    """Assign tiers so count decreases from Common to Very Rare.

    Percentile bands (of non-legendary Pokemon):
        T1 Common:    bottom 35%
        T2 Uncommon:  next   27%
        T3 Rare:      next   22%
        T4 Very Rare: top    16%
        T5 Legendary: is_legendary / is_mythical (fixed)
    """
    # Separate legendaries
    regular = [p for p in pokemon_list
               if not (p.get("is_legendary") or p.get("is_mythical"))]
    regular.sort(key=lambda p: p["raw_score"])

    n = len(regular)
    # Pre-constraint percentile bands.
    # Cap constraint pulls some T3/T4 down, so start near-pyramid
    # with slight T3/T4 surplus to compensate.
    t1_end = int(n * 0.35)
    t2_end = int(n * 0.58)
    t3_end = int(n * 0.84)

    for i, p in enumerate(regular):
        if i < t1_end:
            p["final_tier"] = 1
        elif i < t2_end:
            p["final_tier"] = 2
        elif i < t3_end:
            p["final_tier"] = 3
        else:
            p["final_tier"] = 4

    for p in pokemon_list:
        if p.get("is_legendary") or p.get("is_mythical"):
            p["final_tier"] = 5


def tier_label(tier):
    """Get human-readable tier label."""
    return TIER_LABELS.get(tier, "Unknown")
