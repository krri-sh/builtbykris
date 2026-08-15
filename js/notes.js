(function () {
  'use strict';

  const grid = document.getElementById('notes-grid');
  const filters = document.getElementById('notes-filters');
  const detail = document.getElementById('note-detail');
  const count = document.getElementById('notes-count');
  const error = document.getElementById('notes-error');
  let notes = [];
  let extensions = new Map();

  function escapeHtml(value) {
    return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function productFor(note) { return extensions.get(note.productId) || { name: note.productId, accentColor: '#7054d1', url: note.landingPageUrl }; }

  function trackedProductUrl(note) {
    try {
      const url = new URL(note.landingPageUrl || productFor(note).url, location.href);
      url.searchParams.set('utm_source', 'builtbykris');
      url.searchParams.set('utm_medium', 'field_note');
      url.searchParams.set('utm_campaign', 'field_notes');
      url.searchParams.set('utm_content', note.id);
      return url.href;
    } catch (_) { return note.landingPageUrl || productFor(note).url || '#'; }
  }

  function card(note) {
    const product = productFor(note);
    return `<article class="note-library-card" style="--note-color:${escapeHtml(product.accentColor || '#7054d1')}"><a class="note-library-image" href="notes.html?note=${encodeURIComponent(note.id)}"><img src="${escapeHtml(note.image)}" alt="${escapeHtml(note.imageAlt || '')}" loading="lazy" /></a><div><p class="note-library-meta"><span>${escapeHtml(note.category)}</span><span>${escapeHtml(product.name)}</span></p><h3><a href="notes.html?note=${encodeURIComponent(note.id)}">${escapeHtml(note.title)}</a></h3><p>${escapeHtml(note.excerpt)}</p><a class="field-note-read" href="notes.html?note=${encodeURIComponent(note.id)}">Read field note <span aria-hidden="true">→</span></a></div></article>`;
  }

  function renderGrid(category) {
    const selected = category || 'All';
    filters.querySelectorAll('button').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.category === selected)));
    const visible = selected === 'All' ? notes : notes.filter((note) => note.category === selected);
    grid.innerHTML = visible.map(card).join('') || '<p class="notes-loading">No notes in this category yet.</p>';
  }

  function renderDetail(note) {
    const product = productFor(note);
    document.title = `${note.title} — Built by Kris`;
    grid.hidden = true;
    filters.hidden = true;
    detail.hidden = false;
    detail.style.setProperty('--note-color', product.accentColor || '#7054d1');
    detail.innerHTML = `
      <a class="note-back" href="notes.html">← All field notes</a>
      <article class="note-article">
        <header><div><p class="note-detail-meta">${escapeHtml(note.category)} · ${escapeHtml(product.name)}</p><h1>${escapeHtml(note.title)}</h1><p class="note-detail-hook">${escapeHtml(note.hook)}</p></div><img src="${escapeHtml(note.image)}" alt="${escapeHtml(note.imageAlt || '')}" /></header>
        <div class="note-article-body">${(note.body || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}<p class="note-hashtags">${(note.hashtags || []).map((tag) => `#${escapeHtml(tag)}`).join(' ')}</p></div>
        <footer><div><span>Related product</span><strong>${escapeHtml(product.name)}</strong></div><div class="note-actions"><a class="btn btn-primary" href="${escapeHtml(trackedProductUrl(note))}" target="_blank" rel="noopener noreferrer">Explore ${escapeHtml(product.name)} ↗</a>${note.linkedinUrl ? `<a class="btn btn-ghost" href="${escapeHtml(note.linkedinUrl)}" target="_blank" rel="noopener noreferrer">Discuss on LinkedIn ↗</a>` : ''}</div></footer>
      </article>`;
  }

  async function load() {
    try {
      const stamp = Date.now();
      const [notesResponse, extensionsResponse] = await Promise.all([fetch(`notes.json?v=${stamp}`, { cache: 'no-store' }), fetch(`extensions.json?v=${stamp}`, { cache: 'no-store' })]);
      if (!notesResponse.ok || !extensionsResponse.ok) throw new Error('Notes could not be loaded.');
      const notesData = await notesResponse.json();
      const extensionsData = await extensionsResponse.json();
      extensions = new Map((extensionsData.extensions || []).map((item) => [item.id, item]));
      notes = (notesData.notes || []).filter((note) => note && note.visible !== false).sort((a, b) => Number(b.sequence || 0) - Number(a.sequence || 0));
      count.textContent = String(notes.length).padStart(2, '0');
      const requested = new URLSearchParams(location.search).get('note');
      const selectedNote = notes.find((note) => note.id === requested);
      if (selectedNote) { renderDetail(selectedNote); return; }
      const categories = ['All', ...new Set(notes.map((note) => note.category))];
      filters.innerHTML = categories.map((category, index) => `<button type="button" data-category="${escapeHtml(category)}" aria-pressed="${index === 0}">${escapeHtml(category)}</button>`).join('');
      filters.addEventListener('click', (event) => { const button = event.target.closest('button'); if (button) renderGrid(button.dataset.category); });
      renderGrid('All');
    } catch (cause) {
      console.error(cause);
      grid.innerHTML = '';
      error.hidden = false;
      error.textContent = location.protocol === 'file:' ? 'Open this site through a local web server so notes.json can load.' : 'Field notes could not be loaded. Please refresh the page.';
    }
  }

  document.addEventListener('DOMContentLoaded', load);
})();
