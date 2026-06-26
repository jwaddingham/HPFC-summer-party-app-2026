import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const { getSupabaseAdminClientMock, progressKnockoutMock } = vi.hoisted(() => ({
  getSupabaseAdminClientMock: vi.fn(),
  progressKnockoutMock: vi.fn(async () => ({})),
}));

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseAdminClient: getSupabaseAdminClientMock,
}));

vi.mock('@/lib/knockout-server', () => ({
  progressKnockout: progressKnockoutMock,
}));

import { POST as loginPost } from '@/app/api/admin/login/route';
import { DELETE as deleteTournament } from '@/app/api/admin/tournament/[id]/route';
import { PATCH as patchScore } from '@/app/api/admin/tournament/[id]/matches/[matchId]/route';
import { POST as resetTournament } from '@/app/api/admin/tournament/[id]/reset/route';
import { PATCH as patchTeams } from '@/app/api/admin/tournament/[id]/teams/route';
import { POST as createTournament } from '@/app/api/admin/tournaments/route';

const originalAdminCode = process.env.ADMIN_ACCESS_CODE;

afterEach(() => {
  vi.clearAllMocks();
  if (originalAdminCode === undefined) {
    delete process.env.ADMIN_ACCESS_CODE;
  } else {
    process.env.ADMIN_ACCESS_CODE = originalAdminCode;
  }
});

