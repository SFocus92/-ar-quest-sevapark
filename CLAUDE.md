# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AR-Quest "СеваПарк" is a WebAR-based interactive quest application for amusement parks. Players use their mobile device cameras to discover AR markers throughout a park, following a sequential 7-stage quest that culminates in a promotional code reward.

**Key Technologies:**
- Next.js 16 (React framework with App Router)
- TypeScript
- Zustand (state management with persistence)
- Tailwind CSS + shadcn/ui components
- A-Frame + AR.js (WebAR - pattern markers)
- Planned: MindAR.js (NFT markers for real object recognition)

**Language:** All user-facing content, comments, and documentation are in Russian.

## Development Commands

```bash
# Install dependencies
npm install

# Development server (runs on port 3000, logs to dev.log)
npm run dev

# Build for production
npm run build

# Start production server (requires build first)
npm run start

# Lint code
npm run lint

# Database commands (Prisma is installed but not actively used)
npm run db:push
npm run db:generate
npm run db:migrate
npm run db:reset
```

## Architecture

### State Management Pattern

The app uses Zustand with persistence for quest state management. The single source of truth is `src/hooks/use-quest.ts`:

- **Quest state:** `isStarted`, `completedSteps`, `foundMarkers`, `isComplete`
- **AR state:** `currentMarker`, `showingContent`, `cameraReady`, `cameraError`
- **Settings:** `soundEnabled`
- **Persistence:** Quest progress is saved to localStorage under key `ar-quest-sevapark`

State updates flow through actions like `startQuest()`, `handleMarkerFound()`, `resetQuest()`.

### Quest Configuration System

All quest content is centralized in `src/lib/quest-config.ts`:

- **PARK_CONFIG:** Park name, promo code, discount, final message
- **STEPS array:** 7 sequential quest stages with marker definitions
- **MESSAGES:** User-facing feedback messages
- **AR_CONFIG:** AR detection and UI settings

Each quest step defines:
- Marker type (`pattern` for AR.js markers like Hiro/Kanji, or `nft` for real object recognition)
- Content (title, description, location, hint, clue for next step)
- 3D object type and appearance (scroll, key, gem, portal, compass, chest)
- Sound effects and animations

**To customize the quest:** Edit `quest-config.ts` - change park name, promo code, step descriptions, or add/remove stages.

### Component Architecture

**Page Flow:**
1. `src/app/page.tsx` - Main orchestrator, handles quest lifecycle
2. `src/components/ar/start-page.tsx` - Welcome screen before quest starts
3. `src/components/ar/ar-scene.tsx` - AR camera and marker detection
4. `src/components/ar/quest-ui.tsx` - Overlay UI (progress, messages, controls)
5. `src/components/ar/error-screen.tsx` - Error handling for camera/HTTPS issues

**AR Implementation:**
- A-Frame and AR.js scripts are loaded dynamically in `page.tsx`
- `ar-scene.tsx` manages camera access via WebRTC (`getUserMedia`)
- Currently uses tap-to-simulate for testing (production would use actual AR.js marker detection)
- Requires HTTPS in production (camera access restriction)

**3D Object Rendering:**
- Objects are rendered as CSS-based 3D elements (not actual glTF models yet)
- Each object type (scroll, key, gem, portal, compass, chest) has custom CSS animations
- Animations: fadeIn, scaleIn, bounceIn, rotateIn, portalIn, float

### File Structure

```
src/
├── app/
│   ├── page.tsx              # Main quest app orchestrator
│   ├── layout.tsx            # Root layout with metadata
│   ├── markers/page.tsx      # Printable markers page
│   └── api/route.ts          # API route (minimal usage)
├── components/
│   ├── ar/                   # AR-specific components
│   │   ├── ar-scene.tsx      # Camera + marker detection
│   │   ├── start-page.tsx    # Welcome screen
│   │   ├── quest-ui.tsx      # Overlay UI
│   │   └── error-screen.tsx  # Error handling
│   └── ui/                   # shadcn/ui components (40+ components)
├── hooks/
│   ├── use-quest.ts          # Quest state management (Zustand)
│   ├── use-toast.ts          # Toast notifications
│   └── use-mobile.ts         # Mobile detection
└── lib/
    ├── quest-config.ts       # Quest configuration (EDIT THIS)
    ├── utils.ts              # Utility functions (cn, etc.)
    └── db.ts                 # Database client (unused)

public/assets/
├── models/                   # 3D models (.glb) - referenced but not loaded yet
├── sounds/                   # Sound effects (.mp3) - referenced but not loaded yet
└── nft/                      # NFT marker descriptors (.fset, .fset3, .iset)
```

