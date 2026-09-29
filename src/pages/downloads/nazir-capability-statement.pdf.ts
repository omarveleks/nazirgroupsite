import type { APIRoute } from 'astro';
import { capabilityPdf } from '../../lib/pdf';

export const GET: APIRoute = async () =>
  new Response(Buffer.from(await capabilityPdf()), { headers: { 'Content-Type': 'application/pdf' } });
