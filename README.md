# RBTree Visualizer - Step-by-Step Educational Tool

[English](README.md) | [中文](README_zh.md)

This is a Red-Black Tree algorithm demonstration tool designed for computer science education. It makes the self-balancing process of Red-Black Trees clearer than ever through high visual fidelity and innovative "Preview-Execute" step-by-step logic.

## 🌟 Core Features

- **Educational Step-by-Step Logic**: More than just showing results, it provides detailed logical previews before rotations and recoloring occur, guiding learners to think.
- **Physics-Grade Smooth Animation**: Uses **Ease-In-Out Cubic** easing functions to give nodes silky movement trajectories during rotations and rearrangements.
- **Focus Highlight System**: Active nodes feature dynamic breathing pulse halos, ensuring the learner's attention is always locked on the current point of operation.
- **Infinite History Rollback**: Supports undo functionality across operations, allowing rollback all the way to an empty tree state, perfect for comparing results of different insertion orders.
- **Adaptive Responsive Layout**: Featuring a full-width algorithm log design that automatically adjusts to your screen size for maximum readability.
- **I18n Support**: Full support for Chinese and English switching, including real-time algorithm log translation.
- **Modern Aesthetic**: Minimalist design with Inter and JetBrains Mono fonts, featuring frosted glass effects and refined shadows.

## 🏗️ Technical Implementation

- **Core Algorithm** (`rbtree.js`): Pure JavaScript implementation of Red-Black Tree with a specialized snapshot mechanism for educational stepping.
- **Visual Engine** (`visualizer.js`): High-performance Canvas 2D renderer featuring radial gradients, Lerp-based animations, and responsive scaling.
- **I18n Engine** (`i18n.js`): Centralized dictionary for real-time translation of UI and dynamic algorithm logs.
- **Controller** (`main.js`): State-machine-based logic coordinator managing user interaction, history stacks, and animation flow.

## 📂 Project Structure

```text
├── index.html          # Main entry and UI structure
├── style.css           # Modern minimalist styling & animations
├── README.md           # English documentation
├── README_zh.md        # Chinese documentation
├── spec_en.md          # Technical specification (EN)
├── spec_zh.md          # Technical specification (ZH)
└── js/
    ├── rbtree.js       # Algorithm & Snapshot logic
    ├── visualizer.js   # Canvas drawing & Animation engine
    ├── i18n.js         # Translation dictionary
    └── main.js         # Application coordinator
```

## 🚀 Quick Start

1. Open `index.html` directly in your browser.
2. Enter a number between **1-99** in the left panel and click "Insert".
3. Use **[Prev]**, **[Next]**, or **[Auto Play]** to control the demonstration pace.
4. Observe the detailed algorithm descriptions in the **Full-Width Log** at the bottom of the page.

## 📋 Technical Specification

See [spec_en.md](./spec_en.md) in the project root.

---
*This project is developed entirely with native HTML/CSS/JS and does not depend on any third-party libraries.*
