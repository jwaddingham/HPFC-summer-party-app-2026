import React from 'react';
interface ScreenSwitcherProps {
  screens: {
    id: string;
    name: string;
  }[];
  activeScreen: string;
  onChange: (id: string) => void;
}
export function ScreenSwitcher({
  screens,
  activeScreen,
  onChange
}: ScreenSwitcherProps) {
  return (
    <div className="fixed top-0 left-0 right-0 bg-ink text-white z-[100] shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-1">
          <span className="font-display text-gold whitespace-nowrap text-xl tracking-wider mr-2">
            HPFC DEMO
          </span>
          {screens.map((screen) =>
          <button
            key={screen.id}
            onClick={() => onChange(screen.id)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${activeScreen === screen.id ? 'bg-blood text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
            
              {screen.name}
            </button>
          )}
        </div>
      </div>
    </div>);

}