// builtbykris.com — mockup card variant renderer

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
    return `        <ul class="mockup-features" role="list">${items}        </ul>`;
  }

  function createUseCaseList(useCases) {
    if (!Array.isArray(useCases) || useCases.length === 0) return '';
    const items = useCases
      .map((item) => `          <li>${escapeHtml(item)}</li>`)
      .join('');
    return `        <ul class="mockup-usecases" role="list">${items}        </ul>`;
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
      ? `<button type="button" class="mockup-icon-action video-action" data-video="${escapeHtml(ext.videoUrl)}" data-title="${escapeHtml(ext.name)} demo" aria-label="Play ${escapeHtml(ext.name)} demo video" onclick="event.stopPropagation()" style="--card-accent:${color}">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </button>`
      : '';

    return `
      <div class="mockup-actions" onclick="event.stopPropagation()">
        <a class="mockup-icon-action site-action" href="${escapeHtml(ext.url)}" target="_blank" rel="noopener noreferrer" aria-label="Visit ${escapeHtml(ext.name)} website" style="--card-accent:${color}">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        </a>
        ${videoButton}
      </div>
    `;
  }

  function renderMockup(ext) {
    const color = ext.accentColor && /^#[0-9A-Fa-f]{6}$/.test(ext.accentColor)
      ? ext.accentColor
      : '#6dd5ed';

    const defaults = {
      label: 'YOUR IDEA',
      input: 'Describe what you want to do…',
      resultLabel: 'Result',
      button: 'Run',
      type: 'default'
    };

    const themes = {
      socialpostforge: {
        label: 'ROUGH NOTE',
        input: 'Turn a rough thought into a LinkedIn post…',
        resultLabel: 'Post',
        button: 'Forge post ✦',
        type: 'default'
      },
      execpilot: {
        label: 'DRAFT',
        input: 'Need to say no to a partnership politely…',
        resultLabel: 'Message',
        button: 'Refine tone ✦',
        type: 'default'
      },
      loompath: {
        label: 'WORKFLOW',
        input: '',
        resultLabel: '',
        button: 'Run workflow',
        type: 'workflow'
      },
      contractguardian: {
        label: 'API LOG',
        input: '',
        resultLabel: '',
        button: 'Compare baseline',
        type: 'api'
      },
      airlock: {
        label: 'SCAN',
        input: '',
        resultLabel: '',
        button: 'Sanitize',
        type: 'privacy'
      }
    };

    const theme = themes[ext.id] || defaults;

    if (theme.type === 'workflow') {
      return `
        <div class="mockup-preview workflow-preview" style="--card-accent:${color}" aria-hidden="true">
          <div class="preview-toolbar"><span></span><span></span><span></span></div>
          <div class="preview-label">${escapeHtml(theme.label)}</div>
          <div class="preview-node">Open dashboard</div>
          <div class="preview-connector"></div>
          <div class="preview-node">Scrape rows</div>
          <div class="preview-connector"></div>
          <div class="preview-node">Send to webhook</div>
          <div class="preview-button" style="background:${color}">${escapeHtml(theme.button)}</div>
        </div>
      `;
    }

    if (theme.type === 'api') {
      return `
        <div class="mockup-preview api-preview" style="--card-accent:${color}" aria-hidden="true">
          <div class="preview-toolbar"><span></span><span></span><span></span></div>
          <div class="preview-label">${escapeHtml(theme.label)}</div>
          <div class="preview-row">
            <span class="preview-method" style="background:${color}">GET</span>
            <span class="preview-path">/api/v1/items</span>
            <span class="preview-status">200</span>
          </div>
          <div class="preview-row">
            <span class="preview-method" style="background:#ef4444">POST</span>
            <span class="preview-path">/api/v1/order</span>
            <span class="preview-status" style="color:#ef4444">DRIFT</span>
          </div>
          <div class="preview-row">
            <span class="preview-method" style="background:${color}">GET</span>
            <span class="preview-path">/api/v1/user</span>
            <span class="preview-status">200</span>
          </div>
          <div class="preview-button" style="background:${color}">${escapeHtml(theme.button)}</div>
        </div>
      `;
    }

    if (theme.type === 'privacy') {
      return `
        <div class="mockup-preview privacy-preview" style="--card-accent:${color}" aria-hidden="true">
          <div class="preview-toolbar"><span></span><span></span><span></span></div>
          <div class="preview-label">${escapeHtml(theme.label)}</div>
          <div class="preview-scan-row">
            <span class="preview-badge preview-safe">OK</span>
            <span>Public marketing copy</span>
          </div>
          <div class="preview-scan-row">
            <span class="preview-badge">API KEY</span>
            <span>sk-abc123…xyz</span>
          </div>
          <div class="preview-scan-row">
            <span class="preview-badge preview-safe">OK</span>
            <span>Generic error log</span>
          </div>
          <div class="preview-button" style="background:${color}">${escapeHtml(theme.button)}</div>
        </div>
      `;
    }

    return `
      <div class="mockup-preview" style="--card-accent:${color}" aria-hidden="true">
        <div class="preview-toolbar"><span></span><span></span><span></span></div>
        <div class="preview-label">${escapeHtml(theme.label)}</div>
        <div class="preview-input">${escapeHtml(theme.input)}</div>
        <div class="preview-result">
          <div class="preview-avatar">K</div>
          <div class="preview-lines">
            <i style="background:${color}33"></i>
            <i></i>
            <i></i>
            <i></i>
          </div>
        </div>
        <div class="preview-button" style="background:${color}">${escapeHtml(theme.button)}</div>
      </div>
    `;
  }

  function createCard(ext) {
    const color = ext.accentColor && /^#[0-9A-Fa-f]{6}$/.test(ext.accentColor)
      ? ext.accentColor
      : '#6dd5ed';

    const front = document.createElement('div');
    front.className = 'mockup-face mockup-front';
    front.innerHTML = `
      <div class="mockup-card-glow" style="background:${color}"></div>
      ${createIconActions(ext)}
      <div class="mockup-front-content">
        <div class="mockup-front-text">
          <div class="mockup-card-icon" aria-hidden="true" style="color:${color};border-color:${color}33">${escapeHtml(ext.icon || '✨')}</div>
          <h3>${escapeHtml(ext.name)}</h3>
          <p class="mockup-tagline">${escapeHtml(ext.tagline || '')}</p>
          <blockquote class="mockup-painpoint" style="--card-accent:${color}">“${escapeHtml(ext.painpoint || ext.shortDescription || '')}”</blockquote>
        </div>
        ${renderMockup(ext)}
      </div>
      <span class="mockup-front-hint">Learn more</span>
    `;

    const back = document.createElement('div');
    back.className = 'mockup-face mockup-back';
    back.innerHTML = `
      <div class="mockup-card-glow" style="background:${color}"></div>
      ${createIconActions(ext)}
      <div class="mockup-back-content">
        <div class="mockup-back-section">
          <h4>What it does</h4>
          <p class="mockup-description">${escapeHtml(ext.fullDescription || '')}</p>
        </div>

        <div class="mockup-back-section usecases-section">
          <h4>Use cases</h4>
          ${createUseCaseList(ext.useCases)}
        </div>

        <div class="mockup-back-section features-section">
          <h4>Highlights</h4>
          ${createFeatureList(ext.keyFeatures)}
        </div>
      </div>
    `;

    const inner = document.createElement('div');
    inner.className = 'mockup-card-inner';
    inner.appendChild(front);
    inner.appendChild(back);

    const card = document.createElement('article');
    card.className = 'mockup-card';
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
      const target = event.target.closest('.mockup-icon-action');
      if (target) return;
      toggle();
    });

    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggle();
      }
    });

    const frontVideo = front.querySelector('.video-action');
    if (frontVideo) {
      frontVideo.addEventListener('click', (event) => {
        event.stopPropagation();
        openVideoModal(frontVideo.dataset.video, frontVideo.dataset.title);
      });
    }

    const backVideo = back.querySelector('.video-action');
    if (backVideo) {
      backVideo.addEventListener('click', (event) => {
        event.stopPropagation();
        openVideoModal(backVideo.dataset.video, backVideo.dataset.title);
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

    grid.classList.add('mockup-card-grid');
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
