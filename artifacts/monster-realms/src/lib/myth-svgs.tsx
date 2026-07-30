// ─── Myth SVG Character Art ──────────────────────────────────────────────────
// 20 unique creature archetypes × 5 elements = all 100 myths covered
// Each archetype is a React component returning an SVG (viewBox 0 0 100 100)
// Rarity (C→S) controls glow intensity applied by the wrapper

type SvgCreatureProps = { primary: string; secondary: string; accent: string };

// ── FIRE archetypes ──────────────────────────────────────────────────────────

/** FireWolf – quadruped wolf with fire mane and flaming tail */
export function FireWolfSvg({ primary, secondary, accent }: SvgCreatureProps) {
  return (
    <>
      <ellipse cx="52" cy="90" rx="25" ry="5" fill="black" opacity="0.28"/>
      {/* Body */}
      <ellipse cx="55" cy="65" rx="26" ry="19" fill={primary}/>
      {/* Haunches */}
      <ellipse cx="73" cy="72" rx="14" ry="12" fill={primary}/>
      {/* Rear legs */}
      <rect x="67" y="78" width="9" height="14" rx="4" fill={secondary}/>
      <rect x="57" y="80" width="8" height="12" rx="4" fill={secondary}/>
      {/* Tail path */}
      <path d={`M80,62 C94,50 98,34 88,22`} stroke={secondary} strokeWidth="7" fill="none" strokeLinecap="round"/>
      <path d={`M88,20 C90,12 93,8 89,4`} stroke={accent} strokeWidth="5" fill="none" strokeLinecap="round"/>
      <ellipse cx="88" cy="3" rx="4" ry="6" fill={accent} opacity="0.9"/>
      {/* Front legs */}
      <rect x="35" y="79" width="9" height="14" rx="4" fill={secondary}/>
      <rect x="46" y="81" width="8" height="12" rx="4" fill={secondary}/>
      {/* Neck */}
      <ellipse cx="32" cy="59" rx="13" ry="15" fill={primary}/>
      {/* Head */}
      <circle cx="22" cy="46" r="19" fill={primary}/>
      {/* Ears */}
      <polygon points="8,36 17,16 26,33" fill={primary}/>
      <polygon points="10,36 17,22 24,33" fill={accent} opacity="0.55"/>
      <polygon points="25,32 32,14 38,30" fill={primary}/>
      <polygon points="27,32 32,20 36,30" fill={accent} opacity="0.55"/>
      {/* Fire mane streaks */}
      <path d="M36,52 C44,41 42,29 37,22" stroke={accent} strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.9"/>
      <path d="M38,58 C49,44 47,30 41,21" stroke={secondary} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.75"/>
      <path d="M39,64 C52,49 51,34 46,25" stroke={accent} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.55"/>
      {/* Snout */}
      <ellipse cx="8" cy="50" rx="12" ry="8" fill={secondary}/>
      <ellipse cx="5" cy="47" rx="3.5" ry="2.5" fill="#0A0000"/>
      {/* Eye */}
      <circle cx="20" cy="43" r="6" fill={accent}/>
      <circle cx="20" cy="43" r="3" fill="#0A0000"/>
      <circle cx="21.5" cy="41.5" r="1.2" fill="white"/>
    </>
  );
}

/** FireDrake – wyvern with bat wings, scales, fire breath */
export function FireDrakeSvg({ primary, secondary, accent }: SvgCreatureProps) {
  return (
    <>
      <ellipse cx="50" cy="90" rx="24" ry="5" fill="black" opacity="0.28"/>
      {/* Wings (behind body) */}
      <path d="M42,55 C20,35 8,20 18,8 C24,2 36,18 42,38" fill={secondary} opacity="0.85"/>
      <path d="M58,55 C80,35 92,20 82,8 C76,2 64,18 58,38" fill={secondary} opacity="0.85"/>
      {/* Wing membrane detail */}
      <path d="M42,55 C30,42 22,28 22,14" stroke={accent} strokeWidth="1" fill="none" opacity="0.5"/>
      <path d="M58,55 C70,42 78,28 78,14" stroke={accent} strokeWidth="1" fill="none" opacity="0.5"/>
      {/* Body */}
      <ellipse cx="50" cy="70" rx="22" ry="18" fill={primary}/>
      {/* Scale rows on body */}
      {[44,52,60].map((x,i)=>[38,48,58,68].map((y,j)=>(
        <ellipse key={`${i}${j}`} cx={x+(j%2)*2} cy={y} rx="3" ry="2" fill={secondary} opacity="0.6"/>
      )))}
      {/* Neck */}
      <path d="M38,55 C30,45 24,38 22,28" stroke={primary} strokeWidth="14" fill="none" strokeLinecap="round"/>
      {/* Head */}
      <ellipse cx="22" cy="22" rx="16" ry="12" fill={primary}/>
      {/* Horns */}
      <path d="M14,15 L8,2" stroke={secondary} strokeWidth="3" strokeLinecap="round"/>
      <path d="M20,12 L16,0" stroke={secondary} strokeWidth="2.5" strokeLinecap="round"/>
      {/* Jaw */}
      <path d="M8,26 C14,32 24,30 32,26" fill={secondary}/>
      {/* Eye */}
      <circle cx="20" cy="20" r="5" fill={accent}/>
      <ellipse cx="20" cy="20" rx="2" ry="4" fill="#0A0000"/>
      <circle cx="21" cy="18.5" r="1" fill="white"/>
      {/* Fire breath */}
      <path d="M6,26 C-2,30 -8,36 -4,42" stroke={accent} strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.8"/>
      <path d="M6,28 C0,36 -2,44 2,50" stroke="#FFDD00" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6"/>
      {/* Legs */}
      <rect x="34" y="82" width="10" height="12" rx="5" fill={secondary}/>
      <rect x="56" y="82" width="10" height="12" rx="5" fill={secondary}/>
      {/* Tail spade */}
      <path d="M70,75 C82,72 90,68 88,60" stroke={primary} strokeWidth="8" fill="none" strokeLinecap="round"/>
      <polygon points="88,57 82,52 94,53" fill={secondary}/>
    </>
  );
}

/** FireSpirit – floating flame wisp with wings */
export function FireSpiritSvg({ primary, secondary, accent }: SvgCreatureProps) {
  return (
    <>
      {/* Flame trail below */}
      <path d="M38,80 C34,90 40,96 50,94 C60,96 66,90 62,80 C56,88 44,88 38,80" fill={primary} opacity="0.4"/>
      <path d="M42,72 C36,82 42,92 50,90 C58,92 64,82 58,72 C54,80 46,80 42,72" fill={secondary} opacity="0.6"/>
      {/* Side flame wings */}
      <path d="M28,50 C12,38 8,22 20,18 C28,14 34,30 36,44" fill={accent} opacity="0.7"/>
      <path d="M72,50 C88,38 92,22 80,18 C72,14 66,30 64,44" fill={accent} opacity="0.7"/>
      {/* Wing inner glow */}
      <path d="M28,50 C18,42 16,28 24,22" stroke={accent} strokeWidth="2" fill="none" opacity="0.8"/>
      <path d="M72,50 C82,42 84,28 76,22" stroke={accent} strokeWidth="2" fill="none" opacity="0.8"/>
      {/* Core orb */}
      <circle cx="50" cy="46" r="24" fill={primary}/>
      <circle cx="50" cy="46" r="18" fill={secondary}/>
      <circle cx="50" cy="46" r="11" fill={accent} opacity="0.8"/>
      {/* Inner glow center */}
      <circle cx="50" cy="46" r="6" fill="white" opacity="0.5"/>
      {/* Eyes */}
      <circle cx="43" cy="44" r="5" fill="white"/>
      <circle cx="57" cy="44" r="5" fill="white"/>
      <circle cx="43" cy="44" r="2.5" fill="#0A0000"/>
      <circle cx="57" cy="44" r="2.5" fill="#0A0000"/>
      <circle cx="44" cy="43" r="1" fill="white"/>
      <circle cx="58" cy="43" r="1" fill="white"/>
      {/* Smile */}
      <path d="M44,52 Q50,57 56,52" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7"/>
      {/* Flame crown */}
      <path d="M38,28 C34,16 40,8 44,14 C44,4 50,0 50,6 C50,0 56,4 56,14 C60,8 66,16 62,28" fill={accent} opacity="0.9"/>
    </>
  );
}

/** FireGolem – lava crab/golem with glowing cracks */
export function FireGolemSvg({ primary, secondary, accent }: SvgCreatureProps) {
  return (
    <>
      <ellipse cx="50" cy="91" rx="28" ry="5" fill="black" opacity="0.3"/>
      {/* Body main – hexagonal golem torso */}
      <polygon points="50,18 72,28 78,52 64,72 36,72 22,52 28,28" fill={primary}/>
      {/* Glowing cracks on body */}
      <path d="M50,30 L44,46 L50,56" stroke={accent} strokeWidth="2" fill="none"/>
      <path d="M50,30 L56,46 L50,56" stroke={accent} strokeWidth="2" fill="none"/>
      <path d="M38,38 L50,46 L62,38" stroke={accent} strokeWidth="1.5" fill="none"/>
      {/* Shoulder pads */}
      <ellipse cx="25" cy="34" rx="10" ry="8" fill={secondary}/>
      <ellipse cx="75" cy="34" rx="10" ry="8" fill={secondary}/>
      {/* Left claw arm */}
      <path d="M22,40 C8,42 2,50 6,60" stroke={secondary} strokeWidth="10" fill="none" strokeLinecap="round"/>
      <path d="M5,62 C0,70 2,78 8,74" stroke={secondary} strokeWidth="8" fill="none" strokeLinecap="round"/>
      <path d="M8,68 C4,78 8,84 14,80" stroke={secondary} strokeWidth="6" fill="none" strokeLinecap="round"/>
      {/* Right claw arm */}
      <path d="M78,40 C92,42 98,50 94,60" stroke={secondary} strokeWidth="10" fill="none" strokeLinecap="round"/>
      <path d="M95,62 C100,70 98,78 92,74" stroke={secondary} strokeWidth="8" fill="none" strokeLinecap="round"/>
      <path d="M92,68 C96,78 92,84 86,80" stroke={secondary} strokeWidth="6" fill="none" strokeLinecap="round"/>
      {/* Legs */}
      <rect x="34" y="70" width="14" height="18" rx="5" fill={secondary}/>
      <rect x="52" y="70" width="14" height="18" rx="5" fill={secondary}/>
      {/* Face plate */}
      <ellipse cx="50" cy="36" rx="18" ry="12" fill={secondary}/>
      {/* Ember eyes */}
      <ellipse cx="42" cy="35" rx="6" ry="5" fill={accent}/>
      <ellipse cx="58" cy="35" rx="6" ry="5" fill={accent}/>
      <ellipse cx="42" cy="36" rx="3" ry="4" fill={primary}/>
      <ellipse cx="58" cy="36" rx="3" ry="4" fill={primary}/>
      {/* Steam vents */}
      <path d="M38,48 C36,42 34,38 36,34" stroke={accent} strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
      <path d="M62,48 C64,42 66,38 64,34" stroke={accent} strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
    </>
  );
}

// ── WATER archetypes ─────────────────────────────────────────────────────────

/** WaterTurtle – armored battle turtle with WEAPONS on shell */
export function WaterTurtleSvg({ primary, secondary, accent }: SvgCreatureProps) {
  return (
    <>
      <ellipse cx="50" cy="91" rx="28" ry="5" fill="black" opacity="0.28"/>
      {/* Body base */}
      <ellipse cx="50" cy="72" rx="30" ry="16" fill={primary}/>
      {/* Shell dome (the hero element) */}
      <ellipse cx="50" cy="56" rx="32" ry="26" fill={secondary}/>
      <ellipse cx="50" cy="50" rx="28" ry="22" fill={primary}/>
      {/* Shell hexagonal pattern */}
      <polygon points="50,34 58,39 58,49 50,54 42,49 42,39" fill={secondary} opacity="0.6" stroke={secondary} strokeWidth="1"/>
      <polygon points="50,34 42,39 34,34 34,24 42,19 50,24" fill={secondary} opacity="0.4" stroke={secondary} strokeWidth="0.8"/>
      <polygon points="50,34 58,39 66,34 66,24 58,19 50,24" fill={secondary} opacity="0.4" stroke={secondary} strokeWidth="0.8"/>
      <polygon points="50,54 58,49 66,54 66,64 58,69 50,64" fill={secondary} opacity="0.3" stroke={secondary} strokeWidth="0.8"/>
      <polygon points="50,54 42,49 34,54 34,64 42,69 50,64" fill={secondary} opacity="0.3" stroke={secondary} strokeWidth="0.8"/>
      {/* ── WEAPONS sticking out of shell ── */}
      {/* Left sword 1 – upper */}
      <rect x="10" y="34" width="22" height="4" rx="1" fill={accent}/>
      <rect x="6" y="32" width="7" height="8" rx="1" fill="#8B6914"/>
      <line x1="9.5" y1="32" x2="9.5" y2="40" stroke="#6B4A00" strokeWidth="1.5"/>
      {/* Left sword 2 – lower */}
      <rect x="10" y="50" width="22" height="4" rx="1" fill={accent}/>
      <rect x="6" y="48" width="7" height="8" rx="1" fill="#8B6914"/>
      <line x1="9.5" y1="48" x2="9.5" y2="56" stroke="#6B4A00" strokeWidth="1.5"/>
      {/* Right sword 1 – upper */}
      <rect x="68" y="34" width="22" height="4" rx="1" fill={accent}/>
      <rect x="87" y="32" width="7" height="8" rx="1" fill="#8B6914"/>
      <line x1="90.5" y1="32" x2="90.5" y2="40" stroke="#6B4A00" strokeWidth="1.5"/>
      {/* Right sword 2 – lower */}
      <rect x="68" y="50" width="22" height="4" rx="1" fill={accent}/>
      <rect x="87" y="48" width="7" height="8" rx="1" fill="#8B6914"/>
      <line x1="90.5" y1="48" x2="90.5" y2="56" stroke="#6B4A00" strokeWidth="1.5"/>
      {/* Top spear/lance */}
      <rect x="47" y="4" width="6" height="30" rx="2" fill={accent}/>
      <polygon points="50,0 44,10 56,10" fill={accent}/>
      <rect x="43" y="22" width="14" height="4" rx="1" fill="#8B6914"/>
      {/* Front flippers */}
      <ellipse cx="20" cy="75" rx="14" ry="7" fill={secondary} transform="rotate(-20 20 75)"/>
      <ellipse cx="80" cy="75" rx="14" ry="7" fill={secondary} transform="rotate(20 80 75)"/>
      {/* Armor segments on flippers */}
      <path d="M14,70 C18,74 22,76 26,74" stroke={primary} strokeWidth="1.5" fill="none"/>
      <path d="M86,70 C82,74 78,76 74,74" stroke={primary} strokeWidth="1.5" fill="none"/>
      {/* Head */}
      <ellipse cx="50" cy="80" rx="12" ry="10" fill={primary}/>
      {/* Head armor beak */}
      <ellipse cx="50" cy="86" rx="8" ry="4" fill={secondary}/>
      {/* Determined eyes */}
      <circle cx="44" cy="77" r="4.5" fill="white"/>
      <circle cx="56" cy="77" r="4.5" fill="white"/>
      <circle cx="44" cy="77" r="2.5" fill="#002244"/>
      <circle cx="56" cy="77" r="2.5" fill="#002244"/>
      <circle cx="44.8" cy="76.2" r="1" fill="white"/>
      <circle cx="56.8" cy="76.2" r="1" fill="white"/>
      {/* Eyebrow furrowed */}
      <path d="M40,73 L48,74" stroke={secondary} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M52,74 L60,73" stroke={secondary} strokeWidth="1.5" strokeLinecap="round"/>
    </>
  );
}

