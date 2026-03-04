import React, { useState, useRef } from 'react';
import { X, Copy, Check, FileCode } from 'lucide-react';
import { OrbState, OrbStateConfig } from '../types';

interface CodeExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: Record<OrbState, OrbStateConfig>;
  currentState: OrbState;
  size: 'hero' | 'float' | 'mini';
}

function generateFullComponent(config: Record<OrbState, OrbStateConfig>): string {
  return `// ═══════════════════════════════════════════════════════════
// Aura — A complete, self-contained animated 3D orb component
// Built with React + Three.js + custom GLSL shaders
// 
// Dependencies: npm install three @types/three react
// Usage: <Aura state="idle" />
// ═══════════════════════════════════════════════════════════

import React, { useRef, useEffect } from "react";
import * as THREE from "three";

// ── Types ──
export type OrbState = "idle" | "listening" | "processing" | "speaking" | "error";

export interface OrbStateConfig {
  colorA: string;
  colorB: string;
  colorC: string;
  speed: number;
  intensity: number;
}

// ── Default State Configs (customize these!) ──
const DEFAULT_CONFIG: Record<OrbState, OrbStateConfig> = ${JSON.stringify(config, null, 2)};

// ── GLSL Vertex Shader ──
const vertexShader = \`
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vViewPosition;

uniform float uTime;
uniform float uSpeed;
uniform float uIntensity;

void main() {
  vUv = uv;
  vPosition = position;
  vec4 viewPos = modelViewMatrix * vec4(position, 1.0);
  vViewPosition = viewPos.xyz;
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * viewPos;
}
\`;

// ── GLSL Fragment Shader (fBm noise + Fresnel) ──
const fragmentShader = \`
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vViewPosition;

uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uIntensity;

vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0/7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}

float fbm(vec3 x) {
  float v = 0.0; float a = 0.5; vec3 shift = vec3(100.0);
  for (int i = 0; i < 3; ++i) { v += a * snoise(x); x = x * 2.0 + shift; a *= 0.5; }
  return v;
}

void main() {
  float noise = fbm(vPosition * uIntensity + vec3(uTime * uSpeed));
  float n = noise * 0.5 + 0.5;
  vec3 color = mix(uColorA, uColorB, n);
  float glow = smoothstep(0.4, 0.9, n);
  color = mix(color, uColorC, glow);
  vec3 viewDir = normalize(-vViewPosition);
  float fresnelTerm = pow(clamp(1.0 - dot(viewDir, vNormal), 0.0, 1.0), 2.5);
  color += uColorC * fresnelTerm * 1.5;
  gl_FragColor = vec4(color, 1.0);
}
\`;

// ── Component Props ──
interface AuraProps {
  state?: OrbState;
  config?: Record<OrbState, OrbStateConfig>;
  className?: string;
}

// ── Aura Component ──
export function Aura({
  state = "idle",
  config = DEFAULT_CONFIG,
  className = "",
}: AuraProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ state, config });
  stateRef.current = { state, config };

  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    mesh: THREE.Mesh;
    material: THREE.ShaderMaterial;
    animationId: number;
    clock: THREE.Clock;
    currentValues: {
      colorA: THREE.Color;
      colorB: THREE.Color;
      colorC: THREE.Color;
      speed: number;
      intensity: number;
    };
    spherical: { theta: number; phi: number; radius: number };
    targetSpherical: { theta: number; phi: number; radius: number };
    isDragging: boolean;
    previousMouse: { x: number; y: number };
  } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = container.clientWidth;
    const h = container.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    const initialRadius = 6;
    camera.position.set(0, 0, initialRadius);

    const geometry = new THREE.IcosahedronGeometry(1, 10);
    const cfg = config[state];
    const material = new THREE.ShaderMaterial({
      vertexShader, fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColorA: { value: new THREE.Color(cfg.colorA) },
        uColorB: { value: new THREE.Color(cfg.colorB) },
        uColorC: { value: new THREE.Color(cfg.colorC) },
        uSpeed: { value: cfg.speed },
        uIntensity: { value: cfg.intensity },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(2.5, 2.5, 2.5);
    scene.add(mesh);

    const clock = new THREE.Clock();
    const currentValues = {
      colorA: new THREE.Color(cfg.colorA),
      colorB: new THREE.Color(cfg.colorB),
      colorC: new THREE.Color(cfg.colorC),
      speed: cfg.speed,
      intensity: cfg.intensity,
    };

    const s = {
      renderer, scene, camera, mesh, material,
      animationId: 0, clock, currentValues,
      spherical: { theta: 0, phi: Math.PI / 2, radius: initialRadius },
      targetSpherical: { theta: 0, phi: Math.PI / 2, radius: initialRadius },
      isDragging: false,
      previousMouse: { x: 0, y: 0 },
    };
    sceneRef.current = s;

    const animate = () => {
      const dt = s.clock.getDelta();
      const { state: st, config: cf } = stateRef.current;
      const tgt = cf[st];
      const lf = 5.0 * dt;

      s.currentValues.colorA.lerp(new THREE.Color(tgt.colorA), lf);
      s.currentValues.colorB.lerp(new THREE.Color(tgt.colorB), lf);
      s.currentValues.colorC.lerp(new THREE.Color(tgt.colorC), lf);
      s.currentValues.speed = THREE.MathUtils.lerp(s.currentValues.speed, tgt.speed, lf);
      s.currentValues.intensity = THREE.MathUtils.lerp(s.currentValues.intensity, tgt.intensity, lf);

      s.material.uniforms.uTime.value += dt;
      s.material.uniforms.uColorA.value.copy(s.currentValues.colorA);
      s.material.uniforms.uColorB.value.copy(s.currentValues.colorB);
      s.material.uniforms.uColorC.value.copy(s.currentValues.colorC);
      s.material.uniforms.uSpeed.value = s.currentValues.speed;
      s.material.uniforms.uIntensity.value = s.currentValues.intensity;

      s.mesh.rotation.y += dt * 0.2 * s.currentValues.speed;
      s.mesh.rotation.z += dt * 0.1 * s.currentValues.speed;

      if (st === "processing") s.targetSpherical.theta += dt * 2.0;

      s.spherical.theta += (s.targetSpherical.theta - s.spherical.theta) * Math.min(1, dt * 5);
      s.spherical.phi += (s.targetSpherical.phi - s.spherical.phi) * Math.min(1, dt * 5);
      s.spherical.radius += (s.targetSpherical.radius - s.spherical.radius) * Math.min(1, dt * 5);
      s.spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, s.spherical.phi));
      s.spherical.radius = Math.max(3, Math.min(10, s.spherical.radius));

      const r = s.spherical.radius;
      s.camera.position.set(
        r * Math.sin(s.spherical.phi) * Math.sin(s.spherical.theta),
        r * Math.cos(s.spherical.phi),
        r * Math.sin(s.spherical.phi) * Math.cos(s.spherical.theta),
      );
      s.camera.lookAt(0, 0, 0);

      s.renderer.render(s.scene, s.camera);
      s.animationId = requestAnimationFrame(animate);
    };

    animate();

    const onResize = () => {
      const nw = container.clientWidth, nh = container.clientHeight;
      s.renderer.setSize(nw, nh);
      s.camera.aspect = nw / nh;
      s.camera.updateProjectionMatrix();
    };
    const onDown = (e: MouseEvent) => { s.isDragging = true; s.previousMouse = { x: e.clientX, y: e.clientY }; };
    const onMove = (e: MouseEvent) => { if (!s.isDragging) return; s.targetSpherical.theta -= (e.clientX - s.previousMouse.x) * 0.005; s.targetSpherical.phi += (e.clientY - s.previousMouse.y) * 0.005; s.previousMouse = { x: e.clientX, y: e.clientY }; };
    const onUp = () => { s.isDragging = false; };
    const onWheel = (e: WheelEvent) => { e.preventDefault(); s.targetSpherical.radius += e.deltaY * 0.005; };

    window.addEventListener("resize", onResize);
    container.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    container.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      cancelAnimationFrame(s.animationId);
      s.renderer.dispose();
      s.material.dispose();
      s.mesh.geometry.dispose();
      if (container.contains(s.renderer.domElement)) container.removeChild(s.renderer.domElement);
      window.removeEventListener("resize", onResize);
      container.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      container.removeEventListener("wheel", onWheel);
    };
  }, []);

  return <div ref={containerRef} className={className} style={{ width: "100%", height: "100%" }} />;
}

export default Aura;
`;
}

