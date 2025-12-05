import json
import random
from pathlib import Path
from typing import Dict, List, Sequence, Tuple

DATA_DIR = Path(__file__).resolve().parent / "data"


def _load_json(name: str):
    with open(DATA_DIR / name, "r", encoding="utf-8") as handle:
        return json.load(handle)


def _allocate(values: Sequence[str], pool: int, base: int, cap: int) -> Dict[str, int]:
    """Allocate points across a list of values while respecting a cap."""
    allocation = {val: base for val in values}
    remaining = pool
    candidates = list(values)
    while remaining > 0 and candidates:
        pick = random.choice(candidates)
        if allocation[pick] < cap:
            allocation[pick] += 1
            remaining -= 1
        else:
            # remove maxed-out choices to avoid infinite loops
            candidates = [v for v in candidates if allocation[v] < cap]
    return allocation


def _allocate_grouped(
    groups: Dict[str, List[str]], pools: Sequence[int], base: int, cap: int
) -> Dict[str, Dict[str, int]]:
    """Randomly order the groups, then apply pools in that order."""
    ordered_groups = list(groups.keys())
    random.shuffle(ordered_groups)
    allocation: Dict[str, Dict[str, int]] = {}
    for pool, group_name in zip(pools, ordered_groups):
        allocation[group_name] = _allocate(groups[group_name], pool, base, cap)
    return allocation


def generate_character(selected_clan: str | None = None, seed: int | None = None) -> Dict:
    """
    Generate a V20 character based on JSON rules.

    - Base 1 in attributes, 7/5/3 pools across Physical/Social/Mental (random priority)
    - Abilities at 0 base, 13/9/5 pools across Talents/Skills/Knowledges (random priority), cap 3
    - 3 Discipline dots among clan disciplines plus universal disciplines
    - Virtues start at 1, add 7 dots, Humanity = Conscience + Self-Control, Willpower = Courage
    """
    if seed is not None:
        random.seed(seed)

    clans: List[Dict] = _load_json("clans.json")
    attributes: Dict[str, List[str]] = _load_json("attributes.json")
    abilities: Dict[str, List[str]] = _load_json("abilities.json")
    virtues: List[str] = _load_json("virtues.json")
    rules: Dict = _load_json("rules.json")

    clan = selected_clan or random.choice(clans)["name"]
    clan_info = next((c for c in clans if c["name"] == clan), None)
    if not clan_info:
        raise ValueError(f"Clan '{clan}' not found.")

    # Attributes and abilities
    attribute_alloc = _allocate_grouped(
        attributes,
        rules["attribute_pools"],
        rules["attribute_base"],
        rules["attribute_caps"],
    )
    ability_alloc = _allocate_grouped(
        abilities,
        rules["ability_pools"],
        rules["ability_base"],
        rules["ability_caps"],
    )

    # Disciplines
    all_clan_disciplines = {
        d for c in clans for d in c.get("disciplines", [])
    }
    available_disciplines_set = set(rules["universal_disciplines"])
    available_disciplines_set.update(
        clan_info.get("disciplines", [])
    )
    # Caitiff: access to all disciplines except Thaumaturgy and Necromancy
    if clan_info["name"].lower() == "caitiff":
        available_disciplines_set = {
            d for d in all_clan_disciplines.union(rules["universal_disciplines"])
            if d.lower() not in {"thaumaturgy", "necromancy"}
        }
    available_disciplines = sorted(available_disciplines_set)
    discipline_alloc = {name: 0 for name in available_disciplines}
    remaining = rules["discipline_pool"]
    candidates = list(available_disciplines)
    while remaining > 0 and candidates:
        pick = random.choice(candidates)
        if discipline_alloc[pick] < rules["discipline_caps"]:
            discipline_alloc[pick] += 1
            remaining -= 1
        else:
            candidates = [d for d in candidates if discipline_alloc[d] < rules["discipline_caps"]]

    # Virtues
    virtue_alloc = {v: rules["virtue_base"] for v in virtues}
    remaining_virtue = rules["virtue_pool"]
    while remaining_virtue > 0:
        pick = random.choice(virtues)
        if virtue_alloc[pick] < rules["virtue_caps"]:
            virtue_alloc[pick] += 1
            remaining_virtue -= 1

    humanity = virtue_alloc["Conscience"] + virtue_alloc["Self-Control"]
    willpower = virtue_alloc["Courage"]

    return {
        "clan": clan_info["name"],
        "weakness": clan_info.get("weakness", ""),
        "attributes": attribute_alloc,
        "abilities": ability_alloc,
        "disciplines": discipline_alloc,
        "virtues": virtue_alloc,
        "humanity": humanity,
        "willpower": willpower,
        "source": clan_info.get("source", ""),
    }


if __name__ == "__main__":
    character = generate_character()
    print(json.dumps(character, indent=2))

