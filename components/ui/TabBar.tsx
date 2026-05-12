export function TabBar({
  tabs,
  activeTab,
  onChange
}: {
  tabs: string[];
  activeTab: string;
  onChange: (tab: string) => void;
}) {
  return (
    <div className="sticky top-0 z-10 bg-white border-b-2 border-ink flex overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`flex-1 min-w-fit px-4 py-3 font-display text-sm tracking-wide uppercase transition-colors border-b-4 ${
            activeTab === tab
              ? 'border-b-blood text-ink bg-white'
              : 'border-b-chalk text-gray-500 hover:text-ink'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