/** WaterCanine – sleek aquatic otter/pup */
export function WaterCanineSvg({ primary, secondary, accent }: SvgCreatureProps) {
  return (
    <>
      <ellipse cx="50" cy="91" rx="24" ry="5" fill="black" opacity="0.28"/>
      {/* Streamlined body */}
      <ellipse cx="52" cy="66" rx="28" ry="18" fill={primary}/>
      {/* White belly */}
      <ellipse cx="50" cy="68" rx="18" ry="12" fill={secondary} opacity="0.8"/>
      {/* Tail – flat paddle shape */}
      <path d="M78,62 C90,58 96,52 92,46" stroke={primary} strokeWidth="8" fill="none" strokeLinecap="round"/>
      <ellipse cx="92" cy="44" rx="8" ry="5" fill={secondary} transform="rotate(-25 92 44)"/>
      {/* Rear paws */}
      <ellipse cx="66" cy="82" rx="10" ry="6" fill={primary}/>
      <ellipse cx="40" cy="82" rx="10" ry="6" fill={primary}/>
      {/* Webbing on paws */}
      <path d="M60,80 L64,86 L68,80" stroke={accent} strokeWidth="1" fill="none" opacity="0.7"/>
      <path d="M34,80 L38,86 L42,80" stroke={accent} strokeWidth="1" fill="none" opacity="0.7"/>
      {/* Neck + head */}
      <ellipse cx="26" cy="58" rx="14" ry="12" fill={primary}/>
      <circle cx="20" cy="46" r="17" fill={primary}/>
      {/* Ears – rounded */}
      <circle cx="12" cy="36" r="7" fill={primary}/>
      <circle cx="28" cy="33" r="6" fill={primary}/>
      <circle cx="12" cy="36" r="4" fill={secondary} opacity="0.5"/>
      {/* Snout */}
      <ellipse cx="10" cy="50" rx="10" ry="7" fill={secondary}/>
      <ellipse cx="7" cy="47" rx="4" ry="3" fill="#003355"/>
      {/* Nose shine */}
      <circle cx="6" cy="46" r="1.5" fill="white" opacity="0.6"/>
      {/* Whiskers */}
      <line x1="10" y1="50" x2="-2" y2="48" stroke={accent} strokeWidth="1" opacity="0.7"/>
      <line x1="10" y1="52" x2="-2" y2="53" stroke={accent} strokeWidth="1" opacity="0.7"/>
      <line x1="10" y1="50" x2="0" y2="44" stroke={accent} strokeWidth="1" opacity="0.7"/>
      {/* Eyes */}
      <circle cx="18" cy="44" r="5.5" fill="white"/>
      <circle cx="18" cy="44" r="3" fill="#001133"/>
      <circle cx="19.5" cy="42.5" r="1.2" fill="white"/>
      {/* Water droplet markings */}
      <ellipse cx="46" cy="60" rx="3" ry="4" fill={accent} opacity="0.4" transform="rotate(10 46 60)"/>
      <ellipse cx="58" cy="58" rx="2" ry="3" fill={accent} opacity="0.3" transform="rotate(-10 58 58)"/>
    </>
  );
}

/** SeaJellyfish – glowing jellyfish with tentacles */
export function SeaJellySvg({ primary, secondary, accent }: SvgCreatureProps) {
  return (
    <>
      {/* Tentacles */}
      {[18,28,38,50,62,72,82].map((x,i)=>(
        <path key={i} d={`M${x},62 C${x-4+i},76 ${x+3-i},86 ${x-2+i},95`}
          stroke={secondary} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7"/>
      ))}
      {/* Inner tentacles thinner */}
      {[32,50,68].map((x,i)=>(
        <path key={i} d={`M${x},64 C${x+2},80 ${x-2},92 ${x+1},100`}
          stroke={accent} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5"/>
      ))}
      {/* Bell body */}
      <ellipse cx="50" cy="38" rx="36" ry="30" fill={primary} opacity="0.75"/>
      <ellipse cx="50" cy="32" rx="28" ry="22" fill={secondary} opacity="0.6"/>
      {/* Inner glow core */}
      <ellipse cx="50" cy="28" rx="18" ry="14" fill={accent} opacity="0.5"/>
      <ellipse cx="50" cy="26" rx="10" ry="8" fill="white" opacity="0.3"/>
      {/* Bioluminescent ring dots */}
      {[30,40,50,60,70].map((x,i)=>(
        <circle key={i} cx={x} cy={54} r="2.5" fill={accent} opacity="0.7"/>
      ))}
      {/* Eyes */}
      <circle cx="43" cy="32" r="6" fill="white" opacity="0.9"/>
      <circle cx="57" cy="32" r="6" fill="white" opacity="0.9"/>
      <circle cx="43" cy="32" r="3.5" fill={primary}/>
      <circle cx="57" cy="32" r="3.5" fill={primary}/>
      <circle cx="44" cy="30.5" r="1.5" fill="white"/>
      <circle cx="58" cy="30.5" r="1.5" fill="white"/>
      {/* Crown fringe */}
      {[20,30,40,50,60,70,80].map((x,i)=>(
        <ellipse key={i} cx={x} cy={10} rx="3.5" ry={5+i%2*2} fill={secondary} opacity="0.65"/>
      ))}
    </>
  );
}

/** SeaSerpent – coiled leviathan with horns and fins */
export function SeaSerpentSvg({ primary, secondary, accent }: SvgCreatureProps) {
  return (
    <>
      <ellipse cx="50" cy="91" rx="22" ry="5" fill="black" opacity="0.28"/>
      {/* Coiled tail lower body */}
      <path d="M30,90 C10,80 8,60 20,52 C30,44 40,50 38,60 C36,68 28,70 30,78 C32,84 38,86 42,82" stroke={secondary} strokeWidth="16" fill="none" strokeLinecap="round"/>
      {/* Mid coil */}
      <path d="M42,82 C60,78 68,62 58,54 C50,48 44,54 48,62 C52,70 62,68 64,76 C66,82 60,88 54,86" stroke={primary} strokeWidth="14" fill="none" strokeLinecap="round"/>
      {/* Dorsal fins along body */}
      <polygon points="18,58 12,44 22,52" fill={accent} opacity="0.7"/>
      <polygon points="30,50 26,36 34,44" fill={accent} opacity="0.7"/>
      <polygon points="58,52 56,38 64,46" fill={accent} opacity="0.7"/>
      {/* Neck rising */}
      <path d="M54,86 C58,74 60,58 56,44" stroke={primary} strokeWidth="16" fill="none" strokeLinecap="round"/>
      {/* Head */}
      <ellipse cx="54" cy="30" rx="16" ry="12" fill={primary}/>
      {/* Horns */}
      <path d="M46,22 L40,8" stroke={secondary} strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M52,19 L48,4" stroke={secondary} strokeWidth="3" strokeLinecap="round"/>
      {/* Neck frill */}
      <polygon points="40,36 32,28 42,30" fill={accent} opacity="0.7"/>
      <polygon points="68,36 76,28 66,30" fill={accent} opacity="0.7"/>
      {/* Jaw */}
      <path d="M40,36 C44,42 64,42 68,36" fill={secondary} opacity="0.8"/>
      {/* Teeth */}
      <polygon points="46,36 44,42 48,36" fill="white"/>
      <polygon points="56,36 54,42 58,36" fill="white"/>
      {/* Eye */}
      <circle cx="48" cy="28" r="6" fill={accent}/>
      <ellipse cx="48" cy="28" rx="2.5" ry="5" fill="#0A001A"/>
      <circle cx="49" cy="26.5" r="1.2" fill="white"/>
    </>
  );
}

// ── NATURE archetypes ────────────────────────────────────────────────────────

/** Treant – ancient tree guardian with branch arms */
export function TreantSvg({ primary, secondary, accent }: SvgCreatureProps) {
  return (
    <>
      <ellipse cx="50" cy="91" rx="26" ry="5" fill="black" opacity="0.28"/>
      {/* Root legs */}
      <path d="M36,86 C28,82 22,80 18,88" stroke={primary} strokeWidth="9" fill="none" strokeLinecap="round"/>
      <path d="M36,86 C32,84 30,90 26,94" stroke={primary} strokeWidth="7" fill="none" strokeLinecap="round"/>
      <path d="M64,86 C72,82 78,80 82,88" stroke={primary} strokeWidth="9" fill="none" strokeLinecap="round"/>
      <path d="M64,86 C68,84 70,90 74,94" stroke={primary} strokeWidth="7" fill="none" strokeLinecap="round"/>
      {/* Trunk body */}
      <rect x="34" y="40" width="32" height="48" rx="8" fill={primary}/>
      {/* Bark texture lines */}
      <path d="M38,50 C40,46 44,44 48,48" stroke={secondary} strokeWidth="1.5" fill="none" opacity="0.7"/>
      <path d="M40,62 C44,58 50,56 54,60" stroke={secondary} strokeWidth="1.5" fill="none" opacity="0.7"/>
      <path d="M52,50 C56,46 60,48 60,54" stroke={secondary} strokeWidth="1.5" fill="none" opacity="0.6"/>
      <path d="M38,72 C42,68 48,70 50,76" stroke={secondary} strokeWidth="1.5" fill="none" opacity="0.5"/>
      {/* Left branch arm */}
      <path d="M36,52 C24,46 14,40 10,28" stroke={primary} strokeWidth="10" fill="none" strokeLinecap="round"/>
      <path d="M10,28 C6,18 10,10 16,8" stroke={primary} strokeWidth="6" fill="none" strokeLinecap="round"/>
      <path d="M10,28 C4,24 0,16 6,12" stroke={primary} strokeWidth="5" fill="none" strokeLinecap="round"/>
      {/* Right branch arm */}
      <path d="M64,52 C76,46 86,40 90,28" stroke={primary} strokeWidth="10" fill="none" strokeLinecap="round"/>
      <path d="M90,28 C94,18 90,10 84,8" stroke={primary} strokeWidth="6" fill="none" strokeLinecap="round"/>
      <path d="M90,28 C96,24 100,16 94,12" stroke={primary} strokeWidth="5" fill="none" strokeLinecap="round"/>
      {/* Leaf clusters on branches */}
      <circle cx="12" cy="9" r="8" fill={accent} opacity="0.9"/>
      <circle cx="6" cy="14" r="6" fill={secondary} opacity="0.8"/>
      <circle cx="18" cy="6" r="7" fill={accent} opacity="0.85"/>
      <circle cx="84" cy="9" r="8" fill={accent} opacity="0.9"/>
      <circle cx="92" cy="14" r="6" fill={secondary} opacity="0.8"/>
      <circle cx="88" cy="4" r="7" fill={accent} opacity="0.85"/>
      {/* Face – knothole eyes in bark */}
      <ellipse cx="44" cy="44" rx="7" ry="6" fill={secondary}/>
      <ellipse cx="56" cy="44" rx="7" ry="6" fill={secondary}/>
      <circle cx="44" cy="44" r="4" fill={accent}/>
      <circle cx="56" cy="44" r="4" fill={accent}/>
      <circle cx="44" cy="44" r="2" fill="#0A0A00"/>
      <circle cx="56" cy="44" r="2" fill="#0A0A00"/>
      <circle cx="45" cy="43" r="0.8" fill="white"/>
      <circle cx="57" cy="43" r="0.8" fill="white"/>
      {/* Moss patch on head/crown */}
      <ellipse cx="50" cy="36" rx="20" ry="8" fill={accent} opacity="0.7"/>
      <ellipse cx="40" cy="32" rx="8" ry="6" fill={secondary} opacity="0.8"/>
      <ellipse cx="60" cy="32" rx="8" ry="6" fill={secondary} opacity="0.8"/>
    </>
  );
}

/** VineSprite – small vine fairy with flower crown */
export function VineSpriteSvg({ primary, secondary, accent }: SvgCreatureProps) {
  return (
    <>
      {/* Vine hair tendrils */}
      <path d="M34,44 C22,34 14,20 20,10" stroke={primary} strokeWidth="4" fill="none" strokeLinecap="round"/>
      <path d="M40,40 C32,26 34,12 40,6" stroke={secondary} strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M66,44 C78,34 86,20 80,10" stroke={primary} strokeWidth="4" fill="none" strokeLinecap="round"/>
      <path d="M60,40 C68,26 66,12 60,6" stroke={secondary} strokeWidth="3" fill="none" strokeLinecap="round"/>
      {/* Flowers at tendril tips */}
      <circle cx="20" cy="9" r="6" fill={accent}/>
      <circle cx="40" cy="4" r="5" fill={secondary}/>
      <circle cx="80" cy="9" r="6" fill={accent}/>
      <circle cx="60" cy="4" r="5" fill={secondary}/>
      {/* Leaf wings */}
      <path d="M28,54 C10,48 4,36 14,28 C22,22 34,34 36,50" fill={accent} opacity="0.75"/>
      <path d="M72,54 C90,48 96,36 86,28 C78,22 66,34 64,50" fill={accent} opacity="0.75"/>
      {/* Wing veins */}
      <path d="M28,54 C18,46 14,36 18,30" stroke={secondary} strokeWidth="1" fill="none" opacity="0.6"/>
      <path d="M72,54 C82,46 86,36 82,30" stroke={secondary} strokeWidth="1" fill="none" opacity="0.6"/>
      {/* Vine-wrapped body */}
      <circle cx="50" cy="60" r="22" fill={primary}/>
      <circle cx="50" cy="60" r="17" fill={secondary} opacity="0.7"/>
      {/* Vine wrapping on body */}
      <path d="M32,54 C36,48 44,46 50,50 C56,46 64,48 68,54" stroke={primary} strokeWidth="2.5" fill="none" opacity="0.9"/>
      <path d="M30,62 C34,56 42,54 50,58 C58,54 66,56 70,62" stroke={primary} strokeWidth="2.5" fill="none" opacity="0.9"/>
      {/* Flower on chest */}
      <circle cx="50" cy="58" r="7" fill={accent}/>
      <circle cx="50" cy="58" r="4" fill="white" opacity="0.7"/>
      {/* Arms – vine tendrils */}
      <path d="M30,62 C16,58 10,68 14,76" stroke={primary} strokeWidth="5" fill="none" strokeLinecap="round"/>
      <path d="M70,62 C84,58 90,68 86,76" stroke={primary} strokeWidth="5" fill="none" strokeLinecap="round"/>
      {/* Tiny hands – flower buds */}
      <circle cx="14" cy="77" r="5" fill={accent}/>
      <circle cx="86" cy="77" r="5" fill={accent}/>
      {/* Legs */}
      <path d="M42,80 C38,88 36,94 38,98" stroke={primary} strokeWidth="5" fill="none" strokeLinecap="round"/>
      <path d="M58,80 C62,88 64,94 62,98" stroke={primary} strokeWidth="5" fill="none" strokeLinecap="round"/>
      {/* Eyes */}
      <circle cx="44" cy="58" r="6" fill="white"/>
      <circle cx="56" cy="58" r="6" fill="white"/>
      <circle cx="44" cy="58" r="3.5" fill="#002200"/>
      <circle cx="56" cy="58" r="3.5" fill="#002200"/>
      <circle cx="45" cy="56.5" r="1.4" fill="white"/>
      <circle cx="57" cy="56.5" r="1.4" fill="white"/>
    </>
  );
}

/** NatureWolf – thorn-spiked wolf with leaf mane */
export function NatureWolfSvg({ primary, secondary, accent }: SvgCreatureProps) {
  return (
    <>
      <ellipse cx="52" cy="91" rx="26" ry="5" fill="black" opacity="0.28"/>
      {/* Body */}
      <ellipse cx="55" cy="65" rx="26" ry="19" fill={primary}/>
      {/* Thorn spines along back */}
      {[42,50,58,66,74].map((x,i)=>(
        <polygon key={i} points={`${x},${56-i*1.5} ${x-4},${44-i} ${x+4},${44-i}`} fill={accent}/>
      ))}
      {/* Leaf mane */}
      <path d="M32,54 C28,38 36,26 44,30 C48,32 50,40 48,50" fill={secondary} opacity="0.85"/>
      <path d="M36,58 C26,46 30,30 40,28 C46,26 50,36 46,52" fill={accent} opacity="0.75"/>
      <path d="M38,64 C24,58 22,40 34,34 C42,30 48,42 44,58" fill={secondary} opacity="0.65"/>
      {/* Rear legs */}
      <rect x="68" y="78" width="9" height="14" rx="4" fill={secondary}/>
      <rect x="58" y="80" width="8" height="12" rx="4" fill={secondary}/>
      {/* Front legs */}
      <rect x="35" y="79" width="9" height="14" rx="4" fill={secondary}/>
      <rect x="46" y="81" width="8" height="12" rx="4" fill={secondary}/>
      {/* Vine wrapping on legs */}
      <path d="M35,82 C39,80 43,82 46,80" stroke={accent} strokeWidth="1.5" fill="none" opacity="0.8"/>
      <path d="M68,82 C72,80 76,82 77,80" stroke={accent} strokeWidth="1.5" fill="none" opacity="0.8"/>
      {/* Tail – leaf-fanned */}
      <path d="M80,64 C92,54 96,40 88,30" stroke={primary} strokeWidth="7" fill="none" strokeLinecap="round"/>
      <path d="M88,28 C86,16 94,10 90,22" fill={accent} opacity="0.7"/>
      {/* Neck + head */}
      <ellipse cx="32" cy="58" rx="13" ry="14" fill={primary}/>
      <circle cx="22" cy="46" r="19" fill={primary}/>
      {/* Ears – leaf-shaped */}
      <path d="M8,36 C10,22 20,18 22,32" fill={secondary}/>
      <path d="M10,36 C12,26 18,22 20,32" fill={accent} opacity="0.7"/>
      <path d="M26,32 C30,18 38,16 36,30" fill={secondary}/>
      <path d="M28,32 C30,22 36,20 34,30" fill={accent} opacity="0.7"/>
      {/* Snout */}
      <ellipse cx="9" cy="50" rx="11" ry="8" fill={secondary}/>
      <ellipse cx="6" cy="47" rx="3.5" ry="2.5" fill="#0A1A00"/>
      {/* Eye */}
      <circle cx="20" cy="43" r="6" fill={accent}/>
      <circle cx="20" cy="43" r="3" fill="#0A1A00"/>
      <circle cx="21.5" cy="41.5" r="1.2" fill="white"/>
    </>
  );
}

