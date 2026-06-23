# 📁 File Reference Guide

Complete index of all Real-Time Stock Scanner files and their purposes.

---

## 📦 Project Files Overview

Total files: **12 items**
Total size: ~200 KB (uncompressed)
Dependencies: React 18, Tailwind CSS, Lucide Icons

---

## 📂 File Structure

```
real-time-stock-scanner/
├── 📄 package.json                 ← Dependencies & scripts
├── 📄 package-lock.json            ← (auto-generated)
├── 📄 tailwind.config.js           ← Tailwind configuration
├── 📄 postcss.config.js            ← PostCSS configuration
├── 📄 .gitignore                   ← Git ignore rules
├── 📄 .env.example                 ← Environment template
├── 📄 .env.local                   ← (your API key, never commit)
│
├── 📄 README.md                    ← Main GitHub documentation
├── 📄 LICENSE                      ← MIT License
│
├── 📁 public/
│   ├── 📄 index.html               ← HTML entry point
│   ├── 📄 favicon.ico              ← Browser tab icon
│   └── 📄 manifest.json            ← PWA manifest (optional)
│
└── 📁 src/
    ├── 📄 App.js                   ← Main React component
    ├── 📄 index.js                 ← React DOM entry
    └── 📄 index.css                ← Global styles
```

---

## 📋 Detailed File Reference

### Root Configuration Files

#### **package.json**
- **Purpose**: Dependencies, scripts, project metadata
- **Edit When**: Adding packages, changing scripts
- **Key Scripts**:
  - `npm start` → Development server
  - `npm run build` → Production build
  - `npm run deploy` → GitHub Pages deployment

#### **tailwind.config.js**
- **Purpose**: Tailwind CSS customization
- **Edit When**: Custom colors, fonts, breakpoints
- **Default**: Slate color theme (dark mode)

#### **postcss.config.js**
- **Purpose**: PostCSS plugin configuration
- **Edit When**: Advanced CSS processing needed
- **Current**: Tailwind + Autoprefixer

#### **.gitignore**
- **Purpose**: Files/folders Git should ignore
- **Critical**: Prevents committing:
  - `node_modules/`
  - `.env*` (never commit API key)
  - `build/`
- **⚠️ IMPORTANT**: Must be named `.gitignore` (with dot)

#### **.env.example**
- **Purpose**: Template for environment variables
- **Edit When**: Adding new env vars
- **Never Commit**: Always commit `.example`, never commit `.env.local`
- **Usage**: Users copy to `.env.local` and fill in values

#### **.env.local** (Not in repo)
- **Purpose**: Your secret API key
- **Edit When**: Changing API key
- **⚠️ NEVER COMMIT**: Add to .gitignore
- **Contains**:
  ```
  REACT_APP_FINNHUB_API_KEY=your_actual_key_here
  ```

---

### Documentation Files

#### **README.md**
- **Purpose**: Main GitHub documentation
- **Content**: Features, setup, deployment, troubleshooting
- **GitHub Shows**: Displays on repo homepage
- **Edit When**: Major changes, new features
- **Should Include**:
  - ✅ Features overview
  - ✅ Quick start
  - ✅ Deployment options
  - ✅ Troubleshooting
  - ✅ Links to detailed guides

#### **LICENSE**
- **Purpose**: MIT license terms
- **Never Edit**: Keep as-is
- **Needed For**: Open source GitHub repos
- **Allows**: Others to use, modify, distribute with attribution

---

### HTML Files

#### **public/index.html**
- **Purpose**: HTML entry point for React app
- **Edit When**: Adding meta tags, favicons, changing title
- **Contains**: `<div id="root"></div>` where React renders
- **Never Delete**: App won't load without it
- **Key Elements**:
  - Responsive viewport meta tag
  - Page title
  - Root div
  - No JavaScript (React handles it)

---

### React Component Files

#### **src/App.js**
- **Purpose**: Main stock scanner component
- **Size**: ~400 lines (entire app in one file)
- **Contains**:
  - State management (React hooks)
  - Finnhub API integration
  - Volume spike detection logic
  - Headline fetching
  - Debug console
  - UI rendering
