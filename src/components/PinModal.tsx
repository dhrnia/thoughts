import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Delete, X, KeyRound } from 'lucide-react';
import { zenAudio } from '../utils/audio';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  subtitle?: string;
  correctPin: string;
  onUpdatePin?: (newPin: string) => void;
}

export const PinModal: React.FC<PinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'Enter PIN',
  subtitle = '',
  correctPin,
  onUpdatePin,
}) => {
  const [pin, setPin] = useState('');
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [newPinStep, setNewPinStep] = useState<'current' | 'new' | 'confirm'>('current');
  const [tempNewPin, setTempNewPin] = useState('');
  const [statusMessage, setStatusMessage] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setIsError(false);
      setIsSuccess(false);
      setIsChangingPin(false);
      setNewPinStep('current');
      setStatusMessage('');
    }
  }, [isOpen]);

  // Handle keyboard typing
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, pin, isChangingPin, newPinStep, tempNewPin]);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    zenAudio.playClick();
    const nextPin = pin + digit;
    setPin(nextPin);
    setIsError(false);

    if (nextPin.length === 4) {
      evaluatePin(nextPin);
    }
  };

  const handleBackspace = () => {
    zenAudio.playClick();
    setPin(prev => prev.slice(0, -1));
    setIsError(false);
  };

  const evaluatePin = (enteredPin: string) => {
    if (!isChangingPin) {
      if (enteredPin === correctPin) {
        setIsSuccess(true);
        zenAudio.playBell(528);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 350);
      } else {
        triggerError('Incorrect passcode. Default is 1234');
      }
    } else {
      // Change PIN flow
      if (newPinStep === 'current') {
        if (enteredPin === correctPin) {
          setNewPinStep('new');
          setPin('');
          setStatusMessage('Enter your new 4-digit passcode');
        } else {
          triggerError('Current passcode incorrect');
        }
      } else if (newPinStep === 'new') {
        setTempNewPin(enteredPin);
        setNewPinStep('confirm');
        setPin('');
        setStatusMessage('Re-enter new passcode to confirm');
      } else if (newPinStep === 'confirm') {
        if (enteredPin === tempNewPin) {
          if (onUpdatePin) onUpdatePin(enteredPin);
          setIsSuccess(true);
          zenAudio.playBell(580);
          setStatusMessage('Passcode updated successfully!');
          setTimeout(() => {
            setIsChangingPin(false);
            onSuccess();
            onClose();
          }, 600);
        } else {
          triggerError('Passcodes did not match. Try again.');
          setNewPinStep('new');
          setPin('');
          setTempNewPin('');
        }
      }
    }
  };

  const triggerError = (msg?: string) => {
    setIsError(true);
    if (msg) setStatusMessage(msg);
    setTimeout(() => {
      setPin('');
      setIsError(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-sm bg-[#FAF8F5] border border-[#E8E4DA] rounded-2xl shadow-2xl p-7 relative overflow-hidden"
        style={{
          boxShadow: '0 20px 45px -10px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.7) inset'
        }}
      >
        {/* Subtle decorative background light */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#EFECE2]/70 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#8C857B] hover:text-[#2B2824] hover:bg-[#EFECE2]/60 rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Lock Icon Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className={`w-13 h-13 rounded-2xl flex items-center justify-center mb-3 transition-colors duration-300 ${
            isSuccess 
              ? 'bg-[#233831] text-white' 
              : isError 
                ? 'bg-rose-100 text-rose-700' 
                : 'bg-[#EFECE2] text-[#233831]'
          } p-3.5 shadow-sm`}>
            {isSuccess ? (
              <Unlock className="w-6 h-6 animate-pulse" />
            ) : isChangingPin ? (
              <KeyRound className="w-6 h-6" />
            ) : (
              <Lock className="w-6 h-6" />
            )}
          </div>

          <h3 className="font-serif text-2xl font-normal text-[#2B2824] tracking-tight">
            {isChangingPin 
              ? (newPinStep === 'current' ? 'Confirm Current PIN' : newPinStep === 'new' ? 'Choose New PIN' : 'Confirm New PIN')
              : (title || 'Enter PIN')}
          </h3>
          {(statusMessage || (isChangingPin && subtitle)) && (
            <p className="text-xs text-[#8C857B] mt-1 max-w-[240px]">
              {statusMessage || subtitle}
            </p>
          )}
        </div>

        {/* 4-Digit Indicator Dots */}
        <div className={`flex justify-center items-center gap-4 my-4 ${isError ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-200 border ${
                  isFilled
                    ? isError
                      ? 'bg-rose-600 border-rose-600 scale-110'
                      : isSuccess
                        ? 'bg-[#233831] border-[#233831] scale-110'
                        : 'bg-[#2B2824] border-[#2B2824] scale-110'
                    : 'bg-transparent border-[#CCC5B4]'
                }`}
              />
            );
          })}
        </div>

        {/* Tactile Keypad */}
        <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto mt-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit.toString())}
              disabled={pin.length >= 4}
              className="h-12 w-full rounded-xl bg-white/80 hover:bg-white active:bg-[#EFECE2] border border-[#E8E4DA] text-lg font-serif text-[#2B2824] font-medium shadow-subtle hover:shadow-sm active:scale-95 transition-all flex items-center justify-center select-none"
            >
              {digit}
            </button>
          ))}

          {/* Bottom row: Reset/Action, 0, Backspace */}
          <button
            onClick={() => {
              if (isChangingPin) {
                setIsChangingPin(false);
                setPin('');
                setStatusMessage('');
              } else {
                setIsChangingPin(true);
                setNewPinStep('current');
                setPin('');
                setStatusMessage('Enter current passcode first');
              }
            }}
            className="h-12 rounded-xl text-[11px] font-sans text-[#8C857B] hover:text-[#2B2824] hover:bg-white/60 transition-colors flex items-center justify-center underline decoration-dotted"
            title="Change Passcode"
          >
            {isChangingPin ? 'Cancel' : 'Change PIN'}
          </button>

          <button
            onClick={() => handleDigit('0')}
            disabled={pin.length >= 4}
            className="h-12 w-full rounded-xl bg-white/80 hover:bg-white active:bg-[#EFECE2] border border-[#E8E4DA] text-lg font-serif text-[#2B2824] font-medium shadow-subtle hover:shadow-sm active:scale-95 transition-all flex items-center justify-center select-none"
          >
            0
          </button>

          <button
            onClick={handleBackspace}
            disabled={pin.length === 0}
            className="h-12 rounded-xl bg-white/50 hover:bg-white active:bg-[#EFECE2] border border-[#E8E4DA] text-[#8C857B] hover:text-[#2B2824] shadow-subtle active:scale-95 transition-all flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Backspace"
          >
            <Delete className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
