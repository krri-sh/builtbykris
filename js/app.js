// builtbykris.com — render extension cards from JSON and handle flip interactions

(function () {
  'use strict';

  const grid = document.getElementById('card-grid');
  const headline = document.getElementById('hero-headline');
  const bio = document.getElementById('hero-bio');
  const year = document.getElementById('year');

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  function escapeHtml(str) {
    if (typeof str !== 'string') return String(str);
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderProfile(profile) {
    if (!headline || !bio || !profile) return;
    headline.textContent = profile.headline || 'Chrome extensions by Kris';
    bio.textContent = profile.bio || '';
  }

  function createFeatureList(features) {
    if (!Array.isArray(features) || features.length === 0) return '';
    const items = features
      .map((feature) => `          <li>${escapeHtml(feature)}</li>`)
      .join('');
    return `        <ul class="card-features" role="list">${items}        </ul>`;
  }

  function createUseCaseList(useCases) {
    if (!Array.isArray(useCases) || useCases.length === 0) return '';
    const items = useCases
      .map((item) => `          <li>${escapeHtml(item)}</li>`)
      .join('');
    return `        <ul class="card-usecases" role="list">${items}        </ul>`;
  }

  function openVideoModal(url, title) {
    const modal = document.getElementById('video-modal');
    const video = document.getElementById('modal-video');
    const titleEl = document.getElementById('modal-title');
    if (!modal || !video) return;
    video.src = url;
    if (titleEl) titleEl.textContent = title || 'Demo video';
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    video.play().catch(() => {});
  }

  function closeVideoModal() {
    const modal = document.getElementById('video-modal');
    const video = document.getElementById('modal-video');
    if (!modal || !video) return;
    video.pause();
    video.src = '';
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  function bindModal() {
    const modal = document.getElementById('video-modal');
    const close = document.getElementById('modal-close');
    if (!modal) return;
    if (close) {
      close.addEventListener('click', closeVideoModal);
    }
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeVideoModal();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modal.classList.contains('open')) {
        closeVideoModal();
      }
    });
  }

  function createIconActions(ext) {
    const color = ext.accentColor && /^#[0-9A-Fa-f]{6}$/.test(ext.accentColor)
      ? ext.accentColor
      : '#6dd5ed';

    const hasVideo = ext.videoUrl && ext.videoUrl.trim().length > 0;
    const videoButton = hasVideo
      ? `<button type="button" class="icon-action video-action" data-video="${escapeHtml(ext.videoUrl)}" data-title="${escapeHtml(ext.name)} demo" aria-label="Play ${escapeHtml(ext.name)} demo video" onclick="event.stopPropagation()" style="--card-accent:${color}">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </button>`
      : '';

    return `
      <div class="card-actions" onclick="event.stopPropagation()">
        <a class="icon-action site-action" href="${escapeHtml(ext.url)}" target="_blank" rel="noopener noreferrer" aria-label="Visit ${escapeHtml(ext.name)} website" style="--card-accent:${color}">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        </a>
        ${videoButton}
      </div>
    `;
  }

  function createCard(ext) {
    const color = ext.accentColor && /^#[0-9A-Fa-f]{6}$/.test(ext.accentColor)
      ? ext.accentColor
      : '#6dd5ed';

    const front = document.createElement('div');
    front.className = 'card-face card-front';
    front.innerHTML = `
      <div class="card-glow" style="background:${color}"></div>
      ${createIconActions(ext)}
      <div class="card-front-main">
        <div class="card-icon" aria-hidden="true" style="color:${color};border-color:${color}33">${escapeHtml(ext.icon || '✨')}</div>
        <h3>${escapeHtml(ext.name)}</h3>
        <p class="card-tagline">${escapeHtml(ext.tagline || '')}</p>
      </div>
      <div class="card-front-bottom">
        <blockquote class="card-painpoint">“${escapeHtml(ext.painpoint || ext.shortDescription || '')}”</blockquote>
        <span class="card-hint">Learn more</span>
      </div>
    `;

    const back = document.createElement('div');
    back.className = 'card-face card-back';
    back.innerHTML = `
      <div class="card-glow" style="background:${color}"></div>
      ${createIconActions(ext)}
      <div class="card-back-content">
        <div class="card-back-section">
          <h4>What it does</h4>
          <p class="card-description">${escapeHtml(ext.fullDescription || '')}</p>
        </div>

        <div class="card-back-section usecases-section">
          <h4>Use cases</h4>
          ${createUseCaseList(ext.useCases)}
        </div>

        <div class="card-back-section features-section">
          <h4>Highlights</h4>
          ${createFeatureList(ext.keyFeatures)}
        </div>
      </div>
    `;

    const inner = document.createElement('div');
    inner.className = 'card-inner';
    inner.appendChild(front);
    inner.appendChild(back);

    const card = document.createElement('article');
    card.className = 'flip-card';
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Flip card for ${ext.name}`);
    card.appendChild(inner);

    function toggle() {
      card.classList.toggle('flipped');
      const isFlipped = card.classList.contains('flipped');
      card.setAttribute('aria-pressed', String(isFlipped));
    }

    card.addEventListener('click', (event) => {
      const target = event.target.closest('.icon-action');
      if (target) return;
      toggle();
    });

    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggle();
      }
    });

    const videoButton = back.querySelector('.video-action');
    if (videoButton) {
      videoButton.addEventListener('click', (event) => {
        event.stopPropagation();
        openVideoModal(videoButton.dataset.video, videoButton.dataset.title);
      });
    }

    const frontVideoButton = front.querySelector('.video-action');
    if (frontVideoButton) {
      frontVideoButton.addEventListener('click', (event) => {
        event.stopPropagation();
        openVideoModal(frontVideoButton.dataset.video, frontVideoButton.dataset.title);
      });
    }

    return card;
  }

  function renderExtensions(extensions) {
    if (!grid) return;

    if (!Array.isArray(extensions) || extensions.length === 0) {
      grid.innerHTML = `
        <div class="error-state">
          <p>No extensions found. Check back soon.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = '';
    extensions.forEach((ext, index) => {
      const card = createCard(ext);
      card.style.animationDelay = `${index * 90}ms`;
      grid.appendChild(card);
    });
  }

  function showError(message) {
    if (!grid) return;
    grid.innerHTML = `
      <div class="error-state">
        <p>${escapeHtml(message)}</p>
        <p style="font-size:0.85rem;margin-top:0.5rem;">Please ensure extensions.json is available and try again.</p>
      </div>
    `;
  }

  function getInlineFallback() {
    const el = document.getElementById('extensions-data');
    if (!el) return null;
    try {
      return JSON.parse(el.textContent);
    } catch (e) {
      console.error('Built by Kris: inline JSON fallback is invalid', e);
      return null;
    }
  }

  async function loadData() {
    bindModal();
    try {
      const response = await fetch('extensions.json');
      if (!response.ok) {
        throw new Error(`Failed to load extension data (${response.status})`);
      }
      const data = await response.json();
      renderProfile(data.profile);
      renderExtensions(data.extensions);
    } catch (error) {
      console.warn('Built by Kris: could not fetch extensions.json; using inline fallback.', error);
      const fallback = getInlineFallback();
      if (fallback) {
        renderProfile(fallback.profile);
        renderExtensions(fallback.extensions);
      } else {
        showError('Could not load extension details right now.');
        if (headline) headline.textContent = 'Built by Kris';
      }
    }
  }

  document.addEventListener('DOMContentLoaded', loadData);
})();
