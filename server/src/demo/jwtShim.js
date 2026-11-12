// Browser stand-in for jsonwebtoken in the static demo only.
// The token is base64 JSON with an expiry. It is not signed: there is no
// server secret on GitHub Pages, and every account lives in your own browser.
function sign(payload, _secret, options = {}) {
  const days = parseInt(String(options.expiresIn || '7d'), 10) || 7;
  const exp = Date.now() + days * 24 * 60 * 60 * 1000;
  return `demo.${btoa(JSON.stringify({ ...payload, exp }))}`;
}

function verify(token) {
  if (!String(token).startsWith('demo.')) throw new Error('bad token');
  const payload = JSON.parse(atob(String(token).slice(5)));
  if (!payload.exp || payload.exp < Date.now()) throw new Error('expired');
  return payload;
}

module.exports = { sign, verify };
