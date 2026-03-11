// ============================================================
// Academic Website — Dynamic Section Loader
// ============================================================
// How it works:
//   1. Fetches sections/config.json  → personal info + section list
//   2. Fetches each section JSON file listed in config.sections
//   3. Picks the right renderer based on the "type" field in each JSON
//   4. Injects rendered HTML into the DOM
//
// To add a new section:
//   - Create sections/mysection.json with a "type" field
//   - Add "mysection" to the "sections" array in config.json
//   - (Optional) Add a renderer below for custom layout
// ============================================================

// ── Icon SVGs (inline, no external dependency) ──────────────
const ICONS = {
  book: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  mic: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`,
  plane: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 2c-2-2-4-2-5.5-.5L10 5 1.8 6.2c-.5.1-.9.5-1 1-.1.7.2 1.3.7 1.7L6 12l-2 3.5c-.3.6-.2 1.3.3 1.7l1.5 1.5c.4.5 1.1.6 1.7.3L11 17z"/></svg>`,
  award: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>`,
  star: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  list: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
  github: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>`,
  orcid: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="9" y1="7" x2="9" y2="17"/><path d="M13 7h2a4 4 0 0 1 0 8h-2V7z"/></svg>`,
  universityPage: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="10" width="18" height="11"/><path d="M9 21V12h6v9"/><path d="M2 10l10-8 10 8"/></svg>`,
  scholar: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
  linkedin: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>`,
  twitter: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>`,
  cv: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  mail: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  graduationcap: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 22 8.5 12 15 2 8.5"/><path d="M6 11.5V17c0 0 2 2 6 2s6-2 6-2v-5.5"/><line x1="22" y1="8.5" x2="22" y2="14"/></svg>`,
  chevron: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
};

function icon(name) {
  return ICONS[name] || ICONS.list;
}

// ── Section colour palette ───────────────────────────────────
// Each entry is [foreground-accent, soft-background].
// The JS cycles through this list by section index, so it works
// for any number of sections — add or remove sections freely.
const PALETTE = [
  ['#2563eb', '#dbeafe'], // blue
  ['#7c3aed', '#ede9fe'], // purple
  ['#0d9488', '#ccfbf1'], // teal
  ['#d97706', '#fef3c7'], // amber
  ['#db2777', '#fce7f3'], // pink
  ['#16a34a', '#dcfce7'], // green
  ['#0369a1', '#e0f2fe'], // sky
  ['#9333ea', '#f3e8ff'], // violet
  ['#b45309', '#fef9c3'], // yellow
  ['#dc2626', '#fee2e2'], // rose
];

/** Returns inline CSS that overrides the two accent variables for one palette slot. */
function paletteVars(index) {
  const [fg, bg] = PALETTE[index % PALETTE.length];
  return `--color-accent:${fg};--color-accent-soft:${bg}`;
}