- **Edit When**: Adding features, changing logic
- **Key Functions**:
  - `fetchVolumeSpikes()` → Gets stock data
  - `fetchHeadlines()` → Scrapes news
  - `startScanning()` → Begins data collection
  - `playDing()` → Audio alert

#### **src/index.js**
- **Purpose**: React entry point
- **Never Edit**: Handles React DOM mounting
- **Simple**: Just 6 lines, renders App to root div

#### **src/index.css**
- **Purpose**: Global styles
- **Contains**:
  - Tailwind directives
  - Custom animations
  - Scrollbar styling
- **Edit When**: Changing global look/feel

---

## 🔄 How Files Work Together

```
User opens browser
  ↓
public/index.html loads (HTML skeleton)
  ↓
src/index.js runs (React entry point)
  ↓
src/App.js renders (main component)
  ↓
src/index.css applies (global styles)
  ↓
tailwind.config.js provides (colors, spacing)
  ↓
.env.local provides REACT_APP_FINNHUB_API_KEY
  ↓
App fetches data from Finnhub API
  ↓
User sees stock scanner interface
```

---

## 📝 When to Edit Each File

### I Want To...

#### Add a New NPM Package
Edit: `package.json`
```bash
npm install new-package
# This auto-updates package.json
```

#### Change Colors/Theme
Edit: `tailwind.config.js`
```javascript
colors: {
  customColor: '#123456'
}
```

#### Customize API Key Variable Name
Edit: `.env.example` AND `src/App.js`
```
.env.example:
REACT_APP_MY_API_KEY=your_key

src/App.js:
const apiKey = process.env.REACT_APP_MY_API_KEY
```

#### Add New Stock Tickers
Edit: `src/App.js` (line ~210)
```javascript
const tickers = ['AAPL', 'YOUR_TICKER']
```

#### Change Scan Frequency
Edit: `src/App.js` (line ~330)
```javascript
setInterval(() => {...}, 15000)  // 15 seconds
```

#### Modify Alert Sound
Edit: `src/App.js` (line ~84)
```javascript
oscillator.frequency.value = 1000  // Higher pitch
```

#### Update GitHub Documentation
Edit: `README.md`
- Features list
- Setup instructions
- Deployment links

#### Change UI Layout
Edit: `src/App.js` (JSX section)
or `src/index.css` (styling)

#### Hide Something from Git
Edit: `.gitignore`
```
*.log
temp/
```

---

## 🔐 Security: What NOT To Do

❌ **NEVER DO THIS**:
- Put API key in `src/App.js`
- Commit `.env.local` file
- Share your `.env.local` publicly
- Paste API key in GitHub issues
- Store secrets in comments

✅ **ALWAYS DO THIS**:
- Use `.env.local` for API key
- Add `.env*` to `.gitignore`
- Use `process.env.REACT_APP_*` in code
- Rotate API key if exposed
- Review `.gitignore` before pushing

---

## 📊 File Dependencies Map

```
package.json
  ├── Specifies React
  ├── Specifies Tailwind
  ├── Specifies Lucide
  └── Runs npm scripts

src/index.js
  ├── Depends on: React, ReactDOM
  └── Renders to: public/index.html#root

src/App.js
  ├── Depends on: React, lucide-react
  ├── Uses: .env.local (REACT_APP_FINNHUB_API_KEY)
  └── Styles from: src/index.css

src/index.css
  ├── Depends on: tailwind.config.js
  └── Imports: Tailwind directives

tailwind.config.js
  ├── Depends on: postcss.config.js
  └── Provides: Design tokens

public/index.html
  └── No dependencies (static HTML)
```

---

## 📈 File Growth

As you add features:

| Feature | Files Affected |
|---------|----------------|
| New ticker list | `src/App.js` |
| Custom styling | `src/index.css`, `tailwind.config.js` |
| New API integration | `.env.example`, `src/App.js` |
| Database backend | `package.json`, new API calls |
| Authentication | Multiple files, new setup |
| Tests | New `src/*.test.js` files |
| Utils | New `src/utils/` folder |

---

## 🚀 File Deployment

When deploying, these files go to production:

✅ **Included**:
- `public/index.html`
- `src/App.js`, `src/index.js`, `src/index.css`
- Compiled CSS (Tailwind)
- Compiled JS (React + App)

