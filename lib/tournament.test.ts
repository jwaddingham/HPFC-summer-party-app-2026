import { describe, expect, it } from 'vitest';
import {
  buildTable,
  canTransition,
  assertTransition,
  computeNextKnockoutRound,
  computeThirdPlacePlayoff,
  generateKnockoutFixtures,
  generateRoundRobin,
  isKnockoutRoundComplete,
  nextKnockoutStage,
  resolveMatchLoser,
  resolveMatchWinner,
} from './tournament';
import { Match, Team } from './types';

const tournamentId = 'tournament-a';

function team(id: string, name: string): Team {
  return { id, name, tournament_id: tournamentId };
}

function match(overrides: Partial<Match>): Match {
  return {
    id: overrides.id ?? 'match',
    tournament_id: tournamentId,
    stage: 'group',
    round_number: 1,
    home_team_id: 'reds',
    away_team_id: 'blues',
    home_score: 0,
    away_score: 0,
    winner_team_id: null,
    status: 'complete',
    ...overrides,
  };
}

describe('buildTable', () => {
  it('calculates played, results, goals, goal difference, and points from completed group matches', () => {
    const teams = [
      team('reds', 'Reds'),
      team('blues', 'Blues'),
      team('golds', 'Golds'),
      team('whites', 'Whites'),
    ];

    const rows = buildTable(teams, [
      match({ id: 'm1', home_team_id: 'reds', away_team_id: 'blues', home_score: 2, away_score: 0 }),
      match({ id: 'm2', home_team_id: 'reds', away_team_id: 'golds', home_score: 1, away_score: 1 }),
      match({ id: 'm3', home_team_id: 'blues', away_team_id: 'golds', home_score: 3, away_score: 1 }),
    ]);

    expect(rows).toEqual([
      { teamId: 'reds', team: 'Reds', played: 2, won: 1, drawn: 1, lost: 0, gf: 3, ga: 1, gd: 2, points: 4 },
      { teamId: 'blues', team: 'Blues', played: 2, won: 1, drawn: 0, lost: 1, gf: 3, ga: 3, gd: 0, points: 3 },
      { teamId: 'golds', team: 'Golds', played: 2, won: 0, drawn: 1, lost: 1, gf: 2, ga: 4, gd: -2, points: 1 },
      { teamId: 'whites', team: 'Whites', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 },
    ]);
  });

  it('sorts by points, goal difference, goals for, then stable team ID', () => {
    const teams = [
      team('reds', 'Reds'),
      team('blues', 'Blues'),
      team('golds', 'Golds'),
      team('whites', 'Whites'),
    ];

    const goalsForRows = buildTable(teams, [
      match({ id: 'm1', home_team_id: 'reds', away_team_id: 'whites', home_score: 2, away_score: 0 }),
      match({ id: 'm2', home_team_id: 'blues', away_team_id: 'golds', home_score: 3, away_score: 1 }),
    ]);

    expect(goalsForRows.map((row) => row.team)).toEqual(['Blues', 'Reds', 'Golds', 'Whites']);

    const stableRows = buildTable(teams, [
      match({ id: 'm3', home_team_id: 'reds', away_team_id: 'whites', home_score: 2, away_score: 0 }),
      match({ id: 'm4', home_team_id: 'golds', away_team_id: 'blues', home_score: 2, away_score: 0 }),
    ]);

    expect(stableRows.map((row) => row.team)).toEqual(['Golds', 'Reds', 'Blues', 'Whites']);
  });

  it('keeps tied standings stable when display names change', () => {
    const rows = buildTable([team('team-b', 'Alpha'), team('team-a', 'Zulu')], [
      match({
        id: 'm1',
        home_team_id: 'team-a',
        away_team_id: 'team-b',
        home_score: 1,
        away_score: 1,
      }),
    ]);

    expect(rows.map((row) => row.team)).toEqual(['Zulu', 'Alpha']);
  });

  it('ignores incomplete, non-group, missing-score, and unknown-team matches', () => {
    const teams = [team('reds', 'Reds'), team('blues', 'Blues')];

    const rows = buildTable(teams, [
      match({ id: 'm1', status: 'scheduled', home_score: 8, away_score: 0 }),
      match({ id: 'm1b', status: 'cancelled', home_score: 8, away_score: 0 }),
      match({ id: 'm2', stage: 'semi_final', home_score: 4, away_score: 0 }),
      match({ id: 'm3', home_score: null, away_score: null }),
      match({ id: 'm4', home_team_id: 'other-tournament-team', away_team_id: 'reds', home_score: 5, away_score: 0 }),
    ]);

    const byId = Object.fromEntries(rows.map((row) => [row.teamId, row]));

    expect(byId.reds).toMatchObject({ played: 0, gf: 0, ga: 0, gd: 0, points: 0 });
    expect(byId.blues).toMatchObject({ played: 0, gf: 0, ga: 0, gd: 0, points: 0 });
  });

  it('awards one point each for draws without adding wins or losses', () => {
    const rows = buildTable([team('reds', 'Reds'), team('blues', 'Blues')], [
      match({ id: 'm1', home_team_id: 'reds', away_team_id: 'blues', home_score: 2, away_score: 2 }),
    ]);

    expect(rows).toEqual([
      { teamId: 'blues', team: 'Blues', played: 1, won: 0, drawn: 1, lost: 0, gf: 2, ga: 2, gd: 0, points: 1 },
      { teamId: 'reds', team: 'Reds', played: 1, won: 0, drawn: 1, lost: 0, gf: 2, ga: 2, gd: 0, points: 1 },
    ]);
  });
});

