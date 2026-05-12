import React from 'react';
import { Button } from '../ui/Button';
import { Bracket } from '../ui/Bracket';
import { Trophy, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
export function Screen12_Winner() {
  return (
    <div className="min-h-full pb-8 bg-chalk relative overflow-hidden">
      {/* Confetti Background (CSS/Framer simplified) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(20)].map((_, i) =>
        <motion.div
          key={i}
          className={`absolute w-3 h-3 ${i % 2 === 0 ? 'bg-gold' : 'bg-blood'}`}
          initial={{
            top: '-10%',
            left: `${Math.random() * 100}%`,
            rotate: 0,
            opacity: 1
          }}
          animate={{
            top: '110%',
            rotate: 360,
            opacity: 0
          }}
          transition={{
            duration: 2 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'linear'
          }} />

        )}
      </div>

      {/* Header */}
      <div className="bg-transparent pt-12 pb-4 px-4 relative z-20">
        <button className="flex items-center text-ink hover:text-blood mb-3 transition-colors">
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span className="text-sm font-bold uppercase tracking-wider">
            All Events
          </span>
        </button>
      </div>

      <div className="p-4 relative z-10 flex flex-col items-center">
        {/* Hero Celebration */}
        <div className="w-full bg-ink text-white border-4 border-gold shadow-[8px_8px_0px_0px_var(--gold)] p-8 flex flex-col items-center text-center mb-8 transform -rotate-1">
          <motion.div
            initial={{
              scale: 0
            }}
            animate={{
              scale: 1
            }}
            transition={{
              type: 'spring',
              bounce: 0.5
            }}
            className="w-20 h-20 bg-gold rounded-full flex items-center justify-center mb-4">
            
            <Trophy className="w-10 h-10 text-ink" />
          </motion.div>

          <h2 className="font-display text-2xl text-gold tracking-widest mb-2">
            CHAMPIONS
          </h2>
          <h1 className="font-display text-5xl leading-none mb-4">
            SOUTH OXFORD STRIKERS
          </h1>

          <div className="bg-white/10 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider">
            Adults 5-a-side • 2026
          </div>
        </div>

        {/* Stats Summary */}
        <div className="w-full grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white border-2 border-ink p-3 text-center shadow-hard-sm">
            <div className="font-display text-3xl text-blood">12</div>
            <div className="text-[10px] font-bold uppercase text-gray-500">
              Teams
            </div>
          </div>
          <div className="bg-white border-2 border-ink p-3 text-center shadow-hard-sm">
            <div className="font-display text-3xl text-blood">26</div>
            <div className="text-[10px] font-bold uppercase text-gray-500">
              Matches
            </div>
          </div>
          <div className="bg-white border-2 border-ink p-3 text-center shadow-hard-sm">
            <div className="font-display text-3xl text-blood">84</div>
            <div className="text-[10px] font-bold uppercase text-gray-500">
              Goals
            </div>
          </div>
        </div>

        {/* Bracket Summary */}
        <div className="w-full bg-white border-2 border-ink p-4 shadow-hard">
          <h3 className="font-display text-xl text-ink tracking-wide mb-4 text-center">
            FINAL BRACKET
          </h3>
          <div className="opacity-80 pointer-events-none scale-90 origin-top">
            <Bracket />
          </div>
        </div>
      </div>
    </div>);

}