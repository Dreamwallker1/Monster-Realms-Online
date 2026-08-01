export type MythKind = 'ashquill' | 'flarelynx';
export type MythSide = 'player' | 'wild';
export type MythState = 'idle' | 'anticipation' | 'attack' | 'recovery' | 'hit' | 'faint';
export type PhysicsQuality = 'low' | 'medium' | 'high';
export type AttackStyle = 'combo' | 'leap' | 'burst';

export interface Vec2 { x: number; y: number }
export interface PhysicsTransform { x: number; y: number; rotation: number; scaleX: number; scaleY: number }
export interface RenderPose {
  entityId: string;
  state: MythState;
  root: PhysicsTransform;
  bones: Record<string, PhysicsTransform>;
  blink: number;
  squash: number;
  burning: boolean;
}

export interface ImpactEvent {
  attackerId: string;
  targetId: string;
  damage: number;
  direction: Vec2;
  force: number;
  hitStopMs?: number;
  burnMs?: number;
}

type BoneDef = {
  id: string;
  stiffness: number;
  damping: number;
  min: number;
  max: number;
  idleAmp: number;
  idleHz: number;
};
type Bone = BoneDef & { angle: number; velocity: number; target: number };
type ChainPoint = { p: Vec2; old: Vec2 };

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const lerp = (a: number, b: number, amount: number) => a + (b - a) * amount;
const length = (value: Vec2) => Math.hypot(value.x, value.y) || 1;

const PROFILES: Record<MythKind, BoneDef[]> = {
  ashquill: [
    { id: 'body', stiffness: 75, damping: 13, min: -.2, max: .2, idleAmp: .025, idleHz: 1.7 },
    { id: 'head', stiffness: 92, damping: 15, min: -.32, max: .28, idleAmp: .035, idleHz: 1.3 },
    { id: 'wingBack', stiffness: 56, damping: 10, min: -.58, max: .52, idleAmp: .075, idleHz: 1.9 },
    { id: 'wingFront', stiffness: 56, damping: 10, min: -.58, max: .62, idleAmp: .09, idleHz: 1.9 },
    { id: 'legBack', stiffness: 115, damping: 19, min: -.25, max: .25, idleAmp: .016, idleHz: 1.7 },
    { id: 'legFront', stiffness: 115, damping: 19, min: -.31, max: .31, idleAmp: .016, idleHz: 1.7 },
  ],
  flarelynx: [
    { id: 'body', stiffness: 88, damping: 15, min: -.22, max: .22, idleAmp: .023, idleHz: 1.8 },
    { id: 'head', stiffness: 105, damping: 17, min: -.34, max: .29, idleAmp: .035, idleHz: 1.45 },
    { id: 'legBack', stiffness: 125, damping: 20, min: -.3, max: .3, idleAmp: .018, idleHz: 1.8 },
    { id: 'legFront', stiffness: 125, damping: 20, min: -.42, max: .42, idleAmp: .022, idleHz: 1.8 },
  ],
};

class MythBody {
  readonly id: string;
  readonly kind: MythKind;
  readonly side: MythSide;
  readonly home: Vec2;
  state: MythState = 'idle';
  stateTime = 0;
  position: Vec2;
  velocity: Vec2 = { x: 0, y: 0 };
  rotation = 0;
  angularVelocity = 0;
  scaleX = 1;
  scaleY = 1;
  grounded = true;
  burnUntil = 0;
  blink = 0;
  bones: Bone[];
  chain: ChainPoint[] = [];
  private nextBlink = 1.4 + Math.random() * 2.4;

  constructor(id: string, kind: MythKind, side: MythSide, position: Vec2) {
    this.id = id;
    this.kind = kind;
    this.side = side;
    this.home = { ...position };
    this.position = { ...position };
    this.bones = PROFILES[kind].map((bone) => ({ ...bone, angle: 0, velocity: 0, target: 0 }));
    const count = kind === 'ashquill' ? 9 : 8;
    const direction = side === 'player' ? -1 : 1;
    for (let index = 0; index < count; index += 1) {
      const point = { x: position.x - direction * index * 12, y: position.y - index * 1.5 };
      this.chain.push({ p: { ...point }, old: { ...point } });
    }
  }

