import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Terminal,
  Globe,
  Radio,
  Play,
  ArrowRight,
  Check,
  Copy,
  Shield,
  Zap,
  GitBranch,
  RefreshCw,
  Boxes,
  Link2,
  Eye,
  Package,
  List,
  Search,
  Unlink
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Design tokens (see inline <style> block for font-face wiring)      */
/*  bg        #08080b   surface   #0c0c11   surface-2  #0f0f15         */
/*  border    #1a1a24   text      #e9e9ee   muted      #8b8b96         */
/*  gold      #c9a24c   emerald   #34d399   blue #60a5fa  amber #fbbf24*/
/* ------------------------------------------------------------------ */

const PRESETS = {
  github: {
    id: 'github',
    name: 'GitHub Search',
    site: 'github.com',
    command: 'github.search',
    targetUrl: 'https://github.com/search',
    description: 'Filter repositories by language, topic, and minimum star thresholds.',
    steps: [
      { id: 1, type: 'click', target: 'Search input', selector: 'input[name="q"]' },
      { id: 2, type: 'input', target: 'Search query', selector: 'input[name="q"]', value: 'playwright', param: 'query' },
      { id: 3, type: 'click', target: 'Filter dropdown', selector: 'button#filter-btn' },
      { id: 4, type: 'change', target: 'Language filter', selector: 'select[name="lang"]', value: 'typescript', param: 'language' },
      { id: 5, type: 'network', target: 'API search fetch', method: 'GET', url: '/api/v3/search/repo', status: 200 }
    ],
    initialParams: { query: 'sitecmd', language: 'typescript', min_stars: 100 },
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
    description: 'Search top-rated restaurants with a vegetarian filter and delivery time caps.',
    steps: [
      { id: 1, type: 'click', target: 'Location modal', selector: 'div.location-box' },
      { id: 2, type: 'input', target: 'Dish input', selector: 'input.search-bar', value: 'biryani', param: 'dish' },
      { id: 3, type: 'change', target: 'Rating threshold', selector: 'input[name="rating"]', value: '4.5', param: 'min_rating' },
      { id: 4, type: 'click', target: 'Veg Only toggle', selector: 'button.veg-toggle', value: 'true', param: 'veg_only' },
      { id: 5, type: 'network', target: 'Catalog search API', method: 'GET', url: '/dapi/restaurants/v3', status: 200 }
    ],
    initialParams: { dish: 'dum biryani', min_rating: 4.5, veg_only: true },
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
    description: 'Pull instant grocery items within a maximum budget constraint.',
    steps: [
      { id: 1, type: 'click', target: 'Search field', selector: 'div.search-bar-trigger' },
      { id: 2, type: 'input', target: 'Item name', selector: 'input[placeholder*="Search"]', value: 'oats', param: 'item' },
      { id: 3, type: 'change', target: 'Max price cap', selector: 'input[name="max_price"]', value: '300', param: 'max_price' },
      { id: 4, type: 'network', target: 'Inventory lookup', method: 'POST', url: '/v1/instant/inventory', status: 200 }
    ],
    initialParams: { item: 'cold brew', max_price: 250 },
    schema: [
      { key: 'item', type: 'string', required: true, label: 'Item Name' },
      { key: 'max_price', type: 'number', required: false, label: 'Max Price (Rs.)' }
    ]
  }
};

