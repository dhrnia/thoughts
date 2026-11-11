import React from 'react';
import { BookOpen, Lock, Bookmark, Plus, SlidersHorizontal } from 'lucide-react';
import type { FilterTab } from '../types';

interface MobileBottomNavProps {
  currentTab: FilterTab;
  onSelectTab: (tab: FilterTab) => void;
  onNewEntry: () => void;
  onOpenSettings: () => void;
  vaultCount: number;
  savedCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  onNewEntry,
  onOpenSettings,
  vaultCount,
  savedCount,
}) => {
  return (
    <nav 
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-md border-t border-[#E8E4DA]/80 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1.5 px-3 flex items-center justify-around shadow-elevation lg:hidden select-none"
    >
      {/* 1. All Entries */}
      <button
        onClick={() => onSelectTab('all')}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all active:scale-95 min-w-[56px] min-h-[44px] ${
          currentTab === 'all'
            ? 'text-[#233831] font-semibold'
            : 'text-[#8C857B] hover:text-[#2B2824]'
        }`}
        aria-label="All Entries"
      >
        <BookOpen className="w-4 h-4 mb-0.5" />
        <span className="text-[10px] font-sans tracking-tight">All</span>
      </button>

      {/* 2. Vault */}
      <button
        onClick={() => onSelectTab('vault')}
        className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all active:scale-95 min-w-[56px] min-h-[44px] ${
          currentTab === 'vault'
            ? 'text-[#233831] font-semibold'
            : 'text-[#8C857B] hover:text-[#2B2824]'
        }`}
        aria-label="Private Vault"
      >
        <div className="relative">
          <Lock className="w-4 h-4 mb-0.5" />
          {vaultCount > 0 && (
            <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-[#233831] text-[9px] text-white flex items-center justify-center font-mono">
              {vaultCount > 9 ? '9+' : vaultCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-sans tracking-tight">Vault</span>
      </button>

      {/* 3. Center Elevated New Thought Action Button */}
      <button
        onClick={onNewEntry}
        className="w-11 h-11 -mt-4 rounded-full bg-[#233831] hover:bg-[#1A2B25] active:scale-90 text-white flex items-center justify-center shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#233831]/30"
        title="New Thought"
        aria-label="Create New Thought"
      >
        <Plus className="w-5 h-5 text-white" />
      </button>

      {/* 4. Saved */}
      <button
        onClick={() => onSelectTab('saved')}
        className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all active:scale-95 min-w-[56px] min-h-[44px] ${
          currentTab === 'saved'
            ? 'text-[#233831] font-semibold'
            : 'text-[#8C857B] hover:text-[#2B2824]'
        }`}
        aria-label="Saved Bookmarks"
      >
        <div className="relative">
          <Bookmark className="w-4 h-4 mb-0.5" />
          {savedCount > 0 && (
            <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-[#EAE6DC] text-[9px] text-[#2B2824] flex items-center justify-center font-mono">
              {savedCount > 9 ? '9+' : savedCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-sans tracking-tight">Saved</span>
      </button>

      {/* 5. Settings */}
      <button
        onClick={onOpenSettings}
        className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[#8C857B] hover:text-[#2B2824] transition-all active:scale-95 min-w-[56px] min-h-[44px]"
        aria-label="Settings"
      >
        <SlidersHorizontal className="w-4 h-4 mb-0.5" />
        <span className="text-[10px] font-sans tracking-tight">Settings</span>
      </button>
    </nav>
  );
};
