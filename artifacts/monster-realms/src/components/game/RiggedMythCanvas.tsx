import { useEffect, useRef } from 'react';

type RigMode = 'idle' | 'attack' | 'hit';
type Point = [number, number];
type Part = { id: string; parent?: string; pivot: Point; poly: Point[]; z: number; motion: string };
type Rig = { scale: number; parts: Part[]; eye: Point };
type Motion = { x: number; y: number; r: number; sx: number; sy: number };

const RIGS: Record<string, Rig> = {
  ashquill: { scale: 1.06, eye: [156, 231], parts: [
    { id: 'tail', parent: 'body', pivot: [300,350], poly: [[245,292],[500,310],[508,447],[275,408]], z: 0, motion: 'tail' },
    { id: 'wingBack', parent: 'body', pivot: [214,252], poly: [[27,142],[231,120],[255,325],[46,353]], z: 1, motion: 'wingBack' },
    { id: 'body', pivot: [256,330], poly: [[130,205],[300,183],[378,308],[343,403],[264,413],[193,374],[145,309]], z: 2, motion: 'body' },
    { id: 'legBack', parent: 'body', pivot: [225,350], poly: [[155,320],[267,323],[273,494],[118,494]], z: 3, motion: 'legBack' },
    { id: 'legFront', parent: 'body', pivot: [304,351], poly: [[267,316],[373,317],[390,498],[258,496]], z: 4, motion: 'legFront' },
    { id: 'head', parent: 'body', pivot: [205,259], poly: [[83,135],[277,121],[292,301],[108,329]], z: 5, motion: 'head' },
    { id: 'wingFront', parent: 'body', pivot: [282,250], poly: [[202,16],[498,17],[510,330],[278,339],[220,218]], z: 6, motion: 'wingFront' },
  ]},
  flarelynx: { scale: 1.04, eye: [357,192], parts: [
    { id: 'tail', parent: 'body', pivot: [155,270], poly: [[5,45],[202,45],[222,330],[21,344]], z: 0, motion: 'tail' },
    { id: 'legBack', parent: 'body', pivot: [181,313], poly: [[107,273],[232,270],[237,468],[78,471]], z: 1, motion: 'legBack' },
    { id: 'body', pivot: [260,300], poly: [[126,164],[350,148],[410,316],[330,389],[153,356]], z: 2, motion: 'body' },
    { id: 'legFront', parent: 'body', pivot: [338,307], poly: [[278,254],[464,258],[477,468],[268,468]], z: 3, motion: 'legFront' },
    { id: 'head', parent: 'body', pivot: [326,224], poly: [[218,50],[473,42],[492,304],[216,317]], z: 4, motion: 'head' },
  ]},
};

function getMotion(name: string, t: number, mode: RigMode, myth: string): Motion {
  let x = 0, y = 0, r = 0, sx = 1, sy = 1;
  if (mode === 'idle') {
    const breath = Math.sin(t * 2.3);
    if (name === 'body') { y = breath * 2.6; sx = 1 + breath * .004; sy = 1 + breath * .012; }
    if (name === 'head') r = Math.sin(t * 1.7) * .025;
    if (name === 'wingFront') r = Math.sin(t * 2.1) * .06;
    if (name === 'wingBack') r = -Math.sin(t * 2.1) * .045;
    if (name === 'tail') r = Math.sin(t * 2.8) * (myth === 'flarelynx' ? .09 : .065);
    if (name === 'legFront' || name === 'legBack') r = Math.sin(t * 2.3 + (name === 'legBack' ? 1 : 0)) * .012;
  } else if (mode === 'attack') {
    const p = Math.min(t / .52, 1);
    const wind = p < .42 ? p / .42 : Math.max(0, (1 - p) / .58);
    const hit = Math.max(0, 1 - Math.abs(p - .62) * 7);
    if (name === 'body') { x = hit * 32; y = -hit * 8; r = -hit * .045; sx = 1 + hit * .035; }
    if (name === 'head') r = -wind * .13 - hit * .12;
    if (name === 'wingFront') r = -wind * .34 + hit * .5;
    if (name === 'wingBack') r = wind * .28 - hit * .35;
    if (name === 'tail') r = -wind * .18;
    if (name === 'legFront') r = -hit * .28;
    if (name === 'legBack') r = hit * .12;
  } else {
    const p = Math.min(t / .24, 1);
    const impact = Math.max(0, 1 - p);
    const shake = Math.sin(p * 70) * impact;
    if (name === 'body') { x = -impact * 36; y = impact * 8; r = impact * .11 + shake * .015; }
    if (name === 'head') r = impact * .22 + shake * .035;
    if (name === 'wingFront') r = -impact * .3;
    if (name === 'wingBack') r = impact * .25;
    if (name === 'tail') r = -impact * .25;
  }
  return { x, y, r, sx, sy };
}

