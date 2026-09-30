// Company milestones, used by the company profile PDF (the site shows them by decade: src/lib/site.ts).
import { company } from './data';

export interface Milestone {
  year: string;
  title: string;
  text: string;
  /** Project page to link to */
  slug?: string;
}

export const milestones: Milestone[] = [
  { year: '1958', title: 'Founded', text: `Established by ${company.founder.name}.` },
  { year: '1970s', title: 'Work outside Pakistan begins', text: 'The company begins work in other countries.' },
  { year: '1972', title: 'Incorporated', text: `Incorporated as a private limited company on ${company.incorporated_text}, working in civil, electrical and mechanical engineering.` },
  { year: '1977', title: 'First documented completions', text: '500 kV Tarbela–Faisalabad line foundations in Pakistan; 132 kV lines from Dukan in Iraq.' },
  { year: '1978', title: 'First documented projects in Libya', text: 'Civil works for desalination plants and for 30/10 kV substations.' },
  { year: '1979', title: 'Saudi Arabia and Iran', text: '110 kV Makkah–Taif line extension; stringing of the 230 kV Shiraz–Bushehr line.' },
  { year: '1980', title: '220 kV and 400 kV', text: 'Misurata–Sirte 220 kV lines and the Tripoli ring in Libya; the 358 km Nasiriya–Wasit–Baghdad 400 kV line in Iraq.', slug: 'misurata-sirte-220-kv-lines-and-tripoli-ring' },
  { year: '1985', title: 'Sheikh Tanveer Ahmed joins', text: 'The present Director joins the company.' },
  { year: '1997', title: 'HVDC in Mozambique', text: 'Work on the ±533 kV Songo–Apollo HVDC line for Consorzio Italia 2000.', slug: 'songo-apollo-533-kv-hvdc-transmission-line' },
  { year: '1998', title: '500 kV in Malaysia', text: 'Erection and stringing of double-circuit 500 kV lines for Tenaga Nasional Berhad.', slug: 'ayer-tawar-junjung-500-kv-double-circuit-line-80-km' },
  { year: '2001', title: '750 km in Libya', text: 'Turnkey 220 kV double-circuit lines from Benghazi to the eastern border.', slug: 'benghazi-eastern-border-220-kv-double-circuit-lines-750-km' },
  { year: '2005', title: 'The founder dies', text: `${company.founder.name} (${company.founder.born}–${company.founder.died}).` },
  { year: '2007', title: 'Barotha–Rewat 500 kV', text: 'Transmission lines for the national grid in Pakistan.', slug: 'barotha-rewat-500-kv-transmission-lines' },
  { year: '2011', title: 'Samnu–Sebha 220 kV', text: '220 kV double-circuit twin-bundle line for GECOL, carrying power south to Sebha in the Fezzan.', slug: 'samnu-sebha-220-kv-double-circuit-twin-bundle-line' },
  { year: '2014', title: '380 kV turnkey in Saudi Arabia', text: '380/110 kV overhead lines and a fibre-optic network in the Makkah, Taif and Madinah area.', slug: '380-110-kv-overhead-lines-and-fibre-optic-network-makkah-taif-and-madinah' },
  { year: '2020', title: 'Fatima Jinnah Town, Multan', text: 'Water supply, sewerage, roads and an overhead water tank for a new town, for the Multan Development Authority.' },
];
