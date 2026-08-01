import { fireEvent, render, screen } from '@testing-library/react';
import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import MythoraEntry from '@/components/auth/MythoraEntry';

describe('MythoraEntry', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('opens the Litardia gate before continuing with a trimmed explorer name', () => {
    vi.useFakeTimers();
    const onContinue = vi.fn();

    render(<MythoraEntry onContinue={onContinue} onSignIn={vi.fn()} />);
    fireEvent.change(screen.getByTestId('input-username'), { target: { value: '  Ember  ' } });
    fireEvent.click(screen.getByTestId('button-next-character'));

    expect(screen.getByTestId('premium-entry')).toHaveClass('phase-opening');
    expect(screen.getByText('OPENING THE GATE')).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(920));
    expect(screen.getByTestId('premium-entry')).toHaveClass('phase-leaving');
    expect(onContinue).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(840));
    expect(onContinue).toHaveBeenCalledWith('Ember');
  });

  it('carries the typed username into the existing-player sign-in flow', () => {
    const onSignIn = vi.fn();
    render(<MythoraEntry onContinue={vi.fn()} onSignIn={onSignIn} />);

    fireEvent.change(screen.getByTestId('input-username'), { target: { value: 'GMeskijoe' } });
    fireEvent.click(screen.getByText('Sign in'));

    expect(onSignIn).toHaveBeenCalledWith('GMeskijoe');
  });
});
