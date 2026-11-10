import React from 'react';
import type { Note } from '../types';
import { X, Lock, Unlock, Clock, Calendar } from 'lucide-react';

interface PropertiesPanelProps {
  note: Note;
  isOpen: boolean;
  onClose: () => void;
  onToggleVaultStatus: () => void;
  onAddTag?: (tag: string) => void;
  onRemoveTag?: (tag: string) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  note,
  isOpen,
  onClose,
  onToggleVaultStatus,
}) => {
  if (!isOpen) return null;

  const goalWords = 750;
  const currentWords = note.wordCount || 642;
  const percentage = Math.min(100, Math.round((currentWords / goalWords) * 100));

  // Circle progress calculation
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/20 backdrop-blur-xs lg:hidden z-40 transition-opacity"
      />

      <aside className="fixed lg:sticky top-0 right-0 h-screen w-80 bg-[#FAF8F5] border-l border-[#E8E4DA] z-40 flex flex-col justify-between p-6 overflow-y-auto animate-fade-in shadow-elevation lg:shadow-none">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E8E4DA]/70 mb-6">
            <span className="text-xs font-sans uppercase tracking-widest text-[#8C857B] font-medium">
              Properties
            </span>
            <button
              onClick={onClose}
              className="p-1 text-[#8C857B] hover:text-[#2B2824] hover:bg-[#EAE6DC] rounded-md transition-colors"
              aria-label="Close properties"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Section 1: Security State */}
          <div className="mb-7">
            <div className="text-[11px] font-sans uppercase tracking-wider text-[#8C857B] font-medium mb-2.5">
              Security State
            </div>

            <div className="bg-white/80 border border-[#E8E4DA] rounded-xl p-3.5 shadow-subtle">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${note.isVaulted ? 'bg-[#233831] text-white' : 'bg-[#EAE6DC] text-[#5B554D]'}`}>
                    {note.isVaulted ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-xs font-serif font-medium text-[#2B2824]">
                    {note.isVaulted ? 'Vault Encrypted' : 'Open Document'}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-[#8C857B] font-sans leading-relaxed mb-3">
                {note.isVaulted
                  ? 'Protected with 4-digit PIN. Obscured in index view.'
                  : 'Unsealed document. Can be secured with a PIN.'}
              </p>

              <button
                onClick={onToggleVaultStatus}
                className={`w-full py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                  note.isVaulted
                    ? 'bg-[#FAF8F5] hover:bg-[#EAE6DC] text-[#2B2824] border border-[#E8E4DA]'
                    : 'bg-[#233831] hover:bg-[#1A2B25] text-white shadow-subtle'
                }`}
              >
                {note.isVaulted ? 'Unlock / Remove PIN Protection' : 'Lock Note with PIN'}
              </button>
            </div>
          </div>

          {/* Section 2: Document Metric */}
          <div className="mb-7">
            <div className="text-[11px] font-sans uppercase tracking-wider text-[#8C857B] font-medium mb-2.5">
              Document Metric
            </div>

            <div className="space-y-2 text-xs font-sans">
              <div className="flex items-center justify-between text-[#8C857B]">
                <span className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 opacity-60" /> Date created
                </span>
                <span className="font-mono text-[#2B2824]">{note.displayDate || note.date || note.createdAt}</span>
              </div>

              <div className="flex items-center justify-between text-[#8C857B]">
                <span className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 opacity-60" /> Last updated
                </span>
                <span className="font-mono text-[#2B2824]">{note.updatedAt || note.timeContext || 'Just now'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Daily Focus Goal (Circle Progress) */}
        <div className="pt-4 border-t border-[#E8E4DA]/70">
          <div className="bg-white/70 border border-[#E8E4DA] rounded-xl p-4 flex items-center gap-4">
            {/* SVG Circular Ring */}
            <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 54 54">
                {/* Background Track */}
                <circle
                  cx="27"
                  cy="27"
                  r={radius}
                  fill="none"
                  stroke="#EFECE2"
                  strokeWidth="4"
                />
                {/* Progress Value */}
                <circle
                  cx="27"
                  cy="27"
                  r={radius}
                  fill="none"
                  stroke="#233831"
                  strokeWidth="4"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-serif text-xs font-medium text-[#2B2824]">
                {percentage}%
              </div>
            </div>

            <div>
              <div className="text-xs font-serif font-medium text-[#2B2824]">
                Daily Focus Goal
              </div>
              <div className="text-[11px] text-[#8C857B] font-mono mt-0.5">
                {currentWords} / {goalWords} words
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
