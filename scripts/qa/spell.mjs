// British English spell-check of the visible text of every built page (cspell + en-GB).
// Proper names (places, clients, people) are listed in qa/cspell-words.txt.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { parse } from 'node-html-parser';
import { listHtml, urlOf, visibleText } from './content.mjs';

export function runSpell(dist, root) {
  const tmp = path.join(root, 'qa', 'tmp', 'spell');
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.mkdirSync(tmp, { recursive: true });
  const map = {};
  for (const f of listHtml(dist)) {
    const r = parse(fs.readFileSync(f, 'utf8'));
    const url = urlOf(dist, f);
    const alt = [
      r.querySelector('title')?.text ?? '',
      r.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
      ...r.querySelectorAll('[aria-label]').map((n) => n.getAttribute('aria-label')),
    ].join('\n');
    const name = url.replace(/[^\w]+/g, '_') || 'home';
    const out = path.join(tmp, `${name}.txt`);
    fs.writeFileSync(out, visibleText(r) + '\n' + alt);
    map[out] = url;
  }
  const cfg = path.join(root, 'qa', 'cspell.json');
  const res = spawnSync('npx', ['cspell', 'lint', '--no-progress', '--no-summary', '--no-color', '-c', cfg, `${tmp}/*.txt`], {
    cwd: root,
    encoding: 'utf8',
  });
  const lines = (res.stdout + res.stderr).split('\n').filter((l) => /Unknown word/.test(l));
  const words = new Map();
  for (const l of lines) {
    const m = l.match(/^(.*?):\d+:\d+ - Unknown word \((.+?)\)/);
    if (!m) continue;
    const url = map[path.resolve(root, m[1])] ?? map[m[1]] ?? m[1];
    if (!words.has(m[2])) words.set(m[2], new Set());
    words.get(m[2]).add(url);
  }
  const details = [...words].map(([w, urls]) => `${w}: ${[...urls].slice(0, 3).join(', ')}${urls.size > 3 ? ` (+${urls.size - 3})` : ''}`);
  return { name: 'Spelling (British English, cspell en-GB)', pass: details.length === 0, details, count: details.length };
}