/** ForestBeast – round mushroom/forest critter */
export function ForestBeastSvg({ primary, secondary, accent }: SvgCreatureProps) {
  return (
    <>
      <ellipse cx="50" cy="90" rx="22" ry="5" fill="black" opacity="0.28"/>
      {/* Mushroom cap hat */}
      <ellipse cx="50" cy="22" rx="34" ry="14" fill={accent}/>
      <ellipse cx="50" cy="26" rx="26" ry="8" fill={secondary} opacity="0.5"/>
      {/* Stem under cap */}
      <rect x="40" y="22" width="20" height="10" rx="3" fill={secondary} opacity="0.8"/>
      {/* Polka dots on cap */}
      <circle cx="34" cy="18" r="4" fill="white" opacity="0.7"/>
      <circle cx="50" cy="14" r="5" fill="white" opacity="0.7"/>
      <circle cx="66" cy="18" r="4" fill="white" opacity="0.7"/>
      <circle cx="42" cy="22" r="3" fill="white" opacity="0.5"/>
      <circle cx="58" cy="22" r="3" fill="white" opacity="0.5"/>
      {/* Round body */}
      <circle cx="50" cy="62" r="28" fill={primary}/>
      {/* Belly lighter spot */}
      <ellipse cx="50" cy="66" rx="17" ry="14" fill={secondary} opacity="0.65"/>
      {/* Arms */}
      <path d="M24,58 C10,54 4,62 8,72" stroke={primary} strokeWidth="9" fill="none" strokeLinecap="round"/>
      <path d="M76,58 C90,54 96,62 92,72" stroke={primary} strokeWidth="9" fill="none" strokeLinecap="round"/>
      {/* Tiny claws */}
      <polygon points="6,74 2,80 10,78" fill={accent}/>
      <polygon points="94,74 90,80 98,78" fill={accent}/>
      {/* Stubby legs */}
      <ellipse cx="38" cy="86" rx="10" ry="7" fill={secondary}/>
      <ellipse cx="62" cy="86" rx="10" ry="7" fill={secondary}/>
      {/* Eyes */}
      <circle cx="42" cy="58" r="8" fill="white"/>
      <circle cx="58" cy="58" r="8" fill="white"/>
      <circle cx="42" cy="58" r="5" fill="#002200"/>
      <circle cx="58" cy="58" r="5" fill="#002200"/>
      <circle cx="43.5" cy="56" r="2" fill="white"/>
      <circle cx="59.5" cy="56" r="2" fill="white"/>
      {/* Mouth */}
      <path d="M43,68 Q50,74 57,68" stroke={accent} strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Fangs */}
      <polygon points="46,68 44,74 48,68" fill="white"/>
      <polygon points="54,68 52,74 56,68" fill="white"/>
    </>
  );
}

// ── ELECTRIC archetypes ──────────────────────────────────────────────────────

/** ThunderHawk – spread-wing raptor with lightning markings */
export function ThunderHawkSvg({ primary, secondary, accent }: SvgCreatureProps) {
  return (
    <>
      {/* Spread left wing */}
      <path d="M50,48 C36,38 18,26 2,22 C8,30 10,40 16,44 C10,42 8,50 14,52 C8,52 8,60 16,58 L50,56" fill={primary}/>
      {/* Wing markings left */}
      <path d="M14,48 C22,40 32,38 40,44" stroke={accent} strokeWidth="2" fill="none" opacity="0.7"/>
      <path d="M16,54 C26,48 36,46 44,50" stroke={accent} strokeWidth="1.5" fill="none" opacity="0.6"/>
      {/* Lightning bolt on left wing */}
      <polygon points="26,32 22,42 28,40 24,52 32,38 26,40" fill={accent} opacity="0.9"/>
      {/* Spread right wing */}
      <path d="M50,48 C64,38 82,26 98,22 C92,30 90,40 84,44 C90,42 92,50 86,52 C92,52 92,60 84,58 L50,56" fill={primary}/>
      {/* Wing markings right */}
      <path d="M86,48 C78,40 68,38 60,44" stroke={accent} strokeWidth="2" fill="none" opacity="0.7"/>
      <path d="M84,54 C74,48 64,46 56,50" stroke={accent} strokeWidth="1.5" fill="none" opacity="0.6"/>
      {/* Lightning bolt on right wing */}
      <polygon points="74,32 78,42 72,40 76,52 68,38 74,40" fill={accent} opacity="0.9"/>
      {/* Body center */}
      <ellipse cx="50" cy="52" rx="14" ry="10" fill={secondary}/>
      {/* Head */}
      <circle cx="50" cy="36" r="14" fill={secondary}/>
      {/* Beak */}
      <polygon points="50,38 40,46 48,40" fill={accent}/>
      {/* Crest */}
      <polygon points="44,26 46,14 50,22 54,14 56,26" fill={accent}/>
      {/* Eyes */}
      <circle cx="44" cy="34" r="5" fill={accent}/>
      <circle cx="56" cy="34" r="5" fill={accent}/>
      <circle cx="44" cy="34" r="2.5" fill="#0A0A00"/>
      <circle cx="56" cy="34" r="2.5" fill="#0A0A00"/>
      <circle cx="45" cy="33" r="1" fill="white"/>
      <circle cx="57" cy="33" r="1" fill="white"/>
      {/* Electric sparks at wing tips */}
      <circle cx="2" cy="22" r="4" fill={accent} opacity="0.8"/>
      <circle cx="98" cy="22" r="4" fill={accent} opacity="0.8"/>
      {/* Talons */}
      <path d="M42,60 C38,68 34,74 30,78" stroke={secondary} strokeWidth="5" fill="none" strokeLinecap="round"/>
      <path d="M58,60 C62,68 66,74 70,78" stroke={secondary} strokeWidth="5" fill="none" strokeLinecap="round"/>
      <polygon points="26,80 30,78 28,86" fill={accent}/>
      <polygon points="74,80 70,78 72,86" fill={accent}/>
    </>
  );
}

/** LightningFox – kitsune fox with electric multi-tails */
export function LightningFoxSvg({ primary, secondary, accent }: SvgCreatureProps) {
  return (
    <>
      <ellipse cx="50" cy="91" rx="24" ry="5" fill="black" opacity="0.28"/>
      {/* Three electric tails fanning upward */}
      <path d="M70,68 C80,58 90,44 86,28" stroke={primary} strokeWidth="7" fill="none" strokeLinecap="round"/>
      <path d="M70,68 C84,54 96,36 96,18" stroke={secondary} strokeWidth="6" fill="none" strokeLinecap="round"/>
      <path d="M70,68 C78,52 88,32 100,20" stroke={primary} strokeWidth="5" fill="none" strokeLinecap="round"/>
      {/* Lightning tips on tails */}
      <polygon points="86,26 80,22 88,18 82,14 90,12" fill={accent} opacity="0.9"/>
      <polygon points="96,16 90,12 98,8 92,4 100,2" fill={accent} opacity="0.85"/>
      <polygon points="100,18 94,14 102,10 96,6 104,4" fill={accent} opacity="0.8"/>
      {/* Body */}
      <ellipse cx="50" cy="66" rx="24" ry="18" fill={primary}/>
      {/* Belly lighter patch */}
      <ellipse cx="48" cy="68" rx="14" ry="12" fill={secondary} opacity="0.7"/>
      {/* Hind legs */}
      <rect x="56" y="78" width="10" height="14" rx="5" fill={secondary}/>
      <rect x="36" y="79" width="10" height="13" rx="5" fill={secondary}/>
      {/* Front legs */}
      <rect x="42" y="78" width="9" height="14" rx="5" fill={secondary}/>
      <rect x="28" y="80" width="8" height="12" rx="5" fill={secondary}/>
      {/* Lightning marking on body */}
      <path d="M50,56 L46,66 L52,64 L48,76" stroke={accent} strokeWidth="2" fill="none" opacity="0.9"/>
      {/* Neck */}
      <ellipse cx="32" cy="58" rx="12" ry="14" fill={primary}/>
      {/* Head */}
      <circle cx="22" cy="46" r="18" fill={primary}/>
      {/* Ears – pointed */}
      <polygon points="8,36 14,14 24,32" fill={primary}/>
      <polygon points="10,36 14,20 22,32" fill={accent} opacity="0.6"/>
      <polygon points="24,31 30,12 36,28" fill={primary}/>
      <polygon points="26,31 30,18 34,28" fill={accent} opacity="0.6"/>
      {/* Snout – narrow fox */}
      <path d="M4,50 C8,56 14,58 16,54" fill={secondary}/>
      <ellipse cx="6" cy="49" rx="3" ry="2.5" fill="#0A0A00"/>
      <circle cx="5" cy="47.5" r="1" fill="white" opacity="0.5"/>
      {/* Eyes */}
      <circle cx="18" cy="43" r="6" fill={accent}/>
      <ellipse cx="18" cy="43" rx="2.5" ry="5" fill="#0A0A00"/>
      <circle cx="19" cy="41" r="1.2" fill="white"/>
      {/* Electric sparks floating */}
      <path d="M8,36 L4,30 L8,28 L6,22" stroke={accent} strokeWidth="1.5" fill="none" opacity="0.6"/>
      <path d="M32,30 L28,24 L32,22 L30,16" stroke={accent} strokeWidth="1.5" fill="none" opacity="0.5"/>
    </>
  );
}

/** ElectricRay – plasma manta with discharge fields */
export function ElectricRaySvg({ primary, secondary, accent }: SvgCreatureProps) {
  return (
    <>
      {/* Main ray flat diamond body */}
      <path d="M50,18 C72,24 90,40 88,58 C86,68 70,76 50,78 C30,76 14,68 12,58 C10,40 28,24 50,18" fill={primary}/>
      {/* Wing tips – extended */}
      <path d="M12,58 C4,52 -4,42 2,32 C8,24 16,28 22,38" fill={secondary} opacity="0.9"/>
      <path d="M88,58 C96,52 104,42 98,32 C92,24 84,28 78,38" fill={secondary} opacity="0.9"/>
      {/* Underbelly glow */}
      <ellipse cx="50" cy="54" rx="26" ry="18" fill={accent} opacity="0.35"/>
      <ellipse cx="50" cy="54" rx="14" ry="10" fill="white" opacity="0.2"/>
      {/* Electric discharge patterns on wings */}
      <path d="M22,38 C28,34 36,32 42,38" stroke={accent} strokeWidth="2" fill="none" opacity="0.8"/>
      <path d="M78,38 C72,34 64,32 58,38" stroke={accent} strokeWidth="2" fill="none" opacity="0.8"/>
      <path d="M14,52 C20,46 30,44 38,50" stroke={accent} strokeWidth="1.5" fill="none" opacity="0.6"/>
      <path d="M86,52 C80,46 70,44 62,50" stroke={accent} strokeWidth="1.5" fill="none" opacity="0.6"/>
      {/* Arc bolts along edges */}
      <polygon points="6,36 2,42 8,38 4,46 12,40" fill={accent} opacity="0.8"/>
      <polygon points="94,36 98,42 92,38 96,46 88,40" fill={accent} opacity="0.8"/>
      {/* Head horns */}
      <path d="M44,20 L36,8" stroke={secondary} strokeWidth="3" strokeLinecap="round"/>
      <path d="M56,20 L64,8" stroke={secondary} strokeWidth="3" strokeLinecap="round"/>
      {/* Horn tips glow */}
      <circle cx="35" cy="7" r="4" fill={accent} opacity="0.9"/>
      <circle cx="65" cy="7" r="4" fill={accent} opacity="0.9"/>
      {/* Eyes */}
      <circle cx="40" cy="38" r="6" fill={accent}/>
      <circle cx="60" cy="38" r="6" fill={accent}/>
      <circle cx="40" cy="38" r="3.5" fill="#0A0A00"/>
      <circle cx="60" cy="38" r="3.5" fill="#0A0A00"/>
      <circle cx="41" cy="36.5" r="1.4" fill="white"/>
      <circle cx="61" cy="36.5" r="1.4" fill="white"/>
      {/* Tail */}
      <path d="M50,78 C52,86 54,92 50,96" stroke={primary} strokeWidth="5" fill="none" strokeLinecap="round"/>
      <path d="M50,92 C54,90 58,94 50,98" stroke={accent} strokeWidth="2" fill="none" strokeLinecap="round"/>
    </>
  );
}

/** StormGolem – cloud humanoid with lightning arms */
export function StormGolemSvg({ primary, secondary, accent }: SvgCreatureProps) {
  return (
    <>
      <ellipse cx="50" cy="92" rx="22" ry="4" fill="black" opacity="0.25"/>
      {/* Cloud legs */}
      <ellipse cx="38" cy="80" rx="14" ry="12" fill={primary}/>
      <ellipse cx="62" cy="80" rx="14" ry="12" fill={primary}/>
      <ellipse cx="38" cy="86" rx="10" ry="8" fill={secondary} opacity="0.8"/>
      <ellipse cx="62" cy="86" rx="10" ry="8" fill={secondary} opacity="0.8"/>
      {/* Main cloud body */}
      <ellipse cx="50" cy="62" rx="26" ry="20" fill={primary}/>
      <ellipse cx="36" cy="58" rx="16" ry="14" fill={primary}/>
      <ellipse cx="64" cy="58" rx="16" ry="14" fill={primary}/>
      <ellipse cx="50" cy="50" rx="20" ry="16" fill={secondary} opacity="0.7"/>
      {/* Lightning left arm */}
      <path d="M26,60 L12,52 L18,48 L8,38 L16,34 L6,24 L14,22" stroke={accent} strokeWidth="4" fill="none" strokeLinejoin="round" strokeLinecap="round"/>
      <circle cx="14" cy="20" r="6" fill={accent} opacity="0.9"/>
      {/* Lightning right arm */}
      <path d="M74,60 L88,52 L82,48 L92,38 L84,34 L94,24 L86,22" stroke={accent} strokeWidth="4" fill="none" strokeLinejoin="round" strokeLinecap="round"/>
      <circle cx="86" cy="20" r="6" fill={accent} opacity="0.9"/>
      {/* Storm crown – cloud + bolt */}
      <ellipse cx="50" cy="30" rx="22" ry="12" fill={primary}/>
      <ellipse cx="36" cy="26" rx="12" ry="9" fill={primary}/>
      <ellipse cx="64" cy="26" rx="12" ry="9" fill={primary}/>
      <polygon points="50,38 44,24 50,28 46,14 54,28 50,24" fill={accent} opacity="0.9"/>
      {/* Face void */}
      <ellipse cx="50" cy="52" rx="18" ry="12" fill="#0A0A1A" opacity="0.6"/>
      {/* Electric eyes */}
      <circle cx="42" cy="50" r="7" fill={accent}/>
      <circle cx="58" cy="50" r="7" fill={accent}/>
      <polygon points="42,44 38,52 42,49 38,57 46,49 42,52" fill="white" opacity="0.9"/>
      <polygon points="58,44 54,52 58,49 54,57 62,49 58,52" fill="white" opacity="0.9"/>
    </>
  );
}

// ── DARK archetypes ──────────────────────────────────────────────────────────

/** ShadowCat – void panther with shadow tendrils */
export function ShadowCatSvg({ primary, secondary, accent }: SvgCreatureProps) {
  return (
    <>
      <ellipse cx="52" cy="91" rx="25" ry="5" fill="black" opacity="0.3"/>
      {/* Shadow tendrils */}
      <path d="M70,72 C84,64 94,50 98,32" stroke={secondary} strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.6"/>
      <path d="M72,76 C90,72 100,62 104,44" stroke={accent} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.5"/>
      <path d="M68,80 C80,78 90,74 96,62" stroke={secondary} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.4"/>
      {/* Body */}
      <ellipse cx="54" cy="66" rx="28" ry="18" fill={primary}/>
      {/* Void patches on body */}
      <ellipse cx="50" cy="64" rx="18" ry="12" fill={secondary} opacity="0.5"/>
      {/* Tail */}
      <path d="M80,64 C92,56 98,44 90,32 C86,26 80,30 82,38 C84,44 88,44 84,50" stroke={primary} strokeWidth="8" fill="none" strokeLinecap="round"/>
      {/* Rear legs */}
      <rect x="68" y="78" width="10" height="15" rx="5" fill={primary}/>
      <rect x="56" y="80" width="9" height="13" rx="5" fill={primary}/>
      {/* Front legs */}
      <rect x="36" y="79" width="10" height="15" rx="5" fill={primary}/>
      <rect x="47" y="81" width="9" height="13" rx="5" fill={primary}/>
      {/* Claws */}
      <polygon points="34,94 32,100 38,96" fill={accent}/>
      <polygon points="40,96 38,102 44,98" fill={accent}/>
      <polygon points="66,94 64,100 70,96" fill={accent}/>
      <polygon points="72,96 70,102 76,98" fill={accent}/>
      {/* Neck */}
      <ellipse cx="30" cy="60" rx="13" ry="14" fill={primary}/>
      {/* Head */}
      <ellipse cx="20" cy="47" rx="20" ry="17" fill={primary}/>
      {/* Ears – pointed with void inner */}
      <polygon points="4,36 10,14 20,32" fill={primary}/>
      <polygon points="6,36 10,20 18,32" fill={accent} opacity="0.7"/>
      <polygon points="22,30 28,10 34,27" fill={primary}/>
      <polygon points="24,30 28,16 32,27" fill={accent} opacity="0.7"/>
      {/* Muzzle */}
      <ellipse cx="8" cy="51" rx="12" ry="9" fill={secondary} opacity="0.9"/>
      <ellipse cx="6" cy="48" rx="4" ry="3" fill="#0A001A"/>
      {/* Eyes – glowing void */}
      <circle cx="16" cy="43" r="7" fill={accent}/>
      <circle cx="16" cy="43" r="3.5" fill="#0A001A"/>
      <circle cx="17.5" cy="41.5" r="1.5" fill={accent} opacity="0.8"/>
      {/* Second eye glow ring */}
      <circle cx="16" cy="43" r="7" fill="none" stroke={accent} strokeWidth="1" opacity="0.4"/>
    </>
  );
}

