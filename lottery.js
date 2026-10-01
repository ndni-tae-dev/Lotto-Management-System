// Proxy to the GLO lottery API (avoids browser CORS). ?date=YYYY-MM-DD for a past draw, none for latest.
export default async function handler(req, res) {
  const date = req.query.date;
  const url = 'https://www.glo.or.th/api/lottery/' + (date ? 'getLotteryResultByDate' : 'getLatestLottery');
  try {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: date ? JSON.stringify({ date }) : '{}' });
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');
    res.status(r.status).json(await r.json());
  } catch (e) { res.status(502).json({ error: 'GLO unreachable' }); }
}