const USAGE_STEPS = [
  {
    n: '01',
    title: 'Connect',
    cmd: 'sitecmd connect https://github.com',
    note: 'A browser window opens. Complete any login, 2FA, or CAPTCHA by hand — sitecmd never sees your credentials.',
    output: [
      'Initialized isolated profile: ~/.sitecmd/profiles/prf_gh_88a91c',
      'Browser launched. Session authentication validated.',
      'MFA & session cookies persisted safely in encrypted vault.'
    ]
  },
  {
    n: '02',
    title: 'Learn',
    cmd: 'sitecmd learn https://github.com',
    note: 'Perform the task once — search, filter, click through. Every action is captured as a discrete, replayable event.',
    output: [
      'Recording live browser interaction stream...',
      '[click]  input[data-testid="search-input"]',
      '[input]  "playwright" -> inferred parameter: --query',
      'Captured 6 events. Saved to ~/.sitecmd/recordings/rec_101.json'
    ]
  },
  {
    n: '03',
    title: 'Compile',
    cmd: 'sitecmd compile rec_101.json --name github_search',
    note: 'The raw event trace is reduced to a named command with a typed, defaulted parameter schema.',
    output: [
      'Command compiled.',
      'Name: github_search   Site: https://github.com',
      'Parameters: query (string) [default: "sitecmd"]',
      'Saved to data/commands/github_search.json'
    ]
  },
  {
    n: '04',
    title: 'Inspect',
    cmd: 'sitecmd inspect github_search',
    note: 'Review exactly what a compiled command will do before you ever run it — site, parameters, and the full step sequence.',
    output: [
      'Command: github_search   Site: https://github.com',
      'Parameters: - query (string) [default: "sitecmd"]',
      'Steps (3): navigate -> click -> change input[name="q"]={{query}}'
    ]
  },
  {
    n: '05',
    title: 'List',
    cmd: 'sitecmd commands',
    note: 'See every learned command on this machine, with its site and parameter surface, at a glance.',
    output: [
      'github_search   site: https://github.com    params: query',
      'blinkit_order   site: https://blinkit.com   params: query, address'
    ]
  },
  {
    n: '06',
    title: 'Run',
    cmd: 'sitecmd run github_search --query "playwright"',
    note: 'Execute from your terminal, a cron job, a shell script, or an autonomous agent — with your session already attached.',
    output: [
      'Attached to authenticated session profile prf_gh_88a91c',
      'Injected values: query="playwright"',
      'Replayed 6 DOM steps deterministically',
      'Status 0: Command completed in 1.12s'
    ]
  },
  {
    n: '07',
    title: 'Disconnect',
    cmd: 'sitecmd disconnect https://github.com',
    note: 'Revoke and delete the saved session and local profile for a site the moment you no longer need it.',
    output: [
      'Session cleared for https://github.com',
      'Local profile prf_gh_88a91c removed.'
    ]
  }
];

const CLI_REFERENCE = [
  { cmd: 'connect', usage: 'sitecmd connect <url>', desc: 'Authenticate with a website and save the profile session.' },
  { cmd: 'open', usage: 'sitecmd open <url>', desc: 'Open a saved session browser window manually.' },
  { cmd: 'disconnect', usage: 'sitecmd disconnect <url>', desc: 'Delete the local authentication session and profile data.' },
  { cmd: 'learn', usage: 'sitecmd learn <url>', desc: 'Record interactive actions — clicks, inputs, navigations.' },
  { cmd: 'compile', usage: 'sitecmd compile <recording> [--name]', desc: 'Compile a raw recording trace into a reusable command.' },
  { cmd: 'commands', usage: 'sitecmd commands', desc: 'List all compiled, learned commands.' },
  { cmd: 'inspect', usage: 'sitecmd inspect <command>', desc: 'Inspect a command\u2019s parameters, defaults, and step flow.' },
  { cmd: 'run', usage: 'sitecmd run <command> [--param value]', desc: 'Execute a learned command with parameter overrides.' }
];

const PARAM_EXAMPLES = [
  { label: 'Search for atta dal and more', param: 'query' },
  { label: 'Enter delivery address', param: 'address' },
  { label: 'Enter quantity', param: 'quantity' },
  { label: 'Minimum rating', param: 'min_rating' },
  { label: 'Filter by price (max)', param: 'max_price' },
  { label: 'Enter your pincode', param: 'pincode' }
];

