/* Fanball LMP prototype: compact navigation (icon rail, hover flyouts, expandable drawer, league switcher, slim scoreboard). */
window.LMPNav = function (api) {
  'use strict';
  var root = api.root, PAGE = api.PAGE;
  var OPEN_KEY = 'lmp_nv_open';
  var drawerOpen = false; try { drawerOpen = localStorage.getItem(OPEN_KEY) === '1'; } catch (e) {}
  var I = {
    leagues: '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',
    gameplan: '<circle cx="6" cy="18" r="2"/><path d="M4 4l4 4M8 4 4 8"/><path d="M16 4h4v4"/><path d="M20 4 13 11"/><path d="M8 16c3-.5 5-2 6.5-4.5"/>',
    wire: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    lineup: '<path d="M4 7h11"/><path d="M4 12h16"/><path d="M4 17h8"/><path d="m17 4 3 3-3 3"/>',
    live: '<circle cx="12" cy="12" r="2"/><path d="M16.2 7.8a6 6 0 0 1 0 8.4"/><path d="M7.8 16.2a6 6 0 0 1 0-8.4"/><path d="M19.1 4.9a10 10 0 0 1 0 14.2"/><path d="M4.9 19.1a10 10 0 0 1 0-14.2"/>',
    standings: '<path d="M6 20V10"/><path d="M12 20V4"/><path d="M18 20v-7"/>',
    add: '<circle cx="10" cy="8" r="4"/><path d="M3 20c0-3.3 3.1-6 7-6"/><path d="M18 14v6"/><path d="M15 17h6"/>',
    chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z"/>',
    more: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
    expand: '<path d="m9 6 6 6-6 6"/>',
    collapse: '<path d="m15 6-6 6 6 6"/>',
    chev: '<path d="m6 9 6 6 6-6"/>',
    check: '<path d="m5 12 5 5 9-10"/>'
  };
  function svg(k, s) { return '<svg width="' + (s || 20) + '" height="' + (s || 20) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + I[k] + '</svg>'; }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function txt(el) { return el ? (el.textContent || '').replace(/\s+/g, ' ').trim() : ''; }

  // ---------- persistent shell (outside the re-rendered board) ----------
  var rail = document.createElement('nav'); rail.className = 'nvrail nvx'; rail.setAttribute('aria-label', 'Main');
  var drawer = document.createElement('div'); drawer.className = 'nvdrawer nvx';
  var fly = document.createElement('div'); fly.className = 'nvfly nvx'; fly.hidden = true;
  var drop = document.createElement('div'); drop.className = 'nvdrop nvx'; drop.hidden = true;
  document.body.append(rail, drawer, fly, drop);

  var data = null, pinnedFly = null, hideT = null, showT = null, dropOpen = false;

  function readRail(r) {
    var d = { leagues: [], quick: {}, gp: '', chatOnline: '' };
    if (!r) return d;
    r.querySelectorAll('a.lg').forEach(function (a) {
      var b = a.querySelector('.fbd'), sp = a.querySelectorAll(':scope > span:last-child > span');
      d.leagues.push({ on: a.classList.contains('on'), badge: b ? b.outerHTML : '', name: txt(sp[0]), sub: txt(sp[1]) });
    });
    r.querySelectorAll('a.qa').forEach(function (a) { d.quick[txt(a.querySelector('.qt'))] = txt(a.querySelector('.qs')); });
    var xb = [].find.call(r.querySelectorAll('a.xt'), function (a) { return /Game Plan/.test(txt(a)); });
    if (xb && xb.querySelector('.xb')) d.gp = txt(xb.querySelector('.xb'));
    var view = [].find.call(r.querySelectorAll('.rsec'), function (s) { return /You.re viewing/.test(txt(s)); });
    d.viewBadge = view && view.querySelector('.fbd') ? view.querySelector('.fbd').outerHTML : '';
    d.chat = [].find.call(r.querySelectorAll('.rsec'), function (s) { var h = s.querySelector('.rh'); return h && /chat/i.test(txt(h)); }) || null;
    if (d.chat) d.chatOnline = (txt(d.chat.querySelector('.rh')).match(/(\d+) online/) || [])[1] || '';
    d.leagueBlock = r.querySelector('a.lg') ? r.querySelector('a.lg').parentElement : null;
    var tot = d.leagueBlock && d.leagueBlock.firstElementChild ? txt(d.leagueBlock.firstElementChild).match(/(\d+)/) : null; d.total = tot ? tot[1] + ' leagues' : '';
    var more = d.leagueBlock && [].find.call(d.leagueBlock.querySelectorAll(':scope > a'), function (a) { return /more/i.test(txt(a)); }); d.more = more ? txt(more) : '';
    return d;
  }

  var ACTIVE = { franchise: 'lineup', live: 'live', gameday: 'live', standings: 'standings', playoffs: 'standings', players: 'add', player: 'add', claims: 'add', gameplan: 'gameplan', wire: 'wire', clubhouse: 'chat', home: 'league' };
  function buildRail() {
    var d = data, act = ACTIVE[PAGE.id] || '', q = d.quick;
    var lineupN = (q['Set lineup'] || '').match(/^(\d+)/), liveScore = q['Live scoring'] || '';
    function item(key, icon, label, opts) {
      opts = opts || {};
      return '<button type="button" class="nvi' + (act === key || (key === 'leagues' && drawerOpen) ? ' on' : '') + '" data-k="' + key + '"' + (opts.href ? ' data-href="' + opts.href + '"' : '') + ' aria-label="' + esc(opts.aria || label) + '">' +
        '<span class="nvic">' + svg(icon) + (opts.badge ? '<span class="nvb' + (opts.badgeCls ? ' ' + opts.badgeCls : '') + '">' + esc(opts.badge) + '</span>' : '') + (opts.dot ? '<span class="nvd ' + opts.dot + '"></span>' : '') + '</span>' +
        '<span class="nvl">' + esc(label) + '</span></button>';
    }
    var anyLive = d.leagues.some(function (l) { return /^Live/.test(l.sub); });
    rail.innerHTML =
      '<a class="nvlogo" href="/home" aria-label="Fanball home"><img src="/a/6d0fd2687e0f4e908cbe7777ef1d6bd1.webp" alt=""></a>' +
      '<div class="nvgrp">' +
        item('leagues', 'leagues', 'Leagues', { dot: anyLive ? 'live' : '', aria: 'Your leagues' }) +
        item('gameplan', 'gameplan', 'Game Plan', { href: '/gameplan', badge: d.gp, badgeCls: 'amber' }) +
        item('wire', 'wire', 'The Wire', { href: '/wire' }) +
      '</div>' +
      '<div class="nvgrp nvlg">' +
        '<a class="nvcur' + (act === 'league' ? ' on' : '') + '" href="/home" data-k="league" aria-label="The Empire League home">' + (d.viewBadge || '<span class="fbd" style="width:28px;height:28px;background:#b07a1e;border-radius:8px">EL</span>') + '</a>' +
        item('lineup', 'lineup', 'Lineup', { href: '/franchise', badge: lineupN ? lineupN[1] : '', aria: 'Set lineup' }) +
        item('live', 'live', 'Live', { href: '/live', dot: /\d/.test(liveScore) ? 'live' : '', aria: 'Live scoring' }) +
        item('standings', 'standings', 'Standings', { href: '/standings' }) +
        item('add', 'add', 'Add', { href: '/players', aria: 'Add players' }) +
        (d.chat ? item('chat', 'chat', 'Chat', { dot: d.chatOnline ? 'on' : '', aria: 'League chat' }) : '') +
      '</div>' +
      '<div class="nvgrp nvbot">' +
        item('more', 'more', 'More') +
        '<button type="button" class="nvi nvexp" data-k="expand" aria-label="' + (drawerOpen ? 'Collapse menu' : 'Expand menu') + '"><span class="nvic">' + svg(drawerOpen ? 'collapse' : 'expand') + '</span><span class="nvl">' + (drawerOpen ? 'Collapse' : 'Expand') + '</span></button>' +
      '</div>';
    rail.querySelectorAll('[data-k]').forEach(function (b) { wire(b); });
  }

  var TIPS = {
    gameplan: function () { return ['Game Plan', data.gp ? data.gp + ' lineups need a look across your leagues' : 'Set every lineup at once']; },
    wire: function () { return ['The Wire', 'Adds, drops and claims across all your leagues']; },
    league: function () { return ['The Empire League', 'League home']; },
    lineup: function () { return ['Set lineup', data.quick['Set lineup'] || '']; },
    live: function () { return ['Live scoring', data.quick['Live scoring'] || '']; },
    standings: function () { return ['Standings', data.quick['Standings'] || '']; },
    add: function () { return ['Add players', data.quick['Add players'] || '']; },
    expand: function () { return [drawerOpen ? 'Collapse menu' : 'Expand menu', drawerOpen ? 'Back to icons only' : 'Show the full menu: leagues, chat and transactions']; }
  };
  var MORE = [['/clubhouse', 'Clubhouse', 'Chat, polls and the league money'], ['/trades', 'Trades', 'Offers, the block and the deadline'], ['/playoffs', 'Playoffs', 'Picture, bracket and odds'],
    ['/history', 'History & Record Book', 'Champions, records, head-to-head'], ['/notifications', 'Notifications', 'Everything that needs you'], ['/settings', 'League settings', 'Rules, scoring and rosters'],
    ['/commish', 'Commissioner tools', 'Approvals, dues and fixes'], ['/offseason', 'Offseason', 'Rollover, keepers and rookie draft']];

  function flyContent(k) {
    if (k === 'leagues') {
      var n = data.leagues.length;
      return '<div class="nvfh"><b>Your leagues</b><span>' + esc(data.total) + '</span></div><div class="nvll">' + data.leagues.map(function (l) {
        return '<a href="#" class="lg' + (l.on ? ' on' : '') + '">' + l.badge + '<span><span class="nvn">' + esc(l.name) + '</span><span class="nvs' + (/^Live/.test(l.sub) ? ' live' : '') + '">' + esc(l.sub) + '</span></span></a>';
      }).join('') + '</div><button type="button" class="nvffb" data-a="drawer">' + esc(data.more || 'Show all leagues') + ' · open full menu</button>';
    }
    if (k === 'chat' && data.chat) {
      var c = data.chat.cloneNode(true);
      c.querySelectorAll('input,textarea,button').forEach(function (x) { x.remove(); });
      return '<div class="nvfh"><b>League chat</b><span>' + (data.chatOnline ? data.chatOnline + ' online' : '') + '</span></div><aside class="rail nvclone">' + c.outerHTML + '</aside><div class="nvff"><span>Click the icon to open chat in the menu</span></div>';
    }
    if (k === 'more') {
      return '<div class="nvfh"><b>More in The Empire League</b></div><div class="nvmore">' + MORE.map(function (m) {
        return '<a href="' + m[0] + '" class="nvm' + ('/' + PAGE.id === m[0] ? ' on' : '') + '"><b>' + esc(m[1]) + '</b><span>' + esc(m[2]) + '</span></a>';
      }).join('') + '</div>';
    }
    var t = TIPS[k] ? TIPS[k]() : null;
    return t ? '<div class="nvtip"><b>' + esc(t[0]) + '</b>' + (t[1] ? '<span>' + esc(t[1]) + '</span>' : '') + '</div>' : '';
  }
  function showFly(btn, k, pin) {
    clearTimeout(hideT); clearTimeout(showT);
    var html = flyContent(k); if (!html) return;
    fly.innerHTML = html; fly.className = 'nvfly nvx' + (/leagues|chat|more/.test(k) ? ' big' : ' tip');
    fly.hidden = false; fly.dataset.k = k;
    var fb = fly.querySelector('[data-a=drawer]'); if (fb) fb.onclick = function (e) { e.stopPropagation(); hideFly(true); setDrawer(true, 'top'); };
    var r = btn.getBoundingClientRect(), h = fly.offsetHeight, top = /leagues|chat|more/.test(k) ? r.top - 6 : r.top + r.height / 2 - h / 2;
    top = Math.max(8, Math.min(top, window.innerHeight - h - 8));
    fly.style.top = top + 'px'; fly.style.left = (drawerOpen ? 76 + 288 : 76) + 6 + 'px';
    pinnedFly = pin ? k : null;
    rail.querySelectorAll('.nvi').forEach(function (b) { b.classList.toggle('hov', b === btn); });
  }
  function hideFly(now) {
    clearTimeout(hideT); clearTimeout(showT);
    var f = function () { fly.hidden = true; pinnedFly = null; rail.querySelectorAll('.nvi.hov').forEach(function (b) { b.classList.remove('hov'); }); };
    if (now) f(); else hideT = setTimeout(f, 260);
  }
  fly.addEventListener('mouseenter', function () { clearTimeout(hideT); });
  fly.addEventListener('mouseleave', function () { if (!pinnedFly) hideFly(); });

  function wire(b) {
    var k = b.dataset.k;
    b.addEventListener('mouseenter', function () {
      if (pinnedFly) return;
      clearTimeout(hideT); clearTimeout(showT);
      if (k === 'leagues' && drawerOpen) { showFly(b, 'expand-tip-none'); return; }
      var big = /leagues|chat|more/.test(k);
      if (!fly.hidden && fly.dataset.k !== k) showFly(b, k); else showT = setTimeout(function () { showFly(b, k); }, big ? 140 : 220);
    });
    b.addEventListener('mouseleave', function () { clearTimeout(showT); if (!pinnedFly) hideFly(); });
    b.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      if (b.dataset.href) { api.go(b.dataset.href); return; }
      if (k === 'league') { api.go('/home'); return; }
      if (k === 'leagues') { hideFly(true); setDrawer(!drawerOpen, 'top'); return; }
      if (k === 'chat') { hideFly(true); setDrawer(true, 'chat'); return; }
      if (k === 'expand') { hideFly(true); setDrawer(!drawerOpen); return; }
      if (k === 'more') { if (pinnedFly === 'more') hideFly(true); else showFly(b, 'more', true); }
    });
  }

  function setDrawer(open, scrollTo) {
    drawerOpen = open; try { localStorage.setItem(OPEN_KEY, open ? '1' : '0'); } catch (e) {}
    document.body.classList.toggle('nv-open', open);
    buildRail();
    if (open && scrollTo) {
      if (scrollTo === 'top') drawer.scrollTop = 0;
      if (scrollTo === 'chat' && data.chat) { var c = drawer.querySelector('aside.rail') && [].find.call(drawer.querySelectorAll('.rsec'), function (s) { var h = s.querySelector('.rh'); return h && /chat/i.test(txt(h)); }); if (c) drawer.scrollTop = c.offsetTop - 60; }
    }
  }

  // ---------- league switcher in the league bar ----------
  function buildDrop(anchor) {
    var r = anchor.getBoundingClientRect();
    drop.innerHTML = '<div class="nvdh">Switch league</div>' + data.leagues.map(function (l) {
      return '<a href="#" class="nvdl' + (l.on ? ' on' : '') + '" data-on="' + (l.on ? 1 : 0) + '">' + l.badge + '<span class="nvdt"><b>' + esc(l.name) + '</b><span class="' + (/^Live/.test(l.sub) ? 'live' : '') + '">' + esc(l.sub) + '</span></span>' + (l.on ? '<span class="nvck">' + svg('check', 16) + '</span>' : '') + '</a>';
    }).join('') +
      '<div class="nvdf"><a href="#" data-a="all">All leagues</a><a href="/onboard?mode=finder">Join a league</a><a href="/onboard?mode=create">Create a league</a></div>';
    drop.style.left = Math.max(8, r.left) + 'px'; drop.style.top = (r.bottom + 8) + 'px';
    drop.hidden = false; dropOpen = true; anchor.classList.add('open');
    drop.querySelectorAll('.nvdl').forEach(function (a) {
      a.onclick = function (e) { e.preventDefault(); e.stopPropagation(); closeDrop(); if (a.dataset.on === '1') api.go('/home'); else api.flash('Only The Empire League is built out in this prototype'); };
    });
    drop.querySelector('[data-a=all]').onclick = function (e) { e.preventDefault(); e.stopPropagation(); closeDrop(); setDrawer(true, 'top'); };
  }
  function closeDrop() { drop.hidden = true; dropOpen = false; var a = root.querySelector('.nvsw.open'); if (a) a.classList.remove('open'); }
  document.addEventListener('click', function (e) {
    if (dropOpen && !e.target.closest('.nvdrop') && !e.target.closest('.nvsw')) closeDrop();
    if (pinnedFly && !e.target.closest('.nvfly') && !e.target.closest('.nvrail')) hideFly(true);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeDrop(); hideFly(true); } });
  window.addEventListener('scroll', function () { if (dropOpen) closeDrop(); if (!fly.hidden && !pinnedFly) hideFly(true); }, { passive: true });

  // ---------- scoreboard ----------
  function mineFirst(strip) {
    var row = strip && strip.querySelector('.striprow'), mine = row && row.querySelector('.cell.mine');
    if (mine && row.firstElementChild !== mine) row.insertBefore(mine, row.firstElementChild);
  }
  function slimStrip(band) {
    var strip = band.querySelector('.strip'); if (!strip) return;
    band.classList.add('nvband');
    if (band.firstElementChild && band.firstElementChild.tagName === 'A') band.firstElementChild.classList.add('nvhide');
    var wk = strip.previousElementSibling; if (wk) wk.classList.add('nvwk');
    strip.querySelectorAll('.cell').forEach(function (cell) {
      var lns = cell.querySelectorAll(':scope > .ln'); if (lns.length < 2) return;
      function parts(ln) { return { bx: ln.querySelector('.bx, .fbd'), ab: ln.querySelector('.ab'), s: ln.querySelector('.s') }; }
      var a = parts(lns[0]), b = parts(lns[1]), row = document.createElement('span'); row.className = 'nvsr';
      [a.bx, a.ab, a.s].forEach(function (x) { if (x) row.appendChild(x); });
      var sep = document.createElement('span'); sep.className = 'nvsep'; row.appendChild(sep);
      [b.s, b.ab, b.bx].forEach(function (x) { if (x) row.appendChild(x); });
      lns[0].replaceWith(row); lns[1].remove();
    });
    var row = strip.querySelector('.striprow'); if (row) row.style.transform = 'none';
    if (!strip.querySelector('.nvarr')) {
      var arr = document.createElement('button'); arr.type = 'button'; arr.className = 'nvarr nvx'; arr.setAttribute('aria-label', 'More scores'); arr.innerHTML = svg('expand', 16);
      arr.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); strip.scrollBy({ left: strip.clientWidth * 0.8, behavior: 'smooth' }); });
      strip.appendChild(arr);
    }
  }

  // ---------- per-render hook ----------
  return {
    decorate: function (compact) {
      var r = root.querySelector('aside.rail');
      var band = root.querySelector('.strip') ? root.querySelector('.strip').closest('.ng > div') : null;
      if (band) mineFirst(band.querySelector('.strip'));
      var on = compact && !!r;
      document.body.classList.toggle('nv-c', on);
      document.body.classList.toggle('nv-open', on && drawerOpen);
      rail.hidden = drawer.hidden = !on;
      if (!on) { hideFly(true); closeDrop(); return; }
      var st = drawer.scrollTop;
      data = readRail(r);
      drawer.innerHTML = '<div class="nvdhd"><span>Menu</span><button type="button" aria-label="Collapse menu">' + svg('collapse', 18) + '</button></div>';
      drawer.querySelector('button').onclick = function () { setDrawer(false); };
      drawer.appendChild(r);
      drawer.scrollTop = st;
      buildRail();
      if (band) slimStrip(band);
      // league switcher
      var hdr = r ? root.querySelector('header') : null, id = hdr && hdr.querySelector(':scope > div > span:first-child');
      if (id && id.querySelector('.fbd') && /League/.test(txt(id))) {
        id.classList.add('nvsw'); id.setAttribute('role', 'button'); id.setAttribute('tabindex', '0'); id.setAttribute('aria-haspopup', 'menu');
        var ch = document.createElement('span'); ch.className = 'nvchev'; ch.innerHTML = svg('chev', 16); id.appendChild(ch);
        id.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); if (dropOpen) closeDrop(); else buildDrop(id); });
        id.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); id.click(); } });
        if (dropOpen) { id.classList.add('open'); var rr = id.getBoundingClientRect(); drop.style.top = (rr.bottom + 8) + 'px'; }
      }
      if (pinnedFly) { var b = rail.querySelector('[data-k="' + pinnedFly + '"]'); if (b) showFly(b, pinnedFly, true); else hideFly(true); }
    }
  };
};
