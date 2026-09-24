import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const prerender = false;

export const GET: APIRoute = async () => {
  const DB = env.DB;

  const { results } = await DB.prepare(
    `SELECT id, author, body, created_at
     FROM comments
     WHERE post_slug = ? AND is_approved = 1
     ORDER BY created_at DESC`
  ).bind('veranitoxxx').all();

  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' }
  });
};

export const POST: APIRoute = async ({ request }) => {
  const DB = env.DB;
  const TURNSTILE_SECRET = env.TURNSTILE_SECRET;

  const formData = await request.formData();
  const author = formData.get('author')?.toString().trim();
  const body = formData.get('body')?.toString().trim();
  const token = formData.get('cf-turnstile-response')?.toString();

  if (!author || !body) {
    return new Response(JSON.stringify({ error: 'Faltan campos' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (author.length > 50 || body.length > 500) {
    return new Response(JSON.stringify({ error: 'Texto demasiado largo' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (TURNSTILE_SECRET && token) {
    const verifyRes = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: TURNSTILE_SECRET,
          response: token,
          remoteip: request.headers.get('CF-Connecting-IP') || ''
        })
      }
    );

    const verifyData = await verifyRes.json() as { success: boolean };
    if (!verifyData.success) {
      return new Response(JSON.stringify({ error: 'Verificación fallida' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  await DB.prepare(
    `INSERT INTO comments (author, body, post_slug, is_approved)
     VALUES (?, ?, ?, 0)`
  ).bind(author, body, 'veranitoxxx').run();

  return new Response(JSON.stringify({ success: true, message: 'Comentario pendiente de aprobación' }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' }
  });
};