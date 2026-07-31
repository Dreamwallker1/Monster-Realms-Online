import type { MonsterSpeciesElement } from '@workspace/api-client-react';
import { ELEMENT_COLORS } from '@/lib/element-colors';

interface MonsterPortraitProps {
  element: MonsterSpeciesElement | 'Earth' | 'Storm' | 'Shadow';
  size?: 'sm' | 'md' | 'lg';
  shinyVariant?: string | null;
}

export default function MonsterPortrait({ element, size = 'md', shinyVariant }: MonsterPortraitProps) {
  const colors = ELEMENT_COLORS[element];
  const sizeMap = {
    sm: { width: 64, height: 64, scale: 0.6 },
    md: { width: 120, height: 120, scale: 1 },
    lg: { width: 200, height: 200, scale: 1.6 },
  };
  const { width, height, scale } = sizeMap[size];
  
  // Generate unique SVG portrait based on element
  const getShapeForElement = () => {
    const s = scale;
    switch (element) {
      case 'Fire':
        return `<polygon points="60,20 80,50 60,80 40,50" fill="${colors.primary}" />
                <circle cx="60" cy="50" r="${15 * s}" fill="${colors.secondary}" opacity="0.8" />`;
      case 'Water':
        return `<ellipse cx="60" cy="50" rx="${25 * s}" ry="${20 * s}" fill="${colors.primary}" />
                <ellipse cx="60" cy="55" rx="${20 * s}" ry="${15 * s}" fill="${colors.secondary}" opacity="0.7" />`;
      case 'Nature':
        return `<path d="M 60 20 Q 70 35, 80 50 Q 70 65, 60 80 Q 50 65, 40 50 Q 50 35, 60 20" fill="${colors.primary}" />
                <circle cx="60" cy="50" r="${12 * s}" fill="${colors.secondary}" />`;
      case 'Storm':
      case 'Electric':
        return `<path d="M 50 20 L 70 45 L 60 45 L 70 80 L 50 55 L 60 55 Z" fill="${colors.primary}" />
                <path d="M 50 20 L 70 45 L 60 45 L 70 80 L 50 55 L 60 55 Z" fill="${colors.secondary}" opacity="0.6" transform="translate(5,5)" />`;
      case 'Ice':
        return `<polygon points="60,20 75,40 70,60 60,80 50,60 45,40" fill="${colors.primary}" />
                <polygon points="60,30 70,45 65,60 60,70 55,60 50,45" fill="${colors.secondary}" opacity="0.7" />`;
      case 'Earth':
        return `<rect x="40" y="35" width="${40 * s}" height="${30 * s}" fill="${colors.primary}" rx="5" />
                <rect x="45" y="40" width="${30 * s}" height="${20 * s}" fill="${colors.secondary}" opacity="0.8" rx="3" />`;
      case 'Air':
        return `<path d="M 60 30 Q 80 50, 60 70 Q 40 50, 60 30" fill="${colors.primary}" opacity="0.6" />
                <path d="M 60 35 Q 75 50, 60 65 Q 45 50, 60 35" fill="${colors.secondary}" opacity="0.8" />`;
      case 'Light':
        return `<circle cx="60" cy="50" r="${25 * s}" fill="${colors.primary}" opacity="0.9" />
                <circle cx="60" cy="50" r="${18 * s}" fill="${colors.secondary}" opacity="0.7" />
                <circle cx="60" cy="50" r="${12 * s}" fill="#ffffff" opacity="0.9" />`;
      case 'Shadow':
      case 'Dark':
        return `<circle cx="60" cy="50" r="${25 * s}" fill="${colors.primary}" />
                <path d="M 60 25 A 25 25 0 0 1 85 50 A 20 20 0 0 0 60 30 Z" fill="${colors.secondary}" opacity="0.5" />`;
      case 'Metal':
        return `<polygon points="40,40 80,40 85,50 80,60 40,60 35,50" fill="${colors.primary}" />
                <polygon points="45,43 75,43 78,50 75,57 45,57 42,50" fill="${colors.secondary}" opacity="0.8" />`;
      case 'Crystal':
        return `<polygon points="60,20 80,45 70,80 50,80 40,45" fill="${colors.primary}" opacity="0.9" />
                <polygon points="60,30 75,47 68,75 52,75 45,47" fill="${colors.secondary}" opacity="0.7" />`;
      case 'Void':
        return `<circle cx="60" cy="50" r="${28 * s}" fill="${colors.primary}" />
                <circle cx="60" cy="50" r="${20 * s}" fill="#000000" opacity="0.6" />
                <circle cx="60" cy="50" r="${12 * s}" fill="${colors.secondary}" opacity="0.8" />`;
      default:
        return `<circle cx="60" cy="50" r="${20 * s}" fill="${colors.primary}" />`;
    }
  };
  
  return (
    <div className="relative" style={{ width, height }}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 120 100"
        className={shinyVariant ? 'animate-pulse-glow' : ''}
        style={{
          filter: shinyVariant ? `drop-shadow(0 0 12px ${colors.glow})` : `drop-shadow(0 0 6px ${colors.glow})`,
        }}
      >
        <defs>
          <radialGradient id={`bg-${element}`}>
            <stop offset="0%" stopColor={colors.primary} stopOpacity="0.2" />
            <stop offset="100%" stopColor={colors.primary} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="60" cy="50" r="45" fill={`url(#bg-${element})`} />
        <g dangerouslySetInnerHTML={{ __html: getShapeForElement() }} />
      </svg>
      {shinyVariant && (
        <div className="absolute top-1 right-1 text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-yellow-500 text-black">
          {shinyVariant}
        </div>
      )}
    </div>
  );
}
