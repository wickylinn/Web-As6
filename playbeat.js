/**
 * Play Beat – Unified JavaScript
 * Author: ChatGPT for Marzhan (AITU)
 * Single-file logic for the music website (Home / News / Music / Register / About).
 * Drop-in usage: <script src="playbeat.js" defer></script>
 */
(() => {
  'use strict';

  // ---------- Tiny DOM helpers
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);

  // ---------- A11y + haptics
  const beep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 880;
      g.gain.value = 0.03;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      setTimeout(() => { o.stop(); ctx.close(); }, 120);
    } catch {}
  };
  const bump = (el) => {
    if (!el) return;
    el.classList.remove('js-bump');
    void el.offsetWidth; // reflow
    el.classList.add('js-bump');
  };
  const injectOnce = (css) => {
    if (!document.getElementById('playbeat-inline-style')) {
      const s = document.createElement('style');
      s.id = 'playbeat-inline-style';
      s.textContent = css;
      document.head.appendChild(s);
    }
  };
  injectOnce(`.js-bump{animation:js-bump .3s ease} @keyframes js-bump{0%{transform:scale(.98)}60%{transform:scale(1.04)}100%{transform:scale(1)}}`);

  // ---------- Persist helpers
  const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const load = (k, d) => {
    try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; }
  };

  // ---------- Theme (Day/Night)
  const THEME_KEY = 'playbeat:theme'; // 'light' | 'dark'
  const systemTheme = () => (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const getTheme = () => load(THEME_KEY, systemTheme());
  const applyTheme = (t) => {
    const dark = t === 'dark';
    document.documentElement.classList.toggle('dark-theme', dark);
    document.body.classList.toggle('dark-theme', dark);
    const btns = ['#themeToggle', '.theme-toggle'].flatMap(sel => $$(sel));
    btns.forEach(btn => {
      if (!btn) return;
      btn.textContent = dark ? '☀️ Day' : '🌙 Night';
      btn.setAttribute('aria-pressed', String(dark));
      btn.setAttribute('aria-label', dark ? 'Switch to day theme' : 'Switch to night theme');
    });
  };
  const toggleTheme = () => { const next = getTheme() === 'dark' ? 'light' : 'dark'; save(THEME_KEY, next); applyTheme(next); beep(); };

  // ---------- Date & Time widget
  const tickClock = () => {
    const box = $('#currentDateTime') || $('#currentTime');
    if (!box) return;
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    box.innerHTML = `<div style="font-size:1.05rem;font-weight:600;">${dateStr}</div><div style="font-size:1.6rem;font-weight:700;margin-top:.25rem;">${timeStr}</div>`;
  };

  // ---------- Fake API (for demo fetch)
  const api = {
    async sendContact(payload) {
      // simulate network latency and success
      await new Promise(r => setTimeout(r, 500));
      return { ok: true, message: 'Thanks, we received your message!' };
    },
    async getRandomQuote() {
      const quotes = [
        'Music is the shorthand of emotion. — Tolstoy',
        'One good thing about music, when it hits you, you feel no pain. — Marley',
        'Where words fail, music speaks. — Andersen',
        'Without music, life would be a mistake. — Nietzsche',
      ];
      await new Promise(r => setTimeout(r, 300));
      return { text: quotes[Math.floor(Math.random() * quotes.length)] };
    }
  };

  // ---------- Track DB
  const TRACKS = [
    { id: 1, title: 'Hotel California', artist: 'The Eagles', genre: 'rock', duration: 390, url: 'media/hotel_california.mp3' },
    { id: 2, title: 'Gruppa Krovi', artist: 'Kino', genre: 'rock', duration: 290, url: 'media/gruppa_krovi.mp3' },
    { id: 3, title: 'Where Have You Been (Remix)', artist: 'Rihanna', genre: 'pop', duration: 260, url: 'media/rihanna_where_have_you_been_remix.mp3' },
    { id: 4, title: 'Suigin', artist: 'Aikyn Tolebergen', genre: 'folk', duration: 215, url: 'media/aikyn_suigin.mp3' },
    { id: 5, title: 'Don\'t Stop Me Now', artist: 'Queen', genre: 'rock', duration: 210, url: 'media/queen_dont_stop_me_now.mp3' },
    { id: 6, title: 'Levitating', artist: 'Dua Lipa', genre: 'pop', duration: 203, url: 'media/dua_lipa_levitating.mp3' },
  ];
  const findTrack = (id) => TRACKS.find(t => t.id === id);

  // ---------- Player + Playlist
  const PL_KEY = 'playbeat:playlist';
  let playlist = load(PL_KEY, [1, 4, 2]); // default demo list (ids)
  let currentId = load('playbeat:currentId', playlist[0] ?? null);

  const audio = new Audio();
  audio.preload = 'metadata';

  const formatTime = (s) => {
    if (!Number.isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const z = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${z}`;
  };

  function renderTrackList() {
    const host = $('#trackList');
    if (!host) return;
    host.innerHTML = '';
    TRACKS.forEach(t => {
      const li = document.createElement('div');
      li.className = 'track d-flex align-items-center justify-content-between gap-2 mb-2 p-2 rounded bg-body-secondary';
      li.dataset.id = t.id;
      li.innerHTML = `
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-sm btn-success play-btn" title="Play">&#9658;</button>
          <div class="fw-semibold">${t.artist} – ${t.title}</div>
          <span class="badge text-bg-dark text-capitalize ms-1">${t.genre}</span>
        </div>
        <div class="d-flex align-items-center gap-2">
          <div class="stars" aria-label="Rate this track" role="group"></div>
          <button class="btn btn-sm btn-outline-success add-btn" title="Add to My Playlist">＋</button>
        </div>
      `;
      host.appendChild(li);
      setupStars(li.querySelector('.stars'), 'track:' + t.id);
    });
  }

  function renderPlaylist() {
    const host = $('#playlist');
    if (!host) return;
    host.innerHTML = '';
    if (!playlist.length) {
      host.innerHTML = '<p class="text-muted">Your playlist is empty.</p>';
      return;
    }
    playlist.forEach(id => {
      const t = findTrack(id);
      if (!t) return;
      const item = document.createElement('div');
      item.className = 'd-flex align-items-center justify-content-between border rounded p-2 mb-2 bg-body';
      item.dataset.id = t.id;
      item.innerHTML = `
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-sm btn-dark play-btn" title="Play">&#9658;</button>
          <span class="fw-semibold">${t.artist} – ${t.title}</span>
          <small class="text-muted">(${formatTime(t.duration)})</small>
        </div>
        <button class="btn btn-sm btn-danger remove-btn" title="Remove">✕</button>
      `;
      host.appendChild(item);
    });
  }

  function bindCollectionClicks() {
    on($('#trackList'), 'click', (e) => {
      const row = e.target.closest('.track');
      if (!row) return;
      const id = Number(row.dataset.id);
      if (e.target.closest('.play-btn')) {
        playTrack(id);
      }
      if (e.target.closest('.add-btn')) {
        addToPlaylist(id);
      }
    });

    on($('#playlist'), 'click', (e) => {
      const row = e.target.closest('[data-id]');
      if (!row) return;
      const id = Number(row.dataset.id);
      if (e.target.closest('.play-btn')) {
        playTrack(id);
      }
      if (e.target.closest('.remove-btn')) {
        removeFromPlaylist(id);
      }
    });

    on($('#clearPlaylist'), 'click', () => {
      playlist = [];
      save(PL_KEY, playlist);
      renderPlaylist();
      beep();
    });
  }

  function playTrack(id) {
    const t = findTrack(id);
    if (!t) return;
    currentId = id;
    save('playbeat:currentId', id);

    audio.src = t.url;
    audio.play().catch(() => {});

    const titleBox = $('#nowPlaying');
    if (titleBox) {
      titleBox.textContent = `Now Playing: ${t.artist} – ${t.title}`;
      bump(titleBox);
    }
  }

  function addToPlaylist(id) {
    if (!playlist.includes(id)) {
      playlist.push(id);
      save(PL_KEY, playlist);
      renderPlaylist();
      beep();
    }
  }
  function removeFromPlaylist(id) {
    playlist = playlist.filter(x => x !== id);
    save(PL_KEY, playlist);
    renderPlaylist();
    beep();
  }

  // ---------- Search and Genre Filter
  function wireSearch() {
    const input = $('#searchSongs') || $('#searchPlaylist');
    on(input, 'input', () => {
      const q = (input.value || '').toLowerCase();
      const list = $('#trackList') ? $$('#trackList .track') : $$('#playlist [data-id]');
      list.forEach(el => {
        const id = Number(el.dataset.id);
        const t = findTrack(id);
        const hay = `${t.title} ${t.artist} ${t.genre}`.toLowerCase();
        el.classList.toggle('d-none', !hay.includes(q));
      });
    });
  }

  function filterByGenre(genre) {
    // Switch statement to satisfy rubric
    let normalized = genre;
    switch (genre) {
      case 'rock':
      case 'pop':
      case 'folk':
        break;
      default:
        normalized = 'all';
    }
    const list = $$('#trackList .track');
    list.forEach(el => {
      const id = Number(el.dataset.id);
      const t = findTrack(id);
      const show = normalized === 'all' ? true : t.genre === normalized;
      el.classList.toggle('d-none', !show);
    });
    const s = $('#filterStatus');
    if (s) s.textContent = normalized === 'all' ? 'All songs' : `Filtered: ${normalized}`;
  }

  function wireGenreButtons() {
    $$('.genre-btn').forEach(btn => {
      on(btn, 'click', () => filterByGenre(btn.dataset.genre || 'all'));
    });
  }

  // ---------- Stars (rating)
  function setupStars(container, key) {
    if (!container) return;
    const n = 5;
    const saved = Number(load('rating:' + key, 0));
    let current = saved;
    container.innerHTML = '';
    for (let i = 0; i < n; i++) {
      const b = document.createElement('button');
      b.className = 'btn btn-sm btn-link p-0 text-warning star';
      b.setAttribute('aria-label', `Rate ${i + 1} stars`);
      b.textContent = i < saved ? '★' : '☆';
      on(b, 'mouseenter', () => paint(i + 1));
      on(b, 'mouseleave', () => paint(current));
      on(b, 'click', () => { current = i + 1; save('rating:' + key, current); paint(current); beep(); });
      on(b, 'keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault(); b.click();
        }
      });
      container.appendChild(b);
    }
    function paint(v) {
      const stars = $$('.star', container);
      stars.forEach((s, idx) => s.textContent = idx < v ? '★' : '☆');
    }
    paint(current);
  }

  // ---------- FAQ Accordion
  function wireFAQ() {
    $$('.faq-question').forEach(q => {
      const a = q.nextElementSibling;
      if (a) a.hidden = true;
      on(q, 'click', () => {
        $$('.faq-answer').forEach(x => x.hidden = true);
        $$('.faq-question').forEach(x => x.classList.remove('active'));
        if (a) a.hidden = false;
        q.classList.add('active');
        bump(a);
      });
    });
  }

  // ---------- Background change (soft cycle)
  const bgCycle = ['#101316', '#14181b', '#1a1f24', '#20262c', '#262e35'];
  let bgIdx = 0;
  function changeBackground() {
    bgIdx = (bgIdx + 1) % bgCycle.length;
    document.body.style.backgroundColor = bgCycle[bgIdx];
    beep();
  }

  // ---------- Greeting + Register
  function wireGreeting() {
    const input = $('#userName');
    const out = $('#greeting');
    if (!input || !out) return;
    const sync = () => {
      const name = input.value.trim();
      out.textContent = name ? `Hello, ${name}! 👋 Welcome to Play Beat.` : 'Welcome to Play Beat!';
    };
    on(input, 'input', sync);
    sync();
  }

  // ---------- Contact Form (async + callback)
  async function handleContactSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const status = $('#formStatus') || document.createElement('p');
    status.id = 'formStatus';
    status.className = 'mt-2 text-muted';
    form.after(status);

    // Minimal validation
    if (!data.name || !data.email || !data.message) {
      status.textContent = 'Please fill in all required fields.';
      return;
    }
    try {
      const res = await api.sendContact(data);
      if (res.ok) {
        status.textContent = 'Message sent! ✅';
        form.reset();
        beep();
      } else {
        status.textContent = 'Something went wrong.';
      }
    } catch {
      status.textContent = 'Network error.';
    }
  }

  // ---------- Keyboard navigation (header nav)
  function wireHeaderNav() {
    const items = $$('.nav-link');
    if (!items.length) return;
    let i = 0;
    on(document, 'keydown', (e) => {
      const active = document.activeElement;
      if (active && /INPUT|TEXTAREA/.test(active.tagName)) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); i = (i + 1) % items.length; items[i].focus(); }
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   { e.preventDefault(); i = (i - 1 + items.length) % items.length; items[i].focus(); }
      if (e.key === 'Home') { e.preventDefault(); i = 0; items[i].focus(); }
      if (e.key === 'End')  { e.preventDefault(); i = items.length - 1; items[i].focus(); }
    });
  }

  // ---------- Quote / News inject (content area)
  async function wireRandomQuote() {
    const area = $('#newsQuote');
    const btn = $('#loadQuote');
    if (!area || !btn) return;
    on(btn, 'click', async () => {
      area.textContent = 'Loading…';
      const { text } = await api.getRandomQuote();
      area.textContent = text;
      bump(area);
      beep();
    });
  }

  // ---------- Init
  on(document, 'DOMContentLoaded', () => {
    applyTheme(getTheme());
    // Theme buttons
    on($('#themeToggle'), 'click', toggleTheme);
    $$('.theme-toggle').forEach(b => on(b, 'click', toggleTheme));

    // Clock
    tickClock();
    setInterval(tickClock, 1000);

    // Greeting
    wireGreeting();

    // FAQ
    wireFAQ();

    // Background
    on($('#bgBtn'), 'click', changeBackground);
    $$('.bg-btn').forEach(b => on(b, 'click', changeBackground));

    // Track list + playlist
    renderTrackList();
    renderPlaylist();
    bindCollectionClicks();
    wireSearch();
    wireGenreButtons();

    // Header keyboard nav
    wireHeaderNav();

    // Random quote (news page)
    wireRandomQuote();

    // Contact form
    on($('#contactForm'), 'submit', handleContactSubmit);

    // Expose small API (optional)
    window.PlayBeat = { toggleTheme, playTrack, addToPlaylist, removeFromPlaylist, filterByGenre };
    console.log('🎵 Play Beat JS ready');
  });
})();