import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, Settings, ChevronDown, ChevronUp, X } from 'lucide-react';

const StockScanner = () => {
  // State management
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('finnhub_api_key') || '');
  const [tempApiKey, setTempApiKey] = useState('');
  const [timezone, setTimezone] = useState(() => localStorage.getItem('selected_timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState([]);
  const [headlines, setHeadlines] = useState([]);
  const [debugLogs, setDebugLogs] = useState([]);
  const [showDebugger, setShowDebugger] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [marketStatus, setMarketStatus] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [volumeThreshold, setVolumeThreshold] = useState(100);

  const audioRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const headlineFetchRef = useRef(null);

  // Debug logger
  const addDebugLog = useCallback((message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString(undefined, { timeZone: timezone });
    const logEntry = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    setDebugLogs(prev => [logEntry, ...prev].slice(0, 100));
    console.log(logEntry);
  }, [timezone]);

  // Create audio ding sound using Web Audio API
  const playDing = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      addDebugLog(`Audio error: ${error.message}`, 'error');
    }
  }, [addDebugLog]);

  // Market status checker
  const checkMarketStatus = useCallback(() => {
    const now = new Date();
    const estTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const hours = estTime.getHours();
    const minutes = estTime.getMinutes();
    const day = estTime.getDay();

    let status = 'Market Closed';
    if (day >= 1 && day <= 5) {
      if (hours === 9 && minutes >= 30) status = 'Pre-Market';
      if (hours > 9 && hours < 16) status = 'Regular Hours';
      if (hours >= 16 && hours < 20) status = 'After-Hours';
      if ((hours >= 20 || hours < 4) && (day < 5 || (day === 5 && hours < 4))) status = '24-Hour Equities';
    } else if ((day === 0 || day === 6) && hours >= 16) {
      status = '24-Hour Equities';
    }

    setMarketStatus(status);
    return status;
  }, []);

  // Fetch and analyze headlines from multiple sources
  const fetchHeadlines = useCallback(async () => {
    try {
      const headlines = [];
      const sources = [
        { name: 'Seeking Alpha', url: 'https://seekingalpha.com/market-news' },
        { name: 'MarketWatch', url: 'https://www.marketwatch.com/story/market-news' },
        { name: 'Financial News', url: 'https://www.cnbc.com' }
      ];

      for (const source of sources) {
        try {
          const response = await fetch(source.url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
          });
          if (!response.ok) throw new Error(`${response.status}`);
          const html = await response.text();
          
          // Extract potential stock mentions (simplified)
          const tickerMatches = html.match(/\b[A-Z]{1,5}\b/g) || [];
          headlines.push({
            source: source.name,
            count: new Set(tickerMatches).size,
            tickers: [...new Set(tickerMatches)].slice(0, 5),
            timestamp: new Date().toLocaleTimeString(undefined, { timeZone: timezone })
          });
        } catch (error) {
          addDebugLog(`Headline fetch error from ${source.name}: ${error.message}`, 'warn');
        }
      }

      setHeadlines(headlines);
      addDebugLog(`Fetched headlines from ${headlines.length} sources`, 'info');
    } catch (error) {
      addDebugLog(`Headline analysis failed: ${error.message}`, 'error');
    }
  }, [timezone, addDebugLog]);

  // Fetch Finnhub data for volume spikes
  const fetchVolumeSpikes = useCallback(async () => {
    if (!apiKey.trim()) {
      addDebugLog('No API key configured', 'warn');
      return;
    }

    setLoading(true);
    try {
      // Popular US equities to scan
      const tickers = [
        'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'NFLX', 'GOOG', 'ADBE',
        'CRM', 'INTU', 'CSCO', 'PYPL', 'SQ', 'SHOP', 'ZOOM', 'PINS', 'SNAP', 'TW',
        'NOK', 'LNOK', 'CLNE', 'EWY', 'MKOR', 'FPA', 'AVES', 'EMMF', 'EVLU', 'PLTR'
      ];

      const spikeResults = [];
      const now = new Date();
      const currentTime = now.toLocaleTimeString(undefined, { timeZone: timezone });

      for (const ticker of tickers) {
        try {
          // Get current quote
          const quoteRes = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${apiKey}`
          );
          const quote = await quoteRes.json();

          if (quote.error) {
            addDebugLog(`Rate limit or error for ${ticker}: ${quote.error}`, 'warn');
            continue;
          }

          // Check if we have volume data
          if (quote.v && quote.pv) {
            const volumeChange = ((quote.v - quote.pv) / quote.pv) * 100;

            if (volumeChange >= volumeThreshold) {
              // Get company info
              const infoRes = await fetch(
                `https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${apiKey}`
              );
              const info = await infoRes.json();

              spikeResults.push({
                ticker,
                company: info.name || ticker,
                price: quote.c || 'N/A',
                volume: quote.v?.toLocaleString() || 'N/A',
                prevVolume: quote.pv?.toLocaleString() || 'N/A',
                volumeChange: volumeChange.toFixed(2),
                high: quote.h || 'N/A',
                low: quote.l || 'N/A',
                timestamp: currentTime,
                change: ((quote.c - quote.pc) / quote.pc * 100).toFixed(2) || 'N/A',
                changeAmount: (quote.c - quote.pc).toFixed(2) || 'N/A'
              });

              playDing();
              addDebugLog(`🎯 SPIKE DETECTED: ${ticker} - ${volumeChange.toFixed(2)}% volume increase`, 'success');
            }
          }

          // Small delay to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          addDebugLog(`Error fetching ${ticker}: ${error.message}`, 'error');
        }
      }

      if (spikeResults.length > 0) {
        setResults(spikeResults);
        setLastUpdate(new Date().toLocaleString(undefined, { timeZone: timezone }));
      } else {
        setResults([]);
        addDebugLog('No volume spikes detected in this scan', 'info');
      }

      setLoading(false);
    } catch (error) {
      addDebugLog(`Volume spike fetch failed: ${error.message}`, 'error');
      setLoading(false);
    }
  }, [apiKey, timezone, volumeThreshold, addDebugLog, playDing]);

  // Start scanning
  const startScanning = useCallback(() => {
    if (!apiKey.trim()) {
      addDebugLog('Cannot start scanning: API key required', 'error');
      return;
    }

    setScanning(true);
    addDebugLog('Scanning started', 'success');
    checkMarketStatus();

    // Initial fetch
    fetchVolumeSpikes();
    fetchHeadlines();

    // Set up intervals
    scanIntervalRef.current = setInterval(() => {
      checkMarketStatus();
      fetchVolumeSpikes();
    }, 30000); // Every 30 seconds

    headlineFetchRef.current = setInterval(() => {
      fetchHeadlines();
    }, 60000); // Every 60 seconds
  }, [apiKey, fetchVolumeSpikes, fetchHeadlines, checkMarketStatus, addDebugLog]);

  // Stop scanning
  const stopScanning = useCallback(() => {
    setScanning(false);
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    if (headlineFetchRef.current) clearInterval(headlineFetchRef.current);
    addDebugLog('Scanning stopped', 'info');
  }, [addDebugLog]);

  // Save API key
  const saveApiKey = useCallback(() => {
    if (tempApiKey.trim()) {
      localStorage.setItem('finnhub_api_key', tempApiKey);
      setApiKey(tempApiKey);
      setTempApiKey('');
      setShowSettings(false);
      addDebugLog('API key saved successfully', 'success');
    }
  }, [tempApiKey, addDebugLog]);

  // Save timezone
  const saveTimezone = useCallback((tz) => {
    localStorage.setItem('selected_timezone', tz);
    setTimezone(tz);
    addDebugLog(`Timezone changed to ${tz}`, 'info');
  }, [addDebugLog]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 font-mono">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Volume2 className="w-8 h-8 text-green-400" />
            <h1 className="text-3xl font-bold">Real-Time Stock Scanner</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowDebugger(!showDebugger)}
              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
            >
              {showDebugger ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Finnhub API Key</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={tempApiKey || apiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    placeholder="Enter your Finnhub API key"
                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500"
                  />
                  <button
                    onClick={saveApiKey}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition"
                  >
                    Save
                  </button>
                </div>
                <a
                  href="https://finnhub.io/register"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 mt-2 block"
                >
                  Get free API key →
                </a>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => saveTimezone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                >
                  <option value="America/New_York">EST (New York)</option>
                  <option value="America/Chicago">CST (Chicago)</option>
                  <option value="America/Denver">MST (Denver)</option>
                  <option value="America/Los_Angeles">PST (Los Angeles)</option>
                  <option value="Europe/London">GMT (London)</option>
                  <option value="Europe/Paris">CET (Paris)</option>
                  <option value="Asia/Tokyo">JST (Tokyo)</option>
                  <option value="Asia/Hong_Kong">HKT (Hong Kong)</option>
                  <option value="Australia/Sydney">AEDT (Sydney)</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">Volume Spike Threshold (%)</label>
                <input
                  type="number"
                  min="10"
                  max="500"
                  value={volumeThreshold}
                  onChange={(e) => setVolumeThreshold(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Status Bar */}
        <div className="grid grid-cols-4 gap-2 mb-4 text-sm">
          <div className="bg-slate-800 border border-slate-700 rounded p-3">
            <div className="text-slate-400">Status</div>
            <div className="text-lg font-bold">
              {scanning ? (
                <span className="text-green-400">● SCANNING</span>
              ) : (
                <span className="text-red-400">● IDLE</span>
              )}
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded p-3">
            <div className="text-slate-400">Market</div>
            <div className="text-lg font-bold text-blue-400">{marketStatus}</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded p-3">
            <div className="text-slate-400">Results</div>
            <div className="text-lg font-bold text-yellow-400">{results.length}</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded p-3">
            <div className="text-slate-400">Last Update</div>
            <div className="text-xs text-slate-300">{lastUpdate || 'Never'}</div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={scanning ? stopScanning : startScanning}
            disabled={!apiKey}
            className={`px-6 py-3 rounded font-bold transition ${
              scanning
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed'
            }`}
          >
            {scanning ? 'STOP SCANNING' : 'START SCANNING'}
          </button>
          <button
            onClick={() => {
              setResults([]);
              addDebugLog('Results cleared', 'info');
            }}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded transition"
          >
            Clear Results
          </button>
        </div>

        {/* Results Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3">Volume Spike Results</h2>
          {loading && (
            <div className="bg-slate-800 border border-slate-700 rounded p-4 text-center">
              <div className="inline-block animate-spin">⏳</div> Fetching data...
            </div>
          )}
          {!loading && results.length === 0 && (
            <div className="bg-slate-800 border border-slate-700 rounded p-4 text-center text-slate-400">
              {scanning ? 'No volume spikes detected. Scanning...' : 'Start scanning to find volume spikes'}
            </div>
          )}
          {results.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {results.map((result, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-r from-green-900 to-slate-800 border border-green-700 rounded p-4 animate-pulse"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-2xl font-bold text-green-400">{result.ticker}</div>
                      <div className="text-xs text-slate-400">{result.company}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">${typeof result.price === 'number' ? result.price.toFixed(2) : result.price}</div>
                      <div className={`text-sm ${parseFloat(result.change) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {result.change}% ({result.changeAmount})
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Volume Spike:</span>
                      <span className="font-bold text-green-400">{result.volumeChange}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Current Volume:</span>
                      <span className="font-bold">{result.volume}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Prev Volume:</span>
                      <span>{result.prevVolume}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Range:</span>
                      <span>${typeof result.low === 'number' ? result.low.toFixed(2) : result.low} - ${typeof result.high === 'number' ? result.high.toFixed(2) : result.high}</span>
                    </div>
                    <div className="text-right text-slate-500 pt-1">{result.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Headlines Section */}
        {headlines.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-3">Headline Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {headlines.map((h, idx) => (
                <div key={idx} className="bg-slate-800 border border-slate-700 rounded p-3">
                  <div className="font-bold text-blue-400 mb-2">{h.source}</div>
                  <div className="text-xs text-slate-400 mb-2">
                    Stock mentions: {h.count}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {h.tickers.map((t, i) => (
                      <span key={i} className="bg-slate-700 px-2 py-1 rounded text-xs">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-slate-500 mt-2">{h.timestamp}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Debug Panel */}
        {showDebugger && (
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-sm">Debug Console</h3>
              <button
                onClick={() => {
                  setDebugLogs([]);
                  addDebugLog('Console cleared', 'info');
                }}
                className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded"
              >
                Clear
              </button>
            </div>
            <div className="bg-black rounded p-3 font-mono text-xs space-y-1 max-h-64 overflow-y-auto">
              {debugLogs.length === 0 ? (
                <div className="text-slate-500">No logs yet...</div>
              ) : (
                debugLogs.map((log, idx) => (
                  <div key={idx} className="text-slate-300">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-500">
          <p>Real-time stock scanner • 30sec refresh • All market hours supported</p>
        </div>
      </div>
    </div>
  );
};

export default StockScanner;
