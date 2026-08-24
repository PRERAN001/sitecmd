import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal,
  Globe,
  Radio,
  Play,
  Layers,
  ArrowRight,
  Check,
  Copy,
  ChevronRight,
  Shield,
  Sliders,
  Sparkles,
  GitBranch,
  RefreshCw,
  Search,
  MousePointer,
  Zap,
  Code2,
  Lock,
  Boxes,
  Compass
} from 'lucide-react';

const PRESETS = {
  github: {
    id: 'github',
    name: 'GitHub Search',
    site: 'github.com',
    command: 'github.search',
    targetUrl: 'https://github.com/search',
    description: 'Filter repositories by language, topic, and minimum star thresholds.',
    steps: [
      { id: 1, type: 'click', target: 'Search input', selector: 'input[name="q"]', time: '0.12s' },
      { id: 2, type: 'input', target: 'Search query', selector: 'input[name="q"]', value: 'playwright', param: 'query', time: '0.45s' },
      { id: 3, type: 'click', target: 'Filter dropdown', selector: 'button#filter-btn', time: '0.82s' },
      { id: 4, type: 'change', target: 'Language filter', selector: 'select[name="lang"]', value: 'typescript', param: 'language', time: '1.05s' },
      { id: 5, type: 'network', target: 'API search fetch', method: 'GET', url: '/api/v3/search/repo', status: 200, time: '1.20s' }
    ],
    initialParams: {
      query: 'webcmd',
      language: 'typescript',
      min_stars: 100
    },
    schema: [
      { key: 'query', type: 'string', required: true, label: 'Search Query' },
      { key: 'language', type: 'string', required: false, label: 'Language' },
      { key: 'min_stars', type: 'number', required: false, label: 'Min Stars' }
    ]
  },
  swiggy: {
    id: 'swiggy',
    name: 'Swiggy Food Search',
    site: 'swiggy.com',
    command: 'food.search',
    targetUrl: 'https://swiggy.com/search',
    description: 'Search top-rated restaurants with vegetarian filter and delivery time caps.',
    steps: [
      { id: 1, type: 'click', target: 'Location modal', selector: 'div.location-box', time: '0.10s' },
      { id: 2, type: 'input', target: 'Dish input', selector: 'input.search-bar', value: 'biryani', param: 'dish', time: '0.38s' },
      { id: 3, type: 'change', target: 'Rating threshold', selector: 'input[name="rating"]', value: '4.5', param: 'min_rating', time: '0.74s' },
      { id: 4, type: 'click', target: 'Veg Only toggle', selector: 'button.veg-toggle', value: 'true', param: 'veg_only', time: '0.95s' },
      { id: 5, type: 'network', target: 'Catalog search API', method: 'GET', url: '/dapi/restaurants/v3', status: 200, time: '1.15s' }
    ],
    initialParams: {
      dish: 'dum biryani',
      min_rating: 4.5,
      veg_only: true
    },
    schema: [
      { key: 'dish', type: 'string', required: true, label: 'Dish / Cuisine' },
      { key: 'min_rating', type: 'number', required: false, label: 'Min Rating' },
      { key: 'veg_only', type: 'boolean', required: false, label: 'Veg Only' }
    ]
  },
  blinkit: {
    id: 'blinkit',
    name: 'Blinkit Instant Search',
    site: 'blinkit.com',
    command: 'grocery.search',
    targetUrl: 'https://blinkit.com',
    description: 'Pull instant grocery items with max budget constraints.',
    steps: [
      { id: 1, type: 'click', target: 'Search field', selector: 'div.search-bar-trigger', time: '0.15s' },
      { id: 2, type: 'input', target: 'Item name', selector: 'input[placeholder*="Search"]', value: 'oats', param: 'item', time: '0.40s' },
      { id: 3, type: 'change', target: 'Max price cap', selector: 'input[name="max_price"]', value: '300', param: 'max_price', time: '0.78s' },
      { id: 4, type: 'network', target: 'Inventory lookup', method: 'POST', url: '/v1/instant/inventory', status: 200, time: '1.02s' }
    ],
    initialParams: {
      item: 'cold brew',
      max_price: 250
    },
    schema: [
      { key: 'item', type: 'string', required: true, label: 'Item Name' },
      { key: 'max_price', type: 'number', required: false, label: 'Max Price (₹)' }
    ]
  }
};

