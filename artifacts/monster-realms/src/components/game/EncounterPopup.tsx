import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/game-store';
import { useStartBattle, useGetPlayerTeam } from '@workspace/api-client-react';
import { getElementColors, getRarityColors, QUALITY_LABEL } from '@/lib/element-colors';
import { MythSvgIcon } from '@/lib/myth-svgs';
import { ELEMENT_ICON } from '@/lib/type-chart';
import { Swords, AlertTriangle } from 'lucide-react';
import {
  BATTLE_FOCUS_EVENT,
  BATTLE_OPEN_EVENT,
  waitForBattleFocus,
} from '@/lib/battle-transition-events';

// ─── Deterministic noise from species id ─────────────────────────────────────

function seedRand(str: string, i: number): number {
  let h = 0;
  for (let j = 0; j < str.length; j++) h = (Math.imul(h, 31) + str.charCodeAt(j)) | 0;
  h = (Math.imul(h ^ (i * 2654435769), 1540483477)) >>> 0;
  return h / 4294967295;
}

// ─── Element-specific particle configs ───────────────────────────────────────

interface ParticleConfig {
  id: number;
  style: React.CSSProperties;
  className: string;
}

function buildParticles(element: string, speciesId: string, elColors: { primary: string; secondary: string; glow: string }): ParticleConfig[] {
  const particles: ParticleConfig[] = [];

  if (element === 'Storm' || element === 'Electric') {
    // 8 sparks burst outward from center
    for (let i = 0; i < 8; i++) {
      const delay = seedRand(speciesId, i + 100) * 0.4;
      const w = 4 + seedRand(speciesId, i + 200) * 28;
      const h = 2 + seedRand(speciesId, i + 300) * 3;
      particles.push({
        id: i,
        className: '',
        style: {
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: w,
          height: h,
          marginLeft: -w / 2,
          marginTop: -h / 2,
          background: `linear-gradient(90deg, ${elColors.primary}, ${elColors.secondary}00)`,
          borderRadius: 2,
          animation: `enc-p-burst-${i} 0.7s ease-out ${0.3 + delay}s both`,
          boxShadow: `0 0 6px ${elColors.primary}`,
        },
      });
    }
  } else if (element === 'Shadow' || element === 'Dark') {
    // 8 wisps swirl outward
    for (let i = 0; i < 8; i++) {
      const r = seedRand(speciesId, i + 50);
      const angle = (i / 8) * Math.PI * 2;
      const wx = Math.round(Math.cos(angle) * 80 + (r - 0.5) * 30);
      const wy = Math.round(Math.sin(angle) * 60 - 20 + (r - 0.5) * 20);
      const size = 14 + r * 20;
      const delay = r * 0.5;
      particles.push({
        id: i,
        className: '',
        style: {
          position: 'absolute',
          left: '50%',
          top: '55%',
          width: size,
          height: size,
          marginLeft: -size / 2,
          marginTop: -size / 2,
          background: `radial-gradient(circle, ${elColors.secondary}cc 0%, ${elColors.primary}44 60%, transparent 100%)`,
          borderRadius: '60% 40% 55% 45% / 50% 60% 40% 50%',
          '--wx': `${wx}px`,
          '--wy': `${wy}px`,
          animation: `enc-p-wisp 1.1s ease-out ${0.25 + delay}s both`,
        } as React.CSSProperties,
      });
    }
  } else {
    // Fire, Water, Earth — 10 particles rising upward
    const COUNT = 10;
    for (let i = 0; i < COUNT; i++) {
      const r0 = seedRand(speciesId, i);
      const r1 = seedRand(speciesId, i + 20);
      const r2 = seedRand(speciesId, i + 40);
      const r3 = seedRand(speciesId, i + 60);

      const xOffset = (r0 - 0.5) * 180; // spread horizontally
      const yStart = 20 + r1 * 60;       // start height
      const size = 6 + r2 * 14;
      const duration = 0.8 + r3 * 0.9;
      const delay = r0 * 0.6;

      let bg: string;
      let br: string;
      let shadow: string;

      if (element === 'Fire') {
        const t = r2;
        const col = t > 0.5 ? elColors.primary : elColors.secondary;
        bg = `radial-gradient(circle at 40% 30%, #fff8 0%, ${col} 50%, ${col}00 100%)`;
        br = '50% 50% 40% 40%'; // teardrop-ish
        shadow = `0 0 ${size}px ${elColors.primary}`;
      } else if (element === 'Water') {
        bg = `radial-gradient(circle at 38% 28%, rgba(255,255,255,0.6) 0%, ${elColors.primary}bb 50%, ${elColors.secondary}33 100%)`;
        br = '50%';
        shadow = `0 0 8px ${elColors.glow}`;
      } else {
        // Earth — drifting shards/leaves
        const lx = ((r0 - 0.5) * 60).toFixed(0) + 'px';
        const lr = ((r1 * 2 - 1) * 180).toFixed(0) + 'deg';
        particles.push({
          id: i,
          className: '',
          style: {
            position: 'absolute',
            left: `calc(50% + ${xOffset.toFixed(0)}px)`,
            bottom: `${yStart}px`,
            width: size + 4,
            height: size,
            background: `linear-gradient(135deg, ${elColors.secondary}, ${elColors.primary})`,
            borderRadius: '0 60% 0 60%',
            '--lx': lx,
            '--lr': lr,
            animation: `enc-p-leaf ${duration.toFixed(2)}s ease-out ${delay.toFixed(2)}s both`,
            boxShadow: `0 0 6px ${elColors.glow}`,
          } as React.CSSProperties,
        });
        continue;
      }

      particles.push({
        id: i,
        className: '',
        style: {
          position: 'absolute',
          left: `calc(50% + ${xOffset.toFixed(0)}px)`,
          bottom: `${yStart}px`,
          width: size,
          height: element === 'Fire' ? size * 1.4 : size,
          background: bg,
          borderRadius: br,
          boxShadow: shadow,
          animation: `enc-p-rise ${duration.toFixed(2)}s ease-out ${delay.toFixed(2)}s both`,
        } as React.CSSProperties,
      });
    }
  }

  return particles;
}

