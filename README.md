# Smart Dam Flood Detection System (Web Dashboard)

This project is a Next.js 14+ (App Router) web application designed to act as a **software simulation and dashboard** for the Smart Dam Flood Detection System hardware.

> **IMPORTANT:** This dashboard simulates the sensor inputs and decision logic in software. No physical sensors are connected. SMS alerts shown in this app are simulated and are not sent to a real phone.

## Features
- **Glassmorphism / Liquid UI**: Designed with a water-themed aesthetic matching the flood use case.
- **State Machine Engine**: Faithful port of the Arduino C firmware logic into TypeScript.
- **Auto Demo Mode**: Runs a simulated sequence of a flood event (rain -> water rise -> critical -> recede).
- **Interactive Controls**: Manually adjust simulated Ultrasonic, Water Depth, and Rain sensors.
- **Alerts & History**: Tracks state transitions and plots simulated telemetry via Recharts.

## Tech Stack
- Next.js 14+ (React 19)
- Tailwind CSS & shadcn/ui
- Zustand (State management)
- Prisma ORM & SQLite
- NextAuth.js (Credentials Provider)

## Getting Started

1. Clone or download this repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the database:
   ```bash
   npx prisma db push
   npx prisma generate
   npx ts-node --compilerOptions '{"module":"CommonJS"}' prisma/seed.ts
   ```
4. Create a `.env` file based on `.env.example` (or use the configured SQLite one).
5. Run the development server:
   ```bash
   npm run dev
   ```
6. Open [http://localhost:3000](http://localhost:3000) and login with:
   - **Username:** `admin`
   - **Password:** `password123`

## Security
- This project includes rate limiting on API routes.
- Next.js is configured with strict security headers (`next.config.ts`).
- Ensure dependencies are kept up-to-date by regularly running `npm audit`.
