import React, { useState, useEffect } from "react";
import { Check, Copy, GitBranch, ArrowLeft, Menu, X } from "lucide-react";

const O = "#FF5A1F";

/* ---------- CONTENT ---------- */

const FEATURES = [
  ["Zero-code automation", "Record workflows visually in Chrome. No Playwright or Puppeteer scripts, no hunting for DOM selectors."],
  ["Persistent auth and sessions", "Log in once, including MFA, OTP, CAPTCHA, or OAuth. Sessions are saved in isolated local browser profiles, so commands run already signed in."],
  ["Smart parameter naming", "Input fields get readable names like query, address, quantity, or min_rating. This runs 100% locally with no LLM or cloud API."],
  ["Smart wait engine", "Playwright visibility checks replace fragile sleep timers, so runs are fast and hold up on dynamic pages."],
  ["Cross-page recording", "Page navigations, link clicks, form submissions, and multi-page flows are all captured."],
  ["Pipeline ready", "Chain commands in shell scripts, cron jobs, or automated workflows."],
];

const STEPS = [
  {
    id: "connect", title: "1. Connect to a website", cmd: "sitecmd connect https://github.com",
    body: ["A browser window opens.", "Complete any login, 2FA/MFA, or CAPTCHA manually.", "Press ENTER in your terminal when you are logged in. The session is saved in a local browser profile."],
  },
  {
    id: "learn", title: "2. Record a workflow", cmd: "sitecmd learn https://github.com",
    body: ["The browser opens with your saved session active.", "Do the task you want to capture, such as clicking search, typing a query, or moving between pages.", "Return to the terminal and press ENTER. The trace is saved as JSON in ./data/recordings/."],
  },
  {
    id: "compile", title: "3. Compile the recording", cmd: "sitecmd compile data/recordings/github.com-2026-08-24T12-10-58-721Z.json --name github_search",
    out: "Command compiled.\nName: github_search\nSite: https://github.com\n\nParameters:\n  query (string) [default: \"sitecmd\"]\n\nSaved to:\ndata/commands/github_search.json",
    body: ["If you leave out --name, sitecmd asks for a command name."],
  },
  {
    id: "inspect", title: "4. Inspect a command", cmd: "sitecmd inspect github_search",
    out: "Command: github_search\nSite:    https://github.com\n\nParameters:\n  - query (string) [default: \"sitecmd\"]\n\nSteps (3):\n   1. navigate: https://github.com\n   2. click: button[aria-label=\"Search\"]\n   3. change: input[name=\"q\"] = {{query}}",
    body: ["See a command's site, parameters, defaults, and recorded steps."],
  },
  {
    id: "list", title: "5. List saved commands", cmd: "sitecmd commands",
    out: "Learned commands\n------------------------------------\n\ngithub_search\n  site: https://github.com\n  parameters:\n    - query (string) [default: \"sitecmd\"]\n\nblinkit_order\n  site: https://blinkit.com\n  parameters:\n    - query (string) [default: \"atta dal\"]\n    - address (string) [default: \"Home\"]",
    body: ["Show every compiled command saved on your machine."],
  },
  {
    id: "run", title: "6. Run a command", cmd: '# Run with a custom parameter\nsitecmd run github_search --query "playwright"\n\n# Run with default values\nsitecmd run github_search',
    body: ["sitecmd opens the browser, restores your session, applies your inputs, and runs the recorded steps."],
  },
  {
    id: "disconnect", title: "7. Disconnect a session", cmd: "sitecmd disconnect https://github.com",
    body: ["Remove the saved login session and clear the local profile for a website."],
  },
];

const PARAMS = [
  ["Search for atta dal and more", "query"],
  ["Enter delivery address", "address"],
  ["Enter quantity", "quantity"],
  ["Minimum rating", "min_rating"],
  ["Filter by price (max)", "max_price"],
  ["Enter your pincode", "pincode"],
];

const CLI = [
  ["connect", "sitecmd connect <url>", "Connect and sign in to a website. Saves the profile session."],
  ["open", "sitecmd open <url>", "Open a browser window with a saved session."],
  ["disconnect", "sitecmd disconnect <url>", "Delete the local session and profile data."],
  ["learn", "sitecmd learn <url>", "Record clicks, inputs, and navigations."],
  ["compile", "sitecmd compile <recording> [--name <name>]", "Turn a raw recording into a reusable command."],
  ["commands", "sitecmd commands", "List all compiled commands."],
  ["inspect", "sitecmd inspect <command>", "Show parameters, defaults, and step flow."],
  ["run", "sitecmd run <command> [--param value]", "Run a command with parameter overrides."],
];

