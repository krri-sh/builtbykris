// builtbykris.com — mockup card variant renderer

(function () {
  'use strict';

  const grid = document.getElementById('card-grid');
  const headline = document.getElementById('hero-headline');
  const bio = document.getElementById('hero-bio');
  const year = document.getElementById('year');
  const extensionCount = document.getElementById('extension-count');

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

  function readFlag(value, defaultValue) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
      if (['false', '0', 'no', 'off', ''].includes(normalized)) return false;
    }
    return defaultValue;
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

  function normalizeVideoUrl(url) {
    if (!url) return '';
    const trimmed = url.trim();

    // Google Drive /file/d/FILE_ID/view... links
    const fileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch) {
      return `https://drive.google.com/uc?export=download&id=${fileMatch[1]}`;
    }

    // Google Drive uc?id=FILE_ID links (already in download form)
    const ucMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (ucMatch && trimmed.includes('drive.google.com')) {
      return `https://drive.google.com/uc?export=download&id=${ucMatch[1]}`;
    }

    // Direct MP4 / stream URLs pass through
    return trimmed;
  }

  function showVideoError(originalUrl) {
    const video = document.getElementById('modal-video');
    const wrapper = video ? video.parentElement : null;
    if (!wrapper) return;

    let errorEl = wrapper.querySelector('.modal-video-error');
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.className = 'modal-video-error';
      wrapper.appendChild(errorEl);
    }

    errorEl.innerHTML = `
      <p>The video could not stream from this host.</p>
      <a href="${escapeHtml(originalUrl)}" target="_blank" rel="noopener noreferrer">Open original video link ↗</a>
    `;
    errorEl.classList.add('visible');
    video.style.display = 'none';
  }

  function clearVideoError() {
    const video = document.getElementById('modal-video');
    const wrapper = video ? video.parentElement : null;
    if (!wrapper) return;
    const errorEl = wrapper.querySelector('.modal-video-error');
    if (errorEl) errorEl.classList.remove('visible');
    if (video) video.style.display = '';
  }

  function openVideoModal(rawUrl, title) {
    const modal = document.getElementById('video-modal');
    const video = document.getElementById('modal-video');
    const titleEl = document.getElementById('modal-title');
    if (!modal || !video) return;

    clearVideoError();
    const url = normalizeVideoUrl(rawUrl);
    video.src = url;
    if (titleEl) titleEl.textContent = title || 'Demo video';
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    video.play().catch(() => {
      showVideoError(rawUrl);
    });
  }

  function closeVideoModal() {
    const modal = document.getElementById('video-modal');
    const video = document.getElementById('modal-video');
    if (!modal || !video) return;
    video.pause();
    video.src = '';
    clearVideoError();
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  function bindModal() {
    const modal = document.getElementById('video-modal');
    const close = document.getElementById('modal-close');
    const video = document.getElementById('modal-video');
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
    if (video) {
      video.addEventListener('error', () => {
        showVideoError(video.dataset.originalUrl || video.src);
      });
    }
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
      journeylens: {
        label: 'LIVE JOURNEY',
        input: '',
        resultLabel: '',
        button: 'Inspect journey',
        type: 'journey'
      },
      airlock: {
        label: 'SCAN',
        input: '',
        resultLabel: '',
        button: 'Sanitize',
        type: 'privacy'
      },
      clippilot: {
        label: 'JSON DETECTED',
        input: '{ "customer": "Ada", "plan": "pro" }',
        resultLabel: 'Clipboard',
        button: 'Beautify & copy',
        type: 'default'
      },
      devrecall: {
        label: 'TECHNICAL RECALL',
        input: 'Latest record per customer in Snowflake…',
        resultLabel: 'Reference',
        button: 'Recall syntax',
        type: 'default'
      },
      ritual: {
        label: 'BROWSER SOP',
        input: '',
        resultLabel: '',
        button: 'Export SOP',
        type: 'sop'
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

    if (theme.type === 'journey') {
      return `
        <div class="mockup-preview journey-preview" style="--card-accent:${color}" aria-hidden="true">
          <div class="preview-toolbar"><span></span><span></span><span></span></div>
          <div class="preview-label">${escapeHtml(theme.label)}</div>
          <div class="journey-summary">
            <span class="journey-record-dot"></span>
            <div><b>Invoice walkthrough</b><small>00:42 · 4 actions · 1 risk</small></div>
          </div>
          <div class="journey-step"><b>1</b><span>Open invoices<small>Unique URL · +0.0s</small></span><i class="journey-ok">OK</i></div>
          <div class="journey-step"><b>2</b><span>Click New invoice<small>Role + name · +1.8s</small></span><i class="journey-ok">OK</i></div>
          <div class="journey-step"><b>3</b><span>Assert total exists<small>Selector needs review</small></span><i class="journey-risk">RISK</i></div>
          <div class="preview-button">${escapeHtml(theme.button)}</div>
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

    if (theme.type === 'sop') {
      return `
        <div class="mockup-preview sop-preview" style="--card-accent:${color}" aria-hidden="true">
          <div class="preview-toolbar"><span></span><span></span><span></span></div>
          <div class="preview-label">${escapeHtml(theme.label)}</div>
          <div class="preview-sop-heading">Client onboarding</div>
          <div class="preview-sop-step"><b>1</b><span>Open workspace</span><i></i></div>
          <div class="preview-sop-step"><b>2</b><span>Invite the team</span><i></i></div>
          <div class="preview-sop-step"><b>3</b><span>Confirm access</span><i></i></div>
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

  function createCard(ext, latestNote) {
    const color = ext.accentColor && /^#[0-9A-Fa-f]{6}$/.test(ext.accentColor)
      ? ext.accentColor
      : '#6dd5ed';

    const front = document.createElement('div');
    front.className = 'mockup-face mockup-front';
    front.innerHTML = `
      <div class="mockup-card-glow" style="background:${color}"></div>
      ${readFlag(ext.hot, false) ? '<span class="hot-release">Trending now</span>' : ''}
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
          <p class="mockup-description">${escapeHtml(ext.fullDescription || ext.shortDescription || '')}</p>
        </div>

        <div class="mockup-back-section usecases-section">
          <h4>Use cases</h4>
          ${createUseCaseList(ext.useCases)}
        </div>

        <div class="mockup-back-section features-section">
          <h4>Highlights</h4>
          ${createFeatureList(ext.keyFeatures)}
        </div>
        ${latestNote ? `<a class="mockup-note-link" style="--card-accent:${color}" href="notes.html?note=${encodeURIComponent(latestNote.id)}">Latest field note <span aria-hidden="true">→</span></a>` : ''}
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
      const target = event.target.closest('a, button');
      if (target) return;
      toggle();
    });

    card.addEventListener('keydown', (event) => {
      if (event.target !== card) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggle();
      }
    });

    const frontVideo = front.querySelector('.video-action');
    if (frontVideo) {
      frontVideo.addEventListener('click', (event) => {
        event.stopPropagation();
        const video = document.getElementById('modal-video');
        if (video) video.dataset.originalUrl = frontVideo.dataset.video;
        openVideoModal(frontVideo.dataset.video, frontVideo.dataset.title);
      });
    }

    const backVideo = back.querySelector('.video-action');
    if (backVideo) {
      backVideo.addEventListener('click', (event) => {
        event.stopPropagation();
        const video = document.getElementById('modal-video');
        if (video) video.dataset.originalUrl = backVideo.dataset.video;
        openVideoModal(backVideo.dataset.video, backVideo.dataset.title);
      });
    }

    return card;
  }

  function renderExtensions(extensions, notes) {
    if (!grid) return;

    const visibleExtensions = Array.isArray(extensions)
      ? extensions.filter((ext) => ext && readFlag(ext.visible, true))
      : [];

    if (extensionCount) extensionCount.textContent = String(visibleExtensions.length).padStart(2, '0');

    if (visibleExtensions.length === 0) {
      grid.innerHTML = `
        <div class="error-state">
          <p>No extensions found. Check back soon.</p>
        </div>
      `;
      return;
    }

    grid.classList.add('mockup-card-grid');
    grid.innerHTML = '';
    const latestByProduct = new Map();
    (Array.isArray(notes) ? notes : []).filter((note) => note && note.visible !== false).sort((a, b) => Number(b.sequence || 0) - Number(a.sequence || 0)).forEach((note) => {
      if (!latestByProduct.has(note.productId)) latestByProduct.set(note.productId, note);
    });
    visibleExtensions.forEach((ext, index) => {
      const card = createCard(ext, latestByProduct.get(ext.id));
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

  async function loadData() {
    bindModal();
    try {
      const response = await fetch(`extensions.json?v=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Failed to load extension data (${response.status})`);
      }
      const data = await response.json();
      let notes = [];
      try {
        const notesResponse = await fetch(`notes.json?v=${Date.now()}`, { cache: 'no-store' });
        if (notesResponse.ok) notes = (await notesResponse.json()).notes || [];
      } catch (noteError) {
        console.warn('Built by Kris: field-note links are unavailable.', noteError);
      }
      renderProfile(data.profile);
      renderExtensions(data.extensions, notes);
    } catch (error) {
      console.error('Built by Kris: could not load extensions.json.', error);
      const message = window.location.protocol === 'file:'
        ? 'This page must be opened through a local web server so extensions.json can be loaded. Direct file viewing is blocked by browser security.'
        : 'Could not load extension details right now. Please refresh the page.';
      showError(message);
      if (headline) headline.textContent = 'Built by Kris';
    }
  }

  document.addEventListener('DOMContentLoaded', loadData);
})();
