import { useEffect, useRef, useState } from 'react';
import { getRegionInfo } from '@/lib/region-info';

interface RegionBannerProps {
  regionId: string;
  /**
   * Must be true before the banner starts watching for region changes.
   * Pass `true` only after initial server data has been received so that
   * the first server-hydration update does not trigger a spurious banner.
   */
  isReady: boolean;
}

export default function RegionBanner({ regionId, isReady }: RegionBannerProps) {
  const [visible, setVisible] = useState(false);
  const [displayedRegionId, setDisplayedRegionId] = useState(regionId);
  const prevRegionId = useRef<string | null>(null); // null = not yet initialised
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isReady) return;

    // On the first render after isReady becomes true, absorb the current
    // regionId as the baseline without showing any banner.
    if (prevRegionId.current === null) {
      prevRegionId.current = regionId;
      return;
    }

    // Only show the banner on genuine zone transitions.
    if (prevRegionId.current === regionId) return;

    prevRegionId.current = regionId;
    setDisplayedRegionId(regionId);
    setVisible(true);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), 2800);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [regionId, isReady]);

  if (!visible) return null;

  const info = getRegionInfo(displayedRegionId);

  return (
    <div
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
      style={{ animation: 'regionBannerIn 0.4s ease-out' }}
    >
      <div
        className="flex items-center gap-3 px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-md border"
        style={{
          background: 'linear-gradient(135deg, rgba(10,14,26,0.92) 0%, rgba(10,14,26,0.80) 100%)',
          borderColor: info.accentColor + '66',
          boxShadow: `0 0 24px ${info.accentColor}44`,
        }}
      >
        <span className="text-2xl">{info.element}</span>
        <div className="text-center">
          <p className="text-white font-bold text-lg leading-tight tracking-wide">{info.name}</p>
          <p className="text-sm font-mono" style={{ color: info.accentColor }}>{info.biome}</p>
        </div>
        <span className="text-2xl">{info.element}</span>
      </div>
    </div>
  );
}
