import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { getSupabasePublicClient } from '@/lib/supabase/server';
import { buildTable } from '@/lib/tournament';
import type { Match, Team } from '@/lib/types';
import { AdminToolsPanel } from './admin-tools-panel';
import { FixturePanel } from './fixture-panel';
import { KnockoutPanel, type KnockoutMatchRow } from './knockout-panel';
import { ManageTeams } from './manage-teams';

export const dynamic = 'force-dynamic';

export default async function AdminTournamentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-chalk p-4">
          <div className="bg-white border-2 border-ink p-4 text-sm text-gray-700">
            Supabase environment variables are missing.
          </div>
        </div>
      </AdminGuard>
    );
  }
  const supabase = getSupabasePublicClient();

  const [{ data: tournament }, { data: teams }, { data: matches }] = await Promise.all([
    supabase.from('tournaments').select('id, name, status, knockout_mode').eq('id', id).single(),
    supabase.from('teams').select('id, tournament_id, name').eq('tournament_id', id).order('name', { ascending: true }),
    supabase
      .from('matches')
      .select('id, tournament_id, stage, round_number, home_team_id, away_team_id, home_score, away_score, winner_team_id, status')
      .eq('tournament_id', id)
      .order('round_number', { ascending: true }),
  ]);

  if (!tournament) notFound();

  const teamList = (teams ?? []) as Team[];
  const allMatches = (matches ?? []) as Match[];
  const groupMatches = allMatches.filter((match) => match.stage === 'group');
  const knockoutMatches = allMatches.filter((match) => match.stage !== 'group') as KnockoutMatchRow[];

  const locked = allMatches.length > 0;
  const groupComplete = groupMatches.length > 0 && groupMatches.every((match) => match.status !== 'scheduled');
  // Default seeding follows the group table; the panel lets organisers reorder.
  const seedOrder = buildTable(teamList, groupMatches).map((row) => ({ id: row.teamId, name: row.team }));

  return (
    <AdminGuard>
      <div className="min-h-screen bg-chalk">
      {/* Header */}
      <div className="bg-ink text-white pt-12 pb-8 px-4">
        <Link href="/admin/tournaments" className="flex items-center text-gray-400 hover:text-white mb-3 transition-colors">
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span className="text-sm font-bold uppercase tracking-wider">Back</span>
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="font-display text-3xl tracking-wider mb-1">
              {tournament.name}
            </h1>
            <p className="text-sm text-gray-400">Manage teams and fixtures</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Manage Teams */}
        <ManageTeams tournamentId={id} initialTeams={teams ?? []} locked={locked} />

        {/* Fast score entry */}
        <FixturePanel tournamentId={id} teams={teamList} initialMatches={groupMatches} />

        {/* Knockout stage */}
        <KnockoutPanel
          tournamentId={id}
          status={tournament.status}
          knockoutMode={tournament.knockout_mode}
          teamCount={teamList.length}
          groupComplete={groupComplete}
          seedOrder={seedOrder}
          initialKnockoutMatches={knockoutMatches}
        />

        {/* Reset and rehearsal utilities */}
        <AdminToolsPanel tournamentId={id} status={tournament.status} matchCount={allMatches.length} />
      </div>
      </div>
    </AdminGuard>
  );
}