describe('generateRoundRobin', () => {
  it('generates every unique pairing once for 4 teams', () => {
    const fixtures = generateRoundRobin(['t1', 't2', 't3', 't4']);
    const pairings = new Set(fixtures.map((fixture) => [fixture.home, fixture.away].sort().join(':')));

    expect(fixtures).toHaveLength(6);
    expect(pairings).toEqual(new Set(['t1:t2', 't1:t3', 't1:t4', 't2:t3', 't2:t4', 't3:t4']));
  });

  it('groups 4-team fixtures into rounds without repeating a team within a round', () => {
    const fixtures = generateRoundRobin(['t1', 't2', 't3', 't4']);

    expect([...new Set(fixtures.map((fixture) => fixture.round))]).toEqual([1, 2, 3]);

    for (const round of [1, 2, 3]) {
      const teamsInRound = fixtures
        .filter((fixture) => fixture.round === round)
        .flatMap((fixture) => [fixture.home, fixture.away]);

      expect(teamsInRound).toHaveLength(4);
      expect(new Set(teamsInRound).size).toBe(4);
    }
  });

  it('generates 15 fixtures across 5 rounds for 6 teams', () => {
    const fixtures = generateRoundRobin(['t1', 't2', 't3', 't4', 't5', 't6']);

    expect(fixtures).toHaveLength(15);
    expect([...new Set(fixtures.map((fixture) => fixture.round))]).toEqual([1, 2, 3, 4, 5]);

    for (const round of [1, 2, 3, 4, 5]) {
      const teamsInRound = fixtures
        .filter((fixture) => fixture.round === round)
        .flatMap((fixture) => [fixture.home, fixture.away]);

      expect(teamsInRound).toHaveLength(6);
      expect(new Set(teamsInRound).size).toBe(6);
    }
  });

  it('generates 28 fixtures across 7 balanced rounds for 8 teams', () => {
    const fixtures = generateRoundRobin(['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8']);
    const pairings = new Set(fixtures.map((fixture) => [fixture.home, fixture.away].sort().join(':')));

    expect(fixtures).toHaveLength(28);
    expect(pairings.size).toBe(28);
    expect([...new Set(fixtures.map((fixture) => fixture.round))]).toEqual([1, 2, 3, 4, 5, 6, 7]);

    for (const round of [1, 2, 3, 4, 5, 6, 7]) {
      const teamsInRound = fixtures
        .filter((fixture) => fixture.round === round)
        .flatMap((fixture) => [fixture.home, fixture.away]);

      expect(teamsInRound).toHaveLength(8);
      expect(new Set(teamsInRound).size).toBe(8);
    }
  });

  it('generates a full round-robin for an odd field of 5 using byes', () => {
    const teams = ['t1', 't2', 't3', 't4', 't5'];
    const fixtures = generateRoundRobin(teams);
    const pairings = new Set(fixtures.map((fixture) => [fixture.home, fixture.away].sort().join(':')));

    // C(5,2) = 10 unique pairings, every pairing exactly once, no bye sentinel leaks.
    expect(fixtures).toHaveLength(10);
    expect(pairings.size).toBe(10);
    expect(fixtures.some((fixture) => fixture.home.includes('bye') || fixture.away.includes('bye'))).toBe(false);

    // Five rounds, and no team appears twice within a round (each rests once).
    expect([...new Set(fixtures.map((fixture) => fixture.round))].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5]);
    for (const round of [1, 2, 3, 4, 5]) {
      const teamsInRound = fixtures
        .filter((fixture) => fixture.round === round)
        .flatMap((fixture) => [fixture.home, fixture.away]);
      expect(new Set(teamsInRound).size).toBe(teamsInRound.length);
    }
  });

  it('generates a single match for two teams', () => {
    const fixtures = generateRoundRobin(['t1', 't2']);
    expect(fixtures).toHaveLength(1);
    expect([fixtures[0].home, fixtures[0].away].sort()).toEqual(['t1', 't2']);
  });

  it('generates a full round-robin for an odd field of 7', () => {
    const fixtures = generateRoundRobin(['t1', 't2', 't3', 't4', 't5', 't6', 't7']);
    const pairings = new Set(fixtures.map((fixture) => [fixture.home, fixture.away].sort().join(':')));
    expect(fixtures).toHaveLength(21); // C(7,2)
    expect(pairings.size).toBe(21);
  });

  it('throws when team IDs are duplicated', () => {
    expect(() => generateRoundRobin(['t1', 't2', 't2', 't4'])).toThrow(
      'Round-robin generation requires unique team IDs.',
    );
  });
});

