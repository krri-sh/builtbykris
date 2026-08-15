(function () {
  'use strict';

  const tabs = document.getElementById('usecase-tabs');
  const panel = document.getElementById('usecase-panel');
  const error = document.getElementById('usecase-error');
  const productCount = document.getElementById('usecase-product-count');
  const scenarioCount = document.getElementById('usecase-scenario-count');
  const selectorCount = document.getElementById('selector-count');

  function escapeHtml(value) {
    return String(value ?? '')
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

  function renderPanel(extension, scenarios) {
    const color = /^#[0-9a-f]{6}$/i.test(extension.accentColor || '') ? extension.accentColor : '#7054d1';
    panel.style.setProperty('--active-color', color);
    panel.innerHTML = `
      <header class="usecase-panel-header">
        <div class="usecase-product-mark" aria-hidden="true">${escapeHtml(extension.name.slice(0, 2).toUpperCase())}</div>
        <div><p>Use cases for</p><h2>${escapeHtml(extension.name)}</h2><span>${escapeHtml(extension.tagline || '')}</span></div>
        <a href="${escapeHtml(extension.url)}" target="_blank" rel="noopener noreferrer">Visit product <span aria-hidden="true">↗</span></a>
      </header>
      <div class="usecase-scenario-grid">
        ${scenarios.map((item, index) => `
          <article class="usecase-scenario">
            <div class="scenario-number">${String(index + 1).padStart(2, '0')}</div>
            <div class="scenario-title"><p>${escapeHtml(item.audience)}</p><h3>${escapeHtml(item.title)}</h3></div>
            <dl>
              <div><dt>Situation</dt><dd>${escapeHtml(item.situation)}</dd></div>
              <div><dt>How it helps</dt><dd>${escapeHtml(item.workflow)}</dd></div>
              <div><dt>Outcome</dt><dd>${escapeHtml(item.outcome)}</dd></div>
            </dl>
          </article>
        `).join('')}
      </div>
    `;
  }

  function selectExtension(id, extensions, usecases, focusTab) {
    const extension = extensions.find((item) => item.id === id);
    if (!extension) return;
    const scenarios = Array.isArray(usecases[id]) ? usecases[id] : [];
    tabs.querySelectorAll('[role="tab"]').forEach((button) => {
      const selected = button.dataset.id === id;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
      button.classList.toggle('active', selected);
      if (selected && focusTab) button.focus();
    });
    renderPanel(extension, scenarios);
    history.replaceState(null, '', `#${id}`);
  }

  function bindKeyboard(extensions, usecases) {
    tabs.addEventListener('keydown', (event) => {
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const buttons = [...tabs.querySelectorAll('[role="tab"]')];
      const current = buttons.indexOf(document.activeElement);
      let next = current;
      if (event.key === 'ArrowDown') next = (current + 1) % buttons.length;
      if (event.key === 'ArrowUp') next = (current - 1 + buttons.length) % buttons.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = buttons.length - 1;
      selectExtension(buttons[next].dataset.id, extensions, usecases, true);
    });
  }

  async function load() {
    try {
      const stamp = Date.now();
      const [extensionResponse, usecaseResponse] = await Promise.all([
        fetch(`extensions.json?v=${stamp}`, { cache: 'no-store' }),
        fetch(`usecases.json?v=${stamp}`, { cache: 'no-store' })
      ]);
      if (!extensionResponse.ok || !usecaseResponse.ok) throw new Error('Use-case data could not be loaded.');
      const extensionData = await extensionResponse.json();
      const usecases = await usecaseResponse.json();
      const extensions = (extensionData.extensions || []).filter((item) => item && readFlag(item.visible, true) && Array.isArray(usecases[item.id]));
      if (!extensions.length) throw new Error('No visible extension use cases are available.');

      const totalScenarios = extensions.reduce((total, item) => total + usecases[item.id].length, 0);
      productCount.textContent = String(extensions.length).padStart(2, '0');
      scenarioCount.textContent = String(totalScenarios).padStart(2, '0');
      selectorCount.textContent = `${extensions.length} products`;
      tabs.innerHTML = extensions.map((item, index) => {
        const color = /^#[0-9a-f]{6}$/i.test(item.accentColor || '') ? item.accentColor : '#7054d1';
        return `<button type="button" role="tab" id="tab-${escapeHtml(item.id)}" aria-controls="usecase-panel" aria-selected="${index === 0}" tabindex="${index === 0 ? 0 : -1}" data-id="${escapeHtml(item.id)}" style="--item-color:${color}"><span class="selector-mark">${escapeHtml(item.name.slice(0, 2).toUpperCase())}</span><span><b>${escapeHtml(item.name)}</b><small>${usecases[item.id].length} scenarios</small></span><i aria-hidden="true">›</i></button>`;
      }).join('');
      tabs.addEventListener('click', (event) => {
        const button = event.target.closest('[role="tab"]');
        if (button) selectExtension(button.dataset.id, extensions, usecases, false);
      });
      bindKeyboard(extensions, usecases);
      const requested = location.hash.slice(1);
      const initial = extensions.some((item) => item.id === requested) ? requested : extensions[0].id;
      selectExtension(initial, extensions, usecases, false);
    } catch (cause) {
      console.error(cause);
      panel.innerHTML = '';
      error.hidden = false;
      error.textContent = location.protocol === 'file:'
        ? 'Open this site through a local web server so its JSON data can load. Direct file viewing is blocked by browser security.'
        : 'The use-case library could not be loaded. Please refresh the page.';
    }
  }

  document.addEventListener('DOMContentLoaded', load);
})();
