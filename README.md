# Recruiting Automation Demo

A modern React/TypeScript demo application showcasing recruiting automation solutions.

## Tech Stack

- **Vite** - Build tool and dev server
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Lucide React** - Icons

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
  /components
    - Hero.tsx          # Landing page with 5 demo cards
    - DemoLayout.tsx    # Wrapper for demo pages
    - MetricCard.tsx    # Reusable metric display component
  /pages
    - DemoA.tsx         # AI Pre-Screening demo
    - DemoB.tsx         # Auto-Scheduling demo
    - DemoC.tsx         # Interview Kits demo
    - DemoD.tsx         # Boolean Sourcing demo
    - DemoE.tsx         # Speed + Cost Control dashboard
  /data
    - mockData.ts       # Sample data for demos
  App.tsx               # Router configuration
  main.tsx              # Entry point
```

## Features

- **Hero Page**: Interactive cards for 5 recruiting challenges
- **Demo Pages**: Detailed demonstrations of automation solutions
- **Modern UI**: Clean design with blue/purple gradient accents
- **Responsive**: Works on desktop and mobile devices
- **Smooth Animations**: Hover effects and transitions throughout

## Design System

- **Primary Colors**: Blue (#3b82f6) to Purple (#8b5cf6) gradient
- **Background**: Light gray with subtle gradient overlays
- **Typography**: Clean, professional fonts
- **Spacing**: Consistent padding and margins using Tailwind utilities