describe('generateKnockoutFixtures', () => {
  it('generates top-four semi-finals for 4 teams with 1v4 and 2v3 seeding', () => {
    expect(generateKnockoutFixtures(['t1', 't2', 't3', 't4'], 'top4')).toEqual([
      { stage: 'semi_final', round: 1, home: 't1', away: 't4' },
      { stage: 'semi_final', round: 2, home: 't2', away: 't3' },
    ]);
  });

  it('generates top-four semi-finals for 6 teams using only the top four seeds', () => {
    expect(generateKnockoutFixtures(['t1', 't2', 't3', 't4', 't5', 't6'], 'top4')).toEqual([
      { stage: 'semi_final', round: 1, home: 't1', away: 't4' },
      { stage: 'semi_final', round: 2, home: 't2', away: 't3' },
    ]);
  });

  it('generates top-four semi-finals for 8 teams using only the top four seeds', () => {
    expect(generateKnockoutFixtures(['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8'], 'top4')).toEqual([
      { stage: 'semi_final', round: 1, home: 't1', away: 't4' },
      { stage: 'semi_final', round: 2, home: 't2', away: 't3' },
    ]);
  });

  it('generates quarter-finals for 8 teams with 1v8, 2v7, 3v6, and 4v5 seeding', () => {
    expect(generateKnockoutFixtures(['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8'], 'quarter_finals')).toEqual([
      { stage: 'quarter_final', round: 1, home: 't1', away: 't8' },
      { stage: 'quarter_final', round: 2, home: 't2', away: 't7' },
      { stage: 'quarter_final', round: 3, home: 't3', away: 't6' },
      { stage: 'quarter_final', round: 4, home: 't4', away: 't5' },
    ]);
  });

  it('is deterministic for the same ordered seeds', () => {
    const seeds = ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8'];
    expect(generateKnockoutFixtures(seeds, 'quarter_finals')).toEqual(generateKnockoutFixtures(seeds, 'quarter_finals'));
  });

  it('generates top-four semi-finals for odd fields of five or more', () => {
    expect(generateKnockoutFixtures(['t1', 't2', 't3', 't4', 't5'], 'top4')).toEqual([
      { stage: 'semi_final', round: 1, home: 't1', away: 't4' },
      { stage: 'semi_final', round: 2, home: 't2', away: 't3' },
    ]);
    expect(generateKnockoutFixtures(['t1', 't2', 't3', 't4', 't5', 't6', 't7'], 'top4')).toEqual([
      { stage: 'semi_final', round: 1, home: 't1', away: 't4' },
      { stage: 'semi_final', round: 2, home: 't2', away: 't3' },
    ]);
  });

  it('sends the top two straight to a final when there are fewer than four teams', () => {
    expect(generateKnockoutFixtures(['t1', 't2', 't3'], 'top4')).toEqual([
      { stage: 'final', round: 1, home: 't1', away: 't2' },
    ]);
    expect(generateKnockoutFixtures(['t1', 't2'], 'top4')).toEqual([
      { stage: 'final', round: 1, home: 't1', away: 't2' },
    ]);
  });

  it('throws when there are not enough teams for a knockout', () => {
    expect(() => generateKnockoutFixtures(['t1'], 'top4')).toThrow('Knockout generation needs at least two teams.');
  });

  it('throws when quarter-final mode does not have exactly 8 teams', () => {
    expect(() => generateKnockoutFixtures(['t1', 't2', 't3', 't4', 't5', 't6'], 'quarter_finals')).toThrow(
      'Quarter-final mode requires exactly 8 teams.',
    );
  });

  it('throws when seeds contain duplicate teams', () => {
    expect(() => generateKnockoutFixtures(['t1', 't2', 't2', 't4'], 'top4')).toThrow(
      'Knockout generation requires unique team IDs.',
    );
  });
});

