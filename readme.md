# Neural Gravity Lab: Interactive Kerr-Inspired Black Hole Visualization System

**Neural Gravity Lab** is a real-time browser-based scientific visualization project that combines computer graphics, physics-inspired simulation, and in-browser machine learning. The system renders an interactive black hole scene using **Three.js**, **WebGL**, and custom **GLSL fragment shaders**, while also integrating a TensorFlow.js-based neural classifier for synthetic gravitational-wave-like orbital strain signals.

The project is designed as an educational and research-inspired visualization system rather than a fully rigorous general relativity simulator. Its goal is to explore how real-time graphics, physics-inspired approximations, and machine learning can be combined into a single interactive browser experience.

---

## Demo

## Demo Screenshots

<p align="center">
  <img src="Demo%20Pics/1.jpg" width="48%" />
  <img src="Demo%20Pics/2.jpg" width="48%" />
</p>

<p align="center">
  <img src="Demo%20Pics/3.jpg" width="48%" />
  <img src="Demo%20Pics/4.jpg" width="48%" />
</p>

<p align="center">
  <img src="Demo%20Pics/5.jpg" width="48%" />
  <img src="Demo%20Pics/6.jpg" width="48%" />
</p>

<p align="center">
  <img src="Demo%20Pics/7.jpg" width="48%" />
</p>


<p align="center">
  <img src="bh-v5-ultra-1779296896585.png" width="48%" />
  <img src="bh-v5-ultra-1779296897096.png" width="48%" />
</p>

<p align="center">
  <img src="bh-v5-ultra-1779296897459.png" width="48%" />
</p>

<p align="center">
  <img src="bh-v5-1779296801780.png" width="48%" />
  <img src="bh-v5-1779297133461.png" width="48%" />
</p>


Recommended demo sequence:

1. Start in **Gargantua Mode**
2. Show the black hole and accretion disk from a cinematic orbit
3. Switch into **Cloud Traverse Mode**
4. Enable the **Neural Gravity Lab** panel
5. Show the live strain oscilloscope and ML confidence bars
6. End with a clean Beauty/Telescope capture

---

## Project Overview

This project began as a real-time black hole renderer and evolved into an interactive astrophysics-inspired visualization environment.

Core components include:

- Real-time black hole rendering
- Approximate gravitational lensing
- Doppler-shifted accretion disk visualization
- Relativistic beaming approximation
- Volumetric plasma/cloud disk effects
- Photon-ring-style distortion
- Orbital particle dynamics
- Cinematic camera modes
- Disk traversal/flythrough mode
- TensorFlow.js-based Neural Gravity Lab
- Synthetic gravitational-wave-like signal classification

The system runs entirely in the browser.

---

## Technology Stack

### Graphics and Interaction

- **Three.js**
- **WebGL**
- **GLSL fragment shaders**
- **JavaScript**
- **Vite**
- **HTML/CSS**

### Machine Learning

- **TensorFlow.js**
- **1D convolutional neural network**
- Synthetic orbital strain signal generation
- Browser-based model training/inference

### Visualization Features

- Shader-based black hole rendering
- Volumetric accretion disk
- Orbital particle system
- Oscilloscope-style signal visualization
- Real-time ML confidence bars
- Cinematic screenshot/video modes

---

## Key Features

### 1. Real-Time Black Hole Renderer

The renderer uses a shader-heavy approach to approximate the visual behavior of a black hole and its surrounding accretion structure.

Implemented effects include:

- Raymarched black hole silhouette
- Approximate gravitational lensing
- Photon-ring-style distortion
- Starfield warping
- Accretion disk emission
- Post-processing bloom and exposure control

The renderer is designed for real-time interaction rather than exact physical simulation.

---

### 2. Kerr-Inspired Visual Design

The project is described as **Kerr-inspired** rather than a full Kerr metric solver.

The visual system includes rotational asymmetry and spin-inspired warping effects, but it does not solve exact Kerr null geodesics. The goal is to create a visually convincing real-time approximation suitable for scientific visualization and educational demonstration.