/** VoidWraith – ghostly floating specter */
export function VoidWraithSvg({ primary, secondary, accent }: SvgCreatureProps) {
  return (
    <>
      {/* Trailing void body – fades to nothing */}
      <path d="M30,92 C34,80 46,74 50,68 C54,74 66,80 70,92 C62,96 50,100 38,96 Z" fill={primary} opacity="0.3"/>
      <path d="M34,84 C38,74 46,68 50,62 C54,68 62,74 66,84 C58,90 50,94 42,90 Z" fill={secondary} opacity="0.5"/>
      <path d="M38,76 C42,66 46,62 50,56 C54,62 58,66 62,76 C56,82 50,86 44,82 Z" fill={primary} opacity="0.7"/>
      {/* Tattered robe/cloak */}
      <path d="M26,70 C22,56 24,42 30,34 C34,28 44,24 50,28 C56,24 66,28 70,34 C76,42 78,56 74,70" fill={primary}/>
      {/* Cloak ragged bottom */}
      <path d="M26,70 C24,76 20,80 22,86" stroke={primary} strokeWidth="5" fill="none" strokeLinecap="round"/>
      <path d="M74,70 C76,76 80,80 78,86" stroke={primary} strokeWidth="5" fill="none" strokeLinecap="round"/>
      <path d="M40,72 C38,80 36,84 34,90" stroke={secondary} strokeWidth="4" fill="none" strokeLinecap="round"/>
      <path d="M60,72 C62,80 64,84 66,90" stroke={secondary} strokeWidth="4" fill="none" strokeLinecap="round"/>
      {/* Arms reaching out */}
      <path d="M28,52 C14,46 4,50 2,60" stroke={primary} strokeWidth="7" fill="none" strokeLinecap="round"/>
      <path d="M72,52 C86,46 96,50 98,60" stroke={primary} strokeWidth="7" fill="none" strokeLinecap="round"/>
      {/* Skeletal hands */}
      <path d="M2,62 L-2,70 M2,62 L0,72 M2,62 L4,72" stroke={accent} strokeWidth="2" strokeLinecap="round"/>
      <path d="M98,62 L102,70 M98,62 L100,72 M98,62 L96,72" stroke={accent} strokeWidth="2" strokeLinecap="round"/>
      {/* Face – hollow and haunting */}
      <ellipse cx="50" cy="36" rx="20" ry="18" fill={secondary}/>
      {/* Hollow eye sockets */}
      <ellipse cx="42" cy="34" rx="7" ry="8" fill="#0A0015"/>
      <ellipse cx="58" cy="34" rx="7" ry="8" fill="#0A0015"/>
      {/* Eye glow within sockets */}
      <ellipse cx="42" cy="34" rx="4" ry="5" fill={accent} opacity="0.9"/>
      <ellipse cx="58" cy="34" rx="4" ry="5" fill={accent} opacity="0.9"/>
      <circle cx="42" cy="34" r="2" fill="white" opacity="0.5"/>
      <circle cx="58" cy="34" r="2" fill="white" opacity="0.5"/>
      {/* Grim mouth */}
      <path d="M40,48 C44,52 56,52 60,48" stroke={accent} strokeWidth="2" fill="none" strokeLinecap="round"/>
      <polygon points="44,48 42,54 46,48" fill={accent} opacity="0.7"/>
      <polygon points="52,48 50,54 54,48" fill={accent} opacity="0.7"/>
      {/* Void crown */}
      <path d="M30,24 C32,16 38,12 42,18 C42,10 46,4 50,8 C54,4 58,10 58,18 C62,12 68,16 70,24" fill={accent} opacity="0.6"/>
    </>
  );
}

/** DarkBird – eclipse raven with shadow wing trails */
export function DarkBirdSvg({ primary, secondary, accent }: SvgCreatureProps) {
  return (
    <>
      {/* Shadow trails on left wing */}
      <path d="M50,52 C30,40 10,26 -4,18" stroke={secondary} strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.4"/>
      <path d="M50,52 C26,38 6,28 -6,24" stroke={secondary} strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.3"/>
      {/* Shadow trails on right wing */}
      <path d="M50,52 C70,40 90,26 104,18" stroke={secondary} strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.4"/>
      <path d="M50,52 C74,38 94,28 106,24" stroke={secondary} strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.3"/>
      {/* Left wing main */}
      <path d="M50,52 C36,42 16,30 4,22 C8,32 12,42 18,48 C10,46 8,54 14,56 C8,56 10,64 18,60 L50,58" fill={primary}/>
      {/* Right wing main */}
      <path d="M50,52 C64,42 84,30 96,22 C92,32 88,42 82,48 C90,46 92,54 86,56 C92,56 90,64 82,60 L50,58" fill={primary}/>
      {/* Wing feather details */}
      <path d="M22,56 C28,48 36,46 44,50" stroke={secondary} strokeWidth="1.5" fill="none" opacity="0.6"/>
      <path d="M78,56 C72,48 64,46 56,50" stroke={secondary} strokeWidth="1.5" fill="none" opacity="0.6"/>
      <path d="M18,62 C26,56 36,54 44,58" stroke={accent} strokeWidth="1" fill="none" opacity="0.4"/>
      <path d="M82,62 C74,56 64,54 56,58" stroke={accent} strokeWidth="1" fill="none" opacity="0.4"/>
      {/* Body */}
      <ellipse cx="50" cy="54" rx="12" ry="9" fill={secondary}/>
      {/* Head */}
      <circle cx="50" cy="38" r="14" fill={secondary}/>
      {/* Dark crown */}
      <path d="M40,28 C42,18 46,14 50,18 C54,14 58,18 60,28" fill={primary}/>
      {/* Beak */}
      <polygon points="50,42 40,50 48,43" fill={accent}/>
      {/* Eyes – glowing evil */}
      <circle cx="43" cy="36" r="5.5" fill={accent}/>
      <circle cx="57" cy="36" r="5.5" fill={accent}/>
      <circle cx="43" cy="36" r="2.5" fill="#0A0015"/>
      <circle cx="57" cy="36" r="2.5" fill="#0A0015"/>
      <circle cx="44" cy="35" r="1" fill={accent} opacity="0.7"/>
      <circle cx="58" cy="35" r="1" fill={accent} opacity="0.7"/>
      {/* Talons */}
      <path d="M42,62 C38,70 34,76 30,80" stroke={secondary} strokeWidth="5" fill="none" strokeLinecap="round"/>
      <path d="M58,62 C62,70 66,76 70,80" stroke={secondary} strokeWidth="5" fill="none" strokeLinecap="round"/>
      <polygon points="26,82 30,80 28,88" fill={accent}/>
      <polygon points="74,82 70,80 72,88" fill={accent}/>
    </>
  );
}

/** ShadowGolem – void-cracked armor construct */
export function ShadowGolemSvg({ primary, secondary, accent }: SvgCreatureProps) {
  return (
    <>
      <ellipse cx="50" cy="92" rx="24" ry="4" fill="black" opacity="0.3"/>
      {/* Legs armored */}
      <rect x="30" y="72" width="16" height="22" rx="5" fill={secondary}/>
      <rect x="54" y="72" width="16" height="22" rx="5" fill={secondary}/>
      {/* Void cracks on legs */}
      <path d="M34,76 L36,84 L34,90" stroke={accent} strokeWidth="1.5" fill="none"/>
      <path d="M58,76 L60,84 L58,90" stroke={accent} strokeWidth="1.5" fill="none"/>
      {/* Body torso – wide armored */}
      <rect x="22" y="38" width="56" height="36" rx="6" fill={secondary}/>
      {/* Void crack patterns on body */}
      <path d="M36,44 L40,56 L36,64" stroke={accent} strokeWidth="2" fill="none"/>
      <path d="M50,40 L48,52 L52,60 L50,68" stroke={accent} strokeWidth="2" fill="none"/>
      <path d="M64,44 L60,56 L64,64" stroke={accent} strokeWidth="2" fill="none"/>
      <path d="M30,52 L42,54 L32,58" stroke={accent} strokeWidth="1.5" fill="none"/>
      <path d="M68,52 L56,54 L68,58" stroke={accent} strokeWidth="1.5" fill="none"/>
      {/* Shoulder pauldrons */}
      <ellipse cx="20" cy="44" rx="12" ry="10" fill={primary}/>
      <ellipse cx="80" cy="44" rx="12" ry="10" fill={primary}/>
      {/* Arm left */}
      <rect x="6" y="46" width="14" height="28" rx="5" fill={secondary}/>
      {/* Arm right */}
      <rect x="80" y="46" width="14" height="28" rx="5" fill={secondary}/>
      {/* Fist left */}
      <rect x="4" y="70" width="18" height="14" rx="4" fill={primary}/>
      {/* Fist right */}
      <rect x="78" y="70" width="18" height="14" rx="4" fill={primary}/>
      {/* Void energy dripping from fists */}
      <path d="M8,84 C6,90 4,94 6,98" stroke={accent} strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
      <path d="M14,84 C14,92 12,96 14,100" stroke={accent} strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
      <path d="M92,84 C94,90 96,94 94,98" stroke={accent} strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
      {/* Helmet */}
      <rect x="28" y="12" width="44" height="30" rx="8" fill={secondary}/>
      <rect x="24" y="20" width="52" height="16" rx="4" fill={primary}/>
      {/* Visor – pure void */}
      <rect x="30" y="22" width="40" height="12" rx="3" fill="#0A0015"/>
      {/* Eyes in void visor */}
      <ellipse cx="38" cy="28" rx="5" ry="4" fill={accent}/>
      <ellipse cx="62" cy="28" rx="5" ry="4" fill={accent}/>
      <ellipse cx="38" cy="28" rx="2.5" ry="2" fill="white" opacity="0.6"/>
      <ellipse cx="62" cy="28" rx="2.5" ry="2" fill="white" opacity="0.6"/>
      {/* Crown spikes */}
      <polygon points="36,14 32,2 40,10" fill={accent} opacity="0.7"/>
      <polygon points="50,12 46,0 54,0 58,12" fill={accent} opacity="0.8"/>
      <polygon points="64,14 60,2 68,10" fill={accent} opacity="0.7"/>
    </>
  );
}

// ── NEW FIRE archetypes ───────────────────────────────────────────────────────

/** EmberMoth – large moth with flame-coloured wing eyespots */
export function EmberMothSvg({ primary, secondary, accent }: SvgCreatureProps) {
  return (
    <>
      {/* Left wing */}
      <path d="M50,55 C32,44 10,36 4,20 C2,12 12,8 20,18 C26,26 30,38 38,48" fill={primary} opacity="0.9"/>
      <path d="M50,55 C36,50 16,52 8,42 C4,36 10,28 20,34 C28,38 36,46 44,52" fill={secondary} opacity="0.8"/>
      {/* Right wing */}
      <path d="M50,55 C68,44 90,36 96,20 C98,12 88,8 80,18 C74,26 70,38 62,48" fill={primary} opacity="0.9"/>
      <path d="M50,55 C64,50 84,52 92,42 C96,36 90,28 80,34 C72,38 64,46 56,52" fill={secondary} opacity="0.8"/>
      {/* Eyespot left wing */}
      <circle cx="22" cy="24" r="9" fill={secondary}/>
      <circle cx="22" cy="24" r="6" fill={primary}/>
      <circle cx="22" cy="24" r="3" fill={accent}/>
      {/* Eyespot right wing */}
      <circle cx="78" cy="24" r="9" fill={secondary}/>
      <circle cx="78" cy="24" r="6" fill={primary}/>
      <circle cx="78" cy="24" r="3" fill={accent}/>
      {/* Body */}
      <ellipse cx="50" cy="58" rx="8" ry="18" fill={secondary}/>
      {/* Head */}
      <circle cx="50" cy="38" r="10" fill={secondary}/>
      {/* Antennae */}
      <path d="M46,30 C40,18 34,10 30,4" stroke={primary} strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M54,30 C60,18 66,10 70,4" stroke={primary} strokeWidth="2" fill="none" strokeLinecap="round"/>
      <circle cx="30" cy="4" r="4" fill={accent}/>
      <circle cx="70" cy="4" r="4" fill={accent}/>
      {/* Eyes */}
      <circle cx="46" cy="37" r="3" fill={accent}/><circle cx="54" cy="37" r="3" fill={accent}/>
      <circle cx="46" cy="37" r="1.5" fill="#0A0000"/><circle cx="54" cy="37" r="1.5" fill="#0A0000"/>
    </>
  );
}

/** CinderSerpent – coiled fire snake with swept-back crest */
export function CinderSerpentSvg({ primary, secondary, accent }: SvgCreatureProps) {
  return (
    <>
      <ellipse cx="50" cy="91" rx="22" ry="5" fill="black" opacity="0.25"/>
      {/* Coiled lower body */}
      <path d="M28,88 C8,80 6,62 18,54 C28,46 38,54 36,64 C34,72 24,72 28,82 C30,88 38,90 44,86" stroke={secondary} strokeWidth="14" fill="none" strokeLinecap="round"/>
      {/* Upper coil */}
      <path d="M44,86 C60,82 68,66 56,58 C46,52 40,60 46,68 C50,74 60,72 62,80" stroke={primary} strokeWidth="12" fill="none" strokeLinecap="round"/>
      {/* Scale dots */}
      {[0,1,2,3,4].map(i=><circle key={i} cx={22+i*5} cy={74-i*4} r="2" fill={accent} opacity="0.6"/>)}
      {/* Neck rising */}
      <path d="M62,80 C66,68 64,52 60,40" stroke={primary} strokeWidth="13" fill="none" strokeLinecap="round"/>
      {/* Head */}
      <ellipse cx="58" cy="28" rx="15" ry="10" fill={primary}/>
      {/* Fire crest spikes */}
      <polygon points="52,22 48,8 56,18" fill={accent} opacity="0.9"/>
      <polygon points="60,20 58,4 65,16" fill={accent} opacity="0.85"/>
      <polygon points="68,22 70,8 72,20" fill={accent} opacity="0.75"/>
      {/* Jaw */}
      <path d="M44,32 C50,38 66,36 70,32" fill={secondary} opacity="0.9"/>
      {/* Tongue */}
      <path d="M44,32 L36,30 M36,30 L32,26 M36,30 L32,34" stroke={accent} strokeWidth="1.5" strokeLinecap="round"/>
      {/* Eye */}
      <ellipse cx="52" cy="26" rx="5" ry="4" fill={accent}/>
      <ellipse cx="52" cy="26" rx="2" ry="3.5" fill="#0A0000"/>
      <circle cx="53" cy="25" r="1" fill="white"/>
    </>
  );
}

