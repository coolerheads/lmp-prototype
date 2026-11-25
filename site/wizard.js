/* Fanball LMP prototype: Premium "Customize team" wizard (mock).
   Opens from the Customize Team button on My Franchise. Collects the team's story, assembles a plain-English
   brief and the per-asset image prompts, then shows a mocked generation using the Gridiron Syndicate kit. */
(function () {
  'use strict';
  var A = {
    hero: '/a/5f3c2a91d0e84b7cb1f2a6d4e9c0b711.webp', heroWide: '/a/1dc28e7e1cf8ca0e61714bd4aac72941.webp',
    left: '/a/8e8513da401ed6760afe2f450149f773.webp', right: '/a/1ded12be5a54e0c7bf476c11c426be93.webp',
    badge: '/a/b4d6e8f0a1c3e5079b2d4f6a8c0e2a41.webp', back: '/a/7a1e4c0b9d2f4e6a8b3c5d7e9f1a2b3c.webp'
  };
  var CATS = [
    ['nfl', 'An NFL player or team', 'e.g. a nod to your favorite QB or the team you grew up with'],
    ['screen', 'A movie or TV show', 'e.g. The Godfather, Ted Lasso, Breaking Bad'],
    ['music', 'Music or a song', 'e.g. a band, an album, a lyric'],
    ['name', 'Your own name', 'e.g. a pun on your first or last name'],
    ['home', 'Your hometown or school', 'e.g. a city, a landmark, a mascot from high school'],
    ['original', 'Something original', 'an inside joke, an animal, an idea of your own']
  ];
  var STYLES = ['Metallic lettering', 'Cinematic scene', 'Retro patch', 'Cartoon mascot', 'Neon', 'Vintage', 'Minimal', 'Gritty / grunge'];
  var COLORS = ['#B3121C', '#111111', '#C0C4CC', '#C9A24A', '#0B5D3B', '#1F4FA8', '#5B2A86', '#E36414', '#F2C230', '#FFFFFF'];
  var S = {
    step: 0, name: 'The Gridiron Syndicate', initials: 'SYN', cat: 'screen', catWhat: 'The Godfather and 1930s gangster films',
    meaning: 'We run this league like a crime family: quiet, organized and ruthless at the trade deadline. The boss sits in the back of a smoky speakeasy pulling the strings. Include a fedora, pinstripes, cash and a chalk football play.',
    refs: [], styles: ['Metallic lettering', 'Cinematic scene'], colors: ['#B3121C', '#111111', '#C0C4CC'], bg: 'dark',
    brief: null, briefEdited: false, hero: null, badge: null, busy: false, paid: false, heroRedo: 2, badgeRedo: 1, heroRound: 0, badgeRound: 0, badgeShown: false
  };
  var STEPS = ['Identity', 'Inspiration', 'Meaning', 'References', 'Style', 'Brief', 'Hero', 'Badge', 'Your kit'];
  var el = null;

  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function catLabel() { var c = CATS.filter(function (x) { return x[0] === S.cat; })[0]; return c ? c[1] : ''; }
  function styleLine() {
    var bg = S.bg === 'dark' ? 'dark, dramatic background' : 'bright, light background';
    return S.styles.join(', ').toLowerCase() + '; colors ' + S.colors.join(', ') + '; ' + bg;
  }
  function inspiration() {
    var what = S.catWhat ? ' (' + S.catWhat + ')' : '';
    if (S.cat === 'nfl') return 'Inspired by ' + (S.catWhat || 'an NFL player or team') + ', using similar colors and attitude only: no NFL team logos, no real player likeness or name, no uniform numbers.';
    if (S.cat === 'screen') return 'Inspired by the mood of ' + (S.catWhat || 'a movie or TV show') + ': original characters only, no actors’ likenesses, no studio characters, logos or titles.';
    if (S.cat === 'music') return 'Inspired by ' + (S.catWhat || 'music') + ': original artwork only, no album art, band logos or real musicians.';
    return 'Theme: ' + catLabel().toLowerCase() + what + '.';
  }
  function buildBrief() {
    return '“' + S.name + '” (' + S.initials + '). ' + inspiration() + '\n\n' + S.meaning + '\n\nStyle: ' + styleLine() + '.' +
      (S.refs.length ? '\n\nMood references attached: ' + S.refs.length + ' image' + (S.refs.length > 1 ? 's' : '') + ' (used for mood only, never copied).' : '');
  }
  function prompts() {
    var b = S.brief || buildBrief(), nm = '"' + S.name + '"', sl = 'Style: ' + styleLine() + '.';
    return [
      ['Franchise hero (3:1)', 'Wide 3:1 cinematic hero banner for a fantasy football team called ' + nm + '.\nTeam story: ' + b.replace(/\n+/g, ' ') + '\nPut the team logo and name in the upper-left third. Fill the center and right with a scene that tells the story.\nKeep the bottom 25% darker and low in detail, with no text and no faces, so white text can sit over it. Keep the bottom-right corner calm.\n' + sl],
      ['Team badge (square)', 'Using the attached hero, create the team emblem on its own: a square badge on a transparent background, centered, about 10% padding.\nKeep the same logo, lettering and colors; add the initials "' + S.initials + '".\nBold, simple silhouette that still reads at 24 pixels: thick shapes, no thin lines, two or three colors.'],
      ['Matchup banner, logo left (3:1)', 'Wide 3:1 banner for ' + nm + '. Use the attached badge exactly as drawn.\nLogo and team name entirely within the left 40%, vertically centered, about 10% space above and below.\nThe right 60%: plain dark textured background only, no text or figures, fading to near-black at the far right edge.\n' + sl],
      ['Matchup banner, logo right (3:1)', 'Now the same banner with the logo and name in the right 40% and the plain background in the left 60%, fading to near-black at the far left edge. Same style and lettering. Do not mirror: all text reads normally.'],
      ['Page backdrop (16:9)', 'Wide 16:9 background, 2560 x 1440, for ' + nm + '. Mostly dark and low-contrast; leave the middle 60% nearly empty.\nPut the visual interest at the far left and right edges and corners, drawn from the team story.\nNo text, no logo, no faces, no central subject. Soft vignette. Colors ' + S.colors.join(', ') + '.']
    ];
  }

  function chip(label, on, attrs) { return '<button type="button" class="wz-chip' + (on ? ' on' : '') + '" ' + attrs + '>' + esc(label) + '</button>'; }
  function body() {
    var st = S.step;
    if (st === 0) return '<h3>What’s your team called?</h3><p class="wz-sub">This is the name everyone in the league sees.</p>' +
      '<label class="wz-f"><span>Team name</span><input data-k="name" value="' + esc(S.name) + '" maxlength="40"></label>' +
      '<label class="wz-f"><span>Initials or short name <em>2–4 characters, shown on small badges and the scoreboard</em></span><input data-k="initials" value="' + esc(S.initials) + '" maxlength="4" style="width:140px;text-transform:uppercase"></label>' +
      '<div class="wz-ok">✓ ' + esc(S.initials) + ' isn’t used by anyone else in The Empire League.</div>';
    if (st === 1) return '<h3>Where does the name come from?</h3><p class="wz-sub">Pick the closest one. It helps us find the right look.</p>' +
      '<div class="wz-cats">' + CATS.map(function (c) { return '<button type="button" class="wz-cat' + (S.cat === c[0] ? ' on' : '') + '" data-cat="' + c[0] + '"><b>' + esc(c[1]) + '</b><span>' + esc(c[2]) + '</span></button>'; }).join('') + '</div>' +
      '<label class="wz-f"><span>Which one, specifically?</span><input data-k="catWhat" value="' + esc(S.catWhat) + '" placeholder="e.g. The Godfather"></label>' +
      (S.cat === 'nfl' || S.cat === 'screen' || S.cat === 'music' ? '<div class="wz-note">We’ll echo the colors and attitude, never the real thing: no NFL or studio logos, no real players’ or actors’ faces. That keeps your art yours.</div>' : '');
    if (st === 2) return '<h3>Tell us the story in up to three sentences</h3><p class="wz-sub">What does the name mean, and what should we work in?</p>' +
      '<textarea data-k="meaning" rows="5" maxlength="600">' + esc(S.meaning) + '</textarea>' +
      '<div class="wz-hints"><b>Good answers mention:</b> who or what the name is about, the mood (menacing, funny, classy), and 2–3 objects you want to see. <i>“Hurts Locker” example: a quarterback in midnight green bursting through a bank vault door, eagle wings in the background, gritty and triumphant.</i></div>';
    if (st === 3) return '<h3>Any reference images? <em>(optional)</em></h3><p class="wz-sub">Up to two images that show the mood. We use them for feel and color only, never copy them.</p>' +
      '<label class="wz-drop"><input type="file" accept="image/*" multiple data-k="refs"><span>Drop images here or <u>browse</u></span></label>' +
      '<div class="wz-refs">' + S.refs.map(function (r) { return '<span class="wz-ref" style="background-image:url(' + r + ')"></span>'; }).join('') + '</div>';
    if (st === 4) return '<h3>Pick a style</h3><p class="wz-sub">Choose one or two looks, then your colors.</p>' +
      '<div class="wz-chips">' + STYLES.map(function (x) { return chip(x, S.styles.indexOf(x) >= 0, 'data-style="' + esc(x) + '"'); }).join('') + '</div>' +
      '<div class="wz-lab">Colors <em>pick two or three</em></div><div class="wz-sw">' + COLORS.map(function (c) { return '<button type="button" class="wz-c' + (S.colors.indexOf(c) >= 0 ? ' on' : '') + '" data-color="' + c + '" style="background:' + c + '" aria-label="' + c + '"></button>'; }).join('') + '</div>' +
      '<div class="wz-lab">Background</div><div class="wz-chips">' + chip('Dark', S.bg === 'dark', 'data-bg="dark"') + chip('Light', S.bg === 'light', 'data-bg="light"') + '</div>';
    if (st === 5) { if (!S.briefEdited) S.brief = buildBrief();
      return '<h3>Here’s your brief</h3><p class="wz-sub">This is what our artist AI will work from. Edit anything that isn’t right.</p>' +
        '<textarea data-k="brief" rows="9">' + esc(S.brief) + '</textarea>' +
        '<div class="wz-note">We turn this into five prompts, one per image, with the layout rules each spot needs. You’ll get the hero first, then a badge drawn from it, then the rest of the kit.</div>'; }
    if (st === 6) return '<h3>Choose your hero</h3><p class="wz-sub">Two takes on your story. The one you pick sets the look for everything else.</p>' +
      (S.busy ? spinner('Painting three heroes…') : '<div class="wz-opts h2">' + [0, 1].map(function (i) {
        var v = (i + S.heroRound) % 3;
        return '<button type="button" class="wz-opt' + (S.hero === i ? ' on' : '') + '" data-hero="' + i + '"><span class="wz-img v' + v + '" style="background-image:url(' + (v === 1 ? A.heroWide : A.hero) + ')"></span><span>Option ' + (i + 1) + '</span></button>';
      }).join('') + '</div>' + (S.heroRedo > 0 ? '<button type="button" class="wz-link" data-a="redo-hero">Neither one: try again (' + S.heroRedo + ' left)</button>' : '<div class="wz-sub" style="margin-top:8px">No redos left. Pick your favorite, or go Back and adjust the brief.</div>'));
    if (st === 7) return '<h3>Choose your badge</h3><p class="wz-sub">Drawn from your hero. It shows next to your team everywhere: standings, scores, news.</p>' +
      (S.busy ? spinner('Drawing your badge from your hero') : '<div class="wz-opts b1"><div class="wz-opt on"><span class="wz-img bd v' + S.badgeRound + '" style="background-image:url(' + A.badge + ')"></span><span class="wz-small"><i style="background-image:url(' + A.badge + ')"></i>How it looks at 24 px</span></div></div>' +
      (S.badgeRedo > 0 ? '<button type="button" class="wz-link" data-a="redo-badge">Try a different badge (' + S.badgeRedo + ' left)</button>' : '<div class="wz-sub" style="margin-top:8px">That was your redo. You can upload your own badge later from Team settings.</div>'));
    if (st === 8) return '<h3>Your kit</h3><p class="wz-sub">How it looks around Fanball. Redo any piece you don’t love.</p>' +
      (S.busy ? spinner('Building matchup banners and your page backdrop…') :
      '<div class="wz-kit">' +
        kit('Franchise hero', '<span class="wz-img" style="background-image:url(' + A.hero + ')"></span>') +
        kit('Live scoring, your side on the left', '<span class="wz-img ban" style="background-image:url(' + A.left + ');background-position:left center"></span>') +
        kit('Live scoring, your side on the right', '<span class="wz-img ban" style="background-image:url(' + A.right + ');background-position:right center"></span>') +
        kit('Standings row', '<span class="wz-row"><i style="background-image:url(' + A.badge + ')"></i><b>' + esc(S.initials) + '</b><span>' + esc(S.name) + '</span><em>5-1</em></span>') +
        kit('Page backdrop', '<span class="wz-img bk" style="background-image:url(' + A.back + ')"></span>') +
      '</div>' + promptsBlock());
    return '';
  }
  function kit(label, inner) { return '<div class="wz-k"><div class="wz-kh"><b>' + esc(label) + '</b><button type="button" class="wz-link">Redo</button></div>' + inner + '</div>'; }
  function spinner(t) { return '<div class="wz-spin"><i></i><span>' + esc(t) + '</span><small>Mock: in the real product this calls the image service.</small></div>'; }
  function promptsBlock() {
    if (!S.paid) return '<div class="wz-pro"><b>Want to make your own?</b> Get the exact prompts we used and the layout rules, generate as many versions as you like in your own AI tool, and upload the ones you love. <button type="button" class="wz-btn ghost" data-a="paid">Show my prompts</button></div>';
    return '<div class="wz-prompts"><div class="wz-kh"><b>Your prompts</b><span>Upload your own versions any time from Team settings.</span></div>' + prompts().map(function (p) {
      return '<details><summary>' + esc(p[0]) + '</summary><pre>' + esc(p[1]) + '</pre><button type="button" class="wz-link" data-copy="' + esc(p[1]) + '">Copy</button></details>';
    }).join('') + '</div>';
  }

  function render() {
    var st = S.step, last = st === STEPS.length - 1;
    var canNext = !S.busy && (st !== 6 || S.hero != null) && (st !== 7 || S.badge != null) && (st !== 0 || (S.name.trim() && S.initials.trim().length >= 2));
    el.innerHTML = '<div class="wz-card" role="dialog" aria-modal="true" aria-label="Customize your team">' +
      '<div class="wz-top"><div><small>Premium · Customize your team</small><b>' + esc(STEPS[st]) + '</b></div><button type="button" class="wz-x" data-a="close" aria-label="Close">✕</button></div>' +
      '<div class="wz-steps">' + STEPS.map(function (n, i) { return '<span class="' + (i < st ? 'done' : i === st ? 'on' : '') + '">' + (i + 1) + '</span>'; }).join('') + '</div>' +
      '<div class="wz-body">' + body() + '</div>' +
      '<div class="wz-foot">' + (st ? '<button type="button" class="wz-btn ghost" data-a="back">Back</button>' : '<span></span>') +
      '<button type="button" class="wz-btn' + (canNext ? '' : ' off') + '" data-a="' + (last ? 'done' : 'next') + '">' + (last ? 'Use this kit' : st === 5 ? 'Create my hero' : 'Next') + '</button></div></div>';
  }
  function gen(ms) { S.busy = true; render(); setTimeout(function () { S.busy = false; render(); }, ms); }
  function go(d) {
    S.step = Math.max(0, Math.min(STEPS.length - 1, S.step + d)); render();
    if (d > 0 && (S.step === 6 && S.hero == null || S.step === 7 && !S.badgeShown || S.step === 8)) gen(S.step === 8 ? 1400 : 1700);
    if (S.step === 7) S.badgeShown = true;
    el.querySelector('.wz-body').scrollTop = 0;
  }
  function open() {
    if (!el) { el = document.createElement('div'); el.className = 'wz nvx'; document.body.appendChild(el); wire(); }
    S.step = 0; S.hero = null; S.badge = 0; S.heroRedo = 2; S.badgeRedo = 1; S.heroRound = 0; S.badgeRound = 0; S.badgeShown = false; el.hidden = false; render(); document.body.style.overflow = 'hidden';
  }
  function close() { el.hidden = true; document.body.style.overflow = ''; }
  function wire() {
    el.addEventListener('input', function (e) {
      var k = e.target.dataset.k; if (!k || k === 'refs') return;
      S[k] = k === 'initials' ? e.target.value.toUpperCase().replace(/[^A-Z0-9&]/g, '').slice(0, 4) : e.target.value;
      if (k === 'initials') e.target.value = S[k];
      if (k === 'brief') S.briefEdited = true;
      var ok = el.querySelector('.wz-ok'); if (ok) ok.textContent = '✓ ' + S.initials + ' isn’t used by anyone else in The Empire League.';
    });
    el.addEventListener('change', function (e) {
      if (e.target.dataset.k !== 'refs') return;
      [].slice.call(e.target.files, 0, 2 - S.refs.length).forEach(function (f) { S.refs.push(URL.createObjectURL(f)); });
      render();
    });
    el.addEventListener('click', function (e) {
      var t = e.target.closest('button, [data-a]'); if (!t) { if (e.target === el) close(); return; }
      var d = t.dataset;
      if (d.a === 'close') return close();
      if (d.a === 'back') return go(-1);
      if (d.a === 'next') { if (!t.classList.contains('off')) go(1); return; }
      if (d.a === 'done') { close(); flash('Kit applied to The Gridiron Syndicate (mock)'); return; }
      if (d.a === 'redo-hero') { if (S.heroRedo < 1) return; S.heroRedo--; S.heroRound++; S.hero = null; return gen(1500); }
      if (d.a === 'redo-badge') { if (S.badgeRedo < 1) return; S.badgeRedo--; S.badgeRound = 1; return gen(1300); }
      if (d.a === 'paid') { S.paid = true; return render(); }
      if (d.copy) { try { navigator.clipboard.writeText(d.copy); t.textContent = 'Copied'; } catch (x) {} return; }
      if (d.cat) { S.cat = d.cat; S.briefEdited = false; return render(); }
      if (d.style) { var i = S.styles.indexOf(d.style); if (i >= 0) S.styles.splice(i, 1); else if (S.styles.length < 2) S.styles.push(d.style); else { S.styles.shift(); S.styles.push(d.style); } S.briefEdited = false; return render(); }
      if (d.color) { var j = S.colors.indexOf(d.color); if (j >= 0) S.colors.splice(j, 1); else if (S.colors.length < 3) S.colors.push(d.color); S.briefEdited = false; return render(); }
      if (d.bg) { S.bg = d.bg; S.briefEdited = false; return render(); }
      if (d.hero) { S.hero = +d.hero; return render(); }
      if (d.badge) { S.badge = +d.badge; return render(); }
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && el && !el.hidden) close(); });
  }
  function flash(m) { var f = document.createElement('div'); f.className = 'dc-flash'; f.textContent = m; document.body.appendChild(f); setTimeout(function () { f.remove(); }, 2600); }

  // open from the Customize Team button on My Franchise (capture phase, before the page's own click handling)
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.rs-customize');
    if (!b) return;
    e.preventDefault(); e.stopPropagation(); open();
  }, true);
  window.LMPWizard = { open: open };
})();
