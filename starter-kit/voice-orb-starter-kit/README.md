# Voice Orb Starter Kit

This package helps you quickly add the Aura Voice Orb to your own React app.

## Included

- `src/voice-orb/components/VoiceOrb.tsx`
- `src/voice-orb/components/Canvas2DOrb.tsx`
- `src/voice-orb/components/OrbShaders.ts`
- `src/voice-orb/types.ts`
- `src/voice-orb/constants.ts`

## Quick Start

1. Install dependency in your app:

```bash
npm install three
```

2. Copy `src/voice-orb` into your project.

3. Render the component in a sized parent:

```tsx
import { useState } from 'react';
import { VoiceOrb } from './voice-orb/components/VoiceOrb';
import { INITIAL_CONFIG } from './voice-orb/constants';
import type { OrbState } from './voice-orb/types';

export default function AssistantView() {
  const [state, setState] = useState<OrbState>('idle');

  return (
    <section style={{ position: 'relative', width: '100%', height: 420 }}>
      <VoiceOrb currentState={state} config={INITIAL_CONFIG} size="hero" />
    </section>
  );
}
```

## State Mapping

- `idle`: waiting
- `listening`: microphone active
- `processing`: AI processing
- `speaking`: TTS/playback
- `error`: failure state

For full docs, see `docs/voice-orb-integration-guide.md` in the main repo.
