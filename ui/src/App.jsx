import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, Braces, Check, Copy, Eye, GitBranch, Globe2,
  MousePointer2, Network, ShieldCheck, Terminal, Zap, Cpu, Bot,
} from "lucide-react";

/* Two tones: white + orange. Ink is used for text only. */
const C = {
  orange: "#FF5A1F",
  orangeDeep: "#E34A12",
  tint: "#FFF1EA",
  line: "#F0DDD2",
  ink: "#1B1410",
  mute: "#7A6A60",
};

const WORKFLOWS = {
  github: {
    name: "GitHub search", domain: "github.com", command: "github_search",
    description: "Search repositories by language and star count without opening a browser.",
    params: [
      { key: "query", type: "string", value: "playwright" },
      { key: "language", type: "string", value: "typescript" },
      { key: "min_stars", type: "number", value: "100" },
    ],
    actions: [["CLICK", "Search input"], ["INPUT", '"playwright"'], ["FILTER", "Language: TypeScript"], ["FILTER", "Stars ≥ 100"]],
  },
  blinkit: {
    name: "Blinkit search", domain: "blinkit.com", command: "blinkit_search",
    description: "Find groceries under a price limit for a saved delivery address.",
    params: [
      { key: "query", type: "string", value: "atta dal" },
      { key: "address", type: "string", value: "Home" },
      { key: "max_price", type: "number", value: "500" },
    ],
    actions: [["CLICK", "Search field"], ["INPUT", '"atta dal"'], ["FILTER", "Price ≤ ₹500"], ["EXTRACT", "Matching items"]],
  },
  swiggy: {
    name: "Swiggy search", domain: "swiggy.com", command: "food.search",
    description: "Find well-rated vegetarian dishes from nearby restaurants.",
    params: [
      { key: "dish", type: "string", value: "dum biryani" },
      { key: "min_rating", type: "number", value: "4.5" },
      { key: "veg_only", type: "boolean", value: "true" },
    ],
    actions: [["CLICK", "Search"], ["INPUT", '"dum biryani"'], ["FILTER", "Rating ≥ 4.5"], ["FILTER", "Vegetarian only"]],
  },
};

const initParams = (w) => Object.fromEntries(w.params.map((p) => [p.key, p.value]));

