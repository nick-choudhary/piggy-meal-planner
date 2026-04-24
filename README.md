# 🐷 Piggy — Weekly Meal Planner

AI-powered weekly meal planner that orchestrates across **Swiggy Food**, **Instamart**, and **Dineout** to generate personalized 7-day meal plans.

🔗 **Live Demo:** [piggy-meal-planner.netlify.app](https://piggy-meal-planner.netlify.app)

Built on [Swiggy's MCP Builders Club](https://mcp.swiggy.com/builders/) platform.

## What It Does

Piggy takes your weekly schedule, budget, dietary preferences, and health goals — then generates an optimized meal plan that mixes:

- 🏠 **Home cooking** (groceries via Instamart)
- 🛵 **Food delivery** (via Swiggy Food)
- 🍽️ **Dining out** (reservations via Dineout)

The plan includes cost breakdown, daily nutrition summary, and a consolidated grocery list.

## Architecture

```
User Input → Intake → Plan Generator → Constraint Solver → Meal Resolver → Aggregator → Weekly Plan
                                              ↕                    ↕
                                        (iterative)          [Instamart MCP]
                                                             [Food MCP]
                                                             [Dineout MCP]
```

**Pipeline:** Intake → Planning → Constraint Solving (max 5 iterations) → Resolution (parallel) → Aggregation

## Project Structure

```
├── src/                    # Backend — TypeScript meal planner engine
│   ├── components/         # Core pipeline components
│   │   ├── orchestrator.ts     # Main pipeline coordinator
│   │   ├── intake-processor.ts # Input validation & normalization
│   │   ├── plan-generator.ts   # Meal slot creation & source assignment
│   │   ├── constraint-solver.ts# Budget, nutrition, schedule validation
│   │   ├── meal-resolver.ts    # Resolves slots via Swiggy MCP APIs
│   │   └── aggregator.ts       # Compiles final plan & grocery list
│   ├── mcp/                # MCP client wrappers (Food, Instamart, Dineout)
│   ├── models/             # TypeScript types & enums
│   ├── data/               # Built-in recipe database
│   └── utils/              # Validation & helper functions
├── frontend/               # Next.js dashboard UI
│   └── src/
│       ├── app/            # App router pages
│       └── components/     # UI components (shadcn/ui + Tailwind)
└── .kiro/specs/            # Design docs & requirements
```

## Quick Start

### Backend (CLI)

```bash
npm install
npx ts-node src/index.ts
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Backend:** TypeScript, Node.js, @modelcontextprotocol/sdk
- **Frontend:** Next.js 16, Tailwind CSS v4, shadcn/ui, Lucide icons
- **Fonts:** DM Sans + Inter
- **MCP:** Swiggy Builders Club (Food, Instamart, Dineout servers)

## Status

✅ Full pipeline implemented and running (CLI + frontend demo)
⏳ Awaiting Swiggy MCP access for live API integration

---

Powered by **Swiggy** MCP Builders Club
