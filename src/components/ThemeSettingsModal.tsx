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
  Sparkles,
  Sliders
} from 'lucide-react';
import { 
  ThemeSettings, 
  ThemeMode, 
  ColorTheme, 
  FontSizeSetting, 
  FontFamilySetting,
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

  const fontFamilies: { id: FontFamilySetting; name: string; sample: string; desc: string }[] = [
    { id: 'inter', name: 'Inter UI', sample: 'Aa Bb Cc', desc: 'Modern Clean Sans' },
    { id: 'jakarta', name: 'Plus Jakarta', sample: 'Aa Bb Cc', desc: 'Premium Geometric' },
    { id: 'space_grotesk', name: 'Space Grotesk', sample: 'Aa Bb Cc', desc: 'Tech & Modernist' },
    { id: 'roboto', name: 'Roboto', sample: 'Aa Bb Cc', desc: 'Google Standard' },
    { id: 'jetbrains', name: 'JetBrains Mono', sample: 'Aa 123 =>', desc: 'Developer Monospace' },
    { id: 'system', name: 'System UI', sample: 'Aa Bb Cc', desc: 'Native OS Default' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base">Appearance & Theme Settings</h2>
              <p className="text-xs text-slate-400">Customize Day/Night mode, typography font, size & palette</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-5 space-y-5 text-xs overflow-y-auto">
          
          {/* 1. Day / Night Mode */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Day / Night Appearance:</span>
              </label>
              <span className="text-[10px] text-slate-400">Current: {settings.mode.toUpperCase()}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'dark', label: 'Night (Dark)', desc: 'Slate & Obsidian', icon: Moon },
                { id: 'light', label: 'Day (Light)', desc: 'Crisp & Clean', icon: Sun },
                { id: 'system', label: 'System Auto', desc: 'Sync with OS', icon: Monitor },
              ].map(opt => {
                const Icon = opt.icon;
                const isSelected = settings.mode === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => onUpdateSettings({ ...settings, mode: opt.id as ThemeMode })}
                    className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold shadow-sm ring-1 ring-cyan-500/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[11px] font-semibold">{opt.label}</span>
                    <span className="text-[9px] text-slate-400">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Font Family Selection */}
          <div className="space-y-2">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-cyan-400" />
              <span>Typography Font Family:</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {fontFamilies.map(f => {
                const isSelected = (settings.fontFamily || 'inter') === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => onUpdateSettings({ ...settings, fontFamily: f.id })}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-cyan-950/70 border-cyan-500 text-cyan-300 font-bold shadow-sm ring-1 ring-cyan-500/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-white">{f.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block mt-1">{f.sample}</span>
                    <span className="text-[9px] text-slate-400 block">{f.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Font Size Option */}
          <div className="space-y-2">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>Interface Font Scaling:</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'small', label: 'Compact', sample: 'Aa (13px)' },
                { id: 'medium', label: 'Regular', sample: 'Aa (14px)' },
                { id: 'large', label: 'Large', sample: 'Aa (15.5px)' },
                { id: 'xlarge', label: 'X-Large', sample: 'Aa (17px)' },
              ].map(opt => {
                const isSelected = settings.fontSize === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => onUpdateSettings({ ...settings, fontSize: opt.id as FontSizeSetting })}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-slate-800 border-cyan-500 text-cyan-300 font-bold shadow-sm ring-1 ring-cyan-500/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-xs font-semibold">{opt.label}</div>
                    <span className="text-[10px] block mt-0.5 text-slate-400">{opt.sample}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Color Theme Selection */}
          <div className="space-y-2">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-emerald-400" />
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

          {/* 5. Button Size Option */}
          <div className="space-y-2">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <MousePointerClick className="w-3.5 h-3.5 text-cyan-400" />
              <span>Button & Touch Target Size:</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'compact', label: 'Compact', desc: 'Dense desktop' },
                { id: 'medium', label: 'Balanced', desc: 'Standard UI' },
                { id: 'spacious', label: 'Touch / Spacious', desc: 'Comfortable tap' },
              ].map(opt => {
                const isSelected = settings.buttonSize === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => onUpdateSettings({ ...settings, buttonSize: opt.id as ButtonSizeSetting })}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-slate-800 border-cyan-500 text-cyan-300 font-bold shadow-sm ring-1 ring-cyan-500/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-[11px] font-semibold">{opt.label}</div>
                    <span className="text-[9px] text-slate-400 block">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/20 transition-all cursor-pointer"
          >
            Apply & Save Preferences
          </button>

        </div>

      </div>
    </div>
  );
};
