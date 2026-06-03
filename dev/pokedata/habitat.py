"""Habitat determination logic."""

from collections import Counter
import re

from .mappings import (
    AQUATIC_METHODS,
    EVENT_FIXED_LOCATION_KEYWORDS_TO_HABITAT,
    EVENT_FIXED_METHODS,
    LOCATION_TRUSTED_EVENT_FIXED_METHODS,
    LOCATION_KEYWORDS_TO_HABITAT,
    TYPE_TO_HABITAT,
    VERSION_TO_GENERATION,
    WALK_METHODS,
)


def determine_habitat(
    species_data,
    encounters,
    pokemon_types,
    location_details=None,
    return_details=False,
):
    """Determine habitat using event/fixed metadata plus fallback rules.

    Args:
        species_data: Response from /pokemon-species/{id}
        encounters: Response from /pokemon/{id}/encounters (list)
        pokemon_types: List of type name strings, e.g. ["grass", "poison"]
        location_details: Optional mapping of location-area name to fetched
            {"area": location-area, "location": location} metadata.
        return_details: If true, include audit metadata as a third value.

    Returns:
        tuple: (habitat_name, source), or (habitat_name, source, details)
    """
    details = {}

    # Tier 0: event/fixed encounter location metadata. This is only considered
    # for special methods such as only-one, roaming, gifts, and fixed triggers.
    event_habitat, event_details = _habitat_from_event_fixed_encounters(
        species_data,
        encounters,
        location_details or {},
    )
    details["event_fixed"] = event_details
    if event_habitat:
        return _result(event_habitat, "event-fixed", details, return_details)

    # Tier 1: Direct API habitat
    habitat_obj = species_data.get("habitat")
    if habitat_obj and habitat_obj.get("name"):
        habitat = habitat_obj["name"]
        # Check if aquatic-only encounters should override to waters-edge/sea
        override = _check_aquatic_override(encounters)
        if override:
            return _result(override, "encounter-override", details, return_details)
        return _result(habitat, "api", details, return_details)

    # Tier 2: Encounter location keyword matching
    if encounters:
        habitat = _habitat_from_encounters(encounters)
        if habitat:
            return _result(habitat, "encounter", details, return_details)

    # Tier 3: Type-based fallback
    habitat = _habitat_from_types(pokemon_types)
    return _result(habitat, "type", details, return_details)


def _result(habitat, source, details, return_details):
    if return_details:
        return habitat, source, details
    return habitat, source


def has_event_fixed_encounters(encounters):
    return bool(event_fixed_location_refs(encounters))


def event_fixed_location_refs(encounters):
    """Return unique location-area refs touched by event/fixed methods."""
    by_key = {}
    for loc, _version_detail, encounter_detail, method in _iter_encounter_details(encounters):
        if method not in EVENT_FIXED_METHODS:
            continue

        area = loc.get("location_area") or {}
        key = area.get("name") or area.get("url")
        if not key:
            continue

        entry = by_key.setdefault(
            key,
            {
                "name": area.get("name", ""),
                "url": area.get("url", ""),
                "methods": set(),
                "versions": set(),
                "generations": set(),
                "location_trusted": False,
            },
        )
        entry["methods"].add(method)
        version_name = (_version_detail.get("version") or {}).get("name", "")
        if version_name:
            entry["versions"].add(version_name)
            generation = VERSION_TO_GENERATION.get(version_name)
            if generation:
                entry["generations"].add(generation)
        if method in LOCATION_TRUSTED_EVENT_FIXED_METHODS:
            entry["location_trusted"] = True

    refs = []
    for entry in by_key.values():
        refs.append({
            "name": entry["name"],
            "url": entry["url"],
            "methods": sorted(entry["methods"]),
            "versions": sorted(entry["versions"]),
            "min_generation": min(entry["generations"]) if entry["generations"] else None,
            "location_trusted": entry["location_trusted"],
        })
    return refs


def _habitat_from_event_fixed_encounters(species_data, encounters, location_details):
    refs = event_fixed_location_refs(encounters)
    details = {
        "candidate": bool(refs),
        "selected_habitat": None,
        "decision": "no-event-fixed-encounter" if not refs else "no-match",
        "considered_generation": None,
        "allow_trusted_location": False,
        "habitat_counts": {},
        "locations": [],
    }
    if not refs:
        return None, details

    allow_trusted_location = bool(
        species_data.get("is_legendary") or species_data.get("is_mythical")
    )
    details["allow_trusted_location"] = allow_trusted_location
    known_generations = [ref["min_generation"] for ref in refs if ref.get("min_generation")]
    considered_generation = min(known_generations) if known_generations else None
    details["considered_generation"] = considered_generation

    habitat_counts = Counter()
    for ref in refs:
        considered = (
            considered_generation is None
            or ref.get("min_generation") == considered_generation
        )
        loc_detail = location_details.get(ref["name"]) or {}
        texts = _location_texts(ref, loc_detail)

        match = None
        if considered:
            match = _match_location_keywords(
                texts,
                EVENT_FIXED_LOCATION_KEYWORDS_TO_HABITAT,
                "special-location",
            )
            if not match and ref["location_trusted"] and allow_trusted_location:
                match = _match_location_keywords(
                    texts,
                    LOCATION_KEYWORDS_TO_HABITAT,
                    "trusted-location",
                )

        row = _location_audit_row(ref, loc_detail)
        row.update({
            "considered_for_decision": considered,
            "location_trusted": ref["location_trusted"],
            "matched_keyword": match["keyword"] if match else None,
            "matched_text": match["text"] if match else None,
            "match_source": match["source"] if match else None,
            "matched_habitat": match["habitat"] if match else None,
        })
        details["locations"].append(row)

        if match:
            habitat_counts[match["habitat"]] += 1

    details["habitat_counts"] = dict(sorted(habitat_counts.items()))
    if not habitat_counts:
        details["decision"] = "no-location-keyword-match"
        return None, details

    max_count = max(habitat_counts.values())
    tied = sorted(h for h, count in habitat_counts.items() if count == max_count)
    if len(tied) > 1:
        details["decision"] = "tie-fallback-to-existing"
        details["tied_habitats"] = tied
        return None, details

    habitat = tied[0]
    details["selected_habitat"] = habitat
    details["decision"] = "selected"
    return habitat, details