// ── Safe HTML escape ─────────────────────────────────────────
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Minimal Markdown: escapes HTML first, then applies **bold**, *italic*, and \n line breaks. */
function md(str) {
  if (!str) return '';
  return esc(str)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

function linkOrText(text, url) {
  if (url) return `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(text)}</a>`;
  return esc(text);
}

// ── Funding item helper ───────────────────────────────────────
// Renders one rich funding/project card (shared by both categories).
function renderFundingItem(item) {
  const STATUS = {
    funded:      { label: 'Funded',                   cls: 'funded'      },
    recommended: { label: 'Recommended · Not Funded', cls: 'recommended' },
    seal:        { label: 'Seal of Excellence',        cls: 'seal'        },
  };
  const st       = STATUS[item.status] || null;
  const budget   = item.budget || item.amount || '';
  const timeLine = item.period || item.duration || '';
  const partners = (item.partners || [])
    .map(p => `<span class="funding-partner-tag">${esc(p)}</span>`).join('');

  return `
    <li class="funding-item${item.status === 'funded' ? ' funding-item--funded' : ''}">
      <div class="funding-header">
        <div class="funding-titles">
          <div class="funding-title-row">
            <span class="funding-short-title">${esc(item.shortTitle || item.title || '')}</span>
            ${st ? `<span class="funding-status funding-status--${esc(st.cls)}">${esc(st.label)}</span>` : ''}
          </div>
          ${item.fullTitle ? `<div class="funding-full-title">${esc(item.fullTitle)}</div>` : ''}
        </div>
        ${budget ? `<div class="funding-amount">${esc(budget)}</div>` : ''}
      </div>
      <div class="funding-meta">
        ${item.agencyShort ? `<span class="funding-agency-badge">${esc(item.agencyShort)}</span>`
          : item.agency    ? `<span class="funding-agency-badge">${esc(item.agency)}</span>` : ''}
        ${timeLine ? `<span class="funding-period">&nbsp;·&nbsp; ${esc(timeLine)}</span>` : ''}
      </div>
      ${item.pi   ? `<div class="funding-pi"><strong>PI:</strong> ${esc(item.pi)}</div>` : ''}
      ${item.role ? `<div class="funding-pi"><strong>Role:</strong> ${esc(item.role)}</div>` : ''}
      ${partners  ? `<div class="funding-partners-list">${partners}</div>` : ''}
      ${item.description ? `<p class="funding-desc">${md(item.description)}</p>` : ''}
      ${item.url  ? `<a href="${esc(item.url)}" class="funding-ext-link" target="_blank" rel="noopener">Project website ↗</a>` : ''}
    </li>`;
}

// ── Teaching card helper ──────────────────────────────────────
function renderTeachingCard(item) {
  const BADGE = { seminar: 'Seminar', course: 'Course', invited: 'Invited Lecture' };
  const badgeLabel = BADGE[item.badge] || item.badge || '';
  const meta = [item.institution, item.year, item.audience].filter(Boolean).map(esc).join(' &nbsp;·&nbsp; ');
  return `
    <li class="teaching-item">
      <div class="teaching-header">
        <div class="teaching-title">${esc(item.title)}</div>
        ${badgeLabel ? `<span class="teach-badge teach-badge--${esc(item.badge)}">${esc(badgeLabel)}</span>` : ''}
      </div>
      ${meta    ? `<div class="teaching-meta">${meta}</div>` : ''}
      ${item.sessions     ? `<div class="teaching-sessions">${esc(item.sessions)}</div>` : ''}
      ${item.description  ? `<p class="teaching-desc">${md(item.description)}</p>` : ''}
    </li>`;
}

// ── Supervision card helper ───────────────────────────────────
function renderSupervisionCard(item) {
  const LEVEL  = { phd: 'PhD', msc: 'MSc' };
  const STATUS = { ongoing: 'Ongoing', completed: 'Completed' };
  const level  = item.level  || '';
  const status = item.status || '';
  return `
    <li class="supervision-item${status === 'ongoing' ? ' supervision-item--ongoing' : ''}">
      <div class="supervision-header">
        ${level  ? `<span class="supv-level supv-level--${esc(level)}">${esc(LEVEL[level]  || level)}</span>` : ''}
        <span class="supervision-name">${esc(item.name)}</span>
        ${status ? `<span class="supv-status supv-status--${esc(status)}">${esc(STATUS[status] || status)}</span>` : ''}
      </div>
      ${item.thesis      ? `<div class="supervision-thesis">${esc(item.thesis)}</div>` : ''}
      <div class="supervision-meta">
        ${item.programme   ? `<div class="supervision-programme">${esc(item.programme)}</div>` : ''}
        ${item.supervisors ? `<div class="supervision-supervisors"><strong>Official supervisors:</strong> ${esc(item.supervisors)}</div>` : ''}
      </div>
    </li>`;
}

// ── Section Renderers ────────────────────────────────────────
// Each renderer(items, sectionData) → HTML string

const renderers = {

  // ── publications ──────────────────────────────────────────
  publications(items) {
    if (!items.length) return '<p class="empty">No publications yet.</p>';

    // Group by year, descending
    const byYear = {};
    items.forEach(item => {
      const y = item.year || 'In Press';
      (byYear[y] = byYear[y] || []).push(item);
    });
    const years = Object.keys(byYear).sort((a, b) => b - a);

    return years.map(year => `
      <div class="pub-year-group">
        <span class="year-marker">${esc(String(year))}</span>
        <ol class="pub-list">
          ${byYear[year].map(pub => {
            const typeLabel = pub.type || 'paper';
            const links = [
              pub.url    && `<a href="${esc(pub.url)}"    class="pub-link" target="_blank" rel="noopener">Link</a>`,
              pub.pdf    && `<a href="${esc(pub.pdf)}"    class="pub-link" target="_blank" rel="noopener">PDF</a>`,
              pub.code   && `<a href="${esc(pub.code)}"   class="pub-link" target="_blank" rel="noopener">Code</a>`,
              pub.slides && `<a href="${esc(pub.slides)}" class="pub-link" target="_blank" rel="noopener">Slides</a>`,
            ].filter(Boolean).join('');
            return `
              <li class="pub-item">
                <span class="pub-type-badge pub-type-${esc(typeLabel)}">${esc(typeLabel)}</span>
                <div class="pub-body">
                  <div class="pub-title">${pub.url ? `<a href="${esc(pub.url)}" target="_blank" rel="noopener">${esc(pub.title)}</a>` : esc(pub.title)}</div>
                  <div class="pub-authors">${esc(pub.authors)}</div>
                  <div class="pub-venue">${esc(pub.venue)}${pub.year ? `, ${esc(String(pub.year))}` : ''}</div>
                  ${links ? `<div class="pub-links">${links}</div>` : ''}
                </div>
              </li>`;
          }).join('')}
        </ol>
      </div>`).join('');
  },

  // ── timeline (conferences, visiting) ─────────────────────
  timeline(items) {
    if (!items.length) return '<p class="empty">Nothing to show yet.</p>';
    return `
      <ul class="timeline">
        ${items.map(item => {
          // Support both conference-style and visiting-style items
          const heading = item.title || item.institution || '';
          const sub = item.event || (item.department ? `${esc(item.department)}, ${esc(item.institution || '')}` : '');
          const metaParts = [item.role, item.host && `Host: ${item.host}`, item.location, item.date || item.period]
            .filter(Boolean).map(esc).join(' &nbsp;·&nbsp; ');
          const desc = item.description || '';
          const url = item.url || '';
          const BADGE_LABELS = { organizer: 'Organizer', invited: 'Invited Speaker' };
          const badgeKey = item.badge && item.badge.toLowerCase();
          const badgeLabel = BADGE_LABELS[badgeKey] || (item.badge ? item.badge : null);
          return `
            <li class="timeline-item">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <div class="timeline-heading-row">
                  <span class="timeline-heading">${url ? `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(heading)}</a>` : esc(heading)}</span>
                  ${badgeLabel ? `<span class="timeline-badge timeline-badge--${esc(badgeKey)}">${esc(badgeLabel)}</span>` : ''}
                </div>
                ${sub ? `<div class="timeline-sub">${esc(sub)}</div>` : ''}
                ${metaParts ? `<div class="timeline-meta">${metaParts}</div>` : ''}
                ${desc ? `<p class="timeline-desc">${md(desc)}</p>` : ''}
              </div>
            </li>`;
        }).join('')}
      </ul>`;
  },

  // ── fundings ──────────────────────────────────────────────
  // Supports both flat items[] and categorized { categories: [{label, items}] }
  fundings(items, sectionData) {
    const cats = sectionData && sectionData.categories;
    if (cats && cats.length) {
      return cats.map(cat => `
        <div class="funding-category">
          <h3 class="funding-category-label">${esc(cat.label)}</h3>
          ${cat.description ? `<p class="funding-category-desc">${md(cat.description)}</p>` : ''}
          <ul class="fundings-list">${(cat.items || []).map(renderFundingItem).join('')}</ul>
        </div>`).join('');
    }
    if (!items.length) return '<p class="empty">No funding information yet.</p>';
    return `<ul class="fundings-list">${items.map(renderFundingItem).join('')}</ul>`;
  },

  // ── awards ────────────────────────────────────────────────
  awards(items) {
    if (!items.length) return '<p class="empty">No awards yet.</p>';
    return `
      <ul class="awards-list">
        ${items.map(item => `
          <li class="award-item">
            ${item.year ? `<span class="award-year">${esc(String(item.year))}</span>` : ''}
            <div class="award-body">
              <div class="award-title">${esc(item.title)}</div>
              ${item.organization ? `<div class="award-org">${esc(item.organization)}</div>` : ''}
              ${item.description  ? `<p class="award-desc">${md(item.description)}</p>` : ''}
            </div>
          </li>`).join('')}
      </ul>`;
  },

  // ── teaching & supervision ────────────────────────────────
  teaching(items, sectionData) {
    const cats = sectionData && sectionData.categories;
    if (!cats || !cats.length) return '<p class="empty">No teaching information yet.</p>';
    return cats.map(cat => `
      <div class="teaching-category">
        <h3 class="teaching-category-label">${esc(cat.label)}</h3>
        <ul class="teaching-list">
          ${(cat.items || []).map(item =>
            cat.kind === 'supervision' ? renderSupervisionCard(item) : renderTeachingCard(item)
          ).join('')}
        </ul>
      </div>`).join('');
  },

  // ── generic list (fallback) ────────────────────────────────
  list(items) {
    if (!items.length) return '<p class="empty">Nothing to show yet.</p>';
    return `
      <ul class="generic-list">
        ${items.map(item => `
          <li class="generic-item">
            <div class="generic-title">${linkOrText(item.title || item.name || '(untitled)', item.url)}</div>
            ${item.date || item.year ? `<span class="generic-date">${esc(item.date || String(item.year))}</span>` : ''}
            ${item.description ? `<p class="generic-desc">${md(item.description)}</p>` : ''}
          </li>`).join('')}
      </ul>`;
  },
};

// Fallback to "list" renderer if type is unknown
function getRenderer(type) {
  return renderers[type] || renderers.list;
}

// ── Header ───────────────────────────────────────────────────
function renderHeader(config) {
  const links = config.links || {};
  const email = config.email || links.email;
  const linkItems = [
    email               && `<a href="mailto:${esc(email)}" class="profile-link" aria-label="Email">${icon('mail')}<span>Email</span></a>`,
    links.googleScholar && `<a href="${esc(links.googleScholar)}" class="profile-link" target="_blank" rel="noopener" aria-label="Google Scholar">${icon('scholar')}<span>Scholar</span></a>`,
    links.orcid         && `<a href="${esc(links.orcid)}" class="profile-link" target="_blank" rel="noopener" aria-label="ORCID">${icon('orcid')}<span>ORCID</span></a>`,
    links.linkedin      && `<a href="${esc(links.linkedin)}" class="profile-link" target="_blank" rel="noopener" aria-label="LinkedIn">${icon('linkedin')}<span>LinkedIn</span></a>`,
    links.github        && `<a href="${esc(links.github)}" class="profile-link" target="_blank" rel="noopener" aria-label="GitHub">${icon('github')}<span>GitHub</span></a>`,
    links.twitter       && `<a href="${esc(links.twitter)}" class="profile-link" target="_blank" rel="noopener" aria-label="Twitter">${icon('twitter')}<span>Twitter</span></a>`,
    links.universityPage&& `<a href="${esc(links.universityPage)}" class="profile-link" target="_blank" rel="noopener" aria-label="University Profile">${icon('universityPage')}<span>Uni Profile</span></a>`,
    links.cv            && `<a href="${esc(links.cv)}" class="profile-link" target="_blank" rel="noopener" aria-label="CV">${icon('cv')}<span>CV</span></a>`,
  ].filter(Boolean).join('');

  const photoHtml = config.photo
    ? `<img src="${esc(config.photo)}" alt="${esc(config.name)}" class="profile-photo" />`
    : `<div class="profile-photo profile-photo--placeholder">${esc((config.name || 'A').charAt(0))}</div>`;

  document.getElementById('site-header').innerHTML = `
    <div class="header-inner">
      ${photoHtml}
      <div class="header-info">
        <h1 class="header-name">${esc(config.name || 'Your Name')}</h1>
        <p class="header-title">${esc(config.title || '')}</p>
        <p class="header-affiliation">${esc(config.department ? config.department + ', ' : '')}${esc(config.affiliation || '')}</p>
        ${config.bio ? `<p class="header-bio">${md(config.bio)}</p>` : ''}
        ${linkItems ? `<div class="header-links">${linkItems}</div>` : ''}
      </div>
    </div>`;

  // Update page title
  if (config.name) document.title = config.name;
}

// ── Navigation ───────────────────────────────────────────────
function renderNav(sections, sectionsData) {
  const nav = document.getElementById('site-nav');
  nav.innerHTML = `
    <div class="nav-inner">
      ${sectionsData.map(({ id, data }, i) => `
        <a class="nav-link" href="#section-${esc(id)}" style="${paletteVars(i)}">${icon(data.icon || 'list')} ${esc(data.title || id)}</a>
      `).join('')}
    </div>`;

  // Keep scroll-padding-top in sync with the actual (possibly wrapped) nav height
  const updateScrollPadding = () => {
    document.documentElement.style.scrollPaddingTop = (nav.offsetHeight + 16) + 'px';
  };
  requestAnimationFrame(updateScrollPadding);
  new ResizeObserver(updateScrollPadding).observe(nav);

  // Highlight active section on scroll
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const id = entry.target.id;
      const link = nav.querySelector(`a[href="#${id}"]`);
      if (link) link.classList.toggle('nav-link--active', entry.isIntersecting);
    });
  }, { rootMargin: '-30% 0px -60% 0px' });

  document.querySelectorAll('.site-section').forEach(el => observer.observe(el));
}