export default function App() {
  const [copiedKey, setCopiedKey] = useState(null);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#08080b] text-[#e9e9ee] font-sans antialiased selection:bg-[#2a2210] selection:text-white relative overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Fraunces', Georgia, serif; font-optical-sizing: auto; }
        .font-mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }
        .gold { color: #c9a24c; }
        .gold-bg { background-color: #c9a24c; }
        .gold-border { border-color: #c9a24c; }
        .ticket {
          position: relative;
          background: #0c0c11;
          border: 1px solid #1a1a24;
        }
        .ticket::before, .ticket::after {
          content: '';
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 14px;
          height: 14px;
          background: #08080b;
          border: 1px solid #1a1a24;
          border-radius: 999px;
        }
        .ticket::before { left: -8px; }
        .ticket::after { right: -8px; }
        .perf {
          background-image: repeating-linear-gradient(to bottom, transparent 0 6px, #1e1e2a 6px 7px);
          width: 1px;
        }
        :focus-visible { outline: 2px solid #c9a24c; outline-offset: 2px; }
      `}</style>

      {/* Background micro-grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-gradient-to-b from-[#c9a24c]/[0.05] to-transparent blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#16161d] bg-[#08080b]/85 backdrop-blur-md">
        <div className="max-w-6xl mx-auto h-14 px-6 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-[#e9e9ee] text-black flex items-center justify-center font-bold text-xs">
              &gt;_
            </div>
            <span className="font-semibold tracking-tight text-white text-sm">sitecmd</span>
            <span className="text-[10px] text-neutral-500 border border-[#22222c] bg-[#0d0d12] px-1.5 py-0.5 rounded">
              v0.1.0-alpha
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-neutral-400">
            <a href="#demo" className="hover:text-neutral-200 transition-colors">Live Engine</a>
            <a href="#guide" className="hover:text-neutral-200 transition-colors">Usage Guide</a>
            <a href="#architecture" className="hover:text-neutral-200 transition-colors">Architecture</a>
            <a href="#reference" className="hover:text-neutral-200 transition-colors">CLI Reference</a>
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
            <button className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#e9e9ee] hover:bg-white text-black font-semibold rounded text-xs transition-colors">
              <span>Get Started</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative pt-24 pb-16 px-6 max-w-6xl mx-auto">
        <div className="max-w-3xl space-y-7">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-[#2b2412] bg-[#12100a] font-mono text-[11px] text-[#d8bc74]">
            <span className="w-1.5 h-1.5 rounded-full gold-bg" />
            <span>A programmable web layer for engineers and agents</span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl font-medium tracking-tight text-white leading-[1.08]">
            Turn any website into a
            <br />
            <span className="italic gold">reusable command.</span>
          </h1>

          <p className="text-base sm:text-lg text-neutral-400 leading-relaxed max-w-2xl font-normal">
            Show sitecmd how you use a website, once. It compiles the interaction into a
            parameterized command you can run from a terminal, a script, or an autonomous
            agent — with your session already signed in.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 font-mono text-xs">
            <a
              href="#demo"
              className="flex items-center gap-2 px-4 py-2.5 bg-[#e9e9ee] hover:bg-white text-black font-semibold rounded transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>Try the Live Engine</span>
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

          <div className="flex items-center gap-6 pt-3 font-mono text-[11px] text-neutral-500">
            <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" /> Zero cloud LLM calls</span>
            <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" /> Sessions stay local</span>
            <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" /> Node.js v18+</span>
          </div>
        </div>
      </section>

      {/* LIVE ENGINE DEMO */}
      <section id="demo" className="py-10 px-6 max-w-6xl mx-auto">
        <LiveWorkflowInteractiveEngine copiedKey={copiedKey} setCopiedKey={setCopiedKey} copyToClipboard={copyToClipboard} />
      </section>

      {/* EXECUTION LIFECYCLE (overview) */}
      <section className="py-24 border-t border-[#15151e] px-6 max-w-6xl mx-auto">
        <SectionEyebrow label="Execution Lifecycle" />
        <h2 className="font-display text-3xl sm:text-4xl font-medium text-white tracking-tight mb-2">
          Four stages, one command
        </h2>
        <p className="text-sm text-neutral-400 font-mono mb-12">
          Teach once, parameterize automatically, execute endlessly.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <LifecycleCard icon={Link2} title="Connect" tag="Session Vault" description="Authenticate with a website once. Cookies and tokens persist in an isolated local profile." />
          <LifecycleCard icon={Radio} title="Learn" tag="Interaction Recorder" description="Interact naturally. sitecmd records clicks, inputs, filters, and background network calls." />
          <LifecycleCard icon={Boxes} title="Compile" tag="Schema Compiler" description="The session is reduced to a clean, reusable command with an inferred parameter schema." />
          <LifecycleCard icon={Terminal} title="Run" tag="Deterministic Replay" description="Replay with custom inputs from a terminal, a cron job, or an autonomous agent." />
        </div>
      </section>

      {/* FULL USAGE GUIDE — signature ticket sequence */}
      <section id="guide" className="py-24 border-t border-[#15151e] px-6 max-w-6xl mx-auto">
        <SectionEyebrow label="Step-by-Step Usage Guide" />
        <h2 className="font-display text-3xl sm:text-4xl font-medium text-white tracking-tight mb-2">
          Every command, in order
        </h2>
        <p className="text-sm text-neutral-400 font-mono mb-14 max-w-2xl">
          The complete path from first connection to a scheduled, headless run — each stub is a
          real command you'll type, with the output sitecmd hands back.
        </p>

        <div className="relative">
          <div className="hidden sm:block absolute left-[27px] top-2 bottom-2 w-px perf" />
          <div className="space-y-6">
            {USAGE_STEPS.map((s) => (
              <UsageTicket key={s.n} step={s} onCopy={copyToClipboard} copiedKey={copiedKey} />
            ))}
          </div>
        </div>
      </section>

      {/* ARCHITECTURE */}
      <section id="architecture" className="py-24 border-t border-[#15151e] px-6 max-w-6xl mx-auto">
        <SectionEyebrow label="System Architecture" />
        <h2 className="font-display text-3xl sm:text-4xl font-medium text-white tracking-tight mb-2">
          Built for deterministic execution
        </h2>
        <p className="text-sm text-neutral-400 font-mono mb-12">
          No brittle CSS scrapers. Sessions, scored selectors, and dry runs, working together.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-mono text-xs">
          <ArchCard
            icon={Shield}
            iconColor="text-blue-400"
            title="Isolated Session Profiles"
            description="Login state, 2FA tokens, and cookies stay in encrypted local storage. The daemon runs workflows without asking for credentials again."
            footer="~/.sitecmd/profiles/prf_gh_88a91c"
            footerColor="text-neutral-500"
          />
          <ArchCard
            icon={Boxes}
            iconColor="text-purple-400"
            title="Selector Reliability Scoring"
            description="Every captured element is scored — Stable, Warning, Dynamic — using semantic test IDs, ARIA roles, and fuzzy DOM pathing."
            footer='[data-testid="search-input"]  STABLE'
            footerColor="text-emerald-400"
          />
          <ArchCard
            icon={Zap}
            iconColor="gold"
            title="Dry Run & Simulation"
            description="Validate parameter injection and step order ahead of time, with no state-changing requests or browser mutations."
            footer="$ sitecmd run food.search --dry-run"
            footerColor="text-neutral-400"
          />
        </div>

        {/* Smart parameter extraction table */}
        <div className="mt-14">
          <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-semibold mb-4">
            Smart Parameter Extraction — 100% local heuristics, no external calls
          </div>
          <div className="border border-[#1a1a24] rounded-lg overflow-hidden">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="bg-[#0c0c11] text-neutral-500 text-left">
                  <th className="px-4 py-3 font-semibold uppercase tracking-wide text-[10px]">Field label / placeholder</th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wide text-[10px]">Inferred parameter</th>
                </tr>
              </thead>
              <tbody>
                {PARAM_EXAMPLES.map((row, i) => (
                  <tr key={row.param} className={i % 2 === 0 ? 'bg-[#09090d]' : 'bg-[#0b0b10]'}>
                    <td className="px-4 py-2.5 text-neutral-300 border-t border-[#161620]">"{row.label}"</td>
                    <td className="px-4 py-2.5 gold border-t border-[#161620]">--{row.param}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CLI REFERENCE + interactive runner */}
      <section id="reference" className="py-24 border-t border-[#15151e] px-6 max-w-6xl mx-auto">
        <SectionEyebrow label="CLI & Toolchain" />
        <h2 className="font-display text-3xl sm:text-4xl font-medium text-white tracking-tight mb-2 max-w-xl">
          A serious terminal interface for serious workflows
        </h2>
        <p className="text-sm text-neutral-400 font-mono mb-12 max-w-2xl">
          Compose commands with Unix pipes, export JSON schemas for LLM tool calling, and trigger
          headless browser replays from anywhere a shell can run.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
          <div className="lg:col-span-2 border border-[#1a1a24] rounded-lg overflow-hidden">
            <table className="w-full text-xs font-mono">
              <tbody>
                {CLI_REFERENCE.map((row, i) => (
                  <tr key={row.cmd} className={i % 2 === 0 ? 'bg-[#09090d]' : 'bg-[#0b0b10]'}>
                    <td className="px-4 py-3 align-top text-white font-bold whitespace-nowrap border-t border-[#161620]">{row.cmd}</td>
                    <td className="px-4 py-3 align-top text-neutral-400 font-sans text-[11px] leading-relaxed border-t border-[#161620]">
                      {row.desc}
                      <div className="mt-1 gold text-[10px] font-mono">{row.usage}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="lg:col-span-3">
            <InteractiveCliRunner />
          </div>
        </div>
      </section>

      {/* VISION */}
      <section className="py-24 border-t border-[#15151e] px-6 max-w-4xl mx-auto text-center space-y-6">
        <SectionEyebrow label="The Vision" center />
        <h2 className="font-display text-3xl sm:text-5xl font-medium text-white tracking-tight leading-tight">
          Websites shouldn't just be places you visit.
          <br />
          <span className="italic gold">They should be programmable tools.</span>
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 font-mono max-w-2xl mx-auto leading-relaxed">
          Sitecmd turns human browser actions into reusable commands that work across terminal
          utilities, backend services, scheduled jobs, and agent runtimes.
        </p>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 border-t border-[#15151e] px-6 max-w-6xl mx-auto">
        <div className="bg-[#0b0b0f] border border-[#1b1b26] rounded-xl p-10 sm:p-14 text-center space-y-6">
          <h2 className="font-display text-3xl sm:text-4xl font-medium text-white tracking-tight">
            Make your websites programmable.
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 font-mono max-w-md mx-auto">
            Install the open-source CLI and compile your first command in under two minutes.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 font-mono text-xs">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-[#e9e9ee] hover:bg-white text-black font-semibold rounded transition-colors">
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
          <span>— turn websites into programmable tools.</span>
        </div>

        <div className="flex items-center gap-6">
          <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-neutral-300 transition-colors">GitHub</a>
          <a href="#reference" className="hover:text-neutral-300 transition-colors">Documentation</a>
          <a href="https://x.com" target="_blank" rel="noreferrer" className="hover:text-neutral-300 transition-colors">X</a>
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Small presentational helpers                                       */
/* ------------------------------------------------------------------ */

function SectionEyebrow({ label, center }) {
  return (
    <div className={`text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-semibold mb-3 ${center ? 'text-center' : ''}`}>
      {label}
    </div>
  );
}

function LifecycleCard({ icon: Icon, title, tag, description }) {
  return (
    <div className="bg-[#09090d] border border-[#181822] hover:gold-border transition-colors rounded-lg p-5 space-y-3 flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Icon className="w-4 h-4 gold" />
          <span className="text-[10px] bg-[#111118] border border-[#1e1e2c] px-1.5 py-0.5 rounded text-neutral-400 font-mono">
            {tag}
          </span>
        </div>
        <h3 className="text-sm font-bold text-white font-mono">{title}</h3>
        <p className="text-xs text-neutral-400 font-sans leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function ArchCard({ icon: Icon, iconColor, title, description, footer, footerColor }) {
  return (
    <div className="bg-[#0b0b0f] border border-[#1a1a24] rounded-lg p-6 space-y-3">
      <div className="flex items-center gap-2 text-white font-bold">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <span>{title}</span>
      </div>
      <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">{description}</p>
      <div className={`text-[10px] ${footerColor} bg-[#07070a] p-2 rounded border border-[#161620]`}>
        {footer}
      </div>
    </div>
  );
}

function UsageTicket({ step, onCopy, copiedKey }) {
  const key = `usage_${step.n}`;
  return (
    <div className="flex items-start gap-4 sm:gap-6">
      <div className="hidden sm:flex flex-col items-center w-14 pt-4 flex-shrink-0">
        <div className="w-7 h-7 rounded-full bg-[#08080b] border border-[#2b2412] gold flex items-center justify-center text-[10px] font-mono font-bold">
          {step.n}
        </div>
      </div>

      <div className="ticket rounded-lg flex-1 overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          <div className="p-5 sm:w-[55%] space-y-3 border-b sm:border-b-0 sm:border-r border-dashed border-[#22222e]">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg text-white">{step.title}</h3>
              <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-500 sm:hidden">{step.n}</span>
            </div>
            <p className="text-[12px] text-neutral-400 font-sans leading-relaxed">{step.note}</p>

            <div className="flex items-center justify-between gap-2 bg-[#050507] border border-[#1b1b28] rounded px-3 py-2 mt-2">
              <code className="text-emerald-400 text-[11px] font-mono overflow-x-auto whitespace-nowrap">$ {step.cmd}</code>
              <button
                onClick={() => onCopy(step.cmd, key)}
                className="text-neutral-500 hover:text-white flex-shrink-0"
                title="Copy command"
              >
                {copiedKey === key ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="p-5 sm:w-[45%] bg-[#050507]/60 space-y-1 font-mono text-[11px]">
            {step.output.map((line, i) => (
              <div key={i} className="text-neutral-400">
                <span className="text-neutral-600">&gt; </span>
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  LIVE INTERACTIVE WORKFLOW DEMO ENGINE (hero playground)            */
/* ------------------------------------------------------------------ */

function LiveWorkflowInteractiveEngine({ copiedKey, setCopiedKey, copyToClipboard }) {
  const [selectedPresetKey, setSelectedPresetKey] = useState('github');
  const preset = PRESETS[selectedPresetKey];

  const [isTeaching, setIsTeaching] = useState(false);
  const [recordedSteps, setRecordedSteps] = useState(preset.steps);
  const [isCompiled, setIsCompiled] = useState(true);

  const [paramInputs, setParamInputs] = useState(preset.initialParams);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionLogs, setExecutionLogs] = useState([]);
  const [executionFinished, setExecutionFinished] = useState(false);

  useEffect(() => {
    const p = PRESETS[selectedPresetKey];
    setParamInputs(p.initialParams);
    setRecordedSteps(p.steps);
    setIsCompiled(true);
    setIsTeaching(false);
    setIsExecuting(false);
    setExecutionLogs([]);
    setExecutionFinished(false);
  }, [selectedPresetKey]);

  const handleTeachWorkflow = () => {
    setIsTeaching(true);
    setIsCompiled(false);
    setRecordedSteps([]);
    setIsExecuting(false);
    setExecutionFinished(false);

    const fullSteps = preset.steps;
    fullSteps.forEach((st, idx) => {
      setTimeout(() => {
        setRecordedSteps(prev => [...prev, st]);
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

  const cliString = constructCliString();

  return (
    <div className="bg-[#09090d] border border-[#1a1a24] rounded-xl overflow-hidden shadow-2xl font-mono text-xs">
      <div className="px-4 py-3 border-b border-[#161620] bg-[#0c0c11] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#20202c]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#20202c]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#20202c]" />
          <span className="text-[11px] text-neutral-400 font-semibold ml-2">Live Workflow Transformation Engine</span>
        </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#161622]">
        {/* LEFT: recorder */}
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

          <div className="text-[11px] text-neutral-400 font-sans">{preset.description}</div>

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
                    <span className="text-emerald-400 bg-[#14141f] px-1.5 py-0.2 rounded text-[11px]">"{st.value}"</span>
                  )}
                </div>

                {st.selector && (
                  <span className="text-[10px] text-neutral-500 truncate max-w-[140px]">{st.selector}</span>
                )}
              </motion.div>
            ))}

            {isTeaching && (
              <div className="p-3 border border-dashed border-red-900/60 rounded bg-red-950/10 text-red-400 text-center text-xs animate-pulse">
                Capturing DOM mutations &amp; synthesizing parameter hooks...
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: compiled command, styled as a ticket */}
        <div className="p-5 space-y-4 bg-[#09090e]">
          <div className="flex items-center justify-between border-b border-[#14141e] pb-3">
            <div className="flex items-center gap-2 text-neutral-200 font-semibold text-xs">
              <Terminal className="w-3.5 h-3.5 text-neutral-400" />
              <span>2. Compiled Reusable Command</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${
              isCompiled ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800' : 'bg-neutral-900 text-neutral-500 border-neutral-800'
            }`}>
              {isCompiled ? 'ready' : 'compiling'}
            </span>
          </div>

          <div className="ticket rounded-lg overflow-hidden">
            <div className="px-4 py-3 flex items-center justify-between border-b border-dashed border-[#22222e]">
              <span className="text-[11px] text-neutral-500">Command</span>
              <strong className="text-white font-mono text-sm">{preset.command}</strong>
            </div>

            <div className="p-4 space-y-3">
              <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">
                Adjust Parameters in Real Time
              </div>

              <div className="space-y-2.5">
                {preset.schema.map(field => (
                  <div key={field.key} className="flex items-center justify-between gap-3 text-xs">
                    <label className="text-neutral-300 font-mono text-[11px] flex items-center gap-1.5">
                      <span>--{field.key}</span>
                      {field.required && <span className="gold text-[10px]">*</span>}
                    </label>

                    {field.type === 'boolean' ? (
                      <input
                        type="checkbox"
                        checked={!!paramInputs[field.key]}
                        onChange={e => handleParamChange(field.key, e.target.checked)}
                        className="accent-[#c9a24c] h-4 w-4"
                      />
                    ) : (
                      <input
                        type={field.type === 'number' ? 'number' : 'text'}
                        value={paramInputs[field.key] ?? ''}
                        onChange={e => handleParamChange(field.key, field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                        className="bg-[#0d0d12] border border-[#232332] rounded px-2.5 py-1 text-xs text-neutral-100 font-mono focus:outline-none focus:gold-border w-44"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">Generated CLI Invocation</div>
            <div className="bg-[#050507] border border-[#1b1b28] p-3 rounded flex items-center justify-between gap-3">
              <code className="text-emerald-400 text-[11px] overflow-x-auto whitespace-nowrap">$ {cliString}</code>
              <button
                onClick={() => copyToClipboard(cliString, 'demo_cli')}
                className="text-neutral-400 hover:text-white flex-shrink-0"
                title="Copy Command"
              >
                {copiedKey === 'demo_cli' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="pt-1">
            <button
              onClick={handleRunReplay}
              disabled={isExecuting}
              className="w-full py-2.5 bg-[#e9e9ee] hover:bg-white text-black font-semibold text-xs rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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

/* ------------------------------------------------------------------ */
/*  INTERACTIVE CLI TERMINAL COMPONENT                                 */
/* ------------------------------------------------------------------ */

function InteractiveCliRunner() {
  const [activeTab, setActiveTab] = useState('connect');

  const tabs = [
    { key: 'connect', label: 'connect', icon: Link2 },
    { key: 'learn', label: 'learn', icon: Radio },
    { key: 'compile', label: 'compile', icon: Boxes },
    { key: 'inspect', label: 'inspect', icon: Eye },
    { key: 'commands', label: 'commands', icon: List },
    { key: 'run', label: 'run', icon: Play }
  ];

  const snippets = {
    connect: {
      cmd: '$ sitecmd connect https://github.com',
      output: [
        'Initialized isolated profile: ~/.sitecmd/profiles/prf_gh_88a91c',
        'Browser launched. Session authentication validated.',
        'MFA & session cookies persisted safely in encrypted vault.'
      ]
    },
    learn: {
      cmd: '$ sitecmd learn https://github.com',
      output: [
        'Recording live browser interaction stream...',
        '[click]  input[data-testid="search-input"]',
        '[input]  "playwright" -> inferred parameter: --query',
        '[change] select[name="language"] -> parameter: --language',
        'Captured 6 events. Saved recording to ~/.sitecmd/recordings/rec_101.json'
      ]
    },
    compile: {
      cmd: '$ sitecmd compile rec_101.json --name github.search',
      output: [
        'Extracted parameter schema: { query: string, language?: string }',
        'Generated deterministic selector fallback chain (0 dynamic IDs)',
        'Command github.search registered to local daemon registry.'
      ]
    },
    inspect: {
      cmd: '$ sitecmd inspect github_search',
      output: [
        'Command: github_search   Site: https://github.com',
        'Parameters: - query (string) [default: "sitecmd"]',
        'Steps (3): navigate -> click -> change input[name="q"]={{query}}'
      ]
    },
    commands: {
      cmd: '$ sitecmd commands',
      output: [
        'github_search   site: https://github.com    params: query',
        'blinkit_order   site: https://blinkit.com   params: query, address'
      ]
    },
    run: {
      cmd: '$ sitecmd run github_search --query "playwright"',
      output: [
        'Attached to authenticated session profile prf_gh_88a91c',
        'Injected values: query="playwright"',
        'Replayed 6 DOM steps deterministically',
        'Status 0: Command completed in 1.12s'
      ]
    }
  };

  const current = snippets[activeTab];

  return (
    <div className="bg-[#07070a] border border-[#191924] rounded-lg overflow-hidden font-mono text-xs shadow-2xl">
      <div className="px-4 py-2.5 border-b border-[#14141d] bg-[#0c0c11] flex items-center justify-between overflow-x-auto">
        <div className="flex items-center gap-1.5">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-2.5 py-1 rounded text-[11px] uppercase transition-colors whitespace-nowrap ${
                activeTab === tab.key ? 'bg-[#1c1c28] text-white font-bold border border-[#2e2e42]' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className="text-[10px] text-neutral-500 hidden sm:inline pl-3">daemon: running</span>
      </div>

      <div className="p-5 space-y-3 bg-[#07070a]">
        <div className="text-white font-bold">{current.cmd}</div>
        <div className="space-y-1.5 pt-1">
          {current.output.map((line, i) => (
            <div key={i} className="text-emerald-400">
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}