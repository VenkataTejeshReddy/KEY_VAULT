import { NextResponse } from 'next/server';

/**
 * GET /api/quota/[serviceId]
 * Fetches real-time rate limit quota from upstream providers.
 * Returns: { used, limit, remaining, resetAt (unix ts), resetInSeconds }
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  const { serviceId } = await params;

  try {
    if (serviceId === 'github') {
      const token = process.env.GITHUB_TOKEN;
      if (!token) return NextResponse.json({ error: 'No GitHub token configured' }, { status: 400 });

      const res = await fetch('https://api.github.com/rate_limit', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'KeyVault-Gateway/1.0',
        },
        cache: 'no-store',
      });

      if (!res.ok) return NextResponse.json({ error: `GitHub returned ${res.status}` }, { status: res.status });

      const data = await res.json();
      const core = data.resources?.core;
      const now = Math.floor(Date.now() / 1000);

      return NextResponse.json({
        serviceId: 'github',
        used: core.used,
        limit: core.limit,
        remaining: core.remaining,
        resetAt: core.reset,
        resetInSeconds: Math.max(0, core.reset - now),
        source: 'live',
      });
    }

    if (serviceId === 'groq') {
      // Groq doesn't have a standalone quota endpoint — return token-bucket estimate from headers
      // We do a lightweight models call to get fresh headers
      const key = process.env.GROQ_API_KEY;
      if (!key) return NextResponse.json({ error: 'No Groq key configured' }, { status: 400 });

      const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: `Bearer ${key}`, 'User-Agent': 'KeyVault-Gateway/1.0' },
        cache: 'no-store',
      });

      // Groq returns rate limit headers on every response
      const limit = parseInt(res.headers.get('x-ratelimit-limit-requests') || '14400');
      const remaining = parseInt(res.headers.get('x-ratelimit-remaining-requests') || '14400');
      const resetSeconds = parseFloat(res.headers.get('x-ratelimit-reset-requests') || '60s');

      return NextResponse.json({
        serviceId: 'groq',
        used: limit - remaining,
        limit,
        remaining,
        resetAt: Math.floor(Date.now() / 1000) + (resetSeconds || 60),
        resetInSeconds: resetSeconds || 60,
        source: 'live',
      });
    }

    if (serviceId === 'openai') {
      // OpenAI doesn't expose quota in headers cleanly — return what we know
      return NextResponse.json({
        serviceId: 'openai',
        used: null,
        limit: null,
        remaining: null,
        resetAt: null,
        resetInSeconds: null,
        source: 'unavailable',
        note: 'OpenAI does not expose account-wide quota via API headers.',
      });
    }

    return NextResponse.json({ error: `Quota not supported for service: ${serviceId}` }, { status: 404 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