const NAV = [
  ["intro", "Introduction"],
  ["install", "Installation"],
  ["how", "How it works"],
  ["usage", "Usage guide"],
  ...STEPS.map((s) => [s.id, s.title.replace(/^\d\.\s/, "")]),
  ["params", "Parameter extraction"],
  ["cli", "CLI reference"],
];

/* ---------- PAGE ---------- */

export default function Docs() {
  const [active, setActive] = useState("intro");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-20% 0px -70% 0px" }
    );
    NAV.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);

  const Sidebar = (
    <nav className="space-y-0.5 text-[14px]">
      {NAV.map(([id, label]) => {
        const sub = STEPS.some((s) => s.id === id);
        return (
          <a
            key={id} href={`#${id}`} onClick={() => setOpen(false)}
            className={`block rounded-lg py-1.5 transition ${sub ? "pl-7" : "pl-3 font-medium"} pr-3 ${
              active === id ? "bg-[#FFF1EA] text-[#E34A12]" : "text-[#7A6A60] hover:text-[#FF5A1F]"
            }`}
          >
            {label}
          </a>
        );
      })}
    </nav>
  );

  return (
    <main className="min-h-screen bg-white text-[#1B1410] selection:bg-[#FF5A1F] selection:text-white" style={{ fontFamily: "'Instrument Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Instrument+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        .display{font-family:'Bricolage Grotesque',sans-serif;letter-spacing:-0.03em}
        .mono{font-family:'JetBrains Mono',monospace}
        html{scroll-behavior:smooth}
        section[id]{scroll-margin-top:92px}
        :focus-visible{outline:2px solid ${O};outline-offset:2px}
      `}</style>

      <header className="sticky top-0 z-50 border-b border-[#F0DDD2] bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between px-5">
          <a href="/" className="flex items-center gap-2.5">
            <span className="mono grid h-8 w-8 place-items-center rounded-lg bg-[#FF5A1F] text-xs font-bold text-white">&gt;_</span>
            <span className="display text-lg font-bold">sitecmd</span>
            <span className="rounded-full bg-[#FFF1EA] px-2.5 py-0.5 text-xs font-medium text-[#E34A12]">Docs</span>
          </a>
          <div className="flex items-center gap-3">
            <a href="/" className="hidden items-center gap-1.5 text-sm font-medium text-[#7A6A60] hover:text-[#FF5A1F] sm:flex">
              <ArrowLeft size={14} /> Home
            </a>
            <a href="https://github.com/PRERAN001/sitecmd" target="_blank" rel="noreferrer"
               className="inline-flex items-center gap-2 rounded-full border border-[#F0DDD2] px-4 py-2 text-sm font-medium transition hover:border-[#FF5A1F] hover:text-[#FF5A1F]">
              <GitBranch size={15} /> GitHub
            </a>
            <button className="grid h-10 w-10 place-items-center rounded-full border border-[#F0DDD2] lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        {open && <div className="max-h-[70vh] overflow-y-auto border-t border-[#F0DDD2] bg-white p-4 lg:hidden">{Sidebar}</div>}
      </header>

      <div className="mx-auto grid max-w-[1180px] gap-12 px-5 lg:grid-cols-[230px_1fr]">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] overflow-y-auto py-10 lg:block">{Sidebar}</aside>

        <article className="min-w-0 max-w-[760px] py-12 lg:py-14">
          {/* Intro */}
          <section id="intro">
            <h1 className="display text-[44px] font-extrabold leading-[1] sm:text-[64px]">
              Turn any website into a <span className="text-[#FF5A1F]">CLI tool.</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-[#7A6A60]">
              sitecmd records your actions on a website and compiles them into reusable, parameterized CLI commands.
              Do a task once in your browser, such as searching products, filling forms, or navigating dashboards,
              then run it from your terminal whenever you want.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {FEATURES.map(([t, d]) => (
                <div key={t} className="rounded-2xl border border-[#F0DDD2] p-5">
                  <h3 className="display font-bold">{t}</h3>
                  <p className="mt-1.5 text-[14px] leading-6 text-[#7A6A60]">{d}</p>
                </div>
              ))}
            </div>
          </section>

          <Section id="install" title="Installation">
            <p>Install globally with npm:</p>
            <Code>npm install -g sitecmd</Code>
            <p>Or run it directly with npx:</p>
            <Code>npx sitecmd --help</Code>
            <Callout>You need Node.js v18 or later and the Chrome browser installed.</Callout>
          </Section>

          <Section id="how" title="How it works">
            <div className="grid gap-3 sm:grid-cols-4">
              {[["Connect", "Sign in and save your session."], ["Learn", "Record clicks, typing, and navigation."], ["Compile", "Turn the recording into a named command."], ["Run", "Replay it with your own arguments."]].map(([t, d], i) => (
                <div key={t} className={`rounded-2xl p-4 ${i === 3 ? "bg-[#FF5A1F] text-white" : "border border-[#F0DDD2]"}`}>
                  <span className="display text-2xl font-bold">{i + 1}</span>
                  <p className="display mt-3 font-bold">{t}</p>
                  <p className={`mt-1 text-[13px] leading-5 ${i === 3 ? "text-white/85" : "text-[#7A6A60]"}`}>{d}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section id="usage" title="Usage guide">
            <p>Follow these steps to take a workflow from your browser to your terminal.</p>
          </Section>

          {STEPS.map((s) => (
            <section key={s.id} id={s.id} className="mt-10">
              <h3 className="display text-2xl font-bold">{s.title}</h3>
              <Code>{s.cmd}</Code>
              {s.out && <Code output>{s.out}</Code>}
              <ul className="mt-4 space-y-2 text-[15px] leading-7 text-[#5A4A40]">
                {s.body.map((b) => (
                  <li key={b} className="flex gap-3"><span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF5A1F]" />{b}</li>
                ))}
              </ul>
            </section>
          ))}

          <Section id="params" title="Smart parameter extraction">
            <p>sitecmd reads input fields and gives them clear names using deterministic rules. Nothing leaves your machine.</p>
            <Table head={["Input label or placeholder", "Parameter name"]}
              rows={PARAMS.map(([a, b]) => [a, <code key={b} className="mono rounded bg-[#FFF1EA] px-2 py-0.5 text-[13px] text-[#E34A12]">{b}</code>])} />
          </Section>

          <Section id="cli" title="CLI reference">
            <Table head={["Command", "Usage", "What it does"]}
              rows={CLI.map(([a, b, c]) => [
                <code key={a} className="mono font-medium text-[#E34A12]">{a}</code>,
                <code key={b} className="mono text-[12px]">{b}</code>,
                c,
              ])} />
          </Section>
        </article>
      </div>
    </main>
  );
}

/* ---------- PARTS ---------- */

function Section({ id, title, children }) {
  return (
    <section id={id} className="mt-20 space-y-4 text-[15px] leading-7 text-[#5A4A40]">
      <h2 className="display border-t border-[#F0DDD2] pt-8 text-3xl font-bold text-[#1B1410] sm:text-4xl">{title}</h2>
      {children}
    </section>
  );
}

function Callout({ children }) {
  return <div className="rounded-xl border-l-4 border-[#FF5A1F] bg-[#FFF1EA] px-5 py-4 text-[14px] text-[#5A4A40]">{children}</div>;
}

function Code({ children, output }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(children); } catch (e) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  return (
    <div className={`relative mt-4 rounded-xl ${output ? "border border-[#F0DDD2] bg-[#FFF1EA]/50" : "bg-[#FF5A1F]"}`}>
      <pre className={`mono overflow-x-auto p-4 pr-12 text-[13px] leading-6 ${output ? "text-[#5A4A40]" : "text-white"}`}>{children}</pre>
      {!output && (
        <button onClick={copy} aria-label="Copy code"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg bg-white/20 text-white transition hover:bg-white hover:text-[#FF5A1F]">
          {copied ? <Check size={15} /> : <Copy size={15} />}
        </button>
      )}
    </div>
  );
}

function Table({ head, rows }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#F0DDD2]">
      <table className="w-full min-w-[520px] text-left text-[14px]">
        <thead className="bg-[#FFF1EA] text-[#E34A12]">
          <tr>{head.map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-[#F0DDD2]">
              {r.map((c, j) => <td key={j} className="px-4 py-3 align-top">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}