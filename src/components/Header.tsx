import React from 'react';
import { Menu, Plus } from 'lucide-react';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onNewEntry: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onNewEntry,
  onOpenSettings,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8E4DA]/60 px-4 md:px-8 py-3 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Trigger + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 -ml-2 text-[#5B554D] hover:text-[#2B2824] hover:bg-[#EFECE2] rounded-lg transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Mobile Star Brand */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#233831] text-[#FAF8F5] flex items-center justify-center">
              <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 24 24">
                <path d="M12 0C12 7.07 16.93 12 24 12C16.93 12 12 16.93 12 24C12 16.93 7.07 12 0 12C7.07 12 12 7.07 12 0Z" />
              </svg>
            </div>
            <span className="font-serif text-lg font-normal text-[#2B2824] tracking-tight">thoughts</span>
          </div>

          {/* Sync indicator */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-[#8C857B] pl-2 font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600/80" />
            <span>Last synched 14m ago</span>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Mobile + Desktop New Entry Button */}
          <button
            onClick={onNewEntry}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#233831] hover:bg-[#1A2B25] text-white text-xs font-medium rounded-lg shadow-sm transition-all"
            title="Create new thought"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Entry</span>
          </button>

          {/* Profile Avatar */}
          <button
            onClick={onOpenSettings}
            className="w-8 h-8 rounded-full bg-[#EFECE2] border border-[#E8E4DA] text-[#5B554D] hover:text-[#2B2824] hover:border-[#CCC5B4] flex items-center justify-center font-serif text-xs font-medium transition-all"
            title="Profile & Vault Settings"
          >
            <span>D</span>
          </button>
        </div>
      </div>
    </header>
  );
};
