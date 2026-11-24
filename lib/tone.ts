export const toneColor = (pct: number) => (pct >= 75 ? 'var(--color-good)' : pct >= 50 ? 'var(--color-warn)' : 'var(--color-bad)');
