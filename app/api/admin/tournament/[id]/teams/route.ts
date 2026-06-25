import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { getSupabaseAdminClient } from '@/lib/supabase/server';
import { validateMutableTeamCount, validateTeamNames } from '@/lib/team-validation';

async function hasFixtures(tournamentId: string) {
  const supabase = getSupabaseAdminClient();
  const { count, error } = await supabase
    .from('matches')
    .select('id', { count: 'exact', head: true })
    .eq('tournament_id', tournamentId);

  if (error) throw new Error(error.message);
  return (count ?? 0) > 0;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    if (await hasFixtures(id)) {
      return NextResponse.json({ error: 'Team changes are locked once fixtures exist.' }, { status: 409 });
    }

    const { name } = await req.json();
    const normalizedNames = validateTeamNames([String(name ?? '')]);

    const supabase = getSupabaseAdminClient();
    const { data: teams, error: existingError } = await supabase.from('teams').select('name').eq('tournament_id', id);
    if (existingError) return NextResponse.json({ error: existingError.message }, { status: 500 });

    const currentCount = teams?.length ?? 0;
    validateMutableTeamCount(currentCount + 1);
    validateTeamNames([...(teams ?? []).map((t) => t.name), normalizedNames[0]]);

    const { error } = await supabase.from('teams').insert({ tournament_id: id, name: normalizedNames[0] });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const fixturesExist = await hasFixtures(id);

    const { teams } = await req.json();
    if (!Array.isArray(teams)) return NextResponse.json({ error: 'Teams are required.' }, { status: 400 });

    const ids = teams.map((team) => String(team.id ?? ''));
    const names = teams.map((team) => String(team.name ?? ''));
    validateMutableTeamCount(ids.length);
    if (new Set(ids).size !== ids.length) {
      return NextResponse.json({ error: 'Duplicate team IDs are not allowed.' }, { status: 400 });
    }
    const normalizedNames = validateTeamNames(names, ids.length);

    const supabase = getSupabaseAdminClient();
    const { data: existing, error: loadError } = await supabase.from('teams').select('id').eq('tournament_id', id);
    if (loadError) return NextResponse.json({ error: loadError.message }, { status: 500 });

    const existingIds = new Set((existing ?? []).map((team) => team.id));
    const hasUnknownTeam = ids.some((teamId) => !existingIds.has(teamId));
    const hasStructuralChange = ids.length !== existingIds.size || hasUnknownTeam;

    if (fixturesExist && hasStructuralChange) {
      return NextResponse.json(
        { error: 'Fixtures already exist. You can rename teams, but reset the tournament before adding, removing, or replacing teams.' },
        { status: 409 },
      );
    }

    if (hasUnknownTeam) {
      return NextResponse.json({ error: 'Unknown team ID provided.' }, { status: 400 });
    }
    if (ids.length !== existingIds.size) {
      return NextResponse.json({ error: 'Every existing team must be included.' }, { status: 400 });
    }

    for (let index = 0; index < ids.length; index += 1) {
      const { error } = await supabase
        .from('teams')
        .update({ name: normalizedNames[index] })
        .eq('id', ids[index])
        .eq('tournament_id', id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
