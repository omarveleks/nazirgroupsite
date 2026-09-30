import type { APIRoute } from 'astro';
import { companyProfilePdf } from '../../lib/profile-pdf';

export const GET: APIRoute = async () =>
  new Response(Buffer.from(await companyProfilePdf()), { headers: { 'Content-Type': 'application/pdf' } });
