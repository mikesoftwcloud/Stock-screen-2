# 📦 Installation & Verification Guide

Complete guide to install the Real-Time Stock Scanner locally and verify everything works.

---

## ✅ Prerequisites

Before starting, ensure you have:

### Required Software
- **Node.js** 14+ ([Download](https://nodejs.org/))
- **npm** 6+ (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))

### Verify Installation
```bash
# Check versions (should be 14+, 6+, any version)
node --version
npm --version
git --version
```

### External Accounts
- **Finnhub API Key** (free): https://finnhub.io/register

---

## 🚀 Installation Steps

### Step 1: Clone Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/real-time-stock-scanner.git

# Enter directory
cd real-time-stock-scanner

# Verify files (should see 12+ items)
ls -la
```

Expected output:
```
.env.example
.gitignore
README.md
LICENSE
package.json
tailwind.config.js
postcss.config.js
public/
src/
```

### Step 2: Install Dependencies

```bash
# Install all required packages
npm install

# This may take 2-3 minutes on first install
# You should see no red ERR! messages
```

**What gets installed:**
- React 18.2
- React DOM 18.2
- Lucide React (icons)
- Tailwind CSS 3.3
- PostCSS
- Autoprefixer

### Step 3: Setup Environment Variables

```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local and add your Finnhub API key
# (Use your favorite text editor)
```

**Contents of .env.local:**
```
REACT_APP_FINNHUB_API_KEY=your_actual_api_key_here
REACT_APP_DEFAULT_TIMEZONE=America/New_York
REACT_APP_VOLUME_THRESHOLD=100
```

**Get API Key:**
1. Go to https://finnhub.io/register
2. Sign up (2 minutes, free)
3. Copy your API key from dashboard
4. Paste into `.env.local`

### Step 4: Start Development Server

```bash
# Start the app
npm start

# React opens a browser tab automatically
# Usually at http://localhost:3000
```

You should see:
- ✅ Compilation successful message
- ✅ Browser opens automatically
- ✅ Stock Scanner interface loads

---

## ✨ First-Run Verification

### Launch Checklist
After `npm start` completes:

1. **Page Loads** ✅
   - You see the Stock Scanner title
   - Dark theme loads
   - No errors in browser console (F12)

2. **Settings Panel** ✅
   - Click gear icon (Settings)
   - Input field for API key appears
   - Timezone dropdown works
   - Volume threshold slider works

3. **API Key Added** ✅
   - Paste your Finnhub API key
   - Click "Save"
   - Message confirms "API key saved successfully"
   - Button text changes to "START SCANNING"

4. **Scanning Works** ✅
   - Click "START SCANNING"
   - Status changes to "● SCANNING" (green)
   - Market status updates (shows current session)
   - Debug console shows logs appearing

5. **Audio Alert** ✅
   - When volume spike detected:
   - Hear a "ding" sound (800 Hz beep)
   - Green card appears with stock info
   - Debug log shows "SPIKE DETECTED"

6. **Debug Console** ✅
   - Click down arrow to expand console
   - See timestamped logs of all actions
   - Clear button works
   - Logs don't cause crashes

---

## 🧪 Test Data Validation

### Verify Real Data is Loading

In debug console, look for messages like:
```
[14:32:15] INFO: Fetching data for AAPL
[14:32:16] INFO: Fetched quote for AAPL: $189.45
[14:32:17] INFO: Scanning 30 tickers...
[14:32:18] INFO: No volume spikes detected in this scan
```

### Test Spike Detection

To test without waiting for real spike:
1. Set volume threshold to 50% (Settings panel)
2. Click "STOP SCANNING"
3. Click "START SCANNING"
4. Watch debug console for spikes

(Real 100%+ spikes happen 3-5 times daily during market hours)

### Test Audio

1. In browser dev tools (F12), go to Console
2. Paste:
```javascript
const audioContext = new AudioContext();
const osc = audioContext.createOscillator();
const gain = audioContext.createGain();
osc.connect(gain);
gain.connect(audioContext.destination);
osc.frequency.value = 800;
gain.gain.setValueAtTime(0.3, audioContext.currentTime);
gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
osc.start(audioContext.currentTime);
osc.stop(audioContext.currentTime + 0.3);
```
3. Press Enter
4. You should hear a "ding"

---

## 🔍 Troubleshooting Installation

### "npm: command not found"
```bash
# Node.js not installed
# Download from https://nodejs.org/
# Then verify:
node --version
npm --version
```

### "React app didn't start"
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm start
```

### "Cannot find module" errors
```bash
# Reinstall dependencies
npm install

# If still broken:
npm install --legacy-peer-deps
```

### "EACCES: permission denied"
```bash
# Fix npm permissions (macOS/Linux)
sudo chown -R $(whoami) ~/.npm

# Try install again
npm install
```

### Port 3000 already in use
```bash
# Use different port
PORT=3001 npm start

# Or kill process using port 3000
# macOS/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### "API key invalid"
```bash
# Verify key is correct:
1. Go to https://finnhub.io/dashboard
2. Copy your API key exactly
3. Paste into .env.local
4. Make sure no spaces before/after

# Check .env.local content:
cat .env.local
```

### "Blank page loads"
1. Open browser console (F12)
2. Check for red errors
3. Common fixes:
   - Clear browser cache (Ctrl+Shift+Del)
   - Hard refresh (Ctrl+Shift+R)
   - Check `npm start` terminal for errors

### "Button says 'Start Scanning' is disabled"
```bash
# API key not set
# Open Settings → Add API key → Click Save
# Then button becomes enabled
```

---

## 📊 Verification Checklist

After installation, verify everything with this checklist:

```
Installation
  [ ] npm install completed without errors
  [ ] node_modules folder created
  [ ] package-lock.json generated

Setup
  [ ] .env.local file created
  [ ] REACT_APP_FINNHUB_API_KEY added
  [ ] API key tested at finnhub.io/dashboard

Local Development
  [ ] npm start runs
  [ ] Browser opens to http://localhost:3000
  [ ] No red errors in console (F12)
  [ ] Page title shows "Real-Time Stock Scanner"

Application
  [ ] Settings panel opens/closes
  [ ] API key can be entered and saved
  [ ] Timezone dropdown selects timezone
  [ ] Volume threshold slider adjusts (10-500%)
  [ ] START SCANNING button becomes enabled
  [ ] Market status updates when scanning
  [ ] Debug console shows logs
  [ ] Status indicator shows green "SCANNING"

Data
  [ ] Finnhub data loads (debug logs show ticker prices)
  [ ] No "rate limit" errors in debug console
  [ ] Results appear when volume spikes detected
  [ ] Last Update timestamp changes every 30 seconds
  [ ] Headline Analysis section populates

Functionality
  [ ] Audio ding plays on volume spike
  [ ] Green cards appear with stock info
  [ ] "Clear Results" button works
  [ ] STOP SCANNING button works (turns red)
  [ ] Results disappear when no spikes
  [ ] No app crashes when data unavailable
```

---

## 🚀 Building for Production

When ready to deploy:

```bash
# Create optimized production build
npm run build

# Output in ./build folder
# Can be deployed to Vercel, Netlify, GitHub Pages, etc.
```

**Build output should:**
- Succeed with no errors
- Create ~50 KB production bundle
- Include all dependencies
- Work in any web server

---

## 📱 Testing on Different Devices

### Desktop Browsers
```bash
# Test in multiple browsers
# Chrome (recommended)
# Firefox
# Safari
# Edge

# All should work identically
```

### Mobile / Tablet
1. Get your computer's IP:
   ```bash
   # macOS/Linux:
   ifconfig | grep "inet "
   
   # Windows:
   ipconfig
   ```

2. On same WiFi, open phone browser to:
   ```
   http://YOUR_IP:3000
   ```

3. Should work on mobile (responsive design)

### Dark Mode
- App works in both light and dark system themes
- Forces dark theme in CSS

---

## 🔧 Advanced Configuration

### Custom Tickers

Edit `src/App.js` around line 210:

```javascript
const tickers = [
  'AAPL', 'MSFT', 'GOOGL',  // existing
  'YOUR_TICKER',            // add yours
  'ANOTHER_TICKER'
];
```

Then restart (`npm start`)

### Custom Scan Interval

Edit `src/App.js` around line 330:

```javascript
// Every 30 seconds (30000 milliseconds)
scanIntervalRef.current = setInterval(() => {
  checkMarketStatus();
  fetchVolumeSpikes();
}, 30000);  // Change to 15000 for 15 seconds, etc
```

### Custom Volume Threshold

Default is 100%, change in Settings panel while running.

Or set in `.env.local`:
```
REACT_APP_VOLUME_THRESHOLD=100
```

---

## 📚 File Locations

| File | Purpose |
|------|---------|
| `src/App.js` | Main component (entire app logic) |
| `src/index.js` | React entry point |
| `src/index.css` | Global styles |
| `public/index.html` | HTML template |
| `package.json` | Dependencies + scripts |
| `tailwind.config.js` | Styling configuration |
| `.env.local` | Secret API key (never commit) |

---

## 💾 Storage & Persistence

The app uses browser localStorage for:
- API key: `finnhub_api_key`
- Timezone: `selected_timezone`

These persist across page reloads/browser restarts.

To clear:
```javascript
// In browser console (F12):
localStorage.clear();
location.reload();
```

---

## 🔐 Security Notes

✅ **Secure:**
- API key stored in `.env.local` (not committed)
- Data sent directly to Finnhub (no proxy)
- No sensitive data in console logs
- No tracking or analytics

⚠️ **Be Careful:**
- Don't share your `.env.local` file
- Don't paste API key in GitHub issues
- Don't commit `.env` files
- Rotate API key if exposed

---

## 📞 Getting Help

### Check Logs First
1. Browser console (F12) → Console tab
2. App debug console (down arrow)
3. Terminal where `npm start` is running

### Common Issues
- **"Blank page"**: Check console for errors
- **"API key invalid"**: Verify at finnhub.io/dashboard
- **"No data loading"**: Check network tab (F12) for 403/401 errors
- **"App crashes"**: Look for red errors in debug console

### Resources
- Finnhub API Docs: https://finnhub.io/docs/api
- React Docs: https://react.dev
- Tailwind Docs: https://tailwindcss.com/docs
- Node.js Docs: https://nodejs.org/docs

---

## ✨ You're All Set!

Your stock scanner is now installed and running locally. Next steps:

1. **Test It**: Let it scan for 30 minutes during market hours
2. **Customize It**: Add your own tickers, adjust thresholds
3. **Deploy It**: Follow GITHUB_SETUP.md to upload and go live
4. **Share It**: Tell other traders about your scanner

**Happy scanning! 📈**

---

## 🐛 Report Issues

If something doesn't work:

1. Document the exact error
2. Include debug console logs
3. Note your Node.js/npm versions
4. Include `.env` setup (without API key)
5. Open issue on GitHub

Example:
```
Title: "npm install fails with ERR! code ERESOLVE"

Environment:
- Node v16.14.0
- npm v8.5.0
- macOS 12.3

Error:
[Full error message from terminal]

Expected:
npm install should complete without errors

Debug logs:
[Relevant logs from console]
```

---

**You've got everything you need to get started! 🚀**
