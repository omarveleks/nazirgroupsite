/**
 * Build-time geometry for the hero drawing: a 220 kV double-circuit lattice
 * tower with conductors running to smaller towers in perspective.
 * Produces plain SVG path strings; no client-side code.
 */

interface Pt {
  x: number;
  y: number;
}

const r = (n: number) => Math.round(n * 10) / 10;
const P = (p: Pt) => `${r(p.x)} ${r(p.y)}`;

export interface Tower {
  body: string; // legs, bracing and crossarms
  insulators: string;
  attach: Pt[]; // conductor attachment points (bottom of insulator strings), left side first
  peaks: Pt[]; // earth-wire attachment points
  base: { x: number; y: number; w: number };
}

/** A tower of nominal height 360 units drawn at scale s with its base centre at (cx, by). */
export function tower(cx: number, by: number, s: number, detail = true): Tower {
  const h = 360 * s;
  const top = by - h;
  const baseHalf = 46 * s;
  const waistY = by - 0.62 * h;
  const waistHalf = 11 * s;
  const neckHalf = 9 * s;
  const cageTop = top + 18 * s;

  const legL = (y: number) => {
    if (y >= waistY) {
      const t = (by - y) / (by - waistY);
      return cx - (baseHalf - (baseHalf - waistHalf) * t);
    }
    const t = (waistY - y) / (waistY - cageTop);
    return cx - (waistHalf - (waistHalf - neckHalf) * t);
  };
  const legR = (y: number) => 2 * cx - legL(y);

  const d: string[] = [];
  // main legs
  d.push(`M${P({ x: cx - baseHalf, y: by })}L${P({ x: cx - waistHalf, y: waistY })}L${P({ x: cx - neckHalf, y: cageTop })}`);
  d.push(`M${P({ x: cx + baseHalf, y: by })}L${P({ x: cx + waistHalf, y: waistY })}L${P({ x: cx + neckHalf, y: cageTop })}`);
  // earth-wire peak
  const peakY = top;
  d.push(`M${P({ x: cx - neckHalf, y: cageTop })}L${P({ x: cx - 3 * s, y: peakY })}L${P({ x: cx + 3 * s, y: peakY })}L${P({ x: cx + neckHalf, y: cageTop })}`);
  // earth-wire arms
  const ewY = top + 6 * s;
  const ewL = { x: cx - 30 * s, y: ewY };
  const ewR = { x: cx + 30 * s, y: ewY };
  d.push(`M${P({ x: cx - 4 * s, y: peakY + 2 * s })}L${P(ewL)}L${P({ x: cx - neckHalf, y: cageTop })}`);
  d.push(`M${P({ x: cx + 4 * s, y: peakY + 2 * s })}L${P(ewR)}L${P({ x: cx + neckHalf, y: cageTop })}`);

  // crossarms: three levels each side, middle arm longest
  const arms = [
    { y: top + 0.17 * h, len: 52 * s },
    { y: top + 0.31 * h, len: 64 * s },
    { y: top + 0.45 * h, len: 52 * s },
  ];
  const attach: Pt[] = [];
  const ins: string[] = [];
  const insLen = 26 * s;
  for (const side of [-1, 1]) {
    for (const a of arms) {
      const xLeg = side < 0 ? legL(a.y) : legR(a.y);
      const tip = { x: cx + side * a.len, y: a.y };
      const armDepth = 9 * s;
      // arm: top chord to tip, bottom chord back to leg, one diagonal
      d.push(`M${P({ x: xLeg, y: a.y - armDepth })}L${P(tip)}L${P({ x: xLeg, y: a.y + armDepth * 0.2 })}`);
      if (detail) {
        const mid = { x: (xLeg + tip.x) / 2, y: a.y - armDepth / 2 };
        d.push(`M${P({ x: xLeg, y: a.y + armDepth * 0.2 })}L${P(mid)}`);
      }
      const end = { x: tip.x, y: tip.y + insLen };
      ins.push(`M${P(tip)}L${P(end)}`);
      if (detail) {
        // insulator discs as short ticks
        for (let k = 1; k <= 5; k++) {
          const yy = tip.y + (insLen * k) / 6;
          ins.push(`M${P({ x: tip.x - 2.2 * s, y: yy })}L${P({ x: tip.x + 2.2 * s, y: yy })}`);
        }
      }
      attach.push(end);
    }
  }

  // lattice bracing: alternating diagonals between the legs
  const panels = detail ? 14 : 7;
  const bracingTop = cageTop + 4 * s;
  let prev: Pt | null = null;
  for (let i = 0; i <= panels; i++) {
    const y = by - ((by - bracingTop) * i) / panels;
    const p = i % 2 === 0 ? { x: legL(y), y } : { x: legR(y), y };
    if (prev) d.push(`M${P(prev)}L${P(p)}`);
    prev = p;
  }
  prev = null;
  for (let i = 0; i <= panels; i++) {
    const y = by - ((by - bracingTop) * i) / panels;
    const p = i % 2 === 0 ? { x: legR(y), y } : { x: legL(y), y };
    if (prev) d.push(`M${P(prev)}L${P(p)}`);
    prev = p;
  }
  // horizontal struts at the arm levels and waist
  for (const y of [waistY, ...arms.map((a) => a.y + 9 * s * 0.2)]) {
    d.push(`M${P({ x: legL(y), y })}L${P({ x: legR(y), y })}`);
  }
  // footings
  d.push(`M${P({ x: cx - baseHalf - 6 * s, y: by })}L${P({ x: cx - baseHalf + 6 * s, y: by })}`);
  d.push(`M${P({ x: cx + baseHalf - 6 * s, y: by })}L${P({ x: cx + baseHalf + 6 * s, y: by })}`);

  return { body: d.join(''), insulators: ins.join(''), attach, peaks: [ewL, ewR], base: { x: cx, y: by, w: baseHalf } };
}

/** Catenary-like sagging conductor between two points (quadratic approximation). */
export function span(a: Pt, b: Pt, sag: number): string {
  const c = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 + 2 * sag };
  return `M${P(a)}Q${P(c)} ${P(b)}`;
}

export function heroGeometry() {
  const horizonY = 250;
  const groundY = 410;
  const stations = [
    { x: 150, s: 1 },
    { x: 430, s: 0.44 },
    { x: 555, s: 0.2 },
    { x: 612, s: 0.09 },
  ];
  const towers = stations.map((st, i) => tower(st.x, horizonY + (groundY - horizonY) * st.s, st.s, i < 2));
  const wires: string[] = [];
  for (let i = 0; i < towers.length - 1; i++) {
    const a = towers[i]!;
    const b = towers[i + 1]!;
    const sag = 34 * ((stations[i]!.s + stations[i + 1]!.s) / 2);
    a.attach.forEach((p, k) => wires.push(span(p, b.attach[k]!, sag)));
    a.peaks.forEach((p, k) => wires.push(span(p, b.peaks[k]!, sag * 0.8)));
  }
  // conductors leaving the drawing to the left of the first tower
  const first = towers[0]!;
  first.attach.forEach((p) => wires.push(span({ x: -10, y: p.y + 30 }, p, 10)));
  first.peaks.forEach((p) => wires.push(span({ x: -10, y: p.y + 26 }, p, 8)));

  // ground: horizon line and receding survey ticks
  const ground: string[] = [`M0 ${groundY}H640`, `M0 ${horizonY}H640`];
  for (let k = 0; k <= 16; k++) {
    const x = (640 / 16) * k;
    ground.push(`M${x} ${groundY}v${k % 4 === 0 ? 10 : 5}`);
  }
  return { towers, wires: wires.join(''), ground: ground.join(''), groundY, horizonY };
}