  setState(next: MythState) {
    if (this.state === 'faint' && next !== 'faint') return;
    if (this.state === next) return;
    this.state = next;
    this.stateTime = 0;
  }

  impulse(value: Vec2, spin = 0) {
    this.velocity.x += value.x;
    this.velocity.y += value.y;
    this.angularVelocity += spin;
    this.grounded = false;
  }

  update(dt: number, simulationTime: number, groundY: number) {
    this.stateTime += dt;
    if (!this.grounded) this.velocity.y += 1080 * dt;

    // A critically damped home spring gives knockback weight without allowing
    // either combatant to drift away from its arena slot.
    this.velocity.x += (this.home.x - this.position.x) * 48 * dt;
    this.velocity.x *= Math.pow(.055, dt);
    this.angularVelocity *= Math.pow(.03, dt);
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
    this.rotation += this.angularVelocity * dt;

    if (this.position.y >= groundY) {
      this.position.y = groundY;
      if (this.velocity.y > 75) {
        this.scaleX = 1.1;
        this.scaleY = .89;
      }
      this.velocity.y = 0;
      this.grounded = true;
    }

    this.rotation = lerp(this.rotation, 0, 1 - Math.exp(-10 * dt));
    this.scaleX = lerp(this.scaleX, 1, 1 - Math.exp(-13 * dt));
    this.scaleY = lerp(this.scaleY, 1, 1 - Math.exp(-13 * dt));
    this.animateTargets(simulationTime);
    this.solveBones(dt);
    this.solveChain(dt);

    this.nextBlink -= dt;
    if (this.nextBlink <= 0) {
      this.blink = 1;
      this.nextBlink = 1.8 + Math.random() * 3.2;
    }
    this.blink = Math.max(0, this.blink - dt * 8);

    if (this.state === 'hit' && this.stateTime > .36) this.setState('idle');
    if (this.state === 'recovery' && this.stateTime > .3) this.setState('idle');
  }

  private animateTargets(time: number) {
    for (const bone of this.bones) {
      bone.target = Math.sin(time * bone.idleHz * Math.PI * 2) * bone.idleAmp;
    }
    const get = (id: string) => this.bones.find((bone) => bone.id === id);
    const body = get('body');
    const head = get('head');
    if (!body || !head) return;

    if (this.state === 'anticipation') {
      body.target = -.11;
      head.target = -.17;
      if (this.kind === 'ashquill') {
        get('wingFront')!.target = -.38;
        get('wingBack')!.target = .29;
      } else {
        get('legFront')!.target = -.28;
      }
    } else if (this.state === 'attack') {
      body.target = .15;
      head.target = -.24;
      if (this.kind === 'ashquill') {
        get('wingFront')!.target = .57;
        get('wingBack')!.target = -.46;
      } else {
        get('legFront')!.target = .4;
        get('legBack')!.target = -.19;
      }
    } else if (this.state === 'hit') {
      const direction = this.side === 'player' ? .2 : -.2;
      body.target = direction;
      head.target = direction * 1.45;
      if (this.kind === 'ashquill') {
        get('wingFront')!.target = -direction * 2.2;
        get('wingBack')!.target = direction * 1.8;
      }
    } else if (this.state === 'faint') {
      body.target = this.side === 'player' ? .2 : -.2;
      head.target = .28;
    }
  }

  private solveBones(dt: number) {
    for (const bone of this.bones) {
      const acceleration = (bone.target - bone.angle) * bone.stiffness - bone.velocity * bone.damping;
      bone.velocity += acceleration * dt;
      bone.angle = clamp(bone.angle + bone.velocity * dt, bone.min, bone.max);
    }
  }

