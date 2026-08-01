interface LivingMythArtProps {
  speciesId: string;
  src: string;
  size: number;
  facing: 'left' | 'right';
  reactionKey: number;
}

const PARTS: Record<string, string[]> = {
  ashquill: ['wing-left', 'wing-right', 'head'],
  flarelynx: ['tail', 'chest', 'head'],
};

export default function LivingMythArt({ speciesId, src, size, facing, reactionKey }: LivingMythArtProps) {
  const parts = PARTS[speciesId] ?? [];
  const eyes = speciesId === 'flarelynx' ? ['eye-left', 'eye-right'] : ['eye-main'];

  return (
    <div
      key={`${speciesId}-${reactionKey}`}
      className={`living-myth living-myth-${speciesId} ${reactionKey > 0 ? 'living-myth-react' : ''}`}
      style={{ width: size, height: size, transform: facing === 'left' ? 'scaleX(-1)' : undefined }}
      data-testid={`living-myth-${speciesId}`}
    >
      <img className="living-myth-base" src={src} alt={`${speciesId} ready for battle`} draggable={false} />
      {parts.map((part) => (
        <img key={part} className={`living-myth-part living-myth-part-${part}`} src={src} alt="" aria-hidden="true" draggable={false} />
      ))}
      <div className="living-myth-eyes" aria-hidden="true">
        {eyes.map((eye) => <span key={eye} className={`living-myth-eyelid living-myth-${eye}`} />)}
      </div>
    </div>
  );
}