/** LavaCrab – wide magma crab with glowing shell cracks */
export function LavaCrabSvg({ primary, secondary, accent }: SvgCreatureProps) {
  return (
    <>
      <ellipse cx="50" cy="91" rx="30" ry="5" fill="black" opacity="0.28"/>
      {/* Shell dome */}
      <ellipse cx="50" cy="58" rx="34" ry="26" fill={primary}/>
      <ellipse cx="50" cy="54" rx="28" ry="20" fill={secondary} opacity="0.6"/>
      {/* Lava crack patterns */}
      <path d="M36,46 L42,56 L36,66" stroke={accent} strokeWidth="2.5" fill="none" opacity="0.9"/>
      <path d="M50,40 L48,54 L54,62 L50,70" stroke={accent} strokeWidth="2" fill="none" opacity="0.9"/>
      <path d="M64,46 L58,56 L64,66" stroke={accent} strokeWidth="2.5" fill="none" opacity="0.9"/>
      <path d="M38,54 L50,58 L62,54" stroke={accent} strokeWidth="1.5" fill="none" opacity="0.7"/>
      {/* Left big claw */}
      <path d="M18,56 C4,48 -2,38 4,28" stroke={secondary} strokeWidth="11" fill="none" strokeLinecap="round"/>
      <path d="M4,26 C-2,18 2,10 8,14" stroke={secondary} strokeWidth="8" fill="none" strokeLinecap="round"/>
      <path d="M6,26 C0,20 2,10 10,16" stroke={primary} strokeWidth="6" fill="none" strokeLinecap="round"/>
      {/* Right big claw */}
      <path d="M82,56 C96,48 102,38 96,28" stroke={secondary} strokeWidth="11" fill="none" strokeLinecap="round"/>
      <path d="M96,26 C102,18 98,10 92,14" stroke={secondary} strokeWidth="8" fill="none" strokeLinecap="round"/>
      <path d="M94,26 C100,20 98,10 90,16" stroke={primary} strokeWidth="6" fill="none" strokeLinecap="round"/>
      {/* Legs (3 per side) */}
      {[-14,-4,6].map((dy,i)=><line key={i} x1={24} y1={68+dy} x2={10} y2={76+dy} stroke={secondary} strokeWidth="5" strokeLinecap="round"/>)}
      {[-14,-4,6].map((dy,i)=><line key={i} x1={76} y1={68+dy} x2={90} y2={76+dy} stroke={secondary} strokeWidth="5" strokeLinecap="round"/>)}
      {/* Face with glowing eyes on stalks */}
      <line x1="44" y1="82" x2="40" y2="90" stroke={secondary} strokeWidth="3"/>
      <line x1="56" y1="82" x2="60" y2="90" stroke={secondary} strokeWidth="3"/>
      <circle cx="40" cy="91" r="5" fill={accent}/>
      <circle cx="60" cy="91" r="5" fill={accent}/>
      <circle cx="40" cy="91" r="2.5" fill="#0A0000"/>
      <circle cx="60" cy="91" r="2.5" fill="#0A0000"/>
    </>
  );
}

/** FlameHatch – battle chick bursting out of a fire egg */
export function FlameHatchSvg({ primary, secondary, accent }: SvgCreatureProps) {
  return (
    <>
      {/* Fire burst from cracks */}
      <path d="M28,60 C14,50 8,36 16,24 C10,22 6,14 14,12 C12,4 22,2 26,12 C30,8 38,10 34,20" fill={accent} opacity="0.7"/>
      <path d="M72,60 C86,50 92,36 84,24 C90,22 94,14 86,12 C88,4 78,2 74,12 C70,8 62,10 66,20" fill={accent} opacity="0.7"/>
      <path d="M50,36 C46,24 38,14 40,4 C44,0 50,4 50,12 C50,4 56,0 60,4 C62,14 54,24 50,36" fill={accent} opacity="0.85"/>
      {/* Egg lower half */}
      <path d="M18,68 C16,84 30,96 50,96 C70,96 84,84 82,68 Z" fill={secondary}/>
      {/* Egg upper halves (cracked apart) */}
      <path d="M18,68 C18,54 28,38 50,36 C26,40 20,56 22,68 Z" fill={secondary}/>
      <path d="M82,68 C82,54 72,38 50,36 C74,40 80,56 78,68 Z" fill={secondary}/>
      {/* Crack lines */}
      <path d="M38,68 L32,56 L42,48 L36,36" stroke={primary} strokeWidth="2" fill="none"/>
      <path d="M62,68 L68,56 L58,48 L64,36" stroke={primary} strokeWidth="2" fill="none"/>
      {/* Chick body peeking out */}
      <circle cx="50" cy="46" r="20" fill={primary}/>
      {/* Wing stubs */}
      <ellipse cx="34" cy="52" rx="10" ry="7" fill={secondary} transform="rotate(-20 34 52)"/>
      <ellipse cx="66" cy="52" rx="10" ry="7" fill={secondary} transform="rotate(20 66 52)"/>
      {/* Tuft on head */}
      <path d="M44,30 C42,20 46,12 50,18 C50,10 54,6 58,12 C62,16 58,26 56,30" fill={accent} opacity="0.9"/>
      {/* Beak */}
      <polygon points="50,50 44,56 56,56" fill={accent}/>
      {/* Eyes */}
      <circle cx="43" cy="44" r="6" fill="white"/><circle cx="57" cy="44" r="6" fill="white"/>
      <circle cx="43" cy="44" r="3.5" fill="#0A0000"/><circle cx="57" cy="44" r="3.5" fill="#0A0000"/>
      <circle cx="44" cy="42.5" r="1.5" fill="white"/><circle cx="58" cy="42.5" r="1.5" fill="white"/>
    </>
  );
}

// ── NEW WATER archetypes ──────────────────────────────────────────────────────

/** TidalCrab – tall asymmetric crab with one enormous dominant claw */
export function TidalCrabSvg({ primary, secondary, accent }: SvgCreatureProps) {
  return (
    <>
      <ellipse cx="50" cy="91" rx="24" ry="5" fill="black" opacity="0.25"/>
      {/* Narrow body */}
      <ellipse cx="54" cy="66" rx="20" ry="18" fill={primary}/>
      {/* Shell pattern */}
      <path d="M44,54 C48,50 56,50 62,54" stroke={secondary} strokeWidth="2" fill="none" opacity="0.7"/>
      <path d="M40,62 C46,56 60,56 66,62" stroke={secondary} strokeWidth="2" fill="none" opacity="0.7"/>
      {/* GIANT left claw */}
      <path d="M36,62 C18,52 4,42 2,28" stroke={primary} strokeWidth="14" fill="none" strokeLinecap="round"/>
      <ellipse cx="6" cy="22" rx="14" ry="10" fill={secondary} transform="rotate(-30 6 22)"/>
      <path d="M-4,18 C0,10 10,12 8,20" fill={primary}/>
      <path d="M8,14 C12,6 18,10 14,18" fill={primary}/>
      {/* Small right claw */}
      <path d="M72,60 C84,54 90,46 88,36" stroke={primary} strokeWidth="7" fill="none" strokeLinecap="round"/>
      <path d="M88,34 C90,28 86,22 82,26" stroke={secondary} strokeWidth="5" fill="none" strokeLinecap="round"/>
      <path d="M88,34 C92,26 96,24 94,30" stroke={secondary} strokeWidth="4" fill="none" strokeLinecap="round"/>
      {/* Legs */}
      {[-8,2,12].map((dy,i)=><line key={i} x1={44} y1={74+dy} x2={32} y2={82+dy} stroke={secondary} strokeWidth="4" strokeLinecap="round"/>)}
      {[-8,2,12].map((dy,i)=><line key={i} x1={64} y1={74+dy} x2={76} y2={82+dy} stroke={secondary} strokeWidth="4" strokeLinecap="round"/>)}
      {/* Eyes on stalks */}
      <line x1="50" y1="50" x2="46" y2="42" stroke={secondary} strokeWidth="2.5"/>
      <line x1="58" y1="50" x2="62" y2="42" stroke={secondary} strokeWidth="2.5"/>
      <circle cx="46" cy="41" r="5" fill={accent}/><circle cx="62" cy="41" r="5" fill={accent}/>
      <circle cx="46" cy="41" r="2.5" fill="#000A22"/><circle cx="62" cy="41" r="2.5" fill="#000A22"/>
    </>
  );
}

/** AbyssAngler – deep sea anglerfish with bioluminescent lure */
export function AbyssAnglerSvg({ primary, secondary, accent }: SvgCreatureProps) {
  return (
    <>
      {/* Wide compressed body */}
      <ellipse cx="50" cy="62" rx="36" ry="22" fill={primary}/>
      {/* Belly */}
      <ellipse cx="50" cy="66" rx="28" ry="14" fill={secondary} opacity="0.5"/>
      {/* Dorsal fin */}
      <path d="M30,42 C34,30 40,24 50,22 C60,24 66,30 70,42" fill={secondary} opacity="0.8"/>
      {/* Lure antenna */}
      <path d="M50,42 C52,30 56,18 52,8" stroke={secondary} strokeWidth="3" fill="none" strokeLinecap="round"/>
      <circle cx="52" cy="6" r="8" fill={accent} opacity="0.9"/>
      <circle cx="52" cy="6" r="5" fill="white" opacity="0.5"/>
      {/* Glow halo around lure */}
      <circle cx="52" cy="6" r="12" fill="none" stroke={accent} strokeWidth="2" opacity="0.4"/>
      {/* HUGE mouth */}
      <path d="M14,68 C18,82 38,90 50,90 C62,90 82,82 86,68" fill={secondary}/>
      {/* Teeth upper */}
      {[20,30,40,50,60,70,80].map((x,i)=><polygon key={i} points={`${x},68 ${x-3},58 ${x+3},58`} fill="white"/>)}
      {/* Teeth lower */}
      {[24,36,48,60,72].map((x,i)=><polygon key={i} points={`${x},82 ${x-3},90 ${x+3},90`} fill="white" opacity="0.8"/>)}
      {/* Eyes */}
      <circle cx="22" cy="54" r="10" fill={accent}/>
      <circle cx="22" cy="54" r="6" fill="#0A0025"/>
      <circle cx="24" cy="52" r="2.5" fill="white"/>
      <circle cx="78" cy="54" r="10" fill={accent}/>
      <circle cx="78" cy="54" r="6" fill="#0A0025"/>
      <circle cx="80" cy="52" r="2.5" fill="white"/>
      {/* Tail fin */}
      <path d="M86,62 C94,56 100,60 98,70 C100,80 92,80 86,72" fill={secondary} opacity="0.9"/>
      {/* Pectoral fins */}
      <ellipse cx="20" cy="74" rx="12" ry="6" fill={secondary} transform="rotate(-30 20 74)" opacity="0.8"/>
      <ellipse cx="80" cy="74" rx="12" ry="6" fill={secondary} transform="rotate(30 80 74)" opacity="0.8"/>
    </>
  );
}

/** GlacierGiant – massive ice-armored bear */
export function GlacierGiantSvg({ primary, secondary, accent }: SvgCreatureProps) {
  return (
    <>
      <ellipse cx="50" cy="92" rx="32" ry="5" fill="black" opacity="0.3"/>
      {/* Wide stocky body */}
      <ellipse cx="50" cy="62" rx="34" ry="28" fill={primary}/>
      {/* Ice shoulder plates */}
      <polygon points="18,44 6,30 22,26 28,44" fill={accent} opacity="0.85"/>
      <polygon points="22,40 8,24 26,22 30,40" fill="white" opacity="0.4"/>
      <polygon points="82,44 94,30 78,26 72,44" fill={accent} opacity="0.85"/>
      <polygon points="78,40 92,24 74,22 70,40" fill="white" opacity="0.4"/>
      {/* Belly fur lighter */}
      <ellipse cx="50" cy="68" rx="22" ry="18" fill={secondary} opacity="0.6"/>
      {/* Arms */}
      <ellipse cx="16" cy="66" rx="12" ry="20" fill={primary}/>
      <ellipse cx="84" cy="66" rx="12" ry="20" fill={primary}/>
      {/* Paws with claws */}
      <ellipse cx="14" cy="84" rx="14" ry="8" fill={secondary}/>
      <ellipse cx="86" cy="84" rx="14" ry="8" fill={secondary}/>
      {[8,12,16,20].map(x=><path key={x} d={`M${x},90 L${x-1},96`} stroke={accent} strokeWidth="2" strokeLinecap="round"/>)}
      {[80,84,88,92].map(x=><path key={x} d={`M${x},90 L${x+1},96`} stroke={accent} strokeWidth="2" strokeLinecap="round"/>)}
      {/* Legs */}
      <ellipse cx="36" cy="88" rx="12" ry="8" fill={secondary}/>
      <ellipse cx="64" cy="88" rx="12" ry="8" fill={secondary}/>
      {/* Round head */}
      <circle cx="50" cy="34" r="26" fill={primary}/>
      {/* Ice crown on head */}
      <polygon points="36,14 32,2 40,10 50,6 60,10 68,2 64,14" fill={accent} opacity="0.8"/>
      {/* Small round ears */}
      <circle cx="28" cy="18" r="10" fill={primary}/><circle cx="28" cy="18" r="6" fill={secondary} opacity="0.5"/>
      <circle cx="72" cy="18" r="10" fill={primary}/><circle cx="72" cy="18" r="6" fill={secondary} opacity="0.5"/>
      {/* Snout */}
      <ellipse cx="50" cy="42" rx="14" ry="10" fill={secondary}/>
      <ellipse cx="50" cy="38" rx="6" ry="4" fill="#001A33"/>
      <circle cx="48" cy="37" r="1.5" fill="white" opacity="0.5"/>
      {/* Frost breath */}
      <path d="M38,50 C32,58 24,62 16,60" stroke={accent} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6"/>
      {/* Eyes */}
      <circle cx="40" cy="30" r="7" fill={accent}/><circle cx="60" cy="30" r="7" fill={accent}/>
      <circle cx="40" cy="30" r="4" fill="#001A33"/><circle cx="60" cy="30" r="4" fill="#001A33"/>
      <circle cx="41" cy="28.5" r="1.5" fill="white"/><circle cx="61" cy="28.5" r="1.5" fill="white"/>
    </>
  );
}

/** TempestEel – sinuous eel with tall fin crest and striped markings */
export function TempestEelSvg({ primary, secondary, accent }: SvgCreatureProps) {
  return (
    <>
      {/* Sinuous S-body */}
      <path d="M70,88 C88,80 96,66 88,54 C80,42 64,44 60,56 C56,66 64,74 72,70 C80,66 82,54 74,46 C66,38 50,38 42,48 C34,58 38,72 48,74 C58,76 64,64 56,56 C48,48 34,46 22,54" stroke={secondary} strokeWidth="16" fill="none" strokeLinecap="round"/>
      <path d="M70,88 C88,80 96,66 88,54 C80,42 64,44 60,56 C56,66 64,74 72,70 C80,66 82,54 74,46 C66,38 50,38 42,48 C34,58 38,72 48,74 C58,76 64,64 56,56 C48,48 34,46 22,54" stroke={primary} strokeWidth="10" fill="none" strokeLinecap="round"/>
      {/* Dorsal fin crest */}
      {[[70,80],[64,62],[58,50],[52,46]].map(([cx,cy],i)=>(
        <ellipse key={i} cx={cx} cy={cy-10} rx="4" ry={10-i} fill={accent} opacity="0.8" transform={`rotate(${-20+i*5} ${cx} ${cy})`}/>
      ))}
      {/* Scale stripes on visible body sections */}
      <path d="M64,58 C66,54 70,52 74,56" stroke={accent} strokeWidth="1.5" fill="none" opacity="0.7"/>
      <path d="M52,70 C54,66 58,64 62,68" stroke={accent} strokeWidth="1.5" fill="none" opacity="0.7"/>
      {/* Tail fin */}
      <path d="M22,54 C10,52 4,58 8,66 C4,66 0,74 6,78" fill={secondary} opacity="0.9"/>
      {/* Head */}
      <ellipse cx="22" cy="54" rx="14" ry="10" fill={primary}/>
      {/* Whisker fins */}
      <path d="M12,50 C4,44 0,36 6,32" stroke={secondary} strokeWidth="4" fill="none" strokeLinecap="round"/>
      <path d="M14,48 C8,40 6,30 12,26" stroke={secondary} strokeWidth="3" fill="none" strokeLinecap="round"/>
      {/* Mouth */}
      <path d="M8,58 C12,64 22,64 30,58" fill={secondary} opacity="0.9"/>
      {/* Eye */}
      <circle cx="22" cy="50" r="6" fill={accent}/>
      <circle cx="22" cy="50" r="3.5" fill="#000A22"/>
      <circle cx="23.5" cy="49" r="1.5" fill="white"/>
    </>
  );
}

// ── NEW NATURE archetypes ─────────────────────────────────────────────────────

