"""Evolution chain traversal and tier constraint enforcement."""


def flatten_chain(chain_data):
    """Convert nested PokeAPI evolution chain to ordered stages.

    Returns:
        List of stages, where each stage is a list of species names.
        e.g. [["bulbasaur"], ["ivysaur"], ["venusaur"]]
    """
    if not chain_data or "chain" not in chain_data:
        return []

    stages = []
    current_level = [chain_data["chain"]]

    while current_level:
        stage_names = []
        next_level = []
        for node in current_level:
            name = node.get("species", {}).get("name")
            if name:
                stage_names.append(name)
            next_level.extend(node.get("evolves_to", []))
        if stage_names:
            stages.append(stage_names)
        current_level = next_level

    return stages


def inherit_base_habitats(pokemon_dict, evolution_chains):
    """Force each evolution chain to share its lowest-stage habitat.

    The root species in a PokeAPI evolution chain is the lowest evolution stage.
    If that root is outside the generated ID range, use the first available
    species from the earliest available stage as the anchor.

    Returns:
        List of change records for Pokemon whose habitat was modified.
    """
    changes = []

    for chain_data in evolution_chains:
        stages = flatten_chain(chain_data)
        if len(stages) <= 1:
            continue

        base_name = None
        for stage in stages:
            base_name = next((name for name in stage if name in pokemon_dict), None)
            if base_name:
                break

        if not base_name:
            continue

        base_habitat = pokemon_dict[base_name]["habitat"]
        for stage in stages:
            for name in stage:
                if name not in pokemon_dict:
                    continue

                poke = pokemon_dict[name]
                old_habitat = poke["habitat"]
                if old_habitat != base_habitat:
                    changes.append({
                        "name": name,
                        "base_name": base_name,
                        "old_habitat": old_habitat,
                        "new_habitat": base_habitat,
                    })

                poke["habitat"] = base_habitat
                if name != base_name:
                    poke["habitat_source"] = f"evolution-base:{base_name}"

    return changes


def extract_species_id_from_url(url):
    """Extract numeric ID from PokeAPI URL like .../pokemon-species/25/."""
    if not url:
        return None
    parts = url.rstrip("/").split("/")
    try:
        return int(parts[-1])
    except (ValueError, IndexError):
        return None


def find_special_evolutions(evolution_chains):
    """Identify Pokemon that require special evolution conditions.

    Special conditions (non-level-up):
      - trade: Gengar, Alakazam, Machamp, Golem, etc.
      - use-item: Raichu (Thunder Stone), Vileplume (Leaf Stone), etc.
      - happiness: Crobat, Espeon, Umbreon, etc.
      - held-item trade: Slowking (King's Rock), Steelix (Metal Coat), etc.
      - time-of-day: Espeon (day), Umbreon (night)

    Returns:
        dict mapping species name -> bonus score (3 or 5)
    """
    special = {}

    for chain_data in evolution_chains:
        if not chain_data or "chain" not in chain_data:
            continue
        _walk_chain(chain_data["chain"], special)

    return special


def _walk_chain(node, special):
    """Recursively walk chain, checking evolution_details for special triggers."""
    for evo in node.get("evolves_to", []):
        name = evo.get("species", {}).get("name")
        if not name:
            continue

        details_list = evo.get("evolution_details", [])
        if not details_list:
            _walk_chain(evo, special)
            continue

        # Check ALL evolution methods for this species.
        # A Pokemon can have multiple methods (e.g., Slowking: trade OR use-item).
        # We use the "hardest" method to determine bonus.
        max_bonus = 0
        for d in details_list:
            trigger = d.get("trigger", {}).get("name", "")
            item = d.get("item")
            held = d.get("held_item")
            min_happiness = d.get("min_happiness")
            time_of_day = d.get("time_of_day", "")

            if trigger == "trade":
                if held:
                    # Trade with held item (Steelix, Slowking, etc.) - hardest
                    max_bonus = max(max_bonus, 8)
                else:
                    # Plain trade (Gengar, Alakazam, etc.) - between stone(2) and trade+item(8)
                    max_bonus = max(max_bonus, 5)
            elif trigger == "use-item" and item:
                # Evolution stone - relatively accessible
                max_bonus = max(max_bonus, 2)
            elif trigger == "level-up":
                # Check for extra conditions beyond just min_level
                if min_happiness:
                    max_bonus = max(max_bonus, 2)
                elif time_of_day:
                    max_bonus = max(max_bonus, 2)

        if max_bonus > 0:
            # Keep highest bonus if already recorded
            special[name] = max(special.get(name, 0), max_bonus)

        _walk_chain(evo, special)


def apply_evolution_constraint(pokemon_dict, evolution_chains, special_evo_names=None):
    """Enforce tier constraint: each stage at most +1 tier above pre-evolution.

    Pokemon with special evolution conditions (trade, item, etc.) are exempt.

    Modifies pokemon_dict in place.
    """
    if special_evo_names is None:
        special_evo_names = set()
    for chain_data in evolution_chains:
        stages = flatten_chain(chain_data)
        if len(stages) <= 1:
            continue

        for stage_idx in range(1, len(stages)):
            prev_tiers = []
            for name in stages[stage_idx - 1]:
                if name in pokemon_dict:
                    prev_tiers.append(pokemon_dict[name]["final_tier"])

            if not prev_tiers:
                continue

            max_prev_tier = max(prev_tiers)

            for name in stages[stage_idx]:
                if name not in pokemon_dict:
                    continue
                poke = pokemon_dict[name]

                if poke.get("is_legendary") or poke.get("is_mythical"):
                    continue

                # Floor: evolved form is at least as rare as pre-evolution
                if poke["final_tier"] < max_prev_tier:
                    poke["final_tier"] = max_prev_tier

                # Cap: at most +1 tier above pre-evolution
                # (special evolution Pokemon are exempt from cap)
                if name not in special_evo_names:
                    cap_tier = min(max_prev_tier + 1, 5)
                    if poke["final_tier"] > cap_tier:
                        poke["final_tier"] = cap_tier
