'use client';
import { useParams } from 'next/navigation';
import { pendoTrack } from '@/lib/pendo';

export default function AdminTournamentPage() {
  const params = useParams();
  const tournamentId = params.id as string;

  async function handleSaveResult() {
    // TODO: implement score save API call
    try {
      // TODO: replace with actual API call and response
      const matchId = '';
      const matchStage = 'group';
      const homeScore = 0;
      const awayScore = 0;
      const roundNumber = 1;

      pendoTrack('score_submitted', {
        tournament_id: tournamentId,
        match_id: matchId,
        match_stage: matchStage,
        home_score: homeScore,
        away_score: awayScore,
        is_draw: homeScore === awayScore,
        round_number: roundNumber,
      });
    } catch (error) {
      pendoTrack('score_save_failed', {
        tournament_id: tournamentId,
        match_id: '',
        failure_reason: error instanceof Error ? error.message : 'unknown',
        is_queued_for_retry: false,
        network_status: typeof navigator !== 'undefined' ? (navigator.onLine ? 'online' : 'offline') : 'unknown',
      });
    }
  }

  function handleEditScore() {
    // TODO: implement score edit flow
    pendoTrack('score_edited', {
      tournament_id: tournamentId,
      match_id: '',
      match_stage: 'group',
      previous_home_score: 0,
      previous_away_score: 0,
      new_home_score: 0,
      new_away_score: 0,
    });
  }

  function handleCancelMatch() {
    // TODO: implement match cancellation API call
    pendoTrack('match_cancelled', {
      tournament_id: tournamentId,
      match_id: '',
      match_stage: 'group',
      previous_status: 'scheduled',
      had_scores: false,
    });
  }

  function handleResetTournament() {
    // TODO: implement tournament reset API call
    pendoTrack('tournament_reset', {
      tournament_id: tournamentId,
      previous_status: 'group_stage',
      deleted_fixtures_count: 0,
      deleted_scores_count: 0,
    });
  }

  function handleBulkDeleteFixtures() {
    // TODO: implement bulk fixture deletion API call
    pendoTrack('fixtures_bulk_deleted', {
      tournament_id: tournamentId,
      stage: 'group',
      deleted_count: 0,
    });
  }

  function handleManualAdvanceTeam() {
    // TODO: implement manual team advance API call
    pendoTrack('team_manually_advanced', {
      tournament_id: tournamentId,
      team_id: '',
      from_stage: 'group',
      to_stage: 'semi_final',
      reason: '',
    });
  }

  function handleReorderKnockoutSeeds() {
    // TODO: implement knockout seed reorder API call
    pendoTrack('knockout_seeds_reordered', {
      tournament_id: tournamentId,
      knockout_mode: 'top4',
      seeds_changed_count: 0,
      team_count: 0,
    });
  }

  function handleGenerateGroupFixtures() {
    // TODO: implement group fixture generation API call using generateRoundRobin
    pendoTrack('group_fixtures_generated', {
      tournament_id: tournamentId,
      team_count: 0,
      fixture_count: 0,
      round_count: 0,
    });
  }

  function handleGenerateKnockoutBracket() {
    // TODO: implement knockout bracket generation API call
    pendoTrack('knockout_bracket_generated', {
      tournament_id: tournamentId,
      knockout_mode: 'top4',
      team_count: 0,
      fixture_count: 0,
      seeds_modified: false,
    });
  }

  function handleSelectDrawWinner() {
    // TODO: implement draw winner selection API call
    pendoTrack('knockout_draw_winner_selected', {
      tournament_id: tournamentId,
      match_id: '',
      match_stage: 'semi_final',
      home_score: 0,
      away_score: 0,
      winner_team_id: '',
      resolution_method: 'admin_decision',
    });
  }

  function handleStatusChange(previousStatus: string, newStatus: string) {
    // TODO: implement tournament status change API call
    pendoTrack('tournament_status_changed', {
      tournament_id: tournamentId,
      previous_status: previousStatus,
      new_status: newStatus,
      team_count: 0,
      completed_matches_count: 0,
      total_matches_count: 0,
    });

    if (newStatus === 'complete') {
      pendoTrack('tournament_completed', {
        tournament_id: tournamentId,
        winner_team_id: '',
        winner_team_name: '',
        team_count: 0,
        total_matches_played: 0,
        knockout_mode: 'top4',
        tournament_duration_minutes: 0,
      });
    }
  }

  function handleOfflineQueueSynced(syncedCount: number, failedCount: number, timeInQueueSeconds: number) {
    pendoTrack('offline_queue_synced', {
      tournament_id: tournamentId,
      synced_count: syncedCount,
      failed_count: failedCount,
      time_in_queue_seconds: timeInQueueSeconds,
    });
  }

  return <div className="space-y-4"><h1 className="text-2xl font-bold">Tournament control</h1><div className="card"><h2 className="font-semibold">Fast score entry</h2><div className="mt-2 grid grid-cols-2 gap-2"><input className="input" defaultValue="Falcons" readOnly /><input className="input" defaultValue="Lions" readOnly /><input className="input" inputMode="numeric" placeholder="0" /><input className="input" inputMode="numeric" placeholder="0" /></div><button className="btn mt-3 w-full" onClick={handleSaveResult}>Save result</button></div><div className="card"><h2 className="font-semibold">Manual override tools</h2><ul className="list-disc pl-5 text-sm text-white/90"><li><button className="underline" onClick={handleBulkDeleteFixtures}>Edit/delete/reset fixtures</button></li><li><button className="underline" onClick={handleCancelMatch}>Skip/cancel/replay match</button></li><li><button className="underline" onClick={handleManualAdvanceTeam}>Manual advance team</button></li><li><button className="underline" onClick={handleReorderKnockoutSeeds}>Reorder knockout seeds</button></li></ul></div></div>;
}
