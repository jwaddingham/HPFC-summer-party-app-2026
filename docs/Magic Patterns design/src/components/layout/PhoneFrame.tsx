import React from 'react';
export function PhoneFrame({ children }: {children: React.ReactNode;}) {
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-900 p-4 sm:p-8">
      {/* Phone Hardware Wrapper */}
      <div className="relative w-full max-w-[390px] h-[844px] bg-black rounded-[50px] shadow-2xl overflow-hidden border-[8px] border-gray-800 ring-1 ring-gray-700/50 flex flex-col">
        {/* Dynamic Island / Notch fake */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[30px] bg-black rounded-b-[20px] z-50"></div>

        {/* Screen Content Area */}
        <div className="flex-1 bg-noise bg-chalk overflow-y-auto overflow-x-hidden no-scrollbar relative">
          {children}
        </div>

        {/* Home Indicator fake */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[120px] h-[4px] bg-black/20 rounded-full z-50 pointer-events-none"></div>
      </div>
    </div>);

}