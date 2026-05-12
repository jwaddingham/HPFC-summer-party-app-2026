'use client';

/**
 * Knockout Bracket Visualization
 * Shows the knockout stage progression from semis through final.
 * Wire up: Generate bracket from knockout matches, update as winners progress.
 * Status: Scaffold only — bracket layout logic needed (tree visualization).
 */

export function Bracket() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Knockout Stage</h2>
      <div className="card p-6 text-center">
        <p className="text-white/60">Bracket visualization coming soon...</p>
        <p className="mt-2 text-sm">
          This will show semi-finals → final progression as results are entered.
        </p>
      </div>

      {/* Placeholder structure for bracket */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between rounded bg-white/5 p-3">
          <span>Semi-Final 1</span>
          <span className="text-hpfcGold">TBD vs TBD</span>
        </div>
        <div className="flex items-center justify-between rounded bg-white/5 p-3">
          <span>Semi-Final 2</span>
          <span className="text-hpfcGold">TBD vs TBD</span>
        </div>
        <div className="flex items-center justify-between rounded bg-white/5 p-3">
          <span>Final</span>
          <span className="text-hpfcGold">TBD vs TBD</span>
        </div>
        <div className="flex items-center justify-between rounded bg-hpfcRed/20 p-3">
          <span>Winner</span>
          <span className="font-bold text-hpfcGold">TBD</span>
        </div>
      </div>
    </div>
  );
}
