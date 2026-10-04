// Service categories, each defined by the projects that document it.
// Used by the Services page and the capability statement PDF.
import { projects, type Project, type Sector } from './data';

export interface Service {
  id: string;
  title: string;
  intro: string;
  glyph: Sector;
  match: (p: Project) => boolean;
  /** Register link that shows exactly the matched projects, if one exists */
  registerFilter?: string;
  /** Register link to the closest sector, when the match is wider or narrower */
  relatedFilter?: { href: string; label: string };
  /** General illustration (not a photograph of a company project) */
  photo?: { name: string; alt: string; caption: string };
}

const tx = projects.filter((p) => p.sector === 'transmission' && p.voltage_kv !== null);
const minKv = Math.min(...tx.map((p) => p.voltage_kv!));
const maxAc = Math.max(...tx.filter((p) => !/HVDC/.test(p.name)).map((p) => p.voltage_kv!));

export const services: Service[] = [
  {
    id: 'transmission',
    title: `Overhead Transmission Lines (OHTL), ${minKv} kV to ${maxAc} kV and HVDC`,
    intro:
      'Foundations, tower assembly and erection, conductor stringing and complete turnkey lines, including 500 kV lines in Pakistan and Malaysia, 400 kV lines in Iraq and Iran, 380 kV lines in Saudi Arabia and the ±533 kV HVDC line from Songo to Apollo.',
    glyph: 'transmission',
    match: (p) => p.sector === 'transmission',
    registerFilter: '?sector=transmission',
    photo: { name: 'transmission-towers', alt: 'Lattice steel transmission towers and conductors against an evening sky', caption: 'Overhead transmission lines (illustration)' },
  },
  {
    id: 'substations',
    title: 'Substations and Grid Works',
    intro:
      'Construction of the 500/220 kV substation at Peshawar, civil works for 30/10 kV substations in Libya, and substations built with 33 kV line contracts in Libya, including four in the Messla field.',
    glyph: 'substation',
    match: (p) => p.sector === 'substation' || /lines and (four )?substations/i.test(p.name),
    photo: { name: 'substation', alt: 'Outdoor high-voltage substation with gantries, busbars and switchgear', caption: 'High-voltage substation (illustration)' },
  },
  {
    id: 'distribution',
    title: 'Distribution Networks, 11 kV to 35 kV',
    intro:
      'Overhead and underground 11, 13.8, 30 and 33 kV networks and cable works, mainly for utilities in Saudi Arabia, Libya and Iraq. Lines at 66 kV are listed under transmission.',
    glyph: 'distribution',
    match: (p) => p.sector === 'distribution',
    registerFilter: '?sector=distribution',
    photo: { name: 'distribution-pole', alt: 'Pole-mounted distribution transformer and insulators', caption: 'Distribution network (illustration)' },
  },
  {
    id: 'oilfield',
    title: 'Industrial and Oil-Field Electrical Works',
    intro:
      'Well electrification, underground cables, overhead lines and substations in the Sarir, Messla and Nafoora fields, refurbishment of electrical installations in hazardous areas, and installation works at the Ammonia I and II plants.',
    glyph: 'oil-and-gas-electrical',
    match: (p) => p.sector === 'oil-and-gas-electrical' || p.sector === 'industrial',
    relatedFilter: { href: '?sector=oil-and-gas-electrical', label: 'Oil-field electrical projects in the register' },
    photo: { name: 'industrial-plant', alt: 'Industrial process plant with steel structures', caption: 'Industrial plant (illustration)' },
  },
  {
    id: 'maintenance',
    title: 'Hot-Line and Transmission Line Maintenance',
    intro: 'Hot-line maintenance of a 138 kV line for Waha Oil Company, and maintenance of 220 kV transmission lines in Libya.',
    glyph: 'transmission',
    match: (p) => p.hotline || /^Maintenance of 220 kV/.test(p.scope),
    photo: { name: 'tower-mono', alt: 'Lattice transmission tower and conductors', caption: 'Transmission line (illustration)' },
  },
  {
    id: 'civil',
    title: 'Civil and Infrastructure Works',
    intro:
      'Roads and motorways, carriageways and interchanges, airport landside works, hydropower civil works, water supply, sewerage and housing schemes.',
    glyph: 'civil',
    match: (p) => p.sector === 'civil',
    registerFilter: '?sector=civil',
    photo: { name: 'power-channel', alt: 'Concrete-lined power channel with a road bridge and fenced embankments', caption: 'Hydropower channel (illustration)' },
  },
  {
    id: 'telecom',
    title: 'Telecommunication and Pipeline Works',
    intro:
      'Telephone exchange and cable networks in Iraq, mobile repeater stations in Saudi Arabia, and oil-field flow lines and trunk lines in Libya.',
    glyph: 'other',
    match: (p) => p.sector === 'other',
    registerFilter: '?sector=other',
    photo: { name: 'pipeline', alt: 'Above-ground pipelines on steel supports across open ground', caption: 'Above-ground pipelines (illustration)' },
  },
];

export function serviceProjects(s: Service): Project[] {
  return projects.filter(s.match);
}
