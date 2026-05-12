export function Bracket() {
  return (
    <div className="space-y-4">
      {/* Semis */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="border-2 border-ink bg-white p-4 shadow-hard">
          <div className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">
            Semi-Final 1
          </div>
          <div className="space-y-2">
            <div className="bg-chalk p-2 border border-ink text-sm font-bold">Team A</div>
            <div className="text-center font-bold text-gray-500">vs</div>
            <div className="bg-chalk p-2 border border-ink text-sm font-bold">Team B</div>
          </div>
        </div>
        <div className="border-2 border-ink bg-white p-4 shadow-hard">
          <div className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">
            Semi-Final 2
          </div>
          <div className="space-y-2">
            <div className="bg-chalk p-2 border border-ink text-sm font-bold">Team C</div>
            <div className="text-center font-bold text-gray-500">vs</div>
            <div className="bg-chalk p-2 border border-ink text-sm font-bold">Team D</div>
          </div>
        </div>
      </div>

      {/* Final */}
      <div className="border-4 border-blood bg-white p-6 shadow-hard-blood text-center">
        <div className="text-xs font-bold uppercase tracking-widest text-blood mb-3">Final</div>
        <div className="font-display text-2xl text-ink mb-4">Winner A</div>
        <div className="text-lg font-bold text-blood">VS</div>
        <div className="font-display text-2xl text-ink mt-4">Winner B</div>
      </div>
    </div>
  );
}
