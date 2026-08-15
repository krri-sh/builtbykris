(function () {
  'use strict';

  const grid = document.getElementById('notes-home-grid');
  const controls = document.getElementById('notes-rotation-controls');
  const previous = document.getElementById('notes-prev');
  const next = document.getElementById('notes-next');
  const pause = document.getElementById('notes-pause');
  const position = document.getElementById('notes-position');
  if (!grid) return;

  let notes = [];
  let index = 0;
  let pageSize = 3;
  let rotationMs = 8000;
  let timer = null;
  let paused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function escapeHtml(value) {
    return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function visibleWindow() {
    const count = Math.min(pageSize, notes.length);
    return Array.from({ length: count }, (_, offset) => notes[(index + offset) % notes.length]);
  }

  function render() {
    const current = visibleWindow();
    grid.innerHTML = current.map((note) => `
      <article class="field-note-card">
        <a class="field-note-image" href="notes.html?note=${encodeURIComponent(note.id)}" aria-label="Read ${escapeHtml(note.title)}"><img src="${escapeHtml(note.image)}" alt="${escapeHtml(note.imageAlt || '')}" loading="lazy" /></a>
        <div class="field-note-copy"><div class="field-note-meta"><span>${escapeHtml(note.category)}</span><span>${escapeHtml(note.productName)}</span></div><h3><a href="notes.html?note=${encodeURIComponent(note.id)}">${escapeHtml(note.title)}</a></h3><p>${escapeHtml(note.excerpt)}</p><a class="field-note-read" href="notes.html?note=${encodeURIComponent(note.id)}">Read the note <span aria-hidden="true">→</span></a></div>
      </article>
    `).join('');
    if (position) position.textContent = `View ${index + 1} of ${notes.length}`;
  }

  function move(direction) {
    if (!notes.length) return;
    index = (index + direction + notes.length) % notes.length;
    render();
    restart();
  }

  function stop() {
    if (timer) window.clearInterval(timer);
    timer = null;
  }

  function start() {
    stop();
    if (!paused && notes.length > pageSize) timer = window.setInterval(() => move(1), rotationMs);
  }

  function restart() { if (!paused) start(); }

  function updatePause() {
    if (!pause) return;
    pause.setAttribute('aria-pressed', String(paused));
    pause.textContent = paused ? 'Resume rotation' : 'Pause rotation';
  }

  async function load() {
    try {
      const stamp = Date.now();
      const [notesResponse, extensionsResponse] = await Promise.all([
        fetch(`notes.json?v=${stamp}`, { cache: 'no-store' }),
        fetch(`extensions.json?v=${stamp}`, { cache: 'no-store' })
      ]);
      if (!notesResponse.ok || !extensionsResponse.ok) throw new Error('Field notes could not be loaded.');
      const notesData = await notesResponse.json();
      const extensionData = await extensionsResponse.json();
      const names = new Map((extensionData.extensions || []).map((item) => [item.id, item.name]));
      notes = (notesData.notes || []).filter((note) => note && note.visible !== false && note.featured !== false).sort((a, b) => Number(b.sequence || 0) - Number(a.sequence || 0)).map((note) => ({ ...note, productName: names.get(note.productId) || note.productId }));
      pageSize = Math.max(1, Number(notesData.settings?.homepageCount) || 3);
      rotationMs = Math.max(4000, (Number(notesData.settings?.rotationSeconds) || 8) * 1000);
      if (!notes.length) throw new Error('No field notes are visible.');
      controls.hidden = notes.length <= pageSize;
      render();
      updatePause();
      start();
    } catch (cause) {
      console.error(cause);
      grid.innerHTML = `<p class="notes-error">${location.protocol === 'file:' ? 'Open this site through a local web server so notes.json can load.' : 'Field notes could not be loaded right now.'}</p>`;
    }
  }

  previous?.addEventListener('click', () => move(-1));
  next?.addEventListener('click', () => move(1));
  pause?.addEventListener('click', () => { paused = !paused; updatePause(); paused ? stop() : start(); });
  document.addEventListener('visibilitychange', () => { document.hidden ? stop() : start(); });
  grid.addEventListener('mouseenter', stop);
  grid.addEventListener('mouseleave', start);
  grid.addEventListener('focusin', stop);
  grid.addEventListener('focusout', start);
  document.addEventListener('DOMContentLoaded', load);
})();