  private solveChain(dt: number) {
    const direction = this.side === 'player' ? -1 : 1;
    const root = this.chain[0];
    if (!root) return;
    root.p = { x: this.position.x - direction * 25, y: this.position.y - 55 };
    root.old = { ...root.p };
    const actionWhip = this.state === 'attack' ? Math.sin(this.stateTime * 18) * 34 : 0;
    const wind = Math.sin(this.stateTime * 3.1) * 8 + actionWhip;
    for (let index = 1; index < this.chain.length; index += 1) {
      const point = this.chain[index]!;
      const velocityX = (point.p.x - point.old.x) * .965;
      const velocityY = (point.p.y - point.old.y) * .965;
      point.old = { ...point.p };
      point.p.x += velocityX + (wind + index * 1.3) * dt * dt;
      point.p.y += velocityY + 260 * dt * dt;
    }
    const segmentLength = this.kind === 'ashquill' ? 14 : 12;
    for (let pass = 0; pass < 5; pass += 1) {
      for (let index = 1; index < this.chain.length; index += 1) {
        const previous = this.chain[index - 1]!;
        const point = this.chain[index]!;
        const dx = point.p.x - previous.p.x;
        const dy = point.p.y - previous.p.y;
        const distance = Math.hypot(dx, dy) || 1;
        const error = (distance - segmentLength) / distance;
        point.p.x -= dx * error;
        point.p.y -= dy * error;
      }
    }
  }

  pose(nowMs: number): RenderPose {
    const bones: Record<string, PhysicsTransform> = {};
    for (const bone of this.bones) {
      bones[bone.id] = { x: 0, y: 0, rotation: bone.angle, scaleX: 1, scaleY: 1 };
    }
    this.chain.forEach((point, index) => {
      const next = this.chain[Math.min(index + 1, this.chain.length - 1)]!;
      bones[`chain${index}`] = {
        x: point.p.x - this.position.x,
        y: point.p.y - this.position.y,
        rotation: Math.atan2(next.p.y - point.p.y, next.p.x - point.p.x),
        scaleX: 1,
        scaleY: 1,
      };
    });
    const chainRoot = this.chain[0];
    const chainTip = this.chain[this.chain.length - 1];
    if (chainRoot && chainTip) {
      const expected = this.side === 'player' ? 0 : Math.PI;
      let tailAngle = Math.atan2(chainTip.p.y - chainRoot.p.y, chainTip.p.x - chainRoot.p.x) - expected;
      while (tailAngle > Math.PI) tailAngle -= Math.PI * 2;
      while (tailAngle < -Math.PI) tailAngle += Math.PI * 2;
      bones.tail = { x: 0, y: 0, rotation: clamp(tailAngle, -.34, .34), scaleX: 1, scaleY: 1 };
    }
    return {
      entityId: this.id,
      state: this.state,
      root: {
        x: this.position.x - this.home.x,
        y: this.position.y - this.home.y,
        rotation: this.rotation,
        scaleX: this.scaleX,
        scaleY: this.scaleY,
      },
      bones,
      blink: this.blink,
      squash: 1 - this.scaleY,
      burning: this.burnUntil > nowMs,
    };
  }
}

export class MythPhysicsEngine {
  readonly step = 1 / 120;
  readonly quality: PhysicsQuality;
  onImpact?: (event: ImpactEvent) => void;
  private bodies = new Map<string, MythBody>();
  private timers = new Set<ReturnType<typeof setTimeout>>();
  private accumulator = 0;
  private last = 0;
  private frozenUntil = 0;
  private simulationTime = 0;

  constructor(quality: PhysicsQuality = 'high') {
    this.quality = quality;
  }

  add(entityId: string, kind: MythKind, side: MythSide, position: Vec2 = { x: 0, y: 0 }) {
    this.bodies.set(entityId, new MythBody(entityId, kind, side, position));
  }

  remove(entityId: string) {
    this.bodies.delete(entityId);
  }

  has(entityId: string) {
    return this.bodies.has(entityId);
  }

  setState(entityId: string, state: MythState) {
    this.bodies.get(entityId)?.setState(state);
  }