❌ **Not Included** (stays local):
- `node_modules/` (regenerated on server)
- `.env.local` (secret, set on server)
- Source maps (removed in production build)
- Git files (`.git/`, `.gitignore`)
- Development files (`*test.js`, `*mock.js`)

---

## 🔍 File Size Reference

| File | Size | Why |
|------|------|-----|
| `src/App.js` | 12 KB | Main component code |
| `package.json` | 1 KB | Metadata only |
| `public/index.html` | 1 KB | Minimal HTML |
| Compiled bundle | ~50 KB | Minified, includes React |
| With source maps | ~150 KB | Development only |

---

## 📚 File Modification Frequency

### Change Often (During Development)
- `src/App.js` (features, bugs)
- `src/index.css` (styling tweaks)
- `.env.example` (new env vars)

### Change Sometimes (New Features)
- `tailwind.config.js` (colors, fonts)
- `package.json` (new dependencies)
- `README.md` (documentation)

### Change Rarely (Stable)
- `public/index.html` (fixed structure)
- `src/index.js` (React entry)
- `postcss.config.js` (processor config)
- `LICENSE` (legal document)

### Never Change (Template)
- `.gitignore` (best practices)

---

## 🛠️ Common File Tasks

### Task: Change API Key Name
```bash
1. Edit .env.example:
   REACT_APP_NEW_KEY_NAME=value

2. Edit src/App.js:
   const apiKey = process.env.REACT_APP_NEW_KEY_NAME

3. Test:
   npm start
```

### Task: Add Dark/Light Theme Toggle
```bash
1. Edit src/App.js:
   const [darkMode, setDarkMode] = useState(true)
   
2. Edit src/index.css:
   Add dark mode styles
   
3. Edit tailwind.config.js:
   darkMode: 'class'
```

### Task: Split Component Into Multiple Files
```bash
1. Create src/components/VolumeResults.js
2. Move volume display code there
3. In src/App.js:
   import VolumeResults from './components/VolumeResults'
   <VolumeResults results={results} />
```

### Task: Add Testing
```bash
1. Install Jest:
   npm install --save-dev jest

2. Create src/App.test.js
3. npm test
```

---

## 📖 File Reading Guide

**New to the project?** Read in this order:
1. **README.md** - Overview and features
2. **INSTALLATION.md** - How to setup locally
3. **src/App.js** - Main logic (400 lines, well-commented)
4. **src/index.css** - Styling approach
5. **package.json** - Dependencies
6. **DEPLOYMENT.md** - How to go live

**Want to customize?** Jump to:
- **Tickers**: `src/App.js` line ~210
- **Colors**: `tailwind.config.js`
- **Scan Frequency**: `src/App.js` line ~330
- **API Key**: `.env.local`

---

## ✨ File Checklist

Before shipping production:

```
Core Files
  [ ] src/App.js - Complete
  [ ] src/index.js - Unchanged
  [ ] src/index.css - Styled properly
  [ ] public/index.html - Valid HTML
  
Config Files
  [ ] package.json - All deps listed
  [ ] tailwind.config.js - Theme set
  [ ] postcss.config.js - Plugins configured
  [ ] .env.example - Template complete
  [ ] .gitignore - Secrets protected
  
Documentation
  [ ] README.md - Accurate & complete
  [ ] LICENSE - Included
  
Build Verification
  [ ] npm install succeeds
  [ ] npm start works
  [ ] npm run build succeeds
  [ ] No console errors
  [ ] No console warnings
```

---

## 🎯 Quick Reference

| Need | File | Line/Section |
|------|------|--------------|
| Add ticker | `src/App.js` | ~210 |
| Change sound | `src/App.js` | ~84 |
| Change colors | `tailwind.config.js` | theme.colors |
| Add env var | `.env.example` + `src/App.js` | anywhere |
| Change title | `public/index.html` | `<title>` |
| Update docs | `README.md` | anywhere |
| Hide from git | `.gitignore` | anywhere |
| Update deps | `package.json` | dependencies |

---

**Every file has a purpose. Keep it clean. Ship it proud.** 🚀