function generateConfigJSON(config: Record<OrbState, OrbStateConfig>): string {
  return JSON.stringify(config, null, 2);
}

export function CodeExportModal({ isOpen, onClose, config, currentState, size }: CodeExportModalProps) {
  const [activeTab, setActiveTab] = useState<'component' | 'config'>('component');
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLPreElement>(null);

  if (!isOpen) return null;

  const code = activeTab === 'component'
    ? generateFullComponent(config)
    : generateConfigJSON(config);

  const doCopy = () => {
    // Try clipboard API, fall back to execCommand
    const tryClipboard = async () => {
      try {
        await navigator.clipboard.writeText(code);
        setCopied(true);
      } catch {
        fallbackCopy();
      }
    };

    const fallbackCopy = () => {
      const textarea = document.createElement('textarea');
      textarea.value = code;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      try { document.execCommand('copy'); setCopied(true); } catch { /* noop */ }
      document.body.removeChild(textarea);
    };

    tryClipboard();
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-[90vw] max-w-3xl max-h-[85vh] bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <FileCode className="w-5 h-5 text-blue-400" />
            <h2 className="text-white text-sm tracking-wide">Export Aura</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 shrink-0">
          <button
            onClick={() => setActiveTab('component')}
            className={`px-4 py-2 rounded-t-lg text-xs transition-all ${
              activeTab === 'component'
                ? 'bg-neutral-800 text-white border border-white/10 border-b-neutral-800'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Full Component (.tsx)
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2 rounded-t-lg text-xs transition-all ${
              activeTab === 'config'
                ? 'bg-neutral-800 text-white border border-white/10 border-b-neutral-800'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Config Only (.json)
          </button>
        </div>

        {/* Info banner */}
        <div className="mx-6 mt-0 px-4 py-2.5 bg-blue-500/10 border border-blue-500/20 rounded-b-lg rounded-tr-lg text-[11px] text-blue-300 shrink-0">
          {activeTab === 'component' ? (
            <>
              Drop-in React component. Requires <code className="bg-blue-500/20 px-1 rounded">three</code> and <code className="bg-blue-500/20 px-1 rounded">@types/three</code>.
              Includes all GLSL shaders, types, state configs, orbit controls.
            </>
          ) : (
            <>
              Your customized color/speed/intensity configuration for all 5 states.
              Import this into the Aura component as the <code className="bg-blue-500/20 px-1 rounded">config</code> prop.
            </>
          )}
        </div>

        {/* Code */}
        <div className="flex-1 overflow-auto mx-6 my-4 rounded-lg bg-neutral-950 border border-white/5">
          <pre
            ref={codeRef}
            className="p-4 text-[11px] text-neutral-300 font-mono whitespace-pre overflow-x-auto"
            style={{ tabSize: 2 }}
          >
            {code}
          </pre>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-neutral-900/80 shrink-0">
          <p className="text-[10px] text-neutral-600 font-mono">
            {activeTab === 'component' ? '~280 lines' : `${Object.keys(config).length} states`} • Aura v1.0.0
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs text-neutral-400 hover:text-white transition-colors"
            >
              Close
            </button>
            <button
              onClick={doCopy}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-neutral-950 rounded-lg text-xs hover:bg-neutral-200 transition-all active:scale-[0.98]"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}