## Key Implementation Details

### Sequential Quest Logic

The quest enforces strict sequential progression:
- Players must find markers in order (1→2→3→4→5→6→7)
- `isValidNextStep()` in `quest-config.ts` validates marker discovery
- Finding wrong marker shows error with hint for correct marker
- Finding already-found marker shows "already found" message

### Camera and HTTPS Requirements

- **HTTPS required** in production (except localhost) for camera access
- Camera requests rear-facing camera (`facingMode: 'environment'`)
- Ideal resolution: 1280×720
- Error handling for: permission denied, camera not found, HTTPS required, browser not supported

### Dynamic Imports

A-Frame only works client-side, so:
- `ARScene` component uses `dynamic()` with `ssr: false`
- A-Frame scripts loaded via `loadScript()` helper in `page.tsx`
- Suspense boundaries handle loading states

### Marker Types

**Pattern markers** (AR.js):
- `patternType: 'hiro' | 'kanji' | 'custom'`
- Custom patterns need `.patt` file in `public/assets/markers/`

**NFT markers** (MindAR - planned):
- `nftDescriptor: '/assets/nft/tree'` (path without extension)
- Requires `.fset`, `.fset3`, `.iset` files
- Used for recognizing real objects (trees, benches, statues)

## Testing

**Local testing:**
- Run `npm run dev` and open `http://localhost:3000`
- Tap screen to simulate marker detection (7 sections = 7 markers)

**Mobile testing with HTTPS:**
- Use ngrok: `ngrok http 3000`
- Or deploy to Netlify/Vercel for instant HTTPS

**iOS Safari notes:**
- Must use Safari (not Chrome) for camera access
- Requires iOS 11+
- User must explicitly allow camera permission

## Deployment

**Netlify:**
```bash
netlify deploy --prod
```
Config in `netlify.toml` (build command: `npm run build`, publish: `.next`)

**Vercel:**
```bash
vercel --prod
```
Config in `vercel.json` (auto-detects Next.js)

Both platforms provide automatic HTTPS.

## Common Customization Tasks

**Change park name and promo code:**
Edit `PARK_CONFIG` in `src/lib/quest-config.ts`

**Modify quest stages:**
Edit `STEPS` array in `src/lib/quest-config.ts` - add/remove/modify steps

**Add custom markers:**
1. Generate `.patt` file at https://ar-js-org.github.io/AR.js/three.js/examples/marker-training.html
2. Place in `public/assets/markers/`
3. Update step config with `patternType: 'custom'` and `patternUrl: '/assets/markers/your-marker.patt'`

**Add NFT markers:**
1. Take high-quality photo of object (1920×1080, good lighting)
2. Generate descriptors (`.fset`, `.fset3`, `.iset`) using AR.js NFT tools
3. Place in `public/assets/nft/`
4. Update step config with `markerType: 'nft'` and `nftDescriptor: '/assets/nft/object-name'`

**Change UI messages:**
Edit `MESSAGES` object in `src/lib/quest-config.ts`

## Important Notes

- This is a Russian-language application - maintain Russian for all user-facing text
- The app uses standalone output mode (`next.config.ts`) for deployment flexibility
- TypeScript build errors are ignored (`ignoreBuildErrors: true`) - fix if adding strict typing
- React strict mode is disabled - re-enable if needed for development
- Prisma is installed but not actively used - database schema exists but no active queries
- 3D models (`.glb` files) are referenced but currently rendered as CSS - integrate actual models if needed
- Sound files are referenced but may need to be added to `public/assets/sounds/`
