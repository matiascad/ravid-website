// ─────────────────────────────────────────────────────────────────────────────
// W2-A1 SCAFFOLD-CONFIG
// INVARIANT   Every CSS file in the build passes through Tailwind and then
//             Autoprefixer, and Tailwind reads EXACTLY ./tailwind.config.ts.
// IMPOSSIBLE  Tailwind cannot silently pick up the legacy tailwind.config.js.
//             Tailwind's own resolution order tries .js BEFORE .ts, so while the
//             old file is still awaiting quarantine it would otherwise win. The
//             explicit `config` path removes that ambiguity entirely - which file
//             is authoritative is no longer a function of what happens to exist.
// CLASS       Closed by derivation: the path is absolute-by-name, so it holds
//             before, during and after the legacy file is quarantined.
// HONEST LIMIT  This does not delete or move tailwind.config.js - another
//             delegate owns that - so the dead file is still ON DISK and still
//             confusing to a human reader until it is quarantined. It also says
//             nothing about whether the CSS variables the Tailwind config
//             references are ever defined; app/globals.css is another delegate's.
// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
  plugins: {
    tailwindcss: { config: './tailwind.config.ts' },
    autoprefixer: {},
  },
}
