import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VoiceOrb } from './components/VoiceOrb';
import { ControlPanel } from './components/ControlPanel';
import { OrbState } from './types';
import { INITIAL_CONFIG, STATE_ORDER } from './constants';
import { twMerge } from 'tailwind-merge';
import { PanelRightClose, PanelRightOpen, Keyboard } from 'lucide-react';

const DEMO_INTERVAL = 3000;
const SIZE_ORDER: Array<'hero' | 'float' | 'mini'> = ['hero', 'float', 'mini'];

export default function App() {
  const [currentState, setCurrentState] = useState<OrbState>('idle');
  const [config, setConfig] = useState(INITIAL_CONFIG);
  const [size, setSize] = useState<'hero' | 'float' | 'mini'>('hero');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const demoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const demoStepRef = useRef(0);

  // Demo mode auto-cycle — runs through all states + sizes once, then resets to idle/hero
  useEffect(() => {
    if (demoMode) {
      // Start from idle + hero
      setCurrentState(STATE_ORDER[0]);
      setSize(SIZE_ORDER[0]);
      demoStepRef.current = 0;

      demoRef.current = setInterval(() => {
        demoStepRef.current += 1;
        if (demoStepRef.current >= STATE_ORDER.length) {
          // Completed one full cycle — reset to idle/hero and stop
          setCurrentState('idle');
          setSize('hero');
          setDemoMode(false);
        } else {
          setCurrentState(STATE_ORDER[demoStepRef.current]);
          setSize(SIZE_ORDER[demoStepRef.current % SIZE_ORDER.length]);
        }
      }, DEMO_INTERVAL);
    } else {
      if (demoRef.current) clearInterval(demoRef.current);
    }
    return () => {
      if (demoRef.current) clearInterval(demoRef.current);
    };
  }, [demoMode]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      switch (e.key) {
        case '1':
          setCurrentState('idle');
          setDemoMode(false);
          break;
        case '2':
          setCurrentState('listening');
          setDemoMode(false);
          break;
        case '3':
          setCurrentState('processing');
          setDemoMode(false);
          break;
        case '4':
          setCurrentState('speaking');
          setDemoMode(false);
          break;
        case '5':
          setCurrentState('error');
          setDemoMode(false);
          break;
        case ' ':
          e.preventDefault();
          setDemoMode((prev) => !prev);
          break;
        case 'Escape':
          setShowShortcuts(false);
          break;
        case '?':
          setShowShortcuts((prev) => !prev);
          break;
        case 'Tab':
          if (!e.shiftKey) {
            e.preventDefault();
            setSidebarOpen((prev) => !prev);
          }
          break;
      }
    },
    []
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Ambient background color from current state
  const stateColors = config[currentState];

  return (
    <div className="flex h-screen w-full bg-neutral-950 overflow-hidden text-white font-sans selection:bg-blue-500/30">
      {/* Main Canvas Area */}
      <main className="flex-1 relative flex flex-col items-center justify-center min-w-0">
        {/* Dynamic ambient background glow */}
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-1000 ease-out"
          style={{
            background: `radial-gradient(circle at center, ${stateColors.colorB}12 0%, ${stateColors.colorA}08 40%, transparent 70%)`,
          }}
        />
        {/* Secondary glow ring */}
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-1500 ease-out"
          style={{
            background: `radial-gradient(circle at center, transparent 20%, ${stateColors.colorC}06 50%, transparent 80%)`,
          }}
        />

        <div className="absolute inset-0">
          <VoiceOrb
            currentState={currentState}
            config={config}
            size={size}
          />
        </div>

        {/* Branding top-left */}
        <div className="absolute top-6 left-8 flex items-center gap-3 pointer-events-none select-none">
          <div className="relative">
            <div
              className="w-8 h-8 rounded-full transition-colors duration-700"
              style={{
                background: `linear-gradient(135deg, ${stateColors.colorB}, ${stateColors.colorC})`,
                boxShadow: `0 0 20px ${stateColors.colorB}40`,
              }}
            />
            <div className="absolute inset-0 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm" />
          </div>
          <div>
            <div className="text-sm tracking-[0.2em] text-white/90 uppercase">Aura</div>
            <div className="text-[9px] tracking-[0.15em] text-white/30 uppercase">Voice Orb Demonstrator</div>
          </div>
        </div>

        {/* Top-right controls */}
        <div className="absolute top-6 right-8 flex items-center gap-2 z-20">
          {/* Shortcuts hint */}
          <button
            onClick={() => setShowShortcuts((p) => !p)}
            className="p-2 rounded-lg text-neutral-500 hover:text-white hover:bg-white/10 transition-all"
            title="View all keyboard shortcuts — 1-5 for states, Space for demo, Tab for sidebar (?)"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* Sidebar toggle */}
          <button
            onClick={() => setSidebarOpen((p) => !p)}
            className="p-2 rounded-lg text-neutral-500 hover:text-white hover:bg-white/10 transition-all"
            title={sidebarOpen ? 'Hide control panel (Tab)' : 'Show control panel (Tab)'}
          >
            {sidebarOpen ? (
              <PanelRightClose className="w-4 h-4" />
            ) : (
              <PanelRightOpen className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Status Text Overlay */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center gap-2">
          <div
            className={twMerge(
              'text-[10px] font-mono tracking-[0.3em] uppercase transition-colors duration-500',
              currentState === 'listening'
                ? 'text-amber-400'
                : currentState === 'processing'
                  ? 'text-violet-400'
                  : currentState === 'speaking'
                    ? 'text-emerald-400'
                    : currentState === 'error'
                      ? 'text-red-400'
                      : 'text-blue-400'
            )}
          >
            {currentState}
          </div>

          {/* Demo mode indicator */}
          {demoMode && (
            <div className="text-[9px] font-mono tracking-wider text-white/30 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              {STATE_ORDER.indexOf(currentState) + 1} / {STATE_ORDER.length} · {size}
            </div>
          )}

          {/* Decorative dots */}
          {!demoMode && (
            <div className="flex gap-1.5 opacity-50">
              <div
                className="w-1 h-1 rounded-full bg-current animate-pulse"
                style={{ animationDelay: '0ms' }}
              />
              <div
                className="w-1 h-1 rounded-full bg-current animate-pulse"
                style={{ animationDelay: '150ms' }}
              />
              <div
                className="w-1 h-1 rounded-full bg-current animate-pulse"
                style={{ animationDelay: '300ms' }}
              />
            </div>
          )}
        </div>

        {/* Quick state pills at bottom-left */}
        <div className="absolute bottom-6 left-8 flex items-center gap-1.5">
          {STATE_ORDER.map((state, i) => (
            <button
              key={state}
              onClick={() => {
                setCurrentState(state);
                setDemoMode(false);
              }}
              className={twMerge(
                'px-2 py-1 rounded text-[9px] font-mono uppercase tracking-wider transition-all',
                currentState === state
                  ? 'bg-white/15 text-white'
                  : 'text-white/20 hover:text-white/50 hover:bg-white/5'
              )}
              title={`${state} (${i + 1})`}
            >
              {state.slice(0, 3)}
            </button>
          ))}
        </div>

      </main>

      {/* Right Sidebar */}
      <aside
        className={twMerge(
          'h-full z-10 shrink-0 transition-all duration-300 ease-in-out overflow-hidden',
          sidebarOpen ? 'w-80' : 'w-0'
        )}
      >
        <div className="w-80 h-full">
          <ControlPanel
            currentState={currentState}
            setCurrentState={(state) => {
              setCurrentState(state);
              setDemoMode(false);
            }}
            config={config}
            setConfig={setConfig}
            size={size}
            setSize={setSize}
            demoMode={demoMode}
            setDemoMode={setDemoMode}
          />
        </div>
      </aside>

      {/* Keyboard shortcuts modal */}
      {showShortcuts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowShortcuts(false)}
          />
          <div className="relative bg-neutral-900 border border-white/10 rounded-2xl p-6 w-80 shadow-2xl">
            <h3 className="text-white text-xs tracking-widest uppercase mb-4 flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-blue-400" />
              Keyboard Shortcuts
            </h3>
            <div className="space-y-2">
              {[
                ['1 – 5', 'Switch states'],
                ['Space', 'Toggle demo mode'],
                ['Tab', 'Toggle sidebar'],
                ['?', 'This dialog'],
                ['Esc', 'Close dialog'],
              ].map(([key, desc]) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-1.5"
                >
                  <kbd className="px-2 py-0.5 bg-neutral-800 border border-white/10 rounded text-[10px] font-mono text-neutral-300">
                    {key}
                  </kbd>
                  <span className="text-[11px] text-neutral-400">{desc}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowShortcuts(false)}
              className="w-full mt-5 py-2 text-xs text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}