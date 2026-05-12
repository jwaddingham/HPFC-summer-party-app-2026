import React from 'react';
import { Button } from '../ui/Button';
import { StatusPill } from '../ui/StatusPill';
import { ChevronRight, Plus, Edit3, Trophy, Users, QrCode } from 'lucide-react';
export function Screen7_AdminDash() {
  return (
    <div className="min-h-full pb-8 bg-chalk">
      {/* Header */}
      <div className="bg-ink text-white pt-12 pb-6 px-4">
        <div className="flex justify-between items-center mb-1">
          <h1 className="font-display text-3xl tracking-wider">
            MATCHDAY CONTROL
          </h1>
          <div className="w-8 h-8 rounded-full bg-blood flex items-center justify-center font-bold text-sm">
            HP
          </div>
        </div>
        <p className="text-sm text-gray-400">Logged in as Organiser</p>
      </div>

      <div className="p-4 space-y-6">
        {/* Featured Action: Next Match */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-ink tracking-wide">
              NEXT MATCH
            </h2>
            <StatusPill status="upcoming" />
          </div>

          <div className="bg-ink text-white border-2 border-ink shadow-hard p-4">
            <div className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-3">
              Under 9s Cup
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="text-xl font-bold w-2/5 truncate">
                Park Rangers
              </div>
              <div className="font-display text-2xl text-gray-500">VS</div>
              <div className="text-xl font-bold w-2/5 text-right truncate">
                Cowley Comets
              </div>
            </div>

            <div className="flex gap-3">
              <Button fullWidth variant="primary" className="text-sm">
                ENTER SCORE
              </Button>
              <Button variant="secondary" className="px-4">
                <Edit3 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Active Tournaments */}
        <div className="space-y-3">
          <h2 className="font-display text-xl text-ink tracking-wide">
            ACTIVE TOURNAMENTS
          </h2>

          <div className="bg-white border-2 border-ink p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 active:translate-y-px">
            <div>
              <h3 className="font-bold text-lg leading-none mb-1">
                Under 9s Cup
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                Group Stage • 8 Teams
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>

          <div className="bg-white border-2 border-ink p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 active:translate-y-px">
            <div>
              <h3 className="font-bold text-lg leading-none mb-1">
                Adults 5-a-side
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                Semi-Finals • 12 Teams
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="space-y-3">
          <h2 className="font-display text-xl text-ink tracking-wide">
            QUICK ACTIONS
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <button className="bg-white border-2 border-ink shadow-hard-sm p-4 flex flex-col items-center justify-center gap-2 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all">
              <Plus className="w-8 h-8 text-blood" />
              <span className="font-bold text-sm uppercase tracking-wider">
                New Tourney
              </span>
            </button>

            <button className="bg-white border-2 border-ink shadow-hard-sm p-4 flex flex-col items-center justify-center gap-2 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all">
              <Trophy className="w-8 h-8 text-gold" />
              <span className="font-bold text-sm uppercase tracking-wider">
                Gen Knockout
              </span>
            </button>

            <button className="bg-white border-2 border-ink shadow-hard-sm p-4 flex flex-col items-center justify-center gap-2 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all">
              <Users className="w-8 h-8 text-sky" />
              <span className="font-bold text-sm uppercase tracking-wider">
                Manage Teams
              </span>
            </button>

            <button className="bg-white border-2 border-ink shadow-hard-sm p-4 flex flex-col items-center justify-center gap-2 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all">
              <QrCode className="w-8 h-8 text-ink" />
              <span className="font-bold text-sm uppercase tracking-wider">
                Share QR
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>);

}