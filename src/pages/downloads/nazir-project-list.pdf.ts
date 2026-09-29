import type { APIRoute } from 'astro';
import { projectListPdf } from '../../lib/pdf';

export const GET: APIRoute = async () =>
  new Response(Buffer.from(await projectListPdf()), { headers: { 'Content-Type': 'application/pdf' } });
