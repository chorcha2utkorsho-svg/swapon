import React, { useState, useRef, useEffect } from 'react';
import { AIModel } from '../types';
import { AI_MODELS } from '../constants/models';
import { ChevronDown, Sparkles, Check, Zap, Cpu } from 'lucide-react';

interface ModelSelectorProps {
  selectedModelId: string;
  onSelectModel: (modelId: string) => void;
  label?: string;
  compact?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModelId,
  onSelectModel,
  label,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedModel = AI_MODELS.find((m) => m.id === selectedModelId) || AI_MODELS[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Group models by provider
  const googleModels = AI_MODELS.filter((m) => m.provider === 'google');
  const openAIModels = AI_MODELS.filter((m) => m.provider === 'openai');
  const anthropicModels = AI_MODELS.filter((m) => m.provider === 'anthropic');
  const openRouterModels = AI_MODELS.filter((m) => m.provider === 'openrouter');

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {label && <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">{label}</span>}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-xl transition-all border ${
          compact
            ? 'px-2.5 py-1.5 text-xs bg-slate-900/80 hover:bg-slate-800 border-slate-700/80'
            : 'px-3 py-2 text-xs font-semibold bg-slate-800/90 hover:bg-slate-750 border-slate-700 shadow-sm'
        } text-white`}
      >
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
          style={{ backgroundColor: selectedModel.color }}
        />
        <span className="font-semibold truncate max-w-[140px] sm:max-w-[180px]">{selectedModel.name}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-700/80 text-slate-300 font-medium hidden xs:inline">
          {selectedModel.badge}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 sm:w-80 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl z-50 p-2 text-xs text-slate-200 max-h-[75vh] overflow-y-auto animate-in fade-in slide-in-from-top-2">
          <div className="px-3 py-2 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Select AI Engine</span>
            <span className="text-[10px] text-slate-500 font-normal">Switch seamlessly</span>
          </div>

          {/* Group 1: Google Gemini */}
          <div className="pt-2">
            <div className="px-2.5 py-1 text-[10px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              <span>Google Gemini</span>
            </div>
            {googleModels.map((model) => (
              <ModelItem
                key={model.id}
                model={model}
                isSelected={model.id === selectedModelId}
                onSelect={() => {
                  onSelectModel(model.id);
                  setIsOpen(false);
                }}
              />
            ))}
          </div>

          {/* Group 2: OpenAI */}
          <div className="pt-2">
            <div className="px-2.5 py-1 text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3 h-3" />
              <span>OpenAI</span>
            </div>
            {openAIModels.map((model) => (
              <ModelItem
                key={model.id}
                model={model}
                isSelected={model.id === selectedModelId}
                onSelect={() => {
                  onSelectModel(model.id);
                  setIsOpen(false);
                }}
              />
            ))}
          </div>

          {/* Group 3: Anthropic */}
          <div className="pt-2">
            <div className="px-2.5 py-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3 h-3" />
              <span>Anthropic</span>
            </div>
            {anthropicModels.map((model) => (
              <ModelItem
                key={model.id}
                model={model}
                isSelected={model.id === selectedModelId}
                onSelect={() => {
                  onSelectModel(model.id);
                  setIsOpen(false);
                }}
              />
            ))}
          </div>

          {/* Group 4: OpenRouter / DeepSeek */}
          <div className="pt-2">
            <div className="px-2.5 py-1 text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              <span>DeepSeek / OpenRouter</span>
            </div>
            {openRouterModels.map((model) => (
              <ModelItem
                key={model.id}
                model={model}
                isSelected={model.id === selectedModelId}
                onSelect={() => {
                  onSelectModel(model.id);
                  setIsOpen(false);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface ModelItemProps {
  model: AIModel;
  isSelected: boolean;
  onSelect: () => void;
}

const ModelItem: React.FC<ModelItemProps> = ({ model, isSelected, onSelect }) => {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-start justify-between p-2.5 rounded-xl transition text-left group ${
        isSelected ? 'bg-sky-500/15 text-white' : 'hover:bg-slate-800 text-slate-300'
      }`}
    >
      <div className="flex items-start gap-2.5">
        <span
          className="w-2.5 h-2.5 rounded-full mt-1 shrink-0"
          style={{ backgroundColor: model.color }}
        />
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-white">{model.name}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-medium">
              {model.badge}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{model.description}</p>
        </div>
      </div>
      {isSelected && <Check className="w-4 h-4 text-sky-400 shrink-0 mt-0.5 ml-2" />}
    </button>
  );
};
