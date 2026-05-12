import React, { useEffect, useState, useRef } from 'react';
import { Button } from '../ui/Button';
import {
  ChevronLeft,
  Plus,
  Minus,
  Play,
  Pause,
  Square,
  Clock } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
type TimerState = 'idle' | 'running' | 'paused' | 'ended';
const STORAGE_KEY = 'hpfc.matchMinutes';
const DEFAULT_MINUTES = 15;
const MIN_MINUTES = 1;
const MAX_MINUTES = 90;
function loadSavedMinutes(): number {
  try {
    const raw =
    typeof window !== 'undefined' ?
    window.localStorage.getItem(STORAGE_KEY) :
    null;
    const n = raw ? parseInt(raw, 10) : NaN;
    if (!isNaN(n) && n >= MIN_MINUTES && n <= MAX_MINUTES) return n;
  } catch {}
  return DEFAULT_MINUTES;
}
export function Screen8_EnterResult() {
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  // Timer state
  const [matchMinutes, setMatchMinutes] = useState<number>(() =>
  loadSavedMinutes()
  );
  const [minutesInput, setMinutesInput] = useState<string>(() =>
  String(loadSavedMinutes())
  );
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [timerState, setTimerState] = useState<TimerState>('idle');
  // Persist matchMinutes whenever it changes
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(matchMinutes));
    } catch {}
  }, [matchMinutes]);
  const commitMinutes = (raw: string) => {
    const n = parseInt(raw, 10);
    if (isNaN(n)) {
      setMinutesInput(String(matchMinutes));
      return;
    }
    const clamped = Math.max(MIN_MINUTES, Math.min(MAX_MINUTES, n));
    setMatchMinutes(clamped);
    setMinutesInput(String(clamped));
  };
  const adjustMinutes = (delta: number) => {
    const next = Math.max(
      MIN_MINUTES,
      Math.min(MAX_MINUTES, matchMinutes + delta)
    );
    setMatchMinutes(next);
    setMinutesInput(String(next));
  };
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalSeconds = matchMinutes * 60;
  const remaining = Math.max(0, totalSeconds - secondsElapsed);
  const mm = Math.floor(remaining / 60).
  toString().
  padStart(2, '0');
  const ss = (remaining % 60).toString().padStart(2, '0');
  const progress =
  totalSeconds > 0 ? Math.min(100, secondsElapsed / totalSeconds * 100) : 0;
  useEffect(() => {
    if (timerState === 'running') {
      intervalRef.current = setInterval(() => {
        setSecondsElapsed((s) => {
          if (s + 1 >= totalSeconds) {
            setTimerState('ended');
            return totalSeconds;
          }
          return s + 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerState, totalSeconds]);
  const handleStart = () => setTimerState('running');
  const handlePause = () => setTimerState('paused');
  const handleEnd = () => {
    setTimerState('ended');
    if (intervalRef.current) clearInterval(intervalRef.current);
  };
  const handleReset = () => {
    setSecondsElapsed(0);
    setTimerState('idle');
  };
  const isLockedDuration = timerState !== 'idle';
  return (
    <div className="min-h-full flex flex-col bg-chalk">
      {/* Header */}
      <div className="bg-ink text-white pt-12 pb-4 px-4">
        <button className="flex items-center text-gray-400 hover:text-white mb-3 transition-colors">
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span className="text-sm font-bold uppercase tracking-wider">
            Cancel
          </span>
        </button>
        <h1 className="font-display text-3xl tracking-wider leading-none mb-1">
          ENTER SCORE
        </h1>
        <p className="text-sm text-gray-400">Under 9s Cup</p>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-4">
        {/* MATCH TIMER */}
        <div className="bg-ink text-white border-2 border-ink shadow-hard p-4 relative overflow-hidden">
          {/* Progress bar */}
          <div
            className="absolute bottom-0 left-0 h-1 bg-blood transition-all duration-1000 ease-linear"
            style={{
              width: `${progress}%`
            }} />
          

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gold" />
              <span className="font-bold text-xs uppercase tracking-widest text-gray-400">
                Match Timer
              </span>
            </div>
            <AnimatePresence>
              {timerState === 'running' &&
              <motion.div
                initial={{
                  opacity: 0
                }}
                animate={{
                  opacity: 1
                }}
                exit={{
                  opacity: 0
                }}
                className="flex items-center gap-1.5">
                
                  <span className="w-2 h-2 rounded-full bg-blood animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-widest text-blood">
                    Live
                  </span>
                </motion.div>
              }
              {timerState === 'paused' &&
              <span className="text-xs font-bold uppercase tracking-widest text-gold">
                  Paused
                </span>
              }
              {timerState === 'ended' &&
              <span className="text-xs font-bold uppercase tracking-widest text-gold">
                  Full Time
                </span>
              }
            </AnimatePresence>
          </div>

          {/* Time display */}
          <div className="flex items-baseline justify-center gap-1 mb-4">
            <span className="font-display text-6xl leading-none tabular-nums">
              {mm}
            </span>
            <span className="font-display text-6xl leading-none text-gray-600">
              :
            </span>
            <span className="font-display text-6xl leading-none tabular-nums">
              {ss}
            </span>
          </div>

          {/* Duration selector (only when idle) */}
          {!isLockedDuration &&
          <div className="mb-3">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                Match Length
              </div>

              {/* Custom number stepper */}
              <div className="flex items-stretch gap-2 mb-2">
                <button
                onClick={() => adjustMinutes(-1)}
                aria-label="Decrease match length"
                className="w-12 bg-transparent text-white border-2 border-gray-600 hover:border-gray-300 active:translate-y-px flex items-center justify-center">
                
                  <Minus className="w-5 h-5" />
                </button>

                <div className="flex-1 flex items-baseline justify-center gap-2 bg-black/40 border-2 border-gray-600 px-3">
                  <input
                  type="number"
                  inputMode="numeric"
                  min={MIN_MINUTES}
                  max={MAX_MINUTES}
                  value={minutesInput}
                  onChange={(e) => setMinutesInput(e.target.value)}
                  onBlur={(e) => commitMinutes(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      commitMinutes((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  className="font-display text-3xl text-white bg-transparent text-right tabular-nums w-16 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                
                  <span className="font-bold text-xs uppercase tracking-widest text-gray-400">
                    min
                  </span>
                </div>

                <button
                onClick={() => adjustMinutes(1)}
                aria-label="Increase match length"
                className="w-12 bg-transparent text-white border-2 border-gray-600 hover:border-gray-300 active:translate-y-px flex items-center justify-center">
                
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Quick presets */}
              <div className="flex gap-1.5">
                {[5, 10, 15, 20, 25].map((m) =>
              <button
                key={m}
                onClick={() => {
                  setMatchMinutes(m);
                  setMinutesInput(String(m));
                }}
                className={`flex-1 h-8 font-display text-sm border transition-all ${matchMinutes === m ? 'bg-blood text-white border-blood' : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500'}`}>
                
                    {m}m
                  </button>
              )}
              </div>
            </div>
          }

          {/* Timer controls */}
          <div className="flex gap-2">
            {timerState === 'idle' &&
            <button
              onClick={handleStart}
              className="flex-1 h-12 bg-blood text-white font-display tracking-wider text-lg flex items-center justify-center gap-2 border-2 border-blood active:translate-y-px">
              
                <Play className="w-5 h-5 fill-white" /> START GAME
              </button>
            }
            {timerState === 'running' &&
            <>
                <button
                onClick={handlePause}
                className="flex-1 h-12 bg-blood text-white font-display tracking-wider text-lg flex items-center justify-center gap-2 border-2 border-blood active:translate-y-px">
                
                  <Pause className="w-5 h-5 fill-white" /> PAUSE
                </button>
                <button
                onClick={handleEnd}
                className="h-12 px-4 bg-transparent text-white font-display tracking-wider text-lg flex items-center justify-center gap-2 border-2 border-white active:translate-y-px">
                
                  <Square className="w-4 h-4 fill-white" /> END
                </button>
              </>
            }
            {timerState === 'paused' &&
            <>
                <button
                onClick={handleStart}
                className="flex-1 h-12 bg-blood text-white font-display tracking-wider text-lg flex items-center justify-center gap-2 border-2 border-blood active:translate-y-px">
                
                  <Play className="w-5 h-5 fill-white" /> RESUME
                </button>
                <button
                onClick={handleEnd}
                className="h-12 px-4 bg-transparent text-white font-display tracking-wider text-lg flex items-center justify-center gap-2 border-2 border-white active:translate-y-px">
                
                  <Square className="w-4 h-4 fill-white" /> END
                </button>
              </>
            }
            {timerState === 'ended' &&
            <button
              onClick={handleReset}
              className="flex-1 h-12 bg-transparent text-white font-display tracking-wider text-lg flex items-center justify-center gap-2 border-2 border-white active:translate-y-px">
              
                RESET TIMER
              </button>
            }
          </div>
        </div>

        {/* Score Controls */}
        <div className="flex-1 flex flex-col justify-center gap-4">
          {/* Home Team */}
          <div className="bg-white border-2 border-ink shadow-hard p-5 flex flex-col items-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-sky"></div>
            <h2 className="font-bold text-xl mb-3 text-center">Park Rangers</h2>

            <div className="flex items-center justify-center gap-6 w-full">
              <Button
                variant="icon"
                className="w-14 h-14 !bg-blood !border-blood text-white"
                onClick={() => setHomeScore(Math.max(0, homeScore - 1))}>
                
                <Minus className="w-7 h-7" />
              </Button>

              <motion.div
                key={homeScore}
                initial={{
                  scale: 1.2
                }}
                animate={{
                  scale: 1
                }}
                className="font-display text-[80px] leading-none w-20 text-center text-ink tabular-nums">
                
                {homeScore}
              </motion.div>

              <Button
                variant="icon"
                className="w-14 h-14 !bg-blood !border-blood text-white"
                onClick={() => setHomeScore(homeScore + 1)}>
                
                <Plus className="w-7 h-7" />
              </Button>
            </div>
          </div>

          {/* VS Divider */}
          <div className="flex items-center justify-center relative">
            <div className="absolute w-full h-0.5 bg-line left-0"></div>
            <div className="font-display text-xl text-gray-400 bg-chalk px-4 z-10">
              VS
            </div>
          </div>

          {/* Away Team */}
          <div className="bg-white border-2 border-ink shadow-hard p-5 flex flex-col items-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-blood"></div>
            <h2 className="font-bold text-xl mb-3 text-center">
              Cowley Comets
            </h2>

            <div className="flex items-center justify-center gap-6 w-full">
              <Button
                variant="icon"
                className="w-14 h-14 !bg-blood !border-blood text-white"
                onClick={() => setAwayScore(Math.max(0, awayScore - 1))}>
                
                <Minus className="w-7 h-7" />
              </Button>

              <motion.div
                key={awayScore}
                initial={{
                  scale: 1.2
                }}
                animate={{
                  scale: 1
                }}
                className="font-display text-[80px] leading-none w-20 text-center text-ink tabular-nums">
                
                {awayScore}
              </motion.div>

              <Button
                variant="icon"
                className="w-14 h-14 !bg-blood !border-blood text-white"
                onClick={() => setAwayScore(awayScore + 1)}>
                
                <Plus className="w-7 h-7" />
              </Button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto pt-2 space-y-2">
          <Button fullWidth size="lg">
            END GAME
          </Button>
          <Button fullWidth variant="ghost">
            Reset to 0-0
          </Button>
        </div>
      </div>
    </div>);

}