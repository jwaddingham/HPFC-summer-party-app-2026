import React, { useState } from 'react';
import { HPFCBadge } from '../ui/HPFCBadge';
import { Button } from '../ui/Button';
export function Screen6_AdminLogin() {
  const [code, setCode] = useState(['', '', '', '', '']);
  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
  };
  return (
    <div className="min-h-full flex flex-col bg-chalk">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <HPFCBadge className="w-24 h-24 mb-8 drop-shadow-lg" />

        <h1 className="font-display text-4xl tracking-wider text-ink mb-2">
          ORGANISER ACCESS
        </h1>
        <p className="text-gray-600 text-center mb-8 font-medium">
          Enter your 5-digit matchday code to manage tournaments.
        </p>

        <div className="flex gap-2 mb-8 w-full justify-center">
          {code.map((digit, i) =>
          <input
            key={i}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            className="w-14 h-16 text-center font-display text-3xl border-2 border-ink bg-white shadow-hard focus:outline-none focus:border-blood focus:ring-0 transition-colors"
            placeholder="-" />

          )}
        </div>

        <Button fullWidth size="lg" className="mb-6">
          ENTER CONTROL PANEL
        </Button>

        <div className="w-full h-0.5 bg-line my-6 relative">
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-chalk px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
            or
          </span>
        </div>

        <button className="text-sm font-bold text-ink underline decoration-2 underline-offset-4 hover:text-blood transition-colors">
          Spectator? View Live Tournaments
        </button>
      </div>
    </div>);

}