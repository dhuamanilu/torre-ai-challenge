# 🎯 Skill Gap Analyzer

A web application that compares your Torre profile skills against job requirements to identify skill gaps and calculate your match percentage.

![Skill Gap Analyzer](https://img.shields.io/badge/Torre-API-blue) ![React](https://img.shields.io/badge/React-18-61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6) ![Vite](https://img.shields.io/badge/Vite-7-646CFF)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Open http://localhost:5173 and enter:
- **Username**: Your Torre username (e.g., `torrenegra`)
- **Job ID**: A job ID from Torre (e.g., `PW9yY63W`)

## 📸 Features

- ✅ **Skill Matching**: Compares your skills against job requirements
- 📊 **Match Score**: Visual percentage showing compatibility
- 🎨 **Color-coded Results**: Green (matched), yellow (partial), red (missing)
- 🌙 **Modern Dark Theme**: Premium aesthetic with smooth animations

## 🏗️ Architecture

```
src/
├── services/
│   └── torreApi.ts        # API integration layer
├── utils/
│   └── skillMatcher.ts    # Matching algorithm
├── App.tsx                # Main React component
├── App.css                # Styling
└── main.tsx               # Entry point
```

### Data Flow

```
User Input → API Service → Torre APIs (via proxy) → Skill Matcher → UI
```

### Key Design Decisions

| Layer | Technology | Reasoning |
|-------|------------|-----------|
| **Frontend** | React + TypeScript | Type safety, component reusability |
| **Bundler** | Vite | Fast HMR, zero-config |
| **Styling** | Vanilla CSS | Full control, no dependencies |
| **API** | Vite Proxy | Bypass CORS in development |

## 🔧 Technical Details

### CORS Solution

Torre APIs don't allow cross-origin requests from browsers. We solved this with a Vite dev server proxy:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'https://torre.ai',
      changeOrigin: true,
    },
  },
}
```

### Skill Matching Algorithm

```typescript
// Proficiency levels (higher = better)
const PROFICIENCY_LEVELS = {
  'master': 5,
  'expert': 4,
  'proficient': 3,
  'novice': 2,
  'no-experience-interested': 1,
};

// Match score calculation
score = ((matched + partial * 0.5) / totalRequired) * 100
```

**Categories:**
- **Matched**: User has skill at or above required level
- **Partial**: User has skill but at lower proficiency
- **Missing**: User doesn't have the skill

## ⚖️ Trade-offs

| Decision | Trade-off |
|----------|-----------|
| **Client-side only** | Simpler architecture, but CORS requires proxy |
| **No backend** | Faster dev, but can't deploy API proxy to static hosting |
| **Simple match algorithm** | Understandable, but doesn't weight skill importance |
| **No tests** | Faster delivery, but less confidence in edge cases |

## 🎯 Assumptions

1. Torre APIs remain accessible (no rate limits encountered)
2. Skill names are comparable (case-insensitive matching)
3. Proficiency levels map reasonably to experience requirements
4. Users have access to job IDs from Torre job postings

## 🔮 Next Steps (if more time)

- [ ] Add job search (so user doesn't need to find job ID)
- [ ] Weight skills by importance/recommendations
- [ ] Add skill recommendations based on gaps
- [ ] Export comparison as PDF
- [ ] Deploy with serverless proxy (Vercel/Netlify functions)
- [ ] Add unit tests for skill matching logic
- [ ] Cache API responses for better UX

## 📚 APIs Used

- `GET /api/genome/bios/{username}` - Fetch user profile
- `GET /api/suite/opportunities/{jobId}` - Fetch job details

## 🛠️ Development

```bash
# Type checking
npx tsc --noEmit

# Run dev server
npm run dev

# Production build
npm run build
npm run preview
```

## 📝 License

Built for Torre.ai Engineering Assessment