// ── Sections ─────────────────────────────────────────────────
function renderSections(sectionsData) {
  const main = document.getElementById('site-main');
  main.innerHTML = sectionsData.map(({ id, data }, i) => {
    const renderer = getRenderer(data.type);
    const bodyHtml = renderer(data.items || [], data);
    return `
      <section id="section-${esc(id)}" class="site-section site-section--collapsed section-type-${esc(data.type || 'list')}" style="${paletteVars(i)}" aria-labelledby="section-heading-${esc(id)}">
        <div class="section-inner">
          <h2 class="section-heading section-heading--toggle" id="section-heading-${esc(id)}" role="button" aria-expanded="false">
            <span class="section-icon">${icon(data.icon || 'list')}</span>
            ${esc(data.title || id)}
            <span class="section-chevron">${icon('chevron')}</span>
          </h2>
          <div class="section-body-wrapper">
            <div class="section-body">${bodyHtml}</div>
          </div>
        </div>
      </section>`;
  }).join('');
}

// ── Footer ───────────────────────────────────────────────────
function renderFooter(config) {
  const year = new Date().getFullYear();
  document.getElementById('site-footer').innerHTML = `
    <div class="footer-inner">
      <p>&copy; ${year} ${esc(config.name || '')}.</p>
    </div>`;
}