  attack(attackerId: string, targetId: string, damage: number, force = 310, style: AttackStyle = 'combo') {
    const attacker = this.bodies.get(attackerId);
    const target = this.bodies.get(targetId);
    if (!attacker || !target || attackerId === targetId) return false;

    const stillCurrent = () => this.bodies.get(attackerId) === attacker && this.bodies.get(targetId) === target;
    const directionX = attacker.side === 'player' ? -1 : 1;
    const firstImpactAt = style === 'combo' ? 520 : style === 'leap' ? 940 : 790;
    attacker.setState('anticipation');
    this.schedule(() => {
      if (!stillCurrent()) return;
      attacker.setState('attack');
      if (style === 'leap') attacker.impulse({ x: directionX * 150, y: -430 }, directionX * .18);
      else if (style === 'combo') attacker.impulse({ x: directionX * 105, y: -65 }, directionX * .08);
      else attacker.impulse({ x: -directionX * 42, y: -35 }, -directionX * .12);
    }, style === 'combo' ? 260 : style === 'leap' ? 330 : 410);
    this.schedule(() => { if (stillCurrent()) this.impact({
      attackerId,
      targetId,
      damage,
      direction: { x: directionX, y: style === 'leap' ? .42 : style === 'burst' ? -.08 : -.24 },
      force: style === 'leap' ? force * 1.28 : style === 'burst' ? force * 1.12 : force,
      hitStopMs: style === 'leap' ? 105 : style === 'burst' ? 88 : 70,
      burnMs: attacker.kind === 'flarelynx' ? 1050 : 0,
    }); }, firstImpactAt);

    // Twinflare Claw is a physical two-beat action. This second impulse is
    // visual only; battle HP remains exclusively server-authoritative.
    if (style === 'combo') {
      this.schedule(() => { if (stillCurrent()) this.impact({
        attackerId,
        targetId,
        damage: Math.round(damage * .45),
        direction: { x: attacker.side === 'player' ? -1 : 1, y: -.16 },
        force: force * .74,
        hitStopMs: 42,
        burnMs: 1150,
      }); }, firstImpactAt + 260);
    }
    this.schedule(() => { if (stillCurrent()) attacker.setState('recovery'); },
      style === 'combo' ? firstImpactAt + 390 : style === 'leap' ? 1160 : 1030);
    return true;
  }

  impact(event: ImpactEvent) {
    const target = this.bodies.get(event.targetId);
    if (!target || event.attackerId === event.targetId) return false;
    const magnitude = length(event.direction);
    const direction = { x: event.direction.x / magnitude, y: event.direction.y / magnitude };
    target.setState('hit');
    target.impulse({ x: direction.x * event.force, y: direction.y * event.force }, direction.x * .85);
    if (event.burnMs) target.burnUntil = performance.now() + event.burnMs;
    this.frozenUntil = performance.now() + (event.hitStopMs ?? 55);
    this.onImpact?.(event);
    return true;
  }

  faint(entityId: string) {
    const body = this.bodies.get(entityId);
    if (!body) return;
    body.setState('faint');
    body.impulse({ x: body.side === 'player' ? 90 : -90, y: -145 }, body.side === 'player' ? .9 : -.9);
  }

  tick(nowMs: number, groundY = 0) {
    if (!this.last) this.last = nowMs;
    let frame = Math.min(.05, Math.max(0, (nowMs - this.last) / 1000));
    this.last = nowMs;
    if (nowMs < this.frozenUntil) frame = 0;
    this.accumulator += frame;

    const maxSteps = this.quality === 'low' ? 3 : this.quality === 'medium' ? 6 : 10;
    let loops = 0;
    while (this.accumulator >= this.step && loops < maxSteps) {
      loops += 1;
      this.simulationTime += this.step;
      for (const body of this.bodies.values()) body.update(this.step, this.simulationTime, groundY);
      this.accumulator -= this.step;
    }
    // Discard an extreme backlog instead of letting a slow device spiral.
    if (loops === maxSteps) this.accumulator = Math.min(this.accumulator, this.step);
    return Array.from(this.bodies.values(), (body) => body.pose(nowMs));
  }

  resetClock() {
    this.last = 0;
    this.accumulator = 0;
  }

  destroy() {
    for (const timer of this.timers) clearTimeout(timer);
    this.timers.clear();
    this.bodies.clear();
    this.resetClock();
  }

  private schedule(callback: () => void, delayMs: number) {
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      callback();
    }, delayMs);
    this.timers.add(timer);
  }
}