def _check_aquatic_override(encounters):
    """If Pokemon is ONLY encountered via fishing/surfing, override habitat."""
    if not encounters:
        return None

    all_methods = set()
    for loc in encounters:
        for vd in loc.get("version_details", []):
            for ed in vd.get("encounter_details", []):
                method = ed.get("method", {}).get("name", "")
                all_methods.add(method)

    if not all_methods:
        return None

    has_walk = bool(all_methods & WALK_METHODS)
    has_aquatic = bool(all_methods & AQUATIC_METHODS)

    if has_aquatic and not has_walk:
        # Determine sea vs waters-edge based on location names
        location_names = [loc.get("location_area", {}).get("name", "")
                          for loc in encounters]
        sea_keywords = {"sea", "ocean", "underwater", "marine", "dive"}
        for name in location_names:
            for kw in sea_keywords:
                if kw in name.lower():
                    return "sea"
        return "waters-edge"

    return None


def _habitat_from_encounters(encounters):
    """Map encounter location names to habitats via keyword matching."""
    habitat_counts = Counter()

    for loc in encounters:
        loc_name = loc.get("location_area", {}).get("name", "").lower()
        if not loc_name:
            continue

        matched = False
        # Check specific named locations first (longer keys tend to be more specific)
        for keyword, habitat in sorted(
            LOCATION_KEYWORDS_TO_HABITAT.items(), key=lambda x: -len(x[0])
        ):
            if keyword in loc_name:
                habitat_counts[habitat] += 1
                matched = True
                break

        if not matched:
            # Default: generic routes -> grassland
            if "route" in loc_name:
                habitat_counts["grassland"] += 1

    if not habitat_counts:
        return None

    # Find max count. Ties intentionally fall through to type fallback in
    # determine_habitat instead of using a global habitat priority.
    max_count = max(habitat_counts.values())
    tied = [h for h, c in habitat_counts.items() if c == max_count]

    if len(tied) == 1:
        return tied[0]

    return None


def _habitat_from_types(pokemon_types):
    """Fallback: determine habitat from primary type."""
    if not pokemon_types:
        return "grassland"

    primary = pokemon_types[0]

    # If primary is Normal and there's a secondary type, prefer secondary
    if primary == "normal" and len(pokemon_types) > 1:
        secondary = pokemon_types[1]
        if secondary in TYPE_TO_HABITAT:
            return TYPE_TO_HABITAT[secondary]

    return TYPE_TO_HABITAT.get(primary, "grassland")


def _iter_encounter_details(encounters):
    for loc in encounters or []:
        for version_detail in loc.get("version_details", []):
            for encounter_detail in version_detail.get("encounter_details", []):
                method = encounter_detail.get("method", {}).get("name", "")
                yield loc, version_detail, encounter_detail, method


def _location_texts(ref, loc_detail):
    area = loc_detail.get("area") or {}
    location = loc_detail.get("location") or {}
    values = [
        ref.get("name", ""),
        area.get("name", ""),
        location.get("name", ""),
        (location.get("region") or {}).get("name", ""),
    ]
    values.extend(_localized_names(area))
    values.extend(_localized_names(location))
    return [value for value in values if value]


def _localized_names(data):
    values = []
    for row in data.get("names", []) if data else []:
        name = row.get("name")
        if name:
            values.append(name)
    return values


def _match_location_keywords(texts, keyword_map, source):
    normalized_texts = [(text, _normalize_text(text)) for text in texts]
    for keyword, habitat in sorted(keyword_map.items(), key=lambda item: -len(item[0])):
        normalized_keyword = _normalize_text(keyword)
        for original, normalized in normalized_texts:
            if normalized_keyword in normalized:
                return {
                    "keyword": keyword,
                    "text": original,
                    "source": source,
                    "habitat": habitat,
                }
    return None


def _location_audit_row(ref, loc_detail):
    area = loc_detail.get("area") or {}
    location = loc_detail.get("location") or {}
    return {
        "area_name": area.get("name") or ref.get("name", ""),
        "area_url": ref.get("url", ""),
        "area_display_names": _localized_names(area),
        "location_name": location.get("name", ""),
        "location_display_names": _localized_names(location),
        "region": (location.get("region") or {}).get("name", ""),
        "methods": ref.get("methods", []),
        "versions": ref.get("versions", []),
        "min_generation": ref.get("min_generation"),
    }


def _normalize_text(value):
    normalized = re.sub(r"[^a-z0-9]+", "-", str(value).lower())
    return normalized.strip("-")