export default function App() {
  const [active, setActive] = useState("github");
  const workflow = WORKFLOWS[active];
  const [params, setParams] = useState(initParams(workflow));
  const [copied, setCopied] = useState(false);

  const changeWorkflow = (key) => {
    setActive(key);
    setParams(initParams(WORKFLOWS[key]));
  };

  const command = [
    `sitecmd ${workflow.command}`,
    ...Object.entries(params).map(([k, v]) => `--${k} "${v}"`),
  ].join(" ");

  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); } catch (e) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <main
      className="min-h-screen bg-white text-[#1B1410] selection:bg-[#FF5A1F] selection:text-white"
      style={{ fontFamily: "'Instrument Sans', system-ui, sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Instrument+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        .display{font-family:'Bricolage Grotesque',sans-serif;letter-spacing:-0.035em}
        .mono{font-family:'JetBrains Mono',monospace}
        .marquee{animation:marquee 28s linear infinite}
        @keyframes marquee{to{transform:translateX(-50%)}}
        :focus-visible{outline:2px solid ${C.orange};outline-offset:2px}
        @media (prefers-reduced-motion: reduce){*{animation:none!important;transition:none!important}}
      `}</style>

      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-[#F0DDD2] bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between px-5">
          <a href="#" className="flex items-center gap-2.5">
            <span className="mono grid h-8 w-8 place-items-center rounded-lg bg-[#FF5A1F] text-xs font-bold text-white">&gt;_</span>
            <span className="display text-lg font-bold">sitecmd</span>
          </a>
          <nav className="hidden items-center gap-8 text-sm font-medium text-[#7A6A60] md:flex">
            <a href="#compiler" className="hover:text-[#FF5A1F]">Try it</a>
            <a href="#how" className="hover:text-[#FF5A1F]">How it works</a>
            <a href="#why" className="hover:text-[#FF5A1F]">Why sitecmd</a>
            <a href="/docs" className="hover:text-[#FF5A1F]">Docs</a>
          </nav>
          <a
            href="https://github.com/PRERAN001/sitecmd" target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-[#F0DDD2] px-4 py-2 text-sm font-medium transition hover:border-[#FF5A1F] hover:text-[#FF5A1F]"
          >
            <GitBranch size={15} /> GitHub
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-[#F0DDD2]">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(${C.line} 1px, transparent 1px)`,
            backgroundSize: "22px 22px",
            maskImage: "linear-gradient(to bottom, black, transparent 85%)",
            WebkitMaskImage: "linear-gradient(to bottom, black, transparent 85%)",
          }}
        />
        <div className="pointer-events-none absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full bg-[#FF5A1F]/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-[1180px] items-center gap-16 px-5 pb-24 pt-16 lg:grid-cols-[1.05fr_1fr] lg:pt-24">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="inline-flex items-center gap-2 rounded-full bg-[#FFF1EA] px-3.5 py-1.5 text-sm font-medium text-[#E34A12]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#FF5A1F]" />
              Runs locally. Zero cloud LLM calls.
            </p>
            <h1 className="display mt-6 text-[56px] font-extrabold leading-[0.92] sm:text-[80px] lg:text-[92px]">
              Click it once.
              <br />
              <span className="relative inline-block text-[#FF5A1F]">
                Run it forever.
                <svg className="absolute -bottom-3 left-0 w-full" viewBox="0 0 300 14" fill="none" preserveAspectRatio="none">
                  <motion.path
                    d="M2 9C60 2 120 12 180 6C225 2 265 9 298 5"
                    stroke="#FF5A1F" strokeWidth="4" strokeLinecap="round"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.6, duration: 0.9 }}
                  />
                </svg>
              </span>
            </h1>
            <p className="mt-10 max-w-[520px] text-lg leading-8 text-[#7A6A60]">
              Record any task in your browser, like searching, filling a form, or checking a dashboard. sitecmd
              compiles it into a CLI command with named parameters.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href="#compiler"
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#FF5A1F] px-6 text-[15px] font-semibold text-white shadow-[0_10px_30px_-8px_rgba(255,90,31,.6)] transition hover:bg-[#E34A12]"
              >
                Try the compiler <ArrowRight size={16} />
              </a>
              <InstallCommand />
            </div>
          </motion.div>
          <HeroStage />
        </div>

        {/* Scrolling command strip */}
        <div className="relative overflow-hidden border-t border-[#F0DDD2] bg-[#FF5A1F] py-3.5 text-white">
          <div className="marquee mono flex w-max gap-10 whitespace-nowrap text-[13px]">
            {[0, 1].flatMap((k) =>
              ["sitecmd run github_search", "sitecmd run blinkit_order", "sitecmd run food.search", "sitecmd connect", "sitecmd learn", "sitecmd compile", "cron + sitecmd"].map((t) => (
                <span key={`${k}-${t}`} className="flex items-center gap-10">
                  {t} <Zap size={13} />
                </span>
              ))
            )}
          </div>
        </div>
      </section>

      
{/* COMPILER */}
      <section id="compiler" className="mx-auto max-w-[1180px] px-5 py-24">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="display text-[40px] font-bold leading-[1] sm:text-[56px]">
              From clicks to a command.
            </h2>
            <p className="mt-3 max-w-[520px] text-[#7A6A60]">
              Pick a workflow, edit the parameters, and watch the command update.
            </p>
          </div>
          <div role="tablist" className="flex max-w-full overflow-x-auto rounded-full border border-[#F0DDD2] bg-white p-1">
            {Object.entries(WORKFLOWS).map(([key, w]) => (
              <button
                key={key} role="tab" aria-selected={active === key}
                onClick={() => changeWorkflow(key)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                  active === key ? "bg-[#FF5A1F] text-white" : "text-[#7A6A60] hover:text-[#FF5A1F]"
                }`}
              >
                {w.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid overflow-hidden rounded-3xl border border-[#F0DDD2] shadow-[0_30px_80px_-40px_rgba(227,74,18,.35)] lg:grid-cols-2">
          {/* Source */}
          <div className="bg-white p-7 sm:p-9">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#FFF1EA] text-[#FF5A1F]">
                <Globe2 size={20} />
              </span>
              <div>
                <p className="text-xs font-medium text-[#7A6A60]">What you did in the browser</p>
                <p className="mono text-[15px] font-medium">{workflow.domain}</p>
              </div>
            </div>
            <p className="mt-6 max-w-[420px] leading-7 text-[#7A6A60]">{workflow.description}</p>

            <ol className="mt-8 border-t border-[#F0DDD2]">
              {workflow.actions.map(([type, text], i) => (
                <motion.li
                  key={`${active}-${type}-${text}`}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-4 border-b border-[#F0DDD2] py-4"
                >
                  <span className="mono w-16 shrink-0 rounded-md bg-[#FFF1EA] px-2 py-1 text-center text-[11px] font-medium text-[#E34A12]">
                    {type}
                  </span>
                  <span className="truncate text-[15px]">{text}</span>
                </motion.li>
              ))}
            </ol>
          </div>

          {/* Result: the one bold orange block */}
          <div className="bg-[#FF5A1F] p-7 text-white sm:p-9">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-[#FF5A1F]">
                <Terminal size={20} />
              </span>
              <div>
                <p className="text-xs font-medium text-white/80">Your new command</p>
                <p className="mono text-[15px] font-medium">{workflow.command}</p>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              {workflow.params.map((p) => (
                <label key={p.key} className="grid items-center gap-2 sm:grid-cols-[120px_1fr]">
                  <span className="mono text-[13px]">
                    --{p.key} <span className="text-white/60">{p.type}</span>
                  </span>
                  <input
                    value={params[p.key] ?? ""}
                    onChange={(e) => setParams((c) => ({ ...c, [p.key]: e.target.value }))}
                    className="mono w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2.5 text-[13px] text-white outline-none transition placeholder:text-white/50 focus:border-white focus:bg-white/20"
                  />
                </label>
              ))}
            </div>

            <div className="mt-8 flex items-start gap-3 rounded-2xl bg-white p-4 text-[#1B1410]">
              <span className="mono pt-0.5 text-sm font-medium text-[#FF5A1F]">$</span>
              <code className="mono min-w-0 flex-1 break-all text-[13px] leading-6">{command}</code>
              <button
                onClick={() => copy(command)} aria-label="Copy command"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#FFF1EA] text-[#FF5A1F] transition hover:bg-[#FF5A1F] hover:text-white"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS: a real sequence */}
      <section id="how" className="border-y border-[#F0DDD2] bg-[#FFF1EA]/50">
        <div className="mx-auto max-w-[1180px] px-5 py-24">
          <h2 className="display max-w-[640px] text-[40px] font-bold leading-[1] sm:text-[56px]">
            Four steps from workflow to command.
          </h2>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Step n="1" icon={<MousePointer2 />} title="Capture" text="Record the clicks, typing, and filters you use on a site." code="CLICK → INPUT → FILTER" />
            <Step n="2" icon={<Network />} title="Understand" text="Separate what you meant to do from incidental page noise." code="ACTION → INTENT" />
            <Step n="3" icon={<Braces />} title="Parameterize" text="Turn the values that change into typed parameters." code="query: string" />
            <Step n="4" icon={<Terminal />} title="Compile" text="Get a reusable command for people and agents." code="sitecmd run ..." />
          </div>
        </div>
      </section>

      {/* WHY */}
      <section id="why" className="mx-auto max-w-[1180px] px-5 py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <div>
            <h2 className="display text-[40px] font-bold leading-[1] sm:text-[56px]">
              Not a scraper. A workflow compiler.
            </h2>
            <p className="mt-6 max-w-[440px] leading-7 text-[#7A6A60]">
              Websites were built for people to click. sitecmd keeps the workflow explicit, so you can read it,
              change it, and trust what runs.
            </p>
          </div>
          <div className="divide-y divide-[#F0DDD2] border-y border-[#F0DDD2]">
            <Reason icon={<ShieldCheck />} title="Local by default" text="Your credentials and session state stay on your machine." />
            <Reason icon={<Eye />} title="Readable and predictable" text="Every workflow is a visible list of steps, not hidden browser magic." />
            <Reason icon={<Bot />} title="Built for agents" text="A typed command is a far better tool for an agent than a pile of browser clicks." />
            <Reason icon={<Cpu />} title="Fast to rerun" text="Run it with new values in one line instead of repeating the clicks." />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[1180px] px-5 pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-[#FF5A1F] px-6 py-20 text-center text-white sm:px-12">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-white/10" />
          <h2 className="display relative mx-auto max-w-[720px] text-[40px] font-extrabold leading-[1] sm:text-[64px]">
            Stop rebuilding brittle integrations.
          </h2>
          <p className="relative mx-auto mt-5 max-w-[480px] text-lg text-white/85">
            Teach the workflow once. Run it as a command whenever you need it.
          </p>
          <div className="relative mt-9 flex flex-wrap justify-center gap-3">
            <a href="#compiler" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 text-[15px] font-semibold text-[#E34A12] transition hover:bg-[#FFF1EA]">
              Build a workflow <ArrowRight size={16} />
            </a>
            <a
              href="https://github.com/PRERAN001/sitecmd" target="_blank" rel="noreferrer"
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/50 px-6 text-[15px] font-semibold transition hover:bg-white/15"
            >
              <GitBranch size={16} /> View source
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#F0DDD2]">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-3 px-5 py-8 text-sm text-[#7A6A60] md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="mono grid h-6 w-6 place-items-center rounded-md bg-[#FF5A1F] text-[10px] font-bold text-white">&gt;_</span>
            <span className="font-semibold text-[#1B1410]">sitecmd</span>
            <span>Websites, as commands.</span>
          </div>
          <span>Local-first and open source.</span>
        </div>
      </footer>
    </main>
  );
}

function InstallCommand() {
  const [copied, setCopied] = useState(false);
  const value = "npm install -g sitecmd";
  const copy = async () => {
    try { await navigator.clipboard.writeText(value); } catch (e) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  return (
    <button
      onClick={copy}
      className="mono inline-flex min-h-12 items-center gap-3 rounded-full border border-[#F0DDD2] bg-white px-5 text-[13px] transition hover:border-[#FF5A1F]"
    >
      <span className="text-[#FF5A1F]">$</span>
      {value}
      {copied ? <Check size={15} className="text-[#FF5A1F]" /> : <Copy size={15} className="text-[#7A6A60]" />}
    </button>
  );
}

function Step({ n, icon, title, text, code }) {
  return (
    <div className="flex flex-col rounded-2xl border border-[#F0DDD2] bg-white p-6">
      <div className="flex items-center justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#FFF1EA] text-[#FF5A1F]">{icon}</span>
        <span className="display text-3xl font-bold text-[#FF5A1F]">{n}</span>
      </div>
      <h3 className="display mt-8 text-xl font-bold">{title}</h3>
      <p className="mt-2 flex-1 text-[15px] leading-6 text-[#7A6A60]">{text}</p>
      <code className="mono mt-5 self-start rounded-md bg-[#FFF1EA] px-2.5 py-1.5 text-[11px] text-[#E34A12]">{code}</code>
    </div>
  );
}

function Reason({ icon, title, text }) {
  return (
    <div className="flex gap-5 py-6">
      <span className="mt-0.5 text-[#FF5A1F]">{icon}</span>
      <div>
        <h3 className="display text-lg font-bold">{title}</h3>
        <p className="mt-1 text-[15px] leading-6 text-[#7A6A60]">{text}</p>
      </div>
    </div>
  );
}

const STAGE_STEPS = [
  { label: "navigate", text: "github.com", cursor: [18, 12] },
  { label: "click", text: "Search", cursor: [42, 30] },
  { label: "change", text: 'q = "playwright"', cursor: [60, 30] },
  { label: "change", text: 'language = "typescript"', cursor: [30, 52] },
];

function HeroStage() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % 6), 1300);
    return () => clearInterval(id);
  }, []);
  const done = step >= 4;
  const cur = STAGE_STEPS[Math.min(step, 3)].cursor;
  return (
    <div className="relative mx-auto h-[460px] w-full max-w-[520px]">
      {/* Browser */}
      <motion.div
        initial={{ opacity: 0, rotate: -6, y: 30 }} animate={{ opacity: 1, rotate: -3, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}
        className="absolute left-0 top-0 w-[88%] overflow-hidden rounded-2xl border border-[#F0DDD2] bg-white shadow-[0_30px_60px_-30px_rgba(227,74,18,.45)]"
      >
        <div className="flex items-center gap-2 border-b border-[#F0DDD2] bg-[#FFF1EA]/60 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5A1F]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5A1F]/50" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5A1F]/25" />
          <span className="mono ml-3 flex-1 rounded-full bg-white px-3 py-1 text-[11px] text-[#7A6A60]">github.com</span>
        </div>
        <div className="relative h-[190px] p-5">
          <div className="h-9 rounded-lg border border-[#F0DDD2] px-3 py-2 text-[13px]">
            {step >= 2 ? <span>playwright</span> : <span className="text-[#C9B8AD]">Search GitHub</span>}
          </div>
          <div className="mt-4 flex gap-2">
            {["TypeScript", "Stars ≥ 100"].map((f, i) => (
              <span key={f} className={`rounded-full px-3 py-1 text-[11px] font-medium transition ${step >= 3 + i * 0 && (i === 0 ? step >= 3 : step >= 4) ? "bg-[#FF5A1F] text-white" : "bg-[#FFF1EA] text-[#E34A12]"}`}>
                {f}
              </span>
            ))}
          </div>
          <div className="mt-5 space-y-2">
            {[70, 90, 55].map((w) => (
              <div key={w} className="h-2.5 rounded bg-[#F6EAE2]" style={{ width: `${w}%` }} />
            ))}
          </div>
          <motion.div
            animate={{ left: `${cur[0]}%`, top: `${cur[1]}%` }} transition={{ type: "spring", stiffness: 120, damping: 16 }}
            className="absolute text-[#FF5A1F] drop-shadow"
          >
            <MousePointer2 size={22} fill="#FF5A1F" />
          </motion.div>
        </div>
      </motion.div>

      {/* Connector */}
      <svg className="absolute left-[44%] top-[44%] h-[90px] w-[60px]" viewBox="0 0 60 90" fill="none">
        <motion.path d="M4 2C4 50 56 40 56 86" stroke="#FF5A1F" strokeWidth="2.5" strokeDasharray="6 7" strokeLinecap="round"
          animate={{ strokeDashoffset: [0, -26] }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} />
      </svg>

      {/* Terminal */}
      <motion.div
        initial={{ opacity: 0, rotate: 6, y: 40 }} animate={{ opacity: 1, rotate: 2, y: 0 }} transition={{ delay: 0.4, duration: 0.7 }}
        className="mono absolute bottom-0 right-0 w-[92%] rounded-2xl bg-[#FF5A1F] p-5 text-[12px] leading-6 text-white shadow-[0_40px_70px_-30px_rgba(227,74,18,.8)]"
      >
        <div className="mb-3 flex items-center justify-between text-[11px] text-white/75">
          <span>sitecmd learn</span>
          <span>{done ? "compiled" : "recording"}</span>
        </div>
        {STAGE_STEPS.map((s, i) => (
          <div key={s.text} className={`flex gap-3 transition-opacity duration-300 ${step >= i ? "opacity-100" : "opacity-20"}`}>
            <span className="w-14 text-white/70">{s.label}</span>
            <span className="truncate">{s.text}</span>
          </div>
        ))}
        <div className={`mt-3 rounded-lg bg-white p-3 text-[#1B1410] transition-all duration-500 ${done ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
          <span className="text-[#FF5A1F]">$</span> sitecmd run github_search
          <br />
          <span className="pl-3">--query "playwright"</span>
        </div>
      </motion.div>
    </div>
  );
}