function request(method: string, path: string, body?: unknown, admin = true) {
  const headers = new Headers();
  if (body !== undefined) headers.set('content-type', 'application/json');
  if (admin) headers.set('x-hpfc-admin', '1');

  return new NextRequest(`http://localhost${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function twoEqSingle(result: unknown) {
  return {
    eq: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(async () => result),
      })),
    })),
  };
}

function oneEqSingle(result: unknown) {
  return {
    eq: vi.fn(() => ({
      single: vi.fn(async () => result),
    })),
  };
}

function updateTwoEqSelectSingle(result: unknown) {
  return {
    eq: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(async () => result),
        })),
      })),
    })),
  };
}

describe('admin login route', () => {
  it('accepts the configured access code and rejects the wrong one', async () => {
    process.env.ADMIN_ACCESS_CODE = 'event-secret';

    const accepted = await loginPost(request('POST', '/api/admin/login', { code: 'event-secret' }, false));
    const rejected = await loginPost(request('POST', '/api/admin/login', { code: 'wrong' }, false));

    expect(accepted.status).toBe(200);
    expect(rejected.status).toBe(401);
  });
});

describe('tournament creation route', () => {
  it('validates and persists a tournament with normalized team names', async () => {
    const tournamentInsert = vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(async () => ({ data: { id: 'tournament-1' }, error: null })),
      })),
    }));
    const teamInsert = vi.fn(async () => ({ error: null }));

    getSupabaseAdminClientMock.mockReturnValue({
      from: vi.fn((table: string) => {
        if (table === 'tournaments') return { insert: tournamentInsert };
        if (table === 'teams') return { insert: teamInsert };
        throw new Error(`Unexpected table ${table}`);
      }),
    });

    const response = await createTournament(
      request('POST', '/api/admin/tournaments', {
        name: '  Summer Party  ',
        teamCount: 4,
        teamNames: [' Reds ', 'Blues', ' Golds ', 'Whites'],
      }),
    );

    await expect(response.json()).resolves.toEqual({ id: 'tournament-1' });
    expect(response.status).toBe(201);
    expect(tournamentInsert).toHaveBeenCalledWith({ name: 'Summer Party' });
    expect(teamInsert).toHaveBeenCalledWith([
      { tournament_id: 'tournament-1', name: 'Reds' },
      { tournament_id: 'tournament-1', name: 'Blues' },
      { tournament_id: 'tournament-1', name: 'Golds' },
      { tournament_id: 'tournament-1', name: 'Whites' },
    ]);
  });
});

describe('score update route', () => {
  it('rejects invalid scores before writing', async () => {
    const response = await patchScore(
      request('PATCH', '/api/admin/tournament/tournament-1/matches/match-1', { home_score: -1, away_score: 0 }),
      { params: Promise.resolve({ id: 'tournament-1', matchId: 'match-1' }) },
    );

    await expect(response.json()).resolves.toEqual({ error: 'Scores must be non-negative integers.' });
    expect(response.status).toBe(400);
    expect(getSupabaseAdminClientMock).not.toHaveBeenCalled();
  });

  it('persists valid group scores and returns the saved match', async () => {
    const savedMatch = {
      id: 'match-1',
      stage: 'group',
      round_number: 1,
      home_team_id: 'reds',
      away_team_id: 'blues',
      home_score: 2,
      away_score: 1,
      winner_team_id: null,
      status: 'complete',
    };
    const update = vi.fn(() => updateTwoEqSelectSingle({ data: savedMatch, error: null }));

    getSupabaseAdminClientMock.mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn(() =>
          twoEqSingle({
            data: { id: 'match-1', stage: 'group', home_team_id: 'reds', away_team_id: 'blues' },
            error: null,
          }),
        ),
        update,
      })),
    });

    const response = await patchScore(
      request('PATCH', '/api/admin/tournament/tournament-1/matches/match-1', { home_score: 2, away_score: 1 }),
      { params: Promise.resolve({ id: 'tournament-1', matchId: 'match-1' }) },
    );

    await expect(response.json()).resolves.toEqual(savedMatch);
    expect(response.status).toBe(200);
    expect(update).toHaveBeenCalledWith({
      home_score: 2,
      away_score: 1,
      status: 'complete',
      winner_team_id: null,
    });
    expect(progressKnockoutMock).not.toHaveBeenCalled();
  });
});

describe('team mutation route', () => {
  it('allows rename-only updates after fixtures exist', async () => {
    const update = vi.fn((value: { name: string }) => ({
      eq: vi.fn(() => ({
        eq: vi.fn(async () => ({ error: null, value })),
      })),
    }));

    getSupabaseAdminClientMock.mockReturnValue({
      from: vi.fn((table: string) => {
        if (table === 'matches') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(async () => ({ count: 2, error: null })),
            })),
          };
        }
        if (table === 'teams') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(async () => ({
                data: [{ id: 'reds' }, { id: 'blues' }, { id: 'golds' }, { id: 'whites' }],
                error: null,
              })),
            })),
            update,
          };
        }
        throw new Error(`Unexpected table ${table}`);
      }),
    });

    const response = await patchTeams(
      request('PATCH', '/api/admin/tournament/tournament-1/teams', {
        teams: [
          { id: 'reds', name: 'Reds renamed' },
          { id: 'blues', name: 'Blues' },
          { id: 'golds', name: 'Golds' },
          { id: 'whites', name: 'Whites' },
        ],
      }),
      { params: Promise.resolve({ id: 'tournament-1' }) },
    );

    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(response.status).toBe(200);
    expect(update).toHaveBeenCalledWith({ name: 'Reds renamed' });
    expect(update).toHaveBeenCalledWith({ name: 'Blues' });
    expect(update).toHaveBeenCalledWith({ name: 'Golds' });
    expect(update).toHaveBeenCalledWith({ name: 'Whites' });
  });

  it('blocks structural team changes after fixtures exist', async () => {
    getSupabaseAdminClientMock.mockReturnValue({
      from: vi.fn((table: string) => {
        if (table === 'matches') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(async () => ({ count: 2, error: null })),
            })),
          };
        }
        if (table === 'teams') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(async () => ({
                data: [{ id: 'reds' }, { id: 'blues' }, { id: 'golds' }, { id: 'whites' }],
                error: null,
              })),
            })),
          };
        }
        throw new Error(`Unexpected table ${table}`);
      }),
    });

    const response = await patchTeams(
      request('PATCH', '/api/admin/tournament/tournament-1/teams', {
        teams: [
          { id: 'reds', name: 'Reds' },
          { id: 'blues', name: 'Blues' },
          { id: 'golds', name: 'Golds' },
          { id: 'new-team', name: 'New team' },
        ],
      }),
      { params: Promise.resolve({ id: 'tournament-1' }) },
    );

    await expect(response.json()).resolves.toEqual({
      error: 'Fixtures already exist. You can rename teams, but reset the tournament before adding, removing, or replacing teams.',
    });
    expect(response.status).toBe(409);
  });
});

describe('tournament reset route', () => {
  it('deletes generated matches and returns the tournament to setup after confirmation', async () => {
    const deleteMatches = vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(async () => ({ data: [{ id: 'm1' }, { id: 'm2' }], error: null })),
      })),
    }));
    const updateTournament = vi.fn(() => ({
      eq: vi.fn(async () => ({ error: null })),
    }));

    getSupabaseAdminClientMock.mockReturnValue({
      from: vi.fn((table: string) => {
        if (table === 'tournaments') {
          return {
            select: vi.fn(() =>
              oneEqSingle({
                data: { id: 'tournament-1', status: 'complete' },
                error: null,
              }),
            ),
            update: updateTournament,
          };
        }
        if (table === 'matches') {
          return { delete: deleteMatches };
        }
        throw new Error(`Unexpected table ${table}`);
      }),
    });

    const response = await resetTournament(
      request('POST', '/api/admin/tournament/tournament-1/reset', { confirm: 'RESET_TO_SETUP' }),
      { params: Promise.resolve({ id: 'tournament-1' }) },
    );

    await expect(response.json()).resolves.toEqual({ ok: true, status: 'setup', deletedMatches: 2 });
    expect(response.status).toBe(200);
    expect(deleteMatches).toHaveBeenCalled();
    expect(updateTournament).toHaveBeenCalledWith({ status: 'setup' });
  });
});

describe('tournament delete route', () => {
  it('requires confirmation before deleting a tournament', async () => {
    const response = await deleteTournament(
      request('DELETE', '/api/admin/tournament/tournament-1', { confirm: 'NOPE' }),
      { params: Promise.resolve({ id: 'tournament-1' }) },
    );

    await expect(response.json()).resolves.toEqual({ error: 'Delete confirmation is required.' });
    expect(response.status).toBe(400);
    expect(getSupabaseAdminClientMock).not.toHaveBeenCalled();
  });

  it('deletes matches before deleting the tournament row', async () => {
    const deleteMatches = vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(async () => ({ data: [{ id: 'm1' }, { id: 'm2' }], error: null })),
      })),
    }));
    const deleteTournamentRow = vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(async () => ({ data: { id: 'tournament-1' }, error: null })),
        })),
      })),
    }));

    getSupabaseAdminClientMock.mockReturnValue({
      from: vi.fn((table: string) => {
        if (table === 'tournaments') {
          return {
            select: vi.fn(() =>
              oneEqSingle({
                data: { id: 'tournament-1', name: 'Demo tournament' },
                error: null,
              }),
            ),
            delete: deleteTournamentRow,
          };
        }
        if (table === 'matches') {
          return { delete: deleteMatches };
        }
        throw new Error(`Unexpected table ${table}`);
      }),
    });

    const response = await deleteTournament(
      request('DELETE', '/api/admin/tournament/tournament-1', { confirm: 'DELETE_TOURNAMENT' }),
      { params: Promise.resolve({ id: 'tournament-1' }) },
    );

    await expect(response.json()).resolves.toEqual({
      ok: true,
      deletedTournament: 'Demo tournament',
      deletedMatches: 2,
    });
    expect(response.status).toBe(200);
    expect(deleteMatches).toHaveBeenCalled();
    expect(deleteTournamentRow).toHaveBeenCalled();
  });
});
