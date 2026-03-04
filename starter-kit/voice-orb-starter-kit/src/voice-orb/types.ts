export type OrbState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

export interface OrbStateConfig {
  colorA: string;
  colorB: string;
  colorC: string;
  speed: number;
  intensity: number;
}