describe('tournament state machine', () => {
  it('allows the documented forward progression', () => {
    expect(canTransition('setup', 'group_stage')).toBe(true);
    expect(canTransition('group_stage', 'knockout_stage')).toBe(true);
    expect(canTransition('knockout_stage', 'complete')).toBe(true);
  });

  it('keeps every stage reversible so organisers are never trapped', () => {
    expect(canTransition('group_stage', 'setup')).toBe(true);
    expect(canTransition('knockout_stage', 'setup')).toBe(true);
    expect(canTransition('knockout_stage', 'group_stage')).toBe(true);
    expect(canTransition('complete', 'setup')).toBe(true);
    expect(canTransition('complete', 'knockout_stage')).toBe(true);
    expect(canTransition('complete', 'group_stage')).toBe(true);
  });

  it('treats a no-op transition to the same status as allowed', () => {
    expect(canTransition('complete', 'complete')).toBe(true);
  });

  it('rejects skipping stages', () => {
    expect(canTransition('setup', 'knockout_stage')).toBe(false);
    expect(canTransition('setup', 'complete')).toBe(false);
    expect(canTransition('group_stage', 'complete')).toBe(false);
  });

  it('assertTransition throws a clear message for illegal moves', () => {
    expect(() => assertTransition('setup', 'complete')).toThrow('Cannot move tournament from setup to complete.');
    expect(() => assertTransition('group_stage', 'knockout_stage')).not.toThrow();
  });
});

describe('resolveMatchWinner', () => {
  function knockoutMatch(overrides: Partial<Match>): Match {
    return {
      id: 'k1',
      tournament_id: tournamentId,
      stage: 'semi_final',
      round_number: 1,
      home_team_id: 'reds',
      away_team_id: 'blues',
      home_score: null,
      away_score: null,
      winner_team_id: null,
      status: 'scheduled',
      ...overrides,
    };
  }

  it('returns the higher scorer for a decisive result', () => {
    expect(resolveMatchWinner(knockoutMatch({ home_score: 2, away_score: 1 }))).toBe('reds');
    expect(resolveMatchWinner(knockoutMatch({ home_score: 0, away_score: 3 }))).toBe('blues');
  });

  it('returns null for a level score with no explicit winner', () => {
    expect(resolveMatchWinner(knockoutMatch({ home_score: 1, away_score: 1 }))).toBeNull();
  });

  it('honours an explicit winner on a level score (penalties/decision)', () => {
    expect(resolveMatchWinner(knockoutMatch({ home_score: 1, away_score: 1, winner_team_id: 'blues' }))).toBe('blues');
  });

  it('returns null when scores are missing', () => {
    expect(resolveMatchWinner(knockoutMatch({ home_score: null, away_score: null }))).toBeNull();
  });

  it('throws when the explicit winner is not one of the two teams', () => {
    expect(() => resolveMatchWinner(knockoutMatch({ winner_team_id: 'golds' }))).toThrow(
      'Winner must be one of the two competing teams.',
    );
  });
});

