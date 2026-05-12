import React from 'react';
import { motion } from 'framer-motion';
interface TabBarProps {
  tabs: string[];
  activeTab: string;
  onChange: (tab: string) => void;
}
export function TabBar({ tabs, activeTab, onChange }: TabBarProps) {
  return (
    <div className="flex w-full border-b-2 border-ink bg-chalk sticky top-0 z-10">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={`flex-1 py-3 text-center font-display tracking-wider text-lg relative transition-colors ${isActive ? 'text-ink' : 'text-gray-400 hover:text-gray-600'}`}>
            
            {tab}
            {isActive &&
            <motion.div
              layoutId="activeTabIndicator"
              className="absolute bottom-0 left-0 right-0 h-1 bg-blood"
              initial={false}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 30
              }} />

            }
          </button>);

      })}
    </div>);

}