function applyMotion(ctx: CanvasRenderingContext2D, pivot: Point, m: Motion, origin: Point, scale: number) {
  const px = origin[0] + pivot[0] * scale;
  const py = origin[1] + pivot[1] * scale;
  ctx.translate(px, py);
  ctx.translate(m.x * scale, m.y * scale);
  ctx.rotate(m.r);
  ctx.scale(m.sx, m.sy);
  ctx.translate(-px, -py);
}

export default function RiggedMythCanvas({ speciesId, src, size, facing, mode }: {
  speciesId: string; src: string; size: number; facing: 'left' | 'right'; mode: RigMode;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const rig = RIGS[speciesId];
    if (!canvas || !rig) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const image = new Image();
    image.src = src;
    let frameId = 0;
    let disposed = false;
    const started = performance.now();
    const logical = 640;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = logical * dpr;
    canvas.height = logical * dpr;

    const draw = (now: number) => {
      const t = (now - started) / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, logical, logical);
      ctx.save();
      if (facing === 'left') { ctx.translate(logical, 0); ctx.scale(-1, 1); }
      const scale = rig.scale;
      const origin: Point = [(logical - 512 * scale) / 2, (logical - 512 * scale) / 2 + 18];
      const body = rig.parts.find(part => part.id === 'body')!;
      const bodyMotion = getMotion('body', t, mode, speciesId);
      if (image.complete && image.naturalWidth) {
        rig.parts.forEach(part => {
          ctx.save();
          if (part.parent === 'body') applyMotion(ctx, body.pivot, bodyMotion, origin, scale);
          applyMotion(ctx, part.pivot, getMotion(part.motion, t, mode, speciesId), origin, scale);
          ctx.beginPath();
          part.poly.forEach(([x,y], index) => index
            ? ctx.lineTo(origin[0] + x * scale, origin[1] + y * scale)
            : ctx.moveTo(origin[0] + x * scale, origin[1] + y * scale));
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(image, origin[0], origin[1], 512 * scale, 512 * scale);
          ctx.restore();
        });
        if (mode === 'idle' && Math.sin(t * .83) > .985) {
          ctx.save();
          if (facing === 'left') { /* parent canvas is already mirrored */ }
          ctx.fillStyle = '#170b10';
          ctx.beginPath();
          ctx.ellipse(origin[0] + rig.eye[0] * scale, origin[1] + rig.eye[1] * scale, 10 * scale, 3 * scale, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
      ctx.restore();
      frameId = requestAnimationFrame(draw);
    };
    let loopStarted = false;
    const startLoop = () => {
      if (loopStarted || disposed) return;
      loopStarted = true;
      frameId = requestAnimationFrame(draw);
    };
    image.onload = startLoop;
    if (image.complete) startLoop();
    return () => {
      disposed = true;
      image.onload = null;
      cancelAnimationFrame(frameId);
    };
  }, [speciesId, src, facing, mode]);

  return <canvas ref={canvasRef} className="rigged-myth-canvas" style={{ width: size, height: size }} role="img" aria-label={`${speciesId} living battle rig`} />;
}
