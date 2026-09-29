/**
 * Build-time map geometry. Country outlines come from the world-atlas package
 * (Natural Earth, public domain) and are projected with d3-geo into static SVG
 * path strings. Nothing here runs in the browser.
 */
import { feature } from 'topojson-client';
import { geoMercator, geoPath, geoCentroid, type GeoProjection } from 'd3-geo';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import world50 from 'world-atlas/countries-50m.json';
import world110 from 'world-atlas/countries-110m.json';

type CountryFeature = Feature<Geometry, { name: string }>;

function load(topo: unknown): CountryFeature[] {
  const t = topo as Topology<{ countries: GeometryCollection<{ name: string }> }>;
  return (feature(t, t.objects.countries) as FeatureCollection<Geometry, { name: string }>).features;
}

const fc50 = load(world50);
const fc110 = load(world110);

export const ISO: Record<string, string> = {
  pakistan: '586',
  'saudi-arabia': '682',
  libya: '434',
  iraq: '368',
  iran: '364',
  malaysia: '458',
  mozambique: '508',
  'united-kingdom': '826',
};

function byId(list: CountryFeature[], id: string): CountryFeature {
  const f = list.find((x) => x.id === id);
  if (!f) throw new Error(`No geometry for ${id}`);
  return f;
}

/** A single country outline fitted into a w x h box (used for the tile markers). */
export function outline(slug: string, w = 96, h = 72, pad = 4): string {
  const f = byId(fc50, ISO[slug]!);
  const proj = geoMercator().fitExtent(
    [
      [pad, pad],
      [w - pad, h - pad],
    ],
    f,
  );
  return geoPath(proj).digits(1)(f) ?? '';
}

export interface MapPoint {
  slug: string;
  x: number;
  y: number;
}

/** Regional map from the UK to Malaysia and Mozambique. */
export function worldMap(highlight: string[], w = 960, h = 620) {
  const bounds: Feature = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'MultiPoint',
      coordinates: [
        [-12, 58],
        [122, 58],
        [-12, -30],
        [122, -30],
      ],
    },
  };
  const proj = geoMercator().fitExtent(
    [
      [0, 0],
      [w, h],
    ],
    bounds,
  );
  proj.clipExtent([
    [0, 0],
    [w, h],
  ]);
  const path = geoPath(proj).digits(1);
  const ids = new Set(highlight.map((s) => ISO[s]));
  const base: string[] = [];
  const hi: { slug: string; d: string }[] = [];
  for (const f of fc110) {
    const d = path(f);
    if (!d) continue;
    if (ids.has(String(f.id))) continue;
    base.push(d);
  }
  const points: MapPoint[] = [];
  for (const slug of highlight) {
    const f = byId(fc50, ISO[slug]!);
    // Malaysia: use the peninsula, where the documented work was done
    const d = path(f) ?? '';
    hi.push({ slug, d });
    const c =
      slug === 'malaysia'
        ? proj([102.2, 4.2])
        : slug === 'united-kingdom'
          ? proj([-1.8, 52.8])
          : proj(geoCentroid(f));
    if (c) points.push({ slug, x: Math.round(c[0]), y: Math.round(c[1]) });
  }
  return { base: base.join(''), hi, points, w, h };
}

export interface Place {
  name: string;
  lon: number;
  lat: number;
}

/** Libya with neighbouring coastline, plus a projection for plotting places. */
export function libyaMap(w = 720, h = 620) {
  const libya = byId(fc50, ISO.libya!);
  const proj: GeoProjection = geoMercator().fitExtent(
    [
      [30, 20],
      [w - 20, h - 20],
    ],
    libya,
  );
  proj.clipExtent([
    [0, 0],
    [w, h],
  ]);
  const path = geoPath(proj).digits(1);
  const neighbours = ['788', '012', '562', '148', '729', '818'].map((id) => path(byId(fc50, id)) ?? '').join('');
  const at = (lon: number, lat: number) => {
    const p = proj([lon, lat])!;
    return { x: Math.round(p[0] * 10) / 10, y: Math.round(p[1] * 10) / 10 };
  };
  return { libya: path(libya) ?? '', neighbours, at, w, h };
}
