import React from 'react';
import { Button } from '../ui/Button';
import { ChevronLeft, Copy, Share } from 'lucide-react';
export function Screen11_QR() {
  return (
    <div className="min-h-full flex flex-col bg-chalk relative overflow-hidden">
      {/* Header */}
      <div className="bg-ink text-white pt-12 pb-4 px-4 relative z-10">
        <button className="flex items-center text-gray-400 hover:text-white mb-3 transition-colors">
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span className="text-sm font-bold uppercase tracking-wider">
            Back
          </span>
        </button>
        <h1 className="font-display text-3xl tracking-wider leading-none mb-1">
          SHARE TOURNAMENT
        </h1>
      </div>

      <div className="flex-1 p-6 flex flex-col items-center justify-center relative z-10">
        {/* The "Poster" */}
        <div className="bg-white border-2 border-ink shadow-hard p-8 w-full max-w-sm flex flex-col items-center transform -rotate-1 relative">
          {/* Fake Pins */}
          <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-red-500 shadow-sm"></div>
          <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-red-500 shadow-sm"></div>

          <h2 className="font-display text-3xl text-center leading-none mb-2">
            UNDER 9s CUP
          </h2>
          <p className="font-hand text-blood text-xl mb-8 transform -rotate-2">
            Follow Live!
          </p>

          {/* Fake QR Code SVG */}
          <div className="w-48 h-48 bg-white border-4 border-ink p-2 mb-6">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              fill="var(--ink)">
              
              <rect x="0" y="0" width="30" height="30" />
              <rect x="5" y="5" width="20" height="20" fill="white" />
              <rect x="10" y="10" width="10" height="10" />

              <rect x="70" y="0" width="30" height="30" />
              <rect x="75" y="5" width="20" height="20" fill="white" />
              <rect x="80" y="10" width="10" height="10" />

              <rect x="0" y="70" width="30" height="30" />
              <rect x="5" y="75" width="20" height="20" fill="white" />
              <rect x="10" y="80" width="10" height="10" />

              {/* Random blocks for middle */}
              <rect x="40" y="10" width="20" height="10" />
              <rect x="40" y="30" width="10" height="20" />
              <rect x="60" y="40" width="30" height="10" />
              <rect x="10" y="40" width="20" height="20" />
              <rect x="40" y="60" width="20" height="30" />
              <rect x="70" y="60" width="10" height="10" />
              <rect x="80" y="80" width="20" height="20" />
              <rect x="40" y="40" width="10" height="10" />
            </svg>
          </div>

          <p className="text-center font-bold text-sm uppercase tracking-wider text-gray-600 mb-6">
            Scan to view fixtures,
            <br />
            results & tables on your phone
          </p>

          <div className="w-full bg-chalk border-2 border-ink p-3 flex items-center justify-between">
            <span className="font-mono text-sm font-bold truncate mr-2">
              hpfc.live/u9s
            </span>
            <button className="text-blood hover:text-red-700 p-1">
              <Copy className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="mt-8 w-full max-w-sm">
          <Button fullWidth variant="secondary" className="gap-2">
            <Share className="w-5 h-5" />
            SHARE LINK
          </Button>
        </div>
      </div>
    </div>);

}