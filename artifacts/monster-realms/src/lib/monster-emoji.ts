/** Returns a large emoji that represents each monster visually in the encounter popup */
export const MONSTER_EMOJI: Record<string, string> = {
  // Fire
  'ember-drake':     '🦎🔥',
  'lava-horn':       '🦏🌋',
  'pyro-fox':        '🦊🔥',
  // Water
  'aquafin':         '🐟💧',
  'tide-walker':     '🦀🌊',
  'storm-eel':       '🐍⚡',
  // Nature
  'leafhorn':        '🦌🍃',
  'vine-stalker':    '🐍🌿',
  'bloom-sprite':    '🧚🌸',
  // Electric
  'volt-bunny':      '🐇⚡',
  'thunder-hawk':    '🦅⚡',
  'spark-golem':     '🗿⚡',
  // Ice
  'frost-pup':       '🐺❄️',
  'blizzard-bear':   '🐻‍❄️🌨',
  'crystal-moth':    '🦋💎',
  // Earth
  'rock-tortoise':   '🐢🪨',
  'mud-crawler':     '🐊🌍',
  'iron-boar':       '🐗⚙️',
  // Air
  'breeze-bird':     '🐦💨',
  'cloud-serpent':   '🐲☁️',
  'gale-fox':        '🦊🌪️',
  // Light
  'radiance-deer':   '🦌✨',
  'sun-beetle':      '🪲☀️',
  // Dark
  'shadow-cat':      '🐱🌑',
  'void-wolf':       '🐺🕳️',
  // Metal
  'iron-crab':       '🦀⚙️',
  'steel-rhino':     '🦏🔩',
  // Crystal
  'gem-sprite':      '💎🧚',
  'quartz-dragon':   '🐲💎',
};

/** Fallback emoji by element */
export const ELEMENT_EMOJI: Record<string, string> = {
  Fire:     '🔥',
  Water:    '💧',
  Nature:   '🌿',
  Electric: '⚡',
  Ice:      '❄️',
  Earth:    '🪨',
  Air:      '💨',
  Light:    '✨',
  Dark:     '🌑',
  Metal:    '⚙️',
  Crystal:  '💎',
  Void:     '🕳️',
};

export function getMonsterEmoji(id: string, element: string): string {
  return MONSTER_EMOJI[id] ?? (ELEMENT_EMOJI[element] ?? '❓');
}
