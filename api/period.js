// GET /api/period
// Proxies bdg88zf.com Wingo API, returns period + signal
// Developed by Aditya

const UPSTREAM = "https://api.bdg88zf.com/api/webapi/GetGameIssue";

const SIGNAL_PATTERNS = {
  0: { number: "5/9/7", size: "BIGG" },
  1: { number: "0/2/4", size: "SMALL" },
  2: { number: "0/7/4", size: "SMALL" },
  3: { number: "7/1/9", size: "BIGG" },
  4: { number: "6/8/2", size: "BIGG" },
  5: { number: "5/9/3", size: "BIGG" },
  6: { number: "5/7/0", size: "BIGG" },
  7: { number: "0/2/8", size: "SMALL" },
  8: { number: "4/6/1", size: "SMALL" },
  9: { number: "1/3/9", size: "SMALL" }
};

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store, max-age=0");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const payload = {
      typeId: 1,
      language: 0,
      random: "40079dcba93a48769c6ee9d4d4fae23f",
      signature: "D12108C4F57C549D82B23A91E0FA20AE",
      timestamp: Math.floor(Date.now() / 1000)
    };

    const upstream = await fetch(UPSTREAM, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36",
        "Accept": "application/json",
        "Origin": "https://www.bdg88zf.com",
        "Referer": "https://www.bdg88zf.com/"
      },
      body: JSON.stringify(payload)
    });

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        status: false,
        error: `Upstream HTTP ${upstream.status}`
      });
    }

    const data = await upstream.json();

    // Extract period info
    if (!data || data.code !== 0 || !data.data) {
      return res.status(200).json({
        status: false,
        error: "Invalid upstream response",
        raw: data
      });
    }

    // Handle possible array or object
    const d = Array.isArray(data.data) ? data.data[0] : data.data;

    if (!d || !d.issueNumber) {
      return res.status(200).json({
        status: false,
        error: "No issueNumber in response",
        raw: data
      });
    }

    const period = d.issueNumber.toString();
    const last3 = period.slice(-3);
    const lastDigit = parseInt(period.slice(-1));
    const signal = SIGNAL_PATTERNS[lastDigit] || { number: "0/0/0", size: "WAIT" };

    return res.status(200).json({
      status: true,
      period: period,
      periodShort: last3,
      lastDigit: lastDigit,
      signal: {
        number: signal.number,
        size: signal.size
      },
      endTime: d.endTime || null,
      remaining: d.remaining || null,
      developer: "Aditya"
    });

  } catch (e) {
    return res.status(500).json({
      status: false,
      error: e.message
    });
  }
}
