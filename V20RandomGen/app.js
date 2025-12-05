const dataPaths = {
  clans: "data/clans.json",
  attributes: "data/attributes.json",
  abilities: "data/abilities.json",
  virtues: "data/virtues.json",
  rules: "data/rules.json",
};

const state = {
  clans: [],
  attributes: {},
  abilities: {},
  virtues: [],
  rules: {},
  lastCharacter: null,
};

const clanSelect = document.getElementById("clan-select");
const outputArea = document.getElementById("output-area");
const generateBtn = document.getElementById("generate-btn");
const downloadBtn = document.getElementById("download-btn");

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function allocate(values, pool, base, cap) {
  const alloc = {};
  values.forEach((val) => {
    alloc[val] = base;
  });
  let remaining = pool;
  let candidates = [...values];
  while (remaining > 0 && candidates.length > 0) {
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    if (alloc[pick] < cap) {
      alloc[pick] += 1;
      remaining -= 1;
    } else {
      candidates = candidates.filter((v) => alloc[v] < cap);
    }
  }
  return alloc;
}

function allocateGrouped(groups, pools, base, cap) {
  const order = shuffle(Object.keys(groups));
  const result = {};
  order.forEach((groupName, idx) => {
    result[groupName] = allocate(groups[groupName], pools[idx], base, cap);
  });
  return result;
}

function pickClan(name) {
  if (name) {
    const found = state.clans.find((c) => c.name === name);
    if (found) return found;
  }
  return state.clans[Math.floor(Math.random() * state.clans.length)];
}

function generateCharacter(selectedClan) {
  const { rules, virtues } = state;
  const clan = pickClan(selectedClan);

  const attributes = allocateGrouped(
    state.attributes,
    rules.attribute_pools,
    rules.attribute_base,
    rules.attribute_caps
  );

  const abilities = allocateGrouped(
    state.abilities,
    rules.ability_pools,
    rules.ability_base,
    rules.ability_caps
  );

  const allClanDisciplines = new Set(
    state.clans.flatMap((c) => c.disciplines || [])
  );
  let availableDisciplinesSet = new Set([
    ...clan.disciplines,
    ...rules.universal_disciplines,
  ]);
  if (clan.name.toLowerCase() === "caitiff") {
    availableDisciplinesSet = new Set(
      [...allClanDisciplines, ...rules.universal_disciplines].filter(
        (d) => !["thaumaturgy", "necromancy"].includes(d.toLowerCase())
      )
    );
  }
  const availableDisciplines = Array.from(availableDisciplinesSet).sort();
  const disciplines = Object.fromEntries(availableDisciplines.map((d) => [d, 0]));
  let remaining = rules.discipline_pool;
  let candidates = [...availableDisciplines];
  while (remaining > 0 && candidates.length > 0) {
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    if (disciplines[pick] < rules.discipline_caps) {
      disciplines[pick] += 1;
      remaining -= 1;
    } else {
      candidates = candidates.filter((d) => disciplines[d] < rules.discipline_caps);
    }
  }

  const virtueAlloc = {};
  virtues.forEach((v) => {
    virtueAlloc[v] = rules.virtue_base;
  });
  let virtuePool = rules.virtue_pool;
  while (virtuePool > 0) {
    const pick = virtues[Math.floor(Math.random() * virtues.length)];
    if (virtueAlloc[pick] < rules.virtue_caps) {
      virtueAlloc[pick] += 1;
      virtuePool -= 1;
    }
  }

  const humanity = virtueAlloc.Conscience + virtueAlloc["Self-Control"];
  const willpower = virtueAlloc.Courage;

  state.lastCharacter = {
    clan: clan.name,
    weakness: clan.weakness,
    source: clan.source,
    attributes,
    abilities,
    disciplines,
    virtues: virtueAlloc,
    humanity,
    willpower,
  };
  return state.lastCharacter;
}

function renderCharacter(character) {
  if (!character) return;
  const sections = [];
  sections.push(`Clan: ${character.clan}`);
  if (character.source) sections.push(`Source: ${character.source}`);
  sections.push(`Weakness: ${character.weakness}`);

  const formatBlock = (label, block) => {
    const parts = Object.entries(block)
      .map(([key, val]) => {
        if (typeof val === "object") {
          const inner = Object.entries(val)
            .map(([innerKey, innerVal]) => `${innerKey}: ${innerVal}`)
            .join(", ");
          return `${key}: ${inner}`;
        }
        return `${key}: ${val}`;
      })
      .join("\n  ");
    return `${label}\n  ${parts}`;
  };

  sections.push(formatBlock("Attributes", character.attributes));
  sections.push(formatBlock("Abilities", character.abilities));
  sections.push(formatBlock("Disciplines", character.disciplines));
  sections.push(formatBlock("Virtues", character.virtues));
  sections.push(`Humanity: ${character.humanity}`);
  sections.push(`Willpower: ${character.willpower}`);

  outputArea.textContent = sections.join("\n\n");
  downloadBtn.disabled = false;
}

function downloadTxt() {
  if (!state.lastCharacter) return;
  const blob = new Blob([outputArea.textContent], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${state.lastCharacter.clan.replace(/\s+/g, "_")}_v20_character.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function loadData() {
  const [clans, attributes, abilities, virtues, rules] = await Promise.all(
    Object.values(dataPaths).map((path) => fetch(path).then((r) => r.json()))
  );
  state.clans = clans;
  state.attributes = attributes;
  state.abilities = abilities;
  state.virtues = virtues;
  state.rules = rules;

  // Populate the dropdown
  clanSelect.innerHTML = "";
  state.clans.forEach((clan) => {
    const option = document.createElement("option");
    option.value = clan.name;
    option.textContent = clan.name;
    clanSelect.appendChild(option);
  });
}

generateBtn.addEventListener("click", () => {
  const selected = clanSelect.value;
  const character = generateCharacter(selected);
  renderCharacter(character);
});

downloadBtn.addEventListener("click", downloadTxt);

loadData()
  .then(() => {
    outputArea.textContent = "Data loaded. Pick a clan and click Generate.";
  })
  .catch((err) => {
    outputArea.textContent = `Failed to load data: ${err}`;
    downloadBtn.disabled = true;
    generateBtn.disabled = true;
  });

