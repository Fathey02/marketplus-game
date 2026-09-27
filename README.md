# MarketPulse — Real-Time Algorithmic Trading Arena

A high-performance, event-driven trading simulation platform built with modern web technologies, simulating real-time market fluctuations, tick generation, and position lifecycle management.

## System Architecture

- **Backend:** Node.js, Express, Socket.io, TypeScript.
  - Custom market generation engine with probabilistic volatility modeling.
  - Real-time PnL and Equity recalculation loops.
  - Clean architecture with domain/interface separation.
- **Frontend:** Next.js (App Router), React, Tailwind CSS, TypeScript.
  - Streaming real-time chart visualizer.
  - Low-latency state synchronization with WebSockets.
  - Responsive dark-mode financial desk UI.

## Getting Started

### Backend
```bash
cd server
npm install
npm run dev
```

### Frontend
cd client
npm install
npm run dev
