import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SkillCinematic from '@/components/battle/SkillCinematic';

describe('Flarelynx basic attack cinematic', () => {
  it('renders exactly two claw-shaped fire waves and one defender burn zone', () => {
    render(
      <SkillCinematic
        skillName="Twinflare Claw"
        element="Fire"
        power={44}
        attackerSide="player"
        attackerMythId="flarelynx"
        attackerRarity="C"
        skillType="normal"
        onComplete={vi.fn()}
      />,
    );

    expect(screen.getAllByTestId('flarelynx-fire-claw-wave')).toHaveLength(2);
    expect(screen.getAllByTestId('flarelynx-target-burn')).toHaveLength(1);
  });

  it('does not attach Flarelynx burn visuals to Ashquill basic attacks', () => {
    render(
      <SkillCinematic
        skillName="Searing Peck"
        element="Fire"
        power={42}
        attackerSide="wild"
        attackerMythId="ashquill"
        attackerRarity="C"
        skillType="normal"
        onComplete={vi.fn()}
      />,
    );

    expect(screen.queryByTestId('flarelynx-target-burn')).not.toBeInTheDocument();
  });
});