/** FernFox – fox with huge fan-shaped leaf ears and vine-wrapped tail */
export function FernFoxSvg({ primary, secondary, accent }: SvgCreatureProps) {
  return (
    <>
      <ellipse cx="50" cy="91" rx="24" ry="5" fill="black" opacity="0.25"/>
      {/* Body */}
      <ellipse cx="52" cy="66" rx="24" ry="17" fill={primary}/>
      {/* Belly patch */}
      <ellipse cx="50" cy="68" rx="14" ry="11" fill={secondary} opacity="0.7"/>
      {/* Vine-wrapped bushy tail */}
      <path d="M74,60 C88,52 94,38 86,26" stroke={primary} strokeWidth="9" fill="none" strokeLinecap="round"/>
      <path d="M86,24 C84,14 90,8 88,18" fill={accent} opacity="0.8"/>
      <path d="M76,54 C88,50 92,42 88,32" stroke={accent} strokeWidth="2" strokeDasharray="3,3" fill="none" opacity="0.7"/>
      {/* Hind legs */}
      <rect x="62" y="78" width="10" height="14" rx="5" fill={secondary}/>
      <rect x="38" y="79" width="9" height="13" rx="5" fill={secondary}/>
      {/* Front legs */}
      <rect x="46" y="80" width="9" height="13" rx="5" fill={secondary}/>
      <rect x="30" y="81" width="8" height="12" rx="5" fill={secondary}/>
      {/* Neck */}
      <ellipse cx="32" cy="58" rx="12" ry="14" fill={primary}/>
      {/* Head */}
      <circle cx="22" cy="46" r="18" fill={primary}/>
      {/* FAN-SHAPED LEAF EARS — the distinctive feature */}
      <path d="M4,32 C-2,16 4,2 14,10 C18,14 18,24 16,32" fill={accent} opacity="0.9"/>
      <path d="M4,32 C2,22 6,12 12,14" stroke={secondary} strokeWidth="1" fill="none" opacity="0.7"/>
      <path d="M6,32 C8,22 10,14 14,16" stroke={secondary} strokeWidth="1" fill="none" opacity="0.7"/>
      <path d="M28,26 C26,10 36,0 42,10 C44,16 40,26 36,28" fill={accent} opacity="0.9"/>
      <path d="M28,26 C30,16 34,10 38,12" stroke={secondary} strokeWidth="1" fill="none" opacity="0.7"/>
      {/* Leaf veins on ears */}
      <path d="M8,30 L12,14" stroke={secondary} strokeWidth="1.5" fill="none" opacity="0.5"/>
      <path d="M30,26 L38,10" stroke={secondary} strokeWidth="1.5" fill="none" opacity="0.5"/>
      {/* Snout */}
      <ellipse cx="9" cy="50" rx="10" ry="7" fill={secondary}/>
      <ellipse cx="6" cy="47" rx="3.5" ry="2.5" fill="#0A1A00"/>
      {/* Eye */}
      <circle cx="20" cy="43" r="6" fill={accent}/>
      <circle cx="20" cy="43" r="3" fill="#0A1A00"/>
      <circle cx="21.5" cy="41.5" r="1.2" fill="white"/>
      {/* Leaf spot markings on body */}
      <ellipse cx="56" cy="60" rx="4" ry="6" fill={accent} opacity="0.3" transform="rotate(-20 56 60)"/>
      <ellipse cx="62" cy="68" rx="3" ry="5" fill={accent} opacity="0.25" transform="rotate(15 62 68)"/>
    </>
  );
}

/** ThornSerpent – coiled nature serpent bristling with thorn spines */
export function ThornSerpentSvg({ primary, secondary, accent }: SvgCreatureProps) {
  return (
    <>
      <ellipse cx="50" cy="92" rx="24" ry="5" fill="black" opacity="0.25"/>
      {/* Coil lower */}
      <path d="M32,88 C12,80 10,60 24,52 C34,44 44,52 42,62 C40,70 30,70 32,80 C34,88 42,90 48,86" stroke={secondary} strokeWidth="15" fill="none" strokeLinecap="round"/>
      {/* Thorn spines on lower coil */}
      {[[22,66],[26,58],[30,52]].map(([cx,cy],i)=>(
        <polygon key={i} points={`${cx},${cy} ${cx-6},${cy-12} ${cx+6},${cy-12}`} fill={accent} opacity="0.85"/>
      ))}
      {/* Coil upper */}
      <path d="M48,86 C64,80 72,64 60,56 C50,50 44,58 50,66 C54,72 64,70 66,78" stroke={primary} strokeWidth="13" fill="none" strokeLinecap="round"/>
      {/* Neck */}
      <path d="M66,78 C70,66 68,50 64,38" stroke={primary} strokeWidth="12" fill="none" strokeLinecap="round"/>
      {/* Thorn spines along neck */}
      {[[60,72],[62,62],[62,52]].map(([cx,cy],i)=>(
        <polygon key={i} points={`${cx},${cy} ${cx-5},${cy-10} ${cx+1},${cy-10}`} fill={accent} opacity="0.85"/>
      ))}
      {/* Head – triangular */}
      <polygon points="50,22 72,32 72,46 50,52 28,46 28,32" fill={primary}/>
      {/* Head thorn crown */}
      <polygon points="50,22 44,6 50,16" fill={accent} opacity="0.9"/>
      <polygon points="58,24 64,8 60,20" fill={accent} opacity="0.85"/>
      <polygon points="42,24 36,8 40,20" fill={accent} opacity="0.85"/>
      {/* Scale detail */}
      <path d="M36,36 C40,32 46,32 50,36" stroke={secondary} strokeWidth="1.5" fill="none" opacity="0.7"/>
      <path d="M50,36 C54,32 60,32 64,36" stroke={secondary} strokeWidth="1.5" fill="none" opacity="0.7"/>
      {/* Tongue */}
      <path d="M50,50 L44,58 M50,50 L50,60 M50,50 L56,58" stroke={accent} strokeWidth="1.5" strokeLinecap="round"/>
      {/* Eyes */}
      <ellipse cx="38" cy="38" rx="5" ry="6" fill={accent}/>
      <ellipse cx="38" cy="38" rx="2" ry="4" fill="#0A1A00"/>
      <ellipse cx="62" cy="38" rx="5" ry="6" fill={accent}/>
      <ellipse cx="62" cy="38" rx="2" ry="4" fill="#0A1A00"/>
    </>
  );
}

/** BloomBee – giant nature bee with petal wing patterns */
export function BloomBeeSvg({ primary, secondary, accent }: SvgCreatureProps) {
  return (
    <>
      <ellipse cx="50" cy="91" rx="20" ry="5" fill="black" opacity="0.25"/>
      {/* Upper wing pair (translucent with petal veins) */}
      <ellipse cx="26" cy="38" rx="22" ry="14" fill={accent} opacity="0.5" transform="rotate(-25 26 38)"/>
      <path d="M34,38 C28,28 20,24 14,30" stroke={secondary} strokeWidth="1.5" fill="none" opacity="0.7"/>
      <path d="M32,42 C24,34 16,32 10,40" stroke={secondary} strokeWidth="1.5" fill="none" opacity="0.7"/>
      <ellipse cx="74" cy="38" rx="22" ry="14" fill={accent} opacity="0.5" transform="rotate(25 74 38)"/>
      <path d="M66,38 C72,28 80,24 86,30" stroke={secondary} strokeWidth="1.5" fill="none" opacity="0.7"/>
      <path d="M68,42 C76,34 84,32 90,40" stroke={secondary} strokeWidth="1.5" fill="none" opacity="0.7"/>
      {/* Lower wing pair */}
      <ellipse cx="30" cy="52" rx="16" ry="10" fill={accent} opacity="0.35" transform="rotate(-15 30 52)"/>
      <ellipse cx="70" cy="52" rx="16" ry="10" fill={accent} opacity="0.35" transform="rotate(15 70 52)"/>
      {/* Bee body – plump with stripes */}
      <ellipse cx="50" cy="68" rx="18" ry="22" fill={secondary}/>
      <ellipse cx="50" cy="60" rx="18" ry="8" fill={primary}/>
      <ellipse cx="50" cy="72" rx="18" ry="8" fill={primary}/>
      <ellipse cx="50" cy="82" rx="14" ry="6" fill={secondary}/>
      {/* Stinger */}
      <path d="M50,88 C48,94 50,98 52,94 Z" fill={accent}/>
      {/* Head */}
      <circle cx="50" cy="44" r="16" fill={secondary}/>
      {/* Flower face centre */}
      <circle cx="50" cy="44" r="8" fill={accent} opacity="0.8"/>
      <circle cx="50" cy="44" r="5" fill="white" opacity="0.6"/>
      {/* Antennae with flower buds */}
      <path d="M44,30 C38,20 32,12 28,6" stroke={primary} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M56,30 C62,20 68,12 72,6" stroke={primary} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <circle cx="28" cy="4" r="6" fill={accent}/>
      <circle cx="72" cy="4" r="6" fill={accent}/>
      {/* Flower petals on antenna tips */}
      {[-1,1].map(dx=>[0,90,180,270].map((rot,j)=>(
        <ellipse key={`${dx}${j}`} cx={28+dx*14} cy={4} rx="4" ry="2" fill={secondary} opacity="0.7" transform={`rotate(${rot} ${28+dx*14} 4)`}/>
      )))}
      {/* Eyes */}
      <circle cx="43" cy="42" r="5" fill="#002200"/><circle cx="57" cy="42" r="5" fill="#002200"/>
      <circle cx="44" cy="41" r="2" fill="white"/><circle cx="58" cy="41" r="2" fill="white"/>
    </>
  );
}

/** MossGolem – ancient moss-covered boulder creature */
export function MossGolemSvg({ primary, secondary, accent }: SvgCreatureProps) {
  return (
    <>
      <ellipse cx="50" cy="92" rx="28" ry="5" fill="black" opacity="0.3"/>
      {/* Main boulder body – very round */}
      <circle cx="50" cy="60" r="36" fill={primary}/>
      {/* Rock crack texture */}
      <path d="M34,44 L38,54 L32,62 L36,72" stroke={secondary} strokeWidth="1.5" fill="none" opacity="0.5"/>
      <path d="M62,40 L58,52 L66,60 L60,70" stroke={secondary} strokeWidth="1.5" fill="none" opacity="0.5"/>
      <path d="M46,78 L50,86 L54,78" stroke={secondary} strokeWidth="1.5" fill="none" opacity="0.4"/>
      {/* Moss patches */}
      <ellipse cx="30" cy="48" rx="12" ry="8" fill={accent} opacity="0.8"/>
      <ellipse cx="40" cy="38" rx="10" ry="7" fill={secondary} opacity="0.9"/>
      <ellipse cx="68" cy="50" rx="11" ry="7" fill={accent} opacity="0.75"/>
      <ellipse cx="58" cy="36" rx="9" ry="6" fill={secondary} opacity="0.8"/>
      <ellipse cx="50" cy="78" rx="14" ry="6" fill={accent} opacity="0.7"/>
      {/* Stumpy arms */}
      <circle cx="14" cy="62" r="12" fill={primary}/>
      <ellipse cx="10" cy="74" rx="10" ry="7" fill={secondary} opacity="0.8"/>
      <circle cx="86" cy="62" r="12" fill={primary}/>
      <ellipse cx="90" cy="74" rx="10" ry="7" fill={secondary} opacity="0.8"/>
      {/* Moss on arms */}
      <ellipse cx="12" cy="56" rx="7" ry="5" fill={accent} opacity="0.7"/>
      <ellipse cx="88" cy="56" rx="7" ry="5" fill={accent} opacity="0.7"/>
      {/* Stubby legs */}
      <ellipse cx="38" cy="94" rx="12" ry="7" fill={secondary}/>
      <ellipse cx="62" cy="94" rx="12" ry="7" fill={secondary}/>
      {/* Face — ancient knothole eyes */}
      <ellipse cx="42" cy="58" rx="9" ry="8" fill={secondary}/>
      <ellipse cx="58" cy="58" rx="9" ry="8" fill={secondary}/>
      <circle cx="42" cy="58" r="5" fill={accent}/>
      <circle cx="58" cy="58" r="5" fill={accent}/>
      <circle cx="42" cy="58" r="2.5" fill="#0A0A00"/>
      <circle cx="58" cy="58" r="2.5" fill="#0A0A00"/>
      <circle cx="43" cy="57" r="1" fill="white"/>
      <circle cx="59" cy="57" r="1" fill="white"/>
      {/* Grumpy mouth crack */}
      <path d="M40,70 C44,66 56,66 60,70" stroke={secondary} strokeWidth="2" fill="none" opacity="0.7"/>
    </>
  );
}

// ── NEW ELECTRIC archetypes ───────────────────────────────────────────────────

/** SparkRabbit – rabbit with enormous electric ears and zigzag markings */
export function SparkRabbitSvg({ primary, secondary, accent }: SvgCreatureProps) {
  return (
    <>
      <ellipse cx="50" cy="91" rx="20" ry="5" fill="black" opacity="0.25"/>
      {/* Electric tail puff */}
      <circle cx="78" cy="72" r="10" fill={secondary} opacity="0.8"/>
      <path d="M70,66 L76,60 L72,66 L78,58 L74,64 L82,56" stroke={accent} strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Body */}
      <ellipse cx="50" cy="68" rx="22" ry="19" fill={primary}/>
      {/* Belly */}
      <ellipse cx="50" cy="72" rx="14" ry="13" fill={secondary} opacity="0.7"/>
      {/* Hind legs */}
      <ellipse cx="36" cy="86" rx="12" ry="7" fill={secondary} transform="rotate(-20 36 86)"/>
      <ellipse cx="64" cy="86" rx="12" ry="7" fill={secondary} transform="rotate(20 64 86)"/>
      {/* Front paws */}
      <ellipse cx="34" cy="76" rx="8" ry="6" fill={primary}/>
      <ellipse cx="66" cy="76" rx="8" ry="6" fill={primary}/>
      {/* Lightning bolt on body */}
      <path d="M52,56 L46,68 L54,66 L48,80" stroke={accent} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.9"/>
      {/* Head */}
      <circle cx="50" cy="48" r="20" fill={primary}/>
      {/* HUGE electric ears */}
      <path d="M36,32 C30,10 36,-2 40,6 L42,32" fill={primary}/>
      <path d="M36,32 C34,16 36,6 39,8 L41,32" fill={accent} opacity="0.6"/>
      {/* Zigzag lightning on left ear */}
      <path d="M37,28 L35,20 L39,16 L37,8" stroke={accent} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M64,32 C70,10 64,-2 60,6 L58,32" fill={primary}/>
      <path d="M64,32 C66,16 64,6 61,8 L59,32" fill={accent} opacity="0.6"/>
      <path d="M63,28 L65,20 L61,16 L63,8" stroke={accent} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Static sparks floating near ears */}
      <path d="M28,24 L24,20 L28,18 L24,14" stroke={accent} strokeWidth="1.5" fill="none" opacity="0.7"/>
      <path d="M72,24 L76,20 L72,18 L76,14" stroke={accent} strokeWidth="1.5" fill="none" opacity="0.7"/>
      {/* Eyes */}
      <circle cx="43" cy="46" r="6" fill={accent}/><circle cx="57" cy="46" r="6" fill={accent}/>
      <circle cx="43" cy="46" r="3.5" fill="#0A0A00"/><circle cx="57" cy="46" r="3.5" fill="#0A0A00"/>
      <circle cx="44" cy="44.5" r="1.5" fill="white"/><circle cx="58" cy="44.5" r="1.5" fill="white"/>
      {/* Nose */}
      <ellipse cx="50" cy="54" rx="5" ry="3.5" fill={secondary}/>
      <ellipse cx="50" cy="53" rx="3" ry="2" fill="#0A0A00"/>
    </>
  );
}

/** ThunderWorm – massive segmented electric worm */
export function ThunderWormSvg({ primary, secondary, accent }: SvgCreatureProps) {
  return (
    <>
      {/* Body segments from tail to head (decreasing size) */}
      <ellipse cx="14" cy="72" rx="8" ry="7" fill={secondary} opacity="0.7"/>
      <ellipse cx="24" cy="76" rx="10" ry="9" fill={primary} opacity="0.8"/>
      <ellipse cx="36" cy="74" rx="12" ry="11" fill={secondary}/>
      {/* Electric arc between rear segments */}
      <path d="M22,68 L14,64 L22,62" stroke={accent} strokeWidth="1.5" fill="none" opacity="0.8"/>
      <ellipse cx="49" cy="68" rx="14" ry="13" fill={primary}/>
      {/* Electric arc between mid segments */}
      <path d="M38,62 L30,56 L38,52" stroke={accent} strokeWidth="2" fill="none" opacity="0.8"/>
      <ellipse cx="63" cy="58" rx="16" ry="15" fill={secondary}/>
      {/* Electric arc */}
      <path d="M52,50 L44,44 L52,40" stroke={accent} strokeWidth="2" fill="none" opacity="0.85"/>
      {/* Head segment */}
      <ellipse cx="76" cy="44" rx="18" ry="18" fill={primary}/>
      {/* Electric arc head→body */}
      <path d="M66,44 L58,38 L66,34" stroke={accent} strokeWidth="2.5" fill="none" opacity="0.9"/>
      {/* Little nub legs on each segment */}
      {[[14,72],[24,76],[36,74],[49,68],[63,58]].map(([cx,cy],i)=>(
        <g key={i}>
          <ellipse cx={cx-6} cy={cy+4} rx="5" ry="3" fill={secondary}/>
          <ellipse cx={cx+6} cy={cy+4} rx="5" ry="3" fill={secondary}/>
        </g>
      ))}
      {/* Tail tip */}
      <path d="M6,70 C0,68 -2,72 4,74" fill={secondary} opacity="0.8"/>
      {/* Head detail */}
      <ellipse cx="82" cy="36" rx="10" ry="8" fill={secondary} opacity="0.7"/>
      {/* Wide open mouth */}
      <path d="M60,50 C62,60 72,66 84,60 C92,56 94,46 90,38" fill={secondary}/>
      {/* Teeth */}
      {[64,70,76,82,88].map((x,i)=><polygon key={i} points={`${x},52 ${x-3},60 ${x+3},60`} fill="white" opacity="0.9"/>)}
      {/* Electric tongue */}
      <path d="M72,60 L68,70 L72,68 L68,78" stroke={accent} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Eyes */}
      <circle cx="70" cy="38" r="7" fill={accent}/><circle cx="82" cy="34" r="6" fill={accent}/>
      <circle cx="70" cy="38" r="4" fill="#0A0A00"/><circle cx="82" cy="34" r="3.5" fill="#0A0A00"/>
      <circle cx="71" cy="36.5" r="1.5" fill="white"/>
    </>
  );
}

