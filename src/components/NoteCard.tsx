import React from 'react';
import type { Note } from '../types';
import { Lock, Bookmark } from 'lucide-react';

interface NoteCardProps {
  note: Note;
  onSelectNote: (note: Note) => void;
  onRequestUnlock: (note: Note) => void;
  onToggleSaved: (id: string, e: React.MouseEvent) => void;
  isUnlockedInSession: boolean;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onSelectNote,
  onRequestUnlock,
  onToggleSaved,
  isUnlockedInSession,
}) => {
  const isLocked = note.isVaulted && !isUnlockedInSession;

  // 1. Locked Vault Card (Only Title, Just "Vault", No "Encrypted" below)
  if (isLocked) {
    return (
      <div 
        onClick={() => onRequestUnlock(note)}
        className="group relative bg-[#FAF8F5] hover:bg-[#F7F4EC] border border-[#E8E4DA] rounded-2xl p-6 transition-all duration-300 hover:shadow-elevation cursor-pointer flex flex-col justify-between min-h-[180px]"
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between text-xs text-[#8C857B] mb-3">
            <span className="flex items-center gap-1.5 font-medium tracking-wide">
              <Lock className="w-3.5 h-3.5 text-[#233831]" />
              Vault
            </span>
            <span className="font-mono text-[11px]">{note.displayDate || note.date}</span>
          </div>

          {/* Title (Only Title) */}
          <h3 className="font-serif text-xl font-normal text-[#2B2824] leading-snug mb-2 group-hover:text-[#1A2B25] transition-colors">
            {note.title}
          </h3>
        </div>

        {/* Footer: Removed "Encrypted" text below, Unlock button aligned */}
        <div className="pt-3 border-t border-[#E8E4DA]/70 flex items-center justify-end text-xs text-[#8C857B]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRequestUnlock(note);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E8E4DA] text-[#2B2824] hover:bg-[#233831] hover:text-white hover:border-[#233831] font-medium text-[11px] shadow-subtle transition-all"
          >
            <Lock className="w-3 h-3" />
            <span>Unlock</span>
          </button>
        </div>
      </div>
    );
  }

  // 2. Field Note Card with Image
  if (note.cardType === 'field-note') {
    return (
      <div 
        onClick={() => onSelectNote(note)}
        className="group bg-white border border-[#E8E4DA] rounded-2xl overflow-hidden shadow-subtle hover:shadow-elevation transition-all duration-300 cursor-pointer flex flex-col justify-between"
      >
        <div>
          {/* Image */}
          {note.coverImage && (
            <div className="h-44 w-full overflow-hidden bg-[#ECE7DD] relative">
              <img
                src={note.coverImage}
                alt={note.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
              />
            </div>
          )}

          <div className="p-5">
            <div className="flex items-center justify-between text-[11px] text-[#8C857B] uppercase tracking-wider mb-2">
              <span className="font-medium">Field Note</span>
              <span>{note.metadataChips?.[0] || 'Kyoto Stone'}</span>
            </div>

            {note.quote && (
              <p className="font-serif italic text-sm text-[#2B2824] leading-relaxed my-2">
                “{note.quote}”
              </p>
            )}
          </div>
        </div>

        <div className="px-5 pb-4 pt-2 border-t border-[#E8E4DA]/50 flex items-center justify-between text-xs text-[#8C857B]">
          <span className="font-serif italic text-xs">{note.quoteAuthor || 'Fragment 04'}</span>
          <button
            onClick={(e) => onToggleSaved(note.id, e)}
            className="p-1 text-[#8C857B] hover:text-[#233831] transition-colors"
          >
            <Bookmark className={`w-4 h-4 ${note.isSaved ? 'fill-[#233831] text-[#233831]' : ''}`} />
          </button>
        </div>
      </div>
    );
  }

  // 4. Standard Text Journal Note Card
  return (
    <div
      onClick={() => onSelectNote(note)}
      className="group bg-white hover:bg-[#FCFBF9] border border-[#E8E4DA] rounded-2xl p-6 shadow-subtle hover:shadow-card transition-all duration-300 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Top line */}
        <div className="flex items-center justify-between text-xs text-[#8C857B] mb-2.5">
          <span className="font-serif">{note.displayDate || note.date}</span>
          <span className="font-mono text-[11px]">{note.wordCount} words</span>
        </div>

        {/* Title */}
        <h3 className="font-serif text-xl font-normal text-[#2B2824] leading-snug mb-2 group-hover:text-[#1A2B25] transition-colors">
          {note.title}
        </h3>

        {/* Excerpt */}
        <p className="text-xs text-[#5B554D] font-serif leading-relaxed line-clamp-3 mb-4">
          {note.excerpt}
        </p>

        {/* Quote snippet if present */}
        {note.quote && !note.coverImage && (
          <div className="pl-3 border-l-2 border-[#CCC5B4] my-3">
            <p className="font-serif italic text-xs text-[#5B554D]">
              “{note.quote}”
            </p>
          </div>
        )}
      </div>

      {/* Bottom row: Status and Action Link */}
      <div className="pt-4 border-t border-[#E8E4DA]/60 flex items-center justify-between text-xs text-[#8C857B]">
        <div className="flex items-center gap-2">
          {note.isVaulted && (
            <span className="flex items-center gap-1 text-[10px] text-[#233831] bg-[#233831]/10 px-1.5 py-0.5 rounded">
              <Lock className="w-2.5 h-2.5" /> PIN
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={(e) => onToggleSaved(note.id, e)}
            className="text-[#8C857B] hover:text-[#233831] transition-colors"
            title={note.isSaved ? "Saved" : "Save bookmark"}
          >
            <Bookmark className={`w-3.5 h-3.5 ${note.isSaved ? 'fill-[#233831] text-[#233831]' : ''}`} />
          </button>
          <span className="flex items-center gap-1 text-[11px] text-[#2B2824] font-medium group-hover:translate-x-0.5 transition-transform">
            Read page →
          </span>
        </div>
      </div>
    </div>
  );
};
