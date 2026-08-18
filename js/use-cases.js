(function () {
  'use strict';

  const tabs = document.getElementById('usecase-tabs');
  const panel = document.getElementById('usecase-panel');
  const error = document.getElementById('usecase-error');
  const productCount = document.getElementById('usecase-product-count');
  const scenarioCount = document.getElementById('usecase-scenario-count');
  const selectorCount = document.getElementById('selector-count');

  const funnyMessages = {
    socialpostforge: [
      'Because “we fixed three bugs and moved a button” deserves a better launch story.',
      'One idea, three platforms, and only one mild identity crisis.',
      'Your authentic founder voice—now with 90% less staring at a blinking cursor.',
      'Turn “the customer was happy” into proof that does not sound like your mum wrote it.',
      'More campaign variants, fewer meetings called “Quick brainstorm v7 FINAL.”',
      'The designer finished yesterday. The caption can finally stop holding everyone hostage.'
    ],
    execpilot: [
      'Professional translation: “No” can, in fact, contain more than two letters.',
      'Deliver the feedback without accidentally creating a new company-wide Slack channel.',
      'Cold outreach that sounds warm—without pretending you loved their 2017 podcast episode.',
      'Good news, bad news, numbers, ask. Your investors may even read to the bottom.',
      'Fast reply, calm tone, zero evidence that you typed it while boarding a flight.',
      'A decision memo: because “let’s circle back” is not technically a strategy.'
    ],
    loompath: [
      'Your browser can do the repetitive clicking. It has no dreams to crush.',
      'Refresh, squint, refresh, squint—the exciting career path nobody requested.',
      'Three hundred CSV rows walk into a portal. None of them need your weekend.',
      'A selector broke because someone moved a div. The automation remains emotionally stable.',
      'When the legacy portal has no API, we politely build it a side door.',
      'If this, then that, unless the other thing—finally, your process chart can become executable.'
    ],
    contractguardian: [
      'The undocumented API was documented all along. It was just hiding in plain network traffic.',
      'The schema changed silently. ContractGuardian chose not to suffer silently.',
      'Frontend says backend. Backend says frontend. The request log says everybody take a seat.',
      'Production-shaped fixtures, minus the production-shaped privacy incident.',
      'Future maintainers would like to thank present-you for leaving actual clues.',
      'You already caught the request. Now make it work somewhere more useful than DevTools.'
    ],
    journeylens: [
      'Checkout worked yesterday—a sentence responsible for several excellent postmortems.',
      '“It just stopped working” now comes with screenshots, timings, steps, and significantly less mystery.',
      'Your critical process has seventeen clicks and one brave undocumented dropdown.',
      'From real journey to Playwright, skipping the traditional copying-things-wrong phase.',
      'Training material made from reality, not from Dave remembering how the screen looked last quarter.',
      'The redesign is faster, except for the three extra clicks nobody noticed until now.'
    ],
    airlock: [
      'Your log needs technical support. Your API key does not need a public adventure.',
      'Please remove the password before the ticket becomes a security training example.',
      'The prompt is excellent. The confidential client list is an unnecessary plot twist.',
      'If the project codename leaves the browser, it is no longer a very good codename.',
      'Realistic sample data, starring completely fictional people with absolutely no lawyers.',
      'One final scan between “looks fine” and “why is Security calling me?”'
    ],
    clippilot: [
      'JSON is human-readable, assuming the human has unlimited horizontal scrolling.',
      'Convert the format without visiting a website designed in 2009 with fourteen ad slots.',
      'Decode the token. Clean the URL. Explain the cURL. Pretend this was always the plan.',
      'Clipboard history is useful. Clipboard history containing secrets is a future documentary.',
      'Ask the local model. Your clipboard can keep its travel plans cancelled.',
      'Because copying the same clever transformation twice is already one time too many.'
    ],
    devrecall: [
      'You remembered the concept perfectly. The semicolon remains personally offended.',
      'That brilliant snippet from six months ago is no longer living in “final-final-notes-2.txt.”',
      'The error has returned. This time you brought receipts.',
      'The selector matches twelve elements. Eleven of them are apparently decorative surprises.',
      'If you search it for the fourth time, congratulations: it is now a curriculum.',
      'Team knowledge, now available somewhere other than one person’s browser bookmarks.'
    ],
    morphogrid: [
      'The workbook begins on row eight because apparently rows one through seven needed a dramatic opening sequence.',
      'One CRM export, six spellings of the same territory, and a phone column exploring abstract expressionism.',
      'The vendor called it a standard format. They did not specify whose standard, or from which century.',
      'The meeting starts in ten minutes. The survey currently says “Great”, “ great ”, and “GREAT!!!” are different insights.',
      'Audit evidence should contain a trail. “I dragged the formula down and hoped” is not the preferred trail.',
      'JSON became a table, received some manners, and returned to the API pretending nothing happened.'
    ]
  };

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
          <article class="usecase-scenario" tabindex="0" role="button" aria-pressed="false" aria-label="Flip ${escapeHtml(item.title)} use case">
            <div class="scenario-card-inner">
              <div class="scenario-face scenario-front">
                <div class="scenario-number">${String(index + 1).padStart(2, '0')}</div>
                <div class="scenario-title"><p>${escapeHtml(item.audience)}</p><h3>${escapeHtml(item.title)}</h3></div>
                <dl>
                  <div><dt>Situation</dt><dd>${escapeHtml(item.situation)}</dd></div>
                  <div><dt>How it helps</dt><dd>${escapeHtml(item.workflow)}</dd></div>
                  <div><dt>Outcome</dt><dd>${escapeHtml(item.outcome)}</dd></div>
                </dl>
                <span class="scenario-flip-hint">The honest version <i aria-hidden="true">↻</i></span>
              </div>
              <div class="scenario-face scenario-back" aria-hidden="true">
                <span class="scenario-comedy-kicker">Meanwhile, in the real world…</span>
                <blockquote>${escapeHtml(funnyMessages[extension.id]?.[index] || 'The problem was repetitive. The solution declined to become a personality test.')}</blockquote>
                <p>${escapeHtml(item.title)}</p>
                <span class="scenario-flip-hint">Back to business <i aria-hidden="true">↻</i></span>
              </div>
            </div>
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

  function toggleScenario(card) {
    const flipped = card.classList.toggle('flipped');
    card.setAttribute('aria-pressed', String(flipped));
    const front = card.querySelector('.scenario-front');
    const back = card.querySelector('.scenario-back');
    if (front) front.setAttribute('aria-hidden', String(flipped));
    if (back) back.setAttribute('aria-hidden', String(!flipped));
  }

  function bindScenarioCards() {
    panel.addEventListener('click', (event) => {
      const card = event.target.closest('.usecase-scenario');
      if (card) toggleScenario(card);
    });
    panel.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const card = event.target.closest('.usecase-scenario');
      if (!card) return;
      event.preventDefault();
      toggleScenario(card);
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

  bindScenarioCards();
  document.addEventListener('DOMContentLoaded', load);
})();
