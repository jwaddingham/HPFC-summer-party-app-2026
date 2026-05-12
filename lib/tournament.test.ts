import { describe, expect, it } from 'vitest';
import { buildTable, generateKnockoutFixtures, generateRoundRobin } from './tournament';
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

  it('sorts by points, goal difference, goals for, then team name', () => {
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

    const alphabeticalRows = buildTable(teams, [
      match({ id: 'm3', home_team_id: 'reds', away_team_id: 'whites', home_score: 2, away_score: 0 }),
      match({ id: 'm4', home_team_id: 'golds', away_team_id: 'blues', home_score: 2, away_score: 0 }),
    ]);

    expect(alphabeticalRows.map((row) => row.team)).toEqual(['Golds', 'Reds', 'Blues', 'Whites']);
  });

  it('ignores incomplete, non-group, missing-score, and unknown-team matches', () => {
    const teams = [team('reds', 'Reds'), team('blues', 'Blues')];

    const rows = buildTable(teams, [
      match({ id: 'm1', status: 'scheduled', home_score: 8, away_score: 0 }),
      match({ id: 'm2', stage: 'semi_final', home_score: 4, away_score: 0 }),
      match({ id: 'm3', home_score: null, away_score: null }),
      match({ id: 'm4', home_team_id: 'other-tournament-team', away_team_id: 'reds', home_score: 5, away_score: 0 }),
    ]);

    const byId = Object.fromEntries(rows.map((row) => [row.teamId, row]));

    expect(byId.reds).toMatchObject({ played: 0, gf: 0, ga: 0, gd: 0, points: 0 });
    expect(byId.blues).toMatchObject({ played: 0, gf: 0, ga: 0, gd: 0, points: 0 });
  });
});

describe('generateRoundRobin', () => {
  it('generates every unique pairing once for 4 teams', () => {
    const fixtures = generateRoundRobin(['t1', 't2', 't3', 't4']);
    const pairings = new Set(fixtures.map((fixture) => [fixture.home, fixture.away].sort().join(':')));

    expect(fixtures).toHaveLength(6);
    expect(pairings.size).toBe(6);
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

  it('throws for unsupported top-four team counts', () => {
    expect(() => generateKnockoutFixtures(['t1', 't2', 't3', 't4', 't5'], 'top4')).toThrow(
      'Top-four mode supports only 4, 6, or 8 teams.',
    );
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
