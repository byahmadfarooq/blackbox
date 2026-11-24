import { ACTION_CHECKS, type CheckDef } from './rubric';
import { MESSAGE_CHECKS } from './rubric-message';
import { PROOF_CHECKS } from './rubric-proof';
import { BASICS_CHECKS } from './rubric-basics';
import type { PageArchetype } from './types';

export const CHECKS: CheckDef[] = [...ACTION_CHECKS, ...MESSAGE_CHECKS, ...PROOF_CHECKS, ...BASICS_CHECKS];
export const CHECK_BY_ID = new Map(CHECKS.map((c) => [c.id, c]));

export function weightFor(c: CheckDef, a: PageArchetype): number {
  return c.adjust?.[a] ?? c.weight;
}
