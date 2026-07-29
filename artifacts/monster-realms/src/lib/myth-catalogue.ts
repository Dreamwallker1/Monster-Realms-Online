// Static catalogue of all 100 myths — used by Myths Tree without an API call
export interface MythEntry {
  id: string;
  name: string;
  element: 'Fire' | 'Water' | 'Nature' | 'Electric' | 'Dark';
  rarity: 'C' | 'B' | 'A' | 'S';
  description: string;
  baseHp: number;
  baseAttack: number;
  baseDefense: number;
  baseSpeed: number;
}

export const ALL_MYTHS: MythEntry[] = [
  // ── Fire ────────────────────────────────────────────────────────────────────
  { id:'cinder-pup',      name:'Cinder Pup',       element:'Fire', rarity:'C', description:'A small pup whose tail never stops smoldering.',          baseHp:42, baseAttack:38, baseDefense:34, baseSpeed:52 },
  { id:'flame-wisp',      name:'Flame Wisp',        element:'Fire', rarity:'C', description:'A drifting orb of pure fire that pulses with living light.',baseHp:38, baseAttack:48, baseDefense:28, baseSpeed:60 },
  { id:'ash-lizard',      name:'Ash Lizard',        element:'Fire', rarity:'C', description:'A lizard coated in grey ash that hides its inner heat.',   baseHp:52, baseAttack:42, baseDefense:48, baseSpeed:40 },
  { id:'ember-crab',      name:'Ember Crab',        element:'Fire', rarity:'C', description:'A crab whose shell glows red-hot and claws release steam.', baseHp:56, baseAttack:36, baseDefense:52, baseSpeed:36 },
  { id:'scorch-moth',     name:'Scorch Moth',       element:'Fire', rarity:'C', description:'A moth with wing patterns that resemble tongues of flame.',  baseHp:40, baseAttack:50, baseDefense:30, baseSpeed:58 },
  { id:'pyro-toad',       name:'Pyro Toad',         element:'Fire', rarity:'C', description:'A wide toad that expels combustible gas from its glands.',  baseHp:50, baseAttack:44, baseDefense:44, baseSpeed:38 },
  { id:'torch-kit',       name:'Torch Kit',         element:'Fire', rarity:'C', description:'A small fox kit whose bushy tail burns perpetually.',        baseHp:44, baseAttack:46, baseDefense:32, baseSpeed:54 },
  { id:'blaze-sprite',    name:'Blaze Sprite',      element:'Fire', rarity:'C', description:'A mischievous sprite made of pure animated flame.',          baseHp:36, baseAttack:52, baseDefense:26, baseSpeed:62 },
  { id:'magmar-wolf',     name:'Magmar Wolf',       element:'Fire', rarity:'B', description:'A wolf whose coat is woven from cooled lava threads.',       baseHp:68, baseAttack:62, baseDefense:54, baseSpeed:68 },
  { id:'inferno-bat',     name:'Inferno Bat',       element:'Fire', rarity:'B', description:'A bat that echolocates with supersonic fire pulses.',        baseHp:62, baseAttack:68, baseDefense:46, baseSpeed:76 },
  { id:'lava-serpent',    name:'Lava Serpent',      element:'Fire', rarity:'B', description:'A serpent that swims through magma as easily as water.',     baseHp:72, baseAttack:66, baseDefense:58, baseSpeed:60 },
  { id:'char-wyvern',     name:'Char Wyvern',       element:'Fire', rarity:'B', description:'A small wyvern with wings that trail lines of char.',        baseHp:74, baseAttack:70, baseDefense:52, baseSpeed:66 },
  { id:'forge-golem',     name:'Forge Golem',       element:'Fire', rarity:'B', description:'A golem assembled from slag metal, powered by lava core.',   baseHp:88, baseAttack:58, baseDefense:78, baseSpeed:38 },
  { id:'scorched-mantis', name:'Scorched Mantis',   element:'Fire', rarity:'B', description:'A praying mantis whose arms are edged with razor flame.',    baseHp:64, baseAttack:76, baseDefense:48, baseSpeed:72 },
  { id:'volcanus',        name:'Volcanus',           element:'Fire', rarity:'A', description:'A great maned lion forged in the heart of a dormant volcano.',baseHp:102,baseAttack:94, baseDefense:80, baseSpeed:86 },
  { id:'pyro-titan',      name:'Pyro Titan',        element:'Fire', rarity:'A', description:'A towering humanoid construct of living obsidian and fire.',  baseHp:110,baseAttack:98, baseDefense:90, baseSpeed:70 },
  { id:'magma-basilisk',  name:'Magma Basilisk',    element:'Fire', rarity:'A', description:'A basilisk whose gaze turns stone to molten rock.',           baseHp:98, baseAttack:100,baseDefense:86, baseSpeed:78 },
  { id:'cinder-phoenix',  name:'Cinder Phoenix',    element:'Fire', rarity:'A', description:'A phoenix reborn in volcanic cinders rather than ashes.',     baseHp:94, baseAttack:104,baseDefense:72, baseSpeed:98 },
  { id:'ignis-seraph',    name:'Ignis Seraph',      element:'Fire', rarity:'S', description:'A divine being whose wings burn with the light of creation.', baseHp:130,baseAttack:122,baseDefense:100,baseSpeed:118 },
  { id:'helios-wyrm',     name:'Helios Wyrm',       element:'Fire', rarity:'S', description:'An ancient wyrm born from the sun itself. Its scales radiate solar heat.',baseHp:140,baseAttack:130,baseDefense:110,baseSpeed:108 },

  // ── Water ───────────────────────────────────────────────────────────────────
  { id:'tide-pup',        name:'Tide Pup',          element:'Water', rarity:'C', description:'A cheerful pup that surfs on waves using its flat, finned tail.',   baseHp:44, baseAttack:36, baseDefense:38, baseSpeed:50 },
  { id:'coral-sprite',    name:'Coral Sprite',      element:'Water', rarity:'C', description:'A tiny sprite that lives inside coral formations.',                  baseHp:38, baseAttack:42, baseDefense:32, baseSpeed:56 },
  { id:'mist-jellyfish',  name:'Mist Jellyfish',    element:'Water', rarity:'C', description:'A translucent jellyfish that drifts on sea breezes.',                baseHp:40, baseAttack:44, baseDefense:30, baseSpeed:54 },
  { id:'brook-turtle',    name:'Brook Turtle',      element:'Water', rarity:'C', description:'A freshwater turtle with a mossy shell and steady demeanor.',        baseHp:58, baseAttack:34, baseDefense:54, baseSpeed:34 },
  { id:'stream-otter',    name:'Stream Otter',      element:'Water', rarity:'C', description:'A playful otter that can hold its breath for hours.',                baseHp:46, baseAttack:40, baseDefense:36, baseSpeed:56 },
  { id:'wave-imp',        name:'Wave Imp',          element:'Water', rarity:'C', description:'A mischievous imp that knocks swimmers off balance.',                 baseHp:42, baseAttack:46, baseDefense:34, baseSpeed:52 },
  { id:'puddle-toad',     name:'Puddle Toad',       element:'Water', rarity:'C', description:'A plump toad that fills itself with water for defense.',              baseHp:54, baseAttack:32, baseDefense:52, baseSpeed:30 },
  { id:'reef-hatchling',  name:'Reef Hatchling',    element:'Water', rarity:'C', description:'A colorful fish hatchling that guards reef territories.',             baseHp:40, baseAttack:44, baseDefense:36, baseSpeed:52 },
  { id:'surge-hound',     name:'Surge Hound',       element:'Water', rarity:'B', description:'A large hound that surges through ocean currents effortlessly.',      baseHp:72, baseAttack:64, baseDefense:56, baseSpeed:70 },
  { id:'deep-ray',        name:'Deep Ray',          element:'Water', rarity:'B', description:'A manta ray that patrols deep ocean trenches.',                       baseHp:68, baseAttack:60, baseDefense:66, baseSpeed:60 },
  { id:'abyssal-eel',     name:'Abyssal Eel',       element:'Water', rarity:'B', description:'An eel from the crushing deep with bio-luminescent lures.',           baseHp:66, baseAttack:72, baseDefense:52, baseSpeed:68 },
  { id:'sea-golem',       name:'Sea Golem',         element:'Water', rarity:'B', description:'A golem shaped from compressed coral and ocean stone.',               baseHp:90, baseAttack:56, baseDefense:84, baseSpeed:34 },
  { id:'aqua-guardian',   name:'Aqua Guardian',     element:'Water', rarity:'B', description:'An ancient guardian spirit bound to protect ocean shrines.',          baseHp:76, baseAttack:64, baseDefense:72, baseSpeed:52 },
  { id:'storm-crab',      name:'Storm Crab',        element:'Water', rarity:'B', description:'A massive crab that calls down rain clouds with its claws.',          baseHp:84, baseAttack:68, baseDefense:78, baseSpeed:40 },
  { id:'tempest-leviathan',name:'Tempest Leviathan',element:'Water', rarity:'A', description:'A sea serpent that creates storms with its passage.',                 baseHp:108,baseAttack:96, baseDefense:86, baseSpeed:82 },
  { id:'ocean-titan',     name:'Ocean Titan',       element:'Water', rarity:'A', description:'A titan whose body is an entire reef ecosystem.',                     baseHp:118,baseAttack:90, baseDefense:104,baseSpeed:68 },
  { id:'tide-colossus',   name:'Tide Colossus',     element:'Water', rarity:'A', description:'A colossus of ocean stone that can part entire seas.',                baseHp:122,baseAttack:88, baseDefense:110,baseSpeed:60 },
  { id:'abyss-wyrm',      name:'Abyss Wyrm',        element:'Water', rarity:'A', description:'A wyrm from the lightless trenches, older than the ocean floor.',     baseHp:104,baseAttack:102,baseDefense:92, baseSpeed:78 },
  { id:'poseidon-serpent',name:'Poseidon Serpent',  element:'Water', rarity:'S', description:'A mythical sea serpent said to be the ocean personified.',             baseHp:136,baseAttack:128,baseDefense:108,baseSpeed:102 },
  { id:'thalassa-deity',  name:'Thalassa Deity',    element:'Water', rarity:'S', description:'The ocean deity itself, keeper of all aquatic myths.',                 baseHp:144,baseAttack:124,baseDefense:118,baseSpeed:96  },

  // ── Nature ──────────────────────────────────────────────────────────────────
  { id:'seed-sprite',     name:'Seed Sprite',       element:'Nature', rarity:'C', description:'A tiny sprite born from the first seed of a forest.',      baseHp:40, baseAttack:36, baseDefense:36, baseSpeed:50 },
  { id:'leaf-ferret',     name:'Leaf Ferret',       element:'Nature', rarity:'C', description:'A ferret that glides between trees on its leaf-like ears.',  baseHp:42, baseAttack:42, baseDefense:34, baseSpeed:54 },
  { id:'vine-pup',        name:'Vine Pup',          element:'Nature', rarity:'C', description:'A pup whose body is woven from living vines.',              baseHp:44, baseAttack:38, baseDefense:40, baseSpeed:46 },
  { id:'moss-crab',       name:'Moss Crab',         element:'Nature', rarity:'C', description:'A crab covered in deep green moss that photosynthesizes.',  baseHp:56, baseAttack:32, baseDefense:56, baseSpeed:30 },
  { id:'petal-bee',       name:'Petal Bee',         element:'Nature', rarity:'C', description:'A large bee whose wings scatter healing pollen.',           baseHp:38, baseAttack:46, baseDefense:30, baseSpeed:58 },
  { id:'root-mole',       name:'Root Mole',         element:'Nature', rarity:'C', description:'A mole that tunnels through root systems to surprise foes.', baseHp:50, baseAttack:40, baseDefense:46, baseSpeed:38 },
  { id:'fern-hatchling',  name:'Fern Hatchling',    element:'Nature', rarity:'C', description:'A hatchling wrapped in fern fronds that camouflage it.',    baseHp:42, baseAttack:38, baseDefense:40, baseSpeed:48 },
  { id:'sprout-sprite',   name:'Sprout Sprite',     element:'Nature', rarity:'C', description:'An energetic sprite with a sprouting plant growing on its head.',baseHp:36,baseAttack:44, baseDefense:30, baseSpeed:56 },
  { id:'bloom-guardian',  name:'Bloom Guardian',    element:'Nature', rarity:'B', description:'A guardian spirit that blossoms with the seasons.',          baseHp:70, baseAttack:58, baseDefense:66, baseSpeed:52 },
  { id:'thorn-wolf',      name:'Thorn Wolf',        element:'Nature', rarity:'B', description:'A wolf whose fur has grown into interlocking thorn-barbs.',  baseHp:74, baseAttack:68, baseDefense:60, baseSpeed:62 },
  { id:'grove-hawk',      name:'Grove Hawk',        element:'Nature', rarity:'B', description:'A hawk that nests only in ancient trees; its talons channel nature.',baseHp:62,baseAttack:72, baseDefense:52, baseSpeed:76 },
  { id:'briar-golem',     name:'Briar Golem',       element:'Nature', rarity:'B', description:'A golem built from interlocked briar thorns and roots.',     baseHp:88, baseAttack:58, baseDefense:80, baseSpeed:36 },
  { id:'spore-bat',       name:'Spore Bat',         element:'Nature', rarity:'B', description:'A bat that drops hallucinogenic spores on prey below.',      baseHp:64, baseAttack:66, baseDefense:54, baseSpeed:70 },
  { id:'canopy-serpent',  name:'Canopy Serpent',    element:'Nature', rarity:'B', description:'A serpent that lives in treetops, dropping on unsuspecting prey.',baseHp:68,baseAttack:70, baseDefense:56, baseSpeed:66 },
  { id:'ancient-treant',  name:'Ancient Treant',    element:'Nature', rarity:'A', description:'A treant that has lived for millennia; its roots reach deep.', baseHp:120,baseAttack:88, baseDefense:108,baseSpeed:44 },
  { id:'verdant-titan',   name:'Verdant Titan',     element:'Nature', rarity:'A', description:'A titan formed from the collective will of a dense forest.',  baseHp:112,baseAttack:94, baseDefense:96, baseSpeed:58 },
  { id:'thorn-colossus',  name:'Thorn Colossus',    element:'Nature', rarity:'A', description:'A colossus armored in overlapping thorn-plates.',            baseHp:106,baseAttack:96, baseDefense:100,baseSpeed:50 },
  { id:'gaia-wyrm',       name:'Gaia Wyrm',         element:'Nature', rarity:'A', description:'A wyrm that carries an entire ecosystem on its back.',       baseHp:100,baseAttack:98, baseDefense:88, baseSpeed:72 },
  { id:'sylvan-deity',    name:'Sylvan Deity',      element:'Nature', rarity:'S', description:'The spirit of the primeval forest given physical form.',      baseHp:132,baseAttack:120,baseDefense:106,baseSpeed:108 },
  { id:'earthmother',     name:'Earthmother',       element:'Nature', rarity:'S', description:'The personification of the living earth herself.',            baseHp:142,baseAttack:118,baseDefense:120,baseSpeed:90  },

  // ── Electric ────────────────────────────────────────────────────────────────
  { id:'spark-kit',       name:'Spark Kit',         element:'Electric', rarity:'C', description:'A kit that discharges static electricity when excited.',     baseHp:40, baseAttack:46, baseDefense:30, baseSpeed:56 },
  { id:'zap-moth',        name:'Zap Moth',          element:'Electric', rarity:'C', description:'A moth that navigates by electric field instead of light.',   baseHp:38, baseAttack:50, baseDefense:28, baseSpeed:58 },
  { id:'volt-hatchling',  name:'Volt Hatchling',    element:'Electric', rarity:'C', description:'A hatchling still charged from the electric egg it hatched from.',baseHp:42,baseAttack:44, baseDefense:34, baseSpeed:52 },
  { id:'arc-sprite',      name:'Arc Sprite',        element:'Electric', rarity:'C', description:'A sprite formed from a trapped lightning bolt.',              baseHp:36, baseAttack:52, baseDefense:26, baseSpeed:62 },
  { id:'static-crab',     name:'Static Crab',       element:'Electric', rarity:'C', description:'A crab whose shell accumulates massive static charges.',      baseHp:54, baseAttack:38, baseDefense:52, baseSpeed:32 },
  { id:'buzz-bee',        name:'Buzz Bee',          element:'Electric', rarity:'C', description:'A bee whose wings vibrate fast enough to generate arcs.',     baseHp:38, baseAttack:48, baseDefense:30, baseSpeed:60 },
  { id:'jolt-lizard',     name:'Jolt Lizard',       element:'Electric', rarity:'C', description:'A lizard that stores electric charge in its frill.',          baseHp:46, baseAttack:44, baseDefense:38, baseSpeed:50 },
  { id:'charge-pup',      name:'Charge Pup',        element:'Electric', rarity:'C', description:'A pup that headbutts objects to release built-up charge.',    baseHp:44, baseAttack:46, baseDefense:36, baseSpeed:50 },
  { id:'thunder-wolf',    name:'Thunder Wolf',      element:'Electric', rarity:'B', description:'A wolf that can outrun lightning by running alongside it.',    baseHp:70, baseAttack:68, baseDefense:54, baseSpeed:78 },
  { id:'storm-bat',       name:'Storm Bat',         element:'Electric', rarity:'B', description:'A bat that rides thunderstorms and dives like a living bolt.',  baseHp:64, baseAttack:72, baseDefense:50, baseSpeed:76 },
  { id:'plasma-ray',      name:'Plasma Ray',        element:'Electric', rarity:'B', description:'A manta-like creature that glides on plasma discharge.',       baseHp:66, baseAttack:70, baseDefense:54, baseSpeed:66 },
  { id:'storm-serpent',   name:'Storm Serpent',     element:'Electric', rarity:'B', description:'A serpent that coils around lightning rods to feed.',          baseHp:68, baseAttack:68, baseDefense:56, baseSpeed:70 },
  { id:'arc-golem',       name:'Arc Golem',         element:'Electric', rarity:'B', description:'A golem of cloud-stuff held together by constant arcing.',     baseHp:84, baseAttack:60, baseDefense:76, baseSpeed:44 },
  { id:'lightning-hawk',  name:'Lightning Hawk',    element:'Electric', rarity:'B', description:'A hawk that dives at terminal velocity, ionizing the air.',     baseHp:62, baseAttack:76, baseDefense:50, baseSpeed:82 },
  { id:'storm-colossus',  name:'Storm Colossus',    element:'Electric', rarity:'A', description:'A colossus that strides through storm clouds.',                 baseHp:108,baseAttack:96, baseDefense:86, baseSpeed:74 },
  { id:'galvanos',        name:'Galvanos',           element:'Electric', rarity:'A', description:'A proud lion-myth whose roar is a clap of thunder.',           baseHp:100,baseAttack:100,baseDefense:82, baseSpeed:90 },
  { id:'tempest-titan',   name:'Tempest Titan',     element:'Electric', rarity:'A', description:'A titan that generates permanent storms wherever it walks.',    baseHp:112,baseAttack:98, baseDefense:88, baseSpeed:76 },
  { id:'arc-leviathan',   name:'Arc Leviathan',     element:'Electric', rarity:'A', description:'A leviathan whose body is a continuous chain of lightning.',    baseHp:104,baseAttack:102,baseDefense:80, baseSpeed:86 },
  { id:'zeus-wyrm',       name:'Zeus Wyrm',         element:'Electric', rarity:'S', description:'A wyrm said to be the embodiment of the sky\'s wrath.',        baseHp:132,baseAttack:128,baseDefense:98, baseSpeed:114 },
  { id:'thunder-deity',   name:'Thunder Deity',     element:'Electric', rarity:'S', description:'The living god of storms, worshipped by coastal civilizations.',  baseHp:138,baseAttack:132,baseDefense:104,baseSpeed:110 },

  // ── Dark ────────────────────────────────────────────────────────────────────
  { id:'shadow-imp',      name:'Shadow Imp',        element:'Dark', rarity:'C', description:'A mischievous imp that lives in cast shadows.',                  baseHp:38, baseAttack:48, baseDefense:28, baseSpeed:60 },
  { id:'gloom-wisp',      name:'Gloom Wisp',        element:'Dark', rarity:'C', description:'A wisp that absorbs light from its surroundings.',               baseHp:36, baseAttack:50, baseDefense:26, baseSpeed:62 },
  { id:'dusk-ferret',     name:'Dusk Ferret',       element:'Dark', rarity:'C', description:'A ferret active at dusk, using low light to its advantage.',     baseHp:42, baseAttack:44, baseDefense:34, baseSpeed:56 },
  { id:'night-crab',      name:'Night Crab',        element:'Dark', rarity:'C', description:'A crab with a shell dark as a moonless sky.',                    baseHp:54, baseAttack:36, baseDefense:54, baseSpeed:30 },
  { id:'umbra-moth',      name:'Umbra Moth',        element:'Dark', rarity:'C', description:'A moth whose wings absorb all light, leaving true darkness.',    baseHp:38, baseAttack:50, baseDefense:28, baseSpeed:60 },
  { id:'murk-toad',       name:'Murk Toad',         element:'Dark', rarity:'C', description:'A toad that secretes void-tinted toxins.',                       baseHp:50, baseAttack:42, baseDefense:44, baseSpeed:36 },
  { id:'dark-sprite',     name:'Dark Sprite',       element:'Dark', rarity:'C', description:'A sprite born in absolute darkness, never seen in daylight.',    baseHp:36, baseAttack:52, baseDefense:26, baseSpeed:62 },
  { id:'shade-hatchling', name:'Shade Hatchling',   element:'Dark', rarity:'C', description:'A hatchling that hatched in darkness and learned to wield it.',  baseHp:40, baseAttack:46, baseDefense:32, baseSpeed:54 },
  { id:'void-stalker',    name:'Void Stalker',      element:'Dark', rarity:'B', description:'A panther that moves between voids with ease.',                  baseHp:68, baseAttack:72, baseDefense:54, baseSpeed:80 },
  { id:'nightmare-specter',name:'Nightmare Specter',element:'Dark', rarity:'B', description:'A specter that feeds on fear and amplifies nightmares.',          baseHp:60, baseAttack:76, baseDefense:46, baseSpeed:78 },
  { id:'shadow-bat',      name:'Shadow Bat',        element:'Dark', rarity:'B', description:'A bat that phases through walls using shadow tunneling.',         baseHp:62, baseAttack:70, baseDefense:50, baseSpeed:76 },
  { id:'dusk-serpent',    name:'Dusk Serpent',      element:'Dark', rarity:'B', description:'A serpent whose scales shift between shadow and substance.',      baseHp:66, baseAttack:68, baseDefense:56, baseSpeed:70 },
  { id:'gloom-golem',     name:'Gloom Golem',       element:'Dark', rarity:'B', description:'A golem assembled from solidified darkness.',                    baseHp:86, baseAttack:58, baseDefense:80, baseSpeed:36 },
  { id:'eclipse-hawk',    name:'Eclipse Hawk',      element:'Dark', rarity:'B', description:'A hawk that can blot out the sun with its wingspan.',             baseHp:64, baseAttack:74, baseDefense:52, baseSpeed:80 },
  { id:'abyssal-wraith',  name:'Abyssal Wraith',    element:'Dark', rarity:'A', description:'A wraith born from the collective despair of lost souls.',       baseHp:94, baseAttack:102,baseDefense:70, baseSpeed:98 },
  { id:'void-titan',      name:'Void Titan',        element:'Dark', rarity:'A', description:'A titan whose body is a pocket of unstable void.',               baseHp:106,baseAttack:96, baseDefense:90, baseSpeed:78 },
  { id:'dark-colossus',   name:'Dark Colossus',     element:'Dark', rarity:'A', description:'A colossus armored in plates of hardened shadow.',               baseHp:114,baseAttack:92, baseDefense:102,baseSpeed:62 },
  { id:'shadow-leviathan',name:'Shadow Leviathan',  element:'Dark', rarity:'A', description:'A leviathan that pulls ships into the shadow realm.',             baseHp:108,baseAttack:100,baseDefense:86, baseSpeed:80 },
  { id:'erebus-entity',   name:'Erebus Entity',     element:'Dark', rarity:'S', description:'An entity from the primordial dark before the first light.',     baseHp:134,baseAttack:126,baseDefense:108,baseSpeed:106 },
  { id:'void-deity',      name:'Void Deity',        element:'Dark', rarity:'S', description:'The god of the void: silent, inevitable, all-consuming.',        baseHp:140,baseAttack:130,baseDefense:116,baseSpeed:98  },
];

/** Quick lookup by ID */
export const MYTH_BY_ID: Record<string, MythEntry> = Object.fromEntries(
  ALL_MYTHS.map((m) => [m.id, m]),
);