/** VoltFish – armored angular fish with saw-blade dorsal fin */
export function VoltFishSvg({ primary, secondary, accent }: SvgCreatureProps) {
  return (
    <>
      {/* Main armored body – angular, not round */}
      <polygon points="10,50 30,30 72,24 90,40 86,70 66,82 28,78" fill={primary}/>
      {/* Armor scale plates */}
      <path d="M30,30 L36,42 L28,52 L34,64" stroke={secondary} strokeWidth="2" fill="none" opacity="0.7"/>
      <path d="M50,26 L52,40 L48,54 L52,68" stroke={secondary} strokeWidth="2" fill="none" opacity="0.7"/>
      <path d="M70,26 L68,40 L72,54 L68,68" stroke={secondary} strokeWidth="2" fill="none" opacity="0.7"/>
      {/* SAW-BLADE dorsal fin – the defining feature */}
      <polygon points="32,30 36,12 40,22 44,6 48,18 52,2 56,14 60,0 64,12 68,24 72,24" fill={accent} opacity="0.95"/>
      {/* Electric arcs along fin teeth */}
      <path d="M36,12 L40,8 L44,12" stroke="white" strokeWidth="1" fill="none" opacity="0.7"/>
      <path d="M52,2 L56,6 L60,2" stroke="white" strokeWidth="1" fill="none" opacity="0.7"/>
      {/* Belly lighter */}
      <polygon points="28,52 28,72 66,78 72,56 60,48 40,48" fill={secondary} opacity="0.5"/>
      {/* Tail fin */}
      <path d="M10,50 C-2,42 -6,34 4,28 C-4,28 -8,18 2,18 C-2,14 4,10 8,16 L28,30" fill={secondary} opacity="0.9"/>
      {/* Pectoral fin */}
      <path d="M34,64 C22,72 18,80 24,86" fill={secondary} opacity="0.8"/>
      {/* Head */}
      <ellipse cx="82" cy="52" rx="14" ry="16" fill={secondary}/>
      {/* Jaw */}
      <path d="M70,60 C76,70 84,72 92,66" fill={secondary} opacity="0.9"/>
      {/* Teeth */}
      <polygon points="74,62 72,70 76,62" fill="white"/><polygon points="80,64 78,72 82,64" fill="white"/>
      {/* Electric eye */}
      <circle cx="84" cy="48" r="8" fill={accent}/>
      <polygon points="84,42 80,50 84,47 80,55 88,47 84,50" fill="white" opacity="0.9"/>
      {/* Barbel with spark */}
      <path d="M70,64 C60,72 56,80 60,86" stroke={secondary} strokeWidth="3" fill="none" strokeLinecap="round"/>
      <circle cx="60" cy="87" r="4" fill={accent} opacity="0.8"/>
    </>
  );
}

/** TeslaOrb – floating orb with three orbital ring halos */
export function TeslaOrbSvg({ primary, secondary, accent }: SvgCreatureProps) {
  return (
    <>
      {/* Outer aura glow */}
      <circle cx="50" cy="50" r="32" fill={primary} opacity="0.2"/>
      {/* Orbital ring 1 (tilted) */}
      <ellipse cx="50" cy="50" rx="44" ry="12" fill="none" stroke={secondary} strokeWidth="4" opacity="0.7"/>
      <ellipse cx="50" cy="50" rx="44" ry="12" fill="none" stroke={accent} strokeWidth="2" opacity="0.5" transform="rotate(15 50 50)"/>
      {/* Orbital ring 2 */}
      <ellipse cx="50" cy="50" rx="38" ry="10" fill="none" stroke={secondary} strokeWidth="3" opacity="0.6" transform="rotate(60 50 50)"/>
      {/* Orbital ring 3 */}
      <ellipse cx="50" cy="50" rx="34" ry="8" fill="none" stroke={accent} strokeWidth="2.5" opacity="0.6" transform="rotate(-50 50 50)"/>
      {/* Electric sparks on ring intersections */}
      <circle cx="6" cy="50" r="4" fill={accent} opacity="0.9"/>
      <circle cx="94" cy="50" r="4" fill={accent} opacity="0.9"/>
      <circle cx="50" cy="12" r="3" fill={accent} opacity="0.7"/>
      <circle cx="50" cy="88" r="3" fill={accent} opacity="0.7"/>
      {/* Central sphere */}
      <circle cx="50" cy="50" r="22" fill={secondary}/>
      <circle cx="50" cy="50" r="16" fill={primary}/>
      {/* Inner core glow */}
      <circle cx="50" cy="50" r="10" fill={accent} opacity="0.7"/>
      <circle cx="50" cy="50" r="5" fill="white" opacity="0.5"/>
      {/* Tesla bolt crown at top of sphere */}
      <path d="M50,28 L44,38 L50,35 L44,46" stroke={accent} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.9"/>
      {/* Two glowing eyes in the sphere */}
      <ellipse cx="44" cy="50" rx="5" ry="4" fill="white" opacity="0.9"/>
      <ellipse cx="56" cy="50" rx="5" ry="4" fill="white" opacity="0.9"/>
      <ellipse cx="44" cy="50" rx="2.5" ry="2" fill="#0A0A00"/>
      <ellipse cx="56" cy="50" rx="2.5" ry="2" fill="#0A0A00"/>
      {/* Arc lightning between rings */}
      <path d="M14,38 L18,50 L14,62" stroke={accent} strokeWidth="1.5" fill="none" opacity="0.6"/>
      <path d="M86,38 L82,50 L86,62" stroke={accent} strokeWidth="1.5" fill="none" opacity="0.6"/>
    </>
  );
}

// ── NEW DARK archetypes ───────────────────────────────────────────────────────

/** NightHound – lean dark greyhound with shadow smoke trail */
export function NightHoundSvg({ primary, secondary, accent }: SvgCreatureProps) {
  return (
    <>
      <ellipse cx="50" cy="92" rx="22" ry="4" fill="black" opacity="0.3"/>
      {/* Shadow smoke trail from back */}
      <path d="M76,60 C86,52 94,40 98,24" stroke={secondary} strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.5"/>
      <path d="M78,64 C92,56 100,44 100,28" stroke={secondary} strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.3"/>
      <path d="M74,68 C90,64 98,52 100,38" stroke={accent} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.4"/>
      {/* Very lean elongated body */}
      <ellipse cx="55" cy="64" rx="30" ry="14" fill={primary}/>
      {/* Narrow waist */}
      <ellipse cx="52" cy="68" rx="14" ry="9" fill={secondary} opacity="0.4"/>
      {/* Thin long tail */}
      <path d="M84,60 C94,52 98,40 90,30 C86,24 80,28 82,36 C84,42 90,42 86,50" stroke={primary} strokeWidth="5" fill="none" strokeLinecap="round"/>
      {/* Long rear legs */}
      <rect x="70" y="74" width="7" height="20" rx="3" fill={secondary}/>
      <rect x="58" y="76" width="7" height="18" rx="3" fill={secondary}/>
      {/* Long front legs */}
      <rect x="38" y="74" width="7" height="20" rx="3" fill={secondary}/>
      <rect x="26" y="76" width="7" height="18" rx="3" fill={secondary}/>
      {/* Narrow neck */}
      <ellipse cx="28" cy="56" rx="10" ry="16" fill={primary}/>
      {/* Narrow elongated head */}
      <ellipse cx="16" cy="42" rx="18" ry="13" fill={primary}/>
      {/* Long narrow snout */}
      <ellipse cx="4" cy="46" rx="12" ry="7" fill={secondary} opacity="0.9"/>
      <ellipse cx="2" cy="43" rx="4" ry="3" fill="#0A0015"/>
      {/* Sharp ears */}
      <polygon points="6,32 10,14 20,28" fill={primary}/>
      <polygon points="8,32 10,20 18,28" fill={accent} opacity="0.6"/>
      <polygon points="22,28 28,12 32,26" fill={primary}/>
      <polygon points="24,28 28,18 30,26" fill={accent} opacity="0.6"/>
      {/* Glowing eyes */}
      <circle cx="14" cy="40" r="6" fill={accent}/>
      <circle cx="14" cy="40" r="3" fill="#0A0015"/>
      <circle cx="15.5" cy="38.5" r="1.2" fill="white"/>
    </>
  );
}

/** VoidMoth – massive dark moth with eyespot void wings */
export function VoidMothSvg({ primary, secondary, accent }: SvgCreatureProps) {
  return (
    <>
      {/* Shadow trails behind wings */}
      <path d="M50,58 C28,46 6,38 -2,20" stroke={secondary} strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.3"/>
      <path d="M50,58 C72,46 94,38 102,20" stroke={secondary} strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.3"/>
      {/* Main wings – dark and wide */}
      <path d="M50,58 C30,46 8,38 2,22 C-2,10 10,6 20,18 C28,28 32,42 40,52" fill={primary} opacity="0.95"/>
      <path d="M50,58 C70,46 92,38 98,22 C102,10 90,6 80,18 C72,28 68,42 60,52" fill={primary} opacity="0.95"/>
      {/* Lower wing lobe */}
      <path d="M50,60 C34,56 14,62 10,76 C8,86 18,90 28,82 C36,76 42,66 48,62" fill={secondary} opacity="0.8"/>
      <path d="M50,60 C66,56 86,62 90,76 C92,86 82,90 72,82 C64,76 58,66 52,62" fill={secondary} opacity="0.8"/>
      {/* EYESPOT on each upper wing */}
      <circle cx="22" cy="26" r="14" fill={secondary}/><circle cx="22" cy="26" r="10" fill={primary}/><circle cx="22" cy="26" r="6" fill={accent}/><circle cx="22" cy="26" r="3" fill="white" opacity="0.6"/>
      <circle cx="78" cy="26" r="14" fill={secondary}/><circle cx="78" cy="26" r="10" fill={primary}/><circle cx="78" cy="26" r="6" fill={accent}/><circle cx="78" cy="26" r="3" fill="white" opacity="0.6"/>
      {/* Small eyespot on lower lobes */}
      <circle cx="26" cy="72" r="6" fill={accent} opacity="0.7"/><circle cx="26" cy="72" r="3" fill={primary}/>
      <circle cx="74" cy="72" r="6" fill={accent} opacity="0.7"/><circle cx="74" cy="72" r="3" fill={primary}/>
      {/* Body */}
      <ellipse cx="50" cy="65" rx="8" ry="20" fill={secondary}/>
      {/* Head */}
      <circle cx="50" cy="44" r="11" fill={secondary}/>
      {/* Feathered antennae */}
      <path d="M44,34 C38,22 32,12 28,4" stroke={primary} strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M42,30 C38,24 36,16 34,8" stroke={accent} strokeWidth="1.5" fill="none" opacity="0.6"/>
      <path d="M56,34 C62,22 68,12 72,4" stroke={primary} strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M58,30 C62,24 64,16 66,8" stroke={accent} strokeWidth="1.5" fill="none" opacity="0.6"/>
      {/* Eyes */}
      <circle cx="45" cy="43" r="4" fill={accent}/><circle cx="55" cy="43" r="4" fill={accent}/>
      <circle cx="45" cy="43" r="2" fill="#0A0015"/><circle cx="55" cy="43" r="2" fill="#0A0015"/>
    </>
  );
}

/** EclipseOwl – heavy dark owl with moon eclipse disc */
export function EclipseOwlSvg({ primary, secondary, accent }: SvgCreatureProps) {
  return (
    <>
      <ellipse cx="50" cy="92" rx="24" ry="5" fill="black" opacity="0.3"/>
      {/* ECLIPSE DISC behind head – the defining feature */}
      <circle cx="50" cy="36" r="32" fill={secondary} opacity="0.5"/>
      <circle cx="50" cy="36" r="28" fill="none" stroke={accent} strokeWidth="3" opacity="0.6"/>
      <circle cx="50" cy="36" r="24" fill={primary} opacity="0.7"/>
      {/* Corona rays */}
      {[0,45,90,135,180,225,270,315].map((deg,i)=>{
        const rad = (deg*Math.PI)/180;
        const x1 = 50+26*Math.cos(rad); const y1 = 36+26*Math.sin(rad);
        const x2 = 50+34*Math.cos(rad); const y2 = 36+34*Math.sin(rad);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={accent} strokeWidth="2.5" opacity="0.5"/>;
      })}
      {/* Round owl body */}
      <ellipse cx="50" cy="72" rx="26" ry="22" fill={primary}/>
      {/* Feather patterns on body */}
      {[42,50,58].map((x,i)=>[62,72].map((y,j)=>(
        <ellipse key={`${i}${j}`} cx={x} cy={y} rx="6" ry="4" fill={secondary} opacity="0.6"/>
      )))}
      {/* Wings folded */}
      <path d="M24,70 C14,60 12,72 18,82 C14,80 10,86 14,90" fill={secondary} opacity="0.9"/>
      <path d="M76,70 C86,60 88,72 82,82 C86,80 90,86 86,90" fill={secondary} opacity="0.9"/>
      {/* Round head */}
      <circle cx="50" cy="44" r="22" fill={primary}/>
      {/* Facial disc */}
      <ellipse cx="50" cy="46" rx="18" ry="16" fill={secondary} opacity="0.6"/>
      {/* Ear tufts */}
      <polygon points="32,28 28,12 36,24" fill={primary}/>
      <polygon points="68,28 72,12 64,24" fill={primary}/>
      {/* LARGE round eyes – eclipse goggles */}
      <circle cx="40" cy="44" r="11" fill="#0A0015"/><circle cx="60" cy="44" r="11" fill="#0A0015"/>
      <circle cx="40" cy="44" r="8" fill={accent} opacity="0.9"/><circle cx="60" cy="44" r="8" fill={accent} opacity="0.9"/>
      <circle cx="40" cy="44" r="5" fill="#0A0015"/><circle cx="60" cy="44" r="5" fill="#0A0015"/>
      <circle cx="41" cy="42" r="2.5" fill="white" opacity="0.7"/><circle cx="61" cy="42" r="2.5" fill="white" opacity="0.7"/>
      {/* Hooked beak */}
      <path d="M46,54 C48,60 52,60 54,54 L52,50 Z" fill={accent}/>
      {/* Talons */}
      <path d="M38,92 C34,88 30,92 32,96" stroke={secondary} strokeWidth="4" strokeLinecap="round" fill="none"/>
      <path d="M50,94 C50,90 50,96 50,100" stroke={secondary} strokeWidth="4" strokeLinecap="round" fill="none"/>
      <path d="M62,92 C66,88 70,92 68,96" stroke={secondary} strokeWidth="4" strokeLinecap="round" fill="none"/>
    </>
  );
}