export default function App() {
  const [copiedKey, setCopiedKey] = useState(null);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#070709] text-[#e2e2e8] font-sans antialiased selection:bg-[#20202a] selection:text-white relative overflow-x-hidden">
      {/* Background Micro-Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-gradient-to-b from-white/[0.04] to-transparent blur-3xl pointer-events-none" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-[#16161d] bg-[#070709]/85 backdrop-blur-md">
        <div className="max-w-6xl mx-auto h-14 px-6 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-neutral-100 text-black flex items-center justify-center font-bold text-xs shadow-sm">
              &gt;_
            </div>
            <span className="font-semibold tracking-tight text-white text-sm">sitecmd</span>
            <span className="text-[10px] text-neutral-500 border border-[#22222c] bg-[#0d0d12] px-1.5 py-0.5 rounded">
              v0.1.0-alpha
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-neutral-400">
            <a href="#demo" className="hover:text-neutral-200 transition-colors">Interactive Engine</a>
            <a href="#how-it-works" className="hover:text-neutral-200 transition-colors">How it works</a>
            <a href="#architecture" className="hover:text-neutral-200 transition-colors">Architecture</a>
            <a href="#cli" className="hover:text-neutral-200 transition-colors">CLI</a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-neutral-400 hover:text-neutral-200 px-3 py-1.5 rounded transition-colors"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <button className="flex items-center gap-1.5 px-3.5 py-1.5 bg-neutral-100 hover:bg-white text-black font-semibold rounded text-xs transition-colors shadow-sm">
              <span>Get Started</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-20 pb-16 px-6 max-w-6xl mx-auto">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-[#20202c] bg-[#0d0d12] font-mono text-[11px] text-neutral-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Programmable Web Layer for Engineers &amp; AI Agents</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.08]">
            Turn any website <br />
            <span className="text-neutral-400">into a programmable command.</span>
          </h1>

          <p className="text-base sm:text-lg text-neutral-400 leading-relaxed max-w-2xl font-normal">
            Teach Sitecmd how you use a website once. Turn the interaction into a reusable, parameterized command that can be executed from your terminal, code, or autonomous agents.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 font-mono text-xs">
            <a
              href="#demo"
              className="flex items-center gap-2 px-4 py-2.5 bg-neutral-100 hover:bg-white text-black font-semibold rounded transition-colors shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>Try Live Engine</span>
            </a>
            <div className="flex items-center bg-[#0d0d12] border border-[#1f1f2a] rounded px-3 py-2 text-neutral-300 gap-2">
              <span className="text-neutral-500">$</span>
              <code>npm install -g sitecmd</code>
              <button
                onClick={() => copyToClipboard('npm install -g sitecmd', 'npm_copy')}
                className="text-neutral-500 hover:text-neutral-200 ml-1"
                title="Copy install command"
              >
                {copiedKey === 'npm_copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE WORKFLOW ENGINE DEMO */}
      <section id="demo" className="py-10 px-6 max-w-6xl mx-auto">
        <LiveWorkflowInteractiveEngine />
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-24 border-t border-[#15151e] px-6 max-w-6xl mx-auto">
        <div className="mb-14 space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-semibold">
            Execution Lifecycle
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            How Sitecmd works
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 font-mono">
            Teach once, parameterize automatically, execute endlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <WorkflowLifecycleCard
            step="01"
            title="Connect"
            tag="Session Vault"
            description="Connect to a website and authenticate once. Sitecmd persists your browser cookies, tokens, and storage state in an isolated sandbox profile."
          />
          <WorkflowLifecycleCard
            step="02"
            title="Learn"
            tag="Interaction Recorder"
            description="Interact with the website naturally. Sitecmd records clicks, inputs, filters, dynamic dropdowns, navigations, and background network calls."
          />
          <WorkflowLifecycleCard
            step="03"
            title="Compile"
            tag="Schema Compiler"
            description="Sitecmd automatically infers dynamic parameter keys (strings, numbers, booleans) from your session and compiles a clean, reusable command."
          />
          <WorkflowLifecycleCard
            step="04"
            title="Run"
            tag="Deterministic Replay"
            description="Replay the workflow with custom inputs from your terminal, shell scripts, cron jobs, or autonomous AI agents with headless determinism."
          />
        </div>
      </section>

      {/* SYSTEM ARCHITECTURE PIPELINE */}
      <section id="architecture" className="py-24 border-t border-[#15151e] px-6 max-w-6xl mx-auto">
        <div className="mb-12 space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-semibold">
            System Architecture
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Built for deterministic execution
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 font-mono">
            No brittle CSS scrapers. Sitecmd couples browser sessions with heuristic DOM event synthesis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-mono text-xs">
          <div className="bg-[#0b0b0f] border border-[#1a1a24] rounded-lg p-6 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold">
              <Shield className="w-4 h-4 text-blue-400" />
              <span>Isolated Session Profiles</span>
            </div>
            <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
              Login state, 2FA tokens, and session cookies stay in encrypted local storage. The daemon executes workflows without prompting for login credentials again.
            </p>
            <div className="text-[10px] text-neutral-500 bg-[#07070a] p-2 rounded border border-[#161620]">
              ~/.sitecmd/profiles/prf_gh_88a91c
            </div>
          </div>

          <div className="bg-[#0b0b0f] border border-[#1a1a24] rounded-lg p-6 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold">
              <Boxes className="w-4 h-4 text-purple-400" />
              <span>Selector Reliability Scoring</span>
            </div>
            <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
              Every captured element is scored (Stable, Warning, Dynamic) using semantic testids, ARIA roles, and fuzzy DOM pathing to prevent replay breakage.
            </p>
            <div className="text-[10px] text-emerald-400 bg-[#07070a] p-2 rounded border border-[#161620] flex items-center justify-between">
              <span>[data-testid="search-input"]</span>
              <span className="text-[9px] uppercase font-bold">Stable</span>
            </div>
          </div>

          <div className="bg-[#0b0b0f] border border-[#1a1a24] rounded-lg p-6 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Dry Run &amp; Simulation</span>
            </div>
            <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
              Validate parameter injection and execution steps ahead of time without making actual state-changing network requests or browser mutations.
            </p>
            <div className="text-[10px] text-neutral-400 bg-[#07070a] p-2 rounded border border-[#161620]">
              $ sitecmd run food.search --dry-run
            </div>
          </div>
        </div>
      </section>

      {/* DEVELOPER CLI SECTION */}
      <section id="cli" className="py-24 border-t border-[#15151e] px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">
          <div className="space-y-4">
            <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-semibold">
              CLI &amp; Toolchain
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              A serious terminal interface for serious workflows.
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 font-mono leading-relaxed">
              Compose commands with Unix pipes, export JSON schemas for OpenAI/Anthropic tool calling, and trigger headless browser replays effortlessly.
            </p>
            <div className="pt-2 font-mono text-xs space-y-2">
              <div className="flex items-center gap-2 text-neutral-300">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero DOM scraping scripts to maintain</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-300">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>JSON schema export for LLM function calling</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-300">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Headless or headed debugging mode</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <InteractiveCliRunner />
          </div>
        </div>
      </section>

      {/* VISION STATEMENT */}
      <section className="py-24 border-t border-[#15151e] px-6 max-w-4xl mx-auto text-center space-y-6">
        <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-semibold">
          The Vision
        </div>
        <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
          Websites shouldn't just be places you visit.<br />
          <span className="text-neutral-400">They should be programmable tools.</span>
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 font-mono max-w-2xl mx-auto leading-relaxed">
          Sitecmd turns human browser actions into reusable, programmable commands that work across terminal utilities, backend APIs, automated cron jobs, and agent runtimes.
        </p>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 border-t border-[#15151e] px-6 max-w-6xl mx-auto">
        <div className="bg-[#0b0b0f] border border-[#1b1b26] rounded-xl p-10 sm:p-14 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Make your websites programmable.
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 font-mono max-w-md mx-auto">
            Install the open-source CLI and start compiling workflows in under 2 minutes.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 font-mono text-xs">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-neutral-100 hover:bg-white text-black font-semibold rounded transition-colors shadow-sm">
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-[#121218] hover:bg-[#1a1a24] border border-[#242434] text-neutral-300 rounded transition-colors"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>View on GitHub</span>
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#15151e] py-10 px-6 max-w-6xl mx-auto font-mono text-xs text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-neutral-200 text-black flex items-center justify-center font-bold text-[10px]">
            &gt;_
          </div>
          <span className="text-neutral-300 font-semibold">sitecmd</span>
          <span>— Turn websites into programmable tools.</span>
        </div>

        <div className="flex items-center gap-6">
          <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-neutral-300 transition-colors">GitHub</a>
          <a href="#cli" className="hover:text-neutral-300 transition-colors">Documentation</a>
          <a href="https://x.com" target="_blank" rel="noreferrer" className="hover:text-neutral-300 transition-colors">X</a>
        </div>
      </footer>
    </div>
  );
}

// =========================================================================
// LIVE INTERACTIVE WORKFLOW DEMO ENGINE (HERO PLAYGROUND)
// =========================================================================

function LiveWorkflowInteractiveEngine() {
  const [selectedPresetKey, setSelectedPresetKey] = useState('github');
  const preset = PRESETS[selectedPresetKey];

  const [isTeaching, setIsTeaching] = useState(false);
  const [recordedSteps, setRecordedSteps] = useState(preset.steps);
  const [activeStepIndex, setActiveStepIndex] = useState(preset.steps.length);
  const [isCompiled, setIsCompiled] = useState(true);

  // Dynamic Parameter Runner state
  const [paramInputs, setParamInputs] = useState(preset.initialParams);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionLogs, setExecutionLogs] = useState([]);
  const [executionFinished, setExecutionFinished] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync inputs on preset change
  useEffect(() => {
    setParamInputs(PRESETS[selectedPresetKey].initialParams);
    setRecordedSteps(PRESETS[selectedPresetKey].steps);
    setActiveStepIndex(PRESETS[selectedPresetKey].steps.length);
    setIsCompiled(true);
    setIsTeaching(false);
    setIsExecuting(false);
    setExecutionLogs([]);
    setExecutionFinished(false);
  }, [selectedPresetKey]);

  // Handle "Teach Workflow" simulation
  const handleTeachWorkflow = () => {
    setIsTeaching(true);
    setIsCompiled(false);
    setRecordedSteps([]);
    setActiveStepIndex(0);
    setIsExecuting(false);
    setExecutionFinished(false);

    const fullSteps = preset.steps;
    fullSteps.forEach((st, idx) => {
      setTimeout(() => {
        setRecordedSteps(prev => [...prev, st]);
        setActiveStepIndex(idx + 1);
        if (idx === fullSteps.length - 1) {
          setTimeout(() => {
            setIsTeaching(false);
            setIsCompiled(true);
          }, 600);
        }
      }, (idx + 1) * 450);
    });
  };

  const handleParamChange = (key, val) => {
    setParamInputs(prev => ({ ...prev, [key]: val }));
  };

  const constructCliString = () => {
    const flags = Object.entries(paramInputs)
      .map(([k, v]) => `--${k.replace(/_/g, '-')} ${typeof v === 'boolean' ? (v ? '' : 'false') : `"${v}"`}`)
      .join(' ')
      .trim();
    return `sitecmd run ${preset.command} ${flags}`;
  };

  const handleRunReplay = () => {
    setIsExecuting(true);
    setExecutionFinished(false);
    setExecutionLogs([]);

    const steps = [
      `Initializing browser profile (prf_${preset.id}_session)...`,
      `Navigating to ${preset.targetUrl}...`,
      ...preset.schema.map(s => `Injecting parameter: --${s.key} = "${paramInputs[s.key]}"`),
      `Executing DOM interactions and asserting result selectors...`,
      `Workflow ${preset.command} completed successfully in 0.88s (exit: 0)`
    ];

    steps.forEach((log, idx) => {
      setTimeout(() => {
        setExecutionLogs(prev => [...prev, log]);
        if (idx === steps.length - 1) {
          setIsExecuting(false);
          setExecutionFinished(true);
        }
      }, (idx + 1) * 350);
    });
  };

  return (
    <div className="bg-[#09090d] border border-[#1a1a24] rounded-xl overflow-hidden shadow-2xl font-mono text-xs">
      {/* Engine Header / Preset Bar */}
      <div className="px-4 py-3 border-b border-[#161620] bg-[#0c0c11] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#20202c]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#20202c]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#20202c]" />
          <span className="text-[11px] text-neutral-400 font-semibold ml-2">Live Workflow Transformation Engine</span>
        </div>

        {/* Presets Switcher */}
        <div className="flex items-center gap-1.5 bg-[#07070a] border border-[#1b1b26] p-1 rounded-md">
          <span className="text-[10px] text-neutral-500 uppercase px-1.5">Preset:</span>
          {Object.keys(PRESETS).map(key => (
            <button
              key={key}
              onClick={() => setSelectedPresetKey(key)}
              className={`px-2.5 py-1 rounded text-[11px] transition-all ${
                selectedPresetKey === key
                  ? 'bg-[#1c1c28] text-white font-bold border border-[#2e2e42]'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {PRESETS[key].name}
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Column Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#161622]">
        
        {/* LEFT PANEL: BROWSER DOM INTERACTION RECORDER */}
        <div className="p-5 space-y-4 bg-[#07070a]/60">
          <div className="flex items-center justify-between border-b border-[#14141e] pb-3">
            <div className="flex items-center gap-2 text-neutral-200 font-semibold text-xs">
              <Globe className="w-3.5 h-3.5 text-neutral-400" />
              <span>1. Authenticated Website Session</span>
              <span className="text-[10px] bg-[#12121a] text-neutral-400 border border-[#20202e] px-1.5 py-0.5 rounded">
                {preset.site}
              </span>
            </div>

            <button
              onClick={handleTeachWorkflow}
              disabled={isTeaching}
              className="flex items-center gap-1.5 px-3 py-1 bg-red-950/40 hover:bg-red-950/70 border border-red-800/80 text-red-300 rounded text-[11px] transition-colors disabled:opacity-50"
            >
              <Radio className={`w-3 h-3 text-red-400 ${isTeaching ? 'animate-pulse' : ''}`} />
              <span>{isTeaching ? 'Recording DOM...' : 'Re-Record Workflow'}</span>
            </button>
          </div>

          <div className="text-[11px] text-neutral-400 font-sans">
            {preset.description}
          </div>

          {/* Captured Interaction Timeline */}
          <div className="space-y-2 min-h-[220px]">
            <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">
              Recorded Event Stream ({recordedSteps.length} / {preset.steps.length})
            </div>

            {recordedSteps.map((st, i) => (
              <motion.div
                key={st.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#0d0d12] border border-[#1c1c28] p-2.5 rounded flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-neutral-500 text-[10px] font-bold">#{i + 1}</span>
                  <span className={`uppercase font-bold text-[9px] px-1.5 py-0.5 rounded border ${
                    st.type === 'click' ? 'bg-blue-950/60 border-blue-800 text-blue-400' :
                    st.type === 'input' ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400' :
                    st.type === 'change' ? 'bg-amber-950/60 border-amber-800 text-amber-400' :
                    'bg-purple-950/60 border-purple-800 text-purple-400'
                  }`}>
                    {st.type}
                  </span>
                  <span className="text-neutral-200 font-semibold">{st.target}</span>
                  {st.value && (
                    <span className="text-emerald-400 bg-[#14141f] px-1.5 py-0.2 rounded text-[11px]">
                      "{st.value}"
                    </span>
                  )}
                </div>

                {st.selector && (
                  <span className="text-[10px] text-neutral-500 truncate max-w-[140px]">
                    {st.selector}
                  </span>
                )}
              </motion.div>
            ))}

            {isTeaching && (
              <div className="p-3 border border-dashed border-red-900/60 rounded bg-red-950/10 text-red-400 text-center text-xs animate-pulse">
                ● Capturing DOM mutations &amp; synthesizing parameter hooks...
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: COMPILED COMMAND & DYNAMIC RUNNER */}
        <div className="p-5 space-y-4 bg-[#09090e]">
          <div className="flex items-center justify-between border-b border-[#14141e] pb-3">
            <div className="flex items-center gap-2 text-neutral-200 font-semibold text-xs">
              <Terminal className="w-3.5 h-3.5 text-neutral-400" />
              <span>2. Compiled Reusable Command</span>
              <span className="text-[10px] bg-emerald-950/50 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded">
                ready
              </span>
            </div>

            <div className="text-[11px] text-neutral-400">
              <span className="text-neutral-500">Command:</span> <strong className="text-white">{preset.command}</strong>
            </div>
          </div>

          {/* Dynamic Parameter Adjuster */}
          <div className="bg-[#050507] border border-[#181824] rounded-lg p-3.5 space-y-3">
            <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">
              Adjust Execution Parameters in Real-Time:
            </div>

            <div className="space-y-2.5">
              {preset.schema.map(field => (
                <div key={field.key} className="flex items-center justify-between gap-3 text-xs">
                  <label className="text-neutral-300 font-mono text-[11px] flex items-center gap-1.5">
                    <span>--{field.key}</span>
                    {field.required && <span className="text-red-400 text-[10px]">*</span>}
                  </label>

                  {field.type === 'boolean' ? (
                    <input
                      type="checkbox"
                      checked={!!paramInputs[field.key]}
                      onChange={e => handleParamChange(field.key, e.target.checked)}
                      className="accent-neutral-100 h-4 w-4"
                    />
                  ) : (
                    <input
                      type={field.type === 'number' ? 'number' : 'text'}
                      value={paramInputs[field.key] ?? ''}
                      onChange={e => handleParamChange(field.key, field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                      className="bg-[#0d0d12] border border-[#232332] rounded px-2.5 py-1 text-xs text-neutral-100 font-mono focus:outline-none focus:border-neutral-400 w-44"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Generated CLI Command Box */}
          <div className="space-y-1.5">
            <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">
              Generated CLI Invocation:
            </div>
            <div className="bg-[#050507] border border-[#1b1b28] p-3 rounded flex items-center justify-between gap-3">
              <code className="text-emerald-400 text-[11px] overflow-x-auto whitespace-nowrap">
                $ {constructCliString()}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(constructCliString());
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1800);
                }}
                className="text-neutral-400 hover:text-white flex-shrink-0"
                title="Copy Command"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Run Simulation Trigger */}
          <div className="pt-1">
            <button
              onClick={handleRunReplay}
              disabled={isExecuting}
              className="w-full py-2.5 bg-neutral-100 hover:bg-white text-black font-semibold text-xs rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow"
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Executing Headless Replay...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-black" />
                  <span>Execute Command</span>
                </>
              )}
            </button>
          </div>

          {/* Replay Stream Output */}
          {executionLogs.length > 0 && (
            <div className="bg-[#050507] border border-[#151520] p-3 rounded space-y-1 text-[11px]">
              {executionLogs.map((log, i) => (
                <div key={i} className={i === executionLogs.length - 1 && executionFinished ? 'text-emerald-400 font-bold' : 'text-neutral-400'}>
                  &gt; {log}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// INTERACTIVE CLI TERMINAL COMPONENT
// =========================================================================

function InteractiveCliRunner() {
  const [activeTab, setActiveTab] = useState('connect');

  const snippets = {
    connect: {
      cmd: '$ sitecmd connect https://github.com',
      output: [
        '✓ Initialized isolated profile: ~/.sitecmd/profiles/prf_gh_88a91c',
        '✓ Browser launched. Session authentication validated.',
        '✓ MFA & session cookies persisted safely in encrypted vault.'
      ]
    },
    learn: {
      cmd: '$ sitecmd learn https://github.com',
      output: [
        '● Recording live browser interaction stream...',
        '  > [click]  input[data-testid="search-input"]',
        '  > [input]  "playwright" -> inferred parameter: --query',
        '  > [change] select[name="language"] -> parameter: --language',
        '✓ Captured 6 events. Saved recording to ~/.sitecmd/recordings/rec_101.json'
      ]
    },
    compile: {
      cmd: '$ sitecmd compile rec_101.json --name github.search',
      output: [
        '✓ Extracted parameter schema: { query: string, language?: string }',
        '✓ Generated deterministic selector fallback chain (0 dynamic IDs)',
        '✓ Command github.search registered to local daemon registry.'
      ]
    },
    run: {
      cmd: '$ sitecmd run github.search --query "webcmd" --language "typescript"',
      output: [
        '✓ Attached to authenticated session profile prf_gh_88a91c',
        '✓ Injected values: query="webcmd", language="typescript"',
        '✓ Replayed 6 DOM steps deterministically',
        '✓ Status 0: Command completed in 1.12s'
      ]
    }
  };

  const current = snippets[activeTab];

  return (
    <div className="bg-[#07070a] border border-[#191924] rounded-lg overflow-hidden font-mono text-xs shadow-2xl">
      <div className="px-4 py-2.5 border-b border-[#14141d] bg-[#0c0c11] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {['connect', 'learn', 'compile', 'run'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2.5 py-1 rounded text-[11px] uppercase transition-colors ${
                activeTab === tab ? 'bg-[#1a1a26] text-white font-bold border border-[#2b2b3c]' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <span className="text-[10px] text-neutral-500">daemon: running</span>
      </div>

      <div className="p-5 space-y-3 bg-[#07070a]">
        <div className="text-white font-bold">{current.cmd}</div>
        <div className="space-y-1.5 pt-1">
          {current.output.map((line, i) => (
            <div key={i} className={line.startsWith('✓') ? 'text-emerald-400' : line.startsWith('●') ? 'text-blue-400' : 'text-neutral-400'}>
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// SUBCOMPONENTS: CARDS
// =========================================================================

function WorkflowLifecycleCard({ step, title, tag, description }) {
  return (
    <div className="bg-[#09090d] border border-[#181822] hover:border-[#262634] transition-colors rounded-lg p-5 font-mono space-y-3 flex flex-col justify-between">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-neutral-500">{step}</span>
          <span className="text-[10px] bg-[#111118] border border-[#1e1e2c] px-1.5 py-0.5 rounded text-neutral-400">
            {tag}
          </span>
        </div>
        <h3 className="text-sm font-bold text-white">{title}</h3>
        <p className="text-xs text-neutral-400 font-sans leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}