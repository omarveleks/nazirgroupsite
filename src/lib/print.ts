// Helpers for the build-only print pages (PDFs): plain JPEG paths at print resolution.
import images from '../data/images.json';

export function jpg(name: string, max = 1600): string {
  const e = (images.photos as Record<string, { widths: number[] }>)[name];
  if (!e) throw new Error(`No photo named ${name}`);
  const w = e.widths.filter((x) => x <= max).at(-1) ?? e.widths[0];
  return `/images/photos/${name}-${w}.jpg`;
}

export const person = (name: string) => `/images/people/${name}-480.jpg`;

export const pad2 = (n: number) => String(n).padStart(2, '0');

export const list = (xs: string[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}` : (xs[0] ?? ''));
