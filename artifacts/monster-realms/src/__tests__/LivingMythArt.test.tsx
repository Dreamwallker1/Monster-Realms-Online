import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import LivingMythArt from '@/components/game/LivingMythArt';

describe('LivingMythArt rigs', () => {
  it('gives Ashquill independent wing, head and eyelid layers', () => {
    const { container } = render(<LivingMythArt speciesId="ashquill" src="/ash.webp" size={300} facing="right" reactionKey={0} />);
    expect(screen.getByTestId('living-myth-ashquill')).toBeInTheDocument();
    expect(container.querySelectorAll('.living-myth-part')).toHaveLength(3);
    expect(container.querySelectorAll('.living-myth-eyelid')).toHaveLength(1);
  });

  it('gives Flarelynx tail, chest, head and two eyelids', () => {
    const { container } = render(<LivingMythArt speciesId="flarelynx" src="/flare.webp" size={300} facing="left" reactionKey={2} />);
    expect(screen.getByTestId('living-myth-flarelynx')).toHaveClass('living-myth-react');
    expect(container.querySelectorAll('.living-myth-part')).toHaveLength(3);
    expect(container.querySelectorAll('.living-myth-eyelid')).toHaveLength(2);
  });
});
