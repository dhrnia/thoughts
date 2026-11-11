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
        className="group relative bg-[#FAF8F5] hover:bg-[#F7F4EC] active:bg-[#F3EFE6] border border-[#E8E4DA] rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:shadow-elevation active:scale-[0.99] cursor-pointer flex flex-col justify-between min-h-[170px] sm:min-h-[180px]"
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between text-xs text-[#8C857B] mb-2.5 sm:mb-3">
            <span className="flex items-center gap-1.5 font-medium tracking-wide">
              <Lock className="w-3.5 h-3.5 text-[#233831]" />
              Vault
            </span>
            <span className="font-mono text-[11px]">{note.displayDate || note.date}</span>
          </div>

          {/* Title (Only Title) */}
          <h3 className="font-serif text-lg sm:text-xl font-normal text-[#2B2824] leading-snug mb-2 group-hover:text-[#1A2B25] transition-colors">
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
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white border border-[#E8E4DA] text-[#2B2824] hover:bg-[#233831] hover:text-white hover:border-[#233831] active:scale-95 font-medium text-xs shadow-subtle transition-all min-h-[34px]"
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
        className="group bg-white active:bg-[#FCFBF9] border border-[#E8E4DA] rounded-2xl overflow-hidden shadow-subtle hover:shadow-elevation active:scale-[0.99] transition-all duration-300 cursor-pointer flex flex-col justify-between"
      >
        <div>
          {/* Image */}
          {note.coverImage && (
            <div className="h-40 sm:h-44 w-full overflow-hidden bg-[#ECE7DD] relative">
              <img
                src={note.coverImage}
                alt={note.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
              />
            </div>
          )}

          <div className="p-4 sm:p-5">
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

        <div className="px-4 sm:px-5 pb-4 pt-2 border-t border-[#E8E4DA]/50 flex items-center justify-between text-xs text-[#8C857B]">
          <span className="font-serif italic text-xs">{note.quoteAuthor || 'Fragment 04'}</span>
          <button
            onClick={(e) => onToggleSaved(note.id, e)}
            className="p-2 -mr-1.5 text-[#8C857B] hover:text-[#233831] active:scale-90 transition-all min-h-[38px] min-w-[38px] flex items-center justify-center"
            aria-label={note.isSaved ? "Saved" : "Save bookmark"}
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
      className="group bg-white hover:bg-[#FCFBF9] active:bg-[#F9F7F2] border border-[#E8E4DA] rounded-2xl p-5 sm:p-6 shadow-subtle hover:shadow-card active:scale-[0.99] transition-all duration-300 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Top line */}
        <div className="flex items-center justify-between text-xs text-[#8C857B] mb-2 sm:mb-2.5">
          <span className="font-serif">{note.displayDate || note.date}</span>
          <span className="font-mono text-[11px]">{note.wordCount} words</span>
        </div>

        {/* Title */}
        <h3 className="font-serif text-lg sm:text-xl font-normal text-[#2B2824] leading-snug mb-2 group-hover:text-[#1A2B25] transition-colors">
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
      <div className="pt-3.5 sm:pt-4 border-t border-[#E8E4DA]/60 flex items-center justify-between text-xs text-[#8C857B]">
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
            className="p-1.5 -ml-1.5 text-[#8C857B] hover:text-[#233831] active:scale-90 transition-all min-h-[36px] min-w-[36px] flex items-center justify-center"
            title={note.isSaved ? "Saved" : "Save bookmark"}
            aria-label={note.isSaved ? "Saved" : "Save bookmark"}
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