// ─── Per-element text flavor ──────────────────────────────────────────────────

const ELEMENT_FLAVOR: Record<string, { verb: string; exclaim: string }> = {
  Fire:     { verb: 'blazed into view',   exclaim: '🔥 Danger!' },
  Water:    { verb: 'emerged from the deep', exclaim: '💧 Careful!' },
  Earth:    { verb: 'rose from the ancient ground', exclaim: '🪨 Found it!' },
  Storm:    { verb: 'struck like lightning', exclaim: '⚡ Alert!' },
  Shadow:   { verb: 'emerged from the shadows', exclaim: '🌑 Watch out!' },
  // Legacy collection fallbacks
  Electric: { verb: 'struck like lightning', exclaim: '⚡ Alert!' },
  Nature:   { verb: 'crept out of the wilds', exclaim: '🌿 Found it!' },
  Dark:     { verb: 'emerged from the shadows', exclaim: '🌑 Watch out!' },
};

// ─── Shiny sparkle ring ───────────────────────────────────────────────────────

function ShinyRing() {
  const STARS = ['✦', '✧', '✦', '★', '✦', '✧', '✦', '✧'];
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
      {STARS.map((s, i) => (
        <span
          key={i}
          className="absolute text-yellow-300 font-bold enc-shiny-orbit"
          style={{
            left: '50%',
            top: '50%',
            fontSize: i % 2 === 0 ? 14 : 10,
            marginLeft: -7,
            marginTop: -7,
            transformOrigin: '0 0',
            animationDelay: `${(i / STARS.length) * 2.5}s`,
            filter: 'drop-shadow(0 0 4px gold)',
          }}
        >
          {s}
        </span>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function EncounterPopup() {
  const { encounter, clearEncounter, startBattle, player, currentRegionId } = useGameStore();
  const [isStarting, setIsStarting] = useState(false);

  const { data: team } = useGetPlayerTeam(player?.id || '', {
    query: { enabled: !!player?.id },
  });

  const startBattleMutation = useStartBattle();

  const sp         = encounter.species;
  const elColors   = useMemo(() => sp ? getElementColors(sp.element) : null, [sp?.element]);
  const rarColors  = useMemo(() => sp ? getRarityColors(sp.rarity) : null, [sp?.rarity]);
  const particles  = useMemo(
    () => (sp && elColors) ? buildParticles(sp.element, sp.id, elColors) : [],
    [sp?.id, sp?.element],
  );

  if (!encounter.triggered || !sp || !elColors || !rarColors) return null;

  const qualityLabel = QUALITY_LABEL[sp.rarity] ?? sp.rarity;
  const hasTeam      = !!(team && team.length > 0);
  const flavor       = ELEMENT_FLAVOR[sp.element] ?? { verb: 'appeared', exclaim: '⚠ Alert!' };
  const elemIcon     = ELEMENT_ICON?.[sp.element] ?? '✦';

  const handleBattle = async () => {
    if (!player || !hasTeam) return;
    setIsStarting(true);
    try {
      const battle = await startBattleMutation.mutateAsync({
        data: {
          playerId: player.id,
          regionId: currentRegionId || player.regionId || 'verdant-meadows',
          speciesId: sp.id,
          wildLevel: encounter.wildLevel,
          shinyVariant: encounter.shinyVariant as any,
          activeMonsterCapturedId: team[0].id,
        },
      });
      clearEncounter();
      const cameraReady = waitForBattleFocus();
      window.dispatchEvent(new CustomEvent(BATTLE_FOCUS_EVENT, {
        detail: {
          x: player.posX,
          y: player.posY,
          regionId: currentRegionId || player.regionId,
          element: sp.element,
        },
      }));
      await cameraReady;
      window.dispatchEvent(new Event(BATTLE_OPEN_EVENT));
      startBattle(battle.id, battle);
    } catch (err) {
      console.error('Failed to start battle:', err);
    } finally {
      setIsStarting(false);
    }
  };

  // Rarity glow intensity map
  const rarityRingWidth = sp.rarity === 'S' ? 3 : sp.rarity === 'A' ? 2 : 1.5;

  return (
    <>
      {/* ── Cinematic element flash ─────────────────────────────────────── */}
      <div
        className="fixed inset-0 z-50 enc-flash pointer-events-none"
        style={{ background: elColors.primary, opacity: 0 }}
      />

      {/* ── Main overlay ────────────────────────────────────────────────── */}
      <div
        className="fixed inset-0 z-40 flex items-center justify-center enc-backdrop"
        style={{
          background: `
            radial-gradient(ellipse 80% 55% at 50% 100%, ${elColors.primary}33 0%, transparent 70%),
            linear-gradient(to bottom, rgba(4,6,18,0.82) 0%, rgba(4,6,18,0.96) 100%)
          `,
          backdropFilter: 'blur(4px)',
        }}
        onClick={clearEncounter}
      >
        {/* ── Card ─────────────────────────────────────────────────────── */}
        <div
          className="relative enc-card-rise mx-4 w-full max-w-sm overflow-hidden rounded-3xl"
          style={{
            background: `linear-gradient(160deg, rgba(10,12,30,0.97) 0%, rgba(6,8,22,0.99) 100%)`,
            border: `${rarityRingWidth}px solid ${rarColors.color}88`,
            boxShadow: `
              0 0 0 1px ${elColors.primary}22,
              0 0 40px ${elColors.glow},
              0 0 80px ${rarColors.glow},
              0 24px 64px rgba(0,0,0,0.8)
            `,
          }}
          onClick={e => e.stopPropagation()}
        >

          {/* ── Element gradient header band ───────────────────────────── */}
          <div
            className="absolute top-0 left-0 right-0 h-64 pointer-events-none"
            style={{
              background: `
                radial-gradient(ellipse 100% 120% at 50% 0%,
                  ${elColors.primary}28 0%,
                  ${elColors.secondary}14 45%,
                  transparent 75%
                )
              `,
            }}
          />

          {/* ── Top ribbon ─────────────────────────────────────────────── */}
          <div className="relative pt-5 px-5 pb-0 text-center enc-label-drop">
            {encounter.shinyVariant ? (
              <div
                className="inline-flex items-center gap-1.5 text-xs font-black tracking-[0.2em] uppercase px-3 py-1 rounded-full mb-2"
                style={{
                  background: 'linear-gradient(90deg, #78350f, #ca8a04, #78350f)',
                  color: '#fde68a',
                  boxShadow: '0 0 16px gold, 0 0 32px #ca8a0466',
                }}
              >
                ✨ Shiny {encounter.shinyVariant}!
              </div>
            ) : (
              <div
                className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.18em] uppercase px-3 py-1 rounded-full mb-2"
                style={{
                  background: `${elColors.primary}18`,
                  color: elColors.primary,
                  border: `1px solid ${elColors.primary}44`,
                }}
              >
                {elemIcon} {flavor.exclaim}
              </div>
            )}
          </div>

          {/* ── Myth art stage ─────────────────────────────────────────── */}
          <div className="relative flex justify-center" style={{ height: 220 }}>
            {/* Particle layer */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {particles.map(p => (
                <div key={p.id} style={p.style} />
              ))}
            </div>

            {/* Shiny orbit ring */}
            {encounter.shinyVariant && <ShinyRing />}

            {/* Glow halo behind myth */}
            <div
              className="absolute"
              style={{
                width: 200,
                height: 200,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${elColors.primary}22 0%, transparent 70%)`,
                filter: 'blur(20px)',
              }}
            />

            {/* Large myth SVG — main star of the show */}
            <div
              className="enc-myth-burst battle-float relative"
              style={{ zIndex: 2, alignSelf: 'center', marginTop: 10 }}
            >
              <MythSvgIcon
                mythId={sp.id}
                element={sp.element}
                rarity={sp.rarity}
                size={190}
              />
            </div>

            {/* Ground shadow */}
            <div
              className="absolute bottom-3 left-1/2"
              style={{
                width: 130,
                height: 18,
                transform: 'translateX(-50%)',
                borderRadius: '50%',
                background: 'radial-gradient(ellipse, rgba(0,0,0,0.65) 0%, transparent 80%)',
                filter: 'blur(4px)',
              }}
            />
          </div>

          {/* ── Info block ─────────────────────────────────────────────── */}
          <div className="px-5 pb-2 text-center">
            {/* "A wild X appeared!" line */}
            <p
              className="enc-label-drop text-[11px] tracking-widest uppercase font-semibold mb-1"
              style={{ color: elColors.primary, animationDelay: '0.55s' }}
            >
              A wild myth {flavor.verb}!
            </p>

            {/* Myth name */}
            <h2
              className="enc-name-pop text-3xl font-black leading-none mb-3 tracking-tight"
              style={{
                color: '#f8fafc',
                textShadow: `0 0 24px ${elColors.primary}88, 0 2px 8px rgba(0,0,0,0.8)`,
              }}
            >
              {sp.name}
            </h2>

            {/* Badges row */}
            <div className="enc-badges-in flex items-center justify-center gap-2 flex-wrap mb-4">
              {/* Level */}
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono"
                style={{ background: 'rgba(255,255,255,0.08)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                Lv. {encounter.wildLevel}
              </span>
              {/* Element */}
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                style={{
                  background: `${elColors.primary}22`,
                  color: elColors.primary,
                  border: `1px solid ${elColors.primary}55`,
                  textShadow: `0 0 8px ${elColors.primary}88`,
                }}
              >
                {elemIcon} {sp.element}
              </span>
              {/* Rarity */}
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-black"
                style={{
                  background: `${rarColors.color}18`,
                  color: rarColors.color,
                  border: `1px solid ${rarColors.color}55`,
                  boxShadow: sp.rarity === 'S' ? `0 0 12px ${rarColors.glow}` : undefined,
                }}
              >
                {sp.rarity === 'S' ? '★ ' : ''}{qualityLabel}
              </span>
            </div>

            {/* Rarity glow divider */}
            <div
              className="enc-badges-in h-px w-full mb-4"
              style={{
                background: `linear-gradient(90deg, transparent, ${elColors.primary}55, ${rarColors.color}44, transparent)`,
              }}
            />
          </div>

          {/* ── No-team warning ────────────────────────────────────────── */}
          {!hasTeam && (
            <div
              className="enc-buttons-rise mx-5 mb-3 flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm"
              style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', color: '#fbbf24' }}
            >
              <AlertTriangle size={15} className="shrink-0" />
              <span>You need a myth on your team to battle! Catch one first.</span>
            </div>
          )}

          {/* ── Hint ───────────────────────────────────────────────────── */}
          {hasTeam && (
            <p
              className="enc-buttons-rise text-center text-[11px] mx-5 mb-3 leading-snug"
              style={{ color: '#64748b' }}
            >
              Weaken it, then use{' '}
              <span style={{ color: elColors.secondary, fontWeight: 700 }}>Throw Orb</span>{' '}
              during battle to capture it.
            </p>
          )}

          {/* ── Action buttons ─────────────────────────────────────────── */}
          <div className="enc-buttons-rise grid grid-cols-2 gap-3 px-5 pb-6">
            <button
              onClick={handleBattle}
              disabled={!hasTeam || isStarting}
              data-testid="button-fight"
              className="relative overflow-hidden flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-base tracking-wide transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: hasTeam
                  ? `linear-gradient(135deg, ${elColors.primary}, ${elColors.secondary})`
                  : 'rgba(255,255,255,0.06)',
                color: '#fff',
                boxShadow: hasTeam
                  ? `0 0 24px ${elColors.glow}, 0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.25)`
                  : 'none',
                border: `1px solid ${elColors.primary}44`,
              }}
            >
              {/* Shine sweep */}
              {hasTeam && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)',
                    animation: 'enc-flash 3s ease-in-out infinite',
                    animationDelay: '1.5s',
                  }}
                />
              )}
              <Swords size={18} />
              {isStarting ? 'Loading…' : 'Battle!'}
            </button>

            <button
              onClick={clearEncounter}
              data-testid="button-run-away"
              className="flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base tracking-wide transition-all active:scale-95"
              style={{
                background: 'rgba(255,255,255,0.04)',
                color: '#94a3b8',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              💨 Run Away
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