This distinction is intentional.

The project does **not** claim to be:

- a full general relativity simulator
- a physically exact Kerr geodesic solver
- a replacement for scientific black hole ray-tracing tools

Instead, it is a real-time, physics-inspired visualization engine.

---

### 3. Doppler-Shifted Accretion Disk

The accretion disk is shaded using an approximate Doppler and relativistic beaming model.

The disk is designed to qualitatively capture the visual behavior of high-energy rotating plasma:

- Approaching material appears brighter and blue-white
- Receding material appears dimmer and redder
- Inner disk regions appear hotter and more energetic
- Outer disk regions appear cooler and more diffuse

This creates a more physically motivated visual structure than a simple glowing ring.

---

### 4. Volumetric Plasma / Cloud Disk

The disk includes volumetric-style plasma and cloud-layer effects to make the accretion disk feel less like a flat surface and more like a turbulent astrophysical environment.

Implemented visual elements include:

- Layered plasma haze
- Cloud-like disk turbulence
- Dark absorption lanes
- Bright plasma crests
- Blue-white flare pockets
- Disk thickness approximation
- Localized density variation

These effects are especially visible in the cinematic and traversal modes.

---

### 5. Cloud Traverse Mode

Cloud Traverse Mode allows the camera to skim close to the accretion disk, creating a more immersive flythrough experience.

This mode emphasizes:

- Low-altitude motion over the disk
- Near-field plasma detail
- Volumetric disk haze
- Orbital motion
- Cinematic camera behavior
- Accretion-disk scale and depth

The goal is to make the disk feel like an environment rather than only a distant object.

---

### 6. Photon and Particle Visualization

The project includes orbital particle dynamics and photon/path-style visualization tools.

These are used both for visual effect and as part of the synthetic signal generation system.

The particle system approximates orbiting matter around the black hole and supports:

- Keplerian-style orbital motion
- Inward drift
- Particle trails
- Merger-like burst events
- Visual response to ML classification events

---

## Neural Gravity Lab

The machine learning component, called **Neural Gravity Lab**, adds an in-browser classifier for synthetic gravitational-wave-like strain signals.

This module is built with **TensorFlow.js** and runs directly in the browser.

### ML Objective

The classifier attempts to categorize synthetic orbital strain signals into three classes:

1. **Stable Orbit**
2. **Inspiral**
3. **Merger-like Event**

The input signal is generated from simulated orbital particle dynamics rather than real detector data.

---

## Synthetic Strain Signal

The system derives a simplified gravitational-wave-like strain proxy from orbiting particles.

A simplified quadrupole-inspired form is used:

```text
h(t) ∝ Σ cos(2φᵢ) · ωᵢ² / rᵢ²
```

where:

- `φᵢ` is the angular position of a particle
- `ωᵢ` is the approximate orbital angular velocity
- `rᵢ` is the particle radius from the black hole
- `h(t)` is the synthetic strain signal

This is not a real gravitational-wave detector signal. It is a synthetic signal designed for educational visualization and ML experimentation.

---

## ML Architecture

The classifier uses a 1D convolutional neural network over a fixed-length strain sequence.

### Input

```text
128-sample strain sequence
shape: [128, 1]
```

### Output

```text
P(Stable Orbit)
P(Inspiral)
P(Merger-like Event)
```

### Model Structure

The model follows a lightweight 1D-CNN structure:

```text
Conv1D
MaxPooling1D
Conv1D
MaxPooling1D
Conv1D
GlobalAveragePooling1D
Dense
Dropout
Dense Softmax
```

This architecture is inspired by machine learning approaches used in gravitational-wave signal classification research, but this implementation is trained on synthetic simulation-generated data.

---

## ML Visualization Interface

The Neural Gravity Lab panel includes:

- Live oscilloscope waveform
- Training status
- Inference latency
- Confidence bars
- Classification output
- Merger-like event trigger

