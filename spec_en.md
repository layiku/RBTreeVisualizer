# RBTree Visualizer - Technical Specification

[中文](spec_zh.md) | [English](spec_en.md)

## 1. Project Overview
A high-fidelity, web-based educational tool for visualizing Red-Black Tree (RBT) operations. The tool focuses on the "Preview-Execute" mental model to help students understand the causality of tree balancing.

## 2. UI & UX Architecture

### 2.1 Layout Breakdown
- **Sidebar (Left, 380px)**: 
    - **Header**: Title, description, and **Language Switcher (ZH/EN)**.
    - **Control Group**: Numeric input (1-99) and "Insert" button.
    - **Speed Control**: 0.1x to 2.0x multiplier with real-time display.
    - **Button Grid**:
        - Row 1: [Prev] [Next] [Auto Play].
        - Row 2: [Finish Balancing] [Reset Tree].
    - **Rules Guide**: Card-style layout for the 4 core properties, supporting text wrapping.
- **Main Canvas (Center-Right)**: Adaptive area for tree rendering with dot-grid background.
- **Status Log (Bottom, 100px)**: Full-width, single-line log for algorithmic step descriptions with frosted glass effect.

## 3. Algorithmic Specifications (`js/rbtree.js`)

### 3.1 Data Model
- `RBNode`: `value`, `color` (Boolean RED/BLACK), `left`, `right`, `parent`.
- `RBTree`: Root pointer and a `steps` history array.

### 3.2 State Capture (Snapshotting)
Every insertion triggers a sequence of snapshots. Each snapshot object must contain:
- `root`: A deep-cloned tree structure.
- `descKey`: I18n key referencing `js/i18n.js`.
- `params`: Dynamic parameters for the translation template.
- `activeNodeValue`: The value of the node being operated on (for highlighting).

## 4. Visualization & Animation (`js/visualizer.js`)

### 4.1 Rendering Engine
- **Canvas 2D API** with High-DPI support (`devicePixelRatio`).
- **Nodes**: Spherical texture simulated via **Radial Gradients** and physical drop shadows.

### 4.2 Motion Design
- **Interpolation**: Linear interpolation (`lerp`) for coordinates.
- **Easing**: `Ease-In-Out Cubic` function for non-linear, physical movement.
- **Color Transition**: **RGB Lerping** for smooth color shifts.
- **Entry Animation**: New nodes slide in from their parent's position or drop from the top.

## 5. Interaction State Machine (`js/main.js`)

### 5.1 Internationalization (I18n)
- Centralized dictionary management.
- Runtime language switching with instant updates to UI labels and existing algorithm logs.

### 5.2 Infinite Rollback Logic
- Clicking "Prev" allows backtracking across multiple insertion operations, potentially returning to an empty tree.

## 6. Design System
- **Typography**: Inter for UI, JetBrains Mono for logs.
- **Visuals**: Modern minimalist style with heavy use of `backdrop-filter` for frosted glass effects.
