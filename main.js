import * as THREE from "three";
import { EffectComposer }  from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass }       from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass }  from "three/addons/postprocessing/UnrealBloomPass.js";
import { blackHoleFragmentShader } from "./shaders/blackhole.frag.js";

// ════════════════════════════════════════════════════════
//  RENDERER
// ════════════════════════════════════════════════════════
const scene  = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
const renderer = new THREE.WebGLRenderer({ antialias:false, preserveDrawingBuffer:true, powerPreference:"high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ════════════════════════════════════════════════════════
//  SHADER
// ════════════════════════════════════════════════════════
const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const uniforms = {
  uResolution:   { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  uTime:         { value: 0 },
  uCamPos:       { value: new THREE.Vector3() },
  uCamRight:     { value: new THREE.Vector3() },
  uCamUp:        { value: new THREE.Vector3() },
  uCamForward:   { value: new THREE.Vector3() },
  uFov:          { value: 1.12 },
  uLensStrength: { value: 1.45 },
  uDiskPower:    { value: 1.02 },
  uExposure:     { value: 1.02 },
  uSpinWarp:     { value: 0.55 },
  uDiskTilt:     { value: 0.62 },
  uJetPower:     { value: 0.06 },
  uPhotonEcho:   { value: 0.78 },
  uShadowPower:  { value: 0.78 },
  uUltra:        { value: 0.0 },
  uQualitySteps: { value: 180.0 },
  uPresetMood:   { value: 0.0 },
  uFocusMode:    { value: 0.0 },
  uSplitMode:    { value: 0.0 },
  uMatterPulse:  { value: 0.0 },
  uObservatoryMode: { value: 0.0 },
  uDiskHaze:     { value: 0.60 },
  uLensDirt:     { value: 0.05 },
  uSecondaryImage: { value: 0.58 },
  uTraverseMode: { value: 0.0 },
  uCloudDensity: { value: 0.78 }
};

const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader:blackHoleFragmentShader, uniforms, depthWrite:false, depthTest:false });
scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2), material));

// ════════════════════════════════════════════════════════
//  POST-PROCESSING
// ════════════════════════════════════════════════════════
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.58, 0.46, 0.24);
composer.addPass(bloom);

// ════════════════════════════════════════════════════════
//  DOM REFS
// ════════════════════════════════════════════════════════
const els = {
  hud:          document.getElementById("hud"),
  controls:     document.getElementById("controls"),
  info:         document.getElementById("infoCard"),
  fps:          document.getElementById("fps"),
  mode:         document.getElementById("hudMode"),
  dist:         document.getElementById("hudDistance"),
  minR:         document.getElementById("hudMinR"),
  doppler:      document.getElementById("hudDoppler"),
  temp:         document.getElementById("hudTemp"),
  quality:      document.getElementById("hudQuality"),
  directorLabel:document.getElementById("directorLabel"),
  photon:       document.getElementById("hudPhoton"),
  rayOverlay:   document.getElementById("rayOverlay"),
  particleCanvas:document.getElementById("particleCanvas"),
  tooltip:      document.getElementById("tooltip"),
  ttTitle:      document.getElementById("ttTitle"),
  ttBody:       document.getElementById("ttBody"),
  hudTD:        document.getElementById("hudTD"),
  hudHawking:   document.getElementById("hudHawking"),
  hudPeriod:    document.getElementById("hudPeriod"),
  hudOmega:     document.getElementById("hudOmega"),
  proxFill:     document.getElementById("proximityFill"),
  horizonWarn:  document.getElementById("horizonWarning"),
  horizonDist:  document.getElementById("horizonDist"),
  gwIndicator:  document.getElementById("gwIndicator"),
  partIndicator:document.getElementById("particleIndicator"),
  gwBtn:        document.getElementById("gwBtn"),
  particleBtn:  document.getElementById("particleBtn"),
  fallingBtn:   document.getElementById("fallingBtn"),
  measureBtn:   document.getElementById("measureBtn"),
  splitBtn:     document.getElementById("splitBtn"),
  audioBtn:     document.getElementById("audioBtn"),
  missionBtn:   document.getElementById("missionBtn"),
  observatoryBtn: document.getElementById("presetObservatory"),
  telescopeBtn: document.getElementById("telescopeBtn"),
  captureBadge: document.getElementById("captureBadge"),
  musicBadge: document.getElementById("musicBadge"),
  musicBtn: document.getElementById("musicBtn"),
  loadMusicBtn: document.getElementById("loadMusicBtn"),
  musicFile: document.getElementById("musicFile"),
  traverseBtn: document.getElementById("traverseBtn"),
  traverseBadge: document.getElementById("traverseBadge"),
  introCard: document.getElementById("introCard"),
  labStatus:    document.getElementById("labStatus")
};

// ════════════════════════════════════════════════════════
//  ORBIT STATE
// ════════════════════════════════════════════════════════
const orbit = {
  yaw:0, pitch:0.28, radius:7.3,
  targetYaw:0, targetPitch:0.28, targetRadius:7.3,
  mode:"cinematic", dragging:false, lastX:0, lastY:0,
  director:false, shot:0, shotStart:0, photonLab:false
};
const worldUp=new THREE.Vector3(0,1,0), camPos=new THREE.Vector3();
const forward=new THREE.Vector3(), right=new THREE.Vector3(), up=new THREE.Vector3();
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smoothstep=(a,b,x)=>{ const t=clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };

// ════════════════════════════════════════════════════════
//  APP STATE
// ════════════════════════════════════════════════════════
const state = {
  particles:  true,
  gravWave:   false,
  infalling:  false,
  infallingT: 0,        // how long we've been in infalling mode
  measurement: false,
  split: false,
  audio: false,
  mission: false,
  missionStart: 0,
  missionStage: -1,
  matterPulse: 0,
  observatory: false,
  telescope: false,
  beauty: false,
  music: false,
  localMusic: false,
  traverse: false,
  traverseHeight: 0.15,
  lookPreset: "cinematic"
};

// ════════════════════════════════════════════════════════
//  PHYSICS HELPERS
//  RS = 1 in our normalized units,  M = 0.5
//  BH mass displayed = 10⁸ M☉  (supermassive)
// ════════════════════════════════════════════════════════

// Black hole apparent shadow radius in screen pixels
function bhPx() {
  // b_crit (Schwarzschild) = 3√3·M = 3√3·0.5 ≈ 2.598
  // In our uFov-scaled UV space: shadow_uv = b_crit / camRadius
  // Shadow in pixels: shadow_uv / uFov * (screenH/2)
  const b = 2.598;
  return (b / orbit.radius) / uniforms.uFov.value * (window.innerHeight * 0.5);
}

// Schwarzschild time dilation at radius r (normalized, rs=1)
function timeDilation(r) {
  return Math.sqrt(Math.max(0, 1 - 1.0 / Math.max(r, 1.001)));
}

// Frame-drag angular velocity at horizon (Kerr)
// Ω_H = a·c / (2·M·r_+) in geometric units
// With a*=0.998, M=0.5, r_+ ≈ 0.532:  Ω_H ≈ 0.998·0.5/(2·0.5·0.532) ≈ 0.938 c/rs
// Display as fraction of c/rs
function frameDragOmega() {
  const a = uniforms.uSpinWarp.value * 0.998; // spin param 0–0.998
  const rH = 0.5 * (1 + Math.sqrt(1 - a*a));
  if (rH < 0.001) return 0;
  return (a * 0.5) / (2 * 0.5 * rH);
}

// ════════════════════════════════════════════════════════
//  ORBITAL PARTICLE SYSTEM
//  Physics: Keplerian ω ∝ r⁻³/², slow inward spiral
//  Color: blackbody-inspired temperature gradient
// ════════════════════════════════════════════════════════
const PCOUNT  = 380;
const TRAIL_N = 22;
const parts   = [];

function particleColor(r, bhR) {
  const t = (r - bhR) / bhR;
  if (t < 0.15) return [110, 170, 255];  // blue-white  (near ISCO)
  if (t < 0.50) return [255, 225, 155];  // yellow-white
  if (t < 1.20) return [255, 135, 40];   // orange
  if (t < 2.50) return [220, 65, 18];    // red-orange
  return [155, 35, 8];                    // dim red outer
}

function spawnParticle(r, a) {
  return { r, a, decay:0.04+Math.random()*0.07, trail:[], click:false };
}

function initParticles() {
  parts.length = 0;
  const bhR = bhPx();
  for (let i = 0; i < PCOUNT; i++) {
    const r = bhR * (1.12 + Math.random() * 5.2);
    parts.push(spawnParticle(r, Math.random() * Math.PI * 2));
  }
}

function addParticleBurst(sx, sy, count = 18) {
  const cx = window.innerWidth  * 0.5;
  const cy = window.innerHeight * 0.5;
  const dx = sx - cx, dy = sy - cy;
  const r  = Math.sqrt(dx*dx + dy*dy);
  const a  = Math.atan2(dy, dx);
  for (let i = 0; i < count; i++) {
    const rv = r * (0.82 + Math.random() * 0.36);
    const av = a + (Math.random() - 0.5) * 0.55;
    const p  = spawnParticle(rv, av);
    p.click  = true;
    parts.push(p);
  }
}