// ── Error display ─────────────────────────────────────────────
function renderError(message) {
  document.getElementById('site-main').innerHTML = `
    <div class="load-error">
      <strong>Could not load the website data.</strong>
      <p>${esc(message)}</p>
      <p>Make sure you are serving the files over HTTP (not opening index.html directly as a local file).<br>
         Run: <code>npx serve .</code> or <code>python3 -m http.server</code> in the project root.</p>
    </div>`;
}

// ── Stats strip ───────────────────────────────────────────────
function renderStats(sectionsData) {
  const byId = {};
  sectionsData.forEach(({ id, data }) => { byId[id] = data; });

  function lastGeo(loc) {
    if (!loc) return null;
    return loc.split(',').pop().trim() || null;
  }
  function parseBudget(str) {
    if (!str) return 0;
    const m = String(str).match(/([\d.]+)\s*([KMkm]?)/);
    if (!m) return 0;
    return parseFloat(m[1]) * ({ k: 1e3, K: 1e3, m: 1e6, M: 1e6 }[m[2]] || 1);
  }
  function fmtBudget(n) {
    if (n >= 1e6) return `~€${+(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `~€${Math.round(n / 1e3)}K`;
    return `€${n}`;
  }

  // Publications
  const pubCount = (byId.publications?.items || []).length;

  // Conferences + unique countries
  const confItems = byId.conferences?.items || [];
  const confCountries = new Set(confItems.map(i => lastGeo(i.location)).filter(Boolean));

  // Project participation
  const participationCount = (byId.participation?.items || []).length;

  // Funded projects + budget (since PhD, 2022)
  const fundingItems = byId.fundings?.items || [];
  const funded    = fundingItems.filter(i => i.status === 'funded');
  const nearFunded = fundingItems.filter(i => i.status === 'recommended' || i.status === 'seal');
  const fundedTotal = funded.reduce((s, i) => s + parseBudget(i.budget), 0);
  const nearTotal   = nearFunded.reduce((s, i) => s + parseBudget(i.budget), 0);

  // Visiting countries
  const visitingCountries = new Set(
    (byId.visiting?.items || []).map(i => lastGeo(i.location)).filter(Boolean)
  );

  // Supervised students & teaching activities
  const teachingCats = byId.teaching?.categories || [];
  const supervisionCount = teachingCats
    .filter(c => c.kind === 'supervision')
    .reduce((s, c) => s + (c.items || []).length, 0);
  const teachingCount = teachingCats
    .filter(c => c.kind === 'teaching')
    .reduce((s, c) => s + (c.items || []).length, 0);

  const phdYear = 2022;

  // Build the funded sub-label
  let fundedSub = `since ${phdYear}`;
  if (fundedTotal) fundedSub += ` · ${fmtBudget(fundedTotal)}`;
  if (nearFunded.length) {
    fundedSub += ` · +${nearFunded.length} recommended`;
    if (nearTotal) fundedSub += ` (${fmtBudget(nearTotal)})`;
  }

  const cards = [
    { value: pubCount,               label: 'Publications' },
    { value: confItems.length,       label: 'Conferences & Talks', sub: `${confCountries.size} countries` },
    { value: participationCount,     label: 'Projects as Participant' },
    { value: funded.length,          label: 'Funded Projects', sub: fundedSub },
    { value: visitingCountries.size, label: 'Countries as Visiting Researcher' },
    { value: supervisionCount,       label: 'Supervised Students' },
    { value: teachingCount,          label: 'Teaching Activities' },
  ];

  document.getElementById('site-stats').innerHTML = `
    <div style="text-align: center; color: var(--color-accent); padding: 0px 0px 20px;"><b>Some numbers:</b></div>
    <div class="stats-inner">
      ${cards.map(c => `
        <div class="stat-card">
          <span class="stat-value">${c.value}</span>
          <span class="stat-label">${esc(c.label)}</span>
          ${c.sub ? `<span class="stat-sub">${esc(c.sub)}</span>` : ''}
        </div>`).join('')}
    </div>`;
}

// ── Collapsible sections ──────────────────────────────────────
function initCollapsible() {
  document.querySelectorAll('.section-heading--toggle').forEach(heading => {
    heading.addEventListener('click', () => {
      const section = heading.closest('.site-section');
      const collapsed = section.classList.toggle('site-section--collapsed');
      heading.setAttribute('aria-expanded', String(!collapsed));
    });
  });

  // Clicking a nav link auto-expands the target section if collapsed
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target && target.classList.contains('site-section--collapsed')) {
        target.classList.remove('site-section--collapsed');
        target.querySelector('.section-heading--toggle')?.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

// ── Bootstrap ────────────────────────────────────────────────
async function init() {
  let config;
  try {
    const res = await fetch('sections/config.json');
    if (!res.ok) throw new Error(`HTTP ${res.status} for sections/config.json`);
    config = await res.json();
  } catch (err) {
    renderError(err.message);
    return;
  }

  renderHeader(config);

  // Load all section JSON files in parallel
  const sectionIds = config.sections || [];
  const results = await Promise.allSettled(
    sectionIds.map(id =>
      fetch(`sections/${id}.json`)
        .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
        .then(data => ({ id, data }))
    )
  );

  const sectionsData = results
    .map((result, i) => {
      if (result.status === 'fulfilled') return result.value;
      console.warn(`Failed to load section "${sectionIds[i]}":`, result.reason);
      return null;
    })
    .filter(Boolean);

  renderStats(sectionsData);
  renderSections(sectionsData);
  renderNav(sectionIds, sectionsData);
  renderFooter(config);
  initCollapsible();
}

document.addEventListener('DOMContentLoaded', init);
