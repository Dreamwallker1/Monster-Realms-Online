import { FormEvent, useEffect, useRef, useState } from 'react';
import './mythora-entry.css';

type EntryPhase = 'ready' | 'opening' | 'leaving';

type Props = {
  initialName?: string;
  onContinue: (explorerName: string) => void;
  onSignIn: (explorerName: string) => void;
};

export default function MythoraEntry({ initialName = '', onContinue, onSignIn }: Props) {
  const [name, setName] = useState(initialName);
  const [phase, setPhase] = useState<EntryPhase>('ready');
  const timers = useRef<number[]>([]);

  useEffect(() => () => {
    timers.current.forEach(window.clearTimeout);
  }, []);

  const schedule = (callback: () => void, delay: number) => {
    const timer = window.setTimeout(callback, delay);
    timers.current.push(timer);
  };

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim().slice(0, 20);
    if (cleanName.length < 2 || phase !== 'ready') return;

    setPhase('opening');
    schedule(() => setPhase('leaving'), 920);
    // Swap screens under the brightest part of the portal flash so the next
    // onboarding step feels like the other side of the same gateway.
    schedule(() => onContinue(cleanName), 1760);
  }

  const cleanName = name.trim().slice(0, 20);
  const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

  return (
    <main className={`mythora-entry phase-${phase}`} data-testid="premium-entry">
      <div className="mythora-nebula" aria-hidden="true" />
      <div className="mythora-stars mythora-stars-a" aria-hidden="true" />
      <div className="mythora-stars mythora-stars-b" aria-hidden="true" />
      <div className="mythora-world" aria-hidden="true">
        <div className="mythora-moon" />
        <div className="mythora-mountains mythora-mountains-far" />
        <div className="mythora-mountains mythora-mountains-near" />
        <div className="mythora-world-grid" />
        <div className="mythora-rift" />
      </div>
      <img className="mythora-guardian mythora-guardian-ashquill" src={asset('myths/ashquill-battle.webp')} alt="" aria-hidden="true" />
      <img className="mythora-guardian mythora-guardian-flarelynx" src={asset('myths/flarelynx-battle.webp')} alt="" aria-hidden="true" />
      <div className="mythora-embers" aria-hidden="true">
        {Array.from({ length: 16 }, (_, index) => <i key={index} />)}
      </div>
      <div className="mythora-portal" aria-hidden="true"><i /><i /><i /></div>
      <div className="mythora-transition-flash" aria-hidden="true" />

      <section className="mythora-entry-panel" aria-labelledby="litardia-title">
        <div className="mythora-sigil" aria-hidden="true">
          <svg viewBox="0 0 64 64">
            <path d="M32 8v14M32 42v14M8 32h14M42 32h14M20 20l8 8M44 20l-8 8M20 44l8-8M44 44l-8-8" />
            <circle cx="32" cy="32" r="7" />
          </svg>
        </div>
        <p className="mythora-eyebrow">ENTER THE MYTHIC REALM</p>
        <h1 id="litardia-title" className="mythora-title-text">LITARDIA</h1>
        <img className="mythora-wordmark" src={asset('branding/litardia-wordmark.png')} alt="" aria-hidden="true" />
        <p className="mythora-tagline"><span /> Discover. Bond. Become legendary. <span /></p>

        <form onSubmit={submit}>
          <label htmlFor="explorer-name">EXPLORER NAME</label>
          <div className="mythora-name-field">
            <span aria-hidden="true">◇</span>
            <input
              id="explorer-name"
              value={name}
              maxLength={20}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              autoFocus
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter your name"
              disabled={phase !== 'ready'}
              data-testid="input-username"
            />
          </div>
          <button
            className="mythora-enter-button"
            disabled={cleanName.length < 2 || phase !== 'ready'}
            data-testid="button-next-character"
          >
            <span>{phase === 'ready' ? 'ENTER LITARDIA' : 'OPENING THE GATE'}</span>
            <b aria-hidden="true">→</b>
          </button>
        </form>

        <button
          type="button"
          className="mythora-sign-in"
          onClick={() => onSignIn(cleanName)}
          disabled={phase !== 'ready'}
        >
          Already an Explorer? <u>Sign in</u>
        </button>
        <div className="mythora-system-line"><i /> LITARDIA NETWORK ONLINE</div>
      </section>

      <p className="mythora-footer-mark">MONSTER REALMS ONLINE <span>·</span> ALPHA</p>
    </main>
  );
}