let lastPartTime = 0;
function drawParticles(t) {
  const pcv = els.particleCanvas;
  if (!pcv || !state.particles) {
    // If particles just turned off, clear canvas
    if (pcv) { const ctx=pcv.getContext('2d'); ctx.clearRect(0,0,pcv.width,pcv.height); }
    return;
  }

  const ctx = pcv.getContext('2d');
  const W   = window.innerWidth, H = window.innerHeight;
  const cx  = W * 0.5, cy = H * 0.5;
  const bhR = bhPx();
  const dt  = Math.min(t - lastPartTime, 0.05);
  lastPartTime = t;

  // Motion blur: alpha-fill instead of clearRect  → trails persist
  ctx.fillStyle = state.traverse ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.14)';
  ctx.fillRect(0, 0, W, H);

  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];

    // Keplerian orbit: ω = ω₀ · (bhR/r)^1.5
    const omega  = (state.traverse ? 1.95 : 1.45) * Math.pow(bhR / p.r, 1.5);
    p.a += omega * dt;

    // Inward spiral: drift rate increases near center
    p.r -= p.decay * Math.pow(bhR / p.r, 1.8) * dt;

    const x = cx + p.r * Math.cos(p.a);
    const y = cy + p.r * Math.sin(p.a);

    p.trail.unshift({ x, y });
    if (p.trail.length > TRAIL_N) p.trail.pop();

    // Particle crossed horizon — respawn at outer edge
    if (p.r < bhR * 0.94) {
      const newR = bhR * (3.2 + Math.random() * 3.8);
      parts[i] = spawnParticle(newR, Math.random() * Math.PI * 2);
      continue;
    }

    // Remove click-burst particles that go out of bounds
    if (p.click && p.r > bhR * 8) { parts.splice(i, 1); continue; }

    if (p.trail.length < 2) continue;

    const [cr, cg, cb] = particleColor(p.r, bhR);
    // Brightness: full at inner, fades at outer
    const bright = Math.min(1, (p.r / bhR - 1) * 0.6 + 0.05);
    const sz     = Math.max(0.3, bhR / 70 * (1 - (p.r - bhR) / (bhR * 7)));

    // Draw trail as tapered line
    if (p.trail.length >= 2) {
      ctx.beginPath();
      ctx.moveTo(p.trail[0].x, p.trail[0].y);
      for (let j = 1; j < p.trail.length; j++) ctx.lineTo(p.trail[j].x, p.trail[j].y);
      const ta = Math.min(0.9, bright * 0.75);
      ctx.strokeStyle = `rgba(${cr},${cg},${cb},${ta})`;
      ctx.lineWidth   = Math.max(0.25, sz * 1.1);
      ctx.shadowColor = `rgba(${cr},${cg},${cb},0.6)`;
      ctx.shadowBlur  = 4;
      ctx.stroke();
      ctx.shadowBlur  = 0;
    }

    // Head dot glow
    ctx.beginPath();
    ctx.arc(x, y, Math.max(0.4, sz * 1.6), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${cr},${cg},${cb},${Math.min(1, bright * 1.1)})`;
    ctx.shadowColor = `rgba(${cr},${cg},${cb},0.7)`;
    ctx.shadowBlur  = 6;
    ctx.fill();
    ctx.shadowBlur  = 0;
  }
}

// ════════════════════════════════════════════════════════
//  GRAVITATIONAL WAVE RINGS
//  Expanding concentric rings from BH, simulating GW
// ════════════════════════════════════════════════════════
const GW_RINGS   = 7;
const GW_SPEED   = 90;   // pixels per second
const GW_PERIOD  = 1.65; // seconds between rings

function drawGWRings(ctx, t) {
  if (!state.gravWave) return;

  const W   = window.innerWidth, H = window.innerHeight;
  const cx  = W * 0.5, cy = H * 0.5;
  const bhR = bhPx();
  const maxR = Math.sqrt(cx*cx + cy*cy) * 1.2;

  for (let i = 0; i < GW_RINGS; i++) {
    const phase  = ((t / GW_PERIOD + i / GW_RINGS) % 1.0);
    const radius = bhR * 0.95 + phase * maxR;
    const fade   = Math.pow(1.0 - phase, 1.8);
    const alpha  = fade * 0.25;
    if (alpha < 0.004) continue;

    // Outer blue ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(90,180,255,${alpha})`;
    ctx.lineWidth   = 2.0 * fade;
    ctx.shadowColor = 'rgba(80,160,255,0.5)';
    ctx.shadowBlur  = 10 * fade;
    ctx.stroke();
    ctx.shadowBlur  = 0;

    // Inner golden ring (slightly behind)
    if (radius > bhR * 1.5) {
      const ri = radius * 0.92;
      ctx.beginPath();
      ctx.arc(cx, cy, ri, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,180,60,${alpha * 0.5})`;
      ctx.lineWidth   = 1.2 * fade;
      ctx.stroke();
    }
  }
}

// ════════════════════════════════════════════════════════
//  PHOTON PATHS (existing, slightly cleaned)
// ════════════════════════════════════════════════════════
function drawPhotonPaths(ctx, t) {
  if (!orbit.photonLab) return;

  const W   = window.innerWidth, H = window.innerHeight;
  const cx  = W * 0.5, cy = H * 0.5;
  const base = bhPx() * 0.72;

  ctx.lineCap = "round"; ctx.lineJoin = "round";
  for (let i = 0; i < 9; i++) {
    const side  = i % 2 === 0 ? 1 : -1;
    const lane  = Math.floor(i / 2);
    const phase = t * 0.55 + i * 0.73;
    const impact = base * (1.05 + lane * 0.23 + 0.035 * Math.sin(phase));
    const x0 = -W * 0.10, y0 = cy + side * (impact + Math.sin(phase) * 12);
    const x3 = W  *  1.10, y3 = cy - side * (impact * 0.70 + Math.cos(phase) * 14);
    const wrap = base * (0.92 + 0.10 * Math.sin(phase * 1.7));
    const c1x = cx - wrap * (2.0 + lane * 0.17), c1y = cy + side * wrap * (1.4 + lane * 0.18);
    const c2x = cx + wrap * (2.0 + lane * 0.12), c2y = cy - side * wrap * (1.18 + lane * 0.15);
    const al  = Math.max(0.10, 0.34 - lane * 0.055);

    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.bezierCurveTo(c1x,c1y,c2x,c2y,x3,y3);
    ctx.strokeStyle = `rgba(${lane<2?135:255},${lane<2?210:190},${lane<2?255:90},${al})`;
    ctx.lineWidth   = Math.max(0.65, 1.35 - lane * 0.13);
    ctx.shadowColor = lane<2 ? "rgba(95,190,255,.55)" : "rgba(255,185,90,.45)";
    ctx.shadowBlur  = 9 - lane; ctx.stroke(); ctx.shadowBlur = 0;
  }

  // Photon sphere guide circle
  ctx.beginPath(); ctx.arc(cx, cy, base * 0.92, 0, Math.PI*2);
  ctx.strokeStyle = "rgba(255,210,120,.18)"; ctx.lineWidth = 1;
  ctx.shadowBlur  = 12; ctx.shadowColor = "rgba(255,190,80,.25)"; ctx.stroke(); ctx.shadowBlur = 0;
}

// ════════════════════════════════════════════════════════
//  OVERLAY CANVAS  (rayOverlay — GW rings + photon paths)
// ════════════════════════════════════════════════════════
function resizeRayOverlay() {
  const dpr = Math.min(window.devicePixelRatio||1, 2);
  [els.rayOverlay].forEach(cvs => {
    if (!cvs) return;
    cvs.width  = Math.floor(window.innerWidth  * dpr);
    cvs.height = Math.floor(window.innerHeight * dpr);
    cvs.style.width  = `${window.innerWidth}px`;
    cvs.style.height = `${window.innerHeight}px`;
    cvs.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
  });
}

function resizeParticleCanvas() {
  const pcv = els.particleCanvas;
  if (!pcv) return;
  const dpr = Math.min(window.devicePixelRatio||1, 2);
  pcv.width  = Math.floor(window.innerWidth  * dpr);
  pcv.height = Math.floor(window.innerHeight * dpr);
  pcv.style.width  = `${window.innerWidth}px`;
  pcv.style.height = `${window.innerHeight}px`;
  pcv.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
}


// ════════════════════════════════════════════════════════
//  EVENT HORIZON LAB — interactive photon beams + matter
// ════════════════════════════════════════════════════════
const photonShots = [];
const matterBursts = [];
let audioCtx = null, audioMaster = null, audioOsc = null, audioLfo = null;

// ════════════════════════════════════════════════════════
//  CINEMATIC SCORE — original Web Audio organ/space ambience
//  No copyrighted audio is bundled.
// ════════════════════════════════════════════════════════
let musicMaster = null;
let musicFilter = null;
let musicDelay = null;
let musicFeedback = null;
let musicOscs = [];
let localAudio = null;
let localSource = null;

function ensureMusicGraph() {
  ensureAudio();
  if (musicMaster) return;

  musicMaster = audioCtx.createGain();
  musicMaster.gain.value = 0.0;

  musicFilter = audioCtx.createBiquadFilter();
  musicFilter.type = "lowpass";
  musicFilter.frequency.value = 980;
  musicFilter.Q.value = 0.7;

  musicDelay = audioCtx.createDelay(2.5);
  musicDelay.delayTime.value = 0.42;

  musicFeedback = audioCtx.createGain();
  musicFeedback.gain.value = 0.28;

  const dry = audioCtx.createGain();
  dry.gain.value = 0.78;

  const wet = audioCtx.createGain();
  wet.gain.value = 0.28;

  musicFilter.connect(dry);
  dry.connect(musicMaster);

  musicFilter.connect(musicDelay);
  musicDelay.connect(musicFeedback);
  musicFeedback.connect(musicDelay);
  musicDelay.connect(wet);
  wet.connect(musicMaster);

  musicMaster.connect(audioCtx.destination);

  // Organ-like cinematic chord; original synthesized audio.
  const notes = [36.71, 55.00, 73.42, 110.00, 146.83, 220.00];
  musicOscs = notes.map((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const detune = [-7, 3, -2, 5, -4, 2][i];

    osc.type = i < 2 ? "sine" : "triangle";
    osc.frequency.value = freq;
    osc.detune.value = detune;

    gain.gain.value = i < 2 ? 0.12 : 0.045;

    osc.connect(gain);
    gain.connect(musicFilter);
    osc.start();

    return { osc, gain, base: freq, phase: Math.random() * Math.PI * 2 };
  });
}

function toggleMusic(force) {
  ensureMusicGraph();
  const next = typeof force === "boolean" ? force : !state.music;
  state.music = next;

  if (audioCtx.state === "suspended") audioCtx.resume();

  // Music is routed directly to destination so it works even if Hum mode is off.
  const target = next ? 0.62 : 0.0;
  musicMaster.gain.cancelScheduledValues(audioCtx.currentTime);
  musicMaster.gain.setTargetAtTime(target, audioCtx.currentTime, 0.45);

  if (localAudio) {
    localAudio.volume = next ? 0.82 : 0.0;
    if (next) localAudio.play().catch(() => {});
    else localAudio.pause();
  }

  setLabStatus(next ? (state.localMusic ? "LOCAL SOUNDTRACK PLAYING" : "CINEMATIC SCORE ENABLED") : "CINEMATIC SCORE OFF");
  updateModeButtons(state.lookPreset);
}

function updateMusic(t) {
  if (!musicMaster || !state.music || state.localMusic) return;

  const proximity = clamp(1.0 - (orbit.radius - 1.0) / 12.0, 0.0, 1.0);
  const intensity = proximity * 0.55 + uniforms.uSpinWarp.value * 0.20 + uniforms.uDiskPower.value * 0.10;
  const cutoff = 520 + 1450 * intensity + (state.gravWave ? Math.sin(t * 2.0) * 180 : 0);
  musicFilter.frequency.setTargetAtTime(cutoff, audioCtx.currentTime, 0.10);

  musicOscs.forEach((voice, i) => {
    const drift = Math.sin(t * (0.07 + i * 0.013) + voice.phase) * (0.25 + i * 0.05);
    voice.osc.detune.setTargetAtTime(drift, audioCtx.currentTime, 0.20);

    const breathe = 0.72 + 0.28 * Math.sin(t * (0.05 + i * 0.011) + voice.phase);
    const baseGain = i < 2 ? 0.12 : 0.045;
    voice.gain.gain.setTargetAtTime(baseGain * breathe * (0.75 + intensity * 0.45), audioCtx.currentTime, 0.25);
  });
}

function loadLocalMusicFile(file) {
  if (!file) return;
  ensureMusicGraph();

  if (localAudio) {
    localAudio.pause();
    localAudio.src = "";
  }

  const url = URL.createObjectURL(file);
  localAudio = new Audio(url);
  localAudio.loop = true;
  localAudio.volume = 0.0;

  try {
    localSource = audioCtx.createMediaElementSource(localAudio);
    localSource.connect(musicFilter);
  } catch (err) {
    // Non-fatal if a browser blocks reconnecting a media element.
  }

  state.localMusic = true;
  toggleMusic(true);
}



function setLabStatus(text) {
  if (!els.labStatus) return;
  els.labStatus.textContent = text;
  els.labStatus.classList.add('flash');
  setTimeout(() => els.labStatus?.classList.remove('flash'), 550);
}

function launchPhotonBeam(sx, sy, fan=false) {
  const cx = window.innerWidth * 0.5, cy = window.innerHeight * 0.5;
  const dx = sx - cx, dy = sy - cy;
  const impact = Math.sqrt(dx*dx + dy*dy);
  const angle = Math.atan2(dy, dx);
  const count = fan ? 7 : 1;
  for (let i = 0; i < count; i++) {
    const spread = fan ? (i - (count-1)/2) * 0.095 : 0;
    photonShots.push({
      birth: clock.getElapsedTime(),
      life: 3.4,
      impact: Math.max(bhPx()*0.65, impact * (0.82 + Math.random()*0.22)),
      angle: angle + spread,
      captured: impact < bhPx() * (1.1 + Math.random()*0.5),
      hue: fan ? i / Math.max(1, count-1) : 0.55
    });
  }
  setLabStatus(fan ? 'PHOTON FAN LAUNCHED' : 'PHOTON TRAJECTORY LAUNCHED');
  pulseAudio(0.08, 440 + Math.random()*120);
}

function injectMatter(sx, sy, strength=1.0) {
  const now = clock.getElapsedTime();
  matterBursts.push({ birth: now, life: 4.8, x: sx, y: sy, strength });
  uniforms.uMatterPulse.value = Math.max(uniforms.uMatterPulse.value, 0.85 * strength);
  state.matterPulse = Math.max(state.matterPulse, 1.0 * strength);
  if (state.particles) addParticleBurst(sx, sy, Math.floor(22 * strength));
  state.gravWave = true;
  updateModeButtons('');
  setLabStatus('MATTER INJECTION // DISK FLARE');
  pulseAudio(0.18, 88);
}

function drawPhotonBeams(ctx, t) {
  if (photonShots.length === 0) return;
  const W = window.innerWidth, H = window.innerHeight;
  const cx = W * 0.5, cy = H * 0.5;
  const base = bhPx() * 0.78;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (let i = photonShots.length - 1; i >= 0; i--) {
    const p = photonShots[i];
    const age = t - p.birth;
    const q = age / p.life;
    if (q > 1) { photonShots.splice(i,1); continue; }
    const fade = Math.sin(Math.min(1,q) * Math.PI) * (1 - Math.max(0,q-0.82)/0.18);
    const impact = Math.max(base * 1.05, p.impact * 0.72);
    const side = Math.sign(Math.sin(p.angle)) || 1;
    const y0 = cy + side * (impact + Math.sin(p.angle)*14);
    const y3 = p.captured ? cy + side * base * 0.15 : cy - side * impact * 0.55;
    const x0 = W * -0.08;
    const x3 = p.captured ? cx + Math.cos(p.angle)*base*0.28 : W * 1.08;
    const wrap = base * (1.05 + 0.45 * (1.0 - Math.min(1, impact/(base*5.0))));
    const c1x = cx - wrap*2.5, c1y = cy + side*wrap*1.85;
    const c2x = cx + wrap*1.4, c2y = cy - side*wrap*1.28;
    const grad = ctx.createLinearGradient(x0,y0,x3,y3);
    grad.addColorStop(0, `rgba(80,190,255,0)`);
    grad.addColorStop(0.45, `rgba(125,220,255,${0.52*fade})`);
    grad.addColorStop(0.72, `rgba(255,210,105,${0.44*fade})`);
    grad.addColorStop(1, `rgba(255,120,70,${p.captured ? 0.0 : 0.32*fade})`);
    ctx.beginPath(); ctx.moveTo(x0,y0); ctx.bezierCurveTo(c1x,c1y,c2x,c2y,x3,y3);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.2 + 2.1*fade;
    ctx.shadowColor = 'rgba(90,190,255,.8)';
    ctx.shadowBlur = 18 * fade;
    ctx.stroke();
    ctx.shadowBlur = 0;
    if (p.captured) {
      ctx.beginPath();
      ctx.arc(cx, cy, base*(0.70+0.15*Math.sin(t*7.0+i)), 0, Math.PI*2);
      ctx.strokeStyle = `rgba(255,155,70,${0.28*fade})`;
      ctx.lineWidth = 1.0;
      ctx.stroke();
    }
  }
}

function drawMatterBursts(ctx, t) {
  if (!matterBursts.length) return;
  for (let i = matterBursts.length - 1; i >= 0; i--) {
    const b = matterBursts[i];
    const age = t - b.birth;
    const q = age / b.life;
    if (q > 1) { matterBursts.splice(i,1); continue; }
    const ring = 18 + q * bhPx() * 1.9;
    const fade = (1-q) * b.strength;
    ctx.beginPath();
    ctx.arc(b.x, b.y, ring, 0, Math.PI*2);
    ctx.strokeStyle = `rgba(255,180,70,${0.38*fade})`;
    ctx.lineWidth = 2.0 * fade;
    ctx.shadowColor = 'rgba(255,130,40,.65)';
    ctx.shadowBlur = 22 * fade;
    ctx.stroke();
    ctx.shadowBlur = 0;
    const pull = Math.min(1, q*1.4);
    const cx = window.innerWidth * 0.5, cy = window.innerHeight * 0.5;
    const x = b.x + (cx-b.x)*pull*0.62;
    const y = b.y + (cy-b.y)*pull*0.62;
    ctx.beginPath();
    ctx.arc(x, y, Math.max(1, 5*(1-q))*b.strength, 0, Math.PI*2);
    ctx.fillStyle = `rgba(120,210,255,${0.45*fade})`;
    ctx.fill();
  }
}

function drawMeasurementOverlay(ctx, t) {
  if (!state.measurement) return;
  const W=window.innerWidth, H=window.innerHeight, cx=W*0.5, cy=H*0.5;
  const bhR = bhPx();
  const rings = [
    { r: bhR*0.72, color:'rgba(255,70,45,.42)', label:'EVENT HORIZON' },
    { r: bhR*0.98, color:'rgba(255,205,90,.36)', label:'PHOTON SPHERE' },
    { r: bhR*1.55, color:'rgba(95,180,255,.30)', label:'ISCO / INNER DISK' },
    { r: bhR*2.35, color:'rgba(180,110,255,.20)', label:'FRAME DRAG REGION' }
  ];
  ctx.save();
  ctx.setLineDash([8, 8]);
  ctx.font = '9px Courier New, monospace';
  ctx.textBaseline = 'middle';
  for (const ring of rings) {
    ctx.beginPath(); ctx.arc(cx, cy, ring.r, 0, Math.PI*2);
    ctx.strokeStyle = ring.color; ctx.lineWidth = 1.1; ctx.stroke();
    ctx.fillStyle = ring.color.replace(/rgba\(([^)]+),[^,]+\)$/,'rgba($1,.72)');
    ctx.fillText(ring.label, cx + ring.r + 10, cy - ring.r*0.18);
  }
  ctx.setLineDash([]);
  ctx.beginPath(); ctx.moveTo(cx-bhR*2.8, cy); ctx.lineTo(cx+bhR*2.8, cy);
  ctx.moveTo(cx, cy-bhR*2.8); ctx.lineTo(cx, cy+bhR*2.8);
  ctx.strokeStyle='rgba(120,200,255,.13)'; ctx.stroke();
  ctx.restore();
}

function ensureAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  audioMaster = audioCtx.createGain();
  audioMaster.gain.value = 0.0;
  audioMaster.connect(audioCtx.destination);
  audioOsc = audioCtx.createOscillator();
  audioOsc.type = 'sine';
  audioOsc.frequency.value = 52;
  audioLfo = audioCtx.createOscillator();
  const lfoGain = audioCtx.createGain();
  audioLfo.frequency.value = 0.12;
  lfoGain.gain.value = 6;
  audioLfo.connect(lfoGain); lfoGain.connect(audioOsc.frequency);
  audioOsc.connect(audioMaster); audioOsc.start(); audioLfo.start();
}
function toggleAudio() {
  ensureAudio();
  state.audio = !state.audio;
  audioMaster.gain.setTargetAtTime(state.audio ? 0.035 : 0.0, audioCtx.currentTime, 0.06);
  updateModeButtons('');
  setLabStatus(state.audio ? 'GRAVITATIONAL HUM ENABLED' : 'AUDIO OFF');
}
function pulseAudio(amount=0.08, freq=120) {
  if (!state.audio) return;
  ensureAudio();
  const t = audioCtx.currentTime;
  audioOsc.frequency.setTargetAtTime(freq, t, 0.015);
  audioMaster.gain.cancelScheduledValues(t);
  audioMaster.gain.setValueAtTime(Math.min(0.12, audioMaster.gain.value + amount), t);
  audioMaster.gain.setTargetAtTime(0.035, t + 0.08, 0.25);
}

function drawOverlays(t) {
  const ovl = els.rayOverlay;
  if (!ovl) return;
  const ctx = ovl.getContext('2d');
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  drawGWRings(ctx, t);
  drawPhotonPaths(ctx, t);
  drawPhotonBeams(ctx, t);
  drawMatterBursts(ctx, t);
  drawMeasurementOverlay(ctx, t);

  // Show overlay canvas if any lab overlay is active
  ovl.classList.toggle('on', state.gravWave || orbit.photonLab || state.measurement || photonShots.length || matterBursts.length);
}

// ════════════════════════════════════════════════════════
//  HOVER TOOLTIP
// ════════════════════════════════════════════════════════
const REGIONS = {
  shadow:      { title:"EVENT HORIZON",    body:"Inside here escape velocity > c.\nTime appears frozen to outside observers.\nAnything crossing never returns." },
  photon_ring: { title:"PHOTON SPHERE",    body:"Photons orbit the BH exactly once before\nescaping. r ≈ 1.5 rₛ (Schwarzschild).\nThis ring forms the bright edge of the shadow." },
  disk:        { title:"ACCRETION DISK",   body:"Plasma at 4,000 – 55,000 K orbiting at up\nto 0.84c. Left side blue-shifted (approaching),\nright side dim and red-shifted (receding)." },
  jet:         { title:"RELATIVISTIC JET", body:"Magnetically-confined plasma column\nejected perpendicular to the disk.\nSpeed ≈ 0.99c (Lorentz factor ~7)." },
  stars:       { title:"BACKGROUND STARS", body:"Gravitational lensing bends starlight.\nEinstein ring forms at impact parameter\nb = 3√3 M ≈ 5.2 rₛ from BH center." }
};

let mouseX = 0, mouseY = 0, tooltipTimer = null;

function detectRegion(mx, my) {
  const cx  = window.innerWidth  * 0.5;
  const cy  = window.innerHeight * 0.5;
  const dx  = mx - cx, dy = my - cy;
  const r   = Math.sqrt(dx*dx + dy*dy);
  const bhR = bhPx();

  if (r < bhR * 0.92)  return 'shadow';
  if (r < bhR * 1.10)  return 'photon_ring';
  if (r < bhR * 5.0 && Math.abs(dy) < bhR * 2.5) return 'disk';
  if (r < bhR * 2.0 && Math.abs(dy) > bhR * 1.6)  return 'jet';
  return 'stars';
}

function showTooltip(region, mx, my) {
  const tt = els.tooltip;
  if (!tt) return;
  const info = REGIONS[region];
  if (!info) return;
  els.ttTitle.textContent = info.title;
  els.ttBody.textContent  = info.body;

  // Position tooltip near mouse, avoid edges
  const W = window.innerWidth, H = window.innerHeight;
  let tx = mx + 18, ty = my - 10;
  if (tx + 250 > W) tx = mx - 260;
  if (ty + 100 > H) ty = my - 115;
  tt.style.left = `${tx}px`;
  tt.style.top  = `${ty}px`;
  tt.classList.add('on');
}

function hideTooltip() {
  els.tooltip?.classList.remove('on');
}

window.addEventListener('mousemove', e => {
  mouseX = e.clientX; mouseY = e.clientY;
  clearTimeout(tooltipTimer);
  tooltipTimer = setTimeout(() => {
    if (!orbit.dragging) {
      const region = detectRegion(mouseX, mouseY);
      showTooltip(region, mouseX, mouseY);
    }
  }, 600); // show after 600ms hover
  if (orbit.dragging) hideTooltip();
});
window.addEventListener('mouseleave', hideTooltip);

// ════════════════════════════════════════════════════════
//  CLICK → PARTICLE BURST
// ════════════════════════════════════════════════════════
renderer.domElement.addEventListener('click', e => {
  if (orbit.dragging) return;
  const bhR = bhPx();
  const cx  = window.innerWidth  * 0.5;
  const cy  = window.innerHeight * 0.5;
  const dx  = e.clientX - cx, dy = e.clientY - cy;
  const r   = Math.sqrt(dx*dx + dy*dy);

  if (e.shiftKey || e.altKey) {
    injectMatter(e.clientX, e.clientY, e.altKey ? 1.35 : 1.0);
    return;
  }

  // New v7: normal click launches an interactive photon path.
  // Ctrl/Cmd+click launches a fan of rays.
  launchPhotonBeam(e.clientX, e.clientY, e.ctrlKey || e.metaKey);

  // Keep the original plasma burst behavior outside the shadow.
  if (r > bhR * 0.95 && state.particles) {
    addParticleBurst(e.clientX, e.clientY, 10);
  }
});

// ════════════════════════════════════════════════════════
//  INFALLING CAMERA MODE
// ════════════════════════════════════════════════════════
function startInfalling() {
  orbit.director = false;
  updateDirectorLabel(false);
  state.infalling = true;
  state.infallingT = 0;
  orbit.mode = "infalling";
  orbit.director = false;
  els.fallingBtn?.classList.add('active');
  updateModeButtons("");
  if (els.horizonWarn) els.horizonWarn.style.transition = "opacity .5s ease";
}

function stopInfalling(options = {}) {
  state.infalling = false;
  if (!options.keepMode) orbit.mode = "manual";
  if (!options.keepCamera) {
    orbit.targetRadius = 7.3;
    orbit.targetPitch  = 0.28;
  }
  els.fallingBtn?.classList.remove('active');
  if (els.horizonWarn) els.horizonWarn.classList.remove('on');
  updateModeButtons("");
}

function updateInfalling(dt) {
  if (!state.infalling) return;
  state.infallingT += dt;

  // Spiral inward: acceleration increases near BH
  const r = orbit.radius;
  const inwardSpeed = 0.08 + 2.5 / Math.max(r, 1.2);
  orbit.targetRadius = Math.max(r - inwardSpeed * dt, 1.05);
  orbit.targetYaw    = orbit.yaw + 0.12 * dt;  // slow rotation as you fall in

  // Show horizon warning when close
  const warn = orbit.radius < 2.5;
  if (els.horizonWarn) els.horizonWarn.classList.toggle('on', warn);
  if (els.horizonDist) els.horizonDist.textContent = `r = ${orbit.radius.toFixed(3)} rₛ`;

  // Auto-escape when too close (prevent shader from breaking)
  if (orbit.targetRadius <= 1.08) stopInfalling();
}


// ════════════════════════════════════════════════════════
//  UI / MODE HELPERS
// ════════════════════════════════════════════════════════
function setActive(el, on) { if (el) el.classList.toggle("active", !!on); }

function updateModeButtons(modeName = state.lookPreset) {
  setActive(document.getElementById("presetScientific"), modeName === "scientific");
  setActive(document.getElementById("presetCinematic"),  modeName === "cinematic");
  setActive(els.observatoryBtn, modeName === "observatory");
  setActive(els.telescopeBtn, state.telescope);
  setActive(els.traverseBtn, state.traverse);
  els.traverseBadge?.classList.toggle("on", state.traverse);
  setActive(document.getElementById("presetAnnihilation"),modeName === "annihilation");
  setActive(els.directorLabel, orbit.director);
  setActive(document.getElementById("directorBtn"), orbit.director);
  setActive(document.getElementById("photonBtn"), orbit.photonLab);
  setActive(els.particleBtn, state.particles);
  setActive(els.gwBtn, state.gravWave);
  setActive(els.fallingBtn, state.infalling);
  setActive(els.measureBtn, state.measurement);
  setActive(els.splitBtn, state.split);
  setActive(els.audioBtn, state.audio);
  setActive(els.musicBtn, state.music);
  setActive(els.missionBtn, state.mission);
  els.musicBadge?.classList.toggle("on", state.music);
  els.partIndicator?.classList.toggle("on", state.particles);
  els.gwIndicator?.classList.toggle("on", state.gravWave);
}

function setBloom(strength, radius, threshold) {
  bloom.strength = strength;
  bloom.radius = radius;
  bloom.threshold = threshold;
}



function setTraverseMode(force) {
  const next = typeof force === "boolean" ? force : !state.traverse;
  if (next) {
    applyLook("observatory");
    state.traverse = true;
    state.observatory = true;
    orbit.director = false;
    state.infalling = false;
    orbit.mode = "traverse";
    uniforms.uTraverseMode.value = 1.0;
    uniforms.uDiskHaze.value = Math.max(uniforms.uDiskHaze.value, 1.08);
    uniforms.uCloudDensity.value = Math.max(uniforms.uCloudDensity.value, 0.92);
    uniforms.uSecondaryImage.value = Math.max(uniforms.uSecondaryImage.value, 0.80);
    uniforms.uDiskPower.value = 0.90;
    uniforms.uExposure.value = 0.90;
    uniforms.uLensStrength.value = 1.18;
    uniforms.uJetPower.value = 0.0;
    uniforms.uPhotonEcho.value = 0.60;
    uniforms.uShadowPower.value = 0.96;
    uniforms.uQualitySteps.value = Math.max(uniforms.uQualitySteps.value, 200.0);
    state.particles = true;
    initParticles();
    setHudMode("TRAVERSE");
    setLabStatus("CLOUD TRAVERSE MODE // LOW-ALTITUDE PLASMA WEATHER");
  } else {
    state.traverse = false;
    uniforms.uTraverseMode.value = 0.0;
    applyLook("observatory");
    setLabStatus("CLOUD TRAVERSE MODE OFF");
  }
  syncControls();
  updateModeButtons(state.lookPreset);
}

function setTelescopeMode(force) {
  const next = typeof force === "boolean" ? force : !state.telescope;
  state.telescope = next;
  document.body.classList.toggle("telescope", next);
  els.captureBadge?.classList.toggle("on", next);
  if (next) {
    applyLook("observatory");
    state.telescope = true;
    document.body.classList.add("telescope");
    els.captureBadge?.classList.add("on");
    orbit.mode = "cinematic";
    orbit.targetRadius = 7.8;
    orbit.targetPitch = 0.24;
    uniforms.uSecondaryImage.value = 0.72;
    uniforms.uDiskHaze.value = 1.02;
    setLabStatus("TELESCOPE CAPTURE // CLEAN VIEW");
  } else {
    document.body.classList.remove("telescope");
    els.captureBadge?.classList.remove("on");
    setLabStatus("TELESCOPE MODE OFF");
  }
  syncControls();
  updateModeButtons(state.lookPreset);
}

function setBeautyMode(force) {
  const next = typeof force === "boolean" ? force : !state.beauty;
  state.beauty = next;
  document.body.classList.toggle("beauty", next);
  if (next) {
    applyLook("observatory");
    state.beauty = true;
    state.telescope = true;
    document.body.classList.add("beauty", "telescope");
    els.captureBadge?.classList.add("on");
    setLabStatus("BEAUTY CAPTURE // UI HIDDEN");
  } else {
    document.body.classList.remove("beauty");
    setLabStatus("BEAUTY CAPTURE OFF");
  }
  updateModeButtons(state.lookPreset);
}


// ════════════════════════════════════════════════════════
//  PRESET LOOKS
// ════════════════════════════════════════════════════════
function setHudMode(text) { if (els.mode) els.mode.textContent = text; }
function qualityLabel(v)  { return v >= 215 ? "ULTRA" : v >= 170 ? "HIGH" : "PERFORMANCE"; }

function applyLook(name, options = {}) {
  const preserveDirector = !!options.preserveDirector;
  if (!preserveDirector) {
    orbit.director = false;
    updateDirectorLabel(false);
  }
  stopInfalling({ keepCamera:true, keepMode:true });
  state.lookPreset = name;
  state.observatory = name === "observatory";
  state.traverse = false;
  uniforms.uTraverseMode.value = 0.0;
  if (name !== "observatory") { state.telescope = false; state.beauty = false; document.body.classList.remove("telescope", "beauty"); els.captureBadge?.classList.remove("on"); }

  // reset realism toggles unless observatory re-enables them
  uniforms.uObservatoryMode.value = 0.0;
  uniforms.uDiskHaze.value = 0.60;
  uniforms.uLensDirt.value = 0.05;
  document.body.classList.toggle("observatory", state.observatory);

  if (name === "scientific") {
    orbit.mode = preserveDirector ? orbit.mode : "manual";
    uniforms.uLensStrength.value=1.18; uniforms.uDiskPower.value=0.68; uniforms.uExposure.value=0.88;
    uniforms.uSpinWarp.value=0.28; uniforms.uDiskTilt.value=0.56; uniforms.uJetPower.value=0.0;
    uniforms.uPhotonEcho.value=0.42; uniforms.uShadowPower.value=0.92;
    uniforms.uUltra.value=0.0; uniforms.uQualitySteps.value=160.0; uniforms.uPresetMood.value=0.0; uniforms.uCloudDensity.value=0.42;
    setBloom(0.28, 0.24, 0.38);
    setHudMode("SCIENTIFIC");
  }
  if (name === "cinematic") {
    orbit.mode = preserveDirector ? orbit.mode : "cinematic";
    uniforms.uLensStrength.value=1.38; uniforms.uDiskPower.value=0.94; uniforms.uExposure.value=0.96;
    uniforms.uSpinWarp.value=0.50; uniforms.uDiskTilt.value=0.62; uniforms.uJetPower.value=0.035;
    uniforms.uPhotonEcho.value=0.68; uniforms.uShadowPower.value=0.82;
    uniforms.uUltra.value=0.0; uniforms.uQualitySteps.value=180.0; uniforms.uPresetMood.value=0.8; uniforms.uCloudDensity.value=0.56;
    setBloom(0.46, 0.38, 0.30);
    setHudMode("CINEMATIC");
  }
  if (name === "observatory") {
    orbit.mode = preserveDirector ? orbit.mode : "cinematic";
    uniforms.uLensStrength.value=1.26; uniforms.uDiskPower.value=0.78; uniforms.uExposure.value=0.90;
    uniforms.uSpinWarp.value=0.36; uniforms.uDiskTilt.value=0.60; uniforms.uJetPower.value=0.0;
    uniforms.uPhotonEcho.value=0.54; uniforms.uShadowPower.value=0.95;
    uniforms.uUltra.value=0.0; uniforms.uQualitySteps.value=210.0; uniforms.uPresetMood.value=0.15; uniforms.uCloudDensity.value=0.78;
    uniforms.uObservatoryMode.value=1.0; uniforms.uDiskHaze.value=0.92; uniforms.uLensDirt.value=0.12; uniforms.uSecondaryImage.value=0.66;
    setBloom(0.24, 0.18, 0.46);
    setHudMode("OBSERVATORY");
    orbit.photonLab = false;
    state.gravWave = false;
    state.particles = false;
    state.measurement = false;
    state.split = false;
    uniforms.uSplitMode.value = 0.0;
    if (audioCtx && audioMaster) audioMaster.gain.setTargetAtTime(0.0, audioCtx.currentTime, 0.06);
    state.audio = false;
    setLabStatus("OBSERVATORY MODE // DOCUMENTARY REALISM");
  }
  if (name === "annihilation") {
    orbit.mode = preserveDirector ? orbit.mode : "cinematic";
    uniforms.uLensStrength.value=1.76; uniforms.uDiskPower.value=1.08; uniforms.uExposure.value=0.98;
    uniforms.uSpinWarp.value=0.82; uniforms.uDiskTilt.value=0.72; uniforms.uJetPower.value=0.30;
    uniforms.uPhotonEcho.value=0.88; uniforms.uShadowPower.value=0.78;
    uniforms.uUltra.value=1.0; uniforms.uQualitySteps.value=215.0; uniforms.uPresetMood.value=1.75; uniforms.uCloudDensity.value=0.72;
    setBloom(0.62, 0.48, 0.25);
    setHudMode("ANNIHILATION");
  }

  syncControls();
  updateModeButtons(name);
}

function syncControls() {
  const pairs = [
    ["lensing","v-lensing",uniforms.uLensStrength.value,2],
    ["disk","v-disk",uniforms.uDiskPower.value,2],
    ["exposure","v-exposure",uniforms.uExposure.value,2],
    ["spin","v-spin",uniforms.uSpinWarp.value,2],
    ["tilt","v-tilt",uniforms.uDiskTilt.value,2],
    ["jet","v-jet",uniforms.uJetPower.value,2],
    ["echo","v-echo",uniforms.uPhotonEcho.value,2],
    ["haze","v-haze",uniforms.uDiskHaze.value,2],
    ["dirt","v-dirt",uniforms.uLensDirt.value,2],
    ["secondary","v-secondary",uniforms.uSecondaryImage.value,2],
    ["shadow","v-shadow",uniforms.uShadowPower.value,2],
    ["cloudDensity","v-cloud-density",uniforms.uCloudDensity.value,2],
    ["ultra","v-ultra",uniforms.uUltra.value,2],
    ["quality","v-quality",uniforms.uQualitySteps.value,0]
  ];
  pairs.forEach(([id,lid,val,dig]) => {
    const inp = document.getElementById(id), lbl = document.getElementById(lid);
    if (inp) inp.value = val;
    if (lbl) lbl.textContent = Number(val).toFixed(dig);
  });
  if (els.quality) els.quality.textContent = qualityLabel(uniforms.uQualitySteps.value);
}

function bindSlider(id, labelId, uniformName, digits=2) {
  const inp = document.getElementById(id), lbl = document.getElementById(labelId);
  inp?.addEventListener("input", () => {
    const v = Number(inp.value);
    uniforms[uniformName].value = v;
    if (lbl) lbl.textContent = v.toFixed(digits);
    if (uniformName === "uQualitySteps" && els.quality) els.quality.textContent = qualityLabel(v);
  });
}
bindSlider("lensing","v-lensing","uLensStrength");
bindSlider("disk","v-disk","uDiskPower");
bindSlider("exposure","v-exposure","uExposure");
bindSlider("spin","v-spin","uSpinWarp");
bindSlider("tilt","v-tilt","uDiskTilt");
bindSlider("jet","v-jet","uJetPower");
bindSlider("echo","v-echo","uPhotonEcho");
bindSlider("haze","v-haze","uDiskHaze");
bindSlider("dirt","v-dirt","uLensDirt");
bindSlider("secondary","v-secondary","uSecondaryImage");
bindSlider("shadow","v-shadow","uShadowPower");
bindSlider("ultra","v-ultra","uUltra");
bindSlider("quality","v-quality","uQualitySteps",0);
bindSlider("cloudDensity","v-cloud-density","uCloudDensity");
const traverseHeightSlider = document.getElementById("traverseHeight");
traverseHeightSlider?.addEventListener("input", e => {
  state.traverseHeight = parseFloat(e.target.value);
  const l = document.getElementById("v-traverse-height");
  if (l) l.textContent = state.traverseHeight.toFixed(2);
});

// ════════════════════════════════════════════════════════
//  DIRECTOR MODE
// ════════════════════════════════════════════════════════
function updateDirectorLabel(on, text="") {
  els.directorLabel?.classList.toggle("on", on);
  if (text && els.directorLabel) els.directorLabel.textContent = text;
}

function setPreset(id) {
  orbit.director = false;
  stopInfalling({ keepCamera:true, keepMode:true });
  orbit.mode = id === 4 ? "cinematic" : "manual";
  updateDirectorLabel(false);
  const presets = {
    1:[0.05,0.22,7.2], 2:[Math.PI*.5,0.03,6.4], 3:[Math.PI*.25,1.08,8.1], 4:[null,0.32,7.3]
  };
  const p = presets[id];
  if (!p) return;
  if (p[0] !== null) orbit.targetYaw = p[0];
  orbit.targetPitch = p[1]; orbit.targetRadius = p[2];
  setHudMode(id === 4 ? "CINEMATIC" : `CAMERA ${id}`);
  updateModeButtons("");
}

function toggleDirector() {
  const next = !orbit.director;
  orbit.director = next;
  orbit.mode = next ? "director" : "cinematic";
  orbit.shot = 0;
  orbit.shotStart = clock.getElapsedTime();
  if (next) {
    applyLook("cinematic", { preserveDirector:true });
    orbit.director = true;
    orbit.mode = "director";
    updateDirectorLabel(true, "DIRECTOR MODE // SHOT 01: DISTANT APPROACH");
  } else {
    updateDirectorLabel(false);
    setHudMode("CINEMATIC");
  }
  updateModeButtons(next ? "cinematic" : "");
}

const DIRECTOR_SHOTS = [
  { yaw:0,    pitch:0.22,  radius:9.0,  label:"SHOT 01: DISTANT APPROACH" },
  { yaw:.5,   pitch:0.08,  radius:5.5,  label:"SHOT 02: EQUATORIAL SKIM"  },
  { yaw:1.2,  pitch:0.55,  radius:7.8,  label:"SHOT 03: HIGH ORBIT"       },
  { yaw:2.1,  pitch:0.18,  radius:4.2,  label:"SHOT 04: CLOSE PASS"       },
  { yaw:3.5,  pitch:0.85,  radius:10.2, label:"SHOT 05: OVERHEAD VIEW"    },
  { yaw:4.8,  pitch:0.10,  radius:6.0,  label:"SHOT 06: EDGE-ON DISK"     },
];

function updateDirector(t) {
  const shotLen = 9.0;
  const shot = Math.floor(((t - orbit.shotStart) / shotLen) % DIRECTOR_SHOTS.length);
  if (shot !== orbit.shot) {
    orbit.shot = shot;
    updateDirectorLabel(true, DIRECTOR_SHOTS[shot].label);
  }
  const local = ((t - orbit.shotStart) % shotLen) / shotLen;
  const ease  = local * local * (3 - 2 * local);
  const next  = (orbit.shot + 1) % DIRECTOR_SHOTS.length;
  const s0    = DIRECTOR_SHOTS[orbit.shot], s1 = DIRECTOR_SHOTS[next];
  orbit.targetYaw    = s0.yaw    + (s1.yaw    - s0.yaw)    * ease;
  orbit.targetPitch  = s0.pitch  + (s1.pitch  - s0.pitch)  * ease;
  orbit.targetRadius = s0.radius + (s1.radius  - s0.radius) * ease;
}

// ════════════════════════════════════════════════════════
//  PHOTON LAB TOGGLE
// ════════════════════════════════════════════════════════
function togglePhotonLab(force) {
  orbit.photonLab = typeof force === "boolean" ? force : !orbit.photonLab;
  if (els.photon) els.photon.textContent = orbit.photonLab ? "ON" : "OFF";
  els.rayOverlay?.classList.toggle("on", orbit.photonLab || state.gravWave);
  if (orbit.photonLab) { uniforms.uUltra.value = 0.0; syncControls(); }
  updateModeButtons("");
}

// ════════════════════════════════════════════════════════
//  HUD PHYSICS UPDATE
// ════════════════════════════════════════════════════════
function updateHud(t) {
  const r = orbit.radius;

  // Standard stats
  if (els.dist) els.dist.textContent = r.toFixed(2);
  const estMinR = clamp(1.08 + 0.23 / Math.max(0.4, uniforms.uLensStrength.value - 0.35), 1.02, 1.75);
  if (els.minR) els.minR.textContent = estMinR.toFixed(2);
  const dMin = (0.36 + uniforms.uSpinWarp.value * 0.08).toFixed(2);
  const dMax = (2.35 + uniforms.uSpinWarp.value * 0.78 + uniforms.uDiskPower.value * 0.15).toFixed(2);
  if (els.doppler) els.doppler.textContent = `${dMin}δ – ${dMax}δ`;
  const tHi = Math.round(43000 + uniforms.uDiskPower.value * 8500);
  if (els.temp) els.temp.textContent = `4 200K – ${Math.min(tHi,55000).toLocaleString()}K`;

  // ── Live physics panel ────────────────────────────────

  // Time dilation: τ_local / τ_∞ = √(1 − rₛ/r)
  const td   = timeDilation(r);
  const tdPct= (100 * (1 - td)).toFixed(2);
  if (els.hudTD) {
    const el = els.hudTD;
    el.textContent = `${td.toFixed(4)} (${tdPct}% slower)`;
    el.className   = r < 2.5 ? 'warn' : '';
  }

  // Frame drag at current spin
  const omega = frameDragOmega();
  if (els.hudOmega) els.hudOmega.textContent = `${omega.toFixed(3)} c/rₛ`;

  // ── Proximity gauge ────────────────────────────────────
  // Show how "deep" in the gravity well camera is
  // At r=∞: 0%   |   At r=1.1rₛ (just above horizon): ~100%
  const depthPct = clamp((1 - (r - 1.0) / 12.0) * 100, 0, 100);
  if (els.proxFill) {
    const danger = depthPct > 70 ? 'rgba(255,80,40,.85)' : depthPct > 40 ? 'rgba(255,160,60,.75)' : 'rgba(100,200,255,.70)';
    els.proxFill.style.width      = `${depthPct.toFixed(1)}%`;
    els.proxFill.style.background = danger;
  }
}

// ════════════════════════════════════════════════════════
//  SCREENSHOT
// ════════════════════════════════════════════════════════
async function saveScreenshot(ultra=false) {
  const prevPixel   = renderer.getPixelRatio();
  const prevUltra   = uniforms.uUltra.value;
  const prevQuality = uniforms.uQualitySteps.value;
  const wasHidden   = els.hud?.classList.contains("hidden");
  if (ultra) {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio * 1.5, 3));
    uniforms.uUltra.value = 1.0; uniforms.uQualitySteps.value = 220.0;
    els.hud?.classList.add("hidden");
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    composer.setSize(window.innerWidth, window.innerHeight);
  }
  composer.render();
  const a = document.createElement("a");
  a.download = ultra ? `bh-v5-ultra-${Date.now()}.png` : `bh-v5-${Date.now()}.png`;
  a.href = renderer.domElement.toDataURL("image/png");
  a.click();
  if (ultra) {
    renderer.setPixelRatio(prevPixel); uniforms.uUltra.value=prevUltra; uniforms.uQualitySteps.value=prevQuality;
    if (!wasHidden) els.hud?.classList.remove("hidden");
    renderer.setSize(window.innerWidth, window.innerHeight, false); composer.setSize(window.innerWidth, window.innerHeight);
    syncControls();
  }
}


// ════════════════════════════════════════════════════════
//  MISSION MODE — guided interactive demo sequence
// ════════════════════════════════════════════════════════
const MISSION_STAGES = [
  { at:0,  label:'MISSION 01 // DISTANT OBSERVER', action:()=>{ applyLook('scientific'); setPreset(1); state.measurement=true; } },
  { at:5,  label:'MISSION 02 // LENSING COMPARISON', action:()=>{ state.split=true; uniforms.uSplitMode.value=1.0; togglePhotonLab(true); } },
  { at:10, label:'MISSION 03 // PHOTON LAUNCH', action:()=>{ state.split=false; uniforms.uSplitMode.value=0.0; launchPhotonBeam(window.innerWidth*0.20, window.innerHeight*0.58, true); } },
  { at:15, label:'MISSION 04 // DISK FLARE', action:()=>{ injectMatter(window.innerWidth*0.63, window.innerHeight*0.54, 1.15); } },
  { at:20, label:'MISSION 05 // GRAVITATIONAL WAVE PULSE', action:()=>{ state.gravWave=true; state.particles=true; initParticles(); } },
  { at:25, label:'MISSION 06 // FINAL SINGULARITY PASS', action:()=>{ applyLook('annihilation'); orbit.mode='cinematic'; state.measurement=false; } }
];

function toggleMission(force) {
  const next = typeof force === 'boolean' ? force : !state.mission;
  state.mission = next;
  state.missionStart = clock.getElapsedTime();
  state.missionStage = -1;
  if (next) {
    orbit.director = false;
    updateDirectorLabel(true, 'EVENT HORIZON LAB // MISSION MODE');
    setLabStatus('MISSION MODE STARTED');
  } else {
    updateDirectorLabel(false);
    setLabStatus('MISSION MODE OFF');
  }
  updateModeButtons('');
}

function updateMission(t) {
  if (!state.mission) return;
  const elapsed = t - state.missionStart;
  if (elapsed > 32) { toggleMission(false); return; }
  let stage = 0;
  for (let i=0; i<MISSION_STAGES.length; i++) if (elapsed >= MISSION_STAGES[i].at) stage = i;
  if (stage !== state.missionStage) {
    state.missionStage = stage;
    const st = MISSION_STAGES[stage];
    st.action?.();
    updateDirectorLabel(true, st.label);
    setLabStatus(st.label);
  }
}

// ════════════════════════════════════════════════════════
//  INPUT HANDLERS
// ════════════════════════════════════════════════════════
window.addEventListener("pointerdown", e => {
  orbit.dragging = true; orbit.director = false; orbit.mode = "manual";
  updateDirectorLabel(false); hideTooltip();
  orbit.lastX = e.clientX; orbit.lastY = e.clientY;
});
window.addEventListener("pointerup",   () => { orbit.dragging = false; });
window.addEventListener("pointermove", e => {
  if (!orbit.dragging) return;
  orbit.targetYaw   -= (e.clientX - orbit.lastX) * 0.005;
  orbit.targetPitch  = clamp(orbit.targetPitch - (e.clientY - orbit.lastY) * 0.005, -1.35, 1.35);
  orbit.lastX = e.clientX; orbit.lastY = e.clientY;
});
window.addEventListener("wheel", e => {
  orbit.director = false; updateDirectorLabel(false);
  orbit.mode = "manual";
  orbit.targetRadius = clamp(orbit.targetRadius + e.deltaY * 0.007, 3.0, 16.0);
  stopInfalling();
});

window.addEventListener("keydown", e => {
  const k = e.key.toLowerCase();
  if (k === "h") els.hud?.classList.toggle("hidden");
  if (k === "c") els.controls?.classList.toggle("collapsed");
  if (k === "i") els.info?.classList.toggle("hidden");
  if (k === "d") toggleDirector();
  if (k === "p") togglePhotonLab();
  if (k === "1") setPreset(1); if (k === "2") setPreset(2);
  if (k === "3") setPreset(3); if (k === "4") setPreset(4);
  if (k === "5") applyLook("annihilation");
  if (k === "6") setTraverseMode();
  if (k === "o") applyLook("observatory");
  if (k === "t") setTelescopeMode();
  if (k === "b") setBeautyMode();
  if (k === "r" && state.traverse) { state.traverseHeight = clamp(state.traverseHeight + 0.02, 0.04, 0.40); syncControls(); }
  if (k === "z" && state.traverse) { state.traverseHeight = clamp(state.traverseHeight - 0.02, 0.04, 0.40); syncControls(); }
  if (k === "n") { els.introCard?.classList.add("hidden"); toggleMusic(); }
  if (k === "l") els.musicFile?.click();
  if (k === "escape") { els.introCard?.classList.add("hidden"); if(state.beauty) setBeautyMode(false); }
  if (k === "s") saveScreenshot(e.shiftKey);

  // New v5 keys
  if (k === "g") {
    state.gravWave = !state.gravWave;
    updateModeButtons("");
  }
  if (k === "f") {
    if (state.infalling) stopInfalling();
    else startInfalling();
  }
  if (k === "v") {
    state.particles = !state.particles;
    updateModeButtons("");
    if (!state.particles) {
      const pcv = els.particleCanvas;
      if (pcv) pcv.getContext('2d').clearRect(0,0,pcv.width,pcv.height);
    } else { initParticles(); }
  }
  if (k === "m") { state.measurement = !state.measurement; updateModeButtons(""); setLabStatus(state.measurement ? "MEASUREMENT OVERLAY ON" : "MEASUREMENT OFF"); }
  if (k === "x") { state.split = !state.split; uniforms.uSplitMode.value = state.split ? 1.0 : 0.0; updateModeButtons(""); setLabStatus(state.split ? "SPLIT LENSING COMPARISON" : "SPLIT MODE OFF"); }
  if (k === "a") toggleAudio();
  if (k === "enter") toggleMission();
  if (k === "escape") { stopInfalling(); if(state.mission) toggleMission(false); }
});

// Button bindings
document.getElementById("presetScientific")?.addEventListener("click", ()=>applyLook("scientific"));
document.getElementById("presetCinematic")?.addEventListener("click",  ()=>applyLook("cinematic"));
document.getElementById("presetObservatory")?.addEventListener("click",()=>applyLook("observatory"));
document.getElementById("telescopeBtn")?.addEventListener("click",()=>setTelescopeMode());
document.getElementById("traverseBtn")?.addEventListener("click",()=>setTraverseMode());
document.getElementById("musicBtn")?.addEventListener("click",()=>{ els.introCard?.classList.add("hidden"); toggleMusic(); });
document.getElementById("loadMusicBtn")?.addEventListener("click",()=>els.musicFile?.click());
els.musicFile?.addEventListener("change", e => loadLocalMusicFile(e.target.files?.[0]));
document.getElementById("presetAnnihilation")?.addEventListener("click",()=>applyLook("annihilation"));
document.getElementById("directorBtn")?.addEventListener("click",      ()=>toggleDirector());
document.getElementById("photonBtn")?.addEventListener("click",         ()=>togglePhotonLab());
document.getElementById("particleBtn")?.addEventListener("click", () => {
  state.particles = !state.particles;
  updateModeButtons("");
  if (!state.particles) {
    const pcv = els.particleCanvas;
    if (pcv) pcv.getContext('2d').clearRect(0,0,pcv.width,pcv.height);
  } else { initParticles(); }
});
document.getElementById("gwBtn")?.addEventListener("click", () => {
  state.gravWave = !state.gravWave;
  updateModeButtons("");
});
document.getElementById("fallingBtn")?.addEventListener("click", () => {
  if (state.infalling) stopInfalling(); else startInfalling();
});
document.getElementById("measureBtn")?.addEventListener("click", () => {
  state.measurement = !state.measurement; updateModeButtons(""); setLabStatus(state.measurement ? "MEASUREMENT OVERLAY ON" : "MEASUREMENT OFF");
});
document.getElementById("splitBtn")?.addEventListener("click", () => {
  state.split = !state.split; uniforms.uSplitMode.value = state.split ? 1.0 : 0.0; updateModeButtons(""); setLabStatus(state.split ? "SPLIT LENSING COMPARISON" : "SPLIT MODE OFF");
});
document.getElementById("audioBtn")?.addEventListener("click", () => toggleAudio());
document.getElementById("missionBtn")?.addEventListener("click", () => toggleMission());

// ════════════════════════════════════════════════════════
//  CAMERA UPDATE
// ════════════════════════════════════════════════════════
function updateCamera(t, dt) {
  if (orbit.director) updateDirector(t);
  else if (state.traverse || orbit.mode === "traverse") {
    orbit.mode = "traverse";
  }
  else if (orbit.mode === "cinematic") {
    orbit.targetYaw    = t * 0.085;
    orbit.targetPitch  = 0.28 + Math.sin(t * 0.23) * 0.12;
    orbit.targetRadius = 7.4 + Math.sin(t * 0.17) * 0.7;
  }

  updateInfalling(dt);

  if (state.traverse || orbit.mode === "traverse") {
    const tilt = uniforms.uDiskTilt.value;
    const a = t * 0.21 + Math.sin(t * 0.05) * 0.2;
    const r = 3.5 + Math.sin(t * 0.17) * 0.18;
    const h = state.traverseHeight + Math.sin(t * 0.90) * 0.018;
    const localPos = new THREE.Vector3(r * Math.sin(a), h, r * Math.cos(a));
    const localAhead = new THREE.Vector3(r * Math.sin(a + 0.18), h * 0.86, r * Math.cos(a + 0.18));
    const localInward = new THREE.Vector3(r * Math.sin(a + 0.08) * 0.54, h * 0.65, r * Math.cos(a + 0.08) * 0.54);
    localPos.applyAxisAngle(new THREE.Vector3(1,0,0), tilt);
    localAhead.applyAxisAngle(new THREE.Vector3(1,0,0), tilt);
    localInward.applyAxisAngle(new THREE.Vector3(1,0,0), tilt);
    camPos.copy(localPos);
    const target = localAhead.lerp(localInward, 0.24);
    forward.copy(target).sub(camPos).normalize();
    right.crossVectors(forward, worldUp);
    if (right.lengthSq() < 1e-5) right.set(1,0,0);
    right.normalize();
    up.crossVectors(right, forward).normalize();
    orbit.radius = camPos.length();
  } else {
    const k = 0.055;
    orbit.yaw    += (orbit.targetYaw    - orbit.yaw)    * k;
    orbit.pitch  += (orbit.targetPitch  - orbit.pitch)  * k;
    orbit.radius += (orbit.targetRadius - orbit.radius) * k;

    const x = orbit.radius * Math.sin(orbit.yaw) * Math.cos(orbit.pitch);
    const y = orbit.radius * Math.sin(orbit.pitch);
    const z = orbit.radius * Math.cos(orbit.yaw) * Math.cos(orbit.pitch);

    camPos.set(x, y, z);
    forward.set(0,0,0).sub(camPos).normalize();
    right.crossVectors(forward, worldUp).normalize();
    up.crossVectors(right, forward).normalize();
  }

  uniforms.uCamPos.value.copy(camPos);
  uniforms.uCamForward.value.copy(forward);
  uniforms.uCamRight.value.copy(right);
  uniforms.uCamUp.value.copy(up);
}

// ════════════════════════════════════════════════════════
//  RESIZE
// ════════════════════════════════════════════════════════
window.addEventListener("resize", () => {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w,h); composer.setSize(w,h); bloom.resolution.set(w,h);
  uniforms.uResolution.value.set(w,h);
  resizeRayOverlay(); resizeParticleCanvas();
});

// ════════════════════════════════════════════════════════
//  ANIMATION LOOP
// ════════════════════════════════════════════════════════
const clock = new THREE.Clock();
let lastFps = 0, frames = 0, lastT = 0;

function animate() {
  const t  = clock.getElapsedTime();
  const dt = Math.min(t - lastT, 0.05);
  lastT = t;

  uniforms.uTime.value = t;
  updateMission(t);
  updateMusic(t);
  updateCamera(t, dt);
  updateHud(t);
  if (state.matterPulse > 0.0) state.matterPulse = Math.max(0, state.matterPulse - dt*0.42);
  uniforms.uMatterPulse.value = Math.max(0, uniforms.uMatterPulse.value - dt*0.55);
  if (state.observatory) {
    const targetExp = state.traverse
      ? clamp(0.86 + 0.05 * smoothstep(0.04, 0.28, state.traverseHeight), 0.84, 0.94)
      : clamp(0.82 + 0.14 * smoothstep(2.1, 8.6, orbit.radius) + 0.02 * (1.0 - uniforms.uDiskPower.value), 0.78, 1.00);
    uniforms.uExposure.value += (targetExp - uniforms.uExposure.value) * 0.035;
    const expInput = document.getElementById("exposure"), expLbl = document.getElementById("v-exposure");
    if (expInput) expInput.value = uniforms.uExposure.value.toFixed(2);
    if (expLbl) expLbl.textContent = uniforms.uExposure.value.toFixed(2);
    const bloomStrength = state.traverse ? 0.30 : (0.22 + 0.08 * smoothstep(1.8, 6.5, orbit.radius));
    setBloom(bloomStrength, 0.22, state.traverse ? 0.40 : 0.46);
  }
  if (state.audio && audioOsc && audioCtx) {
    const f = 42 + 54 / Math.max(1.0, orbit.radius) + uniforms.uSpinWarp.value * 22.0 + (state.gravWave ? Math.sin(t*5.0)*8.0 : 0);
    audioOsc.frequency.setTargetAtTime(f, audioCtx.currentTime, 0.06);
  }

  composer.render();
  drawParticles(t);
  drawOverlays(t);

  frames++;
  const now = performance.now();
  if (now - lastFps > 500) {
    const fps = Math.round(frames * 1000 / (now - lastFps));
    frames = 0; lastFps = now;
    if (els.fps) els.fps.innerHTML = `FPS&nbsp;<span>${fps}</span>`;
  }

  requestAnimationFrame(animate);
}

// ════════════════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════════════════
resizeRayOverlay();
resizeParticleCanvas();
initParticles();
applyLook("cinematic");

// Show particle indicator on start
els.partIndicator?.classList.add('on');
els.particleBtn?.classList.add('active');

lastFps = performance.now();
animate();