When the model detects a merger-like signal, the simulation can trigger visual feedback such as:

- screen flash
- particle burst
- matter pulse
- classification status update

---

## System Architecture

```text
Browser
│
├── Three.js Scene
│   ├── Fullscreen shader plane
│   ├── WebGL renderer
│   └── Post-processing pipeline
│
├── GLSL Shader Renderer
│   ├── Black hole silhouette
│   ├── Gravitational lensing approximation
│   ├── Accretion disk shading
│   ├── Doppler/beaming approximation
│   ├── Volumetric plasma effects
│   └── Starfield distortion
│
├── Particle Simulation
│   ├── Orbital particles
│   ├── Trails
│   ├── Inward drift
│   └── Merger-like bursts
│
├── Neural Gravity Lab
│   ├── Synthetic strain signal generation
│   ├── TensorFlow.js 1D-CNN
│   ├── Live inference
│   └── Oscilloscope + confidence UI
│
└── Interaction Layer
    ├── Camera modes
    ├── Rendering presets
    ├── Screenshot/video capture modes
    └── UI controls
```

---

## Rendering Pipeline

The rendering pipeline is fragment-shader heavy.

At a high level:

1. Generate a camera ray for each pixel
2. Approximate gravitational bending near the black hole
3. Sample the background starfield through the bent ray direction
4. Intersect or approximate the accretion disk
5. Apply disk color, Doppler shift, and beaming effects
6. Add volumetric haze and cloud-like disk structure
7. Composite black hole shadow, photon-ring effects, disk emission, and background
8. Apply tone mapping, bloom, and post-processing

The system prioritizes visual quality, real-time performance, and interpretability over exact physical accuracy.

---

## Physics-Inspired Approximations

This project uses simplified models to achieve real-time performance.

### Included Approximations

- Schwarzschild/Kerr-inspired lensing behavior
- Approximate ray bending
- Doppler-shift-inspired disk coloring
- Relativistic beaming approximation
- Keplerian-style particle orbits
- Quadrupole-inspired synthetic strain generation

### Not Included

- Exact Kerr geodesic integration
- Full general relativistic ray tracing
- Real detector noise modeling
- Real LIGO/Virgo/KAGRA strain data
- Astrophysically calibrated accretion disk modeling
- Magnetohydrodynamic simulation

---

## Performance Considerations

The project is GPU-intensive because it combines:

- high-step GLSL raymarching
- volumetric disk effects
- particle systems
- post-processing bloom
- real-time UI updates
- TensorFlow.js inference/training

Performance depends heavily on GPU capability, browser, resolution, and active rendering mode.

### Example Performance Evaluation Template

| Mode | Device/GPU | Resolution | ML Enabled | Approx. FPS | Notes |
|---|---:|---:|---:|---:|---|
| Scientific Mode | low-spec laptop | 1080p | No | 3–10 | barely usable |
| Cinematic Mode | low-spec laptop | 1080p | No | 3–8 | shader bottleneck |
| Gargantua Mode | RTX-class GPU | 1080p | No | 45–60 | smooth demo |
| Cloud Traverse | RTX-class GPU | 1080p | No | 35–55 | volumetric effects active |
| Neural Gravity Lab | RTX-class GPU | 1080p | Yes | 30–50 | ML + rendering active |

Actual numbers depend on hardware and browser conditions.

---

## Suggested Evaluation Plan

To make the project more research-oriented, the following evaluation can be included:

### 1. Rendering Performance

Measure average FPS across:

- Scientific mode
- Cinematic mode
- Gargantua mode
- Cloud Traverse mode
- Neural Gravity Lab enabled/disabled

Metrics:

```text
average FPS
minimum FPS
resolution
GPU model
raymarching steps
particle count
ML enabled/disabled
```

### 2. Visual Ablation Study

Compare screenshots/videos with:

- lensing disabled vs enabled
- disk haze disabled vs enabled
- particles disabled vs enabled
- normal disk vs cloud disk
- ML panel disabled vs enabled
- Gargantua mode vs Observatory mode

This helps show the contribution of each visual subsystem.

### 3. ML Evaluation

Evaluate the synthetic classifier on held-out generated signals.

Suggested metrics:

- validation accuracy
- per-class accuracy
- inference latency
- confusion matrix
- training time
- stability across multiple runs

Example table:

| Class | Description | Expected Pattern |
|---|---|---|
| Stable Orbit | approximately constant frequency/amplitude | periodic waveform |
| Inspiral | increasing frequency and amplitude | chirp-like signal |
| Merger-like Event | plunge + damped ringdown | spike followed by decay |

---

## Limitations

This project is intentionally approximate.

Important limitations:

- The renderer is not a full general relativity solver
- The black hole is Kerr-inspired, not a true Kerr geodesic simulation
- The gravitational lensing is approximate
- The accretion disk is visually motivated, not physically calibrated
- The gravitational-wave-like signal is synthetic
- The ML classifier is trained on generated data, not real LIGO strain data
- The simulation is designed for educational and visualization purposes
- Browser/WebGL performance limits the physical and visual complexity

These limitations are intentional tradeoffs for real-time interactivity.

---

## Why This Project Matters

Neural Gravity Lab explores the intersection of:

- real-time computer graphics
- scientific visualization
- physics-inspired simulation
- browser-based machine learning
- interactive educational systems

The project demonstrates how complex scientific ideas can be turned into interactive visual systems that run directly in the browser.

Rather than presenting black hole physics as a static animation or pre-rendered video, this system allows users to interact with the scene, change rendering modes, observe synthetic orbital dynamics, and view ML-based classification feedback in real time.

---

## Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

Install dependencies:

```bash
npm install --no-package-lock
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

---

## Controls

| Key | Action |
|---|---|
| `G` | Gargantua Mode |
| `Y` | Toggle Neural Gravity Lab panel |
| `6` | Cloud Traverse Mode |
| `R` | Raise traverse height |
| `Z` | Lower traverse height |
| `N` | Toggle cinematic music |
| `O` | Observatory Mode |
| `T` | Telescope Mode |
| `B` | Beauty Capture / clean view |
| `S` | Screenshot |
| `F11` | Browser fullscreen |

---

## Recommended Demo Workflow

For recording a demo:

1. Open the project
2. Press `G` for Gargantua Mode
3. Press `B` for Beauty Capture
4. Record a clean cinematic orbit
5. Press `6` for Cloud Traverse
6. Press `Y` to show Neural Gravity Lab
7. Show oscilloscope and confidence bars
8. End with a clean black hole shot

---

## Repository Structure

```text
neural-gravity-lab/
├── index.html
├── package.json
├── README.md
├── src/
│   ├── main.js
│   ├── ml.js
│   └── shaders/
│       └── blackhole.frag.js
└── media/
    ├── demo.mp4
    ├── screenshot-1.png
    ├── screenshot-2.png
    └── architecture-diagram.png
```

---

## Future Work

Planned improvements include:

- More physically accurate ray integration
- Improved Kerr-inspired frame dragging
- Better secondary lensed disk image
- More realistic accretion disk self-shadowing
- Additional camera choreography
- Improved ML model evaluation
- Exportable performance benchmark report
- Optional real gravitational-wave data demo mode
- Blog-style technical documentation
- Interactive explanation overlays for educational use

---

## Disclaimer

This project is a physics-inspired visualization and machine learning demonstration. It is not a scientifically validated black hole simulator, not a full general relativity solver, and not a real gravitational-wave detection pipeline.

The purpose is educational, experimental, and exploratory.

---

## One-Line Summary

**Neural Gravity Lab** is a real-time WebGL black hole visualization system with GLSL gravitational lensing, cinematic accretion disk rendering, and an in-browser TensorFlow.js synthetic gravitational-wave classifier.
