// npm run qa: the release gate. Builds the site in live mode (for indexing-dependent
// audits such as Lighthouse SEO) and in review mode (the deployable artefact), runs every
// check, writes qa/results.json and QA_REPORT.md, and exits non-zero on any failure.
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { runContentChecks } from './content.mjs';
import { runSpell } from './spell.mjs';
import { runBrowserChecks } from './browser.mjs';
import { runLighthouse } from './lighthouse.mjs';

const root = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const dist = path.join(root, 'dist');
const qaDir = path.join(root, 'qa');
const port = 4455;
const base = `http://localhost:${port}`;
const quick = process.argv.includes('--quick');
const all = [];
const started = new Date();

function sh(cmd, args, env = {}) {
  const r = spawnSync(cmd, args, { cwd: root, encoding: 'utf8', env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1', ...env } });
  return { ok: r.status === 0, out: (r.stdout || '') + (r.stderr || '') };
}
function record(section, r) {
  all.push({ section, ...r });
  console.log(`${r.pass ? 'PASS' : 'FAIL'}  [${section}] ${r.name}${r.pass ? '' : `  (${r.count})`}`);
  if (!r.pass) r.details.slice(0, 10).forEach((x) => console.log('      ' + x));
}
function build(mode) {
  const r = sh('npm', ['run', 'build'], { SITE_MODE: mode });
  const warn = r.out.split('\n').filter((l) => /\b(warn|error)\b/i.test(l) && !/contact\/error/.test(l));
  record(mode, { name: `npm run build (SITE_MODE=${mode}) completes without errors or warnings`, pass: r.ok && warn.length === 0, details: r.ok ? warn : [r.out.slice(-2000)], count: warn.length || (r.ok ? 0 : 1) });
  return r.ok;
}
async function serve() {
  const p = spawn(process.execPath, [path.join(root, 'scripts/serve.mjs')], { env: { ...process.env, PORT: String(port) }, stdio: 'ignore' });
  for (let i = 0; i < 50; i++) {
    try {
      await fetch(base + '/');
      return p;
    } catch {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  throw new Error('server did not start');
}

// 1. TypeScript
{
  const r = sh('npx', ['astro', 'check']);
  const m = r.out.match(/(\d+) errors?/);
  record('code', { name: 'TypeScript and Astro check (astro check): 0 errors', pass: r.ok && m && m[1] === '0', details: r.ok ? [] : r.out.split('\n').filter((l) => /error/.test(l)).slice(0, 20), count: r.ok ? 0 : 1 });
}

// 2. Live-mode build: static checks, HTML validity, spelling, browser, Lighthouse
if (build('live')) {
  const c = runContentChecks(dist, 'live');
  c.results.forEach((r) => record('live', r));
  const hv = sh('npx', ['html-validate', 'dist/**/*.html']);
  record('live', { name: 'Valid HTML (html-validate, recommended rules), every page', pass: hv.ok, details: hv.ok ? [] : hv.out.split('\n').filter((l) => /error/.test(l)).slice(0, 30), count: hv.ok ? 0 : 1 });
  record('live', runSpell(dist, root));

  const urls = c.pages;
  const projectSamples = ['pakistan', 'saudi-arabia', 'libya', 'iraq', 'iran', 'malaysia', 'mozambique'].map((cn) => {
    const dir = path.join(dist, 'projects', cn);
    const first = fs.readdirSync(dir, { withFileTypes: true }).find((e) => e.isDirectory());
    return `/projects/${cn}/${first.name}/`;
  });
  const representative = [...urls.filter((u) => !/^\/projects\/[^/]+\/[^/]+\/$/.test(u)), ...projectSamples, '/projects/libya/benghazi-eastern-border-220-kv-double-circuit-lines-750-km/'];
  const keyPages = ['/', '/projects/', '/projects/libya/', '/libya/', '/contact/', '/projects/pakistan/barotha-rewat-500-kv-transmission-lines/'];
  const server = await serve();
  try {
    if (!quick) {
      const signoff = ['/', '/projects/', '/projects/libya/', '/projects/libya/benghazi-eastern-border-220-kv-double-circuit-lines-750-km/', '/libya/', '/about/'];
      const b = await runBrowserChecks({ base, urls, screensDir: path.join(qaDir, 'screens'), representative, keyPages, signoff });
      b.forEach((r) => record('browser', r));
      const lh = await runLighthouse({
        base,
        pages: [...keyPages, '/about/', '/services/', '/global-presence/', '/leadership/', '/capabilities/', '/downloads/'],
        outDir: path.join(qaDir, 'lighthouse'),
      });
      record('lighthouse', lh);
    }
  } finally {
    server.kill();
  }
}

// 3. Review-mode build (the artefact deployed until the domain goes live)
if (build('review')) {
  const c = runContentChecks(dist, 'review');
  c.results.filter((r) => /indexing|Forbidden|contact form/i.test(r.name)).forEach((r) => record('review', r));
  const server = await serve();
  try {
    const res = await fetch(base + '/');
    const tag = res.headers.get('x-robots-tag');
    const html = await res.text();
    const d = [];
    if (tag !== 'noindex, nofollow') d.push(`X-Robots-Tag header is "${tag}"`);
    if (!/<meta name="robots" content="noindex, nofollow"/.test(html)) d.push('home page lacks noindex meta');
    if (!/<link rel="canonical" href="https:\/\/[^"]+\.pages\.dev\/"/.test(html)) d.push('canonical does not point at the pages.dev address');
    record('review', { name: 'Review mode served with X-Robots-Tag noindex, noindex meta and pages.dev canonical', pass: d.length === 0, details: d, count: d.length });
  } finally {
    server.kill();
  }
}

// 4. Leave the deployable artefact in dist/: review unless SITE_MODE=live
const deployMode = process.env.SITE_MODE === 'live' ? 'live' : 'review';
if (deployMode === 'live') build('live');

// 5. Report
const failed = all.filter((r) => !r.pass);
fs.mkdirSync(qaDir, { recursive: true });
fs.writeFileSync(path.join(qaDir, 'results.json'), JSON.stringify({ started, finished: new Date(), results: all }, null, 1));
const table = (rows, cols) =>
  rows.length ? [`| ${cols.join(' | ')} |`, `|${cols.map(() => '---').join('|')}|`, ...rows.map((r) => `| ${cols.map((c) => r[c]).join(' | ')} |`)].join('\n') : '';
const lh = all.find((r) => r.section === 'lighthouse');
const vit = all.find((r) => /Web Vitals/.test(r.name));
const openItems = fs.readFileSync(path.join(root, 'data', 'OPEN_ITEMS.md'), 'utf8');
const openCount = (openItems.match(/^\d+\. /gm) || []).length;
const report = `# QA report

Generated by \`npm run qa\` on ${started.toISOString().slice(0, 16).replace('T', ' ')} UTC.
Result: **${failed.length === 0 ? 'ALL CHECKS PASS' : `${failed.length} CHECK(S) FAILING`}** (${all.length - failed.length} of ${all.length} passed).

Environment: Astro static build, Node ${process.version}, Chromium (Playwright), Lighthouse ${JSON.parse(fs.readFileSync(path.join(root, 'node_modules/lighthouse/package.json'))).version}, axe-core, html-validate, cspell (en-GB).
The site is built twice: in **live** mode (so indexing-dependent audits such as Lighthouse SEO are meaningful) and in **review** mode (the artefact deployed to pages.dev until the domain goes live, with noindex everywhere).

## Checks

| | Section | Check | Issues |
|---|---|---|---|
${all.map((r) => `| ${r.pass ? 'PASS' : '**FAIL**'} | ${r.section} | ${r.name} | ${r.count} |`).join('\n')}

${failed.length ? `## Failures\n\n${failed.map((r) => `### ${r.name}\n\n${r.details.map((d) => `- ${d}`).join('\n')}`).join('\n\n')}\n` : ''}
## Lighthouse (mobile, simulated Slow 4G, 4x CPU)

${lh ? table(lh.table, ['url', 'performance', 'accessibility', 'bestPractices', 'seo', 'lcp', 'cls', 'tbt', 'kb']) : 'Not run (--quick).'}

LCP and TBT in ms; kb = total transfer size of the page on first load.

## Web Vitals on emulated devices (Playwright, Slow 4G: 150 ms RTT, 1.6 Mbps)

${vit ? table(vit.table, ['device', 'url', 'lcp', 'cls', 'inp', 'kb']) : 'Not run (--quick).'}

INP is the longest interaction measured while opening the menu and typing in the register search. The low-end Android profile adds 4x CPU slowdown. WebKit is not installed in this environment, so iPhone and iPad profiles use Chromium with the device viewport, pixel ratio and user agent.

## Screenshots

Sign-off screenshots of Home, Projects, the Libya country page, the Benghazi–eastern border project page, Libya and About at 390 and 1440 px are in \`qa/screens/390\` and \`qa/screens/1440\`. Full-page screenshots of every page type at 360, 768 and 1280 px are in \`qa/screens/360\`, \`qa/screens/768\` and \`qa/screens/1280\` (all non-project pages, one project page per country, and the flagship Libya line). Device screenshots are in \`qa/screens/devices\`. All ${JSON.parse(fs.readFileSync(path.join(root, 'src/data/projects.json'), 'utf8')).length} project pages share one template; each of them is checked automatically (axe, console, network, overflow, tap targets) at 390 px.

## Notes on method

- Fonts: three families (Inter Tight 300/400/600, Inter 300/500, Instrument Serif italic for one accent word per page), WOFF2, subset to exactly the characters the site uses (about 51 KB for all six files) and inlined into the single stylesheet. Text therefore renders in its final font from the first paint, so fonts cause no layout shift; \`font-display: swap\` and metric-matched local fallbacks remain declared as a safety net. A QA check fails the build if a page uses a character outside the subset.
- JavaScript: about 3 KB gzipped for the whole site (menu, hero card, capability tabs, featured rows, decade selector, register filters, form). No autoplay. Budget 40 KB.
- Images: AVIF and WebP with a JPEG fallback, widths 480/960/1600 (phones capped at 960 px), explicit dimensions, lazy loading except the first-screen photo, which is preloaded with the same sources as its <picture>. Warm photos carry a navy monochrome grade.
- Pages were read at 390 px for typos and figures against \`src/data/facts.md\` (see REVIEW.md for the checklist given to the company).
- The W3C validator is not reachable from the build environment; html-validate with its recommended rule set is used instead.

## Open items

${openCount} items are listed in \`data/OPEN_ITEMS.md\` (source conflicts withheld from the site, names to confirm, verification that was not possible from this environment, and deployment steps waiting on credentials).
`;
fs.writeFileSync(path.join(root, 'QA_REPORT.md'), report);
console.log(`\n${failed.length === 0 ? 'QA PASSED' : `QA FAILED: ${failed.length} check(s)`} — see QA_REPORT.md`);
process.exit(failed.length === 0 ? 0 : 1);
