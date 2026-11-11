import React from 'react';
import { 
  PenSquare, 
  BookOpen, 
  Lock, 
  SlidersHorizontal, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight,
  X
} from 'lucide-react';
import type { FilterTab } from '../types';

interface SidebarProps {
  currentTab: FilterTab;
  onSelectTab: (tab: FilterTab) => void;
  onNewEntry: () => void;
  onOpenSettings: () => void;
  vaultCount: number;
  totalCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onNewEntry,
  onOpenSettings,
  vaultCount,
  totalCount,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-[100dvh] bg-[#F6F4EE] border-r border-[#E8E4DA] transition-all duration-300 ease-in-out flex flex-col justify-between select-none
          ${isCollapsed ? 'lg:w-[72px]' : 'lg:w-[240px]'}
          ${isMobileOpen ? 'translate-x-0 w-[min(280px,85vw)] shadow-2xl' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Top Header & Brand */}
        <div className="p-4 sm:p-5 pb-3 pt-[max(1rem,env(safe-area-inset-top))]">
          <div className="flex items-center justify-between">
            <div 
              onClick={() => {
                onSelectTab('all');
                onCloseMobile();
              }}
              className="flex items-center gap-2.5 cursor-pointer group"
              title="thoughts"
            >
              {/* Star App Icon */}
              <div className="w-8 h-8 rounded-lg bg-[#233831] text-[#FAF8F5] flex items-center justify-center shadow-subtle group-hover:bg-[#1A2B25] transition-colors">
                {/* 4-point celestial star icon SVG */}
                <svg 
                  className="w-4 h-4 fill-current text-white transform group-hover:rotate-45 transition-transform duration-300" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C12 7.07 16.93 12 24 12C16.93 12 12 16.93 12 24C12 16.93 7.07 12 0 12C7.07 12 12 7.07 12 0Z" />
                </svg>
              </div>

              {(!isCollapsed || isMobileOpen) && (
                <span className="font-serif text-2xl font-normal tracking-tight text-[#2B2824] leading-none">
                  thoughts
                </span>
              )}
            </div>

            {/* Desktop Collapse Button */}
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 text-[#8C857B] hover:text-[#2B2824] hover:bg-[#EAE6DC] rounded-lg transition-colors"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {/* Mobile Close Button with accessible touch target */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-2 -mr-1 text-[#8C857B] hover:text-[#2B2824] hover:bg-[#EAE6DC] active:scale-95 rounded-lg min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New Entry Button */}
          <div className="mt-5">
            <button
              onClick={() => {
                onNewEntry();
                onCloseMobile();
              }}
              className={`w-full bg-[#233831] hover:bg-[#1A2B25] active:scale-[0.98] text-[#FAF8F5] rounded-xl font-medium shadow-sm transition-all duration-200 flex items-center justify-center gap-2.5 
                ${isCollapsed && !isMobileOpen ? 'h-11 px-0' : 'h-11 px-4'}
              `}
              title="New Entry"
            >
              <PenSquare className="w-4 h-4 shrink-0" />
              {(!isCollapsed || isMobileOpen) && (
                <span className="text-sm font-sans tracking-wide">New Entry</span>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {/* All Entries */}
          <button
            onClick={() => {
              onSelectTab('all');
              onCloseMobile();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
              currentTab === 'all'
                ? 'bg-[#EAE6DC] text-[#2B2824] font-medium shadow-subtle'
                : 'text-[#5B554D] hover:bg-[#EFECE2]/70 hover:text-[#2B2824]'
            } ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''}`}
            title="All Entries"
          >
            <BookOpen className="w-4 h-4 shrink-0 opacity-80" />
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex items-center justify-between w-full">
                <span className="font-sans">All Entries</span>
                <span className="text-xs text-[#8C857B] font-mono">{totalCount}</span>
              </div>
            )}
          </button>

          {/* Private Vault */}
          <button
            onClick={() => {
              onSelectTab('vault');
              onCloseMobile();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
              currentTab === 'vault'
                ? 'bg-[#EAE6DC] text-[#2B2824] font-medium shadow-subtle'
                : 'text-[#5B554D] hover:bg-[#EFECE2]/70 hover:text-[#2B2824]'
            } ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''}`}
            title="Private Vault"
          >
            <Lock className="w-4 h-4 shrink-0 opacity-80 text-[#233831]" />
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex items-center justify-between w-full">
                <span className="font-sans">Private Vault</span>
                <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-[#233831]/10 text-[#233831] font-mono font-medium">
                  {vaultCount}
                </span>
              </div>
            )}
          </button>

          {/* Settings */}
          <button
            onClick={() => {
              onOpenSettings();
              onCloseMobile();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#5B554D] hover:bg-[#EFECE2]/70 hover:text-[#2B2824] transition-all ${
              isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''
            }`}
            title="Vault & App Settings"
          >
            <SlidersHorizontal className="w-4 h-4 shrink-0 opacity-80" />
            {(!isCollapsed || isMobileOpen) && (
              <span className="font-sans">Settings</span>
            )}
          </button>
        </div>

        {/* Footer: Encrypted Indicator */}
        <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-[#E8E4DA]/80">
          <div 
            onClick={onOpenSettings}
            className={`flex items-center gap-2 cursor-pointer text-[#8C857B] hover:text-[#2B2824] transition-colors ${
              isCollapsed && !isMobileOpen ? 'justify-center' : 'justify-between'
            }`}
            title="End-to-End Vault Encrypted"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              {(!isCollapsed || isMobileOpen) && (
                <span className="text-xs font-sans tracking-wide">Encrypted</span>
              )}
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <ShieldCheck className="w-4 h-4 text-[#8C857B] opacity-70" />
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
