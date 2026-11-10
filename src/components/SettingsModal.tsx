import React, { useState } from 'react';
import { 
  X, 
  KeyRound, 
  Lock, 
  Check
} from 'lucide-react';
import { zenAudio } from '../utils/audio';
import type { Note } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pin: string;
  onUpdatePin: (newPin: string) => void;
  onRelockAll: () => void;
  notes?: Note[];
  onNotesUpdated?: (notes: Note[]) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  pin: _pin,
  onUpdatePin,
  onRelockAll,
  notes = [],
  onNotesUpdated,
}) => {
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState<{ text: string; error?: boolean } | null>(null);

  // Sync state
  if (!isOpen) return null;

  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setPinChangeMsg({ text: 'PIN must be exactly 4 digits (0-9)', error: true });
      return;
    }
    if (newPin !== confirmPin) {
      setPinChangeMsg({ text: 'New PIN and Confirmation do not match', error: true });
      return;
    }

    onUpdatePin(newPin);
    zenAudio.playBell(580);
    setPinChangeMsg({ text: 'Passcode successfully updated!', error: false });
    setNewPin('');
    setConfirmPin('');
    setTimeout(() => setPinChangeMsg(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-[#FAF8F5] border border-[#E8E4DA] rounded-2xl shadow-elevation p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#8C857B] hover:text-[#2B2824] hover:bg-[#EAE6DC] rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#233831] text-white flex items-center justify-center shadow-subtle">
            <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
              <path d="M12 0C12 7.07 16.93 12 24 12C16.93 12 12 16.93 12 24C12 16.93 7.07 12 0 12C7.07 12 12 7.07 12 0Z" />
            </svg>
          </div>
          <div>
            <h2 className="font-serif text-2xl font-normal text-[#2B2824]">thoughts Settings</h2>
          </div>
        </div>

        {/* Section: PIN Management */}
        <div className="bg-white/80 border border-[#E8E4DA] rounded-xl p-5 mb-5 shadow-subtle">
          <div className="flex items-center gap-2 mb-3 text-xs font-sans uppercase tracking-wider text-[#2B2824] font-medium">
            <KeyRound className="w-4 h-4 text-[#233831]" />
            <span>Vault Passcode (PIN)</span>
          </div>

          <form onSubmit={handleSaveNewPin} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[#5B554D] mb-1">New 4-digit PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 5678"
                  className="w-full px-3 py-2 text-center text-sm tracking-widest font-mono bg-[#FAF8F5] border border-[#E8E4DA] focus:border-[#233831] rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#5B554D] mb-1">Confirm PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Confirm"
                  className="w-full px-3 py-2 text-center text-sm tracking-widest font-mono bg-[#FAF8F5] border border-[#E8E4DA] focus:border-[#233831] rounded-lg outline-none"
                />
              </div>
            </div>

            {pinChangeMsg && (
              <div className={`text-xs p-2.5 rounded-lg flex items-center gap-2 ${
                pinChangeMsg.error ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-800'
              }`}>
                {!pinChangeMsg.error && <Check className="w-3.5 h-3.5" />}
                {pinChangeMsg.text}
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-[#A9A08D] font-mono">
                Current PIN: ••••
              </span>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#233831] hover:bg-[#1A2B25] text-white text-xs font-medium rounded-lg shadow-subtle transition-all"
              >
                Update PIN
              </button>
            </div>
          </form>
        </div>

        {/* Section 4: Vault State Controls */}
        <div className="bg-white/80 border border-[#E8E4DA] rounded-xl p-5 shadow-subtle">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-sans uppercase tracking-wider text-[#2B2824] font-medium">
              <Lock className="w-4 h-4 text-[#233831]" />
              <span>Vault Protection Actions</span>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => {
                onRelockAll();
                zenAudio.playBell(400);
              }}
              className="w-full py-2 px-3 bg-[#FAF8F5] hover:bg-[#EAE6DC] text-[#2B2824] border border-[#E8E4DA] rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock All Notes Immediately</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
