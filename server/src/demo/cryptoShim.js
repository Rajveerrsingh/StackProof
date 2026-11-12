// Browser stand-in for the parts of node:crypto the demo bundle touches.
function randomUUID() {
  return globalThis.crypto.randomUUID();
}

function randomBytes(size) {
  const bytes = new Uint8Array(size);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes);
}

module.exports = { randomUUID, randomBytes };
