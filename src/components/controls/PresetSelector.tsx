import React from 'react';
import { PRESET_PROFILES } from '../../constants/riskModifiers.ts';
import type { PresetProfile, RiskProfileSelections } from '../../types/riskModel.types.ts';

interface PresetSelectorProps {
  currentSelections: RiskProfileSelections;
  onSelectPreset: (preset: PresetProfile) => void;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  currentSelections,
  onSelectPreset,
}) => {
  const isPresetActive = (preset: PresetProfile): boolean => {
    return Object.entries(preset.selections).every(
      ([key, value]) => currentSelections[key as keyof RiskProfileSelections] === value
    );
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#25F4EE]" />
          TikTok Shop Buyer Personas (1-Click Test)
        </span>
        <span className="text-[10px] font-mono text-slate-400">Tiers 1–4</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {PRESET_PROFILES.map((preset) => {
          const active = isPresetActive(preset);
          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`text-left p-2.5 rounded-xl border transition-all duration-200 group flex flex-col justify-between cursor-pointer ${
                active
                  ? 'bg-[#1F1F23] border-[#25F4EE] shadow-sm shadow-[#25F4EE]/10 ring-1 ring-[#25F4EE]/40'
                  : 'bg-[#0c0c0e]/90 hover:bg-[#1F1F23]/80 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-bold text-white group-hover:text-[#25F4EE] transition-colors truncate">
                  {preset.name}
                </span>
                {active && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-[#25F4EE]/15 text-[#25F4EE] border border-[#25F4EE]/30">
                    ACTIVE
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between mt-1 w-full text-[10px]">
                <span
                  className={`font-semibold inline-flex items-center gap-1.5 ${
                    preset.color === 'emerald'
                      ? 'text-emerald-400'
                      : preset.color === 'amber'
                      ? 'text-amber-400'
                      : preset.color === 'orange'
                      ? 'text-orange-400'
                      : 'text-[#FE2C55]'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      preset.color === 'emerald'
                        ? 'bg-emerald-400'
                        : preset.color === 'amber'
                        ? 'bg-amber-400'
                        : preset.color === 'orange'
                        ? 'bg-orange-400'
                        : 'bg-[#FE2C55]'
                    }`}
                  />
                  {preset.badge}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
