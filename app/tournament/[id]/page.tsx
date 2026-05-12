'use client';
import { buildTable } from '@/lib/tournament';
import { pendoTrack } from '@/lib/pendo';

const teams = ['Falcons','Lions','Tigers','Comets'].map((name, i) => ({ id: String(i + 1), tournament_id: 'demo', name }));
const matches = [
  { id: '1', tournament_id: 'demo', stage: 'group', round_number: 1, home_team_id: '1', away_team_id: '2', home_score: 2, away_score: 1, winner_team_id: '1', status: 'complete' },
  { id: '2', tournament_id: 'demo', stage: 'group', round_number: 2, home_team_id: '3', away_team_id: '4', home_score: 0, away_score: 0, winner_team_id: null, status: 'complete' }
] as any;

export default function TournamentPage() {
  const table = buildTable(teams as any, matches);
  const tournamentId = 'demo';
  const tournamentStatus = 'group_stage';

  function handleGenerateQrCode() {
    // TODO: implement QR code generation
    pendoTrack('tournament_qr_code_generated', {
      tournament_id: tournamentId,
      tournament_status: tournamentStatus,
      generated_from_page: 'public_tournament',
    });
  }

  async function handleShareUrl() {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    let shareMethod = 'clipboard';

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'Live Tournament', url });
        shareMethod = 'native_share';
      } catch {
        // User cancelled or share failed, fall back to clipboard
        await navigator.clipboard?.writeText(url);
        shareMethod = 'clipboard';
      }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
    }

    pendoTrack('tournament_url_shared', {
      tournament_id: tournamentId,
      share_method: shareMethod,
      tournament_status: tournamentStatus,
    });
  }

  return <div className="space-y-4"><h1 className="text-2xl font-bold">Live tournament</h1><div className="flex gap-2 mb-2"><button className="btn text-sm" onClick={handleShareUrl}>Share link</button><button className="btn text-sm" onClick={handleGenerateQrCode}>QR code</button></div><div className="card overflow-x-auto"><table className="w-full text-sm"><thead><tr>{['Team','P','W','D','L','GF','GA','GD','Pts'].map((h)=><th key={h} className="px-2 py-1 text-left">{h}</th>)}</tr></thead><tbody>{table.map((r)=><tr key={r.teamId}><td>{r.team}</td><td>{r.played}</td><td>{r.won}</td><td>{r.drawn}</td><td>{r.lost}</td><td>{r.gf}</td><td>{r.ga}</td><td>{r.gd}</td><td className="font-bold">{r.points}</td></tr>)}</tbody></table></div></div>;
}