describe('resolveMatchLoser', () => {
  function knockoutMatch(overrides: Partial<Match>): Match {
    return {
      id: 'k1',
      tournament_id: tournamentId,
      stage: 'semi_final',
      round_number: 1,
      home_team_id: 'reds',
      away_team_id: 'blues',
      home_score: null,
      away_score: null,
      winner_team_id: null,
      status: 'scheduled',
      ...overrides,
    };
  }

  it('returns the opposite team from the resolved winner', () => {
    expect(resolveMatchLoser(knockoutMatch({ home_score: 2, away_score: 1 }))).toBe('blues');
    expect(resolveMatchLoser(knockoutMatch({ home_score: 0, away_score: 3 }))).toBe('reds');
  });

  it('uses an explicit winner on a level score to identify the loser', () => {
    expect(resolveMatchLoser(knockoutMatch({ home_score: 1, away_score: 1, winner_team_id: 'blues' }))).toBe('reds');
  });

  it('returns null until the match has a resolved winner', () => {
    expect(resolveMatchLoser(knockoutMatch({ home_score: 1, away_score: 1 }))).toBeNull();
  });
});

describe('computeNextKnockoutRound', () => {
  function ko(overrides: Partial<Match>): Match {
    return {
      id: overrides.id ?? 'k',
      tournament_id: tournamentId,
      stage: 'semi_final',
      round_number: 1,
      home_team_id: 'a',
      away_team_id: 'b',
      home_score: 1,
      away_score: 0,
      winner_team_id: null,
      status: 'complete',
      ...overrides,
    };
  }

  it('advances two semi-final winners into the final', () => {
    const next = computeNextKnockoutRound('semi_final', [
      ko({ id: 's1', round_number: 1, home_team_id: 'a', away_team_id: 'b', home_score: 2, away_score: 0 }),
      ko({ id: 's2', round_number: 2, home_team_id: 'c', away_team_id: 'd', home_score: 0, away_score: 1 }),
    ]);

    expect(next).toEqual([{ stage: 'final', round: 1, home: 'a', away: 'd' }]);
  });

  it('advances four quarter-final winners into two semis (QF1/QF4 and QF2/QF3)', () => {
    const next = computeNextKnockoutRound('quarter_final', [
      ko({ id: 'q1', stage: 'quarter_final', round_number: 1, home_team_id: 's1', away_team_id: 's8', home_score: 3, away_score: 0 }),
      ko({ id: 'q2', stage: 'quarter_final', round_number: 2, home_team_id: 's2', away_team_id: 's7', home_score: 0, away_score: 2 }),
      ko({ id: 'q3', stage: 'quarter_final', round_number: 3, home_team_id: 's3', away_team_id: 's6', home_score: 1, away_score: 0 }),
      ko({ id: 'q4', stage: 'quarter_final', round_number: 4, home_team_id: 's4', away_team_id: 's5', home_score: 2, away_score: 1 }),
    ]);

    expect(next).toEqual([
      { stage: 'semi_final', round: 1, home: 's1', away: 's4' },
      { stage: 'semi_final', round: 2, home: 's7', away: 's3' },
    ]);
  });

  it('uses the explicit winner of a drawn knockout match when advancing', () => {
    const next = computeNextKnockoutRound('semi_final', [
      ko({ id: 's1', round_number: 1, home_team_id: 'a', away_team_id: 'b', home_score: 1, away_score: 1, winner_team_id: 'b' }),
      ko({ id: 's2', round_number: 2, home_team_id: 'c', away_team_id: 'd', home_score: 2, away_score: 0 }),
    ]);

    expect(next).toEqual([{ stage: 'final', round: 1, home: 'b', away: 'c' }]);
  });

  it('returns an empty list for the final (no next round)', () => {
    expect(computeNextKnockoutRound('final', [ko({ stage: 'final' })])).toEqual([]);
    expect(nextKnockoutStage('final')).toBeNull();
  });

  it('returns an empty list for the third-place playoff (no next round)', () => {
    expect(computeNextKnockoutRound('third_place', [ko({ stage: 'third_place' })])).toEqual([]);
    expect(nextKnockoutStage('third_place')).toBeNull();
  });

  it('throws when a drawn match has no recorded winner', () => {
    expect(() =>
      computeNextKnockoutRound('semi_final', [
        ko({ id: 's1', round_number: 1, home_score: 1, away_score: 1 }),
        ko({ id: 's2', round_number: 2, home_score: 2, away_score: 0 }),
      ]),
    ).toThrow('Every match in the round needs a winner before the next round can be drawn.');
  });

  it('throws when the round does not have the expected number of matches', () => {
    expect(() => computeNextKnockoutRound('quarter_final', [ko({ stage: 'quarter_final' })])).toThrow(
      'Semi-finals require four completed quarter-finals.',
    );
  });
});

