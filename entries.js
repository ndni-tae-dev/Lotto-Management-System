// Shared storage via Upstash Redis REST (Vercel Marketplace -> Upstash Redis sets these env vars).
const U = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const T = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = async (cmd) => {
  const r = await fetch(U, { method: 'POST', headers: { Authorization: `Bearer ${T}` }, body: JSON.stringify(cmd) });
  return (await r.json()).result;
};
export default async function handler(req, res) {
  if (!U || !T) return res.status(503).json({ error: 'storage not configured' });
  try {
    if (req.method === 'GET') {
      const rows = await redis(['LRANGE', 'entries', 0, 999]);
      return res.status(200).json(rows.map((x) => JSON.parse(x)));
    }
    if (req.method === 'POST') {
      const b = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const num = String(b.number || '').replace(/\D/g, '');
      const amount = Number(b.amount);
      if (!b.name || ![2, 3].includes(num.length) || !(amount > 0) || !['top', 'bottom'].includes(b.side))
        return res.status(400).json({ error: 'invalid input' });
      const e = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name: String(b.name).slice(0, 40),
        number: num, digits: num.length, side: b.side, amount, note: String(b.note || '').slice(0, 120), ts: Date.now() };
      await redis(['LPUSH', 'entries', JSON.stringify(e)]);
      return res.status(201).json(e);
    }
    if (req.method === 'DELETE') {
      if (!process.env.ADMIN_KEY || req.headers['x-admin-key'] !== process.env.ADMIN_KEY) return res.status(401).json({ error: 'unauthorized' });
      const rows = await redis(['LRANGE', 'entries', 0, 999]);
      const hit = rows.find((x) => JSON.parse(x).id === req.query.id);
      if (hit) await redis(['LREM', 'entries', 1, hit]);
      return res.status(200).json({ ok: true });
    }
    res.status(405).end();
  } catch (err) { res.status(500).json({ error: String(err) }); }
}
