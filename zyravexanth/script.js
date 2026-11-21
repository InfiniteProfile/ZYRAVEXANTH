/* ZYRAVEXANTH — infinite profile system. Vanilla JS, no dependencies.
   Profiles are never stored: each one is generated deterministically from its
   ID *string*, so IDs of any length stay exact (BigInt only for +/- arithmetic). */
(function () {
  'use strict';

  /* ---------- DATA (word banks) ---------- */
  var D = {
    syl: ['ka','ve','zy','ra','xo','mi','tha','lu','ny','dre','so','vi','qua','el','or','ish','bra','cae','fen','gal','hy','jun','kor','lys','mar','nex','ob','pyr','quin','rho','sel','tor','ul','vash','wen','yar','zan','ae','dun','eth'],
    end: ['n','x','th','s','r','l','m','k','nd','ra','a','is','on','ex','el'],
    role: ['cartographer of lost signals','archivist','void courier','signal weaver','glass architect','memory broker','star mechanic','dream cartographer','rift negotiator','lumen botanist','cipher poet','orbital chef','tide engineer','echo sculptor'],
    origin: ['the Crimson Spiral','Nullport','Halcyon Deep','the Obsidian Belt','Vantor Station','Mirewake','Sable Harbor','the Velvet Rift','Orrin Gate','Kairo Prime','the Umbral Fields','Lowlight Quay'],
    adj: ['restless','meticulous','soft-spoken','fearless','wry','nocturnal','relentless','curious','stoic','mercurial','generous','guarded'],
    hook: ['who has never repeated a route twice','known for answering messages before they are sent','who collects maps of places that no longer exist','who speaks four dialects of static','who keeps a garden alive in zero gravity','who rebuilt a district from a single recording','who trades only in favors and rare silences','who sleeps in shifts to follow three time zones','who once outran a collapsing signal tower','who signs every work with a different name'],
    work: ['Currently mapping the quiet corridors between neighboring districts.','Spends most cycles restoring broken archives for strangers.','Runs a small workshop where old machines learn new songs.','Leads a slow, careful project to catalog every unnamed star.','Mentors newcomers arriving from the outer sectors.','Is known across the universe for an unfinished masterwork.','Maintains a private network of lanterns along the long road.','Writes letters to places that have not been built yet.'],
    quirk: ['Refuses to trust any clock older than a week.','Keeps a notebook of questions with no known answers.','Always travels with a single borrowed umbrella.','Hums in a key nobody else can quite identify.','Collects doorknobs from abandoned stations.','Insists that every meeting start with tea.','Remembers every face but almost never a name.','Believes silence is the oldest language.'],
    motto: ['Every ending is a coordinate.','Carry less, notice more.','The map is never the road.','Quiet things last longest.','Begin where the signal fades.','Nothing is lost, only filed elsewhere.','Build the door before the wall.','Follow the unlit path.'],
    faction: ['Lantern Syndicate','Hollow Choir','Order of the Thin Veil','Parallax Guild','Ninth Meridian','Ashen Circuit','Free Orbit Collective','Quiet Engine','Wardens of the Low Tide','Independent'],
    status: ['Active','Drifting','In transit','Dormant','Observing'],
    trait: ['Curious','Loyal','Analytical','Bold','Patient','Inventive','Candid','Calm','Driven','Playful','Cautious','Visionary','Resourceful','Empathic','Precise','Rebellious'],
    skill: ['Navigation','Cryptography','Diplomacy','Fabrication','Linguistics','Botany','Archiving','Piloting','Negotiation','Sound design','Forecasting','Repair','Storytelling','Mapping','Strategy','Healing'],
    stat: ['Influence','Resonance','Stability','Reach'],
    hue: [342, 350, 356, 2, 268, 276, 284, 292, 300] /* reds + purples only */
  };

  /* ---------- CONFIG ---------- */
  var CHUNK = 30;        // profiles per DOM section
  var BATCH = 300;       // profiles prepared per automatic batch
  var AHEAD = 8;         // keep this many viewport-heights of runway below the user

  /* ---------- DETERMINISTIC GENERATION ---------- */
  function seedFrom(str) { // string -> 4 x 32-bit seeds (cyrb128)
    var h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
    for (var i = 0, k; i < str.length; i++) {
      k = str.charCodeAt(i);
      h1 = h2 ^ Math.imul(h1 ^ k, 597399067); h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
      h3 = h4 ^ Math.imul(h3 ^ k, 951274213); h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067); h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213); h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    return [(h1 ^ h2 ^ h3 ^ h4) >>> 0, (h2 ^ h1) >>> 0, (h3 ^ h1) >>> 0, (h4 ^ h1) >>> 0];
  }
  function rng(s) { // sfc32
    var a = s[0], b = s[1], c = s[2], d = s[3];
    return function () {
      a |= 0; b |= 0; c |= 0; d |= 0;
      var t = (a + b | 0) + d | 0; d = d + 1 | 0;
      a = b ^ b >>> 9; b = c + (c << 3) | 0; c = c << 21 | c >>> 11; c = c + t | 0;
      return (t >>> 0) / 4294967296;
    };
  }
  function add(id, n) { return String(BigInt(id) + BigInt(n)); } // exact, any length

  function avatar(R, pick) {
    var h = pick(D.hue), h2 = pick(D.hue), st = (R() * 4) | 0, cyan = R() < 0.12;
    var bg = 'hsl(' + h + ' 55% 9%)', c1 = 'hsl(' + h2 + ' 60% 33%)', c2 = 'hsl(' + h + ' 68% 44%)', ac = cyan ? '#22d3e6' : c2, s;
    if (st === 0) s = '<circle cx="32" cy="' + (22 + ((R() * 5) | 0)) + '" r="' + (9 + ((R() * 4) | 0)) + '" fill="' + c1 + '"/><path d="M11 58c2-14 9-19 21-19s19 5 21 19z" fill="' + c2 + '" opacity=".9"/>';
    else if (st === 1) s = '<circle cx="32" cy="32" r="24" fill="none" stroke="' + c1 + '" stroke-width="5"/><circle cx="32" cy="32" r="14" fill="none" stroke="' + c2 + '" stroke-width="4"/><circle cx="32" cy="32" r="4" fill="' + ac + '"/>';
    else if (st === 2) s = '<path d="M32 7 57 32 32 57 7 32z" fill="' + c1 + '"/><path d="M32 20 44 32 32 44 20 32z" fill="' + ac + '"/>';
    else s = '<circle cx="32" cy="32" r="11" fill="' + c1 + '"/><ellipse cx="32" cy="32" rx="26" ry="' + (7 + ((R() * 8) | 0)) + '" transform="rotate(' + ((R() * 150) | 0) + ' 32 32)" fill="none" stroke="' + ac + '" stroke-width="2.5"/>';
    return '<svg class="av" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" fill="' + bg + '"/>' + s + '</svg>';
  }

  function make(id) {
    var R = rng(seedFrom(id));
    var pick = function (a) { return a[(R() * a.length) | 0]; };
    var int = function (a, b) { return a + ((R() * (b - a + 1)) | 0); };
    var part = function () {
      var s = pick(D.syl) + (R() < 0.6 ? pick(D.syl) : '') + pick(D.end);
      return s.charAt(0).toUpperCase() + s.slice(1);
    };
    var first = part(), name = first + ' ' + part();
    var role = pick(D.role), origin = pick(D.origin);
    var uniq = [], traits = [], skills = [];
    while (traits.length < 3) { var t = pick(D.trait); if (traits.indexOf(t) < 0) traits.push(t); }
    while (skills.length < 3) { var k = pick(D.skill); if (skills.indexOf(k) < 0) skills.push(k); }
    skills = skills.map(function (k) { return [k, int(48, 99)]; });
    return {
      id: id, name: name,
      handle: '@' + name.toLowerCase().replace(' ', '_') + '.' + BigInt(id).toString(36),
      role: role, origin: origin, faction: pick(D.faction), status: pick(D.status),
      cycle: int(1, 999), sector: pick(D.syl).toUpperCase() + '-' + int(1, 99),
      traits: traits, skills: skills,
      stats: D.stat.map(function (s) { return [s, int(30, 99)]; }),
      bio: first + ' is a ' + pick(D.adj) + ' ' + role + ' from ' + origin + ', ' + pick(D.hook) + '. ' +
           pick(D.work) + ' ' + pick(D.quirk) + ' \u201c' + pick(D.motto) + '\u201d',
      av: avatar(R, pick)
    };
  }

  function links(id) { // neighbouring + loosely related profile IDs (all exact BigInt)
    var R = rng(seedFrom(id + 'L')), out = [], big = BigInt(id), i, v;
    if (big > BigInt(1)) out.push(['Previous', add(id, -1)]);
    out.push(['Next', add(id, 1)]);
    for (i = 0; i < 4; i++) {
      v = big + BigInt(((R() * 2000000) | 0) - 1000000);
      if (v > BigInt(0) && String(v) !== id) out.push(['Linked', String(v)]);
    }
    return out;
  }

  /* ---------- TEMPLATES ---------- */
  function card(p) {
    return '<a class="card" href="#/p/' + p.id + '"><div class="ch">' + p.av +
      '<div class="who"><div class="nm">' + p.name + '</div><div class="hd">#' + p.id + '</div></div></div>' +
      '<p class="bio">' + p.bio + '</p><div class="meta"><span class="tag' + (p.status === 'Active' ? ' dot' : '') + '">' + p.status +
      '</span><span class="tag">' + p.traits[0] + '</span><span class="tag">' + p.traits[1] + '</span></div></a>';
  }
  function detail(p) {
    var info = [['Role', p.role], ['Origin', p.origin], ['Faction', p.faction], ['Status', p.status], ['Registered', 'Cycle ' + p.cycle], ['Sector', p.sector]]
      .map(function (r) { return '<div><small>' + r[0] + '</small><b>' + r[1] + '</b></div>'; }).join('');
    var st = p.stats.map(function (s) { return '<div class="st"><span>' + s[0] + '</span><div class="bar"><i style="width:' + s[1] + '%"></i></div><em>' + s[1] + '</em></div>'; }).join('');
    var tags = function (a) { return a.map(function (t) { return '<span class="tag">' + t + '</span>'; }).join(''); };
    var lk = links(p.id).map(function (l) { return '<a class="lk" href="#/p/' + l[1] + '" title="' + l[0] + ' #' + l[1] + '">' + l[0] + ' #' + l[1] + '</a>'; }).join('');
    return '<div class="dh">' + p.av + '<div><h2>' + p.name + '</h2><div class="hd2">' + p.handle + '</div><div class="pid">ID ' + p.id + '</div></div></div>' +
      '<p class="dbio">' + p.bio + '</p><div class="info">' + info + '</div>' +
      '<h3>Signature stats</h3>' + st +
      '<h3>Traits</h3><div class="tags">' + tags(p.traits) + '</div>' +
      '<h3>Skills</h3><div class="tags">' + tags(p.skills.map(function (s) { return s[0] + ' ' + s[1]; })) + '</div>' +
      '<h3>Connections</h3><div class="tags">' + lk + '</div>';
  }

  /* ---------- INFINITE FEED ---------- */
  var feed = document.getElementById('feed'), chunks = [], nextId = '1', chunkH = '', io = null;

  function calcH(c) {
    var cs = getComputedStyle(c), cols = cs.gridTemplateColumns.split(' ').length,
        rh = parseFloat(cs.gridAutoRows), g = parseFloat(cs.rowGap);
    var h = Math.ceil(CHUNK / cols) * (rh + g) - g;
    return isFinite(h) ? h + 'px' : '1500px';
  }
  function render(c) {
    if (c._r) return;
    var id = c.dataset.s, s = '';
    for (var i = 0; i < CHUNK; i++) { s += card(make(id)); id = add(id, 1); }
    c.innerHTML = s; c._r = 1;
  }
  function clear(c) { if (c._r) { c.textContent = ''; c._r = 0; } }

  function addBatch() { // appends BATCH profiles worth of sections at the end; never touches scroll
    var f = document.createDocumentFragment(), n = BATCH / CHUNK, i, c;
    for (i = 0; i < n; i++) {
      c = document.createElement('section'); c.className = 'chunk'; c.dataset.s = nextId;
      if (chunkH) c.style.height = chunkH;
      f.appendChild(c); chunks.push(c); nextId = add(nextId, CHUNK);
    }
    feed.appendChild(f);
    if (!chunkH) fixHeights();
    if (io) for (i = chunks.length - n; i < chunks.length; i++) io.observe(chunks[i]);
    else scan();
  }
  function fixHeights() {
    chunkH = calcH(chunks[0]);
    for (var i = 0; i < chunks.length; i++) chunks[i].style.height = chunkH;
  }
  function ensure() { // keep plenty of runway so fast scrolling never hits the end
    var de = document.documentElement, n = 0;
    while (n++ < 8 && de.scrollHeight - (window.scrollY + window.innerHeight) < window.innerHeight * AHEAD) addBatch();
  }
  function scan() { // fallback when IntersectionObserver is unavailable
    var vh = window.innerHeight, i, r, c;
    for (i = 0; i < chunks.length; i++) {
      c = chunks[i]; r = c.getBoundingClientRect();
      if (r.bottom > -vh * 1.5 && r.top < vh * 2.5) render(c); else clear(c);
    }
  }
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(function (es) {
      for (var i = 0; i < es.length; i++) { if (es[i].isIntersecting) render(es[i].target); else clear(es[i].target); }
    }, { rootMargin: '150% 0px' });
  }

  var tick = 0;
  function onScroll() {
    if (tick) return;
    tick = requestAnimationFrame(function () { tick = 0; ensure(); if (!io) scan(); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { requestAnimationFrame(function () { fixHeights(); ensure(); if (!io) scan(); }); });
  setInterval(function () { ensure(); if (!io) scan(); }, 1000); // independent of reaching the bottom

  /* ---------- PROFILE VIEW (hash route #/p/<id>) ---------- */
  var view = document.getElementById('view'), box = document.getElementById('detail'), closeBtn = document.getElementById('close'), prev = null;
  function route() {
    var m = /^#\/p\/([1-9][0-9]*)$/.exec(location.hash);
    if (m) {
      if (view.hidden) prev = document.activeElement;
      box.innerHTML = detail(make(m[1]));
      view.hidden = false; view.scrollTop = 0; document.body.classList.add('lock');
      closeBtn.focus({ preventScroll: true });
    } else if (!view.hidden) {
      view.hidden = true; document.body.classList.remove('lock');
      if (prev && prev.focus) prev.focus({ preventScroll: true });
    }
  }
  function closeView() { history.pushState(null, '', location.pathname + location.search); route(); }
  closeBtn.addEventListener('click', closeView);
  view.addEventListener('click', function (e) { if (e.target === view) closeView(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !view.hidden) closeView(); });
  window.addEventListener('hashchange', route);

  /* ---------- SEARCH (string-only; IDs are never converted to Number) ---------- */
  var form = document.getElementById('search'), q = document.getElementById('q'), msg = document.getElementById('msg');
  q.addEventListener('input', function () {
    var v = q.value.replace(/\D/g, '');
    if (v !== q.value) q.value = v;
    msg.textContent = '';
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = q.value.trim();
    if (!/^[1-9][0-9]*$/.test(v)) { msg.textContent = v ? 'IDs are whole numbers without leading zeros' : 'Type a numerical ID'; return; }
    msg.textContent = '';
    var h = '#/p/' + v;
    if (location.hash === h) route(); else location.hash = h;
    q.blur();
  });

  /* ---------- START ---------- */
  addBatch();   // first 300 profiles
  ensure();
  route();
})();