describe('computeThirdPlacePlayoff', () => {
  function ko(overrides: Partial<Match>): Match {
    return {
      id: overrides.id ?? 'k',
      tournament_id: tournamentId,
      stage: 'semi_final',
      round_number: 1,
      home_team_id: 'a',
      away_team_id: 'b',
      home_score: 1,
      away_score: 0,
      winner_team_id: null,
      status: 'complete',
      ...overrides,
    };
  }

  it('draws the two semi-final losers into the 3rd/4th playoff', () => {
    const playoff = computeThirdPlacePlayoff([
      ko({ id: 's1', round_number: 1, home_team_id: 'a', away_team_id: 'b', home_score: 2, away_score: 0 }),
      ko({ id: 's2', round_number: 2, home_team_id: 'c', away_team_id: 'd', home_score: 0, away_score: 1 }),
    ]);

    expect(playoff).toEqual([{ stage: 'third_place', round: 1, home: 'b', away: 'c' }]);
  });

  it('uses explicit winners from drawn semi-finals to identify playoff teams', () => {
    const playoff = computeThirdPlacePlayoff([
      ko({ id: 's1', round_number: 1, home_team_id: 'a', away_team_id: 'b', home_score: 1, away_score: 1, winner_team_id: 'b' }),
      ko({ id: 's2', round_number: 2, home_team_id: 'c', away_team_id: 'd', home_score: 2, away_score: 2, winner_team_id: 'c' }),
    ]);

    expect(playoff).toEqual([{ stage: 'third_place', round: 1, home: 'a', away: 'd' }]);
  });

  it('requires two completed semi-finals', () => {
    expect(() => computeThirdPlacePlayoff([ko({ id: 's1' })])).toThrow(
      'The third-place playoff requires two completed semi-finals.',
    );
  });

  it('waits until both semi-finals are complete with resolved winners', () => {
    expect(() =>
      computeThirdPlacePlayoff([
        ko({ id: 's1', round_number: 1 }),
        ko({ id: 's2', round_number: 2, status: 'scheduled' }),
      ]),
    ).toThrow('Every semi-final needs a winner before the third-place playoff can be drawn.');
  });
});

describe('isKnockoutRoundComplete', () => {
  function ko(overrides: Partial<Match>): Match {
    return {
      id: 'k',
      tournament_id: tournamentId,
      stage: 'semi_final',
      round_number: 1,
      home_team_id: 'a',
      away_team_id: 'b',
      home_score: 1,
      away_score: 0,
      winner_team_id: null,
      status: 'complete',
      ...overrides,
    };
  }

  it('is false for an empty round', () => {
    expect(isKnockoutRoundComplete([])).toBe(false);
  });

  it('is false while a match is still scheduled', () => {
    expect(isKnockoutRoundComplete([ko({ status: 'scheduled', home_score: null, away_score: null })])).toBe(false);
  });

  it('is false when a completed match is an unresolved draw', () => {
    expect(isKnockoutRoundComplete([ko({ home_score: 1, away_score: 1 })])).toBe(false);
  });

  it('is true when every match is complete with a resolved winner', () => {
    expect(
      isKnockoutRoundComplete([
        ko({ id: 's1', home_score: 2, away_score: 1 }),
        ko({ id: 's2', round_number: 2, home_score: 1, away_score: 1, winner_team_id: 'a' }),
      ]),
    ).toBe(true);
  });
});
