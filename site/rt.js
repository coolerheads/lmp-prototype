/* Fanball LMP prototype runtime: renders Claude Design boards (.dc.html) as live, linked pages. */
(function () {
  'use strict';
  if (!localStorage.getItem('lmp_ok')) { location.replace('/?next=' + encodeURIComponent(location.pathname + location.search)); return; }
  var WHO = { whoKey: 'who' }, MOM_PO = { momentKey: 'phase', momentIn: { reg: 'mid', po: 'live', off: 'done' }, momentOut: { mid: 'reg', pic: 'reg', live: 'po', done: 'off' } };
  var CFG = {
    home: Object.assign({ file: 'Home', modeKey: true, momentKey: 'moment', momentIn: { reg: 'reg', po: 'po', off: 'off' }, momentOut: { reg: 'reg', po: 'po', off: 'off' } }, WHO),
    franchise: { file: 'Franchise' }, live: { file: 'LiveScoring' }, gameday: { file: 'GameDay' }, standings: { file: 'Standings' }, gameplan: { file: 'Huddle' },
    players: { file: 'Players' }, claims: { file: 'Claims' }, trades: { file: 'Trades' }, clubhouse: Object.assign({ file: 'Clubhouse' }, WHO), wire: { file: 'Wire' },
    settings: { file: 'Settings' }, premium: { file: 'Premium' }, commish: { file: 'Commish' }, operator: { file: 'Operator' }, market: { file: 'Market' }, onboard: { file: 'Onboard' },
    playoffs: Object.assign({ file: 'Playoffs' }, WHO, MOM_PO), history: Object.assign({ file: 'History' }, WHO), notifications: Object.assign({ file: 'Notifications' }, WHO),
    player: { file: 'PlayerCard' }, offseason: Object.assign({ file: 'Offseason' }, WHO)
  };
  var pid = location.pathname.replace(/^\/+|\/+$/g, '').replace(/\.html$/, '') || 'home';
  if (!CFG[pid]) pid = 'home';
  var PAGE = Object.assign({ id: pid }, CFG[pid]), SRC = '';
  document.title = 'Fanball · ' + pid.charAt(0).toUpperCase() + pid.slice(1);
  async function loadSrc() {
    var parts = window.LMP_PARTS || 1, bufs = [];
    for (var i = 0; i < parts; i++) { var r = await fetch('/b/bundle-' + i + '.bin?v=' + (window.LMP_VER || 1)); bufs.push(new Uint8Array(await r.arrayBuffer())); }
    var n = bufs.reduce(function (a, b) { return a + b.length; }, 0), all = new Uint8Array(n), off = 0;
    bufs.forEach(function (b) { all.set(b, off); off += b.length; });
    var ds = new Blob([all]).stream().pipeThrough(new DecompressionStream('gzip'));
    var data = JSON.parse(await new Response(ds).text());
    return data.F[PAGE.file].map(function (i) { return data.L[i]; }).join('\n');
  }
  loadSrc().then(function (src) { SRC = src; start(); }).catch(function (e) { document.getElementById('app').innerHTML = '<p style="padding:40px;font:16px sans-serif">Couldn’t load this page. Try refreshing.</p>'; console.error(e); });
  function start() {

  // ---------- site map ----------
  var PAGES = [
    ['home', 'Home'], ['franchise', 'My Franchise · Set lineup'], ['live', 'Live scoring'], ['gameday', 'Game Day'], ['standings', 'Standings'], ['playoffs', 'Playoffs'],
    ['players', 'Players'], ['claims', 'Waiver claims'], ['trades', 'Trades'], ['clubhouse', 'Clubhouse'], ['history', 'History & Record Book'],
    ['notifications', 'Notifications'], ['player', 'Player card'], ['gameplan', 'Game Plan (all leagues)'], ['wire', 'The Wire'],
    ['settings', 'League Settings'], ['commish', 'Commissioner Tools'], ['offseason', 'Offseason'], ['premium', 'Fanball Premium'],
    ['onboard', 'Create / find / join a league'], ['operator', 'Operator Console'], ['market', 'Orphan Teams marketplace']
  ];
  function go(url) { location.href = url; }
  var NAVTEXT = {
    'Home': '/home', 'My Franchise': '/franchise', 'Scores': '/live', 'Players': '/players', 'Standings': '/standings', 'Trades': '/trades', 'Clubhouse': '/clubhouse',
    'Playoffs': '/playoffs', 'History': '/history', 'Game Plan': '/gameplan', 'The Wire': '/wire', 'Set lineup': '/franchise', 'Live scoring': '/live', 'Add players': '/players',
    'Find a league': '/onboard?mode=finder', 'Create a league': '/onboard?mode=create', '+ Join': '/onboard?mode=finder', 'My leagues': '/home',
    'All notifications': '/notifications', 'See all notifications': '/notifications', 'League Settings': '/settings', 'Commissioner Tools': '/commish', 'Full table': '/standings',
    'All scores': '/live', 'Try Pro free for 7 days': '/premium', 'Trade analyzer': '/trades', 'Waiver targets': '/players', 'Playoff picture': '/playoffs', 'Orphan teams': '/market', 'Show 3 more leagues': '/gameplan', 'Record book': '/history', 'Offseason hub': '/offseason'
  };
  var NAVPREFIX = [['Waivers run', '/claims'], ['Trade deadline', '/trades'], ['The Empire League', '/home'], ['Game Plan', '/gameplan'], ['The Wire', '/wire'], ['Live scoring', '/live'], ['Set lineup', '/franchise'], ['Standings', '/standings'], ['Add players', '/players'], ['Top add', '/players'], ['2 offers worth', '/trades']];
  var ARIA = { 'Notifications': '/notifications', 'Search': '/players', 'Fanball home': '/home' };
  // toasts that really mean "go to another page"
  var TOASTNAV = {
    'Playoffs': '/playoffs', 'Record book': '/history', 'Offseason': '/offseason', 'LeagueSafe': '/clubhouse?ct=money', 'Review offer': '/trades', 'Review': '/trades', 'Open lineup': '/franchise',
    'Review claims': '/claims', 'Reply': '/clubhouse', 'Opening the Clubhouse': '/clubhouse', 'Team Premium': '/premium', 'Go to Trades': '/trades', 'Open the record book': '/history',
    'Trade': '/trades', 'Propose a trade': '/trades', 'Offer trade': '/trades', 'Trade a pick': '/trades', 'Box score': '/live', 'See the correction': '/commish', 'Closes the card': 'back',
    'Notification settings': '/notifications?nview=set', 'Fix a record': '/commish'
  };
  var PLAYERS = window.LMP_PLAYERS || {};

  // ---------- state ----------
  var GKEY = 'lmp_global', SKEY = 'lmp_state_' + PAGE.id;
  function jget(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  function jset(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var G = jget(GKEY, null) || { theme: 'light', tier: 'premium', moment: 'reg', nav: 'compact' };
  var MOMENT_IN = PAGE.momentIn || {}, MOMENT_OUT = PAGE.momentOut || {};
  function fromGlobal() {
    var o = {};
    if (G.theme) o.theme = G.theme;
    if (G.tier) { o.tier = G.tier; if (PAGE.modeKey) o.mode = G.tier === 'free' ? 'Free' : (G.mixed ? 'Mixed' : 'Premium'); }
    if (G.who && PAGE.whoKey) o[PAGE.whoKey] = G.who;
    if (G.moment && PAGE.momentKey && MOMENT_IN[G.moment]) o[PAGE.momentKey] = MOMENT_IN[G.moment];
    return o;
  }
  function toGlobal(st) {
    var ch = false;
    function put(k, v) { if (v != null && G[k] !== v) { G[k] = v; ch = true; } }
    if ('theme' in st) put('theme', st.theme);
    if ('tier' in st) put('tier', st.tier);
    if (PAGE.modeKey && 'mode' in st) { put('tier', st.mode === 'Free' ? 'free' : 'premium'); put('mixed', st.mode === 'Mixed'); }
    if (PAGE.whoKey && PAGE.whoKey in st) put('who', st[PAGE.whoKey]);
    if (PAGE.momentKey && PAGE.momentKey in st && MOMENT_OUT[st[PAGE.momentKey]]) put('moment', MOMENT_OUT[st[PAGE.momentKey]]);
    if (ch) jset(GKEY, G);
  }
  var urlState = {};
  new URLSearchParams(location.search).forEach(function (v, k) { urlState[k] = /^\d+$/.test(v) ? +v : v; });
  var saved = jget(SKEY, {});
  var init = Object.assign({}, PAGE.defaults || {}, saved, fromGlobal(), urlState);
  delete init.toast; delete init.toastSub;

  // ---------- parse board ----------
  var m = SRC.match(/<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/);
  var xdc = SRC.slice(SRC.indexOf('<x-dc>') + 6, SRC.indexOf('</x-dc>'));
  var helmet = (xdc.match(/<helmet>([\s\S]*?)<\/helmet>/) || [, ''])[1];
  var bodyT = xdc.replace(/<helmet>[\s\S]*?<\/helmet>/, '')
    .replace(/<select\b/g, '<dc-select').replace(/<\/select>/g, '</dc-select>')
    .replace(/<option\b/g, '<dc-option').replace(/<\/option>/g, '</dc-option>');
  document.head.insertAdjacentHTML('beforeend', helmet);
  var tpl = document.createElement('template'); tpl.innerHTML = bodyT;

  function DCLogic() { this.state = {}; this.props = {}; }
  DCLogic.prototype.setState = function (o) {
    o = o || {};
    if (o.toast && TOASTNAV[o.toast]) { var t = TOASTNAV[o.toast]; if (t === 'back') { if (history.length > 1) history.back(); else go('/home'); } else go(t); return; }
    Object.assign(this.state, o); toGlobal(o);
    var keep = Object.assign({}, this.state); delete keep.toast; delete keep.toastSub; jset(SKEY, keep);
    schedule();
  };
  var Comp = new Function('DCLogic', m[1] + ';return Component')(DCLogic);
  var comp = new Comp(); comp.state = init; comp.props = {};

  // ---------- render ----------
  var SVGNS = 'http://www.w3.org/2000/svg', handled = new WeakSet(), FOCUSABLE = { input: 1, textarea: 1, select: 1 };
  function look(path, scope) {
    var parts = path.trim().split('.'), v;
    if (parts[0] in scope) v = scope[parts[0]]; else if (parts[0] === 'true') return true; else if (parts[0] === 'false') return false; else return undefined;
    for (var i = 1; i < parts.length; i++) { if (v == null) return undefined; v = v[parts[i]]; }
    return v;
  }
  function interp(str, scope) { return str.replace(/\{\{\s*([^}]+?)\s*\}\}/g, function (_, p) { var v = look(p, scope); return v == null || typeof v === 'function' ? '' : String(v); }); }
  function hole(str) { var mm = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/.exec(str); return mm ? mm[1] : null; }
  var fk = 0;
  function build(node, scope, out, inSvg) {
    var kids = node.childNodes;
    for (var i = 0; i < kids.length; i++) {
      var k = kids[i];
      if (k.nodeType === 3) { var tx = k.textContent; out.appendChild(document.createTextNode(tx.indexOf('{{') >= 0 ? interp(tx, scope) : tx)); continue; }
      if (k.nodeType !== 1) continue;
      var tag = k.tagName.toLowerCase();
      if (tag === 'sc-for') {
        var list = look(hole(k.getAttribute('list')) || '', scope) || [], as = k.getAttribute('as');
        for (var j = 0; j < list.length; j++) { var s2 = Object.assign({}, scope); s2[as] = list[j]; build(k, s2, out, inSvg); }
        continue;
      }
      if (tag === 'sc-if') { if (look(hole(k.getAttribute('value')) || '', scope)) build(k, scope, out, inSvg); continue; }
      var real = tag === 'dc-select' ? 'select' : tag === 'dc-option' ? 'option' : tag;
      var svg = inSvg || real === 'svg';
      var el = svg ? document.createElementNS(SVGNS, k.localName) : document.createElement(real);
      var val = null;
      for (var a = 0; a < k.attributes.length; a++) {
        var at = k.attributes[a], name = at.name, v = at.value;
        if (name.indexOf('hint-') === 0) continue;
        if (name.indexOf('on') === 0 && v.indexOf('{{') >= 0) {
          var fn = look(hole(v) || '', scope);
          if (typeof fn === 'function') { el.addEventListener(name.slice(2), (function (f) { return function (e) { f(e); }; })(fn)); handled.add(el); }
          continue;
        }
        if (v.indexOf('{{') >= 0) v = interp(v, scope);
        if (name === 'value' && FOCUSABLE[real]) val = v;
        try { el.setAttribute(name, v); } catch (e) {}
      }
      if (FOCUSABLE[real]) el.setAttribute('data-fk', String(fk++));
      build(k.content || k, scope, el, svg && real !== 'foreignobject');
      if (val != null) el.value = val;
      if (real === 'select') { var sel = el.querySelector('option[selected]'); if (sel) el.value = sel.value; }
      out.appendChild(el);
    }
  }
  var root = document.getElementById('app'), pending = false;
  function schedule() { if (!pending) { pending = true; Promise.resolve().then(render); } }
  function render() {
    pending = false;
    var ae = document.activeElement, fkey = ae && ae.getAttribute ? ae.getAttribute('data-fk') : null, s0, s1;
    try { s0 = ae.selectionStart; s1 = ae.selectionEnd; } catch (e) {}
    var y = window.scrollY, vals;
    try { vals = comp.renderVals(); } catch (e) { console.error(e); return; }
    var frag = document.createDocumentFragment(); fk = 0;
    build(tpl.content, vals, frag, false);
    root.replaceChildren(frag);
    if (fkey != null) { var n = root.querySelector('[data-fk="' + fkey + '"]'); if (n) { n.focus(); try { if (s0 != null) n.setSelectionRange(s0, s1); } catch (e) {} } }
    window.scrollTo(0, y);
    decorate();
  }

  // ---------- demo panel ----------
  var demoOpen = sessionStorage.getItem('lmp_demo') === '1';
  var NAV = window.LMPNav ? window.LMPNav({ root: root, PAGE: PAGE, go: go, flash: function (m) { flash(m); } }) : null;
  function setNav(v) { G.nav = v; jset(GKEY, G); render(); }
  function decorate() {
    var ng = root.querySelector('.ng'), bar = ng && ng.firstElementChild;
    if (bar && /background:\s*#000/.test(bar.getAttribute('style') || '')) {
      bar.classList.add('dc-demobar'); if (demoOpen) bar.classList.add('open');
      var extra = document.createElement('div'); extra.className = 'dc-demoextra';
      var sel = '<select aria-label="Jump to page" onchange="location.href=\'/\'+this.value">' + PAGES.map(function (p) { return '<option value="' + p[0] + '"' + (p[0] === PAGE.id ? ' selected' : '') + '>' + p[1] + '</option>'; }).join('') + '</select>';
      extra.innerHTML = '<span class="dc-dl">Go to</span>' + sel + '<button type="button" class="dc-reset">Reset prototype</button><button type="button" class="dc-lock">Lock</button>';
      bar.appendChild(extra);
      extra.querySelector('.dc-reset').onclick = function () { Object.keys(localStorage).forEach(function (k) { if (k.indexOf('lmp_state_') === 0 || k === GKEY || k === 'lmp_nv_open') localStorage.removeItem(k); }); location.href = '/home'; };
      extra.querySelector('.dc-lock').onclick = function () { localStorage.removeItem('lmp_ok'); location.href = '/'; };
      var nv = document.createElement('div'); nv.className = 'dc-navsw';
      nv.innerHTML = '<span class="dc-dl">Navigation</span><span class="dc-seg"><button type="button" data-v="compact">Compact</button><button type="button" data-v="classic">Classic</button></span>';
      nv.querySelectorAll('button').forEach(function (b) { if ((G.nav || 'compact') === b.dataset.v) b.classList.add('on'); b.onclick = function () { setNav(b.dataset.v); }; });
      extra.insertBefore(nv, extra.firstChild);
      frameSwitches(extra);
    }
    if (NAV) NAV.decorate((G.nav || 'compact') !== 'classic');
    frameClasses();
    flexLetters();
    titleCase();
  }
  // Title Case for headings and buttons (small words stay lowercase unless first or last)
  var SMALL = { a: 1, an: 1, the: 1, and: 1, but: 1, or: 1, nor: 1, for: 1, of: 1, to: 1, in: 1, on: 1, at: 1, by: 1, vs: 1, via: 1, per: 1, as: 1, with: 1 };
  function tc(str) {
    var parts = str.split(/(\s+)/), words = parts.filter(function (p) { return /\S/.test(p); }), n = 0;
    return parts.map(function (p) {
      if (!/\S/.test(p)) return p;
      var i = n++, w = p, m = w.match(/^([^A-Za-z]*)([a-z][\w'’-]*)(.*)$/);
      if (!m) return w;
      if (i > 0 && i < words.length - 1 && SMALL[m[2].toLowerCase()] && !/[:·]$/.test(words[i - 1])) return w;
      return m[1] + m[2].charAt(0).toUpperCase() + m[2].slice(1) + m[3];
    }).join('');
  }
  function titleCase() {
    root.querySelectorAll('h1, h2, h3, h4, .h1, .h2, button, .btn, .btnp, .hb, .rsh-b').forEach(function (el) {
      if (el.closest('.dc-demobar') || el.closest('.pos') || el.classList.contains('pos')) return;
      el.childNodes.forEach(function (n) {
        if (n.nodeType !== 3 || !/[a-z]/.test(n.nodeValue) || /@/.test(n.nodeValue)) return;
        var v = tc(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v;
      });
    });
  }
  // FLEX / SUPERFLEX slot tags: each eligible position's letter in its own color (R W T, Q R W T)
  function flexLetters() {
    var V = { Q: '--qb', R: '--rb', W: '--wr', T: '--te' };
    root.querySelectorAll('.pos.flx, .pos.sflx').forEach(function (el) {
      if (el.dataset.rsl) return;
      var sf = el.classList.contains('sflx'), L = sf ? ['Q', 'R', 'W', 'T'] : ['R', 'W', 'T'];
      el.innerHTML = L.map(function (c) { return '<span style="color: var(' + V[c] + ')">' + c + '</span>'; }).join('');
      el.dataset.rsl = '1'; el.setAttribute('aria-label', sf ? 'Superflex: QB, RB, WR or TE' : 'Flex: RB, WR or TE'); el.title = sf ? 'Superflex' : 'Flex';
    });
  }
  // Restrained frame: theme, easy buttons and league bar classes on <body> (styles in restrained.css)
  var FRAME = { easy: [['rail', 'Rail'], ['tabs', 'Tabs only']], lbar: [['league', 'League color'], ['ink', 'Brand ink'], ['theme', 'Theme'], ['white', 'White']],
    hdr: [['Standard', 'Standard'], ['Premium', 'Premium'], ['Mixed', 'Mixed']], sides: [['left', 'Syndicate left'], ['right', 'Syndicate right']],
    wk: [['pre', 'Before lineup lock'], ['live', 'Games live'], ['post', 'Week complete']],
    bd: [['custom', 'Custom'], ['hero', 'From hero'], ['off', 'Off']] };
  // ---------- Prototype tier: Free = no custom league or team art; Mixed = a few teams bought kits; Premium = everything ----------
  var KITS = { syndicate: ['SYN', '#7a2323'], kelce: ['ZEU', '#b3202f'], airplane: ['TLM', '#5b2aa6'], jj: ['KBD', '#1d3768'], mustards: ['BIJ', '#9a6f08'], hurts: ['HRT', '#35534b'],
    lamb: ['CMC', '#3d3d3d'], henrys: ['STR', '#3b2590'], chubb: ['FOS', '#7a3b12'], purdy: ['LPH', '#a6335a'], puka: ['SXP', '#1e4f8a'], goff: ['YUB', '#2f7a46'] };
  var MIXED_KITS = ['syndicate', 'airplane', 'hurts', 'henrys', 'puka'];
  function tierNow() {
    var md = PAGE.modeKey && comp.state ? comp.state.mode : null;
    if (md === 'Mixed') return 'mixed'; if (md === 'Free') return 'free'; if (md === 'Premium') return 'premium';
    return G.tier === 'free' ? 'free' : (G.mixed ? 'mixed' : 'premium');
  }
  function applyTier(t) {
    if (t === 'premium') return;
    document.querySelectorAll('[class*="ic-"], [class*="sk-"]').forEach(function (el) {
      [].slice.call(el.classList).forEach(function (c) {
        var m = /^(ic|sk)-([a-z]+)$/.exec(c); if (!m || !KITS[m[2]]) return;
        if (t === 'mixed' && MIXED_KITS.indexOf(m[2]) > -1) return;
        el.classList.remove(c); el.classList.add(m[1] + '-off');
        var bx = m[1] === 'ic' && el.parentElement && el.parentElement.classList.contains('bx') ? el.parentElement : null;
        if (bx) { bx.classList.add('bx-free'); bx.setAttribute('data-i', KITS[m[2]][0]); bx.style.setProperty('--h', KITS[m[2]][1]); }
      });
    });
  }
  function frameClasses() {
    var tier = tierNow(); applyTier(tier);
    var bd = PAGE.id === 'franchise' && G.tier !== 'free' ? (G.bd || 'custom') : 'off';
    var c = document.body.classList, cls = ['rs', 'tr-' + tier, 'pg-' + PAGE.id, 'bd-' + bd, 'th-' + (G.theme === 'dark' ? 'dark' : 'light'), 'eb-' + (G.easy || 'rail'), 'lb-' + (G.lbar || 'league')];
    [].slice.call(c).forEach(function (x) { if (/^(th|eb|lb|pg|bd|tr)-/.test(x)) c.remove(x); });
    cls.forEach(function (x) { c.add(x); });
  }
  function frameSwitches(extra) {
    var rows = [['easy', 'Easy buttons'], ['lbar', 'League bar']];
    if (PAGE.id === 'live') rows.push(['hdr', 'Matchup header'], ['sides', 'Sides']);
    if (PAGE.id === 'home') rows.push(['wk', 'Week state']);
    if (PAGE.id === 'franchise') rows.push(['bd', 'Page backdrop']);
    rows.forEach(function (d) {
      var el = document.createElement('div'); el.className = 'dc-navsw';
      el.innerHTML = '<span class="dc-dl">' + d[1] + '</span><span class="dc-seg">' + FRAME[d[0]].map(function (o) { return '<button type="button" data-v="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</span>';
      el.querySelectorAll('button').forEach(function (b) {
        var cur = d[0] === 'wk' ? (G.wk || 'live') : d[0] === 'hdr' ? (G.tier === 'free' ? 'Standard' : (G.mixed ? 'Mixed' : 'Premium')) : (G[d[0]] || FRAME[d[0]][0][0]);
        if (cur === b.dataset.v) b.classList.add('on');
        b.onclick = function () {
          if (d[0] === 'hdr') { G.tier = b.dataset.v === 'Standard' ? 'free' : 'premium'; G.mixed = b.dataset.v === 'Mixed'; jset(GKEY, G); comp.setState({ tier: G.tier }); return; }
          if (d[0] === 'sides' || d[0] === 'wk') { G[d[0]] = b.dataset.v; jset(GKEY, G); el.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); }); comp.setState({}); return; }
          G[d[0]] = b.dataset.v; jset(GKEY, G); el.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); }); frameClasses(); if (NAV && NAV.refresh) NAV.refresh(); };
      });
      extra.insertBefore(el, extra.children[1] || null);
    });
  }
  var fab = document.createElement('button'); fab.className = 'dc-fab'; fab.type = 'button'; fab.textContent = demoOpen ? 'Hide demo controls' : 'Demo controls';
  fab.onclick = function () { demoOpen = !demoOpen; sessionStorage.setItem('lmp_demo', demoOpen ? '1' : '0'); fab.textContent = demoOpen ? 'Hide demo controls' : 'Demo controls'; var b = root.querySelector('.dc-demobar'); if (b) b.classList.toggle('open', demoOpen); };
  document.body.appendChild(fab);

  // ---------- links ----------
  function flash(msg) { var t = document.createElement('div'); t.className = 'dc-flash'; t.textContent = msg; document.body.appendChild(t); setTimeout(function () { t.remove(); }, 2600); }
  document.addEventListener('click', function (e) {
    if (e.target.closest('.dc-demoextra') || e.target.closest('.nvrail') || e.target.closest('.nvdrop') || e.target.closest('.nvsw') || e.target.closest('.nvarr')) return;
    function inside(x) { return root.contains(x) || !!(x.closest && x.closest('.nvx')); }
    // rail quick actions always navigate, even where a board wired them locally
    var qa = e.target.closest('.qa');
    if (qa && inside(qa)) { var ql = (qa.innerText || '').trim().split('\n')[0].trim(); for (var k = 0; k < NAVPREFIX.length; k++) if (ql.indexOf(NAVPREFIX[k][0]) === 0) { e.preventDefault(); e.stopPropagation(); go(NAVPREFIX[k][1]); return; } }
    // own handler somewhere up the chain? let the board handle it
    for (var n = e.target; n && n !== root; n = n.parentNode) if (handled.has(n)) return;
    // player names open the player card
    for (var p = e.target, d = 0; p && p !== root && p !== document.body && d < 3; p = p.parentNode, d++) {
      var txt = (p.textContent || '').trim();
      if (PLAYERS[txt]) { e.preventDefault(); go('/player?pn=' + encodeURIComponent(txt) + '&pp=' + PLAYERS[txt][0] + '&pt=' + PLAYERS[txt][1]); return; }
    }
    var el = e.target.closest('a,button,[role=button]');
    if (!el || !inside(el)) return;
    var aria = el.getAttribute('aria-label');
    if (aria && ARIA[aria]) { e.preventDefault(); go(ARIA[aria]); return; }
    var label = (el.innerText || '').trim().split('\n')[0].trim();
    if (NAVTEXT[label]) { e.preventDefault(); go(NAVTEXT[label]); return; }
    for (var i = 0; i < NAVPREFIX.length; i++) if (label.indexOf(NAVPREFIX[i][0]) === 0) { e.preventDefault(); go(NAVPREFIX[i][1]); return; }
    if (el.tagName === 'A' && el.classList.contains('lg')) { e.preventDefault(); flash('Only The Empire League is built out in this prototype'); return; }
    if (el.tagName === 'A' && (el.getAttribute('href') || '#') === '#') { e.preventDefault(); flash('Not linked in the prototype yet'); }
  }, true);

  render();
  }
})();
