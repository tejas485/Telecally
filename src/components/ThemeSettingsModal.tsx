import React from 'react';
import { 
  Sun, 
  Moon, 
  Palette, 
  Type, 
  MousePointerClick, 
  Check, 
  X, 
  Monitor,
  Sparkles
} from 'lucide-react';
import { 
  ThemeSettings, 
  ThemeMode, 
  ColorTheme, 
  FontSizeSetting, 
  ButtonSizeSetting 
} from '../types';

interface ThemeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ThemeSettings;
  onUpdateSettings: (newSettings: ThemeSettings) => void;
}

export const ThemeSettingsModal: React.FC<ThemeSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings
}) => {
  if (!isOpen) return null;

  const colorThemes: { id: ColorTheme; name: string; bgClass: string; borderClass: string; accentHex: string }[] = [
    { id: 'cyan', name: 'Oceanic Cyan', bgClass: 'from-cyan-500 to-blue-600', borderClass: 'border-cyan-500', accentHex: '#06b6d4' },
    { id: 'indigo', name: 'Royal Indigo', bgClass: 'from-indigo-500 to-purple-600', borderClass: 'border-indigo-500', accentHex: '#6366f1' },
    { id: 'emerald', name: 'Terminal Emerald', bgClass: 'from-emerald-500 to-teal-600', borderClass: 'border-emerald-500', accentHex: '#10b981' },
    { id: 'amber', name: 'Sunset Amber', bgClass: 'from-amber-500 to-orange-600', borderClass: 'border-amber-500', accentHex: '#f59e0b' },
    { id: 'rose', name: 'Crimson Rose', bgClass: 'from-rose-500 to-pink-600', borderClass: 'border-rose-500', accentHex: '#f43f5e' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base">Display & Theme Preferences</h2>
              <p className="text-xs text-slate-400">Customize day/night mode, color palette & sizing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-5 space-y-5 text-xs">
          
          {/* 1. Day / Night Mode */}
          <div className="space-y-2">
            <label className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Day / Night Appearance:</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'dark', label: 'Night (Dark)', icon: Moon },
                { id: 'light', label: 'Day (Light)', icon: Sun },
                { id: 'system', label: 'System Auto', icon: Monitor },
              ].map(opt => {
                const Icon = opt.icon;
                const isSelected = settings.mode === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => onUpdateSettings({ ...settings, mode: opt.id as ThemeMode })}
                    className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[11px]">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Color Theme Selection */}
          <div className="space-y-2">
            <label className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-indigo-400" />
              <span>Color Theme Palette:</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {colorThemes.map(theme => {
                const isSelected = settings.colorTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => onUpdateSettings({ ...settings, colorTheme: theme.id })}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      isSelected
                        ? `${theme.borderClass} bg-slate-800/90 ring-1 ring-white/20 font-bold text-white`
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800'
                    }`}
                    title={theme.name}
                  >
                    <div className={`w-5 h-5 rounded-full bg-gradient-to-tr ${theme.bgClass} flex items-center justify-center shadow-sm`}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-[10px] truncate max-w-full">{theme.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Font Size Option */}
          <div className="space-y-2">
            <label className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-cyan-400" />
              <span>Interface Font Size:</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'small', label: 'Compact', sample: 'Aa' },
                { id: 'medium', label: 'Default', sample: 'Aa' },
                { id: 'large', label: 'Comfortable', sample: 'Aa' },
              ].map(opt => {
                const isSelected = settings.fontSize === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => onUpdateSettings({ ...settings, fontSize: opt.id as FontSizeSetting })}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-slate-800 border-cyan-500 text-cyan-300 font-bold shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className={opt.id === 'small' ? 'text-xs' : opt.id === 'medium' ? 'text-sm' : 'text-base'}>
                      {opt.sample}
                    </div>
                    <span className="text-[10px] block mt-0.5">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Button Size Option */}
          <div className="space-y-2">
            <label className="text-slate-400 font-semibold flex items-center gap-1.5">
              <MousePointerClick className="w-3.5 h-3.5 text-emerald-400" />
              <span>Action Button Size:</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'compact', label: 'Compact' },
                { id: 'medium', label: 'Balanced' },
                { id: 'spacious', label: 'Spacious / Touch' },
              ].map(opt => {
                const isSelected = settings.buttonSize === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => onUpdateSettings({ ...settings, buttonSize: opt.id as ButtonSizeSetting })}
                    className={`p-2.5 rounded-xl border text-center text-[11px] transition-all ${
                      isSelected
                        ? 'bg-slate-800 border-cyan-500 text-cyan-300 font-bold shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/20 transition-all"
          >
            Apply & Close
          </button>

        </div>

      </div>
    </div>
  );
};
