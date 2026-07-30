import type { InsertMonsterSpecies } from "@workspace/db";

// ═══════════════════════════════════════════════════════════════════════════════
//  MYTHORA — Myth Species Catalogue  v3
//  5 Elements × 5 Myths = 25 total
//  Per element: C×2 · B×1 · A×1 · S×1
//  Skills per myth: 2 normal attacks + 1 ultimate (3 total)
// ═══════════════════════════════════════════════════════════════════════════════

export const MONSTER_SEED_DATA: InsertMonsterSpecies[] = [

  // ══════════════════════════════════════════════════════════════════════════
  //  FIRE  ·  2C · 1B · 1A · 1S
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: "emberpup", name: "Emberpup", element: "Fire", rarity: "C",
    baseHp: 45, baseAttack: 40, baseDefense: 34, baseSpeed: 50,
    description: "A scrappy wolf pup with ember-tipped paws. Always looking for a fight.",
    lore: "Emberpups form small packs near lava fields. Their paws leave scorch marks on stone, making them easy to track.",
    personality: "Aggressive", weight: 4.8, height: 0.4, captureRate: 88,
    evolutionFromId: null, evolutionToId: null, evolutionLevel: null,
    skills: [
      { name: "Ember Bite",    type: "normal",   element: "Fire", power: 42, accuracy: 97, description: "Lunges forward with flaming jaws, slamming into the target." },
      { name: "Paw Slam",      type: "skill1",   element: "Fire", power: 62, accuracy: 90, description: "Leaps up and drives ember-coated paws down with crushing force." },
      { name: "Inferno Howl",  type: "ultimate", element: "Fire", power: 125, accuracy: 75, description: "Unleashes a shockwave howl that ignites the air in a burst ring." },
    ],
    regionIds: ["volcanic-rift", "scorched-wastes"],
  },

  {
    id: "cinderclaw", name: "Cinderclaw", element: "Fire", rarity: "C",
    baseHp: 42, baseAttack: 46, baseDefense: 30, baseSpeed: 56,
    description: "A sleek fire cat with retractable claws that glow like hot coals.",
    lore: "Cinderclaws are nocturnal hunters. Their glowing claws serve as lures in the dark, attracting prey before a deadly pounce.",
    personality: "Cunning", weight: 3.6, height: 0.35, captureRate: 85,
    evolutionFromId: null, evolutionToId: null, evolutionLevel: null,
    skills: [
      { name: "Cinder Rake",   type: "normal",   element: "Fire", power: 44, accuracy: 96, description: "Dashes sideways and rakes burning claws across the target." },
      { name: "Heat Pounce",   type: "skill1",   element: "Fire", power: 64, accuracy: 89, description: "Coils back then rockets forward, hitting with explosive force." },
      { name: "Magma Surge",   type: "ultimate", element: "Fire", power: 128, accuracy: 73, description: "Spins at terrifying speed, launching a spiral of magma shards outward." },
    ],
    regionIds: ["volcanic-rift", "scorched-wastes"],
  },

  {
    id: "flamewing", name: "Flamewing", element: "Fire", rarity: "B",
    baseHp: 65, baseAttack: 64, baseDefense: 52, baseSpeed: 68,
    description: "A hawk whose wings trail living flame. Its dive-bombs can melt stone.",
    lore: "Flamewings migrate toward erupting volcanoes and have been known to nest inside lava tubes.",
    personality: "Bold", weight: 8.2, height: 0.9, captureRate: 60,
    evolutionFromId: null, evolutionToId: null, evolutionLevel: null,
    skills: [
      { name: "Wing Slash",    type: "normal",   element: "Fire", power: 58, accuracy: 94, description: "Swoops low and slices with razor-edged burning wings." },
      { name: "Ember Dive",    type: "skill1",   element: "Fire", power: 76, accuracy: 87, description: "Climbs high then plummets like a comet, exploding on impact." },
      { name: "Phoenix Strike",type: "ultimate", element: "Fire", power: 138, accuracy: 72, description: "Wraps body in white-hot fire and detonates in a phoenix-shaped burst." },
    ],
    regionIds: ["volcanic-rift", "scorched-wastes"],
  },

  {
    id: "magmahorn", name: "Magmahorn", element: "Fire", rarity: "A",
    baseHp: 92, baseAttack: 86, baseDefense: 84, baseSpeed: 68,
    description: "A armored rhino with a magma-filled horn that cracks the earth on charge.",
    lore: "Magmahorns charge at 80 km/h. The resulting impact cracks bedrock and can start wildfires miles away.",
    personality: "Fearless", weight: 280.0, height: 1.8, captureRate: 35,
    evolutionFromId: null, evolutionToId: null, evolutionLevel: null,
    skills: [
      { name: "Horn Charge",   type: "normal",   element: "Fire", power: 72, accuracy: 92, description: "Lowers head and charges at full force, the magma horn cracking the ground on impact." },
      { name: "Magma Stomp",   type: "skill1",   element: "Fire", power: 88, accuracy: 84, description: "Rears up and slams both forefeet, sending a shockwave of molten rock." },
      { name: "Volcanic Slam", type: "ultimate", element: "Fire", power: 150, accuracy: 70, description: "Builds explosive pressure in its horn and detonates it in a column of lava." },
    ],
    regionIds: ["volcanic-rift", "scorched-wastes"],
  },

  {
    id: "pyredrake", name: "Pyredrake", element: "Fire", rarity: "S",
    baseHp: 122, baseAttack: 118, baseDefense: 102, baseSpeed: 96,
    description: "An ancient dragon whose breath has never cooled. Its roar flattens mountains.",
    lore: "Pyredrakes are mythological catalysts — wherever one dwells, volcanic activity increases for a century.",
    personality: "Dominating", weight: 1800.0, height: 8.5, captureRate: 12,
    evolutionFromId: null, evolutionToId: null, evolutionLevel: null,
    skills: [
      { name: "Dragon Bite",   type: "normal",   element: "Fire", power: 88, accuracy: 94, description: "Snaps jaws superheated to 3000°C, melting whatever it touches." },
      { name: "Fire Breath",   type: "skill1",   element: "Fire", power: 105, accuracy: 86, description: "Exhales a focused beam of dragonfire that curves toward the target." },
      { name: "Pyroclasm",     type: "ultimate", element: "Fire", power: 168, accuracy: 68, description: "Rears skyward and calls down a cataclysmic eruption centered on the enemy." },
    ],
    regionIds: ["volcanic-rift", "scorched-wastes"],
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  WATER  ·  2C · 1B · 1A · 1S
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: "bubblefin", name: "Bubblefin", element: "Water", rarity: "C",
    baseHp: 48, baseAttack: 36, baseDefense: 44, baseSpeed: 48,
    description: "A pudgy fish surrounded by bouncing bubbles that pop with surprising force.",
    lore: "Bubblefins inflate their bubble auras when threatened. The exploding bubbles can fracture stone.",
    personality: "Cheerful", weight: 2.1, height: 0.25, captureRate: 90,
    evolutionFromId: null, evolutionToId: null, evolutionLevel: null,
    skills: [
      { name: "Bubble Shot",   type: "normal",   element: "Water", power: 40, accuracy: 98, description: "Fires a pressurized bubble that bursts on contact with stunning force." },
      { name: "Water Spin",    type: "skill1",   element: "Water", power: 60, accuracy: 91, description: "Rotates rapidly, launching a ring of razor-edged water in all directions." },
      { name: "Tidal Crash",   type: "ultimate", element: "Water", power: 122, accuracy: 76, description: "Summons a towering wall of water and hurls it down with crushing pressure." },
    ],
    regionIds: ["ocean-ruins", "deep-current"],
  },

  {
    id: "wavecrest", name: "Wavecrest", element: "Water", rarity: "C",
    baseHp: 52, baseAttack: 38, baseDefense: 48, baseSpeed: 44,
    description: "A compact turtle whose shell creates powerful wake when spinning.",
    lore: "Wavecrests retract into their shells and spin at hurricane speeds to attack. Their shells are the hardest natural material known.",
    personality: "Steady", weight: 12.0, height: 0.45, captureRate: 86,
    evolutionFromId: null, evolutionToId: null, evolutionLevel: null,
    skills: [
      { name: "Shell Smash",   type: "normal",   element: "Water", power: 44, accuracy: 95, description: "Retracts and launches shell-first at full speed, hammering the target." },
      { name: "Water Pulse",   type: "skill1",   element: "Water", power: 62, accuracy: 90, description: "Fires a pulsing wave of pressurized water that staggers the opponent." },
      { name: "Tidal Wave",    type: "ultimate", element: "Water", power: 126, accuracy: 74, description: "Channels the tide and releases a colossal cresting wave." },
    ],
    regionIds: ["ocean-ruins", "deep-current"],
  },

  {
    id: "tidalwing", name: "Tidalwing", element: "Water", rarity: "B",
    baseHp: 62, baseAttack: 58, baseDefense: 56, baseSpeed: 70,
    description: "A graceful manta ray that glides at wave height, striking with fin blades.",
    lore: "Tidalwings can leap from water and glide for kilometers. Their fin edges can cut steel.",
    personality: "Graceful", weight: 42.0, height: 1.4, captureRate: 58,
    evolutionFromId: null, evolutionToId: null, evolutionLevel: null,
    skills: [
      { name: "Fin Sweep",     type: "normal",   element: "Water", power: 56, accuracy: 94, description: "Glides low and scythes through with both wing-fins in a wide arc." },
      { name: "Water Jet",     type: "skill1",   element: "Water", power: 74, accuracy: 87, description: "Pressurizes water internally then releases it as a hyper-velocity jet." },
      { name: "Ocean Surge",   type: "ultimate", element: "Water", power: 140, accuracy: 71, description: "Calls upon deep ocean pressure and releases it in a spiraling detonation." },
    ],
    regionIds: ["ocean-ruins", "deep-current"],
  },

  {
    id: "deepfang", name: "Deepfang", element: "Water", rarity: "A",
    baseHp: 86, baseAttack: 82, baseDefense: 76, baseSpeed: 84,
    description: "A serpent from abyssal depths whose coils can crush a ship's hull.",
    lore: "Deepfangs are almost never seen on the surface. Sailors consider a sighting the worst of omens.",
    personality: "Ancient", weight: 620.0, height: 6.5, captureRate: 32,
    evolutionFromId: null, evolutionToId: null, evolutionLevel: null,
    skills: [
      { name: "Fang Strike",   type: "normal",   element: "Water", power: 70, accuracy: 93, description: "Strikes with venom-coated fangs, the impact sending a shockwave of water." },
      { name: "Current Coil",  type: "skill1",   element: "Water", power: 86, accuracy: 84, description: "Wraps the target in coils riding a powerful current, crushing with momentum." },
      { name: "Abyss Torrent", type: "ultimate", element: "Water", power: 152, accuracy: 70, description: "Opens an abyssal rift and unleashes pressurized water from the ocean floor." },
    ],
    regionIds: ["ocean-ruins", "deep-current"],
  },

  {
    id: "abyssalord", name: "Abyssalord", element: "Water", rarity: "S",
    baseHp: 128, baseAttack: 110, baseDefense: 114, baseSpeed: 88,
    description: "A leviathan of legend. Its body spans the width of a city, and its roar creates tsunamis.",
    lore: "Abyssalords are believed to be the original source of all water in the world.",
    personality: "Eternal", weight: 98000.0, height: 45.0, captureRate: 10,
    evolutionFromId: null, evolutionToId: null, evolutionLevel: null,
    skills: [
      { name: "Crushing Bite",   type: "normal",   element: "Water", power: 90, accuracy: 93, description: "Clamps down with jaws that generate ten thousand atmospheres of pressure." },
      { name: "Hydro Pulse",     type: "skill1",   element: "Water", power: 108, accuracy: 85, description: "Radiates a catastrophic pulse of focused water pressure." },
      { name: "Leviathan's Maw", type: "ultimate", element: "Water", power: 172, accuracy: 66, description: "Opens impossibly wide and swallows the battlefield in a dimensional tide." },
    ],
    regionIds: ["ocean-ruins", "deep-current"],
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  EARTH  ·  2C · 1B · 1A · 1S
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: "pebbleback", name: "Pebbleback", element: "Earth", rarity: "C",
    baseHp: 54, baseAttack: 34, baseDefense: 52, baseSpeed: 38,
    description: "A slow but ironclad tortoise with a mossy shell encrusted with boulders.",
    lore: "Pebblebacks are said to carry centuries of history on their shells. Each embedded stone tells a story.",
    personality: "Patient", weight: 28.0, height: 0.5, captureRate: 88,
    evolutionFromId: null, evolutionToId: null, evolutionLevel: null,
    skills: [
      { name: "Shell Bash",    type: "normal",   element: "Earth", power: 42, accuracy: 96, description: "Charges headlong, ramming its boulder-studded shell into the target." },
      { name: "Rock Toss",     type: "skill1",   element: "Earth", power: 60, accuracy: 90, description: "Flings a massive chunk of embedded rock with surprising velocity." },
      { name: "Stone Crush",   type: "ultimate", element: "Earth", power: 122, accuracy: 76, description: "Calls boulders from the earth and drops them in a cascading avalanche." },
    ],
    regionIds: ["ancient-forest", "verdant-meadows"],
  },

  {
    id: "thornbriar", name: "Thornbriar", element: "Earth", rarity: "C",
    baseHp: 46, baseAttack: 44, baseDefense: 38, baseSpeed: 50,
    description: "A swift plant creature with razor thorns that can grow in an instant.",
    lore: "Thornbriars scatter their thorns and regrow them within seconds. Forests where they live are nearly impenetrable.",
    personality: "Wild", weight: 3.4, height: 0.55, captureRate: 86,
    evolutionFromId: null, evolutionToId: null, evolutionLevel: null,
    skills: [
      { name: "Thorn Whip",    type: "normal",   element: "Earth", power: 44, accuracy: 96, description: "Lashes out with a barbed vine whip that cracks with earth energy." },
      { name: "Root Strike",   type: "skill1",   element: "Earth", power: 64, accuracy: 89, description: "Drives hardened root spears from the ground under the target's feet." },
      { name: "Briar Storm",   type: "ultimate", element: "Earth", power: 128, accuracy: 73, description: "Explodes in a cyclone of razor thorns and living vines." },
    ],
    regionIds: ["ancient-forest", "verdant-meadows"],
  },

  {
    id: "graniteclaw", name: "Graniteclaw", element: "Earth", rarity: "B",
    baseHp: 74, baseAttack: 62, baseDefense: 70, baseSpeed: 52,
    description: "A massive bear with granite-plated hide. Its roar shakes mountains.",
    lore: "Graniteclaws hibernate for 50-year cycles. When they wake, the resulting earthquakes reshape valleys.",
    personality: "Powerful", weight: 340.0, height: 2.2, captureRate: 55,
    evolutionFromId: null, evolutionToId: null, evolutionLevel: null,
    skills: [
      { name: "Claw Swipe",    type: "normal",   element: "Earth", power: 58, accuracy: 93, description: "Swipes with granite-edged claws in a sweeping arc that carves the ground." },
      { name: "Boulder Slam",  type: "skill1",   element: "Earth", power: 78, accuracy: 86, description: "Leaps high and crashes down, raising a shockwave of debris." },
      { name: "Earthshatter",  type: "ultimate", element: "Earth", power: 142, accuracy: 70, description: "Slams the ground with its full weight, splitting the earth in all directions." },
    ],
    regionIds: ["ancient-forest", "verdant-meadows"],
  },

  {
    id: "crystalhorn", name: "Crystalhorn", element: "Earth", rarity: "A",
    baseHp: 84, baseAttack: 84, baseDefense: 74, baseSpeed: 80,
    description: "A magnificent unicorn with a crystal horn that focuses earth energy into beams.",
    lore: "Crystalhorn horns are called 'earth prisms.' They refract the planet's magnetic field into concentrated power.",
    personality: "Majestic", weight: 210.0, height: 1.7, captureRate: 30,
    evolutionFromId: null, evolutionToId: null, evolutionLevel: null,
    skills: [
      { name: "Horn Pierce",      type: "normal",   element: "Earth", power: 70, accuracy: 92, description: "Charges and drives its crystalline horn into the target, sending shockwaves through solid ground." },
      { name: "Crystal Barrage",  type: "skill1",   element: "Earth", power: 86, accuracy: 84, description: "Shatters crystals into shards that orbit and bombard the enemy." },
      { name: "Gemstone Nova",    type: "ultimate", element: "Earth", power: 150, accuracy: 70, description: "Focuses the planet's energy through its horn and releases a nova of pure crystal energy." },
    ],
    regionIds: ["ancient-forest", "verdant-meadows"],
  },

  {
    id: "terravast", name: "Terravast", element: "Earth", rarity: "S",
    baseHp: 132, baseAttack: 108, baseDefense: 120, baseSpeed: 82,
    description: "A living mountain golem. When it walks, continents drift.",
    lore: "Ancient maps show Terravasts as geographical landmarks. Scholars believe they shaped the world's current landmasses.",
    personality: "Primordial", weight: 450000.0, height: 22.0, captureRate: 8,
    evolutionFromId: null, evolutionToId: null, evolutionLevel: null,
    skills: [
      { name: "Fist Slam",     type: "normal",   element: "Earth", power: 88, accuracy: 92, description: "Raises a mountain-sized fist and drops it with continental force." },
      { name: "Seismic Stomp", type: "skill1",   element: "Earth", power: 106, accuracy: 84, description: "Takes one step, generating a magnitude-9 shockwave in every direction." },
      { name: "World Breaker", type: "ultimate", element: "Earth", power: 175, accuracy: 65, description: "Draws up tectonic power and releases it in a catastrophic ground-splitting explosion." },
    ],
    regionIds: ["ancient-forest", "verdant-meadows"],
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  STORM  ·  2C · 1B · 1A · 1S
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: "zappet", name: "Zappet", element: "Storm", rarity: "C",
    baseHp: 40, baseAttack: 44, baseDefense: 30, baseSpeed: 62,
    description: "A hyperactive rabbit crackling with static. It moves in lightning-fast hops.",
    lore: "Zappets generate enough static in a single sprint to power a town. Trainers use them as portable generators.",
    personality: "Restless", weight: 1.8, height: 0.28, captureRate: 90,
    evolutionFromId: null, evolutionToId: null, evolutionLevel: null,
    skills: [
      { name: "Static Bite",   type: "normal",   element: "Storm", power: 42, accuracy: 98, description: "Leaps and chomps while discharging stored static in a burst of sparks." },
      { name: "Thunder Hop",   type: "skill1",   element: "Storm", power: 62, accuracy: 91, description: "Bounces off the air at impossibly high speed and crashes down with thunder." },
      { name: "Lightning Burst",type: "ultimate", element: "Storm", power: 126, accuracy: 75, description: "Compresses all stored electricity into one instant, detonating in a lightning cage." },
    ],
    regionIds: ["thunder-valley", "storm-peaks"],
  },

  {
    id: "galecub", name: "Galecub", element: "Storm", rarity: "C",
    baseHp: 44, baseAttack: 46, baseDefense: 32, baseSpeed: 60,
    description: "A nimble fox that runs so fast it becomes a blur of wind and lightning.",
    lore: "Galecubs are impossible to catch by hand. Trainers use electromagnetic traps — their speed bends light.",
    personality: "Cunning", weight: 3.2, height: 0.38, captureRate: 87,
    evolutionFromId: null, evolutionToId: null, evolutionLevel: null,
    skills: [
      { name: "Wind Slash",    type: "normal",   element: "Storm", power: 44, accuracy: 96, description: "Accelerates to gale speed and slashes with wind-compressed claws." },
      { name: "Static Dash",   type: "skill1",   element: "Storm", power: 64, accuracy: 89, description: "Vanishes in a blur and reappears behind the target with a thunder strike." },
      { name: "Cyclone Strike",type: "ultimate", element: "Storm", power: 130, accuracy: 73, description: "Becomes a living cyclone and detonates outward in all directions." },
    ],
    regionIds: ["thunder-valley", "storm-peaks"],
  },

  {
    id: "thunderwing", name: "Thunderwing", element: "Storm", rarity: "B",
    baseHp: 62, baseAttack: 66, baseDefense: 50, baseSpeed: 74,
    description: "A storm hawk with wings that crackle with constant lightning.",
    lore: "Thunderwings fly inside storm cells for weeks. Their wingtips permanently ionize the air around them.",
    personality: "Fierce", weight: 12.5, height: 1.0, captureRate: 56,
    evolutionFromId: null, evolutionToId: null, evolutionLevel: null,
    skills: [
      { name: "Talon Strike",  type: "normal",   element: "Storm", power: 58, accuracy: 94, description: "Stoops from altitude and tears through with electricity-charged talons." },
      { name: "Thunder Dive",  type: "skill1",   element: "Storm", power: 78, accuracy: 86, description: "Folds wings and dives like a living bolt, detonating on impact." },
      { name: "Storm Frenzy",  type: "ultimate", element: "Storm", power: 142, accuracy: 71, description: "Enters a storm frenzy, unleashing continuous lightning strikes in rapid succession." },
    ],
    regionIds: ["thunder-valley", "storm-peaks"],
  },

  {
    id: "stormcrown", name: "Stormcrown", element: "Storm", rarity: "A",
    baseHp: 90, baseAttack: 90, baseDefense: 74, baseSpeed: 86,
    description: "A lion whose mane is a permanent storm cloud, throwing lightning at will.",
    lore: "Stormcrowns are worshipped as storm deities. A sleeping Stormcrown is the origin of many thunderstorms.",
    personality: "Regal", weight: 280.0, height: 1.9, captureRate: 28,
    evolutionFromId: null, evolutionToId: null, evolutionLevel: null,
    skills: [
      { name: "Thunder Roar",  type: "normal",   element: "Storm", power: 72, accuracy: 92, description: "Roars with the force of a thunderclap, sending an electrified shockwave." },
      { name: "Lightning Pounce",type: "skill1", element: "Storm", power: 88, accuracy: 83, description: "Becomes a bolt of lightning and pounces, slamming with electric force." },
      { name: "Tempest Wrath", type: "ultimate", element: "Storm", power: 154, accuracy: 69, description: "Calls the full tempest and releases it in an electrifying omnidirectional explosion." },
    ],
    regionIds: ["thunder-valley", "storm-peaks"],
  },

  {
    id: "vortexwyrm", name: "Vortexwyrm", element: "Storm", rarity: "S",
    baseHp: 118, baseAttack: 120, baseDefense: 94, baseSpeed: 112,
    description: "A storm dragon that exists as pure wind and lightning. It has never been seen fully still.",
    lore: "Vortexwyrms are said to be born from the intersection of three simultaneous storms. No one has ever found one sleeping.",
    personality: "Untameable", weight: 0.0, height: 12.0, captureRate: 8,
    evolutionFromId: null, evolutionToId: null, evolutionLevel: null,
    skills: [
      { name: "Wind Fang",        type: "normal",   element: "Storm", power: 90, accuracy: 93, description: "Materializes from the wind and bites down with jaws made of compressed cyclone force." },
      { name: "Vortex Slam",      type: "skill1",   element: "Storm", power: 108, accuracy: 85, description: "Becomes a vortex and slams its full mass into the target, reversing gravity locally." },
      { name: "Hurricane Annihilation", type: "ultimate", element: "Storm", power: 172, accuracy: 65, description: "Creates a sustained hurricane and channels all its energy into one annihilating strike." },
    ],
    regionIds: ["thunder-valley", "storm-peaks"],
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  SHADOW  ·  2C · 1B · 1A · 1S
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: "gloomite", name: "Gloomite", element: "Shadow", rarity: "C",
    baseHp: 42, baseAttack: 44, baseDefense: 32, baseSpeed: 54,
    description: "A sprite-like creature that feeds on light, leaving trails of absolute darkness.",
    lore: "Gloomites extinguish torches by passing through them. In large numbers they can black out entire towns.",
    personality: "Mischievous", weight: 0.4, height: 0.3, captureRate: 88,
    evolutionFromId: null, evolutionToId: null, evolutionLevel: null,
    skills: [
      { name: "Shadow Claw",   type: "normal",   element: "Shadow", power: 42, accuracy: 97, description: "Slashes with claws made of solidified darkness that negate light on contact." },
      { name: "Dark Pulse",    type: "skill1",   element: "Shadow", power: 62, accuracy: 90, description: "Emits a wave of dark energy that crushes reality between two points." },
      { name: "Void Burst",    type: "ultimate", element: "Shadow", power: 124, accuracy: 75, description: "Tears open a pocket void and pulls everything into it before collapsing." },
    ],
    regionIds: ["shadow-marsh", "void-realm"],
  },

  {
    id: "veilpaw", name: "Veilpaw", element: "Shadow", rarity: "C",
    baseHp: 46, baseAttack: 46, baseDefense: 36, baseSpeed: 56,
    description: "A panther cub that phases between dimensions. It attacks before being seen.",
    lore: "Veilpaws choose their trainers by appearing suddenly without warning. To be chosen is considered an honor and an omen.",
    personality: "Mysterious", weight: 4.2, height: 0.4, captureRate: 85,
    evolutionFromId: null, evolutionToId: null, evolutionLevel: null,
    skills: [
      { name: "Phantom Scratch",type: "normal",  element: "Shadow", power: 44, accuracy: 96, description: "Phases through dimensions and rakes with claws from an unexpected angle." },
      { name: "Shadow Lunge",  type: "skill1",   element: "Shadow", power: 64, accuracy: 89, description: "Dissolves into shadow and reforms at full velocity inside the target's guard." },
      { name: "Dark Shroud",   type: "ultimate", element: "Shadow", power: 128, accuracy: 73, description: "Wraps the battlefield in absolute dark and strikes from every shadow simultaneously." },
    ],
    regionIds: ["shadow-marsh", "void-realm"],
  },

  {
    id: "duskfang", name: "Duskfang", element: "Shadow", rarity: "B",
    baseHp: 64, baseAttack: 70, baseDefense: 52, baseSpeed: 64,
    description: "A shadow wolf whose body dissolves at the edges into permanent twilight.",
    lore: "Duskfangs hunt in packs, but their shadow-bodies phase through each other. No barrier can stop a Duskfang that has set its target.",
    personality: "Relentless", weight: 38.0, height: 0.95, captureRate: 55,
    evolutionFromId: null, evolutionToId: null, evolutionLevel: null,
    skills: [
      { name: "Fang Slash",    type: "normal",   element: "Shadow", power: 58, accuracy: 94, description: "Bites and twists with shadow-edged fangs, tearing through light and matter." },
      { name: "Shadow Dash",   type: "skill1",   element: "Shadow", power: 76, accuracy: 87, description: "Becomes a shadow and dashes through everything in its path, solidifying on impact." },
      { name: "Nightmare Bite",type: "ultimate", element: "Shadow", power: 140, accuracy: 72, description: "Phases into the nightmare dimension and bites from all directions at once." },
    ],
    regionIds: ["shadow-marsh", "void-realm"],
  },

  {
    id: "nightshade", name: "Nightshade", element: "Shadow", rarity: "A",
    baseHp: 82, baseAttack: 92, baseDefense: 68, baseSpeed: 84,
    description: "A shadow serpent of enormous length. Its gaze induces despair.",
    lore: "A single look into Nightshade's eyes has driven philosophers mad. Its scales absorb magic completely.",
    personality: "Sinister", weight: 520.0, height: 7.2, captureRate: 30,
    evolutionFromId: null, evolutionToId: null, evolutionLevel: null,
    skills: [
      { name: "Venom Strike",  type: "normal",   element: "Shadow", power: 70, accuracy: 92, description: "Strikes with shadow-venom fangs that dissolve defenses on contact." },
      { name: "Dark Coil",     type: "skill1",   element: "Shadow", power: 88, accuracy: 83, description: "Wraps the target in coils of living shadow that drain energy with every squeeze." },
      { name: "Shadow Nova",   type: "ultimate", element: "Shadow", power: 152, accuracy: 70, description: "Expands shadow presence to fill the arena and contracts it in a devastating nova." },
    ],
    regionIds: ["shadow-marsh", "void-realm"],
  },

  {
    id: "voidreign", name: "Voidreign", element: "Shadow", rarity: "S",
    baseHp: 120, baseAttack: 122, baseDefense: 100, baseSpeed: 102,
    description: "An entity of pure void that predates the world. It cannot truly be described.",
    lore: "Voidreign is not a creature but a concept made physical — the absence of everything that has ever existed.",
    personality: "Absolute", weight: -1.0, height: -1.0, captureRate: 8,
    evolutionFromId: null, evolutionToId: null, evolutionLevel: null,
    skills: [
      { name: "Void Touch",    type: "normal",   element: "Shadow", power: 90, accuracy: 93, description: "Reaches out with a tendril of void that erases whatever it contacts from existence." },
      { name: "Dark Consumption",type: "skill1", element: "Shadow", power: 108, accuracy: 85, description: "Opens a dark maw and consumes a portion of the target, including their will to fight." },
      { name: "Oblivion",      type: "ultimate", element: "Shadow", power: 176, accuracy: 64, description: "Calls the void itself and unmakes everything in range, leaving only silence." },
    ],
    regionIds: ["shadow-marsh", "void-realm"],
  },
];
