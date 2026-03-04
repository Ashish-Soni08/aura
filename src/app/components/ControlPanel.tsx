import React, { useState, useRef } from 'react';
import {
  Mic,
  Activity,
  Volume2,
  AlertTriangle,
  Circle,
  Code,
  Monitor,
  Smartphone,
  Minimize,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import { OrbState, OrbStateConfig } from '../types';
import { twMerge } from 'tailwind-merge';
import { CodeExportModal } from './CodeExportModal';
import { INITIAL_CONFIG } from '../constants';

interface ControlPanelProps {
  currentState: OrbState;
  setCurrentState: (state: OrbState) => void;
  config: Record<OrbState, OrbStateConfig>;
  setConfig: (config: Record<OrbState, OrbStateConfig>) => void;
  size: 'hero' | 'float' | 'mini';
  setSize: (size: 'hero' | 'float' | 'mini') => void;
  demoMode: boolean;
  setDemoMode: (mode: boolean) => void;
}

const STATE_ICONS = {
  idle: Circle,
  listening: Mic,
  processing: Activity,
  speaking: Volume2,
  error: AlertTriangle,
};

const STATE_LABELS = {
  idle: 'Idle',
  listening: 'Listening',
  processing: 'Processing',
  speaking: 'Speaking',
  error: 'Error',
};

const STATE_KEYS = {
  idle: '1',
  listening: '2',
  processing: '3',
  speaking: '4',
  error: '5',
};

export function ControlPanel({
  currentState,
  setCurrentState,
  config,
  setConfig,
  size,
  setSize,
  demoMode,
  setDemoMode,
}: ControlPanelProps) {
  const [showExport, setShowExport] = useState(false);
  const colorInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleColorChange = (key: keyof OrbStateConfig, value: string) => {
    setConfig({
      ...config,
      [currentState]: {
        ...config[currentState],
        [key]: value,
      },
    });
  };

  const resetCurrentState = () => {
    setConfig({
      ...config,
      [currentState]: { ...INITIAL_CONFIG[currentState] },
    });
  };

  const resetAllStates = () => {
    setConfig({ ...INITIAL_CONFIG });
  };

  const isCurrentModified =
    JSON.stringify(config[currentState]) !==
    JSON.stringify(INITIAL_CONFIG[currentState]);

  return (
    <>
      <div className="w-80 h-full bg-neutral-900/50 backdrop-blur-xl border-l border-white/10 flex flex-col font-sans text-neutral-200">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-xs tracking-widest text-neutral-400 uppercase flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Control Panel
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* State Simulator */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs text-neutral-500 uppercase tracking-wider">
                State Simulator
              </h3>
              {/* Demo mode toggle */}
              <button
                onClick={() => setDemoMode(!demoMode)}
                className={twMerge(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] transition-all',
                  demoMode
                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    : 'bg-white/5 text-neutral-500 hover:bg-white/10 hover:text-neutral-300'
                )}
                title="Auto-cycle through all states & sizes once (Space)"
              >
                {demoMode ? (
                  <Pause className="w-3 h-3" />
                ) : (
                  <Play className="w-3 h-3" />
                )}
                {demoMode ? 'Stop' : 'Demo'}
              </button>
            </div>
            <div className="space-y-1.5">
              {(Object.keys(STATE_ICONS) as OrbState[]).map((state) => {
                const Icon = STATE_ICONS[state];
                const isActive = currentState === state;
                return (
                  <button
                    key={state}
                    onClick={() => setCurrentState(state)}
                    className={twMerge(
                      'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 group relative',
                      isActive
                        ? 'bg-white/10 text-white shadow-lg shadow-white/5'
                        : 'hover:bg-white/5 text-neutral-400 hover:text-white'
                    )}
                  >
                    <Icon
                      className={twMerge(
                        'w-4 h-4',
                        isActive
                          ? 'text-blue-400'
                          : 'text-neutral-500 group-hover:text-neutral-300'
                      )}
                    />
                    <span className="flex-1 text-left">{STATE_LABELS[state]}</span>
                    <span className="text-[9px] font-mono text-neutral-600 group-hover:text-neutral-500">
                      {STATE_KEYS[state]}
                    </span>
                    {isActive && (
                      <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)] animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Orb Size */}
          <section>
            <h3 className="text-xs text-neutral-500 uppercase tracking-wider mb-4">
              Orb Size
            </h3>
            <div className="grid grid-cols-3 gap-2 bg-neutral-950/50 p-1 rounded-lg border border-white/5">
              {[
                { id: 'hero', label: 'Hero', icon: Monitor, hint: 'Full-screen centerpiece' },
                { id: 'float', label: 'Float', icon: Minimize, hint: 'Medium floating widget' },
                { id: 'mini', label: 'Mini', icon: Smartphone, hint: 'Compact inline indicator' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSize(item.id as 'hero' | 'float' | 'mini')}
                  className={twMerge(
                    'flex flex-col items-center justify-center gap-1.5 py-2 rounded-md text-[10px] transition-all',
                    size === item.id
                      ? 'bg-neutral-800 text-white shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-300'
                  )}
                  title={item.hint}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              ))}
            </div>
          </section>

          {/* Color Config */}
          <section>
            <h3 className="text-xs text-neutral-500 uppercase tracking-wider mb-4 flex justify-between items-center">
              <span className="flex items-center gap-2">
                Color Config
                {isCurrentModified && (
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400" title="Modified" />
                )}
              </span>
              <span className="text-[10px] normal-case bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-400 font-mono">
                {STATE_LABELS[currentState]}
              </span>
            </h3>

            <div className="space-y-4">
              {[
                { key: 'colorA', label: 'Primary (Dark)' },
                { key: 'colorB', label: 'Secondary (Light)' },
                { key: 'colorC', label: 'Core (Glow)' },
              ].map((field) => (
                <div key={field.key} className="group">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs text-neutral-400 group-hover:text-neutral-300 transition-colors">
                      {field.label}
                    </label>
                    <span className="text-[10px] font-mono text-neutral-600">
                      {config[currentState][field.key as keyof OrbStateConfig]}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Clickable swatch with native color picker */}
                    <div className="relative shrink-0">
                      <div
                        className="w-8 h-8 rounded-full shadow-inner border border-white/10 cursor-pointer hover:ring-2 hover:ring-white/20 transition-all"
                        style={{
                          backgroundColor: config[currentState][
                            field.key as keyof OrbStateConfig
                          ] as string,
                        }}
                        onClick={() =>
                          colorInputRefs.current[field.key]?.click()
                        }
                      />
                      <input
                        ref={(el) => {
                          colorInputRefs.current[field.key] = el;
                        }}
                        type="color"
                        value={
                          config[currentState][
                            field.key as keyof OrbStateConfig
                          ] as string
                        }
                        onChange={(e) =>
                          handleColorChange(
                            field.key as keyof OrbStateConfig,
                            e.target.value
                          )
                        }
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                    <input
                      type="text"
                      value={
                        config[currentState][
                          field.key as keyof OrbStateConfig
                        ] as string
                      }
                      onChange={(e) =>
                        handleColorChange(
                          field.key as keyof OrbStateConfig,
                          e.target.value
                        )
                      }
                      className="w-full bg-neutral-950/50 border border-white/10 rounded px-3 py-2 text-xs font-mono text-neutral-300 focus:outline-none focus:border-blue-500/50 focus:bg-neutral-900 transition-all"
                      placeholder="#RRGGBB"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Reset button */}
            {isCurrentModified && (
              <button
                onClick={resetCurrentState}
                className="mt-3 flex items-center gap-1.5 text-[10px] text-neutral-500 hover:text-amber-400 transition-colors"
                title={`Revert ${STATE_LABELS[currentState]}'s colors, speed & intensity to original defaults`}
              >
                <RotateCcw className="w-3 h-3" />
                Reset {STATE_LABELS[currentState]} to defaults
              </button>
            )}
          </section>

          {/* Speed / Intensity sliders */}
          <section>
            <h3 className="text-xs text-neutral-500 uppercase tracking-wider mb-4">
              Animation
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-xs text-neutral-400">Speed</label>
                  <span className="text-[10px] font-mono text-neutral-600">
                    {config[currentState].speed.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={config[currentState].speed}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      [currentState]: {
                        ...config[currentState],
                        speed: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="w-full h-1 bg-neutral-800 rounded-full appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-xs text-neutral-400">Intensity</label>
                  <span className="text-[10px] font-mono text-neutral-600">
                    {config[currentState].intensity.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="2"
                  step="0.1"
                  value={config[currentState].intensity}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      [currentState]: {
                        ...config[currentState],
                        intensity: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="w-full h-1 bg-neutral-800 rounded-full appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-white/5 bg-neutral-900/80 backdrop-blur-md space-y-3">
          <button
            onClick={() => setShowExport(true)}
            className="w-full flex items-center justify-center gap-2 bg-white text-neutral-950 py-3 rounded-lg text-sm hover:bg-neutral-200 transition-all active:scale-[0.98]"
            title="Copy a self-contained React + Three.js component with your current config"
          >
            <Code className="w-4 h-4" />
            Export Component
          </button>
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-neutral-600 font-mono">
              v1.0.0 · Aura
            </p>
            <button
              onClick={resetAllStates}
              className="text-[10px] text-neutral-600 hover:text-amber-400 font-mono transition-colors flex items-center gap-1"
              title="Revert all 5 states to original default colors, speed & intensity"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              Reset all
            </button>
          </div>
        </div>
      </div>

      <CodeExportModal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        config={config}
        currentState={currentState}
        size={size}
      />
    </>
  );
}