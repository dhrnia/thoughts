import React, { useState } from 'react';
import type { Note, FilterTab } from '../types';
import { NoteCard } from './NoteCard';
import { Search, ChevronDown, Lock, Plus } from 'lucide-react';

interface JournalGridProps {
  notes: Note[];
  currentTab: FilterTab;
  onSelectTab: (tab: FilterTab) => void;
  onSelectNote: (note: Note) => void;
  onRequestUnlock: (note: Note) => void;
  onToggleSaved: (id: string, e: React.MouseEvent) => void;
  unlockedNoteIds: Set<string>;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onNewNote?: () => void;
}

export const JournalGrid: React.FC<JournalGridProps> = ({
  notes,
  currentTab,
  onSelectTab,
  onSelectNote,
  onRequestUnlock,
  onToggleSaved,
  unlockedNoteIds,
  searchQuery,
  onSearchChange,
  onNewNote,
}) => {
  const [earlierMonthsExpanded, setEarlierMonthsExpanded] = useState(false);

  // Filter notes based on current tab and search query
  const filteredNotes = notes.filter((n) => {
    // Search match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = n.title.toLowerCase().includes(q);
      const matchContent = n.content.toLowerCase().includes(q);
      const matchExcerpt = n.excerpt.toLowerCase().includes(q);
      const matchTags = n.tags.some(t => t.toLowerCase().includes(q));
      const matchLocation = n.location?.toLowerCase().includes(q);
      if (!matchTitle && !matchContent && !matchExcerpt && !matchTags && !matchLocation) {
        return false;
      }
    }

    // Tab match
    if (currentTab === 'reflections') {
      return n.category === 'reflections' || n.tags.includes('reflections');
    }
    if (currentTab === 'vault') {
      return n.isVaulted;
    }
    if (currentTab === 'saved') {
      return n.isSaved;
    }
    return true;
  });

  const allCount = notes.length;
  const reflectionsCount = notes.filter(n => n.category === 'reflections' || n.tags.includes('reflections')).length;
  const vaultCount = notes.filter(n => n.isVaulted).length;
  const savedCount = notes.filter(n => n.isSaved).length;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-8 lg:py-12 animate-fade-in">
      {/* Top Section Header */}
      <div className="mb-8 md:mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-[#2B2824] tracking-tight">
              Journal
            </h1>
            <p className="text-xs sm:text-sm text-[#8C857B] mt-1.5 font-sans">
              {allCount} {allCount === 1 ? 'entry' : 'entries'} recorded <span className="mx-1">•</span> 
              <span className="inline-flex items-center gap-1 text-[#233831] font-medium">
                <Lock className="w-3 h-3 inline" /> {vaultCount} sealed in private vault
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-[#E8E4DA]/60">
        {/* Search bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8C857B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search thoughts, places, fragments..."
            className="w-full pl-10 pr-4 py-2 bg-white/70 hover:bg-white focus:bg-white border border-[#E8E4DA] focus:border-[#233831] rounded-xl text-xs sm:text-sm text-[#2B2824] placeholder-[#A9A08D] outline-none transition-all shadow-subtle"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8C857B] hover:text-[#2B2824]"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => onSelectTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-sans whitespace-nowrap transition-all ${
              currentTab === 'all'
                ? 'bg-[#EAE6DC] text-[#2B2824] font-medium'
                : 'text-[#8C857B] hover:text-[#2B2824] hover:bg-[#EFECE2]/50'
            }`}
          >
            All ({allCount})
          </button>

          <button
            onClick={() => onSelectTab('reflections')}
            className={`px-3 py-1.5 rounded-lg text-xs font-sans whitespace-nowrap transition-all ${
              currentTab === 'reflections'
                ? 'bg-[#EAE6DC] text-[#2B2824] font-medium'
                : 'text-[#8C857B] hover:text-[#2B2824] hover:bg-[#EFECE2]/50'
            }`}
          >
            Reflections ({reflectionsCount})
          </button>

          <button
            onClick={() => onSelectTab('vault')}
            className={`px-3 py-1.5 rounded-lg text-xs font-sans whitespace-nowrap flex items-center gap-1.5 transition-all ${
              currentTab === 'vault'
                ? 'bg-[#233831] text-white font-medium'
                : 'text-[#8C857B] hover:text-[#2B2824] hover:bg-[#EFECE2]/50'
            }`}
          >
            <Lock className="w-3 h-3" />
            <span>Vault ({vaultCount})</span>
          </button>

          <button
            onClick={() => onSelectTab('saved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-sans whitespace-nowrap transition-all ${
              currentTab === 'saved'
                ? 'bg-[#EAE6DC] text-[#2B2824] font-medium'
                : 'text-[#8C857B] hover:text-[#2B2824] hover:bg-[#EFECE2]/50'
            }`}
          >
            Saved ({savedCount})
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-20 bg-white/40 border border-dashed border-[#E8E4DA] rounded-2xl p-8 max-w-lg mx-auto my-6">
          {allCount === 0 ? (
            <>
              <p className="font-serif text-2xl text-[#2B2824] mb-2 font-normal">Your journal is ready</p>
              <p className="font-sans text-xs text-[#8C857B] mb-6">Begin by writing your first reflection in quietness.</p>
              {onNewNote && (
                <button
                  onClick={onNewNote}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#233831] text-white text-xs font-sans font-medium tracking-wide shadow-subtle hover:bg-[#1A2B25] transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create First Entry</span>
                </button>
              )}
            </>
          ) : (
            <>
              <p className="font-serif text-lg text-[#8C857B]">No thoughts found matching your search</p>
              <button
                onClick={() => {
                  onSelectTab('all');
                  onSearchChange('');
                }}
                className="mt-3 text-xs text-[#233831] underline underline-offset-4"
              >
                Clear filters
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onSelectNote={onSelectNote}
              onRequestUnlock={onRequestUnlock}
              onToggleSaved={onToggleSaved}
              isUnlockedInSession={unlockedNoteIds.has(note.id)}
            />
          ))}
        </div>
      )}

      {/* Footer Quote & Earlier Months */}
      <div className="mt-16 sm:mt-24 text-center border-t border-[#E8E4DA]/60 pt-10 pb-6">
        <p className="font-serif italic text-sm text-[#8C857B] max-w-md mx-auto mb-4">
          “In the silence of the page, everything returns.”
        </p>

        <button
          onClick={() => setEarlierMonthsExpanded(!earlierMonthsExpanded)}
          className="inline-flex items-center gap-1.5 text-xs text-[#5B554D] hover:text-[#2B2824] transition-colors py-1 px-3 rounded-md hover:bg-[#EAE6DC]"
        >
          <span>Examine Earlier Months</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${earlierMonthsExpanded ? 'rotate-180' : ''}`} />
        </button>

        {earlierMonthsExpanded && (
          <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs text-[#8C857B] animate-fade-in">
            {['September 2024', 'August 2024', 'July 2024', 'June 2024'].map((m) => (
              <span
                key={m}
                onClick={() => {
                  onSearchChange(m.split(' ')[0]);
                }}
                className="px-3 py-1 bg-white border border-[#E8E4DA] rounded-full hover:border-[#CCC5B4] cursor-pointer"
              >
                {m}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
