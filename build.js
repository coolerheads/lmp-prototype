// Builds the Fanball LMP prototype into out/ (Vercel runs this: see vercel.json).
//
//   boards/<Page>.dc.html  one file per page, in Claude Design's board format (edit these)
//   boards/order.json      page order inside the bundle
//   site/                  runtime, nav, styles and images, copied as-is
//   site/extra.js          appended to rt.js (Game Day links from Live Scoring)
//
// The runtime (site/rt.js) loads every page from out/b/bundle-0.bin: gzip of {L: lines[], F: {page: lineIdx[]}}.
// Needs only Node, no npm install.
const z = require('zlib'), fs = require('fs'), path = require('path'), crypto = require('crypto');

const order = JSON.parse(fs.readFileSync('boards/order.json', 'utf8'));
const onDisk = fs.readdirSync('boards').filter(f => f.endsWith('.dc.html')).map(f => f.slice(0, -8));
const missing = onDisk.filter(n => !order.includes(n));
if (missing.length) throw new Error('add these pages to boards/order.json: ' + missing.join(', '));

const L = [], idx = new Map(), F = {};
for (const name of order) {
  F[name] = fs.readFileSync(`boards/${name}.dc.html`, 'utf8').split('\n').map(l => {
    if (!idx.has(l)) { idx.set(l, L.length); L.push(l); }
    return idx.get(l);
  });
}

fs.rmSync('out', { recursive: true, force: true });
fs.cpSync('site', 'out', { recursive: true });
fs.rmSync('out/extra.js', { force: true });
fs.appendFileSync('out/rt.js', '\n' + fs.readFileSync('site/extra.js', 'utf8'));

fs.mkdirSync('out/b', { recursive: true });
const gz = z.gzipSync(Buffer.from(JSON.stringify({ L, F })), { level: 9 });
fs.writeFileSync('out/b/bundle-0.bin', gz);

// cache-bust: the bundle is served immutable, so its version must follow its content
const ver = crypto.createHash('sha1').update(gz).update(fs.readFileSync('out/rt.js')).digest('hex').slice(0, 8);
const app = fs.readFileSync('out/app.html', 'utf8'), oldVer = (app.match(/LMP_VER='([^']*)'/) || [])[1];
fs.writeFileSync('out/app.html', oldVer ? app.split(oldVer).join(ver) : app);
console.log(`built ${order.length} pages, ${L.length} unique lines, version ${ver}`);
