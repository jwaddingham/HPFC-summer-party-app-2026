import { describe, expect, it } from 'vitest';
import { matchDisplayLabel } from './public-tournaments';

describe('matchDisplayLabel', () => {
  it('labels group matches by round', () => {
    expect(matchDisplayLabel({ stage: 'group', round_number: 1 })).toBe('Round 1');
  });

  it('labels knockout matches by stage', () => {
    expect(matchDisplayLabel({ stage: 'quarter_final', round_number: 3 })).toBe('Quarter-final 3');
    expect(matchDisplayLabel({ stage: 'semi_final', round_number: 2 })).toBe('Semi-final 2');
    expect(matchDisplayLabel({ stage: 'third_place', round_number: 1 })).toBe('3rd/4th playoff');
    expect(matchDisplayLabel({ stage: 'final', round_number: 1 })).toBe('Final');
  });
});
