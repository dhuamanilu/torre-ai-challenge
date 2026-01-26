# 🎯 Skill Gap Analyzer

A web application that compares your Torre profile skills against job requirements to identify skill gaps and calculate your match percentage.

![Skill Gap Analyzer](https://img.shields.io/badge/Torre-API-blue) ![React](https://img.shields.io/badge/React-19-61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6) ![Vite](https://img.shields.io/badge/Vite-7-646CFF) ![Tests](https://img.shields.io/badge/Tests-7%20passed-22c55e)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

Open http://localhost:5173 and:
1. Enter your **Torre username** (e.g., `torrenegra`)
2. **Search for jobs** by keyword (e.g., "React Developer")
3. **Select a job** from the search results
4. Click **Analyze Skill Gap**

## 📸 Features

- 🔍 **Job Search**: Search for jobs by keyword - no need to find job IDs
- 👤 **Profile Summary**: View your top skills before starting analysis
- ✅ **Skill Matching**: Compares your skills against job requirements
- 📊 **Match Score**: Visual percentage showing compatibility
- 🎨 **Color-coded Results**: Green (matched), yellow (partial), red (missing)
- 🌙 **Modern Dark Theme**: Premium aesthetic with smooth animations
- ✅ **Unit Tests**: Comprehensive tests for skill matching algorithm

## 🏗️ Architecture

```
src/
├── services/
│   └── torreApi.ts        # API integration layer (profile, job, search)
├── utils/
│   └── skillMatcher.ts    # Matching algorithm
├── __tests__/
│   └── skillMatcher.test.ts  # Unit tests (7 tests)
├── App.tsx                # Main React component with job search
├── App.css                # Styling
└── main.tsx               # Entry point
```

### Data Flow

```
User Input → Job Search API → Select Job → Fetch Profile + Job → Skill Matcher → UI
```

### Key Design Decisions

| Layer | Technology | Reasoning |
|-------|------------|-----------|
| **Frontend** | React 19 + TypeScript | Type safety, component reusability |
| **Bundler** | Vite 7 | Fast HMR, built-in proxy support |
| **Styling** | Vanilla CSS | Full control, no dependencies |
| **API** | Vite Proxy | Bypass CORS in development |
| **Testing** | Vitest | Fast, Vite-native testing |

## 🔧 Technical Details

### CORS Solution

Torre APIs don't allow cross-origin requests. We use Vite dev server proxies:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'https://torre.ai',
      changeOrigin: true,
    },
    '/search-api': {
      target: 'https://search.torre.co',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/search-api/, ''),
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

## ✅ Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch
```

**Test Coverage:**
- Full/partial/missing skill detection
- Case-insensitive skill matching
- Score calculation accuracy
- Edge cases (empty skills, no matches)

## ⚖️ Trade-offs

| Decision | Trade-off |
|----------|-----------|
| **Client-side only** | Simpler architecture, but CORS requires proxy |
| **No backend** | Faster dev, but can't deploy API proxy to static hosting |
| **Simple match algorithm** | Understandable, but doesn't weight skill importance |
| **Vite proxy** | Works in dev, but production needs serverless functions |

## 🎯 Assumptions

1. Torre APIs remain accessible (no rate limits encountered)
2. Skill names are comparable (case-insensitive matching)
3. Proficiency levels map reasonably to experience requirements
4. Job search returns relevant results for common keywords

## 🔮 Future Improvements

- [ ] Weight skills by importance/recommendations
- [ ] Add skill recommendations based on gaps
- [ ] Export comparison as PDF
- [ ] Deploy with serverless proxy (Vercel/Netlify functions)
- [ ] Cache API responses for better UX

## 📚 APIs Used

- `GET /api/genome/bios/{username}` - Fetch user profile
- `GET /api/suite/opportunities/{jobId}` - Fetch job details
- `POST /search-api/opportunities/_search` - Search jobs by keyword

## 🛠️ Development

```bash
# Type checking
npx tsc --noEmit

# Run dev server
npm run dev

# Run tests
npm test

# Production build
npm run build
npm run preview
```

## 📝 License

Built for Torre.ai Engineering Assessment