/** AbyssSpider – eight-legged void spider with web cage */
export function AbyssSpiderSvg({ primary, secondary, accent }: SvgCreatureProps) {
  return (
    <>
      {/* Web threads radiating to edges */}
      {[0,40,80,120,160,200,240,320].map((deg,i)=>{
        const rad=(deg*Math.PI)/180;
        const x2=50+52*Math.cos(rad); const y2=50+52*Math.sin(rad);
        return <line key={i} x1={50} y1={50} x2={x2} y2={y2} stroke={secondary} strokeWidth="1" opacity="0.4"/>;
      })}
      {/* Concentric web rings */}
      <circle cx="50" cy="50" r="18" fill="none" stroke={secondary} strokeWidth="1" opacity="0.4"/>
      <circle cx="50" cy="50" r="32" fill="none" stroke={secondary} strokeWidth="1" opacity="0.3"/>
      <circle cx="50" cy="50" r="46" fill="none" stroke={secondary} strokeWidth="0.5" opacity="0.2"/>
      {/* 8 LEGS radiating out – the key silhouette */}
      {[[-1,-1],[-0.4,-1],[0.4,-1],[1,-1],[1,1],[0.4,1],[-0.4,1],[-1,1]].map(([dx,dy],i)=>(
        <g key={i}>
          <path d={`M${50+dx*14} ${50+dy*12} C${50+dx*30} ${50+dy*22} ${50+dx*40} ${50+dy*36} ${50+dx*48} ${50+dy*46}`}
            stroke={primary} strokeWidth="6" fill="none" strokeLinecap="round"/>
          {/* Claw tips */}
          <path d={`M${50+dx*48} ${50+dy*46} L${50+dx*52} ${50+dy*42} M${50+dx*48} ${50+dy*46} L${50+dx*44} ${50+dy*50}`}
            stroke={accent} strokeWidth="2" strokeLinecap="round"/>
        </g>
      ))}
      {/* Central abdomen – large oval */}
      <ellipse cx="52" cy="60" rx="18" ry="22" fill={secondary}/>
      {/* Void marking on abdomen */}
      <ellipse cx="52" cy="62" rx="10" ry="13" fill={primary} opacity="0.8"/>
      <ellipse cx="52" cy="64" rx="5" ry="7" fill={accent} opacity="0.6"/>
      {/* Head/cephalothorax */}
      <circle cx="50" cy="40" r="16" fill={primary}/>
      {/* Multiple eyes in a row */}
      <circle cx="40" cy="38" r="4" fill={accent}/><circle cx="46" cy="35" r="3.5" fill={accent}/>
      <circle cx="54" cy="35" r="3.5" fill={accent}/><circle cx="60" cy="38" r="4" fill={accent}/>
      <circle cx="43" cy="43" r="3" fill={accent} opacity="0.8"/><circle cx="57" cy="43" r="3" fill={accent} opacity="0.8"/>
      {/* Pupil dots */}
      {[[40,38],[46,35],[54,35],[60,38],[43,43],[57,43]].map(([cx,cy],i)=>(
        <circle key={i} cx={cx} cy={cy} r={1.5} fill="#0A0015"/>
      ))}
      {/* Fangs */}
      <path d="M46,48 L42,56" stroke={accent} strokeWidth="3" strokeLinecap="round"/>
      <path d="M54,48 L58,56" stroke={accent} strokeWidth="3" strokeLinecap="round"/>
    </>
  );
}

// ── Myth ID → Archetype Mapping ───────────────────────────────────────────────
type ArchetypeName =
  | 'FireWolf' | 'FireDrake' | 'FireSpirit' | 'FireGolem'
  | 'EmberMoth' | 'CinderSerpent' | 'LavaCrab' | 'FlameHatch'
  | 'WaterTurtle' | 'WaterCanine' | 'SeaJelly' | 'SeaSerpent'
  | 'TidalCrab' | 'AbyssAngler' | 'GlacierGiant' | 'TempestEel'
  | 'Treant' | 'VineSprite' | 'NatureWolf' | 'ForestBeast'
  | 'FernFox' | 'ThornSerpent' | 'BloomBee' | 'MossGolem'
  | 'ThunderHawk' | 'LightningFox' | 'ElectricRay' | 'StormGolem'
  | 'SparkRabbit' | 'ThunderWorm' | 'VoltFish' | 'TeslaOrb'
  | 'ShadowCat' | 'VoidWraith' | 'DarkBird' | 'ShadowGolem'
  | 'NightHound' | 'VoidMoth' | 'EclipseOwl' | 'AbyssSpider';

export const MYTH_ARCHETYPE: Record<string, ArchetypeName> = {
  // ── Fire – 8 archetypes, no same-rarity sharing ──────────────────────────
  // C (one per archetype)
  'sparkub':'FireWolf',    'flammi':'FireDrake',     'torchip':'FireSpirit',
  'blazibit':'FireGolem',  'kindleo':'EmberMoth',    'seatpur':'CinderSerpent',
  'firette':'LavaCrab',    'emberkit':'FlameHatch',
  // B
  'flareonix':'FireWolf',  'magmaroo':'FireDrake',   'cinderoar':'FireSpirit',
  'lavabit':'FireGolem',   'burnyx':'EmberMoth',     'pyrehorn':'CinderSerpent',
  // A
  'blazion':'FireWolf',    'emberwolf':'FireDrake',  'volcanix':'FireSpirit',
  'fireclaw':'FireGolem',
  // S
  'pyrorax':'LavaCrab',    'infernix':'FlameHatch',

  // ── Water – 8 archetypes ─────────────────────────────────────────────────
  // C
  'puddleo':'WaterTurtle', 'droppi':'WaterCanine',   'fintee':'SeaJelly',
  'octazur':'SeaSerpent',  'splashy':'TidalCrab',    'ripplowl':'AbyssAngler',
  'tinwave':'GlacierGiant','driplet':'TempestEel',
  // B
  'shellion':'WaterTurtle','wavenix':'WaterCanine',  'nereel':'SeaJelly',
  'glaciero':'SeaSerpent', 'bubblio':'TidalCrab',    'kelpheon':'AbyssAngler',
  // A
  'coralux':'WaterTurtle', 'marinel':'WaterCanine',  'hydralisk':'SeaJelly',
  'tidalor':'SeaSerpent',
  // S
  'aquarion':'GlacierGiant','leviaqua':'TempestEel',

  // ── Nature – 8 archetypes ────────────────────────────────────────────────
  // C
  'leaflet':'Treant',      'sprouti':'VineSprite',   'buddle':'NatureWolf',
  'mossy':'ForestBeast',   'brambix':'FernFox',      'cloverit':'ThornSerpent',
  'twiglet':'BloomBee',    'fernkit':'MossGolem',
  // B
  'vinegor':'Treant',      'bloombo':'VineSprite',   'thornbel':'NatureWolf',
  'fernix':'ForestBeast',  'seedleaf':'FernFox',     'grasspin':'ThornSerpent',
  // A
  'leafenix':'Treant',     'mossfern':'VineSprite',  'rootora':'NatureWolf',
  'wildbud':'ForestBeast',
  // S
  'verdantis':'BloomBee',  'florazar':'MossGolem',

  // ── Electric – 8 archetypes ──────────────────────────────────────────────
  // C
  'zaplet':'ThunderHawk',  'zipbee':'LightningFox',  'electrix':'ElectricRay',
  'boltin':'StormGolem',   'sparkit':'SparkRabbit',  'wattspy':'ThunderWorm',
  'charglet':'VoltFish',   'voltspark':'TeslaOrb',
  // B
  'voltyk':'ThunderHawk',  'shockip':'LightningFox', 'amphare':'ElectricRay',
  'elekio':'StormGolem',   'joltoll':'SparkRabbit',  'statichu':'ThunderWorm',
  // A
  'sparko':'ThunderHawk',  'lumirae':'LightningFox', 'chargeon':'ElectricRay',
  'thundkit':'StormGolem',
  // S
  'zapdrix':'VoltFish',    'voltiger':'TeslaOrb',

  // ── Dark – 8 archetypes ──────────────────────────────────────────────────
  // C
  'darkit':'ShadowCat',    'inko':'VoidWraith',      'shadeek':'DarkBird',
  'gloombat':'ShadowGolem','nyxie':'NightHound',     'scuppi':'VoidMoth',
  'wispurr':'EclipseOwl',  'shadowpup':'AbyssSpider',
  // B
  'grimclaw':'ShadowCat',  'nightfang':'VoidWraith', 'spectrix':'DarkBird',
  'dreadimp':'ShadowGolem','eclipseer':'NightHound', 'murkrowl':'VoidMoth',
  // A
  'shadowlurk':'ShadowCat','duskhowl':'VoidWraith',  'maligno':'DarkBird',
  'voidraven':'ShadowGolem',
  // S
  'umbraeon':'EclipseOwl', 'noctiris':'AbyssSpider',
};

// ── Per-myth deterministic color generation ───────────────────────────────────
// Each myth gets unique colors derived from its ID + element so that two myths
// with the same archetype shape still look visually distinct.

/** djb2-style hash → stable float 0..1 for any string */
function idHash(id: string): number {
  let h = 5381;
  for (let i = 0; i < id.length; i++) {
    h = ((h << 5) + h + id.charCodeAt(i)) >>> 0; // force unsigned 32-bit
  }
  return (h % 1000) / 999; // 0..1
}

type ElementBand = {
  primaryHue:   [number, number]; // [min, max] hue for primary colour
  secondaryHue: [number, number];
  accentHue:    [number, number];
  sat: number;        // saturation %
  primaryL:  number;  // lightness % for primary
  secondaryL: number;
  accentL:   number;
};

const ELEMENT_BANDS: Record<string, ElementBand> = {
  Fire:     { primaryHue:[0,40],    secondaryHue:[10,50],  accentHue:[20,60],   sat:90, primaryL:28,  secondaryL:45, accentL:62 },
  Water:    { primaryHue:[190,230], secondaryHue:[175,215],accentHue:[165,210], sat:82, primaryL:28,  secondaryL:46, accentL:60 },
  Nature:   { primaryHue:[85,145],  secondaryHue:[70,130], accentHue:[55,120],  sat:78, primaryL:22,  secondaryL:40, accentL:56 },
  Electric: { primaryHue:[38,68],   secondaryHue:[42,72],  accentHue:[48,80],   sat:95, primaryL:32,  secondaryL:50, accentL:65 },
  Dark:     { primaryHue:[255,310], secondaryHue:[250,300],accentHue:[270,330], sat:80, primaryL:12,  secondaryL:26, accentL:52 },
};

function lerp(a: number, b: number, t: number) { return Math.round(a + (b - a) * t); }

/** Returns [primary, secondary, accent] CSS hsl strings unique to this myth */
function getMythColors(mythId: string, element: string): [string, string, string] {
  const t = idHash(mythId);
  const band = ELEMENT_BANDS[element] ?? ELEMENT_BANDS.Fire!;

  // Use slightly shifted t values for secondary/accent so they don't all move in lockstep
  const t2 = idHash(mythId + '_s') ;
  const t3 = idHash(mythId + '_a');

  const pH = lerp(band.primaryHue[0],   band.primaryHue[1],   t)  % 360;
  const sH = lerp(band.secondaryHue[0], band.secondaryHue[1], t2) % 360;
  const aH = lerp(band.accentHue[0],    band.accentHue[1],    t3) % 360;

  return [
    `hsl(${pH}, ${band.sat}%,         ${band.primaryL}%)`,
    `hsl(${sH}, ${band.sat - 8}%,     ${band.secondaryL}%)`,
    `hsl(${aH}, 100%,                 ${band.accentL}%)`,
  ];
}

// Kept for fallback glow colour extraction (accent only)
const ARCHETYPE_COLORS: Record<string, [string, string, string]> = {
  Fire:     ['#7B1A00', '#B84000', '#FF8C00'],
  Water:    ['#004466', '#006B9F', '#00CCEE'],
  Nature:   ['#1A4A00', '#2E7B14', '#7EC832'],
  Electric: ['#3A3200', '#7A6800', '#FFE033'],
  Dark:     ['#0A0015', '#26004A', '#9B40E0'],
};

const ARCHETYPE_COMPONENTS: Record<ArchetypeName, (p: SvgCreatureProps) => JSX.Element> = {
  // Original 20
  FireWolf:       (p) => <FireWolfSvg {...p} />,
  FireDrake:      (p) => <FireDrakeSvg {...p} />,
  FireSpirit:     (p) => <FireSpiritSvg {...p} />,
  FireGolem:      (p) => <FireGolemSvg {...p} />,
  WaterTurtle:    (p) => <WaterTurtleSvg {...p} />,
  WaterCanine:    (p) => <WaterCanineSvg {...p} />,
  SeaJelly:       (p) => <SeaJellySvg {...p} />,
  SeaSerpent:     (p) => <SeaSerpentSvg {...p} />,
  Treant:         (p) => <TreantSvg {...p} />,
  VineSprite:     (p) => <VineSpriteSvg {...p} />,
  NatureWolf:     (p) => <NatureWolfSvg {...p} />,
  ForestBeast:    (p) => <ForestBeastSvg {...p} />,
  ThunderHawk:    (p) => <ThunderHawkSvg {...p} />,
  LightningFox:   (p) => <LightningFoxSvg {...p} />,
  ElectricRay:    (p) => <ElectricRaySvg {...p} />,
  StormGolem:     (p) => <StormGolemSvg {...p} />,
  ShadowCat:      (p) => <ShadowCatSvg {...p} />,
  VoidWraith:     (p) => <VoidWraithSvg {...p} />,
  DarkBird:       (p) => <DarkBirdSvg {...p} />,
  ShadowGolem:    (p) => <ShadowGolemSvg {...p} />,
  // New Fire
  EmberMoth:      (p) => <EmberMothSvg {...p} />,
  CinderSerpent:  (p) => <CinderSerpentSvg {...p} />,
  LavaCrab:       (p) => <LavaCrabSvg {...p} />,
  FlameHatch:     (p) => <FlameHatchSvg {...p} />,
  // New Water
  TidalCrab:      (p) => <TidalCrabSvg {...p} />,
  AbyssAngler:    (p) => <AbyssAnglerSvg {...p} />,
  GlacierGiant:   (p) => <GlacierGiantSvg {...p} />,
  TempestEel:     (p) => <TempestEelSvg {...p} />,
  // New Nature
  FernFox:        (p) => <FernFoxSvg {...p} />,
  ThornSerpent:   (p) => <ThornSerpentSvg {...p} />,
  BloomBee:       (p) => <BloomBeeSvg {...p} />,
  MossGolem:      (p) => <MossGolemSvg {...p} />,
  // New Electric
  SparkRabbit:    (p) => <SparkRabbitSvg {...p} />,
  ThunderWorm:    (p) => <ThunderWormSvg {...p} />,
  VoltFish:       (p) => <VoltFishSvg {...p} />,
  TeslaOrb:       (p) => <TeslaOrbSvg {...p} />,
  // New Dark
  NightHound:     (p) => <NightHoundSvg {...p} />,
  VoidMoth:       (p) => <VoidMothSvg {...p} />,
  EclipseOwl:     (p) => <EclipseOwlSvg {...p} />,
  AbyssSpider:    (p) => <AbyssSpiderSvg {...p} />,
};

// ── Public component ──────────────────────────────────────────────────────────
export interface MythSvgProps {
  mythId: string;
  element: string;
  rarity?: string;
  size?: number;
  className?: string;
}

// Rarity scale: S is noticeably bigger/bulkier, C is smaller/scrappier
const RARITY_SCALE: Record<string, number> = { S: 1.18, A: 1.0, B: 0.88, C: 0.75 };

export function MythSvgIcon({ mythId, element, rarity = 'C', size = 100, className }: MythSvgProps) {
  const archetype = (MYTH_ARCHETYPE[mythId] ?? fallback(element)) as ArchetypeName;
  const [p, s, a] = getMythColors(mythId, element);
  const scale = RARITY_SCALE[rarity] ?? 1.0;

  const glowFilter = {
    C: 'none',
    B: `drop-shadow(0 0 5px ${a}) drop-shadow(0 0 2px ${a})`,
    A: `drop-shadow(0 0 10px ${a}) drop-shadow(0 0 5px ${a}) brightness(1.05)`,
    S: `drop-shadow(0 0 16px ${a}) drop-shadow(0 0 8px ${a}) drop-shadow(0 0 24px ${s}) brightness(1.12)`,
  }[rarity] ?? 'none';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: glowFilter, overflow: 'visible' }}
    >
      {/* Rarity aura rings for A and S */}
      {rarity === 'S' && (
        <>
          <circle cx="50" cy="50" r="48" fill="none" stroke={a} strokeWidth="2.5" opacity="0.5"/>
          <circle cx="50" cy="50" r="44" fill="none" stroke={s} strokeWidth="1.5" opacity="0.3"/>
          {/* Crown above centre */}
          <polygon points="50,6 46,14 50,11 54,14" fill={a} opacity="0.9"/>
          <polygon points="42,10 38,18 42,15" fill={a} opacity="0.7"/>
          <polygon points="58,10 62,18 58,15" fill={a} opacity="0.7"/>
          {/* Power particles */}
          {[30,90,150,210,270,330].map((deg, i) => {
            const r2 = 46; const rad = (deg * Math.PI) / 180;
            return <circle key={i} cx={50 + r2 * Math.cos(rad)} cy={50 + r2 * Math.sin(rad)} r="2" fill={a} opacity="0.6"/>;
          })}
        </>
      )}
      {rarity === 'A' && (
        <circle cx="50" cy="50" r="47" fill="none" stroke={a} strokeWidth="1.5" opacity="0.4"/>
      )}
      {/* Creature body, scaled by rarity */}
      <g transform={`translate(50,50) scale(${scale}) translate(-50,-50)`}>
        {ARCHETYPE_COMPONENTS[archetype]?.({ primary: p!, secondary: s!, accent: a! })}
      </g>
    </svg>
  );
}

function fallback(element: string): ArchetypeName {
  const defaults: Record<string, ArchetypeName> = {
    Fire: 'FireWolf', Water: 'WaterCanine', Nature: 'ForestBeast',
    Electric: 'LightningFox', Dark: 'ShadowCat',
  };
  return defaults[element] ?? 'FireWolf';